"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { changeCategoryStatus } from "@/features/categories/change-category-status";
import { createCategory } from "@/features/categories/create-category";
import { deleteCategory } from "@/features/categories/delete-category";
import { prismaCategoryDependencies } from "@/features/categories/prisma-category-dependencies";
import { updateCategory } from "@/features/categories/update-category";

export type CategoryActionState = {
  success?: boolean;
  message?: string;
  nameError?: string;
  categoryId?: string;
};

async function isAdmin() {
  const session = await auth();
  return Boolean(session?.user?.isActive && session.user.role === "ADMIN");
}

function revalidateCategories() {
  revalidatePath("/admin/categorias");
  revalidatePath("/chamados");
}

function isUniqueConstraintError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function createCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  if (!(await isAdmin())) {
    return { success: false, message: "Apenas administradores podem criar categorias." };
  }

  try {
    const result = await createCategory(
      String(formData.get("name") ?? ""),
      prismaCategoryDependencies,
    );
    if (!result.success) {
      return { success: false, nameError: result.error };
    }

    revalidateCategories();
    return {
      success: true,
      message: "Categoria criada com sucesso.",
      categoryId: result.category.id,
    };
  } catch (error) {
    return {
      success: false,
      nameError: isUniqueConstraintError(error)
        ? "Ja existe uma categoria com este nome."
        : undefined,
      message: isUniqueConstraintError(error)
        ? undefined
        : "Nao foi possivel criar a categoria.",
    };
  }
}

export async function updateCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  if (!(await isAdmin())) {
    return { success: false, message: "Apenas administradores podem editar categorias." };
  }

  try {
    const result = await updateCategory(
      {
        id: String(formData.get("categoryId") ?? ""),
        name: String(formData.get("name") ?? ""),
      },
      prismaCategoryDependencies,
    );
    if (!result.success) {
      return { success: false, nameError: result.error };
    }

    revalidateCategories();
    return {
      success: true,
      message: "Categoria atualizada.",
      categoryId: result.category.id,
    };
  } catch (error) {
    return {
      success: false,
      nameError: isUniqueConstraintError(error)
        ? "Ja existe uma categoria com este nome."
        : undefined,
      message: isUniqueConstraintError(error)
        ? undefined
        : "Nao foi possivel atualizar a categoria.",
    };
  }
}

export async function changeCategoryStatusAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  if (!(await isAdmin())) {
    return { success: false, message: "Apenas administradores podem alterar categorias." };
  }

  try {
    const result = await changeCategoryStatus(
      {
        id: String(formData.get("categoryId") ?? ""),
        isActive: String(formData.get("isActive")) === "true",
      },
      prismaCategoryDependencies,
    );
    if (!result.success) {
      return {
        success: false,
        message:
          result.reason === "LAST_ACTIVE"
            ? "A ultima categoria ativa nao pode ser desativada."
            : "Categoria nao encontrada.",
      };
    }

    revalidateCategories();
    return {
      success: true,
      message: result.category.isActive
        ? "Categoria ativada."
        : "Categoria desativada.",
      categoryId: result.category.id,
    };
  } catch {
    return { success: false, message: "Nao foi possivel alterar a categoria." };
  }
}

export async function deleteCategoryAction(
  _previousState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  if (!(await isAdmin())) {
    return { success: false, message: "Apenas administradores podem excluir categorias." };
  }

  try {
    const result = await deleteCategory(
      String(formData.get("categoryId") ?? ""),
      prismaCategoryDependencies,
    );
    if (!result.success) {
      const messages = {
        IN_USE: "Esta categoria possui chamados e so pode ser desativada.",
        LAST_ACTIVE: "A ultima categoria ativa nao pode ser excluida.",
        NOT_FOUND: "Categoria nao encontrada.",
        INVALID_INPUT: "Categoria invalida.",
      };
      return { success: false, message: messages[result.reason] };
    }

    revalidateCategories();
    return {
      success: true,
      message: "Categoria excluida permanentemente.",
      categoryId: result.category.id,
    };
  } catch {
    return {
      success: false,
      message: "Nao foi possivel excluir a categoria.",
    };
  }
}
