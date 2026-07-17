import { describe, expect, it } from "vitest";

import { canAccess } from "./permissions";

describe("controle de acesso por papel", () => {
  it("permite que admin acesse gerenciamento de usuarios", () => {
    expect(canAccess("ADMIN", "USER_MANAGEMENT")).toBe(true);
  });

  it("impede solicitante de acessar gerenciamento de usuarios", () => {
    expect(canAccess("SOLICITANTE", "USER_MANAGEMENT")).toBe(false);
  });

  it("impede agente de acessar gerenciamento de usuarios", () => {
    expect(canAccess("AGENTE", "USER_MANAGEMENT")).toBe(false);
  });

  it("permite que agente acesse a fila de atendimento", () => {
    expect(canAccess("AGENTE", "AGENT_QUEUE")).toBe(true);
  });

  it("impede solicitante de acessar a fila de atendimento", () => {
    expect(canAccess("SOLICITANTE", "AGENT_QUEUE")).toBe(false);
  });

  it("permite que admin acesse a fila de atendimento", () => {
    expect(canAccess("ADMIN", "AGENT_QUEUE")).toBe(true);
  });

  it("permite que solicitante acesse sua area", () => {
    expect(canAccess("SOLICITANTE", "SOLICITANTE_AREA")).toBe(true);
  });
});
