import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const patchSchema = z.object({
  statut: z.enum(["confirme", "non_verifie", "conteste"]),
});

export async function PATCH(request: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const user = await getCurrentUser();
  if (!user?.admin) {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { id } = await ctx.params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  const updated = await prisma.entry.update({
    where: { id },
    data: { statut: parsed.data.statut },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, ctx: RouteContext<"/api/entries/[id]">) {
  const user = await getCurrentUser();
  if (!user?.admin) {
    return NextResponse.json({ error: "Réservé aux administrateurs." }, { status: 403 });
  }

  const { id } = await ctx.params;
  const entry = await prisma.entry.findUnique({ where: { id } });
  if (!entry) {
    return NextResponse.json({ error: "Entrée introuvable." }, { status: 404 });
  }

  await prisma.entry.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
