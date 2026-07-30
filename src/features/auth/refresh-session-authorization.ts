import type { UserRole } from "@/features/auth/authenticate-user";

export type SessionAuthorization = {
  role: UserRole;
  isActive: boolean;
};

type RefreshSessionAuthorizationDependencies = {
  findAuthorizationById: (
    userId: string,
  ) => Promise<SessionAuthorization | null>;
};

const inactiveAuthorization: SessionAuthorization = {
  role: "SOLICITANTE",
  isActive: false,
};

export async function refreshSessionAuthorization(
  userId: string,
  dependencies: RefreshSessionAuthorizationDependencies,
) {
  if (!userId.trim()) return inactiveAuthorization;

  try {
    return (
      (await dependencies.findAuthorizationById(userId)) ??
      inactiveAuthorization
    );
  } catch {
    // Authorization fails closed if the database cannot confirm the user.
    return inactiveAuthorization;
  }
}
