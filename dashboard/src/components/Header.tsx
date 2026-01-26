"use client";

import React from 'react';
import { Shield, ShieldAlert, Cpu, Globe, Loader2 } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

interface HeaderProps {
    score?: number;
    loading: boolean;
}

export const Header = ({ score, loading }: HeaderProps) => {
    const isHealthy = score === undefined || score >= 80;
    const isCompromised = score !== undefined && score < 50;

    return (
        <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="tactical-glass glow-cyan m-4 p-4 flex justify-between items-center bg-black/40 relative z-50"
        >
            <div className="flex items-center gap-3">
                <div className="p-2 bg-tactical-cyan/10 rounded-lg border border-tactical-cyan/20">
                    <Shield className="text-tactical-cyan w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-glow-cyan font-sans">SOLVOID</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-mono">Tactical Privacy Infrastructure</p>
                </div>
            </div>

            <div className="hidden lg:flex gap-8 items-center">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-tactical-cyan" />
                    <span className="text-[10px] uppercase tracking-wider text-white/70">Network: <span className="text-tactical-cyan font-bold">Secure</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-tactical-purple" />
                    <span className="text-[10px] uppercase tracking-wider text-white/70">Encryption: <span className="text-tactical-purple font-bold">Groth16</span></span>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                    ) : isCompromised ? (
                        <ShieldAlert className="w-4 h-4 text-tactical-red" />
                    ) : (
                        <Shield className="w-4 h-4 text-tactical-cyan" />
                    )}
                    <span className="text-[10px] uppercase tracking-wider text-white/70">
                        Identity: <span className={isCompromised ? "text-tactical-red font-bold" : "text-white font-bold"}>
                            {loading ? "SEARCHING..." : score === undefined ? "UNKNOWN" : isHealthy ? "SECURE" : "EXPOSED"}
                        </span>
                    </span>
                </div>

                <div className="scale-90 origin-right">
                    <WalletMultiButton />
                </div>
            </div>
        </motion.header>
    );
};
