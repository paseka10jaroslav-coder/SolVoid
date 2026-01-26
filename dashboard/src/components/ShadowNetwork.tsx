"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Globe, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShadowNode {
    id: string;
    region: string;
    latency?: number;
    isHealthy: boolean;
}

interface ShadowNetworkProps {
    nodes?: ShadowNode[];
    onRefresh?: () => Promise<void>;
}

export const ShadowNetwork = ({ nodes = [], onRefresh }: ShadowNetworkProps) => {
    const [mounted, setMounted] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleRefresh = async () => {
        if (onRefresh) {
            setIsRefreshing(true);
            await onRefresh();
            setIsRefreshing(false);
        }
    };

    const healthyCount = nodes.filter(n => n.isHealthy).length;
    const avgLatency = nodes.filter(n => n.latency).reduce((acc, n) => acc + (n.latency || 0), 0) / (nodes.filter(n => n.latency).length || 1);

    if (!mounted) return <div className="tactical-glass p-6 h-full bg-black/40" />;

    // Default display when no nodes are configured
    const displayNodes: ShadowNode[] = nodes.length > 0 ? nodes : [
        { id: 'shadow-us-east', region: 'US-EAST', isHealthy: true },
        { id: 'shadow-us-west', region: 'US-WEST', isHealthy: true },
        { id: 'shadow-eu', region: 'EU', isHealthy: true },
        { id: 'shadow-asia', region: 'ASIA', isHealthy: true },
    ];

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col bg-black/40"
        >
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-tactical-purple" />
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">Shadow Relay Network</h3>
                        <p className="text-xs text-white/40 mt-0.5">IP Anonymization Layer</p>
                    </div>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 text-white/40 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Activity className="w-4 h-4 text-tactical-purple mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Active Nodes</span>
                    <span className="text-lg font-semibold text-white">{healthyCount}/{displayNodes.length}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Wifi className="w-4 h-4 text-green-500 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Avg Latency</span>
                    <span className="text-lg font-semibold text-white">{avgLatency > 0 ? `${Math.round(avgLatency)}ms` : '--'}</span>
                </div>
            </div>

            {/* Node List */}
            <div className="flex-1 space-y-2">
                <h4 className="text-xs font-medium text-white/40 mb-3">Relay Nodes</h4>
                {displayNodes.map((node) => (
                    <div
                        key={node.id}
                        className="flex items-center justify-between p-3 border border-white/5 bg-white/[0.01] rounded-lg"
                    >
                        <div className="flex items-center gap-3">
                            {node.isHealthy ? (
                                <Wifi className="w-3.5 h-3.5 text-green-500" />
                            ) : (
                                <WifiOff className="w-3.5 h-3.5 text-tactical-red" />
                            )}
                            <div>
                                <span className="text-xs font-medium text-white/70">{node.region}</span>
                                <span className="text-[10px] text-white/30 block font-mono">{node.id}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className={`text-[10px] font-mono ${node.isHealthy ? 'text-green-500' : 'text-tactical-red'}`}>
                                {node.isHealthy ? 'ONLINE' : 'OFFLINE'}
                            </span>
                            {node.latency && (
                                <span className="text-[10px] text-white/30 block">{node.latency}ms</span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Status Footer */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Encryption</span>
                    <span className="text-[10px] text-tactical-cyan font-mono">Noise Protocol NK</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/30">Routing</span>
                    <span className="text-[10px] text-tactical-purple font-mono">Onion (3-hop)</span>
                </div>
            </div>
        </motion.div>
    );
};
