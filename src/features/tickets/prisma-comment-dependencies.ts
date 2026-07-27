import type { CommentType } from "@/features/tickets/add-ticket-comment";
import { prisma } from "@/lib/prisma";

export const prismaCommentDependencies = {
  findTicket(ticketId: string) {
    return prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { requesterId: true, agentId: true },
    });
  },
  persistComment(input: {
    ticketId: string;
    authorId: string;
    content: string;
    type: CommentType;
  }) {
    return prisma.$transaction(async (transaction) => {
      const comment = await transaction.ticketComment.create({
        data: input,
        select: { id: true },
      });
      await transaction.ticket.update({
        where: { id: input.ticketId },
        data: { updatedAt: new Date() },
      });
      return comment;
    });
  },
};
