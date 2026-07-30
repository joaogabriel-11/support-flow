"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { notifyTicketResolved } from "@/features/notifications/ticket-email-notifications";
import { adminAssignTicket } from "@/features/tickets/admin-assign-ticket";
import { prismaAdminAssignmentDependencies } from "@/features/tickets/prisma-admin-assignment-dependencies";
import { prismaStatusDependencies } from "@/features/tickets/prisma-status-dependencies";
import { completeTicket } from "@/features/tickets/update-ticket-status";

export type AdminTicketActionState = {
  success?: boolean;
  message?: string;
  ticketId?: string;
};

function revalidateTicketPages(ticketId: string) {
  revalidatePath("/admin/chamados");
  revalidatePath("/fila");
  revalidatePath("/meus-atendimentos");
  revalidatePath("/chamados");
  revalidatePath(`/chamados/${ticketId}`);
}

export async function assignTicketByAdminAction(
  _previousState: AdminTicketActionState,
  formData: FormData,
): Promise<AdminTicketActionState> {
  const session = await auth();
  if (!session?.user?.isActive || session.user.role !== "ADMIN") {
    return {
      success: false,
      message: "Apenas administradores podem atribuir chamados.",
    };
  }

  const ticketId = String(formData.get("ticketId") ?? "");

  try {
    const result = await adminAssignTicket(
      {
        ticketId,
        adminId: session.user.id,
        targetAgentId: String(formData.get("targetAgentId") ?? ""),
      },
      prismaAdminAssignmentDependencies,
    );
    if (!result.success) {
      const messages = {
        INVALID_INPUT: "Selecione um agente valido.",
        TARGET_NOT_AVAILABLE: "O agente selecionado nao esta ativo ou disponivel.",
        TICKET_NOT_AVAILABLE: "O chamado mudou. Atualize a pagina e tente novamente.",
        SAME_AGENT: "Este usuario ja e o responsavel pelo chamado.",
        FINAL_STATUS: "Chamados resolvidos nao podem ser reatribuidos.",
      };
      return { success: false, message: messages[result.reason] };
    }

    revalidateTicketPages(ticketId);
    return {
      success: true,
      message: "Responsavel atualizado com sucesso.",
      ticketId,
    };
  } catch {
    return {
      success: false,
      message: "Nao foi possivel atualizar o responsavel.",
    };
  }
}

export async function completeTicketByAdminAction(
  _previousState: AdminTicketActionState,
  formData: FormData,
): Promise<AdminTicketActionState> {
  const session = await auth();
  if (!session?.user?.isActive || session.user.role !== "ADMIN") {
    return {
      success: false,
      message: "Apenas administradores podem concluir por esta area.",
    };
  }

  const ticketId = String(formData.get("ticketId") ?? "");

  try {
    const result = await completeTicket(
      {
        ticketId,
        agentId: session.user.id,
      },
      prismaStatusDependencies,
    );
    if (!result.success) {
      return {
        success: false,
        message:
          result.reason === "NOT_AVAILABLE"
            ? "Voce precisa ser o responsavel por um chamado em andamento."
            : "Chamado invalido.",
      };
    }

    await notifyTicketResolved(ticketId);
    revalidateTicketPages(ticketId);
    return {
      success: true,
      message: "Chamado concluido com sucesso.",
      ticketId,
    };
  } catch {
    return { success: false, message: "Nao foi possivel concluir o chamado." };
  }
}
