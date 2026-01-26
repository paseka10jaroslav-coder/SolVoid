"use client";

import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface PrivacyRadarProps {
    score?: number;
}

export const PrivacyRadar = ({ score }: PrivacyRadarProps) => {
    // Use real score or default 0
    const displayScore = score ?? 0;

    // Distribute score across segments for visualization if real metric breakdown is missing
    const data = [
        { subject: 'Identity', A: displayScore * 0.8, fullMark: 100 },
        { subject: 'Metadata', A: Math.min(100, displayScore * 1.2), fullMark: 100 },
        { subject: 'MEV Resilience', A: displayScore * 0.9, fullMark: 100 },
        { subject: 'State Hygiene', A: displayScore * 0.7, fullMark: 100 },
        { subject: 'Anonymity', A: displayScore * 0.5, fullMark: 100 },
    ];

    const scoreColor = displayScore < 50 ? '#ff003c' : displayScore < 80 ? '#f0ff00' : '#00f0ff';

    return (
        <div className="glass-panel p-6 flex flex-col items-center">
            <h3 className="text-sm font-bold uppercase tracking-widest text-white/70 mb-6">Privacy Radar: Global Pulse</h3>

            <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }} />
                        <Radar
                            name="Privacy"
                            dataKey="A"
                            stroke={scoreColor}
                            fill={scoreColor}
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 w-full space-y-4">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-white/50 uppercase">Overall Security Score</span>
                    <span className="font-bold" style={{ color: scoreColor }}>{displayScore}/100</span>
                </div>
                <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full transition-all duration-1000" style={{ width: `${displayScore}%`, backgroundColor: scoreColor }}></div>
                </div>
                <p className="text-[10px] text-white/30 text-center uppercase tracking-tighter">
                    {displayScore === 0 ? "awaiting tactical scan..." : "Telemetry synchronized with cluster"}
                </p>
            </div>

            <style jsx>{`
        .p-6 { padding: 24px; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .text-sm { font-size: 14px; }
        .text-xs { font-size: 12px; }
        .font-bold { font-weight: 700; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .tracking-tighter { letter-spacing: -0.05em; }
        .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
        .text-white\/50 { color: rgba(255, 255, 255, 0.5); }
        .text-white\/30 { color: rgba(255, 255, 255, 0.3); }
        .mb-6 { margin-bottom: 24px; }
        .mt-6 { margin-top: 24px; }
        .space-y-4 > * + * { margin-top: 16px; }
        .w-full { width: 100%; }
        .h-[300px] { height: 300px; }
        .h-1 { height: 4px; }
        .rounded-full { border-radius: 9999px; }
        .overflow-hidden { overflow: hidden; }
        .justify-between { justify-content: space-between; }
        .text-center { text-align: center; }
        .transition-all { transition: all 1s ease-in-out; }
      `}</style>
        </div>
    );
};
