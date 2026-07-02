import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

const ACTIONS: { nom: string; points: number }[] = [
  { nom: "Action 1", points: 1 },
  { nom: "Action 2", points: 3 },
  { nom: "Action 3", points: 5 },
  { nom: "Action 4", points: 10 },
  { nom: "Action 5", points: 30 },
];

async function main() {
  for (const action of ACTIONS) {
    const existing = await prisma.action.findFirst({ where: { nom: action.nom } });
    if (!existing) {
      await prisma.action.create({ data: action });
    }
  }

  const activeSeason = await prisma.season.findFirst({ where: { actif: true } });
  if (!activeSeason) {
    const year = new Date().getFullYear();
    await prisma.season.create({
      data: {
        dateDebut: new Date(`${year}-06-21T00:00:00.000Z`),
        dateFin: new Date(`${year}-08-31T23:59:59.999Z`),
        actif: true,
      },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@saison-points.local";
  const adminPseudo = process.env.ADMIN_PSEUDO ?? "ADMIN";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error("ADMIN_PASSWORD manquant dans .env — impossible de créer le compte admin.");
  }

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    await prisma.user.create({
      data: {
        email: adminEmail,
        pseudo: adminPseudo,
        passwordHash,
        admin: true,
      },
    });
    console.log(`Compte admin créé : ${adminPseudo} (${adminEmail})`);
  } else {
    console.log("Compte admin déjà existant, rien à faire.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
