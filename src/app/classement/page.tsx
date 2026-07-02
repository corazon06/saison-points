import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getActiveSeason, isSeasonOpen } from "@/lib/season";
import { getClassement } from "@/lib/scoring";
import { formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { Countdown } from "@/components/Countdown";
import { ConfirmEntryButton } from "@/components/ConfirmEntryButton";

const MEDALS = ["🥇", "🥈", "🥉"];

// Taille dégressive : 1er > 2e > 3e, puis tous les suivants ont la même taille.
const RANK_TIERS = [
  {
    box: "bg-coral text-white py-5 px-4 shadow-md",
    medal: "text-3xl",
    name: "text-lg font-bold",
    points: "text-xl font-extrabold",
  },
  {
    box: "bg-royal text-white py-4 px-4 shadow-sm",
    medal: "text-2xl",
    name: "text-base font-semibold",
    points: "text-lg font-bold",
  },
  {
    box: "bg-sky text-royal py-3.5 px-4 shadow-sm",
    medal: "text-xl",
    name: "text-sm font-semibold",
    points: "text-base font-bold",
  },
];
const DEFAULT_TIER = {
  box: "border border-cream bg-white py-3 px-4 text-neutral-900",
  medal: "text-xs text-neutral-400",
  name: "text-sm font-medium",
  points: "text-sm font-semibold text-coral",
};

export default async function ClassementPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const season = await getActiveSeason();
  const classement = season ? await getClassement(season.id) : [];

  const pendingMentions = season
    ? await prisma.entry.findMany({
        where: {
          seasonId: season.id,
          mentionedUserId: user.id,
          statut: "non_verifie",
        },
        include: { user: true, action: true },
        orderBy: { date: "desc" },
      })
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-royal">🏆 Classement</h1>
        {season && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-neutral-600">
              Saison du {formatDate(season.dateDebut)} au {formatDate(season.dateFin)}
            </p>
            {isSeasonOpen(season) ? (
              <Countdown target={season.dateFin.toISOString()} />
            ) : (
              <p className="text-sm font-semibold text-coral">Saison terminée</p>
            )}
          </div>
        )}
      </div>

      {pendingMentions.length > 0 && (
        <section className="rounded-xl border border-cream bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-royal">
            On t&apos;a mentionné — confirme si c&apos;est vrai
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {pendingMentions.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-md bg-cream/50 px-3 py-2"
              >
                <span className="text-sm text-neutral-700">
                  <span className="font-medium">{entry.user.pseudo}</span> te mentionne pour{" "}
                  <span className="font-medium">{entry.action.nom}</span> ({entry.action.points} pts)
                </span>
                <ConfirmEntryButton entryId={entry.id} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!season && <p className="text-sm text-neutral-500">Aucune saison active.</p>}

      {season && classement.length === 0 && (
        <p className="text-sm text-neutral-500">Aucun score pour l&apos;instant.</p>
      )}

      {classement.length > 0 && (
        <ol className="mx-auto flex w-[90%] flex-col gap-2">
          {classement.map((entry, i) => {
            const tier = RANK_TIERS[i] ?? DEFAULT_TIER;
            const isCurrentUser = entry.userId === user.id;
            return (
              <li
                key={entry.userId}
                className={`flex items-center gap-3 rounded-xl ${tier.box} ${
                  isCurrentUser ? "ring-2 ring-coral ring-offset-1" : ""
                }`}
              >
                <span className={`w-8 shrink-0 text-center ${tier.medal}`}>
                  {i < 3 ? MEDALS[i] : i + 1}
                </span>
                <Link
                  href={`/profil/${entry.pseudo}`}
                  className={`flex-1 truncate hover:underline ${tier.name}`}
                >
                  {entry.pseudo}
                </Link>
                <span className={tier.points}>{entry.points} pts</span>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
