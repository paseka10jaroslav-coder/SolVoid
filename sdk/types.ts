
export type LeakType =
    | "identity"
    | "metadata"
    | "state-leak"
    | "cpi-linkage";

export type VisibilityScope = "PUBLIC" | "PROGRAM" | "LOCAL";

export interface Leak {
    type: LeakType;
    scope: string; // Detail scope (e.g. 'funding', 'ata_link')
    visibility: VisibilityScope;
    description: string;
    remediation?: string;
    severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
    programName?: string;
}

export interface GovernanceResult {
    status: "SURFACE_SCAN_PASSED" | "REGRESSION";
    unacceptedLiabilities: { leak: Leak; reason: string }[];
    remediationHints: string[];
    privacyScore: number;
}

export interface TransactionJSON {
    message: {
        accountKeys: string[];
        header: {
            numRequiredSignatures: number;
        };
        instructions: {
            programIdIndex: number;
            accounts: number[];
            data: string;
        }[];
    };
    meta?: {
        innerInstructions?: {
            index: number;
            instructions: {
                programIdIndex: number;
                accounts: number[];
                data: string;
            }[];
        }[];
        logMessages?: string[];
    };
    signatures: string[];
}

export interface GeyserTransactionEvents {
    signature: string;
    accountUpdates: {
        pubkey: string;
        data: string;
    }[];
}
