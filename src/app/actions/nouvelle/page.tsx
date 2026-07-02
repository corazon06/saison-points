import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getActiveSeason, isSeasonOpen } from "@/lib/season";
import { prisma } from "@/lib/prisma";
import { DeclareForm } from "@/components/DeclareForm";

export default async function NouvelleActionPage({
  searchParams,
}: {
  searchParams: Promise<{ actionId?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { actionId } = await searchParams;
  const [actions, season] = await Promise.all([
    prisma.action.findMany({ orderBy: { points: "asc" } }),
    getActiveSeason(),
  ]);
  const seasonClosed = !season || !isSeasonOpen(season);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="text-2xl font-bold text-royal">Déclarer une action</h1>

      {seasonClosed ? (
        <div className="rounded-xl border border-cream bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-coral">
            La saison est terminée, il n&apos;est plus possible de déclarer d&apos;action.
          </p>
          <Link
            href="/classement"
            className="mt-4 inline-block text-sm font-semibold text-royal hover:underline"
          >
            Voir le classement final
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-cream bg-white p-6 shadow-sm">
          <DeclareForm actions={actions} defaultActionId={actionId} />
        </div>
      )}
    </div>
  );
}
