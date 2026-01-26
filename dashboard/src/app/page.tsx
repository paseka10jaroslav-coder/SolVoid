"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { PrivacyRadar } from "@/components/PrivacyRadar";
import { ForensicFeed } from "@/components/ForensicFeed";
import { ShadowVault } from "@/components/ShadowVault";
import { MerkleTree3D } from "@/components/MerkleTree3D";
import { TacticalTerminal } from "@/components/TacticalTerminal";
import { useSolVoid } from "@/hooks/useSolVoid";
import { Terminal, Shield, AlertCircle, Search } from "lucide-react";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const {
    address,
    passport,
    leaks,
    loading,
    error,
    scanAddress,
    executeRescue
  } = useSolVoid();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) scanAddress(searchInput);
  };

  return (
    <main className="min-h-screen flex flex-col">
      <Header score={passport?.overallScore} loading={loading} />

      {/* ADDRESS SEARCH BAR */}
      <div className="mx-6 mb-2">
        <form onSubmit={handleScan} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="ENTER SOLANA ADDRESS FOR DEEP SCAN..."
              className="w-full glass-panel py-3 pl-12 pr-4 bg-black/40 text-xs font-mono text-accent-cyan outline-none border-white/5 focus:border-accent-cyan/50 transition-all"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="glass-panel px-8 bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan text-[10px] font-bold uppercase tracking-widest hover:bg-accent-cyan/20 transition-all disabled:opacity-50"
          >
            {loading ? "SCANNING..." : "INITIATE SCAN"}
          </button>
        </form>
        {error && <p className="text-[10px] text-accent-red mt-2 uppercase">Scan Error: {error}</p>}
      </div>

      <div className="flex-1 grid grid-cols-12 gap-6 p-6">
        {/* LEFT COLUMN: Radar & Stats */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <PrivacyRadar score={passport?.overallScore} />

          <div className="glass-panel p-6 bg-accent-cyan/5 border-accent-cyan/10">
            <div className="flex items-center gap-2 mb-4">
              <Terminal className="w-4 h-4 text-accent-cyan" />
              <h4 className="text-[10px] uppercase font-bold text-white/70">System Diagnostics</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Zk-Proving:</span>
                <span className="text-accent-cyan font-mono">Standby</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Shadow-RPC:</span>
                <span className="text-accent-cyan font-mono">Active [3 Hops]</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-white/40">Active Wallet:</span>
                <span className="text-accent-cyan font-mono">{address ? address.slice(0, 8) + '...' : 'NONE'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: Forensic Analysis */}
        <div className="col-span-12 lg:col-span-6">
          <ForensicFeed leaks={leaks} onRescue={executeRescue} loading={loading} />
        </div>

        {/* RIGHT COLUMN: Shadow Vault */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          <ShadowVault commitments={[]} />

          <div className={`glass-panel p-6 bg-accent-red/5 border-accent-red/10 ${passport?.overallScore < 50 ? 'animate-pulse' : ''}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-accent-red" />
              <h4 className="text-[10px] uppercase font-bold text-accent-red">System Intelligence</h4>
            </div>
            <p className="text-[10px] text-white/50 leading-relaxed uppercase">
              {passport?.overallScore < 50
                ? "Critical identity leaks detected. Surgical Rescue recommended immediately."
                : passport
                  ? "Identity posture is acceptable. Continue monitoring for metadata leaks."
                  : "No telemetry data available. Connect wallet or scan address to begin."}
            </p>
          </div>
        </div>
      </div>

      {/* STATE VISUALIZATION ROW */}
      <div className="px-6 mb-6">
        <div className="glass-panel h-[400px] relative overflow-hidden">
          <MerkleTree3D />
        </div>
      </div>

      {/* FOOTER BAR */}
      <footer className="glass-panel m-4 mt-0 mb-32 p-3 flex justify-between items-center bg-black/40">
        <div className="flex gap-4">
          <span className="text-[9px] text-white/40 uppercase tracking-widest">Lat: 34.0522° N</span>
          <span className="text-[9px] text-white/40 uppercase tracking-widest">Lon: 118.2437° W</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-3 h-3 text-accent-cyan" />
          <span className="text-[9px] text-accent-cyan uppercase tracking-widest font-bold">Protocol Status: Optimal</span>
        </div>
        <div className="text-[9px] text-white/40 uppercase tracking-widest">
          SolVoid Tactical Command | v1.2.4
        </div>
      </footer>

      <TacticalTerminal />

      <style jsx>{`
        .min-h-screen { min-height: 100vh; }
        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .flex-1 { flex: 1; }
        .grid { display: grid; }
        .grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
        .col-span-12 { grid-column: span 12 / span 12; }
        .gap-6 { gap: 24px; }
        .gap-4 { gap: 16px; }
        .gap-2 { gap: 8px; }
        .mx-6 { margin-left: 24px; margin-right: 24px; }
        .mb-2 { margin-bottom: 8px; }
        .mt-2 { margin-top: 8px; }
        .pl-12 { padding-left: 48px; }
        .p-6 { padding: 24px; }
        .p-3 { padding: 12px; }
        .px-8 { padding-left: 32px; padding-right: 32px; }
        .py-3 { padding-top: 12px; padding-bottom: 12px; }
        .m-4 { margin: 16px; }
        .mt-0 { margin-top: 0; }
        .space-y-6 > * + * { margin-top: 24px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .mb-4 { margin-bottom: 16px; }
        .mb-2 { margin-bottom: 8px; }
        .justify-between { justify-content: space-between; }
        .items-center { align-items: center; }
        .relative { position: relative; }
        .absolute { position: absolute; }
        .left-4 { left: 16px; }
        .top-1/2 { top: 50%; }
        .-translate-y-1/2 { transform: translateY(-50%); }
        .text-[10px] { font-size: 10px; }
        .text-[9px] { font-size: 9px; }
        .font-bold { font-weight: 700; }
        .font-mono { font-family: monospace; }
        .uppercase { text-transform: uppercase; }
        .tracking-widest { letter-spacing: 0.1em; }
        .leading-relaxed { line-height: 1.625; }
        .text-accent-cyan { color: #00f0ff; }
        .text-accent-red { color: #ff003c; }
        .text-white\/30 { color: rgba(255, 255, 255, 0.3); }
        .text-white\/40 { color: rgba(255, 255, 255, 0.4); }
        .text-white\/50 { color: rgba(255, 255, 255, 0.5); }
        .text-white\/70 { color: rgba(255, 255, 255, 0.7); }
        .bg-accent-cyan\/5 { background-color: rgba(0, 240, 255, 0.05); }
        .bg-accent-cyan\/10 { background-color: rgba(0, 240, 255, 0.1); }
        .bg-accent-red\/5 { background-color: rgba(255, 0, 60, 0.05); }
        .bg-black\/40 { background-color: rgba(0, 0, 0, 0.4); }
        .border-white\/5 { border-color: rgba(255, 255, 255, 0.05); }
        .border-accent-cyan\/20 { border-color: rgba(0, 240, 255, 0.2); }
        .border-accent-cyan\/10 { border-color: rgba(0, 240, 255, 0.1); }
        .border-accent-red\/10 { border-color: rgba(255, 0, 60, 0.1); }

        @media (min-width: 1024px) {
          .lg\:col-span-3 { grid-column: span 3 / span 3; }
          .lg\:col-span-6 { grid-column: span 6 / span 6; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </main>
  );
}
