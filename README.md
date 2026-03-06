# sequelize-ai

Query your database in plain English. sequelize-ai translates natural language into Sequelize queries, executes them in a secure sandbox, and returns structured JSON — no SQL required.

```js
const ai = new SequelizeAI(sequelize, { provider: "openai", apiKey: "..." });

await ai.ask("show me the top 5 most expensive products");
await ai.ask(
  "total stock left and earnings if all products sold at current price",
);
await ai.ask("how many orders have status pending");
```

[![npm version](https://img.shields.io/npm/v/@jsuyog2/sequelize-ai.svg)](https://www.npmjs.com/package/sequelize-ai)
[![license](https://img.shields.io/npm/l/@jsuyog2/sequelize-ai.svg)](LICENSE)
[![issues](https://img.shields.io/github/issues/jsuyog2/sequelize-ai)](https://github.com/jsuyog2/sequelize-ai/issues)

---

## Features

- **Natural language queries** — ask questions in plain English
- **Multi-provider** — OpenAI, Gemini, Claude, Groq, DeepSeek, and more
- **Secure sandbox** — queries run inside an isolated V8 context via `isolated-vm`
- **Read-only by design** — only `SELECT`-equivalent Sequelize methods are allowed
- **AI column hints** — add `aiDescription` to your model columns for better query understanding
- **Computed columns** — derive values like `stock * price` without writing SQL
- **Multi-query** — ask compound questions that require more than one query
- **Structured JSON output** — consistent `{ model, method, data }` envelope

---

## Installation

```bash
npm install @jsuyog2/sequelize-ai
```

Install peer dependencies:

```bash
npm install sequelize pg pg-hstore
```

Install the SDK for your chosen provider:

```bash
npm install openai                   # OpenAI
npm install @google/generative-ai    # Gemini
npm install @anthropic-ai/sdk        # Claude
npm install groq-sdk                 # Groq
```

---

## Quick Start

```js
const { Sequelize } = require("sequelize");
const SequelizeAI = require("sequelize-ai");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
});

const ai = new SequelizeAI(sequelize, {
  provider: "openai", // openai | gemini | claude | groq | deepseek
  apiKey: process.env.OPENAI_API_KEY,
  // model: "gpt-4o-mini"               // optional — defaults to best model per provider
});

const result = await ai.ask("get all products where stock is greater than 10");
console.log(result);
```

---

## Providers

| Provider         | Argument     | Default Model               | Install                             |
| ---------------- | ------------ | --------------------------- | ----------------------------------- |
| OpenAI           | `"openai"`   | `gpt-4o-mini`               | `npm install openai`                |
| Google Gemini    | `"gemini"`   | `gemini-2.0-flash`          | `npm install @google/generative-ai` |
| Anthropic Claude | `"claude"`   | `claude-haiku-4-5-20251001` | `npm install @anthropic-ai/sdk`     |
| Groq             | `"groq"`     | `llama-3.1-8b-instant`      | `npm install groq-sdk`              |
| DeepSeek         | `"deepseek"` | `deepseek-chat`             | `npm install openai`                |

```js
// Groq — fast, generous free tier
const ai = new SequelizeAI(sequelize, {
  provider: "groq",
  apiKey: process.env.GROQ_API_KEY,
});

// Claude — override default model
const ai = new SequelizeAI(sequelize, {
  provider: "claude",
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: "claude-sonnet-4-6",
});
```

---

## AI Column Hints

Add `aiDescription` to your Sequelize model columns to give the AI better context about what each field means. This leads to more accurate query generation, especially for computed columns and ambiguous field names.

```js
const Product = sequelize.define("Product", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: "Product display name",
    aiDescription: "The name of the product shown to customers",
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    comment: "Price in USD",
    aiDescription:
      "Selling price in USD, use for price-related queries and earnings calculations",
  },
  category: {
    type: DataTypes.STRING,
    comment: "Product category",
    aiDescription:
      "Product category e.g. Electronics, Kitchen, Furniture — use for filtering by category",
  },
  stock: {
    type: DataTypes.INTEGER,
    comment: "Inventory count",
    aiDescription:
      "Number of units available in inventory, use for stock checks and availability queries",
  },
});
```

> `aiDescription` is only used by sequelize-ai as context for the LLM — it is never written to the database. Use `comment` for standard database-level documentation.

---

## Supported Query Types

### Basic Queries

```
get all products
find product with id 5
get only name and price of all products
get top 10 most expensive products
get products page 2 with 5 per page
```

### Filtering

```
get products where stock is greater than 10
get products where price is less than 50
get products where category is Electronics
get products where stock is between 5 and 20
```

### Sorting

```
get all products ordered by price ascending
get all products ordered by stock descending
```

### Aggregates

```
how many products are there
count distinct categories in products
total stock of all products
cheapest product price
most expensive product price
average price of all products
```

### Computed Columns

```
show product name, price, stock and potential earnings
show products with 10 percent discounted price
show products with tax included where tax is 18 percent
```

### Multi-Query

```
what is the cheapest and most expensive product price
how many products are there and what is the total stock
total stock left and total earnings if all products sold at current price
```

---

## Output Format

Every response returns a consistent JSON envelope:

```json
{
  "model": "Product",
  "method": "findAll",
  "data": [{ "id": 1, "name": "Keyboard", "price": "150.00", "stock": 10 }]
}
```

Multi-query returns an array:

```json
[
  { "model": "Product", "method": "min", "data": 8 },
  { "model": "Product", "method": "max", "data": 150 }
]
```

---

## Security

sequelize-ai is built with security as a core constraint:

- **Isolated sandbox** — all LLM-generated code runs inside `isolated-vm`, a separate V8 context with no access to your Node.js environment
- **Method whitelist** — only read-only Sequelize methods are permitted: `findAll`, `findOne`, `findByPk`, `findAndCountAll`, `count`, `sum`, `min`, `max`, `average`
- **Execution timeout** — queries are killed after 2 seconds
- **Memory limit** — the isolate is capped at 128MB
- **No raw SQL** — queries go through Sequelize's model layer, never raw database access

Any attempt to call `destroy`, `update`, `create`, `drop`, or other write methods will throw `Method not allowed`.

---

## Allowed Methods

| Method            | Description                                             |
| ----------------- | ------------------------------------------------------- |
| `findAll`         | Fetch multiple rows with filtering, sorting, pagination |
| `findOne`         | Fetch the first matching row                            |
| `findByPk`        | Fetch a row by primary key                              |
| `findAndCountAll` | Fetch rows and total count                              |
| `count`           | Count rows, supports `distinct`                         |
| `sum`             | Sum a numeric column                                    |
| `min`             | Minimum value of a column                               |
| `max`             | Maximum value of a column                               |
| `average`         | Average value of a column                               |

---

## Where Operators

Use plain string operators in natural language queries — sequelize-ai maps them to Sequelize `Op` symbols automatically:

| Operator    | Meaning               |
| ----------- | --------------------- |
| `"gt"`      | greater than          |
| `"gte"`     | greater than or equal |
| `"lt"`      | less than             |
| `"lte"`     | less than or equal    |
| `"ne"`      | not equal             |
| `"eq"`      | equal                 |
| `"like"`    | SQL LIKE              |
| `"in"`      | in list               |
| `"between"` | between two values    |

---

## Testing

```bash
npm test              # run unit test suite
npm run test:watch    # watch mode
npm run test:coverage # with coverage report
node run.js           # integration test against real database
```

---

## Requirements

- Node.js `>= 22.0.0`
- Sequelize `^6.37.7`
- PostgreSQL (`pg ^8.20.0`, `pg-hstore ^2.3.4`)
- API key for at least one supported LLM provider

---

## Author

**Suyog Jadhav** — [github.com/jsuyog2](https://github.com/jsuyog2)

---

## Links

- [npm](https://www.npmjs.com/package/sequelize-ai)
- [GitHub](https://github.com/jsuyog2/sequelize-ai)
- [Issues](https://github.com/jsuyog2/sequelize-ai/issues)

---

## License

[MIT](LICENSE)
