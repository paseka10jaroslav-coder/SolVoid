import type { Metadata } from "next";
import "./globals.css";

import { WalletContextProvider } from "@/components/WalletContextProvider";

export const metadata: Metadata = {
  title: "SolVoid | Tactical Command Center",
  description: "Enterprise-grade privacy forensic dashboard for the Solana ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <div className="bg-pulse"></div>
        <WalletContextProvider>
          {children}
        </WalletContextProvider>
      </body>
    </html>
  );
}
