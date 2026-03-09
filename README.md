<div align="center">
  <img src="./docs/favicon.svg" alt="Sequelize AI Logo" width="120" />
  <h1>Sequelize AI</h1>
  <p><strong>Query your database in plain English.</strong></p>
  
  <p>
    sequelize-ai translates natural language into secure Sequelize queries, executes them in an isolated V8 sandbox, and returns structured JSON — no SQL required.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/sequelize-ai"><img src="https://img.shields.io/npm/v/@jsuyog2/sequelize-ai.svg?style=flat-square&color=blue" alt="NPM Version" /></a>
    <a href="https://github.com/jsuyog2/sequelize-ai/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/jsuyog2/sequelize-ai/ci.yml?branch=main&style=flat-square" alt="Build Status" /></a>
    <a href="https://github.com/jsuyog2/sequelize-ai/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@jsuyog2/sequelize-ai.svg?style=flat-square&color=green" alt="License" /></a>
    <a href="https://jsuyog2.github.io/sequelize-ai/"><img src="https://img.shields.io/badge/docs-GitHub_Pages-blue.svg?style=flat-square" alt="Documentation" /></a>
  </p>
</div>

---

## Why This Project Matters

Bridging the gap between non-technical users and direct database querying is challenging. Traditional text-to-SQL solutions suffer from severe security risks (SQL injection) and often output raw queries that bypass application-level ORM logic.

`sequelize-ai` solves this by:

1. **Never granting raw SQL access**. Generated code must pass through your existing `Sequelize` models.
2. **Restricting execution safely**. All dynamically generated code runs in a sandboxed V8 isolate (`isolated-vm`), limited strictly to safe data-retrieval methods (e.g., `findAll`, `count`, `sum`).

It is perfect for building LLM-powered admin dashboards, conversational data analytics tools, and internal chat bots—without compromising database integrity.

---

## Features

- 🗣️ **Natural language queries** — ask complex questions in plain English.
- 🤖 **Multi-provider support** — OpenAI, Gemini, Claude, Groq, DeepSeek, and more.
- 🛡️ **Secure sandbox** — strictly read-only execution in an isolated V8 context.
- 💡 **AI column hints** — add annotations to your models to help the LLM understand your business logic.
- 📊 **Computed columns & Aggregation** — automatically derive values (e.g., `stock * price`).
- 🔄 **Multi-query handling** — handles compound questions seamlessly.
- 📦 **Structured JSON output** — predictable format for easy integration.

---

## Installation

```bash
npm install @jsuyog2/sequelize-ai
```

Install the required peer dependencies (and your specific database dialect driver, e.g. `pg`, `mysql2`, `sqlite3`):

```bash
npm install sequelize
```

Install the SDK for your preferred AI provider:

```bash
npm install openai                   # OpenAI / DeepSeek
npm install @google/generative-ai    # Gemini
npm install @anthropic-ai/sdk        # Claude
npm install groq-sdk                 # Groq
```

---

## Quick Start

```javascript
const { Sequelize } = require("sequelize");
const SequelizeAI = require("sequelize-ai");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});

const ai = new SequelizeAI(sequelize, {
  provider: "openai", // Available: openai | gemini | claude | groq | deepseek
  apiKey: process.env.OPENAI_API_KEY,
  // model: "gpt-4o-mini" // Optionally override default model
});

(async () => {
  const result = await ai.ask("get all products where stock is less than 5");
  console.log(result);
})();
```

---

## Development

Want to contribute to `sequelize-ai`?

```bash
# Clone the repository
git clone https://github.com/jsuyog2/sequelize-ai.git
cd sequelize-ai

# Install dependencies
npm install

# Run the test suite
npm run test

# Run code linters & formatters
npm run lint:fix

# Run the integration example setup
npm run example
```

_(Optionally add a `scripts: { "example": "node examples/run.js" }` to your `package.json` to make testing easy)._

---

## Documentation

Full documentation, API references, architecture details, and extensive examples can be found on our documentation site:

👉 **[View Full Documentation](https://jsuyog2.github.io/sequelize-ai/)**

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for detailed instructions on how to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
