import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@supportflow.com";
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "admin123";
const INITIAL_CATEGORIES = ["Hardware", "Software", "Rede", "Acesso"];

async function main() {
  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Administrador",
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
    INITIAL_CATEGORIES.map((name) =>
      prisma.category.upsert({
        where: { name },
        update: { isActive: true },
        create: { name, isActive: true },
      }),
    ),
  );

  console.log("Seed concluido: 1 administrador e 4 categorias iniciais.");
}

main()
  .catch((error) => {
    console.error("Falha ao executar o seed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
