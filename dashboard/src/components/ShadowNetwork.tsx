"use client";

import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff, Globe, Activity, RefreshCw, DollarSign, Clock, Zap, Server } from 'lucide-react';
import { motion } from 'framer-motion';

interface ShadowNode {
    id: string;
    region: string;
    latency?: number;
    isHealthy: boolean;
    successRate?: number;
    bountyRate?: number;
    relayed?: number;
}

interface NetworkStats {
    totalNodes: number;
    healthyNodes: number;
    avgLatency: number;
    totalRelayed: number;
    avgBounty: number;
}

export const ShadowNetwork = () => {
    const [mounted, setMounted] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [nodes, setNodes] = useState<ShadowNode[]>([]);
    const [stats, setStats] = useState<NetworkStats>({
        totalNodes: 0,
        healthyNodes: 0,
        avgLatency: 0,
        totalRelayed: 0,
        avgBounty: 0.001
    });

    useEffect(() => {
        setMounted(true);
        loadDefaultNodes();
    }, []);

    const loadDefaultNodes = () => {
        // Default shadow node configuration
        const defaultNodes: ShadowNode[] = [
            {
                id: 'shadow-us-east',
                region: 'US-EAST',
                isHealthy: true,
                latency: 45,
                successRate: 0.98,
                bountyRate: 0.001,
                relayed: 1247
            },
            {
                id: 'shadow-us-west',
                region: 'US-WEST',
                isHealthy: true,
                latency: 62,
                successRate: 0.96,
                bountyRate: 0.001,
                relayed: 892
            },
            {
                id: 'shadow-eu-central',
                region: 'EU-CENTRAL',
                isHealthy: true,
                latency: 120,
                successRate: 0.94,
                bountyRate: 0.0012,
                relayed: 543
            },
            {
                id: 'shadow-asia-pacific',
                region: 'ASIA-PAC',
                isHealthy: true,
                latency: 180,
                successRate: 0.92,
                bountyRate: 0.0015,
                relayed: 321
            },
        ];

        setNodes(defaultNodes);
        calculateStats(defaultNodes);
    };

    const calculateStats = (nodeList: ShadowNode[]) => {
        const healthy = nodeList.filter(n => n.isHealthy);
        const avgLat = healthy.reduce((sum, n) => sum + (n.latency || 0), 0) / (healthy.length || 1);
        const totalRel = nodeList.reduce((sum, n) => sum + (n.relayed || 0), 0);
        const avgBounty = nodeList.reduce((sum, n) => sum + (n.bountyRate || 0), 0) / (nodeList.length || 1);

        setStats({
            totalNodes: nodeList.length,
            healthyNodes: healthy.length,
            avgLatency: Math.round(avgLat),
            totalRelayed: totalRel,
            avgBounty
        });
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);

        // Simulate health check
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Randomly update latencies
        const updated = nodes.map(n => ({
            ...n,
            latency: n.latency ? n.latency + Math.floor(Math.random() * 20) - 10 : undefined,
            relayed: (n.relayed || 0) + Math.floor(Math.random() * 5)
        }));

        setNodes(updated);
        calculateStats(updated);
        setIsRefreshing(false);
    };

    if (!mounted) return <div className="tactical-glass p-6 h-full bg-black/40" />;

    return (
        <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col bg-black/40 h-full"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-tactical-purple" />
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">Shadow Relay Network</h3>
                        <p className="text-xs text-white/40 mt-0.5">IP Anonymization Infrastructure</p>
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
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Server className="w-4 h-4 text-tactical-cyan mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Active Nodes</span>
                    <span className="text-lg font-semibold text-white">
                        {stats.healthyNodes}/{stats.totalNodes}
                    </span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Clock className="w-4 h-4 text-tactical-purple mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Avg Latency</span>
                    <span className="text-lg font-semibold text-white">{stats.avgLatency}ms</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <Zap className="w-4 h-4 text-amber-500 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Relayed</span>
                    <span className="text-lg font-semibold text-white">{stats.totalRelayed.toLocaleString()}</span>
                </div>
                <div className="p-3 border border-white/5 bg-white/[0.01] rounded-xl text-center">
                    <DollarSign className="w-4 h-4 text-green-500 mx-auto mb-1 opacity-60" />
                    <span className="text-[10px] text-white/40 block">Avg Bounty</span>
                    <span className="text-lg font-semibold text-white">{stats.avgBounty.toFixed(4)}</span>
                </div>
            </div>

            {/* Node List */}
            <div className="flex-1 overflow-y-auto space-y-2">
                <h4 className="text-xs font-medium text-white/40 mb-3">Relay Nodes</h4>
                {nodes.map((node) => (
                    <div
                        key={node.id}
                        className="p-3 border border-white/5 bg-white/[0.01] rounded-lg"
                    >
                        <div className="flex items-center justify-between mb-2">
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

                        {/* Node Metrics */}
                        <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/5">
                            <div className="text-center">
                                <span className="text-[9px] text-white/30 block">Success</span>
                                <span className="text-xs text-white/70">{((node.successRate || 0) * 100).toFixed(0)}%</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] text-white/30 block">Bounty</span>
                                <span className="text-xs text-white/70">{node.bountyRate?.toFixed(4)}</span>
                            </div>
                            <div className="text-center">
                                <span className="text-[9px] text-white/30 block">Relayed</span>
                                <span className="text-xs text-white/70">{node.relayed?.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Encryption</span>
                    <span className="text-[10px] text-tactical-cyan font-mono">Noise Protocol NK</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Routing</span>
                    <span className="text-[10px] text-tactical-purple font-mono">Onion (3-hop)</span>
                </div>
                <div className="flex items-center justify-between">
                    <span className="text-[10px] text-white/30">Uptime</span>
                    <span className="text-[10px] text-green-500 font-mono">99.7%</span>
                </div>
            </div>
        </motion.div>
    );
};
