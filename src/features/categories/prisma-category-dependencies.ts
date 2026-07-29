import { prisma } from "@/lib/prisma";

const selectCategory = {
  id: true,
  name: true,
  isActive: true,
} as const;

export const prismaCategoryDependencies = {
  async nameExists(name: string) {
    return Boolean(
      await prisma.category.findFirst({
        where: { name: { equals: name, mode: "insensitive" } },
        select: { id: true },
      }),
    );
  },
  async nameExistsForAnother(input: { id: string; name: string }) {
    return Boolean(
      await prisma.category.findFirst({
        where: {
          id: { not: input.id },
          name: { equals: input.name, mode: "insensitive" },
        },
        select: { id: true },
      }),
    );
  },
  persistCategory(name: string) {
    return prisma.category.create({
      data: { name },
      select: selectCategory,
    });
  },
  async updateCategory(input: { id: string; name: string }) {
    const update = await prisma.category.updateMany({
      where: { id: input.id },
      data: { name: input.name },
    });
    if (update.count !== 1) return null;
    return prisma.category.findUnique({
      where: { id: input.id },
      select: selectCategory,
    });
  },
  changeStatus(input: { id: string; isActive: boolean }) {
    return prisma.$transaction(async (transaction) => {
      const category = await transaction.category.findUnique({
        where: { id: input.id },
        select: selectCategory,
      });
      if (!category) {
        return { success: false as const, reason: "NOT_FOUND" as const };
      }
      if (!input.isActive && category.isActive) {
        const activeCount = await transaction.category.count({
          where: { isActive: true },
        });
        if (activeCount <= 1) {
          return { success: false as const, reason: "LAST_ACTIVE" as const };
        }
      }
      const updated = await transaction.category.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
        select: selectCategory,
      });
      return { success: true as const, category: updated };
    });
  },
  deleteSafely(id: string) {
    return prisma.$transaction(async (transaction) => {
      const category = await transaction.category.findUnique({
        where: { id },
        select: {
          ...selectCategory,
          _count: { select: { tickets: true } },
        },
      });
      if (!category) {
        return { success: false as const, reason: "NOT_FOUND" as const };
      }
      if (category._count.tickets > 0) {
        return { success: false as const, reason: "IN_USE" as const };
      }
      if (category.isActive) {
        const activeCount = await transaction.category.count({
          where: { isActive: true },
        });
        if (activeCount <= 1) {
          return { success: false as const, reason: "LAST_ACTIVE" as const };
        }
      }
      const deleted = await transaction.category.delete({
        where: { id },
        select: selectCategory,
      });
      return { success: true as const, category: deleted };
    });
  },
};
