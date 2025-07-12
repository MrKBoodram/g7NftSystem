import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";

// Import wallet adapter styles globally
import "@solana/wallet-adapter-react-ui/styles.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "SolTix - Solana Event Ticketing",
  description: "Decentralized event ticketing on Solana"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
