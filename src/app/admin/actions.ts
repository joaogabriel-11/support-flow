"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createUser } from "@/features/users/create-user";
import { prismaUserDependencies } from "@/features/users/prisma-user-dependencies";
import { setUserActive } from "@/features/users/set-user-active";

export type CreateUserState = {
  success?: boolean;
  message?: string;
  createdUserId?: string;
  errors?: Partial<
    Record<"name" | "email" | "password" | "role", string>
  >;
};

export type SetUserActiveState = {
  success?: boolean;
  message?: string;
};

export async function createUserAction(
  _previousState: CreateUserState,
  formData: FormData,
): Promise<CreateUserState> {
  const session = await auth();
  if (!session?.user?.isActive || session.user.role !== "ADMIN") {
    return { success: false, message: "Apenas administradores podem criar usuarios." };
  }

  try {
    const result = await createUser(
      {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role: String(formData.get("role") ?? ""),
      },
      prismaUserDependencies,
    );

    if (!result.success) return { success: false, errors: result.errors };

    revalidatePath("/admin");
    return {
      success: true,
      message: "Usuario criado com sucesso.",
      createdUserId: result.user.id,
    };
  } catch {
    return {
      success: false,
      message: "Nao foi possivel criar o usuario. Verifique o e-mail e tente novamente.",
    };
  }
}

export async function setUserActiveAction(
  _previousState: SetUserActiveState,
  formData: FormData,
): Promise<SetUserActiveState> {
  const session = await auth();
  if (!session?.user?.isActive || session.user.role !== "ADMIN") {
    return { success: false, message: "Apenas administradores podem alterar usuarios." };
  }

  try {
    const result = await setUserActive(
      {
        userId: String(formData.get("userId") ?? ""),
        adminId: session.user.id,
        isActive: String(formData.get("isActive")) === "true",
      },
      prismaUserDependencies,
    );

    if (!result.success) {
      return {
        success: false,
        message:
          result.reason === "SELF_UPDATE"
            ? "Voce nao pode desativar a propria conta."
            : "Usuario nao encontrado.",
      };
    }

    revalidatePath("/admin");
    return {
      success: true,
      message: result.user.isActive ? "Usuario ativado." : "Usuario desativado.",
    };
  } catch {
    return { success: false, message: "Nao foi possivel alterar o usuario." };
  }
}
