"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, CheckCircle2, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LogEntry {
    timestamp: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SYSTEM';
    message: string;
    hex?: string;
}

export const TacticalTerminal = () => {
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        setMounted(true);
    }, []);
    const [isMaximized, setIsMaximized] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const addLog = (message: string, type: LogEntry['type'] = 'INFO', hex?: string) => {
        const newEntry: LogEntry = {
            timestamp: new Date().toLocaleTimeString(),
            type,
            message,
            hex
        };
        setLogs(prev => [...prev.slice(-49), newEntry]);
    };

    useEffect(() => {
        const forensicMessages = [
            { m: "Initializing multi-layer forensic engine...", t: 'SYSTEM' },
            { m: "Syncing with SolVoid Merkle state (Root: 0x7F4E...)", t: 'SYSTEM' },
            { m: "Scanning instruction history for entropy markers...", t: 'INFO' },
            { m: "Payload detected: [Program: Tokenkeg...]", t: 'INFO', h: "0x321a98bc6715" },
            { m: "Critical Leak Detected: Raw Pubkey in IX data.", t: 'ERROR' },
            { m: "Evaluating CEX provenance for fund origin...", t: 'INFO' },
            { m: "Warning: High MEV sensitivity detected on swap.", t: 'WARNING' },
            { m: "Scrubbing temporary metadata identifiers...", t: 'INFO' },
            { m: "State integrity verified. Optimal ZK-node found.", t: 'SYSTEM' },
        ];

        let i = 0;
        const interval = setInterval(() => {
            const entry = forensicMessages[i % forensicMessages.length];
            addLog(entry.m, entry.t as any, entry.h);
            i++;
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <motion.div
            layout
            className={`fixed bottom-4 left-6 right-6 z-50 overflow-hidden shadow-2xl transition-all duration-500`}
            style={{ height: isMaximized ? '400px' : '110px' }}
        >
            <div className="tactical-glass h-full flex flex-col bg-black/90 border-tactical-cyan/10">
                <div
                    className="flex justify-between items-center px-6 py-2.5 border-b border-white/[0.03] bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
                    onClick={() => setIsMaximized(!isMaximized)}
                >
                    <div className="flex items-center gap-4">
                        <TerminalIcon className="w-3.5 h-3.5 text-tactical-cyan opacity-70" />
                        <div className="hidden md:flex items-center gap-4 opacity-40">
                            <div className="w-[1px] h-3 bg-white/20"></div>
                            <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white">Forensic_Link: Active</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full bg-tactical-cyan animate-pulse shadow-[0_0_5px_rgba(0,240,255,1)]"></div>
                            <span className="text-[9px] text-tactical-cyan/70 font-bold font-mono uppercase tracking-widest">Live_Telemetry</span>
                        </div>
                        {isMaximized ? <ChevronDown className="w-4 h-4 opacity-50" /> : <ChevronUp className="w-4 h-4 opacity-50" />}
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 md:px-8 font-mono text-[10px] space-y-2 scrollbar-hide"
                >
                    <AnimatePresence>
                        {logs.map((log, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-6 group py-0.5"
                            >
                                <span className="text-white/10 whitespace-nowrap min-w-[70px]">[{log.timestamp}]</span>
                                <span className={`font-bold whitespace-nowrap min-w-[60px] ${log.type === 'ERROR' ? 'text-tactical-red' :
                                    log.type === 'WARNING' ? 'text-amber-500' :
                                        log.type === 'SYSTEM' ? 'text-tactical-purple' :
                                            'text-tactical-cyan'
                                    }`}>
                                    [{log.type}]
                                </span>
                                <span className="text-white/60 tracking-tight">{log.message}</span>
                                {log.hex && (
                                    <span className="text-white/20 truncate hidden lg:block italic">
                                        IX_DATA: {log.hex}
                                    </span>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {isMaximized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-6 py-3 border-t border-white/[0.03] bg-black/40 flex justify-between items-center"
                    >
                        <div className="flex gap-8">
                            <div className="flex items-center gap-2 opacity-30">
                                <Cpu className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-[0.2em] font-mono">Parallel_Processing</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-30">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[8px] uppercase tracking-[0.2em] font-mono">Sync_Locked</span>
                            </div>
                        </div>
                        <div className="text-white/10 text-[8px] uppercase font-mono tracking-[0.3em]">SV_INST_STREAM_V.5.2</div>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
