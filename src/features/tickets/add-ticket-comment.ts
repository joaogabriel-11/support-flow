import {
  canViewTicket,
  type TicketViewer,
  type ViewableTicket,
} from "@/features/tickets/can-view-ticket";

export const COMMENT_TYPES = ["PUBLICO", "INTERNO"] as const;
export type CommentType = (typeof COMMENT_TYPES)[number];

type AddTicketCommentDependencies<TComment> = {
  findTicket: (ticketId: string) => Promise<ViewableTicket | null>;
  persistComment: (input: {
    ticketId: string;
    authorId: string;
    content: string;
    type: CommentType;
  }) => Promise<TComment>;
};

export type AddTicketCommentResult<TComment> =
  | { success: true; comment: TComment }
  | {
      success: false;
      reason: "INVALID_INPUT" | "NOT_ALLOWED" | "NOT_FOUND";
      contentError?: string;
    };

export async function addTicketComment<TComment>(
  input: {
    ticketId: string;
    content: string;
    type: string;
    viewer: TicketViewer;
  },
  dependencies: AddTicketCommentDependencies<TComment>,
): Promise<AddTicketCommentResult<TComment>> {
  const ticketId = input.ticketId.trim();
  const content = input.content.trim();
  const type = input.type.trim().toUpperCase();

  if (!ticketId || !COMMENT_TYPES.includes(type as CommentType)) {
    return { success: false, reason: "INVALID_INPUT" };
  }
  if (content.length < 2 || content.length > 2000) {
    return {
      success: false,
      reason: "INVALID_INPUT",
      contentError: "A mensagem deve ter entre 2 e 2000 caracteres.",
    };
  }
  if (input.viewer.role === "SOLICITANTE" && type === "INTERNO") {
    return { success: false, reason: "NOT_ALLOWED" };
  }

  const ticket = await dependencies.findTicket(ticketId);
  if (!ticket) return { success: false, reason: "NOT_FOUND" };
  if (!canViewTicket(input.viewer, ticket)) {
    return { success: false, reason: "NOT_ALLOWED" };
  }

  const comment = await dependencies.persistComment({
    ticketId,
    authorId: input.viewer.id,
    content,
    type: type as CommentType,
  });
  return { success: true, comment };
}
