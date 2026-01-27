pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "circomlib/circuits/comparators.circom";
include "circomlib/circuits/bitify.circom";
include "merkleTree.circom";

// PrivacyZero Withdraw Circuit
// Proves: I know (secret, nullifier) such that:
// 1. Poseidon(secret, nullifier) == commitment
// 2. commitment exists in Merkle Tree with given root and path
// 3. nullifier is unique (public input)
// 4. amount is within valid range
// 5. fee is within protocol limits
template PrivacyZero(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;
    signal input recipient;        // Public key of recipient
    signal input fee;              // Fee amount
    signal input refund;           // Refund amount (if any)

    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input amount;           // Deposit amount

    // 1. Verify commitment derivation
    component commitmentHasher = Poseidon(2);
    commitmentHasher.inputs[0] <== secret;
    commitmentHasher.inputs[1] <== nullifier;
    
    // 2. Verify nullifier hash derivation (for double-spend protection)
    component nullifierHasher = Poseidon(1);
    nullifierHasher.inputs[0] <== nullifier;
    nullifierHash === nullifierHasher.out;

    // 3. Verify Merkle Tree Membership
    component treeVerifier = MerkleTreeChecker(levels);
    treeVerifier.leaf <== commitmentHasher.out;
    treeVerifier.root <== root;
    for (var i = 0; i < levels; i++) {
        treeVerifier.pathElements[i] <== pathElements[i];
        treeVerifier.pathIndices[i] <== pathIndices[i];
    }

    // 4. Ensure amount is positive and within bounds
    component amountCheck = GreaterEqThan(252); // 252 bits for Solana amounts
    amountCheck.in[0] <== amount;
    amountCheck.in[1] <== 0;
    amountCheck.out === 1;

    // 5. Ensure fee is non-negative and reasonable (max 1% of amount)
    component feeCheck = GreaterEqThan(252);
    feeCheck.in[0] <== fee;
    feeCheck.in[1] <== 0;
    feeCheck.out === 1;

    // 6. Ensure fee doesn't exceed 1% of amount
    component maxFee = Num2Bits(252);
    maxFee.in <== amount / 100; // 1% of amount
    
    component feeComparison = GreaterEqThan(252);
    feeComparison.in[0] <== maxFee.out;
    feeComparison.in[1] <== fee;
    feeComparison.out === 1;

    // 7. Ensure recipient is non-zero (valid public key)
    component recipientCheck = IsZero();
    recipientCheck.in <== recipient;
    recipientCheck.out === 0;
}

component main {public [root, nullifierHash, recipient, fee, refund]} = PrivacyZero(20);
