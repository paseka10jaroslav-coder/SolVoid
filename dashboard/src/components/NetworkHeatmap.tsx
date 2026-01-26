"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Globe, Zap, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface NodeLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    relayed: number;
    isActive: boolean;
    region: string;
}

const defaultNodes: NodeLocation[] = [
    { id: 'us-east', name: 'US East', lat: 40.7, lng: -74, relayed: 1247, isActive: true, region: 'US-EAST' },
    { id: 'us-west', name: 'US West', lat: 37.8, lng: -122.4, relayed: 892, isActive: true, region: 'US-WEST' },
    { id: 'eu-central', name: 'EU Central', lat: 52.5, lng: 13.4, relayed: 543, isActive: true, region: 'EU' },
    { id: 'eu-west', name: 'EU West', lat: 51.5, lng: -0.1, relayed: 421, isActive: true, region: 'EU' },
    { id: 'asia-tokyo', name: 'Tokyo', lat: 35.7, lng: 139.7, relayed: 321, isActive: true, region: 'ASIA' },
    { id: 'asia-singapore', name: 'Singapore', lat: 1.3, lng: 103.8, relayed: 198, isActive: true, region: 'ASIA' },
    { id: 'sa-brazil', name: 'São Paulo', lat: -23.5, lng: -46.6, relayed: 156, isActive: true, region: 'SA' },
    { id: 'oceania', name: 'Sydney', lat: -33.9, lng: 151.2, relayed: 89, isActive: false, region: 'OCEANIA' },
];

/**
 * Convert lat/lng to map position (Mercator-like projection)
 */
const geoToPosition = (lat: number, lng: number, width: number, height: number): { x: number; y: number } => {
    const x = ((lng + 180) / 360) * width;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan((Math.PI / 4) + (latRad / 2)));
    const y = (height / 2) - (width * mercN / (2 * Math.PI));
    return { x, y };
};

/**
 * Get heat color based on activity level
 */
const getHeatColor = (relayed: number, max: number): string => {
    const ratio = relayed / max;
    if (ratio > 0.8) return '#ff4444';
    if (ratio > 0.6) return '#ff8800';
    if (ratio > 0.4) return '#ffcc00';
    if (ratio > 0.2) return '#00f0ff';
    return '#00f0ff';
};

