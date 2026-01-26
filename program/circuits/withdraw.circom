pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";
include "merkleTree.circom";

// PrivacyZero Core Circuit
// Proves: I know (secret, nullifier) such that:
// 1. Poseidon(secret, nullifier) == commitment
// 2. commitment exists in Merkle Tree with given root and path
template PrivacyZero(levels) {
    // Public inputs
    signal input root;
    signal input nullifierHash;

    // Private inputs
    signal input secret;
    signal input nullifier;
    signal input pathElements[levels];
    signal input pathIndices[levels];

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
}

component main {public [root, nullifierHash]} = PrivacyZero(20);
