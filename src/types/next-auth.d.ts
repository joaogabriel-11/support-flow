import type { DefaultSession } from "next-auth";
import type { UserRole } from "../../generated/prisma/enums";

declare module "next-auth" {
  interface User {
    role: UserRole;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      isActive: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isActive: boolean;
  }
}
