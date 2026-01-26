"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Zap, Binary, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface Contribution {
    id: number;
    node: string;
    timestamp: string;
    hash: string;
    entropy: string;
}

export const CeremonyMonitor = () => {
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [isjoining, setIsJoining] = useState(false);
    const [ceremonyStatus, setCeremonyStatus] = useState<'OPEN' | 'FINALIZING' | 'COMPLETED'>('OPEN');

    const generateHash = () => Math.random().toString(16).substring(2, 10) + "...";

    const addContribution = (nodeName: string) => {
        const newC: Contribution = {
            id: contributions.length + 1,
            node: nodeName,
            timestamp: new Date().toLocaleTimeString(),
            hash: "0x" + Math.random().toString(16).substring(2, 64),
            entropy: "POSEIDON_" + generateHash()
        };
        setContributions(prev => [newC, ...prev]);
    };

    const joinCeremony = () => {
        setIsJoining(true);
        // Simulated entropy generation and script call
        setTimeout(() => {
            addContribution("USER_CLIENT_NODE");
            setIsJoining(false);
        }, 3000);
    };

    useEffect(() => {
        // Initial mock data to show activity
        setContributions([
            { id: 2, node: "SolVoid_Core_Alpha", timestamp: "23:14:02", hash: "0x7f4e92b1...", entropy: "BLAKE2b_882c" },
            { id: 1, node: "Genesis_Entropy_Provider", timestamp: "23:00:00", hash: "0x00000000...", entropy: "SYSTEM_GEN" }
        ]);
    }, []);

    return (
        <div className="glass-panel p-6 flex flex-col h-full bg-black/60 relative overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-accent-cyan" />
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-white/90">MPC Trusted Setup Ceremony</h3>
                        <p className="text-[9px] text-white/40 uppercase">Neutralizing Groth16 Toxic Waste</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded border text-[9px] font-bold ${ceremonyStatus === 'OPEN' ? 'border-accent-cyan text-accent-cyan' : 'border-accent-purple text-accent-purple'
                    }`}>
                    [STATUS: {ceremonyStatus}]
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 border border-white/5 bg-white/5 rounded-lg flex flex-col items-center justify-center text-center">
                    <Users className="w-4 h-4 text-accent-cyan mb-1" />
                    <span className="text-[9px] text-white/50 uppercase">Participants</span>
                    <span className="text-sm font-bold text-white">{contributions.length}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/5 rounded-lg flex flex-col items-center justify-center text-center">
                    <Binary className="w-4 h-4 text-accent-purple mb-1" />
                    <span className="text-[9px] text-white/50 uppercase">Total Entropy</span>
                    <span className="text-sm font-bold text-white">4.2 PB</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/5 rounded-lg flex flex-col items-center justify-center text-center">
                    <Zap className="w-4 h-4 text-yellow-500 mb-1" />
                    <span className="text-[9px] text-white/50 uppercase">Security Level</span>
                    <span className="text-sm font-bold text-white">ELITE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 scrollbar-hide">
                <h4 className="text-[10px] uppercase font-bold text-white/40 tracking-widest flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3" /> CONTRIBUTION_LOG
                </h4>
                {contributions.map(c => (
                    <div key={c.id} className="p-3 glass-panel border-white/5 bg-white/5 flex flex-col gap-1 hover:border-accent-cyan/20 transition-all group">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-white/80 group-hover:text-accent-cyan transition-colors">[{c.id}] NODE: {c.node}</span>
                            <span className="text-[8px] text-white/20 font-mono">{c.timestamp}</span>
                        </div>
                        <p className="text-[9px] font-mono text-white/40 truncate">HASH: {c.hash}</p>
                        <p className="text-[8px] text-accent-purple font-bold tracking-tighter">SOURCE: {c.entropy}</p>
                    </div>
                ))}
            </div>

            <div className="space-y-4">
                <p className="text-[10px] text-white/50 italic leading-relaxed">
                    Contributing entropy ensures that no single entity (including the developers) can forge proofs or deanonymize the Shadow Vault.
                    <span className="text-accent-cyan"> Run the script manually or join via tactical node.</span>
                </p>
                <div className="flex gap-4">
                    <button
                        onClick={joinCeremony}
                        disabled={isjoining || ceremonyStatus !== 'OPEN'}
                        className="flex-1 glass-panel py-3 bg-accent-cyan/10 border-accent-cyan/30 text-accent-cyan text-xs font-bold uppercase tracking-widest hover:bg-accent-cyan/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {isjoining ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                INJECTING_ENTROPY...
                            </>
                        ) : (
                            <>JOIN CEREMONY</>
                        )}
                    </button>
                    <button
                        className="px-6 glass-panel py-3 border-white/10 text-white/40 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-all"
                        onClick={() => setCeremonyStatus('FINALIZING')}
                    >
                        VERIFY
                    </button>
                </div>
            </div>

            {/* DECORATIVE ELEMENTS */}
            <div className="absolute -bottom-4 -right-4 opacity-10">
                <ShieldCheck className="w-32 h-32 text-accent-cyan" />
            </div>

            <style jsx>{`
                .glass-panel {
                    background: rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                }
                .text-accent-cyan { color: #00f0ff; }
                .text-accent-purple { color: #b000ff; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};
