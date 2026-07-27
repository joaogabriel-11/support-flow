"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { prismaStatusDependencies } from "@/features/tickets/prisma-status-dependencies";
import { completeTicket } from "@/features/tickets/update-ticket-status";

export type CompleteTicketState = {
  success?: boolean;
  message?: string;
};

export async function completeTicketAction(
  _previousState: CompleteTicketState,
  formData: FormData,
): Promise<CompleteTicketState> {
  const session = await auth();

  if (
    !session?.user ||
    !session.user.isActive ||
    session.user.role !== "AGENTE"
  ) {
    return {
      success: false,
      message: "Apenas agentes podem atualizar o atendimento.",
    };
  }

  try {
    const result = await completeTicket(
      {
        ticketId: String(formData.get("ticketId") ?? ""),
        agentId: session.user.id,
      },
      prismaStatusDependencies,
    );

    if (!result.success) {
      return {
        success: false,
        message:
          result.reason === "NOT_AVAILABLE"
            ? "O chamado mudou ou nao esta mais disponivel para voce."
            : "Chamado invalido.",
      };
    }

    revalidatePath("/meus-atendimentos");
    revalidatePath("/chamados");

    return { success: true, message: "Chamado concluido com sucesso." };
  } catch {
    return {
      success: false,
      message: "Nao foi possivel concluir o chamado. Tente novamente.",
    };
  }
}
