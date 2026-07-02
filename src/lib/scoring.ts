import { prisma } from "@/lib/prisma";

// Une entry compte dans le score dès qu'elle n'est pas contestée par un admin
// (confirme et non_verifie comptent toutes les deux — cf. spec, règle 4).
const COUNTING_STATUTS = ["confirme", "non_verifie"] as const;

export async function getClassement(seasonId: string) {
  const [participants, entries] = await Promise.all([
    prisma.user.findMany({ where: { admin: false } }),
    prisma.entry.findMany({
      where: { seasonId, statut: { in: [...COUNTING_STATUTS] } },
      include: { user: true, action: true },
    }),
  ]);

  const scores = new Map<
    string,
    { userId: string; pseudo: string; avatar: string | null; points: number }
  >();

  // Tous les participants (hors admin) apparaissent, même à 0 point.
  for (const user of participants) {
    scores.set(user.id, {
      userId: user.id,
      pseudo: user.pseudo,
      avatar: user.avatar,
      points: 0,
    });
  }

  for (const entry of entries) {
    if (entry.user.admin) continue;
    const current = scores.get(entry.userId);
    if (!current) continue;
    current.points += entry.action.points;
  }

  return Array.from(scores.values()).sort(
    (a, b) => b.points - a.points || a.pseudo.localeCompare(b.pseudo)
  );
}

export async function getUserScore(userId: string, seasonId: string) {
  const entries = await prisma.entry.findMany({
    where: { userId, seasonId, statut: { in: [...COUNTING_STATUTS] } },
    include: { action: true },
  });
  return entries.reduce((total, entry) => total + entry.action.points, 0);
}
