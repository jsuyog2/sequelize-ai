const { Sequelize, Op } = require("sequelize");

const OP_MAP = {
  gt: Op.gt,
  gte: Op.gte,
  lt: Op.lt,
  lte: Op.lte,
  ne: Op.ne,
  eq: Op.eq,
  like: Op.like,
  iLike: Op.iLike,
  notLike: Op.notLike,
  notILike: Op.notILike,
  in: Op.in,
  notIn: Op.notIn,
  between: Op.between,
  not: Op.not,
  or: Op.or,
  and: Op.and,
};

/**
 * Recursively translates plain string operator keys (e.g., 'gt', 'like')
 * into Sequelize Op symbols for secure evaluations.
 *
 * @param {Object|Array|null|undefined} where - The where clause object or array
 * @returns {Object|Array|null|undefined} The translated where clause containing Sequelize Op symbols
 */
/**
 * Recursively translates plain string operator keys (e.g., 'gt', 'like', 'or')
 * into Sequelize Op symbols for safe sandbox evaluations.
 *
 * Supported operators: gt, gte, lt, lte, ne, eq, like, iLike, notLike,
 * notILike, in, notIn, between, not, or, and
 *
 * @param {Object|Array|null|undefined} where - The where clause object or array
 * @returns {Object|Array|null|undefined} The translated where clause with Sequelize Op symbols
 */
function translateOps(where) {
  if (!where || typeof where !== "object") return where;

  // Handle arrays (e.g., inside 'in' or 'notIn' operators)
  if (Array.isArray(where)) {
    return where.map((item) => translateOps(item));
  }

  // Handle literal object specifically
  if (where.literal && typeof where.literal === "string") {
    return Sequelize.literal(where.literal);
  }

  return Object.fromEntries(
    Object.entries(where).map(([key, val]) => {
      // If the value is an object, process it recursively
      if (val && typeof val === "object" && !Array.isArray(val)) {
        // Special case: if the value is exactly { literal: '...' }, convert immediately
        if (val.literal && typeof val.literal === "string") {
          return [key, Sequelize.literal(val.literal)];
        }

        const translated = Object.fromEntries(
          Object.entries(val).map(([op, v]) => {
            const mappedOp = OP_MAP[op] ?? op;
            // Recursively process the nested value (to handle arrays or further nested objects)
            return [mappedOp, translateOps(v)];
          }),
        );
        return [key, translated];
      } else if (Array.isArray(val)) {
        return [key, translateOps(val)];
      }
      return [key, val];
    }),
  );
}

module.exports = translateOps;
