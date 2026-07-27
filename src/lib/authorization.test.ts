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
});
