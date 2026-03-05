function getSchemaContext(sequelize) {
  return Object.keys(sequelize.models)
    .map((name) => {
      const model = sequelize.models[name];
      const attrs = Object.entries(model.rawAttributes)
        .filter(([, attr]) => !attr.primaryKey) // skip PKs, use findByPk for those
        .map(([field, attr]) => {
          const type = attr.type?.key ?? "UNKNOWN";
          const nullable = attr.allowNull !== false ? "nullable" : "required";
          return `${field}:${type}(${nullable})`;
        });

      // Include associations
      const associations = Object.entries(model.associations ?? {}).map(
        ([alias, assoc]) =>
          `${assoc.associationType} ${assoc.target.name} as ${alias}`,
      );

      return [
        `Model: ${name}`,
        `  Fields: [${attrs.join(", ")}]`,
        associations.length
          ? `  Associations: [${associations.join(", ")}]`
          : null,
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

module.exports = getSchemaContext;
