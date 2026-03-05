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
  in: Op.in,
  notIn: Op.notIn,
  between: Op.between,
};

module.exports = (where) => {
  if (!where || typeof where !== "object") return where;
  return Object.fromEntries(
    Object.entries(where).map(([key, val]) => {
      if (val && typeof val === "object") {
        const translated = Object.fromEntries(
          Object.entries(val).map(([op, v]) => [OP_MAP[op] ?? op, v]),
        );
        return [key, translated];
      }
      return [key, val];
    }),
  );
};
