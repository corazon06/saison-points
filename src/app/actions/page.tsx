import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getActiveSeason, isSeasonOpen } from "@/lib/season";
import { prisma } from "@/lib/prisma";

export default async function ActionsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [actions, season] = await Promise.all([
    prisma.action.findMany({ orderBy: { points: "asc" } }),
    getActiveSeason(),
  ]);
  const seasonClosed = !season || !isSeasonOpen(season);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-royal">⚽ J&apos;ai marqué...</h1>

      <ul className="flex flex-col gap-2">
        {actions.map((action) => (
          <li
            key={action.id}
            className="flex items-center justify-between rounded-xl border border-cream bg-white px-4 py-3 shadow-sm"
          >
            <span className="text-sm font-medium text-neutral-900">{action.nom}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-royal">{action.points} pts</span>
              {seasonClosed ? (
                <button
                  disabled
                  title="Saison terminée"
                  className="cursor-not-allowed rounded-md bg-cream px-3 py-1.5 text-xs font-medium text-neutral-400"
                >
                  Déclarer
                </button>
              ) : (
                <Link
                  href={`/actions/nouvelle?actionId=${action.id}`}
                  className="rounded-md bg-coral px-3 py-1.5 text-xs font-semibold text-white hover:brightness-95"
                >
                  Déclarer
                </Link>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
