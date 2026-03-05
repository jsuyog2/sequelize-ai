const OpenAICompatibleProvider = require("./providers/openai-compatible.provider");
const getSchemaContext = require("./getSchemaContext");
const getSystemPrompt = require("./getSystemPrompt");
const secureExecute = require("./secureExecute");
const validateGeneratedCode = require("./validateGeneratedCode");

const PROVIDERS = {
  openai: require("./providers/openai.provider"),
  gemini: require("./providers/gemini.provider"),
  claude: require("./providers/claude.provider"),
  groq: require("./providers/groq.provider"),
  deepseek: (apiKey, model) =>
    new OpenAICompatibleProvider("deepseek", apiKey, model),
  together: (apiKey, model) =>
    new OpenAICompatibleProvider("together", apiKey, model),
  openrouter: (apiKey, model) =>
    new OpenAICompatibleProvider("openrouter", apiKey, model),
};

class SequelizeAI {
  /**
   * @param {Object} sequelize - Your existing Sequelize instance
   * @param {Object} options - { provider, apiKey, model }
   */
  constructor(sequelize, options = {}) {
    if (!sequelize?.models) {
      throw new Error("A valid Sequelize instance is required");
    }

    const { provider = "openai", apiKey, model } = options;

    if (!apiKey) throw new Error("apiKey is required");
    if (!PROVIDERS[provider])
      throw new Error(`Provider "${provider}" is not supported`);

    this.sequelize = sequelize;
    this.engine =
      typeof PROVIDERS[provider] === "function" &&
      PROVIDERS[provider].prototype?.generateCode
        ? new PROVIDERS[provider](apiKey, model) // class
        : PROVIDERS[provider](apiKey, model); // factory
  }

  /**
   * Run a natural language query against your database
   * @param {string} userInput - e.g. "Find all pending orders"
   * @returns {Promise<any>} - Query result
   */
  async ask(userInput) {
    if (!userInput?.trim()) throw new Error("userInput cannot be empty");
    const schema = getSchemaContext(this.sequelize);
    const systemPrompt = getSystemPrompt(schema);
    // 1. Generate code — user input passed separately as the user message
    const raw = await this.engine.generateCode(systemPrompt, userInput);
    console.log(raw);

    // 2. Validate before executing
    const generatedCode = validateGeneratedCode(raw);
    // 3. Execute in sandbox
    return await secureExecute(this.sequelize, generatedCode);
  }
}

module.exports = SequelizeAI;
