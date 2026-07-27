import { prisma } from "@/lib/prisma";

export const prismaAssignmentDependencies = {
  claimTicket(input: { ticketId: string; agentId: string }) {
    return prisma.$transaction(async (transaction) => {
      const assignment = await transaction.ticket.updateMany({
        where: {
          id: input.ticketId,
          status: "ABERTO",
          agentId: null,
        },
        data: {
          agentId: input.agentId,
          status: "EM_ANDAMENTO",
          assignedAt: new Date(),
        },
      });

      if (assignment.count !== 1) return null;

      await transaction.ticketActivity.create({
        data: {
          ticketId: input.ticketId,
          actorId: input.agentId,
          type: "CHAMADO_ATRIBUIDO",
          newValue: input.agentId,
        },
      });

      return transaction.ticket.findUniqueOrThrow({
        where: { id: input.ticketId },
        select: { id: true, number: true },
      });
    });
  },
};
