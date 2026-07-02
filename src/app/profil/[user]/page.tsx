import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getActiveSeason } from "@/lib/season";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/format";

const STATUT_LABELS: Record<string, string> = {
  non_verifie: "Non vérifiée",
  confirme: "Confirmée",
  conteste: "Contestée",
};

export default async function ProfilPage({
  params,
}: {
  params: Promise<{ user: string }>;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect("/login");

  const { user: pseudo } = await params;
  const profileUser = await prisma.user.findUnique({ where: { pseudo } });
  if (!profileUser) notFound();

  const season = await getActiveSeason();

  const entries = await prisma.entry.findMany({
    where: { userId: profileUser.id, ...(season ? { seasonId: season.id } : {}) },
    include: { action: true },
    orderBy: { date: "desc" },
  });

  const countingEntries = entries.filter((e) => e.statut !== "conteste");
  const totalScore = countingEntries.reduce((sum, e) => sum + e.action.points, 0);

  const repartition = new Map<string, number>();
  for (const entry of countingEntries) {
    repartition.set(entry.action.nom, (repartition.get(entry.action.nom) ?? 0) + 1);
  }

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl bg-gradient-to-br from-royal to-coral p-6 text-white shadow-sm">
        <p className="text-sm text-white/80">Profil</p>
        <h1 className="text-2xl font-bold">{profileUser.pseudo}</h1>
        <p className="mt-2 text-4xl font-extrabold">{totalScore} pts</p>
        <p className="text-xs text-white/80">Saison en cours</p>
      </section>

      {repartition.size > 0 && (
        <section className="rounded-xl border border-cream bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-royal">Répartition par action</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {Array.from(repartition.entries()).map(([nom, count]) => (
              <li
                key={nom}
                className="rounded-full bg-cream px-3 py-1 text-xs font-medium text-royal"
              >
                {nom} × {count}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="rounded-xl border border-cream bg-white shadow-sm">
        <h2 className="px-4 pt-4 text-sm font-semibold text-royal">Historique</h2>
        <ul className="mt-2 flex flex-col divide-y divide-cream">
          {entries.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-neutral-500">
              Aucune action déclarée cette saison.
            </li>
          )}
          {entries.map((entry) => (
            <li key={entry.id} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-neutral-800">
                {entry.action.nom} ({entry.action.points} pts)
              </span>
              <span className="flex items-center gap-3">
                <span className="text-xs text-neutral-500">{formatDateTime(entry.date)}</span>
                <span className="text-xs font-medium text-neutral-600">
                  {STATUT_LABELS[entry.statut]}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
