// providers/openai-compatible.provider.js
const OpenAI = require("openai");

const PRESETS = {
  deepseek: { baseURL: "https://api.deepseek.com", model: "deepseek-chat" },
  together: {
    baseURL: "https://api.together.xyz/v1",
    model: "meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo",
  },
  openrouter: {
    baseURL: "https://openrouter.ai/api/v1",
    model: "mistralai/mistral-7b-instruct",
  },
};

class OpenAICompatibleProvider {
  constructor(provider, apiKey, model) {
    const preset = PRESETS[provider];
    if (!preset) throw new Error(`Unknown provider: ${provider}`);
    if (!apiKey) throw new Error(`apiKey is required for ${provider}`);

    this.client = new OpenAI({ apiKey, baseURL: preset.baseURL });
    this.model = model || preset.model;
  }

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

module.exports = OpenAICompatibleProvider;
