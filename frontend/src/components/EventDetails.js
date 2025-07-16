"use client";
import React from "react";

export default function EventDetails({ event, onAction }) {
  if (!event) return null;

  const { account, publicKey } = event;
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-4 text-white">
      <h3 className="text-2xl font-bold mb-2">{account.name}</h3>
      <p className="mb-1"><span className="font-semibold">Date:</span> {account.date}</p>
      <p className="mb-1"><span className="font-semibold">Event PublicKey:</span> {publicKey?.toBase58()}</p>
      <div className="flex justify-end">
        <button
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-semibold"
          onClick={onAction}>
            Mint
        </button>
      </div>
    </div>
  );
}