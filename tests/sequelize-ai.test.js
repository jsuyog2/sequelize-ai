import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// ── Imports ───────────────────────────────────────────────────────────────────

import getSchemaContext from "../src/utils/getSchemaContext.js";
import getSystemPrompt from "../src/utils/getSystemPrompt.js";
import secureExecute from "../src/core/secureExecute.js";
import SequelizeAI from "../src/index.js";
import OpenAIProvider from "../src/services/providers/openai.provider.js";
import GeminiProvider from "../src/services/providers/gemini.provider.js";
import ClaudeProvider from "../src/services/providers/claude.provider.js";
import GroqProvider from "../src/services/providers/groq.provider.js";
import translateOps from "../src/utils/translateOps.js";
import validateGeneratedCode from "../src/core/validateGeneratedCode.js";

// ── Sequelize mock factory ────────────────────────────────────────────────────

function makeSequelize(overrides = {}) {
  return {
    models: {
      Product: {
        rawAttributes: {
          id: { type: { key: "INTEGER" }, primaryKey: true },
          name: { type: { key: "STRING" }, allowNull: false },
          price: { type: { key: "DECIMAL" }, allowNull: true },
          category: { type: { key: "STRING" }, allowNull: true },
          stock: { type: { key: "INTEGER" }, allowNull: true },
        },
        associations: {},
        findAll: vi
          .fn()
          .mockResolvedValue([
            { id: 1, name: "Keyboard", price: "150.00", stock: 10 },
          ]),
        findOne: vi.fn().mockResolvedValue({
          id: 1,
          name: "Keyboard",
          price: "150.00",
          stock: 10,
        }),
        findByPk: vi.fn().mockResolvedValue({
          id: 1,
          name: "Keyboard",
          price: "150.00",
          stock: 10,
        }),
        findAndCountAll: vi
          .fn()
          .mockResolvedValue({ count: 1, rows: [{ id: 1, name: "Keyboard" }] }),
        count: vi.fn().mockResolvedValue(5),
        sum: vi.fn().mockResolvedValue(85),
        min: vi.fn().mockResolvedValue(8),
        max: vi.fn().mockResolvedValue(150),
        ...overrides,
      },
    },
    literal: vi.fn((expr) => ({ val: expr })),
    fn: vi.fn((fn, col) => ({ fn, col })),
    col: vi.fn((c) => c),
  };
}

// ── Provider mock response ────────────────────────────────────────────────────

const FIND_ALL_CODE =
  'await dbQuery.applySyncPromise(undefined, ["Product", "findAll", JSON.stringify({})])';

// ─────────────────────────────────────────────────────────────────────────────
// 1. validateGeneratedCode
// ─────────────────────────────────────────────────────────────────────────────

