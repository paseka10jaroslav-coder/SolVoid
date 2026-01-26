"use client";

import React from 'react';
import { Activity, AlertTriangle, ShieldCheck, Loader2 } from 'lucide-react';

interface ForensicFeedProps {
    leaks: any[];
    onRescue: () => void;
    loading: boolean;
}

export const ForensicFeed = ({ leaks, onRescue, loading }: ForensicFeedProps) => {
    const allLeaks = leaks.flatMap(r => r.leaks.map((l: any) => ({ ...l, sig: r.signature })));

    return (
        <div className="glass-panel p-6 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-accent-cyan" />
                    <h3 className="text-sm font-bold uppercase tracking-widest text-white/70">Forensic Feed</h3>
                </div>
                <div className="flex items-center gap-2">
                    {loading && <Loader2 className="w-3 h-3 text-accent-cyan animate-spin" />}
                    <span className="text-[10px] text-accent-cyan border border-accent-cyan/20 px-2 py-0.5 rounded uppercase">
                        {loading ? 'Analyzing...' : 'Cluster Live'}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {allLeaks.length === 0 && !loading && (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <ShieldCheck className="w-12 h-12 mb-4" />
                        <p className="text-xs uppercase tracking-widest">No active threats detected</p>
                        <p className="text-[10px]">Initiate scan to analyze transaction history</p>
                    </div>
                )}

                {allLeaks.map((leak, idx) => (
                    <div key={idx} className="glass-panel p-4 border-white/5 hover:border-accent-cyan/30 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-mono text-white/40 group-hover:text-accent-cyan transition-colors">{leak.sig.slice(0, 16)}...</span>
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500/10 text-accent-red`}>{leak.severity}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className={`mt-1 p-1 rounded bg-red-500/10`}>
                                <AlertTriangle className={`w-3 h-3 text-accent-red`} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white/90">{leak.type.toUpperCase()} LEAK DETECTED</p>
                                <p className="text-[10px] text-white/50">{leak.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {allLeaks.length > 0 && (
                <button
                    onClick={onRescue}
                    disabled={loading}
                    className="mt-4 w-full glass-panel py-3 bg-accent-red/10 border-accent-red/20 text-accent-red text-xs font-bold uppercase tracking-widest hover:bg-accent-red/20 transition-all glow-red disabled:opacity-50"
                >
                    {loading ? "EXECUTING RECOVERY..." : `Execute Surgical Rescue (${allLeaks.length} Tainted Assets)`}
                </button>
            )}

            <style jsx>{`
        .p-6 { padding: 24px; }
        .p-4 { padding: 16px; }
        .px-2 { padding-left: 8px; padding-right: 8px; }
        .py-0.5 { padding-top: 2px; padding-bottom: 2px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .items-start { align-items: flex-start; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-6 { margin-bottom: 24px; }
        .mb-2 { margin-bottom: 8px; }
        .mt-4 { margin-top: 16px; }
        .mt-1 { margin-top: 4px; }
        .h-full { height: 100%; }
        .h-[600px] { height: 600px; }
        .overflow-y-auto { overflow-y: auto; }
        .pr-2 { padding-right: 8px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .text-accent-cyan { color: #00f0ff; }
        .text-accent-red { color: #ff003c; }
        .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
        .text-white\/90 { color: rgba(255, 255, 255, 0.9); }
        .text-white\/50 { color: rgba(255, 255, 255, 0.5); }
        .text-white\/40 { color: rgba(255, 255, 255, 0.4); }
        .bg-red-500\/10 { background-color: rgba(255, 0, 60, 0.1); }
        .border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-accent-cyan\/20 { border-color: rgba(0, 240, 255, 0.2); }
        .border-accent-red\/20 { border-color: rgba(255, 0, 60, 0.2); }
        .rounded { border-radius: 4px; }
        .font-mono { font-family: monospace; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .transition-all { transition: all 0.2s; }
        .cursor-pointer { cursor: pointer; }
        .animate-spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .text-center { text-align: center; }
        .opacity-30 { opacity: 0.3; }
      `}</style>
        </div>
    );
};
