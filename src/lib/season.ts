import { prisma } from "@/lib/prisma";

export async function getActiveSeason() {
  return prisma.season.findFirst({ where: { actif: true } });
}

export function isSeasonOpen(season: { dateFin: Date }) {
  return new Date() <= season.dateFin;
}
