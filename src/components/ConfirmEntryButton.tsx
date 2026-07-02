"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ConfirmEntryButton({ entryId }: { entryId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleConfirm() {
    setLoading(true);
    await fetch(`/api/entries/${entryId}/confirm`, { method: "POST" });
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      onClick={handleConfirm}
      disabled={loading}
      className="rounded-md bg-coral px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95 disabled:opacity-50"
    >
      {loading ? "..." : "Confirmer"}
    </button>
  );
}
