import { describe, expect, it } from "vitest";

import { rolesForPath } from "./authorization";

describe("rolesForPath", () => {
  it("mantem a listagem de chamados restrita", () => {
    expect(rolesForPath("/chamados")).toEqual(["SOLICITANTE", "ADMIN"]);
  });

  it("delega o acesso ao detalhe para a regra de vinculo do chamado", () => {
    expect(rolesForPath("/chamados/ticket-1")).toEqual([
      "SOLICITANTE",
      "AGENTE",
      "ADMIN",
    ]);
  });

  it("restringe fila, atendimentos e administracao por papel", () => {
    expect(rolesForPath("/fila")).toEqual(["AGENTE", "ADMIN"]);
    expect(rolesForPath("/meus-atendimentos")).toEqual(["AGENTE"]);
    expect(rolesForPath("/admin")).toEqual(["ADMIN"]);
    expect(rolesForPath("/admin/categorias")).toEqual(["ADMIN"]);
    expect(rolesForPath("/admin/chamados")).toEqual(["ADMIN"]);
  });

  it("nao classifica rotas publicas como privadas", () => {
    expect(rolesForPath("/login")).toBeUndefined();
    expect(rolesForPath("/acesso-negado")).toBeUndefined();
  });
});
