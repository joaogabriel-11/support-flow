"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { assignTicket } from "@/features/tickets/assign-ticket";
import { prismaAssignmentDependencies } from "@/features/tickets/prisma-assignment-dependencies";

export type AssignTicketState = {
  error?: string;
};

export async function assignTicketAction(
  _previousState: AssignTicketState,
  formData: FormData,
): Promise<AssignTicketState> {
  const session = await auth();

  if (
    !session?.user ||
    !session.user.isActive ||
    session.user.role !== "AGENTE"
  ) {
    return { error: "Apenas agentes podem assumir chamados." };
  }

  try {
    const result = await assignTicket(
      {
        ticketId: String(formData.get("ticketId") ?? ""),
        agentId: session.user.id,
      },
      prismaAssignmentDependencies,
    );

    if (!result.success) {
      return {
        error:
          result.reason === "NOT_AVAILABLE"
            ? "Este chamado ja foi assumido por outro agente."
            : "Chamado invalido.",
      };
    }

    revalidatePath("/fila");
    revalidatePath("/meus-atendimentos");
    return {};
  } catch {
    return { error: "Nao foi possivel assumir o chamado. Tente novamente." };
  }
}
