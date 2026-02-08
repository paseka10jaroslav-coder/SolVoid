"use client";

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { useRouter } from 'next/navigation';
import { Shield, Wallet, Lock, Zap, Eye, Database, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const { publicKey, connected, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // Generate random values once for particles
  const particleData = useState(() => 
    [...Array(20)].map(() => ({
      initialX: Math.random() * 1920,
      initialY: Math.random() * 1080,
      endY: Math.random() * 1080,
      endX: Math.random() * 1920,
      duration: 20 + Math.random() * 10,
    }))
  )[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if already connected
  useEffect(() => {
    if (connected && publicKey) {
      router.push('/');
    }
  }, [connected, publicKey, router]);

  const handleConnect = () => {
    setVisible(true);
  };

  if (!mounted) {
    return null;
  }

  return (
    <main className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-20 z-0" />
      <div className="fixed inset-0 bg-radial pointer-events-none z-0" />
      <div className="scanner-overlay z-0" />

      {/* Floating particles effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {particleData.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-tactical-cyan/30 rounded-full"
            initial={{
              x: particle.initialX,
              y: particle.initialY,
            }}
            animate={{
              y: [null, particle.endY],
              x: [null, particle.endX],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding & Info */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-tactical-cyan/10 rounded-xl border border-tactical-cyan/20">
                  <Shield className="w-10 h-10 text-tactical-cyan" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-glow-cyan tracking-tight">
                    SolVoid
                  </h1>
                  <p className="text-sm text-white/40">Privacy Infrastructure</p>
                </div>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight">
                Enterprise Zero-Knowledge<br />
                <span className="text-tactical-cyan">Privacy Protocol</span>
              </h2>

              <p className="text-white/60 text-lg leading-relaxed">
                Access the most advanced privacy forensics dashboard for Solana.
                Shield your transactions with institutional-grade ZK-SNARK technology.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-tactical-purple/10 border border-tactical-purple/20 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-tactical-purple" />
                </div>
                <h3 className="text-sm font-bold text-white">Zero-Knowledge Proofs</h3>
                <p className="text-xs text-white/40">Groth16 verification</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-tactical-green/10 border border-tactical-green/20 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-tactical-green" />
                </div>
                <h3 className="text-sm font-bold text-white">Privacy Forensics</h3>
                <p className="text-xs text-white/40">Ghost score analysis</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-tactical-cyan/10 border border-tactical-cyan/20 flex items-center justify-center">
                  <Database className="w-5 h-5 text-tactical-cyan" />
                </div>
                <h3 className="text-sm font-bold text-white">Shadow Vault</h3>
                <p className="text-xs text-white/40">Shielded commitments</p>
              </div>

              <div className="space-y-2">
                <div className="w-10 h-10 rounded-lg bg-tactical-red/10 border border-tactical-red/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-tactical-red" />
                </div>
                <h3 className="text-sm font-bold text-white">Atomic Rescue</h3>
                <p className="text-xs text-white/40">Emergency recovery</p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Login Card */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="tactical-glass p-6 sm:p-8 lg:p-12 border border-white/10 rounded-2xl backdrop-blur-xl"
          >
            <div className="space-y-8">
              <div className="text-center space-y-3">
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                  Access Dashboard
                </h3>
                <p className="text-white/60 text-sm">
                  Connect your Solana wallet to begin
                </p>
              </div>

              <div className="space-y-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConnect}
                  disabled={connecting}
                  className="w-full btn-primary py-4 sm:py-6 text-base sm:text-lg font-bold uppercase tracking-widest flex items-center justify-center gap-2 sm:gap-3 shadow-[0_0_30px_rgba(0,243,255,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Wallet className="w-6 h-6" />
                  {connecting ? 'Connecting...' : 'Connect Wallet'}
                  <ArrowRight className="w-5 h-5" />
                </motion.button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-black px-4 text-white/40">Supported Wallets</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {['Phantom', 'Solflare', 'Coinbase'].map((wallet) => (
                    <div
                      key={wallet}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 text-center hover:bg-white/10 transition-colors"
                    >
                      <p className="text-xs text-white/60 font-medium">{wallet}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-tactical-cyan flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Secure Connection</p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      Your wallet credentials never leave your device. All operations are signed locally.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-tactical-purple flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-white mb-1">Privacy First</p>
                    <p className="text-xs text-white/40 leading-relaxed">
                      No personal data collected. No third-party tracking. Open source and audited.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Info Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 tactical-glass p-6 border border-white/10 rounded-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-tactical-green rounded-full shadow-[0_0_10px_#00ff88]" />
              <span className="text-sm text-tactical-green font-bold uppercase tracking-wider">
                Protocol Operational
              </span>
            </div>
            <div className="text-xs text-white/30 font-mono">
              SOLVOID_AUTH_V.1.0.0_STABLE
            </div>
            <div className="text-xs text-white/40">
              Built for Solana Privacy Hackathon 2026
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
