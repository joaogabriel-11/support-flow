import Link from "next/link";
import { auth } from "@/auth";
import { HOME_BY_ROLE } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();
  if (!session?.user || !session.user.isActive) redirect("/login");
  return <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6"><section className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200"><p className="font-semibold text-red-600">403</p><h1 className="mt-2 text-3xl font-bold text-slate-900">Acesso negado</h1><p className="mt-3 text-slate-600">Seu perfil não tem permissão para acessar esta página.</p><Link href={HOME_BY_ROLE[session.user.role]} className="mt-6 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">Voltar para minha área</Link></section></main>;
}
