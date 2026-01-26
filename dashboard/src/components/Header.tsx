"use client";

import React from 'react';
import { Shield, ShieldAlert, Cpu, Globe, Loader2 } from 'lucide-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

interface HeaderProps {
    score?: number;
    loading: boolean;
}

export const Header = ({ score, loading }: HeaderProps) => {
    const isHealthy = score === undefined || score >= 80;
    const isCompromised = score !== undefined && score < 50;

    return (
        <header className="glass-panel glow-cyan m-4 p-4 flex justify-between items-center bg-black/40">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <Shield className="text-accent-cyan w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tighter text-glow-cyan">SOLVOID</h1>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-white/50">Tactical Privacy Infrastructure</p>
                </div>
            </div>

            <div className="flex gap-8 items-center">
                <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-accent-cyan" />
                    <span className="text-xs uppercase tracking-wider text-white/70">Network: <span className="text-accent-cyan font-bold">Secure</span></span>
                </div>
                <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-accent-purple" />
                    <span className="text-xs uppercase tracking-wider text-white/70">Encryption: <span className="text-accent-purple font-bold">Groth16</span></span>
                </div>
                <div className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                    ) : isCompromised ? (
                        <ShieldAlert className="w-4 h-4 text-accent-red" />
                    ) : (
                        <Shield className="w-4 h-4 text-accent-cyan" />
                    )}
                    <span className="text-xs uppercase tracking-wider text-white/70">
                        Identity: <span className={isCompromised ? "text-accent-red font-bold" : "text-white font-bold"}>
                            {loading ? "SEARCHING..." : score === undefined ? "UNKNOWN" : isHealthy ? "SECURE" : "EXPOSED"}
                        </span>
                    </span>
                </div>

                <WalletMultiButton />
            </div>

            <style jsx>{`
        .justify-between { justify-content: space-between; }
        .flex { display: flex; }
        .items-center { align-items: center; }
        .gap-3 { gap: 12px; }
        .gap-8 { gap: 32px; }
        .gap-2 { gap: 8px; }
        .m-4 { margin: 16px; }
        .p-4 { padding: 16px; }
        .p-2 { padding: 8px; }
        .bg-cyan-500\/10 { background-color: rgba(0, 240, 255, 0.1); }
        .border-cyan-500\/20 { border-color: rgba(0, 240, 255, 0.2); }
        .text-accent-cyan { color: #00f0ff; }
        .text-accent-purple { color: #b000ff; }
        .text-accent-red { color: #ff003c; }
        .text-white { color: #ffffff; }
        .text-white\/30 { color: rgba(255, 255, 255, 0.3); }
        .text-white\/50 { color: rgba(255, 255, 255, 0.5); }
        .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
        .font-bold { font-weight: 700; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .text-2xl { font-size: 24px; }
        .text-xs { font-size: 12px; }
        .rounded-lg { border-radius: 8px; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </header>
    );
};
