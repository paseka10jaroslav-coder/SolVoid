"use client";

import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ForensicFeedProps {
    leaks: any[];
    onRescue: () => void;
    loading: boolean;
}

export const ForensicFeed = ({ leaks, onRescue, loading }: ForensicFeedProps) => {
    const allLeaks = leaks.flatMap(r => r.leaks.map((l: any) => ({ ...l, sig: r.signature })));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="tactical-glass p-6 h-[600px] flex flex-col relative overflow-hidden"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-tactical-cyan" />
                    <h3 className="text-sm font-semibold text-white/80">Forensic Feed</h3>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="w-3 h-3 text-tactical-cyan animate-spin" />}
                    <span className="text-[10px] text-tactical-cyan border border-tactical-cyan/20 px-2 py-0.5 rounded font-mono">
                        {loading ? 'Analyzing...' : 'Live'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {allLeaks.length === 0 && !loading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="h-full flex flex-col items-center justify-center text-center opacity-30"
                        >
                            <ShieldCheck className="w-10 h-10 mb-4 text-tactical-cyan" />
                            <p className="text-sm font-medium text-white/50">No active threats detected</p>
                            <p className="text-xs text-white/30 mt-1">Connect a wallet or enter an address to scan</p>
                        </motion.div>
                    )}

                    {allLeaks.map((leak, idx) => (
                        <motion.div
                            key={`${leak.sig}-${idx}`}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="tactical-glass p-4 border-white/5 hover:border-tactical-cyan/30 transition-colors cursor-default group bg-white/[0.02]"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-mono text-white/40 group-hover:text-tactical-cyan/70 transition-colors">{leak.sig.slice(0, 16)}...</span>
                                <span className="text-[9px] font-semibold px-2 py-0.5 rounded bg-tactical-red/10 text-tactical-red">{leak.severity}</span>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 p-2 rounded-lg bg-tactical-red/5 border border-tactical-red/10">
                                    <AlertTriangle className="w-3.5 h-3.5 text-tactical-red" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white/90">{leak.type} Leak Detected</p>
                                    <p className="text-xs text-white/50 leading-relaxed mt-1">{leak.description}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {allLeaks.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onRescue}
                    disabled={loading}
                    className="mt-6 w-full py-3.5 bg-tactical-red/10 border border-tactical-red/30 text-tactical-red text-xs font-semibold hover:bg-tactical-red/20 transition-all glow-red disabled:opacity-50 rounded-lg outline-none"
                >
                    {loading ? "Executing Recovery..." : `Execute Rescue (${allLeaks.length} issues)`}
                </motion.button>
            )}
        </motion.div>
    );
};