export const NetworkHeatmap = () => {
    const [mounted, setMounted] = useState(false);
    const [nodes, setNodes] = useState<NodeLocation[]>(defaultNodes);
    const [hoveredNode, setHoveredNode] = useState<NodeLocation | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (containerRef.current) {
            const updateDimensions = () => {
                if (containerRef.current) {
                    setDimensions({
                        width: containerRef.current.clientWidth,
                        height: containerRef.current.clientHeight - 80
                    });
                }
            };
            updateDimensions();
            window.addEventListener('resize', updateDimensions);
            return () => window.removeEventListener('resize', updateDimensions);
        }
    }, [mounted]);

    // Simulate activity updates
    useEffect(() => {
        const interval = setInterval(() => {
            setNodes(prev => prev.map(node => ({
                ...node,
                relayed: node.relayed + (node.isActive ? Math.floor(Math.random() * 3) : 0)
            })));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const maxRelayed = Math.max(...nodes.map(n => n.relayed));
    const totalRelayed = nodes.reduce((sum, n) => sum + n.relayed, 0);
    const activeCount = nodes.filter(n => n.isActive).length;

    if (!mounted) return <div className="tactical-glass p-6 h-full bg-black/40" />;

    return (
        <motion.div
            ref={containerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="tactical-glass p-6 flex flex-col h-full bg-black/40 relative overflow-hidden"
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-tactical-purple" />
                    <div>
                        <h3 className="text-sm font-semibold text-white/90">Global Network</h3>
                        <p className="text-xs text-white/40">Shadow Node Distribution</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-white/60">{activeCount}/{nodes.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-tactical-cyan" />
                        <span className="text-xs text-white/60">{totalRelayed.toLocaleString()}</span>
                    </div>
                </div>
            </div>

            {/* Map Container */}
            <div className="flex-1 relative rounded-lg overflow-hidden border border-white/5 bg-black/60">
                {/* World Map Background (stylized grid) */}
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                    className="absolute inset-0"
                >
                    {/* Grid lines */}
                    {Array.from({ length: 12 }).map((_, i) => (
                        <line
                            key={`v-${i}`}
                            x1={(i / 12) * dimensions.width}
                            y1={0}
                            x2={(i / 12) * dimensions.width}
                            y2={dimensions.height}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={1}
                        />
                    ))}
                    {Array.from({ length: 6 }).map((_, i) => (
                        <line
                            key={`h-${i}`}
                            x1={0}
                            y1={(i / 6) * dimensions.height}
                            x2={dimensions.width}
                            y2={(i / 6) * dimensions.height}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth={1}
                        />
                    ))}

                    {/* Continent outlines (simplified) */}
                    <ellipse
                        cx={dimensions.width * 0.2}
                        cy={dimensions.height * 0.35}
                        rx={dimensions.width * 0.12}
                        ry={dimensions.height * 0.2}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                    />
                    <ellipse
                        cx={dimensions.width * 0.5}
                        cy={dimensions.height * 0.3}
                        rx={dimensions.width * 0.15}
                        ry={dimensions.height * 0.15}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                    />
                    <ellipse
                        cx={dimensions.width * 0.75}
                        cy={dimensions.height * 0.35}
                        rx={dimensions.width * 0.1}
                        ry={dimensions.height * 0.2}
                        fill="none"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth={1}
                    />

                    {/* Node markers */}
                    {nodes.map((node) => {
                        const pos = geoToPosition(node.lat, node.lng, dimensions.width, dimensions.height);
                        const color = getHeatColor(node.relayed, maxRelayed);
                        const size = 4 + (node.relayed / maxRelayed) * 8;

                        return (
                            <g
                                key={node.id}
                                onMouseEnter={() => setHoveredNode(node)}
                                onMouseLeave={() => setHoveredNode(null)}
                                style={{ cursor: 'pointer' }}
                            >
                                {/* Outer glow */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={size * 2}
                                    fill={color}
                                    opacity={0.2}
                                >
                                    <animate
                                        attributeName="r"
                                        values={`${size * 1.5};${size * 2.5};${size * 1.5}`}
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                    <animate
                                        attributeName="opacity"
                                        values="0.3;0.1;0.3"
                                        dur="2s"
                                        repeatCount="indefinite"
                                    />
                                </circle>

                                {/* Inner dot */}
                                <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r={size}
                                    fill={node.isActive ? color : '#666'}
                                    stroke={hoveredNode?.id === node.id ? '#fff' : 'transparent'}
                                    strokeWidth={2}
                                />

                                {/* Activity pulse for active nodes */}
                                {node.isActive && (
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r={size}
                                        fill="transparent"
                                        stroke={color}
                                        strokeWidth={1}
                                    >
                                        <animate
                                            attributeName="r"
                                            from={size.toString()}
                                            to={(size * 3).toString()}
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                        <animate
                                            attributeName="opacity"
                                            from="0.6"
                                            to="0"
                                            dur="1.5s"
                                            repeatCount="indefinite"
                                        />
                                    </circle>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Hover Tooltip */}
                {hoveredNode && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute z-10 bg-black/90 border border-white/10 rounded-lg p-3 pointer-events-none"
                        style={{
                            left: geoToPosition(hoveredNode.lat, hoveredNode.lng, dimensions.width, dimensions.height).x + 20,
                            top: geoToPosition(hoveredNode.lat, hoveredNode.lng, dimensions.width, dimensions.height).y - 10
                        }}
                    >
                        <p className="text-xs font-medium text-white/90">{hoveredNode.name}</p>
                        <p className="text-[10px] text-white/50 font-mono">{hoveredNode.region}</p>
                        <div className="flex items-center gap-3 mt-2">
                            <div>
                                <span className="text-[9px] text-white/30 block">Relayed</span>
                                <span className="text-xs text-tactical-cyan">{hoveredNode.relayed.toLocaleString()}</span>
                            </div>
                            <div>
                                <span className="text-[9px] text-white/30 block">Status</span>
                                <span className={`text-xs ${hoveredNode.isActive ? 'text-green-500' : 'text-tactical-red'}`}>
                                    {hoveredNode.isActive ? 'ONLINE' : 'OFFLINE'}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff4444]" />
                        <span className="text-[10px] text-white/40">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ff8800]" />
                        <span className="text-[10px] text-white/40">Medium</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#00f0ff]" />
                        <span className="text-[10px] text-white/40">Low</span>
                    </div>
                </div>
                <span className="text-[10px] text-white/30">Activity Heat</span>
            </div>
        </motion.div>
    );
};
