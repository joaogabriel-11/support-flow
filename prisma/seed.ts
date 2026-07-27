import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@supportflow.com";
const REQUESTER_EMAIL =
  process.env.E2E_REQUESTER_EMAIL ?? "solicitante.e2e@supportflow.com";
const AGENT_EMAIL =
  process.env.E2E_AGENT_EMAIL ?? "agente.e2e@supportflow.com";
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ??
  process.env.E2E_ADMIN_PASSWORD ??
  (process.env.CI ? undefined : "admin123");
const INITIAL_CATEGORIES = ["Hardware", "Software", "Rede", "Acesso"];

async function main() {
  if (!ADMIN_PASSWORD) {
    throw new Error("Senha do administrador nao configurada no CI.");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Administrador",
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: AGENT_EMAIL },
    update: {
      name: "Agente E2E",
      passwordHash,
      role: "AGENTE",
      isActive: true,
    },
    create: {
      name: "Agente E2E",
      email: AGENT_EMAIL,
      passwordHash,
      role: "AGENTE",
      isActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: REQUESTER_EMAIL },
    update: {
      name: "Solicitante E2E",
      passwordHash,
      role: "SOLICITANTE",
      isActive: true,
    },
    create: {
      name: "Solicitante E2E",
      email: REQUESTER_EMAIL,
      passwordHash,
      role: "SOLICITANTE",
      isActive: true,
    },
  });

  await Promise.all(
    INITIAL_CATEGORIES.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: { isActive: true },
        create: { name, isActive: true },
      }),
    ),
  );

  console.log(
    "Seed concluido: administrador, solicitante, agente E2E e 4 categorias.",
  );
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
