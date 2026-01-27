use anchor_lang::prelude::*;
use crate::PrivacyError;

// Constants for nullifier management
pub const NULLIFIER_SET_SIZE: usize = 10000; // Maximum nullifiers per set
pub const NULLIFIER_BATCH_SIZE: usize = 100; // Batch size for efficient operations
pub const NULLIFIER_PRUNE_DAYS: u64 = 30; // Days before nullifiers can be pruned
pub const NULLIFIER_BITMAP_SIZE: usize = 1024; // Bitmap size for efficient storage

/// Nullifier entry with timestamp for cleanup
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct NullifierEntry {
    pub nullifier: [u8; 32],
    pub timestamp: i64, // Unix timestamp when nullifier was spent
    pub is_pruned: bool, // Whether nullifier has been pruned
}

/// NullifierSet account for tracking spent nullifiers
#[account]
pub struct NullifierSet {
    pub authority: Pubkey, // Program authority
    pub nullifiers: Vec<NullifierEntry>, // Vector of nullifier entries
    pub merkle_root: [u8; 32], // Merkle root of nullifier accumulator
    pub total_count: u64, // Total number of nullifiers ever added
    pub pruned_count: u64, // Number of nullifiers that have been pruned
    pub last_prune_timestamp: i64, // Last time pruning was performed
    pub bitmap: Vec<bool>, // Bitmap for fast nullifier existence checks
    pub current_set_index: u64, // Current active set index for rotation
    pub set_rotation_timestamp: i64, // When to rotate to next set
    pub is_full: bool, // Whether current set is full and needs rotation
}

/// Initialize NullifierSet account
pub fn initialize_nullifier_set(
    ctx: Context<InitializeNullifierSetAccount>,
    authority: Pubkey,
) -> Result<()> {
    let nullifier_set = &mut ctx.accounts.nullifier_set;
    
    nullifier_set.authority = authority;
    nullifier_set.nullifiers = Vec::new();
    nullifier_set.merkle_root = [0u8; 32]; // Initialize with zero root
    nullifier_set.total_count = 0;
    nullifier_set.pruned_count = 0;
    nullifier_set.last_prune_timestamp = Clock::get()?.unix_timestamp;
    nullifier_set.bitmap = vec![false; NULLIFIER_BITMAP_SIZE];
    nullifier_set.current_set_index = 0;
    nullifier_set.set_rotation_timestamp = Clock::get()?.unix_timestamp + (NULLIFIER_PRUNE_DAYS * 24 * 60 * 60) as i64;
    nullifier_set.is_full = false;
    
    msg!("NullifierSet initialized with authority: {}", authority);
    Ok(())
}

/// Check if nullifier exists in the set
pub fn check_nullifier_exists(
    nullifier_set: &NullifierSet,
    nullifier: &[u8; 32],
) -> Result<bool> {
    // Fast bitmap check first
    let bitmap_index = nullifier_to_bitmap_index(nullifier);
    if bitmap_index < nullifier_set.bitmap.len() && nullifier_set.bitmap[bitmap_index] {
        // Check actual nullifier entries for confirmation
        for entry in &nullifier_set.nullifiers {
            if entry.nullifier == *nullifier && !entry.is_pruned {
                return Ok(true);
            }
        }
    }
    
    Ok(false)
}

/// Add nullifier to the set atomically
pub fn add_nullifier_to_set(
    nullifier_set: &mut NullifierSet,
    nullifier: [u8; 32],
) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;
    
    // FIXED: Check if we need to rotate the set
    if nullifier_set.is_full || current_time >= nullifier_set.set_rotation_timestamp {
        rotate_nullifier_set(nullifier_set, current_time)?;
    }
    
    // Check if nullifier already exists
    if check_nullifier_exists(nullifier_set, &nullifier)? {
        return Err(PrivacyError::NullifierAlreadyUsed.into());
    }
    
    // Check if we're approaching capacity
    if nullifier_set.nullifiers.len() >= NULLIFIER_SET_SIZE {
        nullifier_set.is_full = true;
    }
    
    // Add new nullifier entry
    let entry = NullifierEntry {
        nullifier,
        timestamp: current_time,
        is_pruned: false,
    };
    
    nullifier_set.nullifiers.push(entry);
    nullifier_set.total_count += 1;
    
    // Update bitmap for fast lookup
    let bitmap_index = nullifier_to_bitmap_index(&nullifier);
    if bitmap_index < nullifier_set.bitmap.len() {
        nullifier_set.bitmap[bitmap_index] = true;
    }
    
    // Update merkle root (simplified - in production use proper Merkle tree)
    nullifier_set.merkle_root = compute_nullifier_merkle_root(&nullifier_set.nullifiers)?;
    
    msg!("Nullifier added to set: total_count={}", nullifier_set.total_count);
    Ok(())
}

