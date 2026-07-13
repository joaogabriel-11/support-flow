import { prisma } from "./lib/prisma";

async function main() {
  try {
    const result = await prisma.$queryRaw<
      { current_database: string; current_timestamp: Date }[]
    >`
      SELECT
        current_database(),
        current_timestamp
    `;

    console.log("✅ Conexão com o Neon realizada com sucesso!");
    console.log("Banco:", result[0].current_database);
    console.log("Data do servidor:", result[0].current_timestamp);
  } catch (error) {
    console.error("❌ Erro ao conectar com o banco de dados:");
    console.error(error);

    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
