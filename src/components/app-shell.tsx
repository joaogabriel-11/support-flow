import type { Session } from "next-auth";
import Link from "next/link";

import { signOut } from "@/auth";

const navigation = {
  SOLICITANTE: [{ href: "/chamados", label: "Meus chamados" }],
  AGENTE: [
    { href: "/fila", label: "Fila" },
    { href: "/meus-atendimentos", label: "Meus atendimentos" },
  ],
  ADMIN: [
    { href: "/admin", label: "Usuarios" },
    { href: "/admin/categorias", label: "Categorias" },
    { href: "/admin/chamados", label: "Chamados" },
    { href: "/fila", label: "Fila" },
  ],
};

export function AppShell({
  session,
  children,
}: {
  session: Session;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
          <Link href="/" className="font-bold text-blue-600">
            Support Flow
          </Link>
          <nav className="flex flex-1 gap-5 text-sm font-medium text-slate-700">
            {navigation[session.user.role].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-blue-600"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-right text-sm">
            <p className="font-medium text-slate-900">{session.user.name}</p>
            <p className="text-xs text-slate-500">{session.user.role}</p>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Sair
            </button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
