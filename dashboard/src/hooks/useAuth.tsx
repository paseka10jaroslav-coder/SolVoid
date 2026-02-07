"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  address: string | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  address: null,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, connected, disconnect } = useWallet();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check for stored session on mount
  useEffect(() => {
    // Check if there's a stored session and validate it
    if (typeof window !== 'undefined') {
      const storedSession = localStorage.getItem('solvoid_session');
      if (storedSession && connected && publicKey) {
        try {
          const session = JSON.parse(storedSession);
          if (session.address === publicKey.toBase58()) {
            setIsAuthenticated(true);
          }
        } catch (e) {
          // Invalid session data, clear it
          localStorage.removeItem('solvoid_session');
        }
      }
    }
    setIsLoading(false);
  }, [connected, publicKey]);

  // Update auth state when wallet connects/disconnects
  useEffect(() => {
    if (connected && publicKey) {
      const address = publicKey.toBase58();
      // Store session - only on client side
      if (typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('solvoid_session');
        const shouldAuth = !storedSession || JSON.parse(storedSession).address === address;
        
        if (shouldAuth) {
          localStorage.setItem('solvoid_session', JSON.stringify({
            address,
            timestamp: Date.now(),
          }));
          setIsAuthenticated(true);
        }
      }
    } else if (!connected) {
      // Clear session
      if (typeof window !== 'undefined') {
        localStorage.removeItem('solvoid_session');
      }
      setIsAuthenticated(false);
    }
  }, [connected, publicKey]);

  const login = () => {
    router.push('/login');
  };

  const logout = async () => {
    try {
      await disconnect();
      setIsAuthenticated(false);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('solvoid_session');
      }
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    address: publicKey?.toBase58() || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
