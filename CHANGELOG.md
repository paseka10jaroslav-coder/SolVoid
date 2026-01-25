# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-25

### Added
- **Privacy Leak Detection Engine**: Core scanning logic for identity, metadata, and state leaks.
- **IDL-Based Semantic Analysis**: Deep inspection of instruction data using semantic understanding.
- **Binary State Scanner**: Detection of embedded public keys in account data.
- **CLI Tool**: `privacy-scan` command-line interface with configurable options.
- **Comprehensive Test Suite**: Unit and integration tests for all core modules.
- **Forensics Modules**: 
  - Order Flow Analysis (MEV detection)
  - Simulation Engine (Transaction simulation)
- **Compliance Tools**:
  - Threat Model Registry (GDPR, standard, evasion profiles)
  - Identity Compliance checks
- **Documentation**: Extensive README and SECURITY docs.

### Changed
- **Rebranding**: Positioned strictly as a "Leak Detection Tool" rather than a privacy solution.
- **RPC Handling**: Added configurable RPC endpoints to prevent IP leaks to public nodes.
- **Error Handling**: Improved error messages throughout the SDK.

### Deprecated
- **TransactionObfuscator**: Marked as deprecated/unsafe. It provided false security (funding traces).

### Removed
- **SafeObfuscator**: Completely removed. Provided no cryptographic privacy.
- **Broken Confidential Transfer Implementations**: Removed partial implementations that didn't generate valid proofs.
- **--fix flag**: Removed "auto-fix" capability as true privacy requires architectural changes, not quick fixes.

### Security
- **Explicit Warnings**: Added heavy warnings about the limitations of the tool.
- **Funding Trace Education**: Documentation on why ephemeral keys don't protect against graph analysis.
- **Input Validation**: Stricter validation on all user inputs.
