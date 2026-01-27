# Contributing to SolVoid

Thank you for your interest in contributing to SolVoid! This guide will help you get started with contributing to our enterprise-grade privacy platform for the Solana ecosystem.

## 🚀 Quick Start

### Prerequisites

- **Rust**: 1.70.0 or higher
- **Node.js**: 16.0.0 or higher  
- **Solana CLI**: Latest version
- **Git**: Basic familiarity
- **Docker**: For containerized builds

### Development Setup

```bash
# Clone the repository
git clone https://github.com/brainless3178/SolVoid.git
cd SolVoid

# Install dependencies
npm install

# Build the program
cargo build-bpf --manifest-path=program/Cargo.toml

# Run tests
npm test
```

## 🏗️ Project Structure

```
SolVoid/
├── program/           # Solana on-chain program
│   ├── src/           # Rust source code
│   ├── circuits/       # ZK circuit definitions
│   └── tests/         # Program tests
├── sdk/               # TypeScript SDK
│   ├── client.ts       # Main client class
│   ├── crypto/         # Cryptographic utilities
│   ├── pipeline/       # Privacy analysis
│   └── passport/      # Privacy scoring
├── cli/               # Command-line interface
├── relayer/            # Shadow relayer service
├── dashboard/          # Web dashboard
├── docs/               # Documentation
├── tests/              # Test suites
└── scripts/            # Build and deployment scripts
```

## 🤝 Contributing Guidelines

### 📋 Types of Contributions

We welcome contributions in the following areas:

#### 🔒 Security & Cryptography
- **Zero-knowledge proof improvements**
- **Cryptographic protocol enhancements**
- **Security audit findings and fixes**
- **Privacy leak detection algorithms**
- **Performance optimizations**

#### 🛠️ Core Development
- **Solana program improvements**
- **SDK enhancements**
- **CLI tool features**
- **Relayer network protocols**
- **Dashboard functionality**

#### 📚 Documentation
- **API documentation**
- **Technical guides**
- **Tutorial content**
- **Security specifications**
- **Architecture documentation**

#### 🧪 Testing & Quality
- **Unit tests**
- **Integration tests**
- **Performance benchmarks**
- **Security testing**
- **Cross-platform compatibility**

#### 🔧 DevOps & Infrastructure
- **CI/CD pipeline improvements**
- **Docker optimizations**
- **Monitoring and alerting**
- **Deployment automation**
- **Build system enhancements**

### 📝 Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**
4. **Add tests** if applicable
5. **Run tests**: `npm test`
6. **Submit a pull request**

### 🔒 Security Considerations

- **Never commit private keys or sensitive data**
- **Follow secure coding practices**
- **Run security tests** before PR submission
- **Document security implications** of changes
- **Get security review** for cryptographic changes

### 📝 Code Style

We follow the following conventions:

#### Rust (Solana Program)
- Use `cargo fmt` for formatting
- Use `cargo clippy` for linting
- Follow Rust naming conventions
- Add comprehensive comments for complex logic
- Include proper error handling

#### TypeScript (SDK/CLI/Dashboard)
- Use `prettier` for formatting
- Follow TypeScript best practices
- Use descriptive variable and function names
- Include JSDoc comments
- Implement proper error handling

#### Documentation
- Use clear, professional language
- Include code examples
- Add mermaid diagrams for architecture
- Follow markdown formatting
- Include installation and usage instructions

## 🔧 Development Setup

### Environment Setup

```bash
# Install Rust
curl --proto '=https://sh.rustup.rs' | sh
source ~/.cargo/env

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.18.4/install)"

# Clone and setup
git clone https://github.com/brainless3178/SolVoid.git
cd SolVoid
npm install
```

### Building the Project

```bash
# Build Solana program
cargo build-bpf --manifest-path=program/Cargo.toml

# Build TypeScript SDK
npm run build

# Run all tests
npm test

# Run security tests
npm run test:security

# Run performance tests
npm run test:performance
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:security
npm run test:performance

# Run with coverage
npm run test:coverage
```

