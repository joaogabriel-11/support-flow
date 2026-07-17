import bcrypt from "bcryptjs";

import { prisma } from "../../../lib/prisma";

export const prismaAuthDependencies = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        passwordHash: true,
        role: true,
        isActive: true,
      },
    });
  },

  verifyPassword(plainPassword: string, passwordHash: string) {
    return bcrypt.compare(plainPassword, passwordHash);
  },
};
