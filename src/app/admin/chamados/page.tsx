import { AdminTicketActions } from "@/app/admin/chamados/admin-ticket-actions";
import { prisma } from "@/lib/prisma";
import { requirePathAccess } from "@/lib/server-authorization";
import Link from "next/link";

const PAGE_SIZE = 20;
const statuses = [
  "ABERTO",
  "EM_ANDAMENTO",
  "AGUARDANDO_SOLICITANTE",
  "RESOLVIDO",
  "FECHADO",
] as const;
const priorities = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;

const statusLabels = {
  ABERTO: "Aberto",
  EM_ANDAMENTO: "Em andamento",
  AGUARDANDO_SOLICITANTE: "Aguardando solicitante",
  RESOLVIDO: "Resolvido",
  FECHADO: "Fechado",
};
const priorityLabels = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Critica",
};
const statusOrder = {
  EM_ANDAMENTO: 0,
  AGUARDANDO_SOLICITANTE: 1,
  ABERTO: 2,
  RESOLVIDO: 3,
  FECHADO: 4,
};
const priorityOrder = { CRITICA: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
const priorityStyles = {
  BAIXA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-blue-100 text-blue-800",
  ALTA: "bg-amber-100 text-amber-800",
  CRITICA: "bg-red-100 text-red-800",
};

function valueOf(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function paginationHref(
  filters: Record<string, string>,
  page: number,
) {
  const query = new URLSearchParams(
    Object.entries(filters).filter(([, value]) => value),
  );
  query.set("page", String(page));
  return `/admin/chamados?${query.toString()}`;
}

export default async function AdminTicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requirePathAccess("/admin/chamados");
  const params = await searchParams;
  const statusParam = valueOf(params.status);
  const priorityParam = valueOf(params.priority);
  const categoryParam = valueOf(params.category);
  const agentParam = valueOf(params.agent);
  const pageParam = Number(valueOf(params.page));
  const requestedPage =
    Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
  const status = statuses.includes(statusParam as (typeof statuses)[number])
    ? (statusParam as (typeof statuses)[number])
    : undefined;
  const priority = priorities.includes(
    priorityParam as (typeof priorities)[number],
  )
    ? (priorityParam as (typeof priorities)[number])
    : undefined;

  const where = {
    ...(status ? { status } : {}),
    ...(priority ? { priority } : {}),
    ...(categoryParam ? { categoryId: categoryParam } : {}),
    ...(agentParam === "unassigned"
      ? { agentId: null }
      : agentParam
        ? { agentId: agentParam }
        : {}),
  };

  const [allTickets, categories, activeAgents, filterAgents] =
    await Promise.all([
      prisma.ticket.findMany({
        where,
        select: {
          id: true,
          number: true,
          title: true,
          status: true,
          priority: true,
          createdAt: true,
          updatedAt: true,
          requester: { select: { name: true } },
          category: { select: { name: true } },
          agent: {
            select: { id: true, name: true, isActive: true, role: true },
          },
        },
      }),
      prisma.category.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, isActive: true },
      }),
      prisma.user.findMany({
        where: { role: "AGENTE", isActive: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
      }),
      prisma.user.findMany({
        where: {
          role: { in: ["AGENTE", "ADMIN"] },
          assignedTickets: { some: {} },
        },
        orderBy: { name: "asc" },
        select: { id: true, name: true, isActive: true, role: true },
      }),
    ]);

  const orderedTickets = allTickets.toSorted(
    (first, second) =>
      statusOrder[first.status] - statusOrder[second.status] ||
      priorityOrder[first.priority] - priorityOrder[second.priority] ||
      first.createdAt.getTime() - second.createdAt.getTime(),
  );
  const totalPages = Math.max(1, Math.ceil(orderedTickets.length / PAGE_SIZE));
  const currentPage = Math.min(requestedPage, totalPages);
  const tickets = orderedTickets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );
  const filters = {
    status: statusParam,
    priority: priorityParam,
    category: categoryParam,
    agent: agentParam,
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Administracao
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Todos os chamados
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Acompanhe a operacao e distribua os chamados entre agentes ativos.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Resultado
          </p>
          <p className="mt-1 text-2xl font-bold">{orderedTickets.length}</p>
        </div>
      </header>

      <form
        method="get"
        className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5"
      >
        <label className="text-sm font-semibold text-slate-700">
          Status
          <select
            name="status"
            defaultValue={statusParam}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todos</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {statusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Categoria
          <select
            name="category"
            defaultValue={categoryParam}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todas</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.isActive ? "" : " (inativa)"}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Prioridade
          <select
            name="priority"
            defaultValue={priorityParam}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todas</option>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {priorityLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-700">
          Responsavel
          <select
            name="agent"
            defaultValue={agentParam}
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal"
          >
            <option value="">Todos</option>
            <option value="unassigned">Sem responsavel</option>
            {filterAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
                {agent.isActive ? "" : " (inativo)"}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end gap-2">
          <button
            type="submit"
            className="flex-1 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700"
          >
            Filtrar
          </button>
          <Link
            href="/admin/chamados"
            className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            Limpar
          </Link>
        </div>
      </form>

      {tickets.length ? (
        <section className="grid gap-5 xl:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              aria-labelledby={`admin-ticket-${ticket.id}-title`}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    #{ticket.number} - {ticket.category.name}
                  </p>
                  <h2
                    id={`admin-ticket-${ticket.id}-title`}
                    className="mt-2 text-lg font-bold text-slate-950"
                  >
                    {ticket.title}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Solicitante: {ticket.requester.name}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyles[ticket.priority]}`}
                >
                  {priorityLabels[ticket.priority]}
                </span>
              </div>
              <dl className="mt-5 grid gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">
                    Status
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {statusLabels[ticket.status]}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-slate-400">
                    Responsavel
                  </dt>
                  <dd className="mt-1 font-bold text-slate-800">
                    {ticket.agent?.name ?? "Sem responsavel"}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex items-center justify-between gap-4 text-xs text-slate-500">
                <span>
                  Atualizado{" "}
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  }).format(ticket.updatedAt)}
                </span>
                <Link
                  href={`/chamados/${ticket.id}`}
                  className="font-bold text-blue-700 hover:text-blue-900"
                >
                  Ver detalhes
                </Link>
              </div>
              <AdminTicketActions
                ticket={{
                  id: ticket.id,
                  status: ticket.status,
                  agentId: ticket.agent?.id ?? null,
                }}
                adminId={session.user.id}
                activeAgents={activeAgents}
              />
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <h2 className="font-bold text-slate-900">Nenhum chamado encontrado</h2>
          <p className="mt-2 text-sm text-slate-500">
            Ajuste ou limpe os filtros para ver outros resultados.
          </p>
        </section>
      )}

      {totalPages > 1 ? (
        <nav
          aria-label="Paginacao de chamados"
          className="flex items-center justify-center gap-3"
        >
          {currentPage > 1 ? (
            <Link
              href={paginationHref(filters, currentPage - 1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Anterior
            </Link>
          ) : null}
          <span className="text-sm font-semibold text-slate-600">
            Pagina {currentPage} de {totalPages}
          </span>
          {currentPage < totalPages ? (
            <Link
              href={paginationHref(filters, currentPage + 1)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700"
            >
              Proxima
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
