# SolVoid Data Flow Documentation

## 🔄 Complete Data Flow Architecture

### 🎯 Overview
SolVoid implements a sophisticated data flow architecture that ensures real-time privacy monitoring, secure transaction processing, and comprehensive analytics while maintaining complete user privacy.

```mermaid
graph TB
    subgraph "User Interaction Layer"
        A[User Interface] --> B[Wallet Connection]
        A --> C[Privacy Actions]
        A --> D[Analytics Dashboard]
        B --> E[Solana Wallets]
        C --> F[Privacy Shield Request]
        D --> G[Real-Time Monitoring]
    end
    
    subgraph "Frontend Processing"
        E --> H[Direct RPC Calls]
        F --> I[Backend API Calls]
        H --> J[Solana Blockchain]
        I --> K[Privacy Engine]
        J --> L[Transaction Data]
        K --> M[ZK Processing]
    end
    
    subgraph "Backend Processing"
        I --> N[SDK Integration]
        L --> O[Privacy Analysis]
        M --> P[ZK Cryptography]
        N --> Q[Smart Contract Calls]
        O --> R[Privacy Scoring]
        P --> S[Proof Generation]
        Q --> T[On-Chain State]
    end
    
    subgraph "Blockchain Layer"
        T --> U[Smart Contracts]
        T --> V[Merkle Trees]
        T --> W[Nullifier Registry]
        U --> X[State Updates]
        V --> Y[Commitment History]
        W --> Z[Privacy Shield Records]
    end
    
    subgraph "Data Analytics"
        X --> AA[Real-Time Metrics]
        L --> AB[Privacy Scores]
        J --> AC[Transaction Analytics]
        AA --> AD[Dashboard Updates]
        AB --> AE[Alert System]
        AC --> AF[Historical Data]
    end
```

## 🔐 Transaction Shielding Flow

### Privacy Shield Generation Process
```mermaid
sequenceDiagram
    participant U as User
    participant W as Wallet
    participant F as Frontend
    participant B as Backend
    participant S as Solana
    participant Z as ZK Circuit
    participant M as Merkle Tree
    
    U->>W: Initiate Shield
    W->>F: Send Shield Request
    F->>B: POST /api/solvoid (shield)
    
    B->>Z: Generate Random Secret
    B->>Z: Generate Random Nullifier
    B->Z: Compute Commitment
    B->Z: Generate Proof
    
    Note over Z: Using Poseidon-3 Hashing
    Z->>B: Return Proof Data
    
    B->>S: Store Commitment
    B->>F: Return Shield Success
    F->>U: Shield Ready Message
```

### ZK Proof Generation
```mermaid
graph TD
    A[Secret (32 bytes)] --> B[Nullifier (32 bytes)]
    A --> C[Poseidon Hash]
    B --> C
    
    C --> D[Amount (bigint)]
    D --> E[Commitment]
    E --> F[Merkle Tree]
    
    F --> G[Merkle Root]
    G --> H[ZK-SNARK Circuit]
    H --> I[Groth16 Proof]
    
    I --> J[Verification]
    J --> K[Proof Ready]
```

## 📊 Real-Time Analytics Flow

### Data Collection Pipeline
```mermaid
graph LR
    subgraph "Data Sources"
        A[Solana RPC] --> B[Transaction Stream]
        A --> C[Account Data]
        A --> D[Network Stats]
    end
    
    subgraph "Processing Engine"
        B --> E[Privacy Scoring]
        C --> F[Pattern Analysis]
        D --> G[Performance Metrics]
        E --> H[Risk Assessment]
        F --> I[Anomaly Detection]
        G --> J[Health Monitoring]
    end
    
    subgraph "Storage & Analytics"
        H --> K[Time-Series Database]
        I --> L[Alert Engine]
        J --> M[Metrics Cache]
        K --> N[Dashboard Updates]
        L --> O[Notification System]
        M --> P[Historical Analytics]
    end
```

### Privacy Score Calculation
```mermaid
graph TD
    A[Transaction Data] --> B[Balance Analysis]
    A --> C[Pattern Detection]
    A --> D[Account Info]
    
    B --> E[Amount Risk Score]
    C --> F[Frequency Analysis]
    D --> G[Data Exposure Score]
    
    E --> H[Privacy Score Reduction]
    F --> I[Score Reduction]
    G --> J[Score Reduction]
    
    H --> K[Base Score: 100]
    I --> L[Adjusted Score]
    J --> M[Final Privacy Score]
    K --> N[Privacy Badge Assignment]
```

## 🔍 Privacy Scanning Flow

### Comprehensive Privacy Analysis
```mermaid
graph TD
    A[Target Address] --> B[Data Collection]
    B --> C[Blockchain Query]
    
    C --> D[Balance Analysis]
    C --> E[Transaction History]
    C --> F[Account Metadata]
    
    D --> G[Amount Risk Assessment]
    E --> H[Pattern Recognition]
    F --> I[Data Exposure Check]
    
    G --> J[Privacy Score Impact]
    H --> K[Behavioral Analysis]
    I --> L[Traceability Risk]
    
    J --> M[Overall Privacy Score]
    K --> N[Recommendations]
    L --> O[Remediation Steps]
    M --> P[Privacy Report]
```

