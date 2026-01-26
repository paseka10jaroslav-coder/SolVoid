"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { SolVoidClient } from '../../../sdk/client';

const DEFAULT_PROGRAM_ID = process.env.NEXT_PUBLIC_PROGRAM_ID || "Fg6PaFpoGXkYsidMpSsu3SWJYEHp7rQU9YSTFNDQ4F5i";

export const useSolVoid = (overrideProgramId?: string) => {
    const { connection } = useConnection();
    const wallet = useWallet();
    const { publicKey } = wallet;

    const [passport, setPassport] = useState<any>(null);
    const [leaks, setLeaks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const programId = overrideProgramId || DEFAULT_PROGRAM_ID;

    const client = useMemo(() => {
        // SolVoidClient expects { rpcUrl, programId }, we give it current connection info
        // and the adapter wallet interface.
        return new SolVoidClient({
            rpcUrl: connection.rpcEndpoint,
            programId,
            mock: false
        }, wallet);
    }, [connection.rpcEndpoint, programId, wallet]);

    const scanAddress = useCallback(async (targetAddress: string) => {
        if (!client) return;
        setLoading(true);
        setError(null);
        try {
            const pubkey = new PublicKey(targetAddress);

            // 1. Fetch Forensic Leaks (Live from SDK)
            const results = await client.protect(pubkey);
            setLeaks(results);

            // 2. Fetch Passport Metadata (Live from SDK storage)
            const passportData = await client.getPassport(targetAddress);
            setPassport(passportData);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [client]);

    const executeRescue = useCallback(async () => {
        if (!client || !publicKey) return;
        setLoading(true);
        setError(null);
        try {
            const result = await client.rescue(publicKey);

            // Refresh state after rescue
            const passportData = await client.getPassport(publicKey.toBase58());
            setPassport(passportData);
            await scanAddress(publicKey.toBase58()); // Re-scan to show cleared state

            return result;
        } catch (err: any) {
            setError(err.message);
            console.error("Rescue failed:", err);
        } finally {
            setLoading(false);
        }
    }, [client, publicKey, scanAddress]);

    // Auto-scan whenever a wallet connects
    useEffect(() => {
        if (publicKey) {
            scanAddress(publicKey.toBase58());
        } else {
            setPassport(null);
            setLeaks([]);
        }
    }, [publicKey, scanAddress]);

    return {
        address: publicKey?.toBase58() || null,
        passport,
        leaks,
        loading,
        error,
        scanAddress,
        executeRescue
    };
};
