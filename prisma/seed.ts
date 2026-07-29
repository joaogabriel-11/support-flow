import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@supportflow.com";
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? (process.env.CI ? undefined : "admin123");
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

  await Promise.all(
    INITIAL_CATEGORIES.map(async (name) => {
      const existing = await prisma.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      });

      return existing
        ? prisma.category.update({
            where: { id: existing.id },
            data: { name, isActive: true },
          })
        : prisma.category.create({
            data: { name, isActive: true },
          });
    }),
  );

  console.log("Seed concluido: administrador e 4 categorias.");
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
