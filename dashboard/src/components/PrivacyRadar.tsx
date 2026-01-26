"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface PrivacyRadarProps {
    score?: number;
}

export const PrivacyRadar = ({ score }: PrivacyRadarProps) => {
    const displayScore = score ?? 0;

    const data = [
        { subject: 'Identity', A: displayScore * 0.8, fullMark: 100 },
        { subject: 'Metadata', A: Math.min(100, displayScore * 1.2), fullMark: 100 },
        { subject: 'MEV Resilience', A: displayScore * 0.9, fullMark: 100 },
        { subject: 'State Hygiene', A: displayScore * 0.7, fullMark: 100 },
        { subject: 'Anonymity', A: displayScore * 0.5, fullMark: 100 },
    ];

    const scoreColor = displayScore < 50 ? '#ff003c' : displayScore < 80 ? '#f0ff00' : '#00f0ff';

    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="tactical-glass p-6 flex flex-col items-center"
        >
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6 font-mono">Radar: Global Pulse</h3>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.05)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9, fontWeight: 600 }} />
                        <Radar
                            name="Privacy"
                            dataKey="A"
                            stroke={scoreColor}
                            fill={scoreColor}
                            fillOpacity={0.15}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 w-full space-y-3">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="text-white/40 uppercase font-mono tracking-tighter">Overall Security Score</span>
                    <span className="font-bold font-mono" style={{ color: scoreColor }}>{displayScore}%</span>
                </div>
                <div className="h-[2px] w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${displayScore}%` }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                        className="h-full"
                        style={{ backgroundColor: scoreColor }}
                    />
                </div>
                <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-mono">
                    {displayScore === 0 ? "Awaiting scan..." : "Telemetry synced"}
                </p>
            </div>
        </motion.div>
    );
};
