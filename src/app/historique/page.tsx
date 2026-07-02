import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";
import { AdminEntryControls } from "@/components/AdminEntryControls";

const STATUT_LABELS: Record<string, string> = {
  non_verifie: "Non vérifiée",
  confirme: "Confirmée",
  conteste: "Contestée",
};

const STATUT_STYLES: Record<string, string> = {
  non_verifie: "bg-amber-100 text-amber-800",
  confirme: "bg-green-100 text-green-800",
  conteste: "bg-red-100 text-red-800",
};

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<{ user?: string; action?: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { user: userFilter, action: actionFilter } = await searchParams;

  const [entries, users, actions] = await Promise.all([
    prisma.entry.findMany({
      where: {
        ...(userFilter ? { user: { pseudo: userFilter } } : {}),
        ...(actionFilter ? { actionId: actionFilter } : {}),
      },
      include: { user: true, action: true, mentionedUser: true },
      orderBy: { date: "desc" },
      take: 100,
    }),
    prisma.user.findMany({ orderBy: { pseudo: "asc" } }),
    prisma.action.findMany({ orderBy: { points: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-royal">📜 Historique</h1>

      <form className="flex flex-wrap items-end gap-3 rounded-xl border border-cream bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label htmlFor="user" className="text-xs font-medium text-neutral-600">
            Utilisateur
          </label>
          <select
            id="user"
            name="user"
            defaultValue={userFilter ?? ""}
            className="rounded-md border border-sky/50 px-2 py-1.5 text-sm"
          >
            <option value="">Tous</option>
            {users.map((u) => (
              <option key={u.id} value={u.pseudo}>
                {u.pseudo}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="action" className="text-xs font-medium text-neutral-600">
            Action
          </label>
          <select
            id="action"
            name="action"
            defaultValue={actionFilter ?? ""}
            className="rounded-md border border-sky/50 px-2 py-1.5 text-sm"
          >
            <option value="">Toutes</option>
            {actions.map((a) => (
              <option key={a.id} value={a.id}>
                {a.nom}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-royal px-3 py-1.5 text-sm font-semibold text-white hover:brightness-110"
        >
          Filtrer
        </button>
        {(userFilter || actionFilter) && (
          <Link href="/historique" className="text-sm text-neutral-500 hover:underline">
            Réinitialiser
          </Link>
        )}
      </form>

      <ul className="flex flex-col divide-y divide-cream rounded-xl border border-cream bg-white shadow-sm">
        {entries.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-neutral-500">Aucune entrée.</li>
        )}
        {entries.map((entry) => (
          <li key={entry.id} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="flex flex-col gap-1">
              <p className="text-sm text-neutral-800">
                <Link href={`/profil/${entry.user.pseudo}`} className="font-medium text-royal hover:underline">
                  {entry.user.pseudo}
                </Link>{" "}
                — {entry.action.nom} ({entry.action.points} pts)
                {entry.mentionedUser && (
                  <>
                    {" "}
                    · mentionne{" "}
                    <Link
                      href={`/profil/${entry.mentionedUser.pseudo}`}
                      className="font-medium text-royal hover:underline"
                    >
                      {entry.mentionedUser.pseudo}
                    </Link>
                  </>
                )}
              </p>
              <p className="text-xs text-neutral-500">{formatDateTime(entry.date)}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUT_STYLES[entry.statut]}`}
              >
                {STATUT_LABELS[entry.statut]}
              </span>
              {currentUser.admin && <AdminEntryControls entryId={entry.id} statut={entry.statut} />}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
