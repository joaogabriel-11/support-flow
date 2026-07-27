import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";

export const prismaUserDependencies = {
  async emailExists(email: string) {
    return (await prisma.user.count({ where: { email } })) > 0;
  },
  hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  },
  persistUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    role: "SOLICITANTE" | "AGENTE" | "ADMIN";
  }) {
    return prisma.user.create({
      data: input,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
  },
  async setActive(input: { userId: string; isActive: boolean }) {
    const update = await prisma.user.updateMany({
      where: { id: input.userId },
      data: { isActive: input.isActive },
    });
    if (update.count !== 1) return null;
    return prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true, isActive: true },
    });
  },
};
