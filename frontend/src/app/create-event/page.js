"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateEvent() {
  const [form, setForm] = useState({
    name: "",
    date: "",
    price: "",
    quantity: "",
  });
  const router = useRouter();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    // Here you would handle event creation logic (API call, etc.)
    alert(`Event Created:\n${JSON.stringify(form, null, 2)}`);
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-sm rounded-lg p-8">
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
              className="w-full p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Price (SOL)</label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-white mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full p-2 rounded"
            />
          </div>
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
          >
            Create Event
          </button>
        </form>
      </div>
    </main>
  );
}