import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const transaction = {
    ticket: {
      create: vi.fn(),
      updateMany: vi.fn(),
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
    },
    ticketActivity: { create: vi.fn() },
    user: { findUnique: vi.fn() },
  };

  return {
    transaction,
    runTransaction: vi.fn(
      async (callback: (value: typeof transaction) => unknown) =>
        callback(transaction),
    ),
  };
});

vi.mock("@/lib/prisma", () => ({
  prisma: { $transaction: mocks.runTransaction },
}));

import { prismaAdminAssignmentDependencies } from "./prisma-admin-assignment-dependencies";
import { prismaAssignmentDependencies } from "./prisma-assignment-dependencies";
import { prismaStatusDependencies } from "./prisma-status-dependencies";
import { prismaTicketDependencies } from "./prisma-ticket-dependencies";

describe("historico transacional dos chamados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registra a criacao junto com o chamado", async () => {
    mocks.transaction.ticket.create.mockResolvedValue({
      id: "ticket-1",
      number: 1,
    });

    await prismaTicketDependencies.persistTicket({
      requesterId: "requester-1",
      title: "Computador nao liga",
      description: "O computador nao apresenta resposta.",
      categoryId: "category-1",
      priority: "CRITICA",
    });

    expect(mocks.transaction.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "requester-1",
        type: "CHAMADO_CRIADO",
      },
    });
  });

  it("registra quando o agente assume um chamado", async () => {
    mocks.transaction.ticket.updateMany.mockResolvedValue({ count: 1 });
    mocks.transaction.ticket.findUniqueOrThrow.mockResolvedValue({
      id: "ticket-1",
      number: 1,
    });

    await prismaAssignmentDependencies.claimTicket({
      ticketId: "ticket-1",
      agentId: "agent-1",
    });

    expect(mocks.transaction.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "agent-1",
        type: "CHAMADO_ATRIBUIDO",
        newValue: "agent-1",
      },
    });
  });

  it("registra reatribuicao com agentes anterior e novo", async () => {
    mocks.transaction.user.findUnique.mockResolvedValue({
      id: "agent-2",
      name: "Agente Dois",
      role: "AGENTE",
      isActive: true,
    });
    mocks.transaction.ticket.findUnique.mockResolvedValue({
      id: "ticket-1",
      number: 1,
      status: "EM_ANDAMENTO",
      agentId: "agent-1",
      agent: { name: "Agente Um" },
    });
    mocks.transaction.ticket.updateMany.mockResolvedValue({ count: 1 });

    const result = await prismaAdminAssignmentDependencies.assign({
      ticketId: "ticket-1",
      adminId: "admin-1",
      targetAgentId: "agent-2",
    });

    expect(result.success).toBe(true);
    expect(mocks.transaction.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "admin-1",
        type: "CHAMADO_REATRIBUIDO",
        previousValue: "agent-1",
        newValue: "agent-2",
        metadata: {
          previousAgentName: "Agente Um",
          newAgentName: "Agente Dois",
          assignmentType: "ADMIN_MANUAL",
        },
      },
    });
  });

  it("registra a conclusao e a mudanca para resolvido", async () => {
    mocks.transaction.ticket.findFirst.mockResolvedValue({
      id: "ticket-1",
      number: 1,
      status: "EM_ANDAMENTO",
    });
    mocks.transaction.ticket.updateMany.mockResolvedValue({ count: 1 });

    await prismaStatusDependencies.complete({
      ticketId: "ticket-1",
      agentId: "agent-1",
    });

    expect(mocks.transaction.ticketActivity.create).toHaveBeenCalledWith({
      data: {
        ticketId: "ticket-1",
        actorId: "agent-1",
        type: "STATUS_ALTERADO",
        previousValue: "EM_ANDAMENTO",
        newValue: "RESOLVIDO",
      },
    });
  });

  it("nao cria historico quando uma atribuicao concorrente falha", async () => {
    mocks.transaction.ticket.updateMany.mockResolvedValue({ count: 0 });

    const result = await prismaAssignmentDependencies.claimTicket({
      ticketId: "ticket-1",
      agentId: "agent-1",
    });

    expect(result).toBeNull();
    expect(mocks.transaction.ticketActivity.create).not.toHaveBeenCalled();
  });
});
