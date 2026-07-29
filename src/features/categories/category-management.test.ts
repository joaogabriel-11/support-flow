import { describe, expect, it, vi } from "vitest";

import { changeCategoryStatus } from "./change-category-status";
import { createCategory } from "./create-category";
import { deleteCategory } from "./delete-category";
import { updateCategory } from "./update-category";

describe("createCategory", () => {
  it("normaliza e cria uma categoria ativa", async () => {
    const persistCategory = vi.fn().mockResolvedValue({
      id: "category-1",
      name: "Suporte Especial",
      isActive: true,
    });

    const result = await createCategory("  Suporte   Especial  ", {
      nameExists: vi.fn().mockResolvedValue(false),
      persistCategory,
    });

    expect(result.success).toBe(true);
    expect(persistCategory).toHaveBeenCalledWith("Suporte Especial");
  });

  it("rejeita nome duplicado sem diferenciar maiusculas", async () => {
    const result = await createCategory("hardware", {
      nameExists: vi.fn().mockResolvedValue(true),
      persistCategory: vi.fn(),
    });

    expect(result).toEqual({
      success: false,
      reason: "DUPLICATE",
      error: "Ja existe uma categoria com este nome.",
    });
  });

  it("valida o tamanho do nome", async () => {
    const nameExists = vi.fn();
    const result = await createCategory("A", {
      nameExists,
      persistCategory: vi.fn(),
    });

    expect(result.success).toBe(false);
    expect(nameExists).not.toHaveBeenCalled();
  });
});

describe("updateCategory", () => {
  it("renomeia uma categoria existente", async () => {
    const update = vi.fn().mockResolvedValue({
      id: "category-1",
      name: "Infraestrutura",
    });
    const result = await updateCategory(
      { id: "category-1", name: " Infraestrutura " },
      {
        nameExistsForAnother: vi.fn().mockResolvedValue(false),
        updateCategory: update,
      },
    );

    expect(result.success).toBe(true);
    expect(update).toHaveBeenCalledWith({
      id: "category-1",
      name: "Infraestrutura",
    });
  });

  it("nao permite usar o nome de outra categoria", async () => {
    const result = await updateCategory(
      { id: "category-1", name: "Rede" },
      {
        nameExistsForAnother: vi.fn().mockResolvedValue(true),
        updateCategory: vi.fn(),
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe("DUPLICATE");
  });
});

describe("changeCategoryStatus", () => {
  it("propaga o bloqueio da ultima categoria ativa", async () => {
    const result = await changeCategoryStatus(
      { id: "category-1", isActive: false },
      {
        changeStatus: vi.fn().mockResolvedValue({
          success: false,
          reason: "LAST_ACTIVE",
        }),
      },
    );

    expect(result).toEqual({ success: false, reason: "LAST_ACTIVE" });
  });
});

describe("deleteCategory", () => {
  it("exclui uma categoria sem chamados", async () => {
    const result = await deleteCategory("category-1", {
      deleteSafely: vi.fn().mockResolvedValue({
        success: true,
        category: { id: "category-1" },
      }),
    });

    expect(result.success).toBe(true);
  });

  it("bloqueia exclusao de categoria em uso", async () => {
    const result = await deleteCategory("category-1", {
      deleteSafely: vi.fn().mockResolvedValue({
        success: false,
        reason: "IN_USE",
      }),
    });

    expect(result).toEqual({ success: false, reason: "IN_USE" });
  });
});
