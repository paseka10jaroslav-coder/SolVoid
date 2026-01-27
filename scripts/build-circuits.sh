#!/bin/bash

# SolVoid Circuit Build Script
# This script compiles the ZK circuits and generates proving/verification keys

set -e

CIRCUIT_DIR="program/circuits"
BUILD_DIR="build/circuits"
PTAU_FILE="pot14_final.ptau"

# Create build directories
mkdir -p $BUILD_DIR

echo "🔮 Building SolVoid ZK Circuits..."

# Check if circom is installed
if ! command -v circom &> /dev/null; then
    echo "❌ circom not found. Please install circom: npm install -g circom"
    exit 1
fi

# Check if snarkjs is installed
if ! command -v snarkjs &> /dev/null; then
    echo "❌ snarkjs not found. Please install snarkjs: npm install -g snarkjs"
    exit 1
fi

# Download Powers of Tau if not exists
if [ ! -f "$PTAU_FILE" ]; then
    echo "📥 Downloading Powers of Tau (2^14)..."
    curl https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_14.ptau -o $PTAU_FILE
fi

# Build deposit circuit
echo "🔧 Building deposit circuit..."
circom $CIRCUIT_DIR/deposit.circom --r1cs --wasm --output $BUILD_DIR
snarkjs groth16 setup $BUILD_DIR/deposit.r1cs $PTAU_FILE $BUILD_DIR/deposit.zkey
snarkjs zkey contribute $BUILD_DIR/deposit.zkey $BUILD_DIR/deposit_final.zkey --name="SolVoid Deposit Ceremony" -v
snarkjs zkey export verificationkey $BUILD_DIR/deposit_final.zkey $BUILD_DIR/deposit_vk.json

# Build withdraw circuit
echo "🔧 Building withdraw circuit..."
circom $CIRCUIT_DIR/withdraw.circom --r1cs --wasm --output $BUILD_DIR
snarkjs groth16 setup $BUILD_DIR/withdraw.r1cs $PTAU_FILE $BUILD_DIR/withdraw.zkey
snarkjs zkey contribute $BUILD_DIR/withdraw.zkey $BUILD_DIR/withdraw_final.zkey --name="SolVoid Withdraw Ceremony" -v
snarkjs zkey export verificationkey $BUILD_DIR/withdraw_final.zkey $BUILD_DIR/withdraw_vk.json

# Generate Solidity verifiers (for reference)
echo "📄 Generating Solidity verifiers..."
snarkjs zkey export solidityverifier $BUILD_DIR/deposit_final.zkey $BUILD_DIR/DepositVerifier.sol
snarkjs zkey export solidityverifier $BUILD_DIR/withdraw_final.zkey $BUILD_DIR/WithdrawVerifier.sol

# Copy final keys to program directory
echo "📋 Copying verification keys..."
cp $BUILD_DIR/deposit_vk.json program/
cp $BUILD_DIR/withdraw_vk.json program/

echo "✅ Circuit build complete!"
echo ""
echo "📊 Build Summary:"
echo "   Deposit circuit: $BUILD_DIR/deposit.r1cs"
echo "   Withdraw circuit: $BUILD_DIR/withdraw.r1cs"
echo "   Deposit zkey: $BUILD_DIR/deposit_final.zkey"
echo "   Withdraw zkey: $BUILD_DIR/withdraw_final.zkey"
echo "   Deposit VK: $BUILD_DIR/deposit_vk.json"
echo "   Withdraw VK: $BUILD_DIR/withdraw_vk.json"
echo ""
echo "🔐 Next steps:"
echo "   1. Review the generated verification keys"
echo "   2. Test the circuits with sample inputs"
echo "   3. Update the Solana program to use the real VKs"
echo "   4. Run security tests before deployment"
