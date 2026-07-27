import { describe, expect, it, vi } from "vitest";

import { addTicketComment } from "./add-ticket-comment";

const ticket = { requesterId: "requester-1", agentId: "agent-1" };

describe("addTicketComment", () => {
  it("permite mensagem publica do solicitante proprietario", async () => {
    const persistComment = vi.fn().mockResolvedValue({ id: "comment-1" });
    const result = await addTicketComment(
      {
        ticketId: " ticket-1 ",
        content: " Preciso de ajuda. ",
        type: "publico",
        viewer: { id: "requester-1", role: "SOLICITANTE" },
      },
      {
        findTicket: vi.fn().mockResolvedValue(ticket),
        persistComment,
      },
    );

    expect(result.success).toBe(true);
    expect(persistComment).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      authorId: "requester-1",
      content: "Preciso de ajuda.",
      type: "PUBLICO",
    });
  });

  it("permite nota interna do agente responsavel", async () => {
    const result = await addTicketComment(
      {
        ticketId: "ticket-1",
        content: "Analise tecnica.",
        type: "INTERNO",
        viewer: { id: "agent-1", role: "AGENTE" },
      },
      {
        findTicket: vi.fn().mockResolvedValue(ticket),
        persistComment: vi.fn().mockResolvedValue({ id: "comment-1" }),
      },
    );

    expect(result.success).toBe(true);
  });

  it("bloqueia nota interna do solicitante", async () => {
    const findTicket = vi.fn();
    const result = await addTicketComment(
      {
        ticketId: "ticket-1",
        content: "Nota escondida.",
        type: "INTERNO",
        viewer: { id: "requester-1", role: "SOLICITANTE" },
      },
      { findTicket, persistComment: vi.fn() },
    );

    expect(result).toEqual({ success: false, reason: "NOT_ALLOWED" });
    expect(findTicket).not.toHaveBeenCalled();
  });

  it("bloqueia usuario sem vinculo com o chamado", async () => {
    const persistComment = vi.fn();
    const result = await addTicketComment(
      {
        ticketId: "ticket-1",
        content: "Tentativa indevida.",
        type: "PUBLICO",
        viewer: { id: "agent-2", role: "AGENTE" },
      },
      {
        findTicket: vi.fn().mockResolvedValue(ticket),
        persistComment,
      },
    );

    expect(result).toEqual({ success: false, reason: "NOT_ALLOWED" });
    expect(persistComment).not.toHaveBeenCalled();
  });

  it("valida o tamanho da mensagem", async () => {
    const result = await addTicketComment(
      {
        ticketId: "ticket-1",
        content: " ",
        type: "PUBLICO",
        viewer: { id: "requester-1", role: "SOLICITANTE" },
      },
      { findTicket: vi.fn(), persistComment: vi.fn() },
    );

    expect(result).toEqual({
      success: false,
      reason: "INVALID_INPUT",
      contentError: "A mensagem deve ter entre 2 e 2000 caracteres.",
    });
  });
});
