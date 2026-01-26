"use client";

import React from 'react';
import { Shield, ShieldAlert, Cpu, Globe, Loader2 } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

interface HeaderProps {
    score?: number;
    loading: boolean;
    rpcError?: boolean;
}

export const Header = ({ score, loading, rpcError }: HeaderProps) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isHealthy = score === undefined || score >= 80;
    const isCompromised = score !== undefined && score < 50;

    if (!mounted) return (
        <header className="tactical-glass m-4 p-4 flex justify-between items-center bg-black/40 opacity-0 h-20" />
    );

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
                    <h1 className="text-xl font-bold tracking-tight text-glow-cyan font-sans">SolVoid</h1>
                    <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[10px] text-white/40 font-mono">Tactical Privacy Infrastructure</p>
                        <span className="text-white/10">|</span>
                        <span className={`text-[9px] font-medium font-mono px-1.5 py-0.5 rounded ${rpcError ? 'bg-tactical-red/10 text-tactical-red' : 'bg-green-500/10 text-green-500'}`}>
                            {rpcError ? "RPC Error" : "Live"}
                        </span>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex gap-6 items-center">
                <div className="flex items-center gap-2">
                    <Globe className="w-3.5 h-3.5 text-tactical-cyan opacity-70" />
                    <span className="text-xs text-white/60">Network: <span className="text-tactical-cyan font-medium">Secure</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-tactical-purple opacity-70" />
                    <span className="text-xs text-white/60">Encryption: <span className="text-tactical-purple font-medium">Groth16</span></span>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="w-3.5 h-3.5 text-white/30 animate-spin" />
                    ) : isCompromised ? (
                        <ShieldAlert className="w-3.5 h-3.5 text-tactical-red" />
                    ) : (
                        <Shield className="w-3.5 h-3.5 text-tactical-cyan" />
                    )}
                    <span className="text-xs text-white/60">
                        Identity: <span className={isCompromised ? "text-tactical-red font-medium" : "text-white font-medium"}>
                            {loading ? "Scanning..." : score === undefined ? "Unknown" : isHealthy ? "Secure" : "Exposed"}
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
