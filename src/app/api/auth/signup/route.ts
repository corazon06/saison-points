import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createSessionToken, hashPassword, SESSION_COOKIE_NAME, SESSION_MAX_AGE } from "@/lib/auth";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  pseudo: z
    .string()
    .trim()
    .min(3, "Le pseudo doit faire au moins 3 caractères.")
    .max(20, "Le pseudo doit faire au plus 20 caractères.")
    .regex(/^[a-zA-Z0-9_-]+$/, "Le pseudo ne peut contenir que lettres, chiffres, - et _."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Données invalides." },
      { status: 400 }
    );
  }

  const { email, pseudo, password } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { pseudo }] },
  });
  if (existing) {
    const field = existing.email === email ? "email" : "pseudo";
    return NextResponse.json(
      { error: field === "email" ? "Cet email est déjà utilisé." : "Ce pseudo est déjà pris." },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { email, pseudo, passwordHash },
  });

  const token = await createSessionToken(user.id);
  const response = NextResponse.json({
    id: user.id,
    pseudo: user.pseudo,
    email: user.email,
    admin: user.admin,
  });
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return response;
}
