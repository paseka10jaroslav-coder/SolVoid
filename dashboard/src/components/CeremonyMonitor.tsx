"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Zap, Binary, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

    const addContribution = (nodeName: string) => {
        const newC: Contribution = {
            id: contributions.length + 1,
            node: nodeName,
            timestamp: new Date().toLocaleTimeString(),
            hash: "0x" + Math.random().toString(16).substring(2, 64),
            entropy: "POSEIDON_" + Math.random().toString(16).substring(2, 8)
        };
        setContributions(prev => [newC, ...prev]);
    };

    const joinCeremony = () => {
        setIsJoining(true);
        setTimeout(() => {
            addContribution("USER_CLIENT_NODE");
            setIsJoining(false);
        }, 3000);
    };

    useEffect(() => {
        setContributions([
            { id: 2, node: "SolVoid_Core_Alpha", timestamp: "23:14:02", hash: "0x7F4E92B1C83D5A6E...", entropy: "BLAKE2b_882c" },
            { id: 1, node: "Genesis_Provider", timestamp: "23:00:00", hash: "0x0000000000000000...", entropy: "SYSTEM_GEN" }
        ]);
    }, []);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col h-full bg-black/40 relative overflow-hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-tactical-cyan" />
                    <div>
                        <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/90 font-mono">Ceremony Monitor</h3>
                        <p className="text-[9px] text-white/30 uppercase font-mono tracking-widest mt-0.5">Neutralizing Toxic Waste</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded border text-[8px] font-bold font-mono tracking-widest ${ceremonyStatus === 'OPEN' ? 'border-tactical-cyan/40 text-tactical-cyan' : 'border-tactical-purple/40 text-tactical-purple'
                    }`}>
                    [STATE_{ceremonyStatus}]
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center">
                    <Users className="w-5 h-5 text-tactical-cyan mb-1.5 opacity-50" />
                    <span className="text-[9px] text-white/30 uppercase font-mono tracking-tighter">Nodes</span>
                    <span className="text-sm font-bold text-white font-sans">{contributions.length}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center">
                    <Binary className="w-5 h-5 text-tactical-purple mb-1.5 opacity-50" />
                    <span className="text-[9px] text-white/30 uppercase font-mono tracking-tighter">Entropy</span>
                    <span className="text-sm font-bold text-white font-sans">4.2 PB</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center">
                    <Zap className="w-5 h-5 text-amber-500 mb-1.5 opacity-50" />
                    <span className="text-[9px] text-white/30 uppercase font-mono tracking-tighter">Security</span>
                    <span className="text-xs font-bold text-white uppercase font-mono tracking-widest mt-1">Elite</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6 scrollbar-hide">
                <h4 className="text-[9px] uppercase font-bold text-white/20 tracking-[0.4em] flex items-center gap-2 font-mono ml-1">
                    <CheckCircle2 className="w-3 h-3 text-tactical-cyan opacity-40" /> CONTRIBUTION_LEDGER
                </h4>
                <div className="space-y-2">
                    <AnimatePresence>
                        {contributions.map(c => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg border border-white/5 bg-white/5 flex flex-col gap-1 transition-all group"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-bold text-white/70 group-hover:text-tactical-cyan transition-colors font-mono">[{c.id}] NODE_{c.node}</span>
                                    <span className="text-[8px] text-white/20 font-mono tracking-widest">{c.timestamp}</span>
                                </div>
                                <p className="text-[9px] font-mono text-white/30 truncate uppercase opacity-60 tracking-tight">HASH: {c.hash}</p>
                                <p className="text-[8px] text-tactical-purple font-bold tracking-[0.2em] font-mono uppercase mt-1">Entropy: {c.entropy}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={joinCeremony}
                        disabled={isjoining || ceremonyStatus !== 'OPEN'}
                        className="flex-1 py-3 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-tactical-cyan/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 font-mono rounded-lg outline-none"
                    >
                        {isjoining ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                INJECTING_ENTROPY...
                            </>
                        ) : (
                            <>JOIN CEREMONY</>
                        )}
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        className="px-6 py-3 border border-white/10 text-white/30 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-white/5 transition-all font-mono rounded-lg outline-none"
                    >
                        VERIFY
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};
