# Contributing to SolVoid

Thank you for your interest in contributing to SolVoid! This project helps identifying privacy leaks in Solana transactions.

## Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/solvoid/solvoid.git
   cd solvoid
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Run tests**
   ```bash
   npm test
   ```

## Running the CLI Locally

You can run the CLI directly from the source code without installing it globally:

```bash
# Scan a transaction signature
npm run dev -- <transaction-signature>
# Example
npm run dev -- 5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc...
```

For custom RPC endpoints (recommended for privacy):
```bash
npm run dev -- <sig> --rpc https://your-private-rpc.com
```

## Code Style

- **TypeScript Standard**: We use strict TypeScript configuration. Avoid `any` types whenever possible.
- **Linting**: Run `npm run lint` before committing to ensure code style compliance.
- **Documentation**: All public functions and classes must have JSDoc comments explaining parameters and return values.

## Submitting Changes

1. **Fork** the repository on GitHub.
2. Create a **feature branch** (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. **Add tests** for your new feature. PRs without tests will not be merged.
5. Ensure all tests pass (`npm test`).
6. Push to the branch (`git push origin feature/amazing-feature`).
7. Open a **Pull Request**.

## Reporting Issues

If you find a bug or have a feature request, please use the [GitHub Issues](https://github.com/solvoid/solvoid/issues) tracker.

Include:
- Clear description of the issue
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, Node version)

## Security Vulnerabilities

If you discover a security vulnerability, please **DO NOT** open a public issue.
See [SECURITY.md](SECURITY.md) for reporting instructions.
