"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Binary, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus, ForensicEvent } from 'solvoid';

interface Contribution {
    id: string;
    node: string;
    timestamp: string;
    hash: string;
    type: string;
}

export const CeremonyMonitor = () => {
    const [mounted, setMounted] = useState(false);
    const [contributions, setContributions] = useState<Contribution[]>([]);
    const [ceremonyStatus, setCeremonyStatus] = useState<'WAITING' | 'ACTIVE' | 'COMPLETE'>('WAITING');

    useEffect(() => {
        setMounted(true);
    }, []);

    // Subscribe to real SDK events for ceremony/proof activity
    useEffect(() => {
        if (!mounted) return;

        const handleEvent = (event: ForensicEvent) => {
            // Track proof and commitment events as "contributions"
            if (event.type === 'PROOF_GENERATED' || event.type === 'COMMITMENT_CREATED' || event.type === 'RELAY_BROADCAST') {
                const newContribution: Contribution = {
                    id: `contrib-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    node: event.type === 'PROOF_GENERATED' ? 'ZK_Prover' :
                        event.type === 'COMMITMENT_CREATED' ? 'Commitment_Engine' : 'Shadow_Relay',
                    timestamp: event.timestamp.toLocaleTimeString(),
                    hash: event.hex || event.data?.commitment as string || 'Internal',
                    type: event.type
                };
                setContributions(prev => [newContribution, ...prev].slice(0, 20));
                setCeremonyStatus('ACTIVE');
            }
        };

        const unsubscribe = EventBus.onAll(handleEvent);
        return () => unsubscribe();
    }, [mounted]);

    if (!mounted) return <div className="tactical-glass p-6 h-full bg-black/40" />;

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
                        <h3 className="text-sm font-semibold text-white/90">Ceremony Monitor</h3>
                        <p className="text-xs text-white/40 mt-0.5">ZK Activity Tracker</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-medium font-mono ${ceremonyStatus === 'ACTIVE' ? 'bg-green-500/10 text-green-500' :
                        ceremonyStatus === 'COMPLETE' ? 'bg-tactical-purple/10 text-tactical-purple' :
                            'bg-white/5 text-white/40'
                    }`}>
                    {ceremonyStatus}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center">
                    <Users className="w-5 h-5 text-tactical-cyan mb-1.5 opacity-50" />
                    <span className="text-[10px] text-white/40">Events</span>
                    <span className="text-lg font-semibold text-white">{contributions.length}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl flex flex-col items-center justify-center text-center">
                    <Binary className="w-5 h-5 text-tactical-purple mb-1.5 opacity-50" />
                    <span className="text-[10px] text-white/40">Proofs</span>
                    <span className="text-lg font-semibold text-white">
                        {contributions.filter(c => c.type === 'PROOF_GENERATED').length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-4">
                <h4 className="text-xs font-medium text-white/40 flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-tactical-cyan opacity-50" />
                    Activity Log
                </h4>
                <div className="space-y-2">
                    {contributions.length === 0 ? (
                        <div className="py-12 text-center border border-dashed border-white/5 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-white/20 mx-auto mb-2" />
                            <p className="text-xs text-white/30">No ZK activity yet</p>
                            <p className="text-[10px] text-white/20 mt-1">Shield funds or execute rescue to see events</p>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {contributions.map(c => (
                                <motion.div
                                    key={c.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-1"
                                >
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-medium text-white/70">{c.node}</span>
                                        <span className="text-[10px] text-white/30 font-mono">{c.timestamp}</span>
                                    </div>
                                    <p className="text-[10px] font-mono text-white/30 truncate">
                                        {c.hash.slice(0, 24)}...
                                    </p>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
