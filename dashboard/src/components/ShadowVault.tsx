"use client";

import React from 'react';
import { Database, Lock, Unlock, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShadowVaultProps {
    commitments: any[];
}

export const ShadowVault = ({ commitments }: ShadowVaultProps) => {
    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col h-full bg-black/40 border-tactical-purple/10"
        >
            <div className="flex items-center gap-3 mb-6">
                <Database className="w-4 h-4 text-tactical-cyan" />
                <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 font-mono">Shadow Vault: Nodes</h3>
            </div>

            <div className="space-y-6 flex-1">
                <div className="p-4 rounded-xl border border-tactical-cyan/10 bg-tactical-cyan/[0.02]">
                    <div className="flex items-center gap-2 mb-3">
                        <Hash className="w-3 h-3 text-tactical-cyan opacity-50" />
                        <span className="text-[9px] uppercase font-bold text-white/30 tracking-widest font-mono">Merkle Root</span>
                    </div>
                    <p className="text-[9px] font-mono text-tactical-cyan/60 break-all leading-relaxed">
                        {commitments.length > 0 ? "0x7F4E92B1...SYNCED" : "UNINITIALIZED_STATE_WAITING_FOR_LEAVES"}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="tactical-glass p-4 flex flex-col items-center justify-center text-center border-white/5">
                        <Lock className="w-6 h-6 text-tactical-purple mb-2 opacity-50" />
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Anonymity Set</span>
                        <span className="text-lg font-bold text-white font-sans tracking-tight">{commitments.length > 0 ? "1,024,512" : "0"}</span>
                    </div>
                    <div className="tactical-glass p-4 flex flex-col items-center justify-center text-center border-white/5">
                        <Unlock className="w-6 h-6 text-tactical-cyan mb-2 opacity-50" />
                        <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em] font-mono">Protected</span>
                        <span className="text-lg font-bold text-white font-sans tracking-tight">{commitments.length}</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-[9px] uppercase font-bold text-white/30 tracking-[0.3em] font-mono">Active ZK-Notes</h4>
                    {commitments.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.01]">
                            <p className="text-[9px] uppercase text-white/20 font-mono tracking-widest leading-relaxed px-4">No active commitments found in current vault state</p>
                        </div>
                    ) : (
                        commitments.map((c, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ x: 4 }}
                                className="tactical-glass p-3 border-tactical-purple/20 bg-tactical-purple/[0.05] flex justify-between items-center group cursor-pointer"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-tactical-purple animate-pulse shadow-[0_0_8px_rgba(176,0,255,0.8)]"></div>
                                    <span className="text-[10px] font-mono text-white/60 tracking-tighter">Note_{c.slice(0, 10)}...</span>
                                </div>
                                <span className="text-[8px] font-bold text-tactical-purple group-hover:text-white transition-colors uppercase font-mono">Active</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 w-full py-3 border border-tactical-cyan/30 text-tactical-cyan text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-tactical-cyan/10 transition-all font-mono rounded-lg outline-none"
            >
                Commit Entropy
            </motion.button>
        </motion.div>
    );
};
