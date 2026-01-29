# SolVoid: Privacy Protocol for Solana

**A zero-knowledge privacy protocol for Solana blockchain.**

## ⚠️ HONEST STATUS

This is an active development project. Some features are complete, others are in progress.

## ✅ WHAT ACTUALLY EXISTS

### CLI Tools (Working)
- Privacy scanning commands
- Transaction analysis tools
- Network monitoring utilities
- Privacy shield generation
- **Location**: `cli/` directory
- **Count**: 28+ TypeScript files

### SDK (Working)
- TypeScript/JavaScript SDK
- Privacy engine implementation
- ZK circuit integration
- **Location**: `sdk/` directory
- **Count**: 32+ TypeScript files

### Smart Contracts (Working)
- Solana programs (Rust)
- ZK circuit implementations
- Privacy protocol logic
- **Location**: `programs/solvoid-zk/`
- **Count**: 16+ Rust files

### ZK Circuits (Working)
- Circom circuits for privacy
- Withdraw circuits
- Merkle tree circuits
- **Location**: `circuits/` directory
- **Count**: 6+ circuit files

### CI/CD Scripts (Working)
- Build automation scripts
- Deployment scripts
- **Location**: `scripts/` directory
- **Count**: 30+ shell scripts

### Tests (Working)
- Unit tests
- Integration tests
- **Location**: `tests/` directory
- **Count**: 27+ test files

## ❌ WHAT DOESN'T EXIST

### Documentation
- No API documentation
- No security guides
- No contributing guides
- No architecture docs

### Mobile Apps
- No Android APK
- No iOS apps
- No React Native code

### Web Dashboard
- Dashboard code exists but not production-ready
- Located in `dashboard/` directory
- Not recommended for production use

### Build Commands
- `npm run build:docs` - doesn't exist
- `npm run build:sdk` - doesn't exist
- `npm run build:cli` - doesn't exist

## 🛠️ HOW TO USE WHAT EXISTS

### CLI Tools
```bash
# Install dependencies
npm install

# Run CLI commands
cd cli
node solvoid-scan.js --help
node enhanced-privacy-scan.js --help
```

### SDK
```bash
# Build SDK
cd sdk
npm run build

# Use in your project
import { SolVoidClient } from './dist/index.js';
```

### Smart Contracts
```bash
# Build Solana programs
cd programs/solvoid-zk
cargo build
```

### ZK Circuits
```bash
# Compile circuits
cd circuits
npm install
npx circom withdraw.circom
```

## 📁 PROJECT STRUCTURE

```
solvoid/
├── cli/                 # ✅ CLI tools (28+ files)
├── sdk/                 # ✅ TypeScript SDK (32+ files)
├── programs/           # ✅ Solana programs (16+ files)
├── circuits/           # ✅ ZK circuits (6+ files)
├── scripts/            # ✅ Build scripts (30+ files)
├── tests/              # ✅ Tests (27+ files)
├── tools/              # ✅ Utility tools (4+ files)
├── relayer/            # ✅ Relayer implementation (6+ files)
└── dashboard/          # ⚠️ Web dashboard (not production-ready)
```

## 🚀 GETTING STARTED

### Prerequisites
- Node.js 18+
- Rust (for smart contracts)
- Solana CLI

### Installation
```bash
git clone https://github.com/privacy-zero/solvoid.git
cd solvoid
npm install
```

### Build CLI Tools
```bash
cd cli
npm install
node solvoid-scan.js --address YOUR_ADDRESS
```

### Build SDK
```bash
cd sdk
npm run build
```

### Build Smart Contracts
```bash
cd programs/solvoid-zk
cargo build
```

## 🔧 DEVELOPMENT STATUS

### ✅ Working
- CLI privacy scanning tools
- TypeScript SDK core functionality
- ZK circuit compilation
- Smart contract compilation
- Basic test suite

### 🚧 In Progress
- Web dashboard completion
- API documentation
- Integration testing
- Production deployment

### ❌ Not Started
- Mobile applications
- Production documentation
- CI/CD pipeline
- Security audit

## 📄 License

MIT License - see [LICENSE](./LICENSE) file.

## 🔒 Security

This is experimental software. Use at your own risk.

## 🤝 Contributing

Contributions welcome. See existing code for patterns.

---

**Status: Active Development - Not Production Ready**