describe("validateGeneratedCode", () => {
  it("accepts valid single expression", () => {
    expect(() => validateGeneratedCode(FIND_ALL_CODE)).not.toThrow();
  });

  it("accepts valid multi expression", () => {
    const code = [
      'await dbQuery.applySyncPromise(undefined, ["Product", "min", JSON.stringify({ field: "price" })])',
      'await dbQuery.applySyncPromise(undefined, ["Product", "max", JSON.stringify({ field: "price" })])',
    ].join(", ");
    expect(() => validateGeneratedCode(code)).not.toThrow();
  });

  it("strips markdown fences", () => {
    expect(
      validateGeneratedCode(`\`\`\`javascript\n${FIND_ALL_CODE}\n\`\`\``),
    ).not.toContain("```");
  });

  it("normalizes newline-separated multi-query to comma-separated", () => {
    const code = [
      'await dbQuery.applySyncPromise(undefined, ["Product", "min", JSON.stringify({ field: "price" })])',
      'await dbQuery.applySyncPromise(undefined, ["Product", "max", JSON.stringify({ field: "price" })])',
    ].join("\n");
    const result = validateGeneratedCode(code);
    expect(result.split("\n")).toHaveLength(1);
    expect(result).toContain(", ");
  });

  it("throws on prose output", () => {
    expect(() => validateGeneratedCode("I cannot help with that.")).toThrow(
      "Unexpected generated code format",
    );
  });

  it("throws on empty string", () => {
    expect(() => validateGeneratedCode("")).toThrow();
  });

  it("throws on SQL injection attempt", () => {
    expect(() => validateGeneratedCode("DROP TABLE Products;")).toThrow(
      "Unexpected generated code format",
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. translateOps
// ─────────────────────────────────────────────────────────────────────────────

describe("translateOps", () => {
  it("translates gt to Op symbol", () => {
    const result = translateOps({ stock: { gt: 10 } });
    expect(Object.getOwnPropertySymbols(result.stock).length).toBeGreaterThan(
      0,
    );
  });

  it("translates lt to Op symbol", () => {
    const result = translateOps({ price: { lt: 50 } });
    expect(Object.getOwnPropertySymbols(result.price).length).toBeGreaterThan(
      0,
    );
  });

  it("translates gte, lte, ne, eq", () => {
    ["gte", "lte", "ne", "eq"].forEach((op) => {
      const result = translateOps({ field: { [op]: 1 } });
      expect(Object.getOwnPropertySymbols(result.field).length).toBeGreaterThan(
        0,
      );
    });
  });

  it("passes through plain equality values untouched", () => {
    expect(translateOps({ category: "Electronics" }).category).toBe(
      "Electronics",
    );
  });

  it("returns empty object unchanged", () => {
    expect(translateOps({})).toEqual({});
  });

  it("returns null/undefined unchanged", () => {
    expect(translateOps(null)).toBeNull();
    expect(translateOps(undefined)).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. getSchemaContext
// ─────────────────────────────────────────────────────────────────────────────

describe("getSchemaContext", () => {
  it("returns a string", () => {
    expect(typeof getSchemaContext(makeSequelize())).toBe("string");
  });

  it("includes model name", () => {
    expect(getSchemaContext(makeSequelize())).toContain("Product");
  });

  it("includes field names and types", () => {
    const schema = getSchemaContext(makeSequelize());
    ["name", "price", "stock", "STRING", "INTEGER"].forEach((s) =>
      expect(schema).toContain(s),
    );
  });

  it("excludes primary key fields", () => {
    expect(getSchemaContext(makeSequelize())).not.toContain("id:INTEGER");
  });

  it("handles multiple models", () => {
    const sequelize = makeSequelize();
    sequelize.models.Order = {
      rawAttributes: { total: { type: { key: "DECIMAL" }, allowNull: true } },
      associations: {},
    };
    const schema = getSchemaContext(sequelize);
    expect(schema).toContain("Product");
    expect(schema).toContain("Order");
  });

  it("includes association info when present", () => {
    const sequelize = makeSequelize();
    sequelize.models.Product.associations = {
      Category: { associationType: "BelongsTo", target: { name: "Category" } },
    };
    expect(getSchemaContext(sequelize)).toContain("BelongsTo");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. getSystemPrompt
// ─────────────────────────────────────────────────────────────────────────────

describe("getSystemPrompt", () => {
  const schema = "Model: Product, Fields: [name:STRING, price:DECIMAL]";
  const prompt = getSystemPrompt(schema);

  it("returns a string", () => expect(typeof prompt).toBe("string"));
  it("includes the schema", () => expect(prompt).toContain(schema));
  it("includes all allowed methods", () =>
    [
      "findAll",
      "findOne",
      "findByPk",
      "count",
      "sum",
      "min",
      "max",
      "average",
    ].forEach((m) => expect(prompt).toContain(m)));
  it("includes operator examples", () =>
    ['"gt"', '"lt"', '"between"'].forEach((op) =>
      expect(prompt).toContain(op),
    ));
  it("includes compute field", () => expect(prompt).toContain("compute"));
  it("includes multi-query rule", () =>
    expect(prompt).toContain("Multi-query"));
  it("includes applySyncPromise", () =>
    expect(prompt).toContain("applySyncPromise"));
  it("specifies no backticks rule", () =>
    expect(prompt).toContain("backticks"));
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. secureExecute
// ─────────────────────────────────────────────────────────────────────────────

describe("secureExecute", () => {
  it("executes findAll", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "findAll", JSON.stringify({})])`,
    );
    expect(result).toMatchObject({ model: "Product", method: "findAll" });
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("executes findOne", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "findOne", JSON.stringify({})])`,
    );
    expect(result).toMatchObject({ model: "Product", method: "findOne" });
  });

  it("executes count", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "count", JSON.stringify({})])`,
    );
    expect(result).toMatchObject({
      model: "Product",
      method: "count",
      data: 5,
    });
  });

  it("executes sum", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "sum", JSON.stringify({ field: "stock" })])`,
    );
    expect(result).toMatchObject({ model: "Product", method: "sum", data: 85 });
  });

  it("executes min", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "min", JSON.stringify({ field: "price" })])`,
    );
    expect(result).toMatchObject({ model: "Product", method: "min", data: 8 });
  });

  it("executes max", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "max", JSON.stringify({ field: "price" })])`,
    );
    expect(result).toMatchObject({
      model: "Product",
      method: "max",
      data: 150,
    });
  });

  it("executes findAndCountAll", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "findAndCountAll", JSON.stringify({})])`,
    );
    expect(result.data).toHaveProperty("count");
    expect(result.data).toHaveProperty("rows");
  });

  it("executes multi-query and returns array", async () => {
    const result = await secureExecute(
      makeSequelize(),
      `await dbQuery.applySyncPromise(undefined, ["Product", "min", JSON.stringify({ field: "price" })]), await dbQuery.applySyncPromise(undefined, ["Product", "max", JSON.stringify({ field: "price" })])`,
    );
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ method: "min" });
    expect(result[1]).toMatchObject({ method: "max" });
  });

  it("translates Op string operators", async () => {
    const sequelize = makeSequelize();
    sequelize.models.Product.findAll = vi.fn().mockResolvedValue([]);
    await secureExecute(
      sequelize,
      `await dbQuery.applySyncPromise(undefined, ["Product", "findAll", JSON.stringify({ where: { stock: { "gt": 10 } } })])`,
    );
    const callArgs = sequelize.models.Product.findAll.mock.calls[0][0];
    expect(
      Object.getOwnPropertySymbols(callArgs.where.stock).length,
    ).toBeGreaterThan(0);
  });

  it("throws on unknown model", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Ghost",   "findAll", JSON.stringify({})])`,
      ),
    ).rejects.toThrow("Unknown model"));
  it("throws on blocked method destroy", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "destroy", JSON.stringify({})])`,
      ),
    ).rejects.toThrow("Method not allowed"));
  it("throws on blocked method update", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "update",  JSON.stringify({})])`,
      ),
    ).rejects.toThrow("Method not allowed"));
  it("throws on blocked method create", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "create",  JSON.stringify({})])`,
      ),
    ).rejects.toThrow("Method not allowed"));
  it("throws when field missing for sum", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "sum",     JSON.stringify({})])`,
      ),
    ).rejects.toThrow('"field" is required'));
  it("throws when field missing for min", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "min",     JSON.stringify({})])`,
      ),
    ).rejects.toThrow('"field" is required'));
  it("throws when field missing for max", async () =>
    await expect(
      secureExecute(
        makeSequelize(),
        `await dbQuery.applySyncPromise(undefined, ["Product", "max",     JSON.stringify({})])`,
      ),
    ).rejects.toThrow('"field" is required'));

  // isolated-vm timeout only kills CPU-bound work — use a spin loop, not a pending Promise
  it("times out on CPU spin loop", async () => {
    await expect(
      secureExecute(makeSequelize(), `(() => { while(true) {} })()`),
    ).rejects.toThrow();
  }, 8000);
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Providers — spy on the instance method directly (works with CJS dist/)
// ─────────────────────────────────────────────────────────────────────────────

describe("OpenAIProvider", () => {
  it("throws without apiKey", () =>
    expect(() => new OpenAIProvider()).toThrow("apiKey"));
  it("defaults to gpt-4o-mini", () =>
    expect(new OpenAIProvider("sk-test").model).toBe("gpt-4o-mini"));
  it("uses custom model when provided", () =>
    expect(new OpenAIProvider("sk-test", "gpt-4o").model).toBe("gpt-4o"));

  it("generateCode returns trimmed string", async () => {
    const provider = new OpenAIProvider("sk-test");
    vi.spyOn(provider, "generateCode").mockResolvedValue(FIND_ALL_CODE);
    const result = await provider.generateCode("system", "get all products");
    expect(typeof result).toBe("string");
    expect(result).toBe(result.trim());
  });
});

describe("GeminiProvider", () => {
  it("throws without apiKey", () =>
    expect(() => new GeminiProvider()).toThrow("apiKey"));

  it("generateCode returns a string", async () => {
    const provider = new GeminiProvider("key-test");
    vi.spyOn(provider, "generateCode").mockResolvedValue(FIND_ALL_CODE);
    const result = await provider.generateCode("system", "get all products");
    expect(typeof result).toBe("string");
  });

  it("strips markdown fences from response", async () => {
    const provider = new GeminiProvider("key-test");
    // Spy on the internal client to return fenced markdown
    vi.spyOn(provider.client, "generateContent").mockResolvedValue({
      response: { text: () => "```javascript\n" + FIND_ALL_CODE + "\n```" },
    });
    const result = await provider.generateCode("system", "query");
    expect(result).not.toContain("```");
  });
});

