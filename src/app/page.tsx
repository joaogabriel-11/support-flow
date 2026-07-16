import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { HOME_BY_ROLE } from "@/lib/authorization";

export default async function HomePage() {
  const session = await auth();
  if (!session?.user || !session.user.isActive) redirect("/login");
  redirect(HOME_BY_ROLE[session.user.role]);
}
