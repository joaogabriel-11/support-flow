import { describe, expect, it } from "vitest";

import { canViewTicket } from "./can-view-ticket";

const ticket = { requesterId: "requester-1", agentId: "agent-1" };

describe("canViewTicket", () => {
  it("permite o solicitante proprietario", () => {
    expect(
      canViewTicket({ id: "requester-1", role: "SOLICITANTE" }, ticket),
    ).toBe(true);
  });

  it("permite o agente responsavel", () => {
    expect(canViewTicket({ id: "agent-1", role: "AGENTE" }, ticket)).toBe(
      true,
    );
  });

  it("permite administradores", () => {
    expect(canViewTicket({ id: "admin-1", role: "ADMIN" }, ticket)).toBe(
      true,
    );
  });

  it("bloqueia usuarios sem vinculo com o chamado", () => {
    expect(
      canViewTicket({ id: "requester-2", role: "SOLICITANTE" }, ticket),
    ).toBe(false);
    expect(canViewTicket({ id: "agent-2", role: "AGENTE" }, ticket)).toBe(
      false,
    );
  });
});
