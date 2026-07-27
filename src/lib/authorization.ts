import type { UserRole } from "../../generated/prisma/enums";

export const HOME_BY_ROLE: Record<UserRole, string> = {
  SOLICITANTE: "/chamados",
  AGENTE: "/fila",
  ADMIN: "/admin",
};

export const PRIVATE_ROUTE_ROLES: Record<string, UserRole[]> = {
  "/chamados": ["SOLICITANTE", "ADMIN"],
  "/fila": ["AGENTE", "ADMIN"],
  "/meus-atendimentos": ["AGENTE"],
  "/admin": ["ADMIN"],
};

export function rolesForPath(pathname: string) {
  if (pathname.startsWith("/chamados/")) {
    return ["SOLICITANTE", "AGENTE", "ADMIN"] satisfies UserRole[];
  }

  const route = Object.keys(PRIVATE_ROUTE_ROLES).find(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  return route ? PRIVATE_ROUTE_ROLES[route] : undefined;
}
