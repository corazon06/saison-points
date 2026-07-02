import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getActiveSeason, isSeasonOpen } from "@/lib/season";

const createEntrySchema = z.object({
  actionId: z.string().min(1),
  mentionedUserPseudo: z.string().trim().min(1).optional(),
});

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createEntrySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }
  const { actionId, mentionedUserPseudo } = parsed.data;

  const season = await getActiveSeason();
  if (!season) {
    return NextResponse.json({ error: "Aucune saison active." }, { status: 400 });
  }
  if (!isSeasonOpen(season)) {
    return NextResponse.json(
      { error: "La saison est terminée, impossible de déclarer une nouvelle action." },
      { status: 403 }
    );
  }

  const action = await prisma.action.findUnique({ where: { id: actionId } });
  if (!action) {
    return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
  }

  let mentionedUserId: string | null = null;
  if (mentionedUserPseudo) {
    const mentioned = await prisma.user.findUnique({ where: { pseudo: mentionedUserPseudo } });
    if (!mentioned) {
      return NextResponse.json({ error: "Utilisateur mentionné introuvable." }, { status: 400 });
    }
    if (mentioned.id === user.id) {
      return NextResponse.json({ error: "Impossible de se mentionner soi-même." }, { status: 400 });
    }
    mentionedUserId = mentioned.id;
  }

  const entry = await prisma.entry.create({
    data: {
      userId: user.id,
      actionId: action.id,
      seasonId: season.id,
      mentionedUserId,
      statut: mentionedUserId ? "non_verifie" : "confirme",
    },
    include: { action: true, user: true, mentionedUser: true },
  });

  return NextResponse.json(entry, { status: 201 });
}
