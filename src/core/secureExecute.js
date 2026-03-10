const ivm = require("isolated-vm");
const translateOps = require("../utils/translateOps");

const ALLOWED_METHODS = [
  "findAll",
  "findOne",
  "findByPk",
  "findAndCountAll",
  "count",
  "sum",
  "min",
  "max",
  "average",
];

/**
 * Safely executes a generated Sequelize query expression inside an isolated V8 sandbox.
 * Enforces strict method whitelisting and timeout limits to prevent malicious code.
 *
 * @param {import('sequelize').Sequelize} sequelize - The mapped Sequelize instance
 * @param {string} code - The generated codebase snippet to execute
 * @param {Object} [options] - Sandbox limit options
 * @param {number} [options.timeout=2000] - Sandbox execution timeout in ms
 * @param {number} [options.memoryLimit=128] - Sandbox memory limit in MB
 * @returns {Promise<any>} The result of the database query operation
 * @throws {Error} If the query fails, times out, or attempts unauthorized modifications
 */
async function secureExecute(sequelize, code, options = {}) {
  const { timeout = 2000, memoryLimit = 128 } = options;
  const isolate = new ivm.Isolate({ memoryLimit });

  try {
    const context = await isolate.createContext();
    const jail = context.global;
    await jail.set("global", jail.derefInto());

    const dbQueryRef = new ivm.Reference(async (model, method, argsJson) => {
      if (!sequelize.models[model]) throw new Error(`Unknown model: ${model}`);
      if (!ALLOWED_METHODS.includes(method))
        throw new Error(`Method not allowed: ${method}`);

      const args = JSON.parse(argsJson ?? "{}");

      // Translate Op string keys to Sequelize symbols
      if (args.where) args.where = translateOps(args.where);

      // Handle include for associations (recursive parsing)
      if (args.include) {
        const parseInclude = (parentModelName, includes) => {
          if (!Array.isArray(includes)) return [];
          return includes.map((inc) => {
            const parsed =
              typeof inc === "string" ? { model: inc } : { ...inc };
            let targetModelName = parsed.model;
            if (typeof parsed.model === "string") {
              if (!sequelize.models[parsed.model]) {
                throw new Error(`Unknown model in include: ${parsed.model}`);
              }
              parsed.model = sequelize.models[parsed.model];
            } else if (parsed.model && parsed.model.name) {
              targetModelName = parsed.model.name;
            }

            // Auto-inject the alias if missing
            if (!parsed.as && parentModelName) {
              const parentModel = sequelize.models[parentModelName];
              if (parentModel && parentModel.associations) {
                for (const [alias, assoc] of Object.entries(
                  parentModel.associations,
                )) {
                  if (assoc.target.name === targetModelName) {
                    parsed.as = alias;
                    break; // use first matching alias
                  }
                }
              }
            }

            if (parsed.where) parsed.where = translateOps(parsed.where);
            if (parsed.include)
              parsed.include = parseInclude(targetModelName, parsed.include);
            return parsed;
          });
        };
        args.include = parseInclude(model, args.include);
      }

      // Handle computed columns
      if (args.compute) {
        const computed = args.compute.map(({ alias, expression }) => [
          sequelize.literal(expression),
          alias,
        ]);
        args.attributes = [
          ...(args.attributes ??
            Object.keys(sequelize.models[model].rawAttributes)),
          ...computed,
        ];
        delete args.compute;
      }

      let data;

      if (["sum", "min", "max"].includes(method)) {
        if (!args.field) throw new Error(`"field" is required for ${method}`);
        data = await sequelize.models[model][method](args.field, {
          where: args.where ?? {},
        });
      } else if (method === "average") {
        if (!args.field) throw new Error(`"field" is required for average`);
        const result = await sequelize.models[model].findOne({
          attributes: [
            [sequelize.fn("AVG", sequelize.col(args.field)), "average"],
          ],
          where: args.where ?? {},
          raw: true,
        });
        data = result?.average ? parseFloat(result.average) : null;
      } else {
        data = await sequelize.models[model][method]({ ...args });
      }

      return JSON.stringify({ model, method, data, arg: argsJson });
    });

    await jail.set("dbQuery", dbQueryRef);

    const script = await isolate.compileScript(`
      (async () => {
        const results = await Promise.all([${code}]);
        return JSON.stringify(results.map(r => typeof r === "string" ? JSON.parse(r) : r));
      })()
    `);

    const raw = await script.run(context, {
      timeout,
      promise: true,
      copy: true,
    });

    const parsed = JSON.parse(raw);
    return parsed.length === 1 ? parsed[0] : parsed;
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorContext = new Error(
      `Query Execution Error: ${errorMessage}\nTriggered by code: ${code}`,
    );
    errorContext.originalError = e;
    throw errorContext;
  } finally {
    isolate.dispose();
  }
}

module.exports = secureExecute;
