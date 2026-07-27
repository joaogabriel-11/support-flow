import { auth } from "@/auth";
import { rolesForPath } from "@/lib/authorization";
import { redirect } from "next/navigation";

export async function requireActiveSession() {
  const session = await auth();
  if (!session?.user || !session.user.isActive) redirect("/login");
  return session;
}

export async function requirePathAccess(pathname: string) {
  const session = await requireActiveSession();
  const allowedRoles = rolesForPath(pathname);

  if (!allowedRoles || !allowedRoles.includes(session.user.role)) {
    redirect("/acesso-negado");
  }
  return session;
}
