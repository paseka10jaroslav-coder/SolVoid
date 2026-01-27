"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { PrivacyRadar } from "@/components/PrivacyRadar";
import { ForensicFeed } from "@/components/ForensicFeed";
import { ShadowVault } from "@/components/ShadowVault";
import { MerkleTree3D } from "@/components/MerkleTree3D";
import { CeremonyMonitor } from "@/components/CeremonyMonitor";
import { ShadowNetwork } from "@/components/ShadowNetwork";
import { NetworkHeatmap } from "@/components/NetworkHeatmap";
import { TabNavigation, MobileNavigation, TabValue } from "@/components/TabNavigation";
import { useSolVoid } from "@/hooks/useSolVoid";
import { useToast } from "@/components/Toast";
import { Search, Crosshair, AlertCircle, Shield, Zap, Activity, Wallet, ChevronDown, Menu } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

import { DEFAULT_RPC } from "@/config/rpc";

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [searchError, setSearchError] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>("dashboard");
  const [mounted, setMounted] = useState(false);
  const [balanceSOL, setBalanceSOL] = useState<number | null>(null);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const { info, error: showError } = useToast();
  
  const { publicKey, connected, connecting, disconnect } = useWallet();
  const { connection } = useConnection();
  const { setVisible } = useWalletModal();

  // Only initialize hook on client side
  const solVoidData = typeof window !== 'undefined' ? useSolVoid() : null;
  const {
    address,
    passport,
    leaks,
    loading,
    error,
    rpcError,
    scanAddress,
    executeRescue
  } = solVoidData || {
    address: null,
    passport: null,
    leaks: [],
    loading: false,
    error: null,
    rpcError: false,
    scanAddress: async () => {},
    executeRescue: async () => {}
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close wallet dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (walletDropdownOpen) {
        setWalletDropdownOpen(false);
      }
    };

    if (walletDropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [walletDropdownOpen]);

  // Handle wallet connection
  const handleWalletConnect = () => {
    setVisible(true);
  };

  // Handle shield operation
  const handleShield = async () => {
    if (!publicKey || !balanceSOL || balanceSOL <= 0) {
      showError('Insufficient Balance', 'You need SOL to shield your transactions.');
      return;
    }

    try {
      const amountLamports = Math.floor((balanceSOL * 0.1) * 1e9); // Shield 10% of balance
      const result = await solVoidData?.shield?.(amountLamports);
      
      if (result) {
        info('Shield Operation Started', 'Your privacy shield is being generated. Check console for details.');
      }
    } catch (error) {
      console.error('Shield operation failed:', error);
      showError('Shield Error', 'Failed to initiate shield operation. Please try again.');
    }
  };

  // Handle wallet disconnection
  const handleWalletDisconnect = async () => {
    try {
      await disconnect();
      setWalletDropdownOpen(false);
      info('Wallet Disconnected', 'Your wallet has been disconnected successfully.');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      showError('Disconnection Error', 'Failed to disconnect wallet. Please try again.');
    }
  };

  // Fetch balance when wallet connects
  useEffect(() => {
    if (!connected || !publicKey || !connection) {
      setBalanceSOL(null);
      return;
    }

    const fetchBalance = async () => {
      try {
        const response = await fetch('/api/solvoid', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'getBalance',
            params: { publicKey: publicKey.toBase58(), network: 'mainnet' }
          })
        });

        if (response.ok) {
          const balanceData = await response.json();
          setBalanceSOL(balanceData.balance / 1e9); // Convert lamports to SOL
        }
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalanceSOL(null);
      }
    };

    fetchBalance();
  }, [connected, publicKey, connection]);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset previous error
    setSearchError("");
    
    // Validation
    if (!searchInput.trim()) {
      setSearchError("Please enter a wallet address");
      return;
    }
    
    // Basic Solana address validation
    if (searchInput.length < 32 || searchInput.length > 44) {
      setSearchError("Invalid Solana address format");
      return;
    }
    
    try {
      await scanAddress(searchInput.trim());
      info('Scan Initiated', `Forensic analysis of ${searchInput.slice(0, 8)}... has started.`);
      setSearchInput(""); // Clear input after successful scan
    } catch (err) {
      showError('Analysis Error', 'Failed to connect to the Solana cluster for deep inspection.');
      setSearchError("Failed to scan address");
    }
  };

  // Real-time diagnostics
  const [latency, setLatency] = useState<number | null>(null);
  useEffect(() => {
    const measure = async () => {
      const start = Date.now();
      try {
        await fetch(DEFAULT_RPC.DEVNET, { method: 'HEAD', mode: 'no-cors' });
        setLatency(Date.now() - start);
      } catch (e) {
        setLatency(null);
      }
    };
    measure();
    const interval = setInterval(measure, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Shield className="w-12 h-12 text-tactical-cyan animate-pulse" />
          <p className="text-sm text-white/40">Initializing SolVoid...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col relative overflow-x-hidden selection:bg-tactical-cyan/20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-30 z-0" />
      <div className="fixed inset-0 bg-radial pointer-events-none z-0" />
      <div className="scanner-overlay z-0" />

      {/* Header - Redesigned */}
      <header className="tactical-glass m-3 sm:m-4 p-3 sm:p-4 flex justify-between items-center bg-black/40 relative z-20">
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Logo simplified */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 sm:p-2 bg-tactical-cyan/10 rounded-lg border border-tactical-cyan/20">
              <Shield className="text-tactical-cyan w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-glow-cyan">SolVoid</h1>
              <p className="text-[9px] sm:text-[10px] text-white/40 hidden sm:block">Privacy Infrastructure</p>
            </div>
          </div>
          
          {/* Status badge */}
          <span className="text-[10px] font-medium px-2 py-1 rounded bg-green-500/10 text-green-500 border border-green-500/20">
            ● OPERATIONAL
          </span>
        </div>

        {/* Wallet dropdown - Make it functional */}
        <div className="hidden lg:flex items-center gap-6">
          <div className="relative">
            <button 
              onClick={() => {
                if (!connected) {
                  handleWalletConnect();
                } else {
                  setWalletDropdownOpen(!walletDropdownOpen);
                }
              }}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
              disabled={connecting}
            >
              <Wallet className="w-4 h-4 text-white/60" />
              <span className="text-sm text-white/80 font-mono">
                {connecting ? 'Connecting...' : address ? `${address.slice(0, 4)}…${address.slice(-4)}` : 'Connect Wallet'}
              </span>
              {connected && <ChevronDown className="w-3 h-3 text-white/40" />}
            </button>
            
            {/* Dropdown menu - only show when connected and dropdown is open */}
            {connected && address && walletDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 tactical-glass p-2 border border-white/20 z-50">
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    info('Address Copied', 'Wallet address copied to clipboard');
                    setWalletDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded transition-colors text-xs text-white/80"
                >
                  Copy Address
                </button>
                <button 
                  onClick={() => {
                    window.open(`https://solscan.io/account/${address}`, '_blank');
                    setWalletDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-white/10 rounded transition-colors text-xs text-white/80"
                >
                  View on Solscan
                </button>
                <div className="border-t border-white/10 mt-2 pt-2">
                  <button 
                    onClick={handleWalletDisconnect}
                    className="w-full text-left px-3 py-2 hover:bg-red-500/10 rounded transition-colors text-xs text-red-400"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu */}
        <div className="lg:hidden">
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-white/60" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-3 sm:px-4 pt-4 pb-6 lg:pb-8 relative z-10 max-w-screen-2xl mx-auto w-full">

        {/* Primary Search Section */}
        <motion.div
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <form onSubmit={handleScan} className="w-full">
            <div className="relative group input-with-icons">
              <Search className="input-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 transition-all duration-200 pointer-events-none z-10" />
              <input
                type="text"
                placeholder="Paste wallet or transaction to analyze privacy exposure"
                className={`input-primary pl-12 pr-32 text-lg h-16 sm:h-18 ${searchError ? 'error' : ''}`}
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setSearchError("");
                }}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !!searchError}
                  className="btn-primary px-6 py-3 text-base font-medium min-w-[140px]"
                >
                  {loading ? "Scanning..." : "Run Forensic Scan"}
                </motion.button>
              </div>
            </div>
            <p className="text-xs text-white/40 mt-2 ml-2">
              Scans transactions, signer linkages, and state persistence
            </p>
          </form>
        </motion.div>

        {/* Tab Navigation */}
        <div className="hidden lg:block mb-8">
          <TabNavigation activeTab={activeTab} onChange={setActiveTab} />
        </div>

        {/* Search Error Display */}
        <AnimatePresence>
          {searchError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-4 px-3 sm:px-4 py-2 sm:py-3 bg-tactical-red/10 border border-tactical-red/20 rounded-lg"
            >
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-tactical-red flex-shrink-0" />
              <p className="text-xs sm:text-xs text-tactical-red">{searchError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2 mb-4 px-3 sm:px-4 py-2 sm:py-3 bg-tactical-red/10 border border-tactical-red/20 rounded-lg"
            >
              <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-tactical-red flex-shrink-0" />
              <p className="text-xs sm:text-xs text-tactical-red">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === "dashboard" && (
            <motion.div
              key={`dashboard-${address || 'none'}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Stats Row - Redesigned to 3 cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="stat-card group hover:border-tactical-cyan/20 transition-colors p-4 sm:p-6">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-tactical-cyan mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="stat-label text-sm mb-2">Privacy Index</div>
                  <div className="stat-value text-2xl sm:text-3xl text-tactical-cyan font-bold">{passport?.overallScore ?? '--'}</div>
                </div>
                <div className="stat-card group hover:border-tactical-purple/20 transition-colors p-4 sm:p-6">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-tactical-purple mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="stat-label text-sm mb-2">Active Privacy Leaks</div>
                  <div className="stat-value text-2xl sm:text-3xl text-tactical-purple font-bold">{leaks.reduce((acc, r) => acc + (r.leaks?.length || 0), 0)}</div>
                </div>
                <div className="stat-card group hover:border-tactical-green/20 transition-colors p-4 sm:p-6">
                  <Activity className="w-5 h-5 sm:w-6 sm:h-6 text-tactical-green mx-auto mb-3 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="stat-label text-sm mb-2">Transactions Analyzed</div>
                  <div className="stat-value text-2xl sm:text-3xl text-tactical-green font-bold">{leaks.length || '--'}</div>
                </div>
              </div>

              {/* Main Grid - ForensicFeed Dominates */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
                {/* Left Column - Simplified */}
                <div className="xl:col-span-4 space-y-4 sm:space-y-6">
                  {/* Simplified PrivacyRadar */}
                  <div className="tactical-glass p-4 sm:p-6">
                    <div className="relative w-32 h-32 sm:w-36 sm:h-36 mx-auto mb-4">
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="50%" cy="50%" r="52" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6"></circle>
                        <circle cx="50%" cy="50%" r="52" fill="none" stroke="#00ff88" strokeWidth="6" strokeLinecap="round" strokeDasharray="326.7256359733385" strokeDashoffset="0"></circle>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl font-bold tracking-tighter text-tactical-green">{passport?.overallScore ?? '--'}</span>
                        <span className="text-xs text-white/30 uppercase font-mono">Privacy Index</span>
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <div className="flex justify-between text-xs text-white/40">
                        <span>Cluster Integrity</span>
                        <span>100%</span>
                      </div>
                      <div className="progress-bar">
                        <div className="progress-fill bg-tactical-green" style={{width: '100%'}}></div>
                      </div>
                      <p className="text-[9px] text-white/20 text-center uppercase tracking-[0.2em] pt-2 border-t border-white/5">
                        No synthetic metrics
                      </p>
                    </div>
                  </div>
                </div>

                {/* Center Column - ForensicFeed Dominates */}
                <div className="xl:col-span-8">
                  <ForensicFeed leaks={leaks} onRescue={executeRescue} loading={loading} />
                </div>
              </div>

              {/* Compact Control Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                {/* Private Balance */}
                <div className="lg:col-span-4">
                  <div className="tactical-glass p-4">
                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Private Balance</h4>
                    <div className="space-y-2">
                      <div className="text-lg font-bold text-white">
                        {balanceSOL !== null ? `${balanceSOL.toFixed(4)} SOL` : '---'}
                      </div>
                      <div className="text-sm text-white/60">
                        {balanceSOL !== null ? `≈ $${(balanceSOL * 180).toFixed(2)}` : '---'}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors">
                          Copy Address
                        </button>
                        <button className="text-xs px-3 py-1 bg-white/10 rounded hover:bg-white/20 transition-colors">
                          Solscan
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="lg:col-span-4">
                  <div className="tactical-glass p-4">
                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">System Status</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">RPC Latency</span>
                        <span className="text-tactical-green font-medium">{latency ? `${latency}ms` : '---'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">Relay Nodes</span>
                        <span className="text-tactical-cyan font-medium">4 active</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-white/40">ZK Circuit</span>
                        <span className="text-tactical-purple font-medium">Groth16</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visualizations - Collapsed */}
                <div className="lg:col-span-4">
                  <div className="tactical-glass p-4">
                    <h4 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Visualizations</h4>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-xs">
                        Merkle Tree →
                      </button>
                      <button className="w-full text-left px-3 py-2 bg-white/5 rounded hover:bg-white/10 transition-colors text-xs">
                        Network Activity →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "network" && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-6">
                <div className="xl:col-span-8 h-[400px] sm:h-[500px]">
                  <NetworkHeatmap />
                </div>
                <div className="xl:col-span-4 h-[400px] sm:h-[500px]">
                  <ShadowNetwork />
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "shield" && (
            <motion.div
              key="shield"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Entropy Coordination Section */}
              <div className="tactical-glass p-6">
                <h2 className="text-xl font-bold text-white mb-4">Entropy Coordination</h2>
                <p className="text-sm text-white/60 mb-6">Live entropy aggregation from distributed participants</p>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Contribution Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-tactical-green rounded-full"></div>
                        <span className="text-white">System Operational</span>
                      </div>
                      <div className="text-sm text-white/40">
                        <p>Ready to accept entropy contributions</p>
                        <p>Current participants: 0</p>
                      </div>
                      <button className="btn-primary w-full py-3 mt-4">
                        Contribute Entropy
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Live Participants</h3>
                    <div className="text-sm text-white/40">
                      <p>No active participants</p>
                      <p>Join the ceremony to strengthen privacy guarantees</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shield Tools */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="tactical-glass p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Privacy Shield</h3>
                  <p className="text-sm text-white/60 mb-4">Create anonymous transactions</p>
                  <button className="btn-primary w-full py-3" onClick={handleShield}>
                    Shield Transaction
                  </button>
                </div>
                
                <div className="tactical-glass p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Private Balance</h3>
                  <div className="space-y-2">
                    <div className="text-lg font-bold text-white">
                      {balanceSOL !== null ? `${balanceSOL.toFixed(4)} SOL` : '---'}
                    </div>
                    <div className="text-sm text-white/60">
                      {balanceSOL !== null ? `≈ $${(balanceSOL * 180).toFixed(2)}` : '---'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === "settings" && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              <div className="tactical-glass p-6 lg:p-8 space-y-8">
                <div>
                  <h2 className="text-xl font-bold text-white mb-2">Settings</h2>
                  <p className="text-sm text-white/60">Configure your privacy preferences</p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/70">RPC Endpoint</label>
                    <input
                      type="text"
                      placeholder="https://api.mainnet-beta.solana.com"
                      className="input-primary text-base"
                      defaultValue="https://api.mainnet-beta.solana.com"
                    />
                    <p className="text-xs text-white/40">Custom RPC for improved privacy</p>
                  </div>

                  <div className="space-y-3">
                    <label className="text-sm font-medium text-white/70">Privacy Level</label>
                    <select className="input-primary text-base" defaultValue="3">
                      <option value="2">2 Hops (Faster)</option>
                      <option value="3">3 Hops (Balanced)</option>
                      <option value="5">5 Hops (Maximum Privacy)</option>
                    </select>
                    <p className="text-xs text-white/40">More hops = better anonymity but slower</p>
                  </div>

                  <div className="flex items-center justify-between py-4 border-y border-white/5">
                    <div>
                      <p className="text-sm text-white/80">Use Private Mempool</p>
                      <p className="text-xs text-white/40">Bypass public transaction pool</p>
                    </div>
                    <button className="w-12 h-6 bg-tactical-cyan/20 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-tactical-cyan rounded-full" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-white/5">
                    <div>
                      <p className="text-sm text-white/80">Show Activity Logs</p>
                      <p className="text-xs text-white/40">Display real-time events</p>
                    </div>
                    <button className="w-12 h-6 bg-tactical-green/20 rounded-full relative">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-tactical-green rounded-full" />
                    </button>
                  </div>
                </div>

                <button className="btn-primary w-full text-base py-3">Save Settings</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="hidden lg:block tactical-glass mx-3 sm:mx-4 mb-4 p-4 flex justify-between items-center bg-black/60 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-tactical-green shadow-[0_0_8px_rgba(0,255,136,0.8)]"></div>
          <span className="text-sm text-tactical-green font-medium">System Operational</span>
        </div>
        <span className="text-xs text-white/40">SolVoid v1.3.0</span>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNavigation activeTab={activeTab} onChange={setActiveTab} />
    </main>
  );
}
