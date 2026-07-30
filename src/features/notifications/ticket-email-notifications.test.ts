import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findTicket: vi.fn(),
  findAgents: vi.fn(),
  sendEmail: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    ticket: { findUnique: mocks.findTicket },
    user: { findMany: mocks.findAgents },
  },
}));

vi.mock("@/lib/email", () => ({
  sendEmail: mocks.sendEmail,
}));

import {
  notifyTicketCreated,
  notifyTicketResolved,
} from "./ticket-email-notifications";

const ticket = {
  id: "ticket-1",
  number: 42,
  title: "Computador nao liga",
  requester: {
    email: "requester@example.com",
    isActive: true,
  },
};

describe("notificacoes dos chamados", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.APP_URL;
    delete process.env.AUTH_URL;
    mocks.findTicket.mockResolvedValue(ticket);
  });

  it("avisa somente os agentes ativos sobre novo chamado", async () => {
    mocks.findAgents.mockResolvedValue([
      { email: "agent-1@example.com" },
      { email: "agent-2@example.com" },
    ]);

    await notifyTicketCreated("ticket-1");

    expect(mocks.findAgents).toHaveBeenCalledWith({
      where: { role: "AGENTE", isActive: true },
      select: { email: true },
    });
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["agent-1@example.com", "agent-2@example.com"],
        subject: "Novo chamado #42",
      }),
    );
    expect(mocks.sendEmail).not.toHaveBeenCalledWith(
      expect.objectContaining({ to: ["requester@example.com"] }),
    );
  });

  it("avisa somente o solicitante ativo quando o chamado e resolvido", async () => {
    await notifyTicketResolved("ticket-1");

    expect(mocks.sendEmail).toHaveBeenCalledOnce();
    expect(mocks.sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: ["requester@example.com"],
        subject: "Chamado #42 resolvido",
      }),
    );
  });

  it("nao envia resolucao para solicitante desativado", async () => {
    mocks.findTicket.mockResolvedValue({
      ...ticket,
      requester: { ...ticket.requester, isActive: false },
    });

    await notifyTicketResolved("ticket-1");

    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });

  it("nao propaga falha de banco ou de e-mail", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.findTicket.mockRejectedValueOnce(new Error("Banco indisponivel"));
    await expect(notifyTicketResolved("ticket-1")).resolves.toBeUndefined();

    mocks.findTicket.mockResolvedValue(ticket);
    mocks.sendEmail.mockRejectedValueOnce(new Error("Resend indisponivel"));
    await expect(notifyTicketResolved("ticket-1")).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(2);
  });
});
