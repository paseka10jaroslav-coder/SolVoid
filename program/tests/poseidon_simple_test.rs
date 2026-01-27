// Simple standalone Poseidon test
use ark_bn254::{Bn254, Fr as Bn254Fr};
use ark_ff::{Field, PrimeField};
use ark_crypto_primitives::sponge::poseidon::{PoseidonSponge, CryptographicSponge};

#[test]
fn test_poseidon_hash_simple() {
    let inputs_str = std::env::var("TEST_INPUTS").unwrap_or_else(|_| "123,456".to_string());
    let inputs: Vec<u64> = inputs_str
        .split(',')
        .map(|s| s.trim().parse().unwrap())
        .collect();

    // Try different parameter configurations
    let configs = vec![
        // Configuration 1: Basic
        ark_crypto_primitives::sponge::poseidon::PoseidonConfig::new(
            2,  // rate
            1,  // capacity
            1,  // alpha
            8,  // full rounds
            57, // partial rounds
            0,  // security key
        ),
        // Configuration 2: Circomlib compatible
        ark_crypto_primitives::sponge::poseidon::PoseidonConfig::new(
            2,  // rate
            1,  // capacity
            17, // alpha
            8,  // full rounds
            57, // partial rounds
            0,  // security key
        ),
    ];

    for (i, config) in configs.iter().enumerate() {
        let mut poseidon = PoseidonSponge::<Bn254>::new(config);
        
        // Convert inputs to field elements and absorb
        let field_inputs: Vec<Bn254Fr> = inputs.iter()
            .map(|&x| Bn254Fr::from(x))
            .collect();
        
        poseidon.absorb(&field_inputs);
        
        // Squeeze result
        let result = poseidon.squeeze_field_elements(1)[0];
        
        // Convert to hex string
        let result_bytes = result.into_bigint().to_bytes_le();
        let mut hex_string = String::from("0x");
        for byte in result_bytes.iter().rev() {
            hex_string.push_str(&format!("{:02x}", byte));
        }
        
        // Pad to 64 hex chars (32 bytes)
        while hex_string.len() < 66 {
            hex_string.push('0');
        }
        
        println!("Rust Poseidon Config {} ({:?}) = {}", i + 1, inputs, hex_string);
        
        // For the basic test, just ensure deterministic output
        let mut poseidon2 = PoseidonSponge::<Bn254>::new(config);
        poseidon2.absorb(&field_inputs);
        let result2 = poseidon2.squeeze_field_elements(1)[0];
        assert_eq!(result, result2);
    }
}
