"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import QRCode from "qrcode.react";
import { getWalletTickets } from "@/lib/anchor";

export default function MyTickets() {
  const wallet = useWallet();
  const { publicKey } = wallet;
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    (async () => {
      const tickets = await getWalletTickets(wallet);
      setTickets(tickets);
    })();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8 text-white">
        <h2 className="text-3xl font-bold mb-6">My Tickets</h2>
        {!publicKey ? (
          <p className="text-lg">Please connect your wallet to view tickets.</p>
        ) : tickets.length === 0 ? (
          <p className="text-lg">You don’t currently hold any tickets.</p>
        ) : (
          <div className="space-y-6">
            {tickets.map((ticket, index) => (
              <div key={index} className="bg-white/10 p-4 rounded shadow-md">
                <h3 className="text-xl font-semibold mb-2">{ticket.eventName}</h3>
                <p className="text-sm mb-2">Wallet: {ticket.wallet}</p>
                <QRCode
                  value={`/verify?tokenMint=${ticket.mint}&wallet=${ticket.wallet}`}
                  size={128}
                  bgColor="#ffffff"
                  fgColor="#000000"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
