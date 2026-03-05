const ivm = require("isolated-vm");
const translateOps = require("./translateOps");

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

async function secureExecute(sequelize, code) {
  const isolate = new ivm.Isolate({ memoryLimit: 128 });

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
        data = await sequelize.models[model][method]({ ...args, raw: true });
      }

      return JSON.stringify({ model, method, data });
    });

    await jail.set("dbQuery", dbQueryRef);

    const script = await isolate.compileScript(`
      (async () => {
        const results = await Promise.all([${code}]);
        return JSON.stringify(results.map(r => typeof r === "string" ? JSON.parse(r) : r));
      })()
    `);

    const raw = await script.run(context, {
      timeout: 2000,
      promise: true,
      copy: true,
    });

    const parsed = JSON.parse(raw);
    return parsed.length === 1 ? parsed[0] : parsed;
  } catch (e) {
    throw new Error(e);
  } finally {
    isolate.dispose();
  }
}

module.exports = secureExecute;
