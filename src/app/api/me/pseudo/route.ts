import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const renameSchema = z.object({
  pseudo: z
    .string()
    .trim()
    .min(3, "Le pseudo doit faire au moins 3 caractères.")
    .max(20, "Le pseudo doit faire au plus 20 caractères.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudo ne peut contenir que lettres, chiffres, - et _."),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Connexion requise." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = renameSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { pseudo } = parsed.data;

  if (pseudo === user.pseudo) {
    return NextResponse.json({ id: user.id, pseudo: user.pseudo });
  }

  const existing = await prisma.user.findUnique({ where: { pseudo } });
  if (existing) {
    return NextResponse.json({ error: "Ce pseudo est déjà pris." }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { pseudo },
  });

  return NextResponse.json({ id: updated.id, pseudo: updated.pseudo });
}
