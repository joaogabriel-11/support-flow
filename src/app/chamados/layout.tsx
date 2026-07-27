import { AppShell } from "@/components/app-shell";
import { requireActiveSession } from "@/lib/server-authorization";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireActiveSession();
  return <AppShell session={session}>{children}</AppShell>;
}
