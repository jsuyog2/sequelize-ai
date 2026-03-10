<div align="center">
  <img src="./docs/favicon.svg" alt="Sequelize AI Logo" width="120" />
  <h1>Sequelize AI</h1>
  <p><strong>Query your database in plain English.</strong></p>
  
  <p>
    sequelize-ai translates natural language into secure Sequelize queries, executes them in an isolated V8 sandbox, and returns structured JSON — no SQL required.
  </p>

  <p>
    <a href="https://www.npmjs.com/package/@jsuyog2/sequelize-ai"><img src="https://img.shields.io/npm/v/@jsuyog2/sequelize-ai.svg?style=flat-square&color=blue" alt="NPM Version" /></a>
    <a href="https://www.npmjs.com/package/@jsuyog2/sequelize-ai"><img src="https://img.shields.io/npm/dt/@jsuyog2/sequelize-ai.svg?style=flat-square&color=purple" alt="NPM Downloads" /></a>
    <a href="https://github.com/jsuyog2/sequelize-ai/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/jsuyog2/sequelize-ai/ci.yml?branch=main&style=flat-square" alt="Build Status" /></a>
    <a href="https://codecov.io/gh/jsuyog2/sequelize-ai"><img src="https://img.shields.io/codecov/c/github/jsuyog2/sequelize-ai?style=flat-square" alt="Coverage" /></a>
    <a href="https://github.com/jsuyog2/sequelize-ai/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/@jsuyog2/sequelize-ai.svg?style=flat-square&color=green" alt="License" /></a>
    <a href="https://jsuyog2.github.io/sequelize-ai/"><img src="https://img.shields.io/badge/docs-GitHub_Pages-blue.svg?style=flat-square" alt="Documentation" /></a>
  </p>
</div>

---

## Why This Project Matters

Bridging the gap between non-technical users and direct database querying is challenging. Traditional text-to-SQL solutions suffer from severe security risks (SQL injection) and often output raw queries that bypass application-level ORM logic.

`sequelize-ai` solves this by:

1. **Never granting raw SQL access**. Generated code must pass through your existing `Sequelize` models.
2. **Restricting execution safely**. All dynamically generated code runs in a sandboxed V8 isolate (`isolated-vm`), limited strictly to safe data-retrieval methods, with configurable CPU and memory limits.

It is perfect for building LLM-powered admin dashboards, conversational data analytics tools, and internal chat bots—without compromising database integrity.

---

## Features

- 🗣️ **Natural Language Queries** — ask complex questions in plain English.
- 🛡️ **Secure Sandbox** — strictly read-only execution in an isolated V8 context.
- ⚡ **Tree-Shakeable & Dual Build** — CJS and ESM support, minimal footprint.
- 🤖 **Multi-Provider Support** — OpenAI, Gemini, Claude, Groq, DeepSeek, Together, OpenRouter.
- 💡 **AI Column Hints** — add annotations to your models to aid the LLM context.
- 📊 **Computed Columns** — automatically derive values without raw SQL.
- 🔄 **Multi-Query Handling** — seamlessly handles compound questions.
- 📦 **Structured JSON Output** — predictable response formatting.

---

## Installation

```bash
npm install @jsuyog2/sequelize-ai sequelize
```

Install the required driver for your specific database dialect:

```bash
npm install pg pg-hstore   # PostgreSQL
npm install mysql2         # MySQL
npm install sqlite3        # SQLite
```

Install the SDK for your preferred AI provider:

```bash
npm install openai                   # OpenAI / DeepSeek
npm install @google/generative-ai    # Gemini
npm install @anthropic-ai/sdk        # Claude
npm install groq-sdk                 # Groq
```

---

## Quick Start Example

```javascript
import { Sequelize } from "sequelize";
import SequelizeAI from "@jsuyog2/sequelize-ai";

// 1. Initialize your Sequelize instance
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});

// 2. Initialize the AI generator
const ai = new SequelizeAI(sequelize, {
  provider: "openai",
  apiKey: process.env.OPENAI_API_KEY,
});

// 3. Ask a question
(async () => {
  const result = await ai.ask("get all products where stock is less than 5");

  console.log(result);
  /* Output:
   {
     model: "Product",
     method: "findAll",
     data: [ ...rows ]
   }
  */
})();
```

---

## API Documentation

### `new SequelizeAI(sequelize, options)`

