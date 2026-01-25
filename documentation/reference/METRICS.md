# Privacy Metrics & Scoring

SolVoid evaluates your on-chain health using five key dimensions. These metrics determine your overall **Privacy Score (0-100)**.

## 1. Identity Linkage
**Definition**: The direct or indirect connection between your wallet and fixed identities (CEXs, KYC platforms, or social-linked addresses).
- **Critical Risk**: Direct transfer from a Coinbase/Binance deposit address.
- **Medium Risk**: Interaction with a protocol that requires legal names in metadata.

## 2. Metadata Hygiene
**Definition**: Information leaked through non-financial transaction fields.
- **Issues**: Explicit strings in Memo v2, logging "unmasked" public keys, or publishing NFT metadata that includes social handles.

## 3. MEV Resilience
**Definition**: Your footprint in the public mempool and vulnerability to predatory execution bots.
- **Analysis**: Were you sandwiched? Did you use a private RPC? Was the transaction landed via a Jito bundle?
- **Protection**: Using private transaction paths increases this score significantly.

## 4. State Exposure
**Definition**: Your identity being "frozen" into the account data of on-chain programs.
- **Example**: Many DeFi protocols store the "last_user" or "owner" permanently in their state. Our scanner "looks inside" this account data to see where your identity is persisting.

## 5. Anonymity Set
**Definition**: The size of the crowd your assets are hiding in.
- **Calculation**: Based on the depth and volume of the Shadow Vault Merkle trees. Larger sets mean higher anonymity.

---

## Scoring Logic
The score starts at **100** and is reduced by identified leaks:
- **Critical Leak**: -40 points
- **High Leak**: -20 points
- **Medium Leak**: -10 points
- **Low Leak**: -5 points

*A score below 50 is considered "Compromised" and triggers a Surgical Rescue recommendation.*
