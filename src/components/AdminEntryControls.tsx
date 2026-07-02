"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminEntryControls({
  entryId,
  statut,
}: {
  entryId: string;
  statut: "non_verifie" | "confirme" | "conteste";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatut(next: "confirme" | "conteste") {
    setLoading(true);
    await fetch(`/api/entries/${entryId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: next }),
    });
    setLoading(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm("Supprimer définitivement cette entrée ?")) return;
    setLoading(true);
    await fetch(`/api/entries/${entryId}`, { method: "DELETE" });
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {statut === "conteste" ? (
        <button
          onClick={() => setStatut("confirme")}
          disabled={loading}
          className="text-xs font-medium text-green-700 hover:underline disabled:opacity-50"
        >
          Restaurer
        </button>
      ) : (
        <button
          onClick={() => setStatut("conteste")}
          disabled={loading}
          className="text-xs font-medium text-orange-700 hover:underline disabled:opacity-50"
        >
          Contester
        </button>
      )}
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-medium text-red-700 hover:underline disabled:opacity-50"
      >
        Supprimer
      </button>
    </div>
  );
}
