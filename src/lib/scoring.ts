import { prisma } from "@/lib/prisma";

// Une entry compte dans le score dès qu'elle n'est pas contestée par un admin
// (confirme et non_verifie comptent toutes les deux — cf. spec, règle 4).
const COUNTING_STATUTS = ["confirme", "non_verifie"] as const;

export async function getClassement(seasonId: string) {
  const entries = await prisma.entry.findMany({
    where: { seasonId, statut: { in: [...COUNTING_STATUTS] } },
    include: { user: true, action: true },
  });

  const scores = new Map<
    string,
    { userId: string; pseudo: string; avatar: string | null; points: number }
  >();

  for (const entry of entries) {
    const current = scores.get(entry.userId) ?? {
      userId: entry.userId,
      pseudo: entry.user.pseudo,
      avatar: entry.user.avatar,
      points: 0,
    };
    current.points += entry.action.points;
    scores.set(entry.userId, current);
  }

  return Array.from(scores.values()).sort((a, b) => b.points - a.points);
}

export async function getUserScore(userId: string, seasonId: string) {
  const entries = await prisma.entry.findMany({
    where: { userId, seasonId, statut: { in: [...COUNTING_STATUTS] } },
    include: { action: true },
  });
  return entries.reduce((total, entry) => total + entry.action.points, 0);
}
