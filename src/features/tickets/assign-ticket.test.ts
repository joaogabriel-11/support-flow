import { describe, expect, it, vi } from "vitest";

import { assignTicket } from "./assign-ticket";

describe("assignTicket", () => {
  it("atribui um chamado disponivel ao agente", async () => {
    const claimTicket = vi.fn().mockResolvedValue({
      id: "ticket-1",
      number: 25,
    });

    const result = await assignTicket(
      { ticketId: " ticket-1 ", agentId: " agent-1 " },
      { claimTicket },
    );

    expect(result).toEqual({
      success: true,
      ticket: { id: "ticket-1", number: 25 },
    });
    expect(claimTicket).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      agentId: "agent-1",
    });
  });

  it("rejeita identificadores vazios", async () => {
    const claimTicket = vi.fn();

    const result = await assignTicket(
      { ticketId: " ", agentId: "agent-1" },
      { claimTicket },
    );

    expect(result).toEqual({
      success: false,
      reason: "INVALID_INPUT",
    });
    expect(claimTicket).not.toHaveBeenCalled();
  });

  it("informa quando outro agente ja assumiu o chamado", async () => {
    const result = await assignTicket(
      { ticketId: "ticket-1", agentId: "agent-2" },
      { claimTicket: vi.fn().mockResolvedValue(null) },
    );

    expect(result).toEqual({
      success: false,
      reason: "NOT_AVAILABLE",
    });
  });
});
