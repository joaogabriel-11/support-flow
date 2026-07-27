import { prisma } from "@/lib/prisma";

export const prismaStatusDependencies = {
  complete(input: { ticketId: string; agentId: string }) {
    return prisma.$transaction(async (transaction) => {
      const ticket = await transaction.ticket.findFirst({
        where: {
          id: input.ticketId,
          agentId: input.agentId,
          status: "EM_ANDAMENTO",
        },
        select: { id: true, number: true, status: true },
      });

      if (!ticket) return null;

      const update = await transaction.ticket.updateMany({
        where: {
          id: ticket.id,
          agentId: input.agentId,
          status: "EM_ANDAMENTO",
        },
        data: {
          status: "RESOLVIDO",
          resolvedAt: new Date(),
        },
      });

      if (update.count !== 1) return null;

      await transaction.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: input.agentId,
          type: "STATUS_ALTERADO",
          previousValue: ticket.status,
          newValue: "RESOLVIDO",
        },
      });

      return { id: ticket.id, number: ticket.number };
    });
  },
};