| Option        | Type     | Required | Default             | Description                                                                                              |
| ------------- | -------- | -------- | ------------------- | -------------------------------------------------------------------------------------------------------- |
| `provider`    | `string` | No       | `"openai"`          | The LLM provider. Available: `openai`, `gemini`, `claude`, `groq`, `deepseek`, `together`, `openrouter`. |
| `apiKey`      | `string` | Yes      | -                   | API key for the selected provider.                                                                       |
| `model`       | `string` | No       | _Provider Specific_ | Overrides the default model (e.g., `"gpt-4o"`).                                                          |
| `timeout`     | `number` | No       | `2000`              | Sandbox V8 CPU timeout limit in milliseconds.                                                            |
| `memoryLimit` | `number` | No       | `128`               | Sandbox V8 memory limit in megabytes.                                                                    |

### `ai.ask(userInput)`

Returns a `Promise` that resolves to the result of the database query. Format depends on the query type (e.g. `findAll` returns an array, `count` returns a number), but always includes the metadata mapping.

```javascript
const { model, method, data } = await ai.ask("Count all standard users");
// model: "User"
// method: "count"
// data: 154
```

---

## Advanced Usage

### AI Column Hints

You can add `aiDescription` directly into your Sequelize column definitions. This significantly improves the accuracy of the generated queries by giving business logic context to the LLM.

```javascript
const Product = sequelize.define("Product", {
  status: {
    type: DataTypes.INTEGER,
    // Provide hints to the LLM!
    aiDescription: "0=Draft, 1=Published, 2=Archived",
  },
});
```

### Multi-Query Resolving

You can ask compound questions and the system will execute them in parallel and return the combined results in an array.

```javascript
const stats = await ai.ask(
  "how many users are there, and what is the maximum order amount?",
);
console.log(stats[0].data); // Total users count
console.log(stats[1].data); // Max order amount
```

---

## Provider Reference & Performance Notes

| Provider     | Engine Identifier | Default Model          | Speed/Latency       | Cost Efficiency        |
| ------------ | ----------------- | ---------------------- | ------------------- | ---------------------- |
| **Groq**     | `groq`            | `llama-3.1-8b-instant` | ⚡⚡⚡ Blazing Fast | 💰 Free tier available |
| **Claude**   | `claude`          | `claude-haiku-4-5...`  | ⚡⚡ Very Fast      | 💵 Very Low            |
| **Gemini**   | `gemini`          | `gemini-2.0-flash`     | ⚡⚡ Fast           | 💰 Generous free tier  |
| **OpenAI**   | `openai`          | `gpt-4o-mini`          | ⚡ Fast             | 💵 Low                 |
| **DeepSeek** | `deepseek`        | `deepseek-chat`        | ⚡ Fast             | 💵 Lowest              |

_Tip for Production:_ For interactive dashboards where loading state matters, `groq` using the `llama-3` hardware accelerator usually gives sub-`500ms` total response times for code generation.

---

## Examples

We provide extensive examples in the [`/examples`](./examples) directory.
Run the local playground:

```bash
npm run example
```

---

## FAQ

**Q: Can this accidentally `DROP TABLE` or `DELETE` rows?**  
A: No. The AI generated code is validated against a strict read-only method whitelist (`findAll`, `count`, `sum`, etc.). Sandbox policies prevent any destructive commands.

**Q: Does my database schema get sent to the AI?**  
A: Yes. The textual representation of your models, columns, types, and associations is securely bundled into the system prompt to provide context. No actual database _rows_ or _data_ are sent to the AI.

**Q: Is the generated code injected directly into Node context?**  
A: No. We use the robust `isolated-vm` package to spawn a separate V8 engine instance. The sandboxed code receives only isolated references.

**Q: Can I use local models via Ollama?**  
A: Yes! You can use the `openai-compatible` provider (e.g. `deepseek` or `together`) but override the `baseURL` inside your local fork's provider mapping. Full custom baseURL injection support is coming in a future version.

## Troubleshooting

- `Error: Method not allowed: destroy` — The LLM tried to write data. Reword your prompt to request data retrieval.
- `Error: Unknown model: Foo` — The LLM hallucinated a table name. Make sure you use `aiDescription` hints on complex relationships.
- `Error: Script execution timed out.` — The dynamically generated query caused a CPU hang. This is the sandbox protecting your thread! Increase `timeout` in the constructor if you have heavy associations.

---

## GitHub Publishing Guide

Want to release your own version or fork?

1. Edit `package.json` version.
2. Push to branch `main`.
3. Create a GitHub Release in the UI.
4. Our `.github/workflows/npm-publish.yml` will automatically build the `CJS` and `ESM` bundles, run all Vitest mocks, and publish to both `npm` and `GitHub Packages`.

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) and [Code of Conduct](CODE_OF_CONDUCT.md) for detailed instructions on how to submit a Pull Request.

## License

This project is licensed under the [MIT License](LICENSE).