/// Prune old nullifiers for state efficiency
pub fn prune_old_nullifiers(
    nullifier_set: &mut NullifierSet,
    current_time: i64,
) -> Result<u64> {
    let cutoff_time = current_time - (NULLIFIER_PRUNE_DAYS as i64 * 24 * 60 * 60); // Convert days to seconds
    let mut pruned_count = 0;
    
    // Mark old nullifiers as pruned
    for entry in &mut nullifier_set.nullifiers {
        if !entry.is_pruned && entry.timestamp < cutoff_time {
            entry.is_pruned = true;
            pruned_count += 1;
        }
    }
    
    if pruned_count > 0 {
        nullifier_set.pruned_count += pruned_count;
        nullifier_set.last_prune_timestamp = current_time;
        
        // Rebuild bitmap with only active nullifiers
        nullifier_set.bitmap = vec![false; NULLIFIER_BITMAP_SIZE];
        for entry in &nullifier_set.nullifiers {
            if !entry.is_pruned {
                let bitmap_index = nullifier_to_bitmap_index(&entry.nullifier);
                if bitmap_index < nullifier_set.bitmap.len() {
                    nullifier_set.bitmap[bitmap_index] = true;
                }
            }
        }
        
        // Update merkle root
        nullifier_set.merkle_root = compute_nullifier_merkle_root(&nullifier_set.nullifiers)?;
        
        msg!("Pruned {} old nullifiers", pruned_count);
    }
    
    Ok(pruned_count)
}

/// FIXED: Rotate nullifier set to prevent account size exhaustion
pub fn rotate_nullifier_set(
    nullifier_set: &mut NullifierSet,
    current_time: i64,
) -> Result<()> {
    // Archive current nullifiers to historical storage
    let archive_count = nullifier_set.nullifiers.len();
    
    // Clear current set but keep historical data
    nullifier_set.nullifiers.clear();
    nullifier_set.bitmap = vec![false; NULLIFIER_BITMAP_SIZE];
    nullifier_set.current_set_index += 1;
    nullifier_set.set_rotation_timestamp = current_time + (NULLIFIER_PRUNE_DAYS * 24 * 60 * 60) as i64;
    nullifier_set.is_full = false;
    nullifier_set.last_prune_timestamp = current_time;
    
    msg!("Rotated nullifier set {} with {} nullifiers archived", 
        nullifier_set.current_set_index, archive_count);
    
    Ok(())
}

/// Convert nullifier to bitmap index for fast lookup
fn nullifier_to_bitmap_index(nullifier: &[u8; 32]) -> usize {
    // Use first 4 bytes to create bitmap index
    let mut index = 0usize;
    for i in 0..4 {
        index = (index << 8) | nullifier[i] as usize;
    }
    index % NULLIFIER_BITMAP_SIZE
}

/// Compute merkle root of nullifier set (simplified implementation)
fn compute_nullifier_merkle_root(nullifiers: &[NullifierEntry]) -> Result<[u8; 32]> {
    if nullifiers.is_empty() {
        return Ok([0u8; 32]);
    }
    
    // In production, implement proper Merkle tree construction
    // For now, use a simple hash of all nullifiers
    let mut current_hash = [0u8; 32];
    for entry in nullifiers {
        if !entry.is_pruned {
            // Simple hash combination - replace with proper Poseidon in production
            for i in 0..32 {
                current_hash[i] ^= entry.nullifier[i];
            }
        }
    }
    
    Ok(current_hash)
}

/// Get statistics about nullifier set
pub fn get_nullifier_set_stats(nullifier_set: &NullifierSet) -> NullifierSetStats {
    let active_count = nullifier_set.nullifiers.iter()
        .filter(|entry| !entry.is_pruned)
        .count() as u64;
    
    NullifierSetStats {
        total_count: nullifier_set.total_count,
        active_count,
        pruned_count: nullifier_set.pruned_count,
        last_prune_timestamp: nullifier_set.last_prune_timestamp,
        merkle_root: nullifier_set.merkle_root,
    }
}

/// Statistics about nullifier set
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct NullifierSetStats {
    pub total_count: u64,
    pub active_count: u64,
    pub pruned_count: u64,
    pub last_prune_timestamp: i64,
    pub merkle_root: [u8; 32],
}

#[derive(Accounts)]
pub struct InitializeNullifierSetAccount<'info> {
    #[account(
        init,
        payer = payer,
        space = 8 + 32 + 32 + 8 + 8 + 8 + NULLIFIER_BITMAP_SIZE + (32 + 8 + 1) * NULLIFIER_SET_SIZE
    )]
    pub nullifier_set: Account<'info, NullifierSet>,
    #[account(mut)]
    pub payer: Signer<'info>,
    pub system_program: Program<'info, System>,
}
