#!/bin/bash
set -e

# PrivacyZero ZK-Ceremony & Compilation Script
# This script automates the creation of the zero-knowledge artifacts.

echo "--------------------------------------------------"
echo "PrivacyZero ZK Build System"
echo "--------------------------------------------------"

# 1. Compile Circuit
echo "[1/4] Compiling withdraw.circom..."
if ! command -v circom &> /dev/null
then
    echo "Error: 'circom' binary not found. Please install it from https://docs.circom.io/"
    exit 1
fi

mkdir -p ./build

circom program/circuits/withdraw.circom --wasm --r1cs -o ./build -l node_modules -l program/circuits

# 2. Trusted Setup (Phase 1 - Powers of Tau)
# We use a 2^14 tau file which is sufficient for this circuit depth.
echo "[2/4] Downloading Powers of Tau..."
if [ ! -f "pot14_final.ptau" ]; then
    curl -L https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_14.ptau -o pot14_final.ptau
fi

# 3. Phase 2 Setup (Circuit Specific)
echo "[3/4] Generating ZKey..."
if [ ! -f "withdraw_0000.zkey" ]; then
    npx snarkjs groth16 setup ./build/withdraw.r1cs pot14_final.ptau withdraw_0000.zkey
fi
echo "Contribution..." | npx snarkjs zkey contribute withdraw_0000.zkey withdraw_final.zkey --name="PrivacyZero Contribution" -v

# 4. Export Verification Key
echo "[4/4] Exporting Verification Key..."
npx snarkjs zkey export verificationkey withdraw_final.zkey verification_key.json

# Copy artifacts for SDK/CLI
cp ./build/withdraw_js/withdraw.wasm ./withdraw.wasm
cp withdraw_final.zkey ./withdraw.zkey

echo "--------------------------------------------------"
echo "Build Complete!"
echo "Artifacts generated:"
echo " - ./withdraw.wasm"
echo " - ./withdraw.zkey"
echo " - ./verification_key.json"
echo "--------------------------------------------------"
echo "Action required: Copy the bytes from verification_key.json into program/src/lib.rs"
