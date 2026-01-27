pragma circom 2.0.0;

include "circomlib/circuits/poseidon.circom";

// Deposit Circuit - Proves knowledge of secret for commitment
// This circuit is used to prove that the depositor knows the secret
// that corresponds to a commitment, without revealing the secret
template DepositCommitment() {
    // Private inputs
    signal input secret;
    signal input nullifier;

    // Public output
    signal output commitment;

    // commitment = Poseidon(secret, nullifier)
    component hasher = Poseidon(2);
    hasher.inputs[0] <== secret;
    hasher.inputs[1] <== nullifier;
    
    commitment <== hasher.out;
}

component main = DepositCommitment();
