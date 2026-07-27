import { describe, expect, it, vi } from "vitest";

import { completeTicket } from "./update-ticket-status";

describe("completeTicket", () => {
  it("resolve um chamado atribuido ao agente", async () => {
    const complete = vi.fn().mockResolvedValue({
      id: "ticket-1",
      number: 18,
    });

    const result = await completeTicket(
      {
        ticketId: " ticket-1 ",
        agentId: " agent-1 ",
      },
      { complete },
    );

    expect(result).toEqual({
      success: true,
      ticket: { id: "ticket-1", number: 18 },
    });
    expect(complete).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      agentId: "agent-1",
    });
  });

  it("rejeita identificadores vazios", async () => {
    const complete = vi.fn();

    const result = await completeTicket(
      {
        ticketId: " ",
        agentId: "agent-1",
      },
      { complete },
    );

    expect(result).toEqual({
      success: false,
      reason: "INVALID_INPUT",
    });
    expect(complete).not.toHaveBeenCalled();
  });

  it("bloqueia alteracao de chamado indisponivel para o agente", async () => {
    const result = await completeTicket(
      {
        ticketId: "ticket-1",
        agentId: "agent-2",
      },
      { complete: vi.fn().mockResolvedValue(null) },
    );

    expect(result).toEqual({
      success: false,
      reason: "NOT_AVAILABLE",
    });
  });
});
