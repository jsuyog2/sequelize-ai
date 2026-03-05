// tsup.config.js
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.js",
    "src/getSchemaContext.js",
    "src/getSystemPrompt.js",
    "src/secureExecute.js",
    "src/translateOps.js",
    "src/validateGeneratedCode.js",
    "src/providers/openai.provider.js",
    "src/providers/gemini.provider.js",
    "src/providers/claude.provider.js",
    "src/providers/groq.provider.js",
    "src/providers/openai-compatible.provider.js",
  ],
  outDir: "dist",
  format: ["cjs"], // CommonJS output — matches "type": "commonjs"
  clean: true, // wipe dist/ before each build
  minify: false, // keep readable for debugging
  sourcemap: true, // helps with stack traces in production
});