### Test Structure

```
tests/
├── unit/              # Unit tests
│   ├── crypto-consistency.test.ts
│   ├── poseidon.test.ts
│   └── idl-registry.test.ts
├── integration/       # Integration tests
│   ├── cross-component-hash-verification.test.ts
│   └── cross-platform-consistency.test.ts
├── security/          # Security tests
│   ├── basic-security.test.ts
│   ├── circuit-soundness-simple.test.ts
│   └── circuit-soundness.test.ts
└── performance/        # Performance tests
    └── poseidon-performance.test.ts
```

## 📝 Documentation

### Documentation Standards

- **Clear and concise** explanations
- **Code examples** for all major features
- **Mermaid diagrams** for architecture visualization
- **Installation instructions** for all platforms
- **API references** with examples
- **Security considerations** where applicable

### Documentation Structure

```
docs/
├── API.md              # REST API reference
├── ARCHITECTURE.md      # System architecture
├── CLI.md              # CLI documentation
├── SDK.md              # SDK documentation
├── SECURITY.md          # Security specifications
└── DEPLOYMENT.md        # Deployment guide
```

## 🔒 Security Reporting

### Responsible Disclosure

If you discover a security vulnerability, please follow our responsible disclosure process:

1. **Do not open a public issue** for security issues
2. **Send a detailed report** to: `security@solvoid.io`
3. **Include**: Description, reproduction steps, potential impact
4. **Allow us time** to investigate and patch before disclosure

### Security Best Practices

- **Never commit sensitive data** (keys, secrets, etc.)
- **Use secure coding practices** in all contributions
- **Run security tests** before submitting PRs
- **Review cryptographic implementations** carefully
- **Consider edge cases** in privacy protocols

## 🚀 Pull Request Process

### PR Guidelines

1. **Title**: Clear, descriptive title
2. **Description**: Detailed description of changes
3. **Testing**: Include tests for new functionality
4. **Documentation**: Update relevant documentation
5. **Breaking Changes**: Clearly mark breaking changes
6. **Security**: Highlight security implications

### PR Review Process

1. **Automated checks**: CI/CD pipeline validation
2. **Code review**: Peer review by maintainers
3. **Security review**: Security team review for sensitive changes
4. **Integration testing**: Ensure compatibility
5. **Final approval**: Maintainer approval required

### Merge Requirements

- **All tests must pass**
- **Code must follow style guidelines**
- **Documentation must be updated**
- **Security tests must pass**
- **No breaking changes without proper versioning**

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes, API modifications
- **MINOR**: New features, enhancements
- **PATCH**: Bug fixes, security patches

### Release Checklist

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Security review completed
- [ ] Performance benchmarks run
- [ ] Integration tests passing
- [ ] Build artifacts verified
- [ ] Release notes prepared

## 🤝 Community

### Communication Channels

- **Discord**: [Join our community](https://discord.gg/solvoid)
- **GitHub Issues**: [Report issues](https://github.com/brainless3178/SolVoid/issues)
- **Discussions**: [GitHub Discussions](https://github.com/brainless3178/SolVoid/discussions)
- **Email**: `security@solvoid.io` (security issues only)

### Code of Conduct

We are committed to providing a welcoming and inclusive environment for all contributors. Please read and follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## 🏆️ Recognition

Contributors are recognized in our:
- **Contributors section** in README.md
- **Release notes** for each version
- **Security acknowledgments** in security reports
- **Community highlights** in project updates

## 📜 Getting Help

- **Documentation**: Check our [comprehensive documentation](docs/)
- **Issues**: [Search existing issues](https://github.com/brainless3178/SolVoid/issues)
- **Discord**: Join our [Discord community](https://discord.gg/solvoid)
- **Email**: `support@solvoid.io` for general inquiries

---

**Thank you for contributing to SolVoid! Your contributions help advance privacy on Solana.** 🚀️
