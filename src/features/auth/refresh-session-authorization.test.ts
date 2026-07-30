import { describe, expect, it, vi } from "vitest";

import { refreshSessionAuthorization } from "./refresh-session-authorization";

describe("refreshSessionAuthorization", () => {
  it("recarrega papel e status atuais do usuario", async () => {
    const result = await refreshSessionAuthorization("user-1", {
      findAuthorizationById: vi.fn().mockResolvedValue({
        role: "AGENTE",
        isActive: true,
      }),
    });

    expect(result).toEqual({ role: "AGENTE", isActive: true });
  });

  it("bloqueia imediatamente um usuario desativado", async () => {
    const result = await refreshSessionAuthorization("user-1", {
      findAuthorizationById: vi.fn().mockResolvedValue({
        role: "AGENTE",
        isActive: false,
      }),
    });

    expect(result.isActive).toBe(false);
  });

  it("falha fechado para usuario removido ou banco indisponivel", async () => {
    const missing = await refreshSessionAuthorization("user-1", {
      findAuthorizationById: vi.fn().mockResolvedValue(null),
    });
    const unavailable = await refreshSessionAuthorization("user-1", {
      findAuthorizationById: vi.fn().mockRejectedValue(new Error("offline")),
    });

    expect(missing.isActive).toBe(false);
    expect(unavailable.isActive).toBe(false);
  });
});
