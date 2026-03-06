# Changelog

All notable changes to sequelize-ai will be documented in this file.

---

## [1.1.0] — 2026-03-06

### Added

- **AI Column Hints** — add `aiDescription` to any Sequelize model column to give the LLM richer context about what each field means, leading to more accurate query generation
- `getSchemaContext` now reads `aiDescription` from model column definitions and falls back to Sequelize `comment` if not set
- Required fields now marked as `(required)` in the schema context passed to the LLM
- Added `npm run test:coverage` script for local coverage reports
- Added `node run.js` integration test runner with 35 test cases across 10 categories

### Changed

- `getSchemaContext` output now includes field descriptions inline — richer prompt context for all providers
- Updated README — added AI Column Hints section, clarified peer dependency installation, improved provider table
- Updated Node.js engine requirement to `>=22.0.0` to match `isolated-vm@6` requirements
- Replaced deprecated `codecov/test-results-action@v1` with `codecov-action@v5` using `report_type: test_results`

### Fixed

- GitHub Actions workflow now correctly enforces Node 22 using `node-version: "22.x"` and `check-latest: true`
- Native module compilation failure for `isolated-vm` on CI by splitting `npm ci --ignore-scripts` and `npm rebuild isolated-vm`

---

## [1.0.0] — 2026-03-05

### Added

- Initial release of **sequelize-ai**
- Natural language to Sequelize query translation via LLM providers
- Secure sandbox execution using `isolated-vm` (128MB limit, 2s timeout)
- Support for four LLM providers: OpenAI, Google Gemini, Anthropic Claude, Groq
- OpenAI-compatible provider for DeepSeek, Together, and OpenRouter
- Read-only method whitelist: `findAll`, `findOne`, `findByPk`, `findAndCountAll`, `count`, `sum`, `min`, `max`, `average`
- Operator translation — plain string operators (`"gt"`, `"lt"`, `"between"`, etc.) automatically mapped to Sequelize `Op` symbols
- Computed columns via `compute` array — derive values like `stock * price` without raw SQL
- Multi-query support — compound questions resolved via `Promise.all` returning a structured array
- Custom `average` handler using `sequelize.fn("AVG")` since Sequelize has no native `.average()` method
- `validateGeneratedCode` — strips markdown fences, normalizes newline-separated multi-query to comma-separated, rejects prose output
- `translateOps` — recursively translates string operator keys to Sequelize `Op` symbols
- `getSchemaContext` — extracts model names, field types, nullability, and associations for LLM context
- `getSystemPrompt` — structured prompt with method signatures, operator rules, compute syntax, and 15+ examples
- Vitest unit test suite — 69 tests across 7 modules, fully mocked (no real API keys or DB required)
- GitHub Actions workflow — build, test, publish to npm and GitHub Packages on release
- MIT License

---

## Links

- [npm](https://www.npmjs.com/package/sequelize-ai)
- [GitHub](https://github.com/jsuyog2/sequelize-ai)
- [Issues](https://github.com/jsuyog2/sequelize-ai/issues)
