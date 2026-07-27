import { describe, expect, it, vi } from "vitest";

import { createUser } from "./create-user";

const validInput = {
  name: "Novo Agente",
  email: "AGENTE@EXEMPLO.COM",
  password: "senha-segura",
  role: "AGENTE",
};

describe("createUser", () => {
  it("normaliza e cria um usuario valido", async () => {
    const dependencies = {
      emailExists: vi.fn().mockResolvedValue(false),
      hashPassword: vi.fn().mockResolvedValue("hash"),
      persistUser: vi.fn().mockResolvedValue({ id: "user-1" }),
    };

    const result = await createUser(validInput, dependencies);

    expect(result).toEqual({ success: true, user: { id: "user-1" } });
    expect(dependencies.persistUser).toHaveBeenCalledWith({
      name: "Novo Agente",
      email: "agente@exemplo.com",
      passwordHash: "hash",
      role: "AGENTE",
    });
  });

  it("rejeita campos invalidos antes de acessar o banco", async () => {
    const dependencies = {
      emailExists: vi.fn(),
      hashPassword: vi.fn(),
      persistUser: vi.fn(),
    };

    const result = await createUser(
      { name: "", email: "invalido", password: "123", role: "GESTOR" },
      dependencies,
    );

    expect(result.success).toBe(false);
    expect(dependencies.emailExists).not.toHaveBeenCalled();
  });

  it("rejeita e-mail ja cadastrado", async () => {
    const result = await createUser(validInput, {
      emailExists: vi.fn().mockResolvedValue(true),
      hashPassword: vi.fn(),
      persistUser: vi.fn(),
    });

    expect(result).toEqual({
      success: false,
      errors: { email: "Ja existe um usuario com este e-mail." },
    });
  });
});
