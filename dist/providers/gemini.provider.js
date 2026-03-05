const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiProvider {
  constructor(apiKey, model) {
    if (!apiKey) throw new Error("Gemini apiKey is required");
    const genAI = new GoogleGenerativeAI(apiKey);
    this.client = genAI.getGenerativeModel({
      model: model || "gemini-2.0-flash",
    });
  }

  /**
   * @param {string} systemPrompt - Instruction context (schema, rules)
   * @param {string} userMessage  - The natural language query
   */
  async generateCode(systemPrompt, userMessage) {
    const result = await this.client.generateContent({
      systemInstruction: systemPrompt,
      contents: [{ role: "user", parts: [{ text: userMessage }] }],
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 200,
      },
    });

    const text = result.response.text();

    // Strip any flavour of markdown fence: ```javascript, ```js, ```  etc.
    return text
      .replace(/^```[^\n]*\n?/, "")
      .replace(/```$/, "")
      .trim();
  }
}

module.exports = GeminiProvider;
