"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const TreeLevel = ({ level, nodesPerLevel }: { level: number, nodesPerLevel: number }) => {
    const groupRef = useRef<THREE.Group>(null);

    const nodePositions = useMemo(() => {
        const pos = [];
        const radius = level * 2.5;
        const count = Math.min(nodesPerLevel, 24);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            pos.push([
                Math.cos(angle) * radius,
                -level * 2,
                Math.sin(angle) * radius
            ]);
        }
        return pos;
    }, [level, nodesPerLevel]);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1 * level) * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            {nodePositions.map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh>
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshBasicMaterial color="#00f0ff" transparent opacity={0.8} />
                    </mesh>
                    <mesh position={[0, level, 0]}>
                        <boxGeometry args={[0.01, level * 2, 0.01]} />
                        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const MerkleRoot = () => {
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
                    color="#00f0ff"
                    speed={3}
                    distort={0.4}
                    radius={1}
                    metalness={0.8}
                    roughness={0.2}
                />
            </mesh>
            <Text
                position={[0, 1.8, 0]}
                fontSize={0.25}
                color="#00f0ff"
                anchorX="center"
                anchorY="middle"
                maxWidth={2}
                textAlign="center"
            >
                MERKLE_STATE_SYNCED
            </Text>
        </Float>
    );
}

export const MerkleTree3D = () => {
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

                <Stars radius={100} depth={50} count={6000} factor={6} saturation={0} fade speed={1.5} />

                <group position={[0, 2, 0]}>
                    <MerkleRoot />
                    <TreeLevel level={1} nodesPerLevel={2} />
                    <TreeLevel level={2} nodesPerLevel={4} />
                    <TreeLevel level={3} nodesPerLevel={12} />
                    <TreeLevel level={4} nodesPerLevel={24} />
                </group>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.3} />
            </Canvas>

            <div className="absolute top-6 left-6 pointer-events-none space-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-tactical-cyan animate-pulse"></div>
                    <p className="text-[10px] uppercase font-bold text-tactical-cyan tracking-[0.4em] font-mono">
                        [STATE_EXPLORER_ACTIVE]
                    </p>
                </div>
                <p className="text-[9px] uppercase text-white/30 tracking-[0.2em] font-mono ml-4">
                    Visualizing Layer 20 / 1.04M Leaves
                </p>
            </div>

            <div className="absolute bottom-6 right-6 pointer-events-none text-right">
                <p className="text-[8px] uppercase text-white/20 tracking-[0.5em] font-mono">
                    PROTOCOL_VISUALIZATION_ENGINE_V4
                </p>
            </div>
        </motion.div>
    );
};
