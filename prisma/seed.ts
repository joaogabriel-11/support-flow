import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = "admin@supportflow.com";
const REQUESTER_EMAIL = "joao.silva@empresa.com";
const ADMIN_PASSWORD =
  process.env.SEED_ADMIN_PASSWORD ?? (process.env.CI ? undefined : "admin123");
const REQUESTER_PASSWORD =
  process.env.SEED_REQUESTER_PASSWORD ??
  (process.env.CI ? undefined : "solicitante123");
const INITIAL_CATEGORIES = [
  "Hardware",
  "Rede e Internet",
  "Software",
  "Acesso e Permissões",
  "E-mail",
  "Impressoras",
  "Sistemas Internos",
  "Outros",
];
const INITIAL_TICKETS = [
  {
    title: "Computador não liga",
    category: "Hardware",
    priority: "CRITICA" as const,
    description:
      "Ao pressionar o botão de energia, o computador não apresenta nenhuma resposta. Os cabos de energia já foram verificados e o equipamento continua sem ligar.",
  },
  {
    title: "Internet muito lenta no setor administrativo",
    category: "Rede e Internet",
    priority: "ALTA" as const,
    description:
      "A conexão com a internet está muito lenta desde o início do expediente. Sites e sistemas internos estão demorando para carregar, afetando o trabalho do setor.",
  },
  {
    title: "Erro ao acessar o sistema de pedidos",
    category: "Sistemas Internos",
    priority: "MEDIA" as const,
    description:
      "Ao tentar acessar o sistema de pedidos, é exibida uma mensagem de erro informando que o serviço está indisponível. O problema ocorre mesmo após reiniciar o navegador.",
  },
  {
    title: "Solicitação de acesso à pasta Financeiro",
    category: "Acesso e Permissões",
    priority: "BAIXA" as const,
    description:
      "É necessário liberar acesso de leitura à pasta compartilhada do setor Financeiro para consultar documentos relacionados aos pagamentos de fornecedores.",
  },
  {
    title: "Impressora apresenta documentos presos na fila",
    category: "Impressoras",
    priority: "MEDIA" as const,
    description:
      "Os documentos enviados para impressão permanecem na fila e não são impressos. A impressora está ligada, conectada à rede e não apresenta mensagens de erro no painel.",
  },
];

async function main() {
  if (!ADMIN_PASSWORD || !REQUESTER_PASSWORD) {
    throw new Error("Configure as senhas dos usuarios iniciais.");
  }

  const [adminPasswordHash, requesterPasswordHash] = await Promise.all([
    bcrypt.hash(ADMIN_PASSWORD, 12),
    bcrypt.hash(REQUESTER_PASSWORD, 12),
  ]);

  await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Administrador",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      name: "Administrador",
      email: ADMIN_EMAIL,
      passwordHash: adminPasswordHash,
      role: "ADMIN",
      isActive: true,
    },
  });

  const requester = await prisma.user.upsert({
    where: { email: REQUESTER_EMAIL },
    update: {
      name: "João da Silva",
      passwordHash: requesterPasswordHash,
      role: "SOLICITANTE",
      isActive: true,
    },
    create: {
      name: "João da Silva",
      email: REQUESTER_EMAIL,
      passwordHash: requesterPasswordHash,
      role: "SOLICITANTE",
      isActive: true,
    },
  });

  const categories = new Map<string, string>();
  for (const name of INITIAL_CATEGORIES) {
    const existing = await prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
      select: { id: true },
    });
    const category = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: { name, isActive: true },
        })
      : await prisma.category.create({
          data: { name, isActive: true },
        });
    categories.set(name, category.id);
  }

  for (const ticketData of INITIAL_TICKETS) {
    const categoryId = categories.get(ticketData.category);
    if (!categoryId) throw new Error(`Categoria ausente: ${ticketData.category}`);

    const existing = await prisma.ticket.findFirst({
      where: { requesterId: requester.id, title: ticketData.title },
      select: { id: true },
    });

    if (existing) {
      await prisma.ticket.update({
        where: { id: existing.id },
        data: {
          description: ticketData.description,
          priority: ticketData.priority,
          categoryId,
        },
      });
      continue;
    }

    await prisma.$transaction(async (transaction) => {
      const ticket = await transaction.ticket.create({
        data: {
          requesterId: requester.id,
          title: ticketData.title,
          description: ticketData.description,
          priority: ticketData.priority,
          categoryId,
        },
      });
      await transaction.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: requester.id,
          type: "CHAMADO_CRIADO",
        },
      });
    });
  }

  console.log(
    "Seed concluido: administrador, solicitante, 8 categorias e 5 chamados.",
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
