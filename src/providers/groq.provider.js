// providers/groq.provider.js
const Groq = require("groq-sdk");

class GroqProvider {
  constructor(apiKey, model) {
    if (!apiKey) throw new Error("Groq apiKey is required");
    this.client = new Groq({ apiKey });
    this.model = model || "llama-3.1-8b-instant"; // fastest, free tier, sufficient for code gen
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
      temperature: 0,
      max_tokens: 200,
    });

    return res.choices[0].message.content.trim();
  }
}

module.exports = GroqProvider;
