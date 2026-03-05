// providers/claude.provider.js
const Anthropic = require("@anthropic-ai/sdk");

class ClaudeProvider {
  constructor(apiKey, model) {
    if (!apiKey) throw new Error("Anthropic apiKey is required");
    this.client = new Anthropic({ apiKey });
    this.model = model || "claude-haiku-4-5-20251001"; // fastest + cheapest for code gen
  }

  /**
   * @param {string} systemPrompt - Instruction context (schema, rules)
   * @param {string} userMessage  - The natural language query
   */
  async generateCode(systemPrompt, userMessage) {
    const res = await this.client.messages.create({
      model: this.model,
      max_tokens: 200,
      system: systemPrompt, // Claude has a dedicated top-level `system` field
      messages: [{ role: "user", content: userMessage }],
    });

    return res.content[0].text.trim();
  }
}

module.exports = ClaudeProvider;
