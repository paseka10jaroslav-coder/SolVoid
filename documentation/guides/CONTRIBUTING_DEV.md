# Contributing To SolVoid

We are building the future of Solana privacy. We welcome engineers who are passionate about cryptography, security forensics, and high-performance protocols.

## Security First
Because SolVoid handles sensitive zero-knowledge proofs, we maintain a strict security-first development lifecycle.

1. **No Implicit Anys**: All TypeScript code must be strictly typed.
2. **Deterministic Builds**: Circuits must be compiled and verified against the public R1CS.
3. **Audit Readiness**: Every pull request must include extensive unit tests for edge cases (e.g., duplicate nullifiers, incorrect sibling indices).

## Development Setup

```bash
# Clone the repository
git clone https://github.com/solvoid/solvoid

# Install dependencies
npm install

# Build the SDK
npm run build

# Run core tests
npm test
```

## Contribution workflow
1. **Research**: Discuss your ideas in the GitHub Issues or our developer forums.
2. **Implement**: Create a feature branch.
3. **Verify**: Ensure all unit and integration tests pass.
4. **Scrutinize**: Your code will be reviewed by at least two maintainers for security vulnerabilities.

## Bug Bounties
We operate an active bug bounty for cryptographic vulnerabilities. If you find a way to forge a proof or double-spend, please report it via our [Security Policy](../SECURITY.md).

---
*By contributing to SolVoid, you agree that your contributions will be licensed under the MIT License.*
