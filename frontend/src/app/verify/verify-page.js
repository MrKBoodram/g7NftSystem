"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Connection, clusterApiUrl, PublicKey } from "@solana/web3.js";

const connection = new Connection(clusterApiUrl("devnet"));

export default function VerifyTicket() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const tokenMint = searchParams.get("tokenMint");
    const wallet = searchParams.get("wallet");

    if (!tokenMint || !wallet) {
      setStatus("error");
      setMessage("Invalid URL: tokenMint and wallet are required.");
      return;
    }

    (async () => {
      try {
        const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
          new PublicKey(wallet),
          { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }
        );

        const hasTicket = tokenAccounts.value.some(({ account }) => {
          const info = account.data.parsed.info;
          return info.mint === tokenMint && parseInt(info.tokenAmount.amount) > 0;
        });

        if (hasTicket) {
          setStatus("valid");
          setMessage(`✅ Wallet ${wallet} holds a valid ticket.`);
        } else {
          setStatus("invalid");
          setMessage(`❌ Wallet ${wallet} does not hold a valid ticket.`);
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
        setMessage("An error occurred while verifying the ticket.");
      }
    })();
  }, [searchParams]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 p-8 text-white">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-sm rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">Ticket Verification</h2>
        <p className={`text-xl ${status === "valid" ? "text-green-400" : status === "invalid" ? "text-red-400" : "text-yellow-300"}`}>
          {message}
        </p>
      </div>
    </main>
  );
}
