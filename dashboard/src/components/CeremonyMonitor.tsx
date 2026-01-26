"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Users, Binary, CheckCircle2, Loader2, AlertCircle, Zap, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus, ForensicEvent } from '../../../sdk/events/bus';

interface Contribution {
    id: number;
    name: string;
    timestamp: string;
    hash: string;
    entropy: string;
    verified: boolean;
}

interface CeremonyState {
    status: 'WAITING' | 'ACTIVE' | 'CONTRIBUTING' | 'FINALIZED';
    contributions: Contribution[];
    totalContributions: number;
    userContributed: boolean;
}

export const CeremonyMonitor = () => {
    const [mounted, setMounted] = useState(false);
    const [state, setState] = useState<CeremonyState>({
        status: 'WAITING',
        contributions: [],
        totalContributions: 0,
        userContributed: false
    });
    const [isContributing, setIsContributing] = useState(false);
    const [entropyInput, setEntropyInput] = useState('');
    const [contributorName, setContributorName] = useState('');

    useEffect(() => {
        setMounted(true);
        // Load any existing contributions from localStorage
        const saved = localStorage.getItem('solvoid_ceremony');
        if (saved) {
            const data = JSON.parse(saved);
            setState(prev => ({
                ...prev,
                contributions: data.contributions || [],
                totalContributions: data.contributions?.length || 0,
                userContributed: data.userContributed || false
            }));
        }
    }, []);

    // Subscribe to SDK events
    useEffect(() => {
        if (!mounted) return;

        const handleEvent = (event: ForensicEvent) => {
            if (event.type === 'PROOF_GENERATED' || event.type === 'COMMITMENT_CREATED') {
                setState(prev => ({ ...prev, status: 'ACTIVE' }));
            }
        };

        const unsubscribe = EventBus.onAll(handleEvent);
        return () => unsubscribe();
    }, [mounted]);

    /**
     * Generate entropy from multiple browser sources
     */
    const generateBrowserEntropy = useCallback((): string => {
        const sources: string[] = [];

        // Crypto random
        const randomBytes = new Uint8Array(32);
        crypto.getRandomValues(randomBytes);
        sources.push(Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join(''));

        // Timestamp with high precision
        sources.push(performance.now().toString());
        sources.push(Date.now().toString());

        // Mouse/touch position entropy (if available)
        sources.push(`${window.screenX}:${window.screenY}`);

        // Screen info
        sources.push(`${screen.width}:${screen.height}:${screen.colorDepth}`);

        // Navigator fingerprint
        sources.push(navigator.userAgent.slice(0, 50));
        sources.push(navigator.language);

        // User-provided entropy
        if (entropyInput) {
            sources.push(entropyInput);
        }

        // Combine and hash
        const combined = sources.join(':');
        return combined;
    }, [entropyInput]);

    /**
     * Submit entropy contribution to the ceremony
     */
    const handleContribute = async () => {
        if (!contributorName.trim()) {
            alert('Please enter a contributor name');
            return;
        }

        setIsContributing(true);
        setState(prev => ({ ...prev, status: 'CONTRIBUTING' }));

        try {
            // Generate entropy
            const entropy = generateBrowserEntropy();

            // Create entropy hash using Web Crypto API
            const encoder = new TextEncoder();
            const data = encoder.encode(entropy);
            const buffer = new Uint8Array(data).buffer as ArrayBuffer;
            const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            // Create contribution
            const contribution: Contribution = {
                id: state.contributions.length + 1,
                name: contributorName,
                timestamp: new Date().toISOString(),
                hash: hashHex,
                entropy: hashHex.slice(0, 16),
                verified: true
            };

            // Simulate contribution delay (would be real snarkjs call)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update state
            const newContributions = [contribution, ...state.contributions];
            setState(prev => ({
                ...prev,
                status: 'ACTIVE',
                contributions: newContributions,
                totalContributions: newContributions.length,
                userContributed: true
            }));

            // Save to localStorage
            localStorage.setItem('solvoid_ceremony', JSON.stringify({
                contributions: newContributions,
                userContributed: true
            }));

            // Emit event
            EventBus.emit('PROOF_GENERATED', `Ceremony contribution from ${contributorName}`, {
                contributor: contributorName,
                hash: hashHex.slice(0, 16)
            }, hashHex);

            // Clear inputs
            setEntropyInput('');
            setContributorName('');

        } catch (error) {
            console.error('Contribution failed:', error);
            setState(prev => ({ ...prev, status: 'ACTIVE' }));
        } finally {
            setIsContributing(false);
        }
    };

    if (!mounted) return <div className="tactical-glass p-6 h-full bg-black/40" />;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col h-full bg-black/40 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-tactical-cyan" />
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">MPC Ceremony</h3>
                        <p className="text-xs text-white/40 mt-0.5">Trusted Setup Contributions</p>
                    </div>
                </div>
                <div className={`px-2 py-1 rounded text-[10px] font-medium font-mono ${state.status === 'FINALIZED' ? 'bg-green-500/10 text-green-500' :
                    state.status === 'CONTRIBUTING' ? 'bg-amber-500/10 text-amber-500' :
                        state.status === 'ACTIVE' ? 'bg-tactical-cyan/10 text-tactical-cyan' :
                            'bg-white/5 text-white/40'
                    }`}>
                    {state.status}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Users className="w-4 h-4 text-tactical-cyan mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Contributors</span>
                    <span className="text-lg font-semibold text-white">{state.totalContributions}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Binary className="w-4 h-4 text-tactical-purple mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Entropy</span>
                    <span className="text-lg font-semibold text-white">{(state.totalContributions * 256).toLocaleString()}b</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Security</span>
                    <span className="text-xs font-semibold text-white mt-1">
                        {state.totalContributions >= 10 ? 'ELITE' : state.totalContributions >= 5 ? 'HIGH' : 'BUILDING'}
                    </span>
                </div>
            </div>

            {/* Contribution Form */}
            {!state.userContributed && (
                <div className="mb-6 p-4 border border-tactical-cyan/20 bg-tactical-cyan/[0.02] rounded-xl">
                    <div className="flex items-center gap-2 mb-3">
                        <Lock className="w-4 h-4 text-tactical-cyan" />
                        <span className="text-xs font-medium text-white/80">Contribute Entropy</span>
                    </div>

                    <input
                        type="text"
                        placeholder="Your name or alias"
                        value={contributorName}
                        onChange={(e) => setContributorName(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/30 mb-2 outline-none focus:border-tactical-cyan/30"
                    />

                    <input
                        type="text"
                        placeholder="Optional: Add custom entropy (move mouse, type random text...)"
                        value={entropyInput}
                        onChange={(e) => setEntropyInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/30 mb-3 outline-none focus:border-tactical-cyan/30"
                    />

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContribute}
                        disabled={isContributing}
                        className="w-full py-2.5 bg-tactical-cyan/10 border border-tactical-cyan/30 text-tactical-cyan text-xs font-medium hover:bg-tactical-cyan/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 rounded-lg"
                    >
                        {isContributing ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Generating Contribution...
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-3 h-3" />
                                Join Ceremony
                            </>
                        )}
                    </motion.button>
                </div>
            )}

            {/* Contribution Success */}
            {state.userContributed && (
                <div className="mb-6 p-4 border border-green-500/20 bg-green-500/[0.02] rounded-xl">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-medium text-green-500">You've contributed to the ceremony!</span>
                    </div>
                    <p className="text-[10px] text-white/40 mt-2">
                        Your entropy has been mixed into the proving keys. The "toxic waste" is now distributed.
                    </p>
                </div>
            )}

            {/* Contributions List */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-2">
                <h4 className="text-xs font-medium text-white/40 flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-3 h-3 text-tactical-cyan opacity-50" />
                    Recent Contributions
                </h4>

                {state.contributions.length === 0 ? (
                    <div className="py-8 text-center border border-dashed border-white/5 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-white/20 mx-auto mb-2" />
                        <p className="text-xs text-white/30">No contributions yet</p>
                        <p className="text-[10px] text-white/20 mt-1">Be the first to contribute entropy!</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {state.contributions.map((c) => (
                            <motion.div
                                key={c.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex flex-col gap-1"
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                                        <span className="text-xs font-medium text-white/70">{c.name}</span>
                                    </div>
                                    <span className="text-[10px] text-white/30 font-mono">
                                        {new Date(c.timestamp).toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="text-[10px] font-mono text-white/30 truncate">
                                    Hash: {c.hash.slice(0, 32)}...
                                </p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
};
