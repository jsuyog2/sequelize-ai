const OpenAICompatibleProvider = require("./services/providers/openai-compatible.provider");
const getSchemaContext = require("./utils/getSchemaContext");
const getSystemPrompt = require("./utils/getSystemPrompt");
const secureExecute = require("./core/secureExecute");
const validateGeneratedCode = require("./core/validateGeneratedCode");

const PROVIDERS = {
  openai: require("./services/providers/openai.provider"),
  gemini: require("./services/providers/gemini.provider"),
  claude: require("./services/providers/claude.provider"),
  groq: require("./services/providers/groq.provider"),
  deepseek: (apiKey, model) =>
    new OpenAICompatibleProvider("deepseek", apiKey, model),
  together: (apiKey, model) =>
    new OpenAICompatibleProvider("together", apiKey, model),
  openrouter: (apiKey, model) =>
    new OpenAICompatibleProvider("openrouter", apiKey, model),
};

/**
 * SequelizeAI Configuration Options
 * @typedef {Object} SequelizeAIOptions
 * @property {"openai"|"gemini"|"claude"|"groq"|"deepseek"|"together"|"openrouter"} [provider="openai"] - The LLM provider to use
 * @property {string} apiKey - The API key for the selected provider
 * @property {string} [model] - Optional override for the provider's default model
 * @property {number} [timeout=2000] - Sandbox execution timeout in milliseconds
 * @property {number} [memoryLimit=128] - Sandbox memory limit in megabytes
 */

class SequelizeAI {
  /**
   * Initializes a new SequelizeAI instance.
   *
   * @param {import('sequelize').Sequelize} sequelize - Your existing Sequelize instance
   * @param {SequelizeAIOptions} options - Configuration options for the AI provider
   *
   * @example
   * const ai = new SequelizeAI(sequelize, {
   *   provider: "openai",
   *   apiKey: process.env.OPENAI_API_KEY,
   *   timeout: 5000,       // 5s sandbox timeout (default: 2000ms)
   *   memoryLimit: 256,    // 256MB sandbox memory (default: 128MB)
   * });
   */
  constructor(sequelize, options = {}) {
    if (!sequelize?.models) {
      throw new Error("A valid Sequelize instance is required");
    }

    const {
      provider = "openai",
      apiKey,
      model,
      timeout,
      memoryLimit,
    } = options;

    if (!apiKey) throw new Error("apiKey is required");
    if (!PROVIDERS[provider])
      throw new Error(`Provider "${provider}" is not supported`);

    this.sequelize = sequelize;
    this._timeout = timeout;
    this._memoryLimit = memoryLimit;
    this.engine =
      typeof PROVIDERS[provider] === "function" &&
      PROVIDERS[provider].prototype?.generateCode
        ? new PROVIDERS[provider](apiKey, model) // class
        : PROVIDERS[provider](apiKey, model); // factory
  }

  /**
   * Run a natural language query against your database.
   *
   * @param {string} userInput - The user's natural language question (e.g. "Find all pending orders")
   * @returns {Promise<any>} Structured JSON result of the generated query
   * @throws {Error} If userInput is empty, the LLM returns invalid code, or the sandbox execution fails
   *
   * @example
   * const result = await ai.ask("get all products where stock is less than 5");
   * // { model: "Product", method: "findAll", data: [...] }
   */
  async ask(userInput) {
    if (!userInput?.trim()) throw new Error("userInput cannot be empty");
    const schema = getSchemaContext(this.sequelize);
    const systemPrompt = getSystemPrompt(schema);
    // 1. Generate code — user input passed separately as the user message
    const raw = await this.engine.generateCode(systemPrompt, userInput);
    // 2. Validate before executing
    const generatedCode = validateGeneratedCode(raw);
    // 3. Execute in sandbox with configurable limits
    return await secureExecute(this.sequelize, generatedCode, {
      timeout: this._timeout,
      memoryLimit: this._memoryLimit,
    });
  }
}

module.exports = SequelizeAI;
