import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export async function POST(_request: Request, ctx: RouteContext<"/api/entries/[id]/confirm">) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const { id } = await ctx.params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }
  if (entry.mentionedUserId !== user.id) {
    return NextResponse.json(
      { error: "Seul l'utilisateur mentionné peut confirmer cette entrée." },
      { status: 403 }
    );
  }
  if (entry.statut !== "non_verifie") {
    return NextResponse.json(
      { error: "Cette entrée n'est pas en attente de confirmation." },
      { status: 400 }
    );
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: { statut: "confirme" },
  });

  return NextResponse.json(updated);
}
