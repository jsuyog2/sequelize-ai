# Contributing to `sequelize-ai`

Welcome to `sequelize-ai`! We are glad you're here. This document will guide you through the process of contributing to our open-source project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Project Structure](#project-structure)
5. [Testing & Quality Assurance](#testing--quality-assurance)
6. [Pull Request Process](#pull-request-process)
7. [Code Style Guide](#code-style-guide)

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before contributing.

## Getting Started

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/[your-username]/sequelize-ai.git
   cd sequelize-ai
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/my-new-feature
   # or
   git checkout -b fix/issue-number
   ```

## Development Workflow

- The core logic lives in `src/`.
- `examples/app.js` and `examples/run.js` contain mock databases and complex query examples you can use to test logic locally.
- Run tests using Vitest: `npm test`
- Make sure to format your code: `npm run lint:fix && npm run format`

## Project Structure

```
src/
├── core/                # Sandbox execution & code validation
├── services/providers/  # AI Provider implementations (OpenAI, Gemini, etc.)
├── utils/               # Prompts, schema extractors, operator translators
└── index.js             # Main class and exporter
tests/                   # Vitest unit test suite (100% mocked, no API keys needed)
docs/                    # Tailwind + GSAP Documentation landing page
```

## Testing & Quality Assurance

All contributions **must** pass our quality checks. We have a comprehensive test suite (580+ lines of Vitest tests) that mocks the Sequelize instance and the AI providers, meaning no API keys or real databases are required.

To run tests:

```bash
npm test
```

To run coverage:

```bash
npm run test:coverage
```

## Pull Request Process

1. Ensure all tests pass (`npm test`).
2. Run the linter and formatter (`npm run lint:fix`).
3. Update the `README.md` or `docs/` if you are adding new features, configuration options, or changing public APIs.
4. Open a Pull Request against the `main` branch with a clear title and description. We provide a PR template to guide you.
5. A project maintainer will review your code.

## Code Style Guide

- We use **Prettier** for code formatting.
- We use **ESLint** for code linting.
- Prefer `const` and `let` over `var`.
- Use descriptive variable and function names.
- Document any new classes or methods with JSDoc style comments.

Thank you for contributing!
