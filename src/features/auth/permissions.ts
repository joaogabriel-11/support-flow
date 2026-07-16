import type { UserRole } from "./authenticate-user";

export type ProtectedArea =
  | "SOLICITANTE_AREA"
  | "AGENT_QUEUE"
  | "USER_MANAGEMENT"
  | "CATEGORY_MANAGEMENT";

const permissions: Record<UserRole, ProtectedArea[]> = {
  SOLICITANTE: ["SOLICITANTE_AREA"],
  AGENTE: ["AGENT_QUEUE"],
  ADMIN: ["AGENT_QUEUE", "USER_MANAGEMENT", "CATEGORY_MANAGEMENT"],
};

export function canAccess(role: UserRole, protectedArea: ProtectedArea) {
  return permissions[role].includes(protectedArea);
}
