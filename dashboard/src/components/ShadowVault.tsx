"use client";

import React from 'react';
import { Database, Lock, Unlock, Hash } from 'lucide-react';

interface ShadowVaultProps {
    commitments: any[];
}

export const ShadowVault = ({ commitments }: ShadowVaultProps) => {
    return (
        <div className="glass-panel p-6 flex flex-col h-full bg-black/20">
            <div className="flex items-center gap-2 mb-6">
                <Database className="w-4 h-4 text-accent-cyan" />
                <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Shadow Vault: ZK-Nodes</h3>
            </div>

            <div className="space-y-6 flex-1">
                <div className="p-4 glass-panel border-accent-cyan/10">
                    <div className="flex items-center gap-2 mb-4">
                        <Hash className="w-3 h-3 text-accent-cyan" />
                        <span className="text-[10px] uppercase font-bold text-white/50">Current Merkle Root</span>
                    </div>
                    <p className="text-[10px] font-mono text-accent-cyan break-all">
                        {commitments.length > 0 ? "0x7f4e...SYNCED" : "UNINITIALIZED_ROOT_WAITING_FOR_STATE"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
                        <Lock className="w-6 h-6 text-accent-purple mb-2" />
                        <span className="text-[10px] font-bold text-white/50 uppercase">Anonymity Set</span>
                        <span className="text-lg font-bold text-white">{commitments.length > 0 ? "1,024,512" : "0"}</span>
                    </div>
                    <div className="glass-panel p-4 flex flex-col items-center justify-center text-center">
                        <Unlock className="w-6 h-6 text-accent-cyan mb-2" />
                        <span className="text-[10px] font-bold text-white/50 uppercase">Active Shields</span>
                        <span className="text-lg font-bold text-white">{commitments.length}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Active ZK-Notes</h4>
                    {commitments.length === 0 ? (
                        <div className="py-8 text-center border border-dashed border-white/5 rounded-lg">
                            <p className="text-[10px] uppercase text-white/20">No active commitments found in local state</p>
                        </div>
                    ) : (
                        commitments.map((c, i) => (
                            <div key={i} className="glass-panel p-3 border-accent-purple/20 bg-accent-purple/5 flex justify-between items-center group cursor-pointer hover:bg-accent-purple/10 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-accent-purple animate-pulse"></div>
                                    <span className="text-[10px] font-mono text-white/70">Note_{c.slice(0, 8)}...</span>
                                </div>
                                <span className="text-[8px] font-bold text-accent-purple group-hover:text-white transition-colors">ACTIVE</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <button className="mt-6 w-full glass-panel py-3 border-accent-cyan/20 text-accent-cyan text-xs font-bold uppercase tracking-widest hover:bg-accent-cyan/10 transition-all">
                Generate New Commitment
            </button>

            <style jsx>{`
        .p-6 { padding: 24px; }
        .p-4 { padding: 16px; }
        .p-3 { padding: 12px; }
        .py-8 { padding-top: 32px; padding-bottom: 32px; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .grid { display: grid; }
        .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .items-center { align-items: center; }
        .justify-center { justify-content: center; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .mb-4 { margin-bottom: 16px; }
        .mb-2 { margin-bottom: 8px; }
        .mb-6 { margin-bottom: 24px; }
        .mt-6 { margin-top: 24px; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .text-lg { font-size: 18px; }
        .text-accent-cyan { color: #00f0ff; }
        .text-accent-purple { color: #b000ff; }
        .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
        .text-white\/50 { color: rgba(255, 255, 255, 0.5); }
        .text-white\/40 { color: rgba(255, 255, 255, 0.4); }
        .text-white\/20 { color: rgba(255, 255, 255, 0.2); }
        .bg-black\/20 { background-color: rgba(0, 0, 0, 0.2); }
        .bg-accent-purple\/5 { background-color: rgba(176, 0, 255, 0.05); }
        .border-accent-cyan\/10 { border-color: rgba(0, 240, 255, 0.1); }
        .border-accent-cyan\/20 { border-color: rgba(0, 240, 255, 0.2); }
        .border-accent-purple\/20 { border-color: rgba(176, 0, 255, 0.2); }
        .border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-dashed { border-style: dashed; }
        .rounded-lg { border-radius: 8px; }
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .break-all { word-break: break-all; }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
        </div>
    );
};
