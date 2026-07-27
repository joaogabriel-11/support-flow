import { describe, expect, it, vi } from "vitest";

import { createTicket } from "./create-ticket";

const validInput = {
  requesterId: "requester-1",
  title: "Notebook sem acesso a rede",
  description: "O notebook deixou de acessar a rede desde ontem.",
  categoryId: "category-1",
  priority: "ALTA",
};

describe("createTicket", () => {
  it("cria um chamado valido com dados normalizados", async () => {
    const categoryExists = vi.fn().mockResolvedValue(true);
    const persistTicket = vi.fn().mockResolvedValue({
      id: "ticket-1",
      number: 42,
    });

    const result = await createTicket(
      {
        ...validInput,
        title: "  Notebook sem acesso a rede  ",
        description:
          "  O notebook deixou de acessar a rede desde ontem.  ",
        priority: "alta",
      },
      { categoryExists, persistTicket },
    );

    expect(result).toEqual({
      success: true,
      ticket: { id: "ticket-1", number: 42 },
    });
    expect(categoryExists).toHaveBeenCalledWith("category-1");
    expect(persistTicket).toHaveBeenCalledWith({
      requesterId: "requester-1",
      title: "Notebook sem acesso a rede",
      description: "O notebook deixou de acessar a rede desde ontem.",
      categoryId: "category-1",
      priority: "ALTA",
    });
  });

  it("rejeita campos obrigatorios invalidos antes de consultar a categoria", async () => {
    const categoryExists = vi.fn();
    const persistTicket = vi.fn();

    const result = await createTicket(
      {
        requesterId: "requester-1",
        title: "Oi",
        description: "Curta",
        categoryId: "",
        priority: "URGENTE",
      },
      { categoryExists, persistTicket },
    );

    expect(result).toEqual({
      success: false,
      errors: {
        title: "Informe um titulo entre 5 e 120 caracteres.",
        description: "Informe uma descricao entre 10 e 5000 caracteres.",
        categoryId: "Selecione uma categoria.",
        priority: "Selecione uma prioridade valida.",
      },
    });
    expect(categoryExists).not.toHaveBeenCalled();
    expect(persistTicket).not.toHaveBeenCalled();
  });

  it("rejeita titulo e descricao acima do limite", async () => {
    const result = await createTicket(
      {
        ...validInput,
        title: "a".repeat(121),
        description: "a".repeat(5001),
      },
      {
        categoryExists: vi.fn(),
        persistTicket: vi.fn(),
      },
    );

    expect(result).toMatchObject({
      success: false,
      errors: {
        title: "Informe um titulo entre 5 e 120 caracteres.",
        description: "Informe uma descricao entre 10 e 5000 caracteres.",
      },
    });
  });

  it("rejeita categoria inexistente ou inativa", async () => {
    const persistTicket = vi.fn();

    const result = await createTicket(validInput, {
      categoryExists: vi.fn().mockResolvedValue(false),
      persistTicket,
    });

    expect(result).toEqual({
      success: false,
      errors: {
        categoryId: "A categoria selecionada nao esta disponivel.",
      },
    });
    expect(persistTicket).not.toHaveBeenCalled();
  });

  it("aceita todas as prioridades suportadas", async () => {
    const categoryExists = vi.fn().mockResolvedValue(true);
    const persistTicket = vi
      .fn()
      .mockResolvedValue({ id: "ticket-1", number: 1 });

    for (const priority of ["BAIXA", "MEDIA", "ALTA", "CRITICA"]) {
      const result = await createTicket(
        { ...validInput, priority },
        { categoryExists, persistTicket },
      );

      expect(result.success).toBe(true);
    }
  });
});
