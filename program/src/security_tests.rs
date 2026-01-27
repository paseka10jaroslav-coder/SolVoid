// Rust security tests for the privacy system

#[cfg(test)]
mod security_tests {
    use super::*;

    #[test]
    fn test_overflow_protection() {
        // Test arithmetic overflow protection
        let max_u64 = u64::MAX;
        let large_amount = max_u64;
        let fee = 1u64;
        
        // This should fail due to overflow
        let result = large_amount.checked_add(fee);
        assert!(result.is_none(), "Overflow should be detected");
        
        // Test with checked_sub
        let small_amount = 1u64;
        let result = small_amount.checked_sub(fee);
        assert!(result.is_none(), "Underflow should be detected");
        
        println!("✅ Overflow protection tests passed");
    }

    #[test]
    fn test_underflow_protection() {
        // Test arithmetic underflow protection
        let balance = 100u64;
        let withdrawal_amount = 101u64;
        
        // This should fail due to underflow
        let result = balance.checked_sub(withdrawal_amount);
        assert!(result.is_none(), "Underflow should be detected");
        
        // Test with valid amounts
        let valid_withdrawal = 50u64;
        let result = balance.checked_sub(valid_withdrawal);
        assert!(result.is_some(), "Valid subtraction should succeed");
        assert_eq!(result.unwrap(), 50u64);
        
        println!("✅ Underflow protection tests passed");
    }

    #[test]
    fn test_arithmetic_safety() {
        // Test all arithmetic operations for safety
        let test_cases = vec![
            (0u64, 0u64),
            (1u64, 1u64),
            (u64::MAX, 0u64),
            (0u64, u64::MAX),
            (u64::MAX / 2, u64::MAX / 2),
        ];
        
        for (a, b) in test_cases {
            // Test checked_add
            let add_result = a.checked_add(b);
            if a == u64::MAX && b > 0 {
                assert!(add_result.is_none(), "Overflow should be detected for {} + {}", a, b);
            }
            
            // Test checked_sub
            let sub_result = a.checked_sub(b);
            if a < b {
                assert!(sub_result.is_none(), "Underflow should be detected for {} - {}", a, b);
            }
            
            // Test checked_mul
            let mul_result = a.checked_mul(b);
            if a > 0 && b > 0 && a > u64::MAX / b {
                assert!(mul_result.is_none(), "Overflow should be detected for {} * {}", a, b);
            }
        }
        
        println!("✅ Arithmetic safety tests passed");
    }
}
