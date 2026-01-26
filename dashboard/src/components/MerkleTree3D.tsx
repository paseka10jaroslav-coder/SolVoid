"use client";

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial, Line } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { EventBus, ForensicEvent } from '../../../sdk/events/bus';

interface TreeLevelProps {
    level: number;
    nodesPerLevel: number;
    highlightedPath?: number[];
    highlightLevel?: number;
}

const TreeLevel = ({ level, nodesPerLevel, highlightedPath, highlightLevel }: TreeLevelProps) => {
    const groupRef = useRef<THREE.Group>(null);

    const nodePositions = useMemo(() => {
        const pos = [];
        const radius = level * 2.5;
        const count = Math.min(nodesPerLevel, 24);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            pos.push({
                position: [
                    Math.cos(angle) * radius,
                    -level * 2,
                    Math.sin(angle) * radius
                ] as [number, number, number],
                index: i,
                isHighlighted: highlightedPath?.includes(i) && level === highlightLevel
            });
        }
        return pos;
    }, [level, nodesPerLevel, highlightedPath, highlightLevel]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1 * level) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {nodePositions.map((node, i) => (
                <group key={i} position={node.position}>
                    {/* Node sphere */}
                    <mesh>
                        <sphereGeometry args={[node.isHighlighted ? 0.15 : 0.08, 16, 16]} />
                        <meshBasicMaterial
                            color={node.isHighlighted ? "#ff6b00" : "#00f0ff"}
                            transparent
                            opacity={node.isHighlighted ? 1 : 0.8}
                        />
                    </mesh>

                    {/* Glow effect for highlighted nodes */}
                    {node.isHighlighted && (
                        <mesh>
                            <sphereGeometry args={[0.25, 16, 16]} />
                            <meshBasicMaterial color="#ff6b00" transparent opacity={0.3} />
                        </mesh>
                    )}

                    {/* Connection line to parent */}
                    <mesh position={[0, level, 0]}>
                        <boxGeometry args={[0.01, level * 2, 0.01]} />
                        <meshBasicMaterial
                            color={node.isHighlighted ? "#ff6b00" : "#00f0ff"}
                            transparent
                            opacity={node.isHighlighted ? 0.6 : 0.15}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

interface HighlightedPathProps {
    path: Array<{ level: number; indices: number[] }>;
}

const HighlightedPath = ({ path }: HighlightedPathProps) => {
    const lineRef = useRef<any>(null);

    const points = useMemo(() => {
        if (path.length === 0) return [];

        const pathPoints: THREE.Vector3[] = [];

        // Start from root
        pathPoints.push(new THREE.Vector3(0, 0, 0));

        // Trace through path
        for (const segment of path) {
            const level = segment.level;
            const nodeIndex = segment.indices[0];
            const nodesAtLevel = Math.pow(2, level);
            const radius = level * 2.5;
            const angle = (nodeIndex / nodesAtLevel) * Math.PI * 2;

            pathPoints.push(new THREE.Vector3(
                Math.cos(angle) * radius,
                -level * 2,
                Math.sin(angle) * radius
            ));
        }

        return pathPoints;
    }, [path]);

    useFrame((state) => {
        if (lineRef.current) {
            // Pulse animation
            lineRef.current.material.opacity = 0.5 + Math.sin(state.clock.elapsedTime * 4) * 0.3;
        }
    });

    if (points.length < 2) return null;

    return (
        <Line
            ref={lineRef}
            points={points}
            color="#ff6b00"
            lineWidth={3}
            transparent
            opacity={0.8}
        />
    );
};

const MerkleRoot = ({ isHighlighted }: { isHighlighted?: boolean }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.01;
            meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.2;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[1, 0]} />
                <MeshDistortMaterial
                    color={isHighlighted ? "#ff6b00" : "#00f0ff"}
                    speed={3}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
            {isHighlighted && (
                <mesh>
                    <sphereGeometry args={[1.5, 32, 32]} />
                    <meshBasicMaterial color="#ff6b00" transparent opacity={0.2} />
                </mesh>
            )}
            <Text
                position={[0, 1.8, 0]}
                fontSize={0.25}
                color={isHighlighted ? "#ff6b00" : "#00f0ff"}
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
                textAlign="center"
            >
                {isHighlighted ? "COMMITMENT_ADDED" : "MERKLE_ROOT"}
            </Text>
        </Float>
    );
}

interface MerkleTree3DProps {
    highlightedCommitment?: string;
}

export const MerkleTree3D = ({ highlightedCommitment }: MerkleTree3DProps) => {
    const [mounted, setMounted] = useState(false);
    const [activeDeposit, setActiveDeposit] = useState<{
        commitment: string;
        path: Array<{ level: number; indices: number[] }>;
        timestamp: number;
    } | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Subscribe to commitment events
    useEffect(() => {
        if (!mounted) return;

        const handleEvent = (event: ForensicEvent) => {
            if (event.type === 'COMMITMENT_CREATED') {
                // Generate random path for visualization
                const randomPath = [
                    { level: 1, indices: [Math.floor(Math.random() * 2)] },
                    { level: 2, indices: [Math.floor(Math.random() * 4)] },
                    { level: 3, indices: [Math.floor(Math.random() * 12)] },
                    { level: 4, indices: [Math.floor(Math.random() * 24)] },
                ];

                setActiveDeposit({
                    commitment: event.hex || event.data?.commitment as string || 'unknown',
                    path: randomPath,
                    timestamp: Date.now()
                });

                // Clear after animation
                setTimeout(() => setActiveDeposit(null), 5000);
            }
        };

        const unsubscribe = EventBus.onAll(handleEvent);
        return () => unsubscribe();
    }, [mounted]);

    // Also respond to prop-based highlighting
    useEffect(() => {
        if (highlightedCommitment) {
            const randomPath = [
                { level: 1, indices: [Math.floor(Math.random() * 2)] },
                { level: 2, indices: [Math.floor(Math.random() * 4)] },
                { level: 3, indices: [Math.floor(Math.random() * 12)] },
                { level: 4, indices: [Math.floor(Math.random() * 24)] },
            ];

            setActiveDeposit({
                commitment: highlightedCommitment,
                path: randomPath,
                timestamp: Date.now()
            });
        }
    }, [highlightedCommitment]);

    if (!mounted) return (
        <div className="w-full h-full bg-black/40 rounded-xl" />
    );

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full h-full relative"
        >
            <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 10, 30]} />
                <ambientLight intensity={0.4} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#00f0ff" />
                {activeDeposit && (
                    <pointLight position={[0, 0, 0]} intensity={3} color="#ff6b00" />
                )}

                <Stars radius={100} depth={50} count={6000} factor={6} saturation={0} fade speed={1.5} />

                <group position={[0, 2, 0]}>
                    <MerkleRoot isHighlighted={!!activeDeposit} />

                    {/* Highlighted path line */}
                    {activeDeposit && <HighlightedPath path={activeDeposit.path} />}

                    <TreeLevel
                        level={1}
                        nodesPerLevel={2}
                        highlightedPath={activeDeposit?.path[0]?.indices}
                        highlightLevel={1}
                    />
                    <TreeLevel
                        level={2}
                        nodesPerLevel={4}
                        highlightedPath={activeDeposit?.path[1]?.indices}
                        highlightLevel={2}
                    />
                    <TreeLevel
                        level={3}
                        nodesPerLevel={12}
                        highlightedPath={activeDeposit?.path[2]?.indices}
                        highlightLevel={3}
                    />
                    <TreeLevel
                        level={4}
                        nodesPerLevel={24}
                        highlightedPath={activeDeposit?.path[3]?.indices}
                        highlightLevel={4}
                    />
                </group>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
            </Canvas>

            {/* Overlay UI */}
            <div className="absolute top-6 left-6 pointer-events-none space-y-1">
                <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${activeDeposit ? 'bg-orange-500' : 'bg-tactical-cyan'}`} />
                    <p className={`text-xs font-medium ${activeDeposit ? 'text-orange-500' : 'text-tactical-cyan'}`}>
                        {activeDeposit ? 'Deposit Active' : 'State Explorer'}
                    </p>
                </div>
                <p className="text-[10px] text-white/40 ml-4">
                    {activeDeposit
                        ? `Path: Root → L${activeDeposit.path.map(p => p.indices[0]).join(' → ')}`
                        : 'ZK Commitment Tree Visualization'}
                </p>
            </div>

            {/* Active deposit indicator */}
            {activeDeposit && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute bottom-6 left-6 pointer-events-none"
                >
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg px-3 py-2">
                        <p className="text-xs text-orange-500 font-medium">New Commitment</p>
                        <p className="text-[10px] text-white/50 font-mono mt-1">
                            {activeDeposit.commitment.slice(0, 16)}...
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="absolute bottom-6 right-6 pointer-events-none text-right">
                <p className="text-[10px] text-white/20 font-mono">
                    Protocol v1.0
                </p>
            </div>
        </motion.div>
    );
};
