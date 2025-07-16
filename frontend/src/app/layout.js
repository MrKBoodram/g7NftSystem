import { Inter } from "next/font/google";
import "./globals.css";
import WalletProvider from "@/components/WalletProvider";
import Link from "next/link"; // ✅ import Link for navigation

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
        <WalletProvider>
          {/* ✅ Add a basic navbar here */}
          <nav className="bg-black/30 backdrop-blur px-6 py-4 text-white flex space-x-6">
            <Link href="/" className="hover:underline">Home</Link>
            <Link href="/create-event" className="hover:underline">Create Event</Link>
            <Link href="/my-tickets" className="hover:underline">My Tickets</Link>
          </nav>
          {children}
        </WalletProvider>
      </body>
    </html>
  );
}
