"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Terminal as TerminalIcon, ChevronUp, ChevronDown, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventBus, ForensicEvent } from '../../../sdk/events/bus';

interface LogEntry {
    id: string;
    timestamp: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SCAN_START' | 'SCAN_COMPLETE' | 'LEAK_DETECTED' | 'TRANSACTION_PARSED' | 'PROOF_GENERATED' | 'RELAY_BROADCAST';
    message: string;
    hex?: string;
}

export const TacticalTerminal = () => {
    const [mounted, setMounted] = useState(false);
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const logIdRef = useRef(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Subscribe to real SDK events
    useEffect(() => {
        if (!mounted) return;

        const addLog = (event: ForensicEvent) => {
            const newEntry: LogEntry = {
                id: `log-${logIdRef.current++}`,
                timestamp: event.timestamp.toLocaleTimeString(),
                type: event.type as LogEntry['type'],
                message: event.message,
                hex: event.hex
            };
            setLogs(prev => [...prev.slice(-99), newEntry]);
        };

        // Subscribe to all events from the EventBus
        const unsubscribe = EventBus.onAll(addLog);
        setIsConnected(true);

        // Initial connection message
        EventBus.info('Forensic terminal connected to SDK event stream');

        return () => {
            unsubscribe();
            setIsConnected(false);
        };
    }, [mounted]);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    const getTypeColor = (type: LogEntry['type']) => {
        switch (type) {
            case 'ERROR':
            case 'LEAK_DETECTED':
                return 'text-tactical-red';
            case 'WARNING':
                return 'text-amber-500';
            case 'SCAN_START':
            case 'SCAN_COMPLETE':
                return 'text-tactical-purple';
            case 'PROOF_GENERATED':
            case 'RELAY_BROADCAST':
                return 'text-green-500';
            default:
                return 'text-tactical-cyan';
        }
    };

    const getTypeLabel = (type: LogEntry['type']) => {
        switch (type) {
            case 'LEAK_DETECTED': return 'LEAK';
            case 'TRANSACTION_PARSED': return 'TX';
            case 'SCAN_START': return 'SCAN';
            case 'SCAN_COMPLETE': return 'DONE';
            case 'PROOF_GENERATED': return 'PROOF';
            case 'RELAY_BROADCAST': return 'RELAY';
            default: return type;
        }
    };

    if (!mounted) return null;

    return (
        <motion.div
            layout
            className="fixed bottom-4 left-6 right-6 z-50 overflow-hidden shadow-2xl transition-all duration-500"
            style={{ height: isMaximized ? '400px' : '120px' }}
        >
            <div className="tactical-glass h-full flex flex-col bg-black/95 border-tactical-cyan/10">
                {/* Header */}
                <div
                    className="flex justify-between items-center px-5 py-3 border-b border-white/5 bg-white/[0.02] cursor-pointer hover:bg-white/[0.04] transition-colors"
                    onClick={() => setIsMaximized(!isMaximized)}
                >
                    <div className="flex items-center gap-4">
                        <TerminalIcon className="w-4 h-4 text-tactical-cyan" />
                        <span className="text-sm font-medium text-white/80">Forensic Terminal</span>
                        <span className="text-xs text-white/30">|</span>
                        <div className="flex items-center gap-2">
                            {isConnected ? (
                                <>
                                    <Wifi className="w-3 h-3 text-green-500" />
                                    <span className="text-[10px] text-green-500 font-mono">Connected</span>
                                </>
                            ) : (
                                <>
                                    <WifiOff className="w-3 h-3 text-white/30" />
                                    <span className="text-[10px] text-white/30 font-mono">Disconnected</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-white/30 font-mono">{logs.length} events</span>
                        {isMaximized ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronUp className="w-4 h-4 text-white/40" />}
                    </div>
                </div>

                {/* Log Content */}
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1"
                >
                    {logs.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-white/20">
                            <span>Waiting for SDK events...</span>
                        </div>
                    ) : (
                        <AnimatePresence>
                            {logs.map((log) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex gap-4 py-0.5 group hover:bg-white/[0.02] px-2 -mx-2 rounded"
                                >
                                    <span className="text-white/20 whitespace-nowrap w-16">{log.timestamp}</span>
                                    <span className={`font-semibold whitespace-nowrap w-12 ${getTypeColor(log.type)}`}>
                                        {getTypeLabel(log.type)}
                                    </span>
                                    <span className="text-white/60 flex-1">{log.message}</span>
                                    {log.hex && (
                                        <span className="text-white/20 truncate max-w-[120px] hidden lg:block">
                                            {log.hex.slice(0, 16)}...
                                        </span>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    )}
                </div>

                {/* Footer */}
                {isMaximized && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="px-5 py-2 border-t border-white/5 bg-black/40 flex justify-between items-center"
                    >
                        <div className="flex gap-6">
                            <button
                                onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                                className="text-[10px] text-white/30 hover:text-white/60 transition-colors font-mono"
                            >
                                Clear Logs
                            </button>
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">SolVoid SDK v1.0</span>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};
