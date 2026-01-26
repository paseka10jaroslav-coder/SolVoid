"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Float, Text, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const TreeLevel = ({ level, position, nodesPerLevel }: { level: number, position: [number, number, number], nodesPerLevel: number }) => {
    const meshRef = useRef<THREE.Group>(null);

    const nodePositions = useMemo(() => {
        const pos = [];
        const radius = level * 2;
        const count = Math.min(nodesPerLevel, 16); // Limit visual noise
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
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
        }
    });

    return (
        <group position={position} ref={meshRef}>
            {nodePositions.map((pos, i) => (
                <group key={i} position={pos as [number, number, number]}>
                    <mesh>
                        <sphereGeometry args={[0.1, 16, 16]} />
                        <meshBasicMaterial color="#00f0ff" />
                    </mesh>
                    <mesh position={[0, -0.5, 0]}>
                        <boxGeometry args={[0.02, 1, 0.02]} />
                        <meshBasicMaterial color="#00f0ff" transparent opacity={0.2} />
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
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
            meshRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <mesh ref={meshRef}>
                <octahedronGeometry args={[0.8, 0]} />
                <MeshDistortMaterial
                    color="#00f0ff"
                    speed={2}
                    distort={0.4}
                    radius={1}
                />
            </mesh>
            <Text
                position={[0, 1.5, 0]}
                fontSize={0.2}
                color="#00f0ff"
                anchorX="center"
                anchorY="middle"
            >
                MERKLE_ROOT_SYNCED
            </Text>
        </Float>
    );
}

export const MerkleTree3D = () => {
    return (
        <div className="w-full h-full bg-black/40 rounded-xl overflow-hidden glass-panel border-cyan-500/10">
            <Canvas camera={{ position: [0, 5, 10], fov: 50 }}>
                <color attach="background" args={['#000000']} />
                <fog attach="fog" args={['#000000', 5, 25]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#00f0ff" />

                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

                <group position={[0, 2, 0]}>
                    <MerkleRoot />
                    <TreeLevel level={1} position={[0, 0, 0]} nodesPerLevel={2} />
                    <TreeLevel level={2} position={[0, 0, 0]} nodesPerLevel={4} />
                    <TreeLevel level={3} position={[0, 0, 0]} nodesPerLevel={8} />
                    <TreeLevel level={4} position={[0, 0, 0]} nodesPerLevel={16} />
                </group>

                <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
            </Canvas>
            <div className="absolute top-4 left-4 pointer-events-none">
                <p className="text-[10px] uppercase font-bold text-accent-cyan tracking-[0.2em] animate-pulse">
                    [STATE_EXPLORER_ACTIVE]
                </p>
                <p className="text-[8px] uppercase text-white/40 tracking-wider">
                    Visualizing Layer 20: Anonymity Set 1M+
                </p>
            </div>

            <style jsx>{`
        .w-full { width: 100%; }
        .h-full { height: 100%; }
        .bg-black\/40 { background-color: rgba(0, 0, 0, 0.4); }
        .rounded-xl { border-radius: 12px; }
        .overflow-hidden { overflow: hidden; }
        .glass-panel { 
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .border-cyan-500\/10 { border-color: rgba(0, 240, 255, 0.1); }
        .absolute { position: absolute; }
        .top-4 { top: 16px; }
        .left-4 { left: 16px; }
        .text-accent-cyan { color: #00f0ff; }
        .text-white\/40 { color: rgba(255, 255, 255, 0.4); }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-\[0\.2em\] { letter-spacing: 0.2em; }
        .tracking-wider { letter-spacing: 0.05em; }
        .animate-pulse { animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
        </div>
    );
};
