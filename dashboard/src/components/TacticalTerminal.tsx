"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, CheckCircle2, AlertCircle, Cpu } from 'lucide-react';

interface LogEntry {
    timestamp: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SYSTEM';
    message: string;
    hex?: string;
}

export const TacticalTerminal = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
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

    // Simulate real-time forensic scanning logs
    useEffect(() => {
        const forensicMessages = [
            { m: "Initializing multi-layer forensic engine...", t: 'SYSTEM' },
            { m: "Syncing with SolVoid Merkle state (Root: 0x7f4e...)", t: 'SYSTEM' },
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
        <div className={`fixed bottom-4 left-6 right-6 transition-all duration-500 z-50 ${isMaximized ? 'h-[400px]' : 'h-[120px]'}`}>
            <div className="glass-panel h-full flex flex-col bg-black/80 border-cyan-500/20 overflow-hidden shadow-2xl">
                <div
                    className="flex justify-between items-center px-4 py-2 border-b border-white/5 bg-white/5 cursor-pointer"
                    onClick={() => setIsMaximized(!isMaximized)}
                >
                    <div className="flex items-center gap-3">
                        <TerminalIcon className="w-3 h-3 text-accent-cyan" />
                    </div>
                    <div className="flex items-center gap-4">
                        {isMaximized ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                    </div>
                </div>

                {/* LOG CONTENT */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 font-mono text-[10px] space-y-1.5 scroll-smooth"
                >
                    {logs.map((log, index) => (
                        <div key={index} className="flex gap-4 group hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
                            <span className="text-white/20 whitespace-nowrap">[{log.timestamp}]</span>
                            <span className={`font-bold whitespace-nowrap ${log.type === 'ERROR' ? 'text-accent-red' :
                                log.type === 'WARNING' ? 'text-yellow-500' :
                                    log.type === 'SYSTEM' ? 'text-accent-purple' :
                                        'text-accent-cyan'
                                }`}>
                                [{log.type}]
                            </span>
                            <span className="text-white/80">{log.message}</span>
                            {log.hex && (
                                <span className="text-white/30 truncate opacity-0 group-hover:opacity-100 transition-opacity">
                                    DATA_BLOB: {log.hex}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* TERMINAL FOOTER (ONLY IF MAXIMIZED) */}
                {isMaximized && (
                    <div className="p-3 border-t border-white/5 bg-black/40 flex justify-between items-center">
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2 opacity-50">
                                <Cpu className="w-3 h-3" />
                                <span className="text-[9px] uppercase tracking-tighter">GPU_ACCELERATED: ON</span>
                            </div>
                            <div className="flex items-center gap-2 opacity-50">
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="text-[9px] uppercase tracking-tighter">DECRYPTION_SYNC: 99.9%</span>
                            </div>
                        </div>
                        <div className="text-white/20 text-[9px] uppercase">Session_ID: SV_LOG_{Math.floor(Math.random() * 10000)}</div>
                    </div>
                )}
            </div>

            <style jsx>{`
                .text-accent-cyan { color: #00f0ff; }
                .text-accent-red { color: #ff003c; }
                .text-accent-purple { color: #b000ff; }
                .bg-black\/80 { background-color: rgba(0, 0, 0, 0.8); }
                .border-cyan-500\/20 { border-color: rgba(0, 240, 255, 0.2); }
                .hover\:bg-white\/5:hover { background-color: rgba(255, 255, 255, 0.05); }
                .text-white\/80 { color: rgba(255, 255, 255, 0.8); }
                .text-white\/30 { color: rgba(255, 255, 255, 0.3); }
                .text-white\/20 { color: rgba(255, 255, 255, 0.2); }
                .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
                .bg-black\/40 { background-color: rgba(0, 0, 0, 0.4); }
                .bg-white\/5 { background-color: rgba(255, 255, 255, 0.05); }
            `}</style>
        </div>
    );
};
