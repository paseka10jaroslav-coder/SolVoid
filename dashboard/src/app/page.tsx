"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { PrivacyRadar } from "@/components/PrivacyRadar";
import { ForensicFeed } from "@/components/ForensicFeed";
import { ShadowVault } from "@/components/ShadowVault";
import { MerkleTree3D } from "@/components/MerkleTree3D";
import { CeremonyMonitor } from "@/components/CeremonyMonitor";
import { TacticalTerminal } from "@/components/TacticalTerminal";
import { useSolVoid } from "@/hooks/useSolVoid";
import { Terminal, Shield, AlertCircle, Search, Crosshair } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const {
    address,
    passport,
    leaks,
    loading,
    error,
    isSimulation,
    scanAddress,
    executeRescue
  } = useSolVoid();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput) scanAddress(searchInput);
  };

  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-tactical-cyan/20">
      {/* Background FX Layer */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-20" />
      <div className="fixed inset-0 bg-radial pointer-events-none" />
      <div className="scanner-overlay" />

      <Header score={passport?.overallScore} loading={loading} isSimulation={isSimulation} />

      {/* TACTICAL INTERFACE CONTAINER */}
      <div className="flex-1 flex flex-col p-4 pt-2 gap-6 relative z-10 max-w-screen-2xl mx-auto w-full">

        {/* SEARCH BAR SECTION */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="px-2"
        >
          <form onSubmit={handleScan} className="flex gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-tactical-cyan group-focus-within:opacity-100 transition-all duration-500" />
              <input
                type="text"
                placeholder="TARGET_ADDRESS_FOR_DEEP_INSPECTOR..."
                className="w-full tactical-glass py-4 pl-14 pr-6 bg-black/40 text-[11px] font-mono text-tactical-cyan/80 outline-none border-white/5 focus:border-tactical-cyan/30 transition-all duration-500 placeholder:text-white/10 uppercase tracking-[0.2em]"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-focus-within:opacity-30 transition-opacity">
                <Crosshair className="w-5 h-5 text-tactical-cyan" />
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="tactical-glass px-10 bg-tactical-cyan/10 border-tactical-cyan/20 text-tactical-cyan text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-tactical-cyan/20 transition-all disabled:opacity-50 font-mono shadow-[0_0_15px_rgba(0,240,255,0.1)] outline-none"
            >
              {loading ? "SEARCHING..." : "SCAN_CLUSTER"}
            </motion.button>
          </form>
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 mt-3 ml-2 text-tactical-red opacity-60">
              <AlertCircle className="w-3 h-3" />
              <p className="text-[9px] font-mono uppercase tracking-widest">Protocol error: {error}</p>
            </motion.div>
          )}
        </motion.div>

        {/* PRIMARY HUD GRID */}
        <div className="grid grid-cols-12 gap-6 flex-1 px-2">

          {/* COLUMN LEFT: Intelligence Metrics */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <PrivacyRadar score={passport?.overallScore} />

            <div className="tactical-glass p-6 bg-tactical-cyan/[0.03] border-tactical-cyan/10">
              <div className="flex items-center gap-3 mb-5">
                <Terminal className="w-4 h-4 text-tactical-cyan opacity-60" />
                <h4 className="text-[10px] uppercase font-bold text-white/40 tracking-[0.3em] font-mono">Diagnostics</h4>
              </div>
              <div className="space-y-4 font-mono">
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/20 uppercase tracking-tighter">Zk_Session:</span>
                  <span className="text-tactical-cyan opacity-80 font-bold">READY</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/20 uppercase tracking-tighter">Chain_Latency:</span>
                  <span className="text-tactical-cyan opacity-80 font-bold">14ms</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-white/20 uppercase tracking-tighter">Target_Node:</span>
                  <span className="text-tactical-cyan opacity-80 font-bold truncate max-w-[120px]">{address || 'GHOST'}</span>
                </div>
              </div>
            </div>

            <div className={`tactical-glass p-5 bg-tactical-red/[0.02] border-tactical-red/5 ${passport?.overallScore < 50 ? 'animate-pulse' : 'opacity-40'}`}>
              <div className="flex items-center gap-3 mb-2">
                <AlertCircle className="w-4 h-4 text-tactical-red" />
                <h4 className="text-[9px] uppercase font-bold text-tactical-red opacity-80 tracking-widest font-mono">Neural Warning</h4>
              </div>
              <p className="text-[9px] text-white/30 leading-relaxed uppercase font-mono tracking-tight">
                {passport?.overallScore < 50
                  ? "Critical leakage identified in instruction history. immediate surgical rescue required."
                  : "No critical zero-day leaks identified in current session."}
              </p>
            </div>
          </div>

          {/* COLUMN CENTER: Real-time Analysis */}
          <div className="col-span-12 lg:col-span-6">
            <ForensicFeed leaks={leaks} onRescue={executeRescue} loading={loading} />
          </div>

          {/* COLUMN RIGHT: Shadow Vault Node Control */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <ShadowVault commitments={[]} />

            <div className="tactical-glass p-6 border-white/5 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-4 h-4 text-tactical-cyan opacity-50" />
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] font-mono text-white/40">Status_Optimal</span>
              </div>
              <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-tactical-cyan w-full opacity-30" />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION FOOTER: 3D Visualization & Ceremony Status */}
        <div className="grid grid-cols-12 gap-6 px-2 mb-20 md:mb-10">
          <div className="col-span-12 lg:col-span-7 tactical-glass h-[480px] relative overflow-hidden group border-white/5">
            <MerkleTree3D />
          </div>
          <div className="col-span-12 lg:col-span-5 h-[480px]">
            <CeremonyMonitor />
          </div>
        </div>
      </div>

      {/* SYSTEM STATUS BAR */}
      <footer className="tactical-glass m-4 mt-0 mb-32 p-3.5 flex justify-between items-center bg-black/60 relative z-50 border-white/5">
        <div className="flex gap-10 items-center">
          <div className="flex flex-col">
            <span className="text-[8px] text-white/20 uppercase tracking-[0.4em] font-mono">Sector_Alpha</span>
            <span className="text-[9px] text-white/40 font-mono tracking-widest">34.0522° N • 118.2437° W</span>
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-tactical-cyan shadow-[0_0_10px_rgba(0,240,255,1)]" />
            <span className="text-[9px] text-tactical-cyan uppercase tracking-[0.2em] font-bold font-mono">Engine_Synchronized</span>
          </div>
        </div>

        <div className="text-[9px] text-white/10 uppercase tracking-[0.5em] font-mono hover:text-white/30 transition-colors cursor-default">
          SOLVOID_PLATFORM_V.1.2.4_STABLE
        </div>
      </footer>

      <TacticalTerminal />
    </main>
  );
}
