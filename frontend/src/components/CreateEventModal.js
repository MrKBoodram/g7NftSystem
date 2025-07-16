"use client";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { createEvent } from "@/lib/anchor";


export default function CreateEventModal({ open, onClose, onSuccess }) {
  const wallet = useWallet();
  const [form, setForm] = useState({
    name: "testa",
    date: "2025-12-08",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await createEvent(wallet, form);
      if (onSuccess) onSuccess(res);
      onClose();
    } catch (err) {
      alert("Error creating event: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="max-w-xl w-full bg-white/10 backdrop-blur-sm rounded-lg p-8">
        <button
          className="absolute top-4 right-4 text-white text-2xl"
          onClick={onClose}>&times;
        </button>
        <h2 className="text-3xl font-bold text-white mb-6">Create Event</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white mb-2">Event Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full p-2 rounded" />
          </div>
          <div>
            <label className="block text-white mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full p-2 rounded" />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded">
            {loading ? "Creating..." : "Create Event"}
          </button>
        </form>
      </div>
    </div>
  );
}