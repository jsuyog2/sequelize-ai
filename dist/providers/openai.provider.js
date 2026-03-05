const OpenAI = require("openai");

class OpenAIProvider {
  constructor(apiKey, model) {
    if (!apiKey) throw new Error("OpenAI apiKey is required");
    this.client = new OpenAI({ apiKey });
    this.model = model || "gpt-4o-mini"; // cheaper, faster, sufficient for code gen
  }

  /**
   * @param {string} systemPrompt - Instruction context (schema, rules)
   * @param {string} userMessage  - The natural language query
   */
  async generateCode(systemPrompt, userMessage) {
    const res = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      temperature: 0, // deterministic — never want creative variation in code gen
      max_tokens: 200, // output is always a single short expression
    });

    return res.choices[0].message.content.trim();
  }
}

module.exports = OpenAIProvider;