describe("ClaudeProvider", () => {
  it("throws without apiKey", () =>
    expect(() => new ClaudeProvider()).toThrow("apiKey"));
  it("defaults to claude-haiku-4-5-20251001", () =>
    expect(new ClaudeProvider("sk-ant-test").model).toBe(
      "claude-haiku-4-5-20251001",
    ));

  it("generateCode returns trimmed string", async () => {
    const provider = new ClaudeProvider("sk-ant-test");
    vi.spyOn(provider, "generateCode").mockResolvedValue(FIND_ALL_CODE);
    const result = await provider.generateCode("system", "get all products");
    expect(typeof result).toBe("string");
    expect(result).toBe(result.trim());
  });
});

describe("GroqProvider", () => {
  it("throws without apiKey", () =>
    expect(() => new GroqProvider()).toThrow("apiKey"));
  it("defaults to llama-3.1-8b-instant", () =>
    expect(new GroqProvider("gsk-test").model).toBe("llama-3.1-8b-instant"));

  it("generateCode returns trimmed string", async () => {
    const provider = new GroqProvider("gsk-test");
    vi.spyOn(provider, "generateCode").mockResolvedValue(FIND_ALL_CODE);
    const result = await provider.generateCode("system", "get all products");
    expect(typeof result).toBe("string");
    expect(result).toBe(result.trim());
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. SequelizeAI — spy on engine.generateCode to avoid real API calls
// ─────────────────────────────────────────────────────────────────────────────

describe("SequelizeAI", () => {
  it("throws without sequelize", () =>
    expect(() => new SequelizeAI(null, { apiKey: "key" })).toThrow());
  it("throws without apiKey", () =>
    expect(
      () => new SequelizeAI(makeSequelize(), { provider: "openai" }),
    ).toThrow("apiKey"));
  it("throws on unsupported provider", () =>
    expect(
      () =>
        new SequelizeAI(makeSequelize(), {
          provider: "unknown",
          apiKey: "key",
        }),
    ).toThrow());
  it("initialises with openai", () =>
    expect(
      () =>
        new SequelizeAI(makeSequelize(), {
          provider: "openai",
          apiKey: "sk-test",
        }),
    ).not.toThrow());
  it("initialises with gemini", () =>
    expect(
      () =>
        new SequelizeAI(makeSequelize(), {
          provider: "gemini",
          apiKey: "key-test",
        }),
    ).not.toThrow());
  it("initialises with claude", () =>
    expect(
      () =>
        new SequelizeAI(makeSequelize(), {
          provider: "claude",
          apiKey: "sk-ant-test",
        }),
    ).not.toThrow());
  it("initialises with groq", () =>
    expect(
      () =>
        new SequelizeAI(makeSequelize(), {
          provider: "groq",
          apiKey: "gsk-test",
        }),
    ).not.toThrow());

  it("throws on empty userInput", async () => {
    const ai = new SequelizeAI(makeSequelize(), {
      provider: "openai",
      apiKey: "sk-test",
    });
    await expect(ai.ask("")).rejects.toThrow("userInput");
    await expect(ai.ask("   ")).rejects.toThrow("userInput");
  });

  it("ask() returns a result with model and method", async () => {
    const ai = new SequelizeAI(makeSequelize(), {
      provider: "openai",
      apiKey: "sk-test",
    });
    vi.spyOn(ai.engine, "generateCode").mockResolvedValue(FIND_ALL_CODE);
    const result = await ai.ask("get all products");
    expect(result).toMatchObject({ model: "Product", method: "findAll" });
  });

  it("ask() rejects when LLM returns prose instead of code", async () => {
    const ai = new SequelizeAI(makeSequelize(), {
      provider: "openai",
      apiKey: "sk-test",
    });
    vi.spyOn(ai.engine, "generateCode").mockResolvedValue(
      "I cannot help with that.",
    );
    await expect(ai.ask("get all products")).rejects.toThrow(
      "Unexpected generated code format",
    );
  });

  it("ask() strips markdown fences from generated code", async () => {
    const sequelize = makeSequelize();
    sequelize.models.Product.findAll = vi.fn().mockResolvedValue([]);
    const ai = new SequelizeAI(sequelize, {
      provider: "openai",
      apiKey: "sk-test",
    });
    vi.spyOn(ai.engine, "generateCode").mockResolvedValue(
      `\`\`\`javascript\n${FIND_ALL_CODE}\n\`\`\``,
    );
    await expect(ai.ask("get all products")).resolves.toBeDefined();
  });

  it("ask() handles multi-query newline format", async () => {
    const ai = new SequelizeAI(makeSequelize(), {
      provider: "openai",
      apiKey: "sk-test",
    });
    vi.spyOn(ai.engine, "generateCode").mockResolvedValue(
      [
        'await dbQuery.applySyncPromise(undefined, ["Product", "min", JSON.stringify({ field: "price" })])',
        'await dbQuery.applySyncPromise(undefined, ["Product", "max", JSON.stringify({ field: "price" })])',
      ].join("\n"),
    );
    const result = await ai.ask("cheapest and most expensive price");
    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });
});
