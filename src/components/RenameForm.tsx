"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Pencil, X } from "lucide-react";

export function RenameForm({ currentPseudo }: { currentPseudo: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pseudo, setPseudo] = useState(currentPseudo);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/me/pseudo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pseudo }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    const data = await res.json();
    setEditing(false);
    router.push(`/profil/${data.pseudo}`);
    router.refresh();
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{currentPseudo}</h1>
        <button
          onClick={() => setEditing(true)}
          aria-label="Renommer"
          className="flex items-center justify-center rounded-full bg-white/20 p-1.5 hover:bg-white/30"
        >
          <Pencil size={14} className="text-white" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          minLength={3}
          maxLength={20}
          autoFocus
          className="w-32 rounded-md border-0 bg-white/20 px-2 py-1 text-lg font-bold text-white placeholder-white/60 focus:bg-white/30 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white hover:bg-white/30 disabled:opacity-50"
        >
          {loading ? "..." : "OK"}
        </button>
        <button
          type="button"
          onClick={() => {
            setEditing(false);
            setPseudo(currentPseudo);
            setError(null);
          }}
          aria-label="Annuler"
          className="flex items-center justify-center rounded-full bg-white/20 p-1.5 hover:bg-white/30"
        >
          <X size={14} className="text-white" />
        </button>
      </form>
      {error && <p className="text-xs font-medium text-white">{error}</p>}
    </div>
  );
}
