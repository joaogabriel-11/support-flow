import { describe, expect, it, vi } from "vitest";

import { authenticateUser, type AuthUser } from "./authenticate-user";

const activeUser: AuthUser = {
  id: "user-1",
  name: "Joao",
  email: "joao@empresa.com",
  passwordHash: "hash-da-senha",
  role: "SOLICITANTE",
  isActive: true,
};

describe("authenticateUser", () => {
  it("autentica usuario ativo com e-mail e senha corretos", async () => {
    const findUserByEmail = vi.fn().mockResolvedValue(activeUser);
    const verifyPassword = vi.fn().mockResolvedValue(true);

    const result = await authenticateUser(
      { email: "joao@empresa.com", password: "Senha@123" },
      { findUserByEmail, verifyPassword },
    );

    expect(result).toEqual({
      id: "user-1",
      name: "Joao",
      email: "joao@empresa.com",
      role: "SOLICITANTE",
      isActive: true,
    });
    expect(findUserByEmail).toHaveBeenCalledWith("joao@empresa.com");
    expect(verifyPassword).toHaveBeenCalledWith("Senha@123", "hash-da-senha");
  });

  it("rejeita senha incorreta", async () => {
    const verifyPassword = vi.fn().mockResolvedValue(false);
    const result = await authenticateUser(
      { email: "joao@empresa.com", password: "senha-errada" },
      { findUserByEmail: vi.fn().mockResolvedValue(activeUser), verifyPassword },
    );

    expect(result).toBeNull();
  });

  it("rejeita e-mail inexistente", async () => {
    const verifyPassword = vi.fn();
    const result = await authenticateUser(
      { email: "inexistente@empresa.com", password: "Senha@123" },
      { findUserByEmail: vi.fn().mockResolvedValue(null), verifyPassword },
    );

    expect(result).toBeNull();
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("rejeita usuario desativado", async () => {
    const verifyPassword = vi.fn();
    const result = await authenticateUser(
      { email: "joao@empresa.com", password: "Senha@123" },
      {
        findUserByEmail: vi.fn().mockResolvedValue({ ...activeUser, isActive: false }),
        verifyPassword,
      },
    );

    expect(result).toBeNull();
    expect(verifyPassword).not.toHaveBeenCalled();
  });

  it("normaliza o e-mail antes da busca", async () => {
    const findUserByEmail = vi.fn().mockResolvedValue(activeUser);
    await authenticateUser(
      { email: "  JOAO@EMPRESA.COM  ", password: "Senha@123" },
      { findUserByEmail, verifyPassword: vi.fn().mockResolvedValue(true) },
    );

    expect(findUserByEmail).toHaveBeenCalledWith("joao@empresa.com");
  });
});
