"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CreateEventModal from "@/components/CreateEventModal";

export default function CreateEvent() {
  const router = useRouter();

  function handleSuccess(tx) {
    alert(`Event created!\n${tx}`)
    router.push("/");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-900 to-blue-900 p-8">
      <CreateEventModal
              open={true}
              onClose={() => router.replace('/')}
              onSuccess={handleSuccess}
            />
    </main>
  );
}