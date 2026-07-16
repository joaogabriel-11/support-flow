import { AppShell } from "@/components/app-shell";
import { requirePathAccess } from "@/lib/server-authorization";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requirePathAccess("/meus-atendimentos");
  return <AppShell session={session}>{children}</AppShell>;
}
