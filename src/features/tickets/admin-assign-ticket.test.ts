import { describe, expect, it, vi } from "vitest";

import { adminAssignTicket } from "./admin-assign-ticket";

describe("adminAssignTicket", () => {
  it("normaliza os identificadores e atribui o chamado", async () => {
    const assign = vi.fn().mockResolvedValue({
      success: true,
      ticket: { id: "ticket-1" },
    });

    const result = await adminAssignTicket(
      {
        ticketId: " ticket-1 ",
        adminId: " admin-1 ",
        targetAgentId: " agent-1 ",
      },
      { assign },
    );

    expect(result.success).toBe(true);
    expect(assign).toHaveBeenCalledWith({
      ticketId: "ticket-1",
      adminId: "admin-1",
      targetAgentId: "agent-1",
    });
  });

  it("rejeita identificadores vazios", async () => {
    const assign = vi.fn();
    const result = await adminAssignTicket(
      { ticketId: "", adminId: "admin-1", targetAgentId: "agent-1" },
      { assign },
    );

    expect(result).toEqual({ success: false, reason: "INVALID_INPUT" });
    expect(assign).not.toHaveBeenCalled();
  });

  it("propaga agente indisponivel", async () => {
    const result = await adminAssignTicket(
      {
        ticketId: "ticket-1",
        adminId: "admin-1",
        targetAgentId: "agent-inactive",
      },
      {
        assign: vi.fn().mockResolvedValue({
          success: false,
          reason: "TARGET_NOT_AVAILABLE",
        }),
      },
    );

    expect(result).toEqual({
      success: false,
      reason: "TARGET_NOT_AVAILABLE",
    });
  });
});
