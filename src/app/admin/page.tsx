import { CreateUserForm } from "@/app/admin/create-user-form";
import { UserStatusButton } from "@/app/admin/user-status-button";
import { prisma } from "@/lib/prisma";
import { requirePathAccess } from "@/lib/server-authorization";

const roleLabels = {
  SOLICITANTE: "Solicitante",
  AGENTE: "Agente",
  ADMIN: "Administrador",
};

export default async function Page() {
  const session = await requirePathAccess("/admin");
  const users = await prisma.user.findMany({
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  const activeUsers = users.filter((user) => user.isActive).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Administracao</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Gestao de usuarios</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Crie acessos e controle quem pode entrar no Support Flow.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-wider text-slate-400">Ativos</p>
            <p className="mt-1 text-2xl font-bold">{activeUsers}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">Total</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{users.length}</p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 xl:grid-cols-[minmax(320px,0.75fr)_minmax(0,1.25fr)]">
        <section className="self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-950">Novo usuario</h2>
          <p className="mt-1 text-sm text-slate-600">Cadastre o acesso e defina as permissoes iniciais.</p>
          <CreateUserForm />
        </section>

        <section aria-labelledby="users-title">
          <div>
            <h2 id="users-title" className="text-xl font-bold text-slate-950">Usuarios cadastrados</h2>
            <p className="mt-1 text-sm text-slate-600">Contas ativas aparecem primeiro.</p>
          </div>
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Usuario</th>
                    <th className="px-5 py-4">Perfil</th>
                    <th className="px-5 py-4">Situacao</th>
                    <th className="px-5 py-4 text-right">Acao</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{roleLabels[user.role]}</td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${user.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                          {user.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <UserStatusButton
                          userId={user.id}
                          isActive={user.isActive}
                          isCurrentUser={user.id === session.user.id}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
