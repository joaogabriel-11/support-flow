import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginForm } from "./login-form";
import { HOME_BY_ROLE } from "@/lib/authorization";

export default async function LoginPage() {
  const session = await auth();

  if (session?.user && session.user.isActive)
    redirect(HOME_BY_ROLE[session.user.role]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <p className="font-semibold text-blue-600">Support Flow</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
          Acesse sua conta
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Informe seu e-mail e senha para continuar.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
