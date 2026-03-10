# Security Policy

## Supported Versions

Currently only the latest version of `sequelize-ai` is supported with security updates.

| Version  | Supported          |
| -------- | ------------------ |
| >= 1.0.x | :white_check_mark: |
| < 1.0.x  | :x:                |

## Reporting a Vulnerability

Because this library fundamentally deals with translating LLM output into database queries, we take security extremely seriously.

If you discover a security vulnerability, **please DO NOT report it by opening a GitHub issue**.

Instead, please send an email to the project maintainers or use GitHub's private vulnerability reporting feature on the repository.

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress. If you have not received a reply within 48 hours, please reach out again.

### What to include in your report

- A detailed description of the vulnerability including the LLM provider used (if relevant).
- The version of `sequelize-ai` you are using.
- Instructions on how to reproduce the issue (a proof of concept is highly appreciated).
- Any potential impact on user data or database integrity (e.g. bypassing the isolation limits, SQL injection).
