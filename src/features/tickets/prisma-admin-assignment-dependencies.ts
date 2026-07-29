import { prisma } from "@/lib/prisma";

export const prismaAdminAssignmentDependencies = {
  assign(input: {
    ticketId: string;
    adminId: string;
    targetAgentId: string;
  }) {
    return prisma.$transaction(async (transaction) => {
      const [targetAgent, ticket] = await Promise.all([
        transaction.user.findUnique({
          where: { id: input.targetAgentId },
          select: { id: true, name: true, role: true, isActive: true },
        }),
        transaction.ticket.findUnique({
          where: { id: input.ticketId },
          select: {
            id: true,
            number: true,
            status: true,
            agentId: true,
            agent: { select: { name: true } },
          },
        }),
      ]);

      const targetCanReceive =
        targetAgent?.isActive &&
        (targetAgent.role === "AGENTE" ||
          (targetAgent.role === "ADMIN" && targetAgent.id === input.adminId));
      if (!targetCanReceive) {
        return {
          success: false as const,
          reason: "TARGET_NOT_AVAILABLE" as const,
        };
      }
      if (!ticket) {
        return {
          success: false as const,
          reason: "TICKET_NOT_AVAILABLE" as const,
        };
      }
      if (ticket.status === "RESOLVIDO" || ticket.status === "FECHADO") {
        return { success: false as const, reason: "FINAL_STATUS" as const };
      }
      if (ticket.agentId === targetAgent.id) {
        return { success: false as const, reason: "SAME_AGENT" as const };
      }
      if (!ticket.agentId && ticket.status !== "ABERTO") {
        return {
          success: false as const,
          reason: "TICKET_NOT_AVAILABLE" as const,
        };
      }

      const update = await transaction.ticket.updateMany({
        where: {
          id: ticket.id,
          status: ticket.status,
          agentId: ticket.agentId,
        },
        data: {
          agentId: targetAgent.id,
          assignedAt: new Date(),
          status:
            ticket.status === "ABERTO" ? "EM_ANDAMENTO" : ticket.status,
        },
      });
      if (update.count !== 1) {
        return {
          success: false as const,
          reason: "TICKET_NOT_AVAILABLE" as const,
        };
      }

      const isReassignment = Boolean(ticket.agentId);
      await transaction.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: input.adminId,
          type: isReassignment
            ? "CHAMADO_REATRIBUIDO"
            : "CHAMADO_ATRIBUIDO",
          previousValue: ticket.agentId,
          newValue: targetAgent.id,
          metadata: {
            previousAgentName: ticket.agent?.name ?? null,
            newAgentName: targetAgent.name,
            assignmentType:
              targetAgent.id === input.adminId
                ? "ADMIN_SELF_ASSIGNMENT"
                : "ADMIN_MANUAL",
          },
        },
      });

      return {
        success: true as const,
        ticket: {
          id: ticket.id,
          number: ticket.number,
          agentId: targetAgent.id,
        },
      };
    });
  },
};
