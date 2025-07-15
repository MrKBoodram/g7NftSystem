"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";
import QRCode from "qrcode.react";

const KNOWN_EVENT_TOKENS = {
  "TOKEN_MINT_ADDRESS_1": { name: "Solana Summer Fest" },
  "TOKEN_MINT_ADDRESS_2": { name: "ChainHack 2025" },
};

const connection = new Connection(clusterApiUrl("devnet"));

export default function MyTickets() {
  const { publicKey } = useWallet();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    if (!publicKey) return;

    (async () => {
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
        });

        const ownedTickets = tokenAccounts.value
          .map(({ account }) => account.data.parsed.info)
          .filter((info) => {
            const mint = info.mint;
            const amount = parseInt(info.tokenAmount.amount);
            return KNOWN_EVENT_TOKENS[mint] && amount > 0;
          })
          .map((info) => {
            const mint = info.mint;
            return {
              eventName: KNOWN_EVENT_TOKENS[mint].name,
              mint: mint,
              wallet: publicKey.toBase58(),
            };
          });

        setTickets(ownedTickets);
      } catch (e) {
        console.error("Error fetching token accounts:", e);
      }
    })();
  }, [publicKey]);

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