### Vulnerability Detection
```mermaid
graph LR
    subgraph "Analysis Categories"
        A[Balance Exposure] --> B[Large Amount Detection]
        A --> C[Pattern Analysis] --> D[High Frequency]
        A --> E[Data Exposure] --> F[Program Data]
    end
    
    subgraph "Risk Assessment"
        B --> G[Low/Medium/High Risk]
        C --> H[Privacy Score Impact]
        D --> I[Behavioral Pattern]
        E --> J[Traceability Impact]
    end
    
    subgraph "Mitigation Strategies"
        G --> K[Privacy Shielding]
        H --> L[Transaction Mixing]
        I --> M[Timing Randomization]
        J --> N[Data Sanitization]
    end
```

## 🔄 Backend API Data Flow

### API Request Processing
```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API Gateway
    participant B as Privacy Engine
    participant S as Solana SDK
    participant C as Blockchain
    
    F->>A: POST /api/solvoid
    A->>B: Parse Request
    
    alt "Balance Query"
        B->>S: getBalance(publicKey)
        S->>B: Balance Response
        B->>A: Return Balance
    end
    
    alt "Privacy Scan"
        B->>S: getAccountInfo(publicKey)
        B->S: getSignaturesForAddress(publicKey)
        B->S: getBalance(publicKey)
        S->>B: Complete Data
        B->C: Analyze Privacy
        C->B: Privacy Results
        B->>A: Return Analysis
    end
    
    alt "Shield Generation"
        B->S: Generate Commitment
        B->Z: Generate ZK Proof
        B->S: Store Commitment
        B->A: Return Shield Data
    end
```

### SDK Integration
```mermaid
graph LR
    subgraph "API Layer"
        A[Next.js API] --> B[Request Router]
        B --> C[Action Handler]
        C --> D[Privacy Engine]
    end
    
    subgraph "Business Logic"
        D --> E[SolVoidClient]
        E --> F[Privacy Pipeline]
        E --> G[Passport Manager]
        F --> H[Transaction Analysis]
        G --> I[Privacy Scoring]
    end
    
    subgraph "Blockchain Layer"
        H --> J[Solana Connection]
        J --> K[Smart Contract]
        K --> L[On-State]
        F --> M[ZK Circuits]
        I --> N[Proof Generation]
    end
```

## 📈 Analytics Data Storage

### Real-Time Metrics Storage
```mermaid
graph TB
    subgraph "Collection Layer"
        A[Solana Events] --> B[Event Stream]
        B --> C[Real-Time Processor]
        C --> D[Metric Aggregator]
    end
    
    subgraph "Processing Layer"
        D --> E[Privacy Scores]
        D --> F[Risk Assessments]
        D --> G[Network Stats]
        D --> H[Transaction Patterns]
    end
    
    subgraph "Storage Layer"
        E --> I[Time-Series DB]
        F --> J[Alert Cache]
        G --> K[Metrics Cache]
        H --> L[Analytics API]
    end
    
    subgraph "Presentation Layer"
        I --> M[Dashboard UI]
        J --> N[Real-Time Updates]
        K --> O[Mobile App]
        L --> P[Email Alerts]
    end
```

### Historical Data Management
```mermaid
graph LR
    subgraph "Data Collection"
        A[Current Metrics] --> B[Time-Series Storage]
        B --> C[Historical Database]
        C --> D[Trend Analysis]
    end
    
    subgraph "Data Processing"
        D --> E[Aggregation Engine]
        E --> F[Statistical Analysis]
        F --> G[Pattern Recognition]
        G --> H[Predictive Analytics]
    end
    
    subgraph "Data Presentation"
        H --> I[Historical Charts]
        I --> J[Trend Visualization]
        J --> K[Comparative Analysis]
        K --> L[Executive Dashboard]
    end
```

## 🚨 Error Handling & Recovery

### Error Propagation Flow
```mermaid
graph TD
    subgraph "Frontend Errors"
        A[User Action] --> B[Error Detection]
        B --> C[Error Classification]
        C --> D[User Notification]
        C --> E[Retry Logic]
        C --> F[Fallback Mechanism]
    end
    
    subgraph "Backend Errors"
        E[API Request] --> F[Error Catching]
        F --> G[Error Logging]
        G --> H[Error Classification]
        H --> I[Alert System]
        H --> J[Automatic Recovery]
        I --> K[Manual Intervention]
    end
    
    subgraph "Blockchain Errors"
        J[RPC Call] --> K[Network Issues]
        K --> L[Retry Mechanism]
        L --> M[Backup RPC Pool]
        M --> N[Success/Failure]
    end
```

### Recovery Mechanisms
```mermaid
graph LR
    subgraph "Connection Recovery"
        A[Primary RPC] --> B[Health Check]
        B --> C[Connection Status]
        C --> D[Backup RPC Pool]
        D --> E[Failover Logic]
        E --> F[Service Restoration]
    end
    
    subgraph "Data Recovery"
        G[Transaction Failure] --> H[Rollback Logic]
        H --> I[State Restoration]
        I --> J[User Notification]
        J --> K[Manual Recovery]
    end
    
    subgraph "Service Recovery"
        L[Backend Failure] --> M[Health Monitoring]
        M --> N[Auto-Scaling]
        N --> O[Service Restart]
        O --> P[Service Restoration]
    end
```

This comprehensive data flow documentation illustrates how SolVoid handles real-time data processing, privacy analysis, and secure transaction processing while maintaining complete user privacy and system reliability.
