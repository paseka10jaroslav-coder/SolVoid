# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Merkle Tree update logic in the smart contract.
- Support for Poseidon hashing in the SDK.
- Relayer fee calculation in `economics.rs`.

### Changed
- Refactored `lib.rs` to support Anchor 0.30.
- Updated dashboard UI for better mobile responsiveness.

### Fixed
- Fixed a bug where Merkle root history index would overflow.
- Corrected field element validation in `verifier.rs`.

---

## [0.1.0-alpha] - 2026-01-25

### Added
- Initial project structure.
- Basic Circom circuits for Groth16.
- Simple Anchor program with Deposit/Withdraw instructions.
- Dashboard boilerplate with Solana wallet integration.

### Security
- Implemented basic binding of recipient address to ZK proof public inputs.
