# Changelog

All notable changes to sequelize-ai will be documented in this file.

---

## [1.2.0] — 2026-03-09

### Added

- **Animated GitHub Pages Architecture:** Rewrote the documentation site pipeline into a standalone zero-dependency `build-docs.js` script that procedurally generates a beautiful Tailwind and GSAP-animated landing page into the `docs/` folder.
- **Dark/Light Mode:** Includes a local-storage persisted theme toggle.
- **Fixes:** Squashed bugs regarding GSAP missing targets on documentation sub-pages, contrasted light-mode code blocks, and correctly exported SVG favicons during the build process.

---

## [1.1.1] — 2026-03-09

### Added

- **Modern Documentation Site:** A new, beautiful Tailwind CSS static documentation site populated within the `docs/` folder, deployable to GitHub Pages.
- **JSDoc Type Safety:** Added comprehensive JSDoc annotations to `SequelizeAI` options, core execution engine, and utilities, greatly improving autocomplete and IntelliSense for developers.
- **Improved Error Context:** The secure evaluation sandbox now traps the exact generated LLM code and appends it to execution error messages to simplify debugging AI "hallucinations".
- **CI/CD Pipelines:** Implemented robust GitHub Actions workflows for automated testing, linting, and coverage on push (`ci.yml`) and documentation deployment (`docs.yml`).
- **Open Source Standards:** Integrated a comprehensive `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `PULL_REQUEST_TEMPLATE.md`, and structured YAML GitHub Issue templates.
- **Pre-commit Hooks:** Added `husky` and `lint-staged` along with `eslint` and `prettier` to enforce code quality automatically before commits.

### Changed

- **Project Structure Refactor:** Cleaned up project organization by extracting core logic into `src/core`, `src/utils`, and `src/services/providers`. Migrated sample models and scripts into an isolated `examples/` directory.
- **README Overhaul:** Completely rewrote the `README.md` to highlight the project's unique security-first value proposition, feature checklists, and integration with the new documentation site.

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
