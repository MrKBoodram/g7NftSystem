"use client";

import { getEvents, mintTicket } from "@/lib/anchor";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import EventDetails from "@/components/EventDetails";
import CreateEventModal from "@/components/CreateEventModal";


export default function Home() {
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  let [events, setEvents] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  
  useEffect(() => {
    const fn = async() => {
      const res = await getEvents(wallet);
      setEvents(res);
    };
    fn();
  }, []);
  
  async function handleMintTicket(event) {
    const res = await mintTicket(wallet, event);
    alert(`minted ticket: res: ${res}`);
  }
  
  return (
    <>
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <div className="max-w-4xl mx-auto">
        <nav className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white">SolTix</h1>
          <WalletMultiButton />
        </nav>

        <div className="text-center text-white">
          <h2 className="text-6xl font-bold mb-6">
            Decentralized Event Ticketing
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Secure, transparent, and fraud-proof ticketing on Solana
          </p>

          {connected ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
              <h3 className="text-2xl font-semibold mb-4">Welcome! 🎉</h3>
              <p className="text-lg">
                Connected wallet: {publicKey?.toString().slice(0, 8)}...
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div 
                  className="bg-purple-600 hover:bg-purple-700 p-6 rounded-lg cursor-pointer transition-colors"
                  onClick={() => setModalOpen(true)}>
                  <h4 className="text-xl font-semibold mb-2">Create Event</h4>
                  <p className="opacity-90">Issue tickets as tokens</p>
                </div>
                <div className="bg-green-600 hover:bg-green-700 p-6 rounded-lg cursor-pointer transition-colors">
                  <h4 className="text-xl font-semibold mb-2">My Tickets</h4>
                  <p className="opacity-90">View QR codes</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
              <h3 className="text-2xl font-semibold mb-4">
                Connect Your Wallet to Get Started
              </h3>
              <p className="text-lg opacity-90">
                Connect your Solana wallet to create events, buy tickets, and
                more.
              </p>
            </div>
          )}
        </div>
        {events.map((event, ix) => {
          return (<EventDetails key={ix} event={event} onAction={() => handleMintTicket(event)} />);
        })}
      </div>
    </main>
    <CreateEventModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(tx) => alert(`Event created!\n${tx}`)}
      />
    </>
  );
}
