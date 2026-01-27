use anchor_lang::prelude::*;
use ark_bn254::Fr;
use ark_crypto_primitives::sponge::{
    poseidon::{PoseidonConfig, PoseidonSponge},
    CryptographicSponge,
};
use ark_ff::{BigInteger, PrimeField};

pub struct PoseidonHasher;

impl PoseidonHasher {
    pub fn setup() -> PoseidonSponge<Fr> {
        // circomlib-compatible width = 3 (rate 2 + capacity 1)
        let config = PoseidonConfig::new(
            2,  // rate
            1,  // capacity
            17, // alpha
            vec![], // mds (will be auto-generated)
            vec![], // ark (will be auto-generated)
            8,  // full rounds
            57, // partial rounds (circomlib standard)
        );
        PoseidonSponge::new(&config)
    }

    pub fn hash_two_inputs(left: &[u8; 32], right: &[u8; 32]) -> Result<[u8; 32]> {
        let mut sponge = Self::setup();

        let l = Fr::from_le_bytes_mod_order(left);
        let r = Fr::from_le_bytes_mod_order(right);

        sponge.absorb(&l);
        sponge.absorb(&r);
        let out: Fr = sponge.squeeze_field_elements(1)[0];

        Self::field_to_bytes(&out)
    }

    pub fn hash_with_zero(input: &[u8; 32]) -> Result<[u8; 32]> {
        Self::hash_two_inputs(input, &[0u8; 32])
    }

    pub fn field_to_bytes(field: &Fr) -> Result<[u8; 32]> {
        let mut out = [0u8; 32];
        let bytes = field.into_bigint().to_bytes_le();
        out[..bytes.len()].copy_from_slice(&bytes);
        Ok(out)
    }

    pub fn bytes_to_field(bytes: &[u8; 32]) -> Fr {
        Fr::from_le_bytes_mod_order(bytes)
    }

    pub fn verify_field_compatibility(bytes: &[u8; 32]) -> bool {
        let f = Self::bytes_to_field(bytes);
        Self::field_to_bytes(&f).map(|b| b == *bytes).unwrap_or(false)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_poseidon_hash_consistency() {
        let left = [1u8; 32];
        let right = [2u8; 32];
        
        let hash1 = PoseidonHasher::hash_two_inputs(&left, &right).unwrap();
        let hash2 = PoseidonHasher::hash_two_inputs(&left, &right).unwrap();
        
        assert_eq!(hash1, hash2);
        assert!(PoseidonHasher::verify_field_compatibility(&hash1));
    }

    #[test]
    fn test_hash_with_zero() {
        let input = [42u8; 32];
        let hash1 = PoseidonHasher::hash_with_zero(&input).unwrap();
        let hash2 = PoseidonHasher::hash_with_zero(&input).unwrap();
        
        assert_eq!(hash1, hash2);
        assert!(PoseidonHasher::verify_field_compatibility(&hash1));
    }

    #[test]
    fn test_field_conversion_roundtrip() {
        let original = [123u8; 32];
        let field = PoseidonHasher::bytes_to_field(&original);
        let converted = PoseidonHasher::field_to_bytes(&field).unwrap();
        
        assert_eq!(original, converted);
    }
}
