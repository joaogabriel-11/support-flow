"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { createTicket } from "@/features/tickets/create-ticket";
import { prismaTicketDependencies } from "@/features/tickets/prisma-ticket-dependencies";

export type CreateTicketState = {
  success?: boolean;
  message?: string;
  ticketNumber?: number;
  errors?: {
    title?: string;
    description?: string;
    categoryId?: string;
    priority?: string;
  };
};

export async function createTicketAction(
  _previousState: CreateTicketState,
  formData: FormData,
): Promise<CreateTicketState> {
  const session = await auth();

  if (
    !session?.user ||
    !session.user.isActive ||
    session.user.role !== "SOLICITANTE"
  ) {
    return {
      success: false,
      message: "Voce nao tem permissao para abrir chamados.",
    };
  }

  try {
    const result = await createTicket(
      {
        requesterId: session.user.id,
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        categoryId: String(formData.get("categoryId") ?? ""),
        priority: String(formData.get("priority") ?? ""),
      },
      prismaTicketDependencies,
    );

    if (!result.success) {
      return { success: false, errors: result.errors };
    }

    revalidatePath("/chamados");

    return {
      success: true,
      message: "Chamado aberto com sucesso.",
      ticketNumber: result.ticket.number,
    };
  } catch {
    return {
      success: false,
      message: "Nao foi possivel abrir o chamado. Tente novamente.",
    };
  }
}
