module.exports = (code) => {
  const stripped = code
    .trim()
    .replace(/^```[\w]*\n?/, "")
    .replace(/```$/, "")
    .trim();

  // Normalize multi-query: LLM sometimes puts each expression on a new line
  const normalized = stripped
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .join(", ");

  if (!normalized.startsWith("await dbQuery.applySyncPromise(")) {
    throw new Error(`Unexpected generated code format: "${normalized}"`);
  }

  return normalized;
};
