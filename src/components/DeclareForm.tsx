"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

type ActionOption = { id: string; nom: string; points: number };

export function DeclareForm({
  actions,
  defaultActionId,
}: {
  actions: ActionOption[];
  defaultActionId?: string;
}) {
  const router = useRouter();
  const [actionId, setActionId] = useState(defaultActionId ?? actions[0]?.id ?? "");
  const [mention, setMention] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        actionId,
        mentionedUserPseudo: mention.trim() || undefined,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Une erreur est survenue.");
      return;
    }

    setSuccess(true);
    setMention("");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="action" className="text-sm font-medium text-neutral-700">
          Action
        </label>
        <select
          id="action"
          value={actionId}
          onChange={(e) => setActionId(e.target.value)}
          className="rounded-md border border-sky/50 px-3 py-2 text-sm focus:border-royal focus:outline-none"
        >
          {actions.map((action) => (
            <option key={action.id} value={action.id}>
              {action.nom} — {action.points} pts
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="mention" className="text-sm font-medium text-neutral-700">
          Mentionner un utilisateur (optionnel)
        </label>
        <input
          id="mention"
          type="text"
          placeholder="pseudo"
          value={mention}
          onChange={(e) => setMention(e.target.value)}
          className="rounded-md border border-sky/50 px-3 py-2 text-sm focus:border-royal focus:outline-none"
        />
        <p className="text-xs text-neutral-500">
          Tant que la personne mentionnée n&apos;a pas confirmé, l&apos;action reste marquée
          &quot;non vérifiée&quot;.
        </p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm font-medium text-royal">Action déclarée !</p>}
      <button
        type="submit"
        disabled={loading || !actionId}
        className="rounded-md bg-coral px-4 py-2 text-sm font-semibold text-white shadow-sm hover:brightness-95 disabled:opacity-50"
      >
        {loading ? "Envoi..." : "Déclarer"}
      </button>
    </form>
  );
}
