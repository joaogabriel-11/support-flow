"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/auth";
import { addTicketComment } from "@/features/tickets/add-ticket-comment";
import { prismaCommentDependencies } from "@/features/tickets/prisma-comment-dependencies";

export type AddCommentState = {
  success?: boolean;
  message?: string;
  contentError?: string;
  commentId?: string;
};

export async function addCommentAction(
  _previousState: AddCommentState,
  formData: FormData,
): Promise<AddCommentState> {
  const session = await auth();
  if (!session?.user?.isActive) {
    return { success: false, message: "Entre novamente para enviar a mensagem." };
  }

  const ticketId = String(formData.get("ticketId") ?? "");

  try {
    const result = await addTicketComment(
      {
        ticketId,
        content: String(formData.get("content") ?? ""),
        type: String(formData.get("type") ?? "PUBLICO"),
        viewer: session.user,
      },
      prismaCommentDependencies,
    );

    if (!result.success) {
      return {
        success: false,
        contentError: result.contentError,
        message:
          result.reason === "NOT_ALLOWED"
            ? "Voce nao tem permissao para enviar esta mensagem."
            : result.reason === "NOT_FOUND"
              ? "Chamado nao encontrado."
              : undefined,
      };
    }

    revalidatePath(`/chamados/${ticketId}`);
    revalidatePath("/chamados");
    revalidatePath("/meus-atendimentos");
    return {
      success: true,
      message: "Mensagem enviada com sucesso.",
      commentId: result.comment.id,
    };
  } catch {
    return { success: false, message: "Nao foi possivel enviar a mensagem." };
  }
}
