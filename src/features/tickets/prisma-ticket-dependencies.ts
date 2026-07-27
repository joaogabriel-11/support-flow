import { prisma } from "@/lib/prisma";

export const prismaTicketDependencies = {
  async categoryExists(categoryId: string) {
    const category = await prisma.category.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });

    return Boolean(category);
  },

  persistTicket(input: {
    requesterId: string;
    title: string;
    description: string;
    categoryId: string;
    priority: "BAIXA" | "MEDIA" | "ALTA" | "CRITICA";
  }) {
    return prisma.$transaction(async (transaction) => {
      const ticket = await transaction.ticket.create({
        data: {
          requesterId: input.requesterId,
          title: input.title,
          description: input.description,
          categoryId: input.categoryId,
          priority: input.priority,
        },
        select: { id: true, number: true },
      });

      await transaction.ticketActivity.create({
        data: {
          ticketId: ticket.id,
          actorId: input.requesterId,
          type: "CHAMADO_CRIADO",
        },
      });

      return ticket;
    });
  },
};
