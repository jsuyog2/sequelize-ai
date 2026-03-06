function getSchemaContext(sequelize) {
  const lines = [];

  for (const [modelName, model] of Object.entries(sequelize.models)) {
    const fields = [];

    for (const [colName, attr] of Object.entries(model.rawAttributes)) {
      // Skip primary keys
      if (attr.primaryKey) continue;

      const type = attr.type?.key || "UNKNOWN";
      const comment =
        attr.aiDescription || attr.comment
          ? ` — ${attr.aiDescription || attr.comment}`
          : "";
      const nullable = attr.allowNull === false ? " (required)" : "";

      fields.push(`  ${colName}:${type}${nullable}${comment}`);
    }

    // Associations
    const assocs = Object.entries(model.associations || {}).map(
      ([, assoc]) => `  ${assoc.associationType} → ${assoc.target.name}`,
    );

    lines.push(`Model: ${modelName}`);
    lines.push("Fields:");
    lines.push(...fields);
    if (assocs.length) {
      lines.push("Associations:");
      lines.push(...assocs);
    }
    lines.push("");
  }

  return lines.join("\n");
}

module.exports = getSchemaContext;
