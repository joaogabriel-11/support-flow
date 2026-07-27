import { prisma } from "@/lib/prisma";

const priorityStyles = {
  BAIXA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-blue-100 text-blue-800",
  ALTA: "bg-amber-100 text-amber-800",
  CRITICA: "bg-red-100 text-red-800",
};

const priorityLabels = {
  BAIXA: "Baixa",
  MEDIA: "Media",
  ALTA: "Alta",
  CRITICA: "Critica",
};

export default async function Page() {
  const tickets = await prisma.ticket.findMany({
    where: { status: "ABERTO", agentId: null },
    orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      number: true,
      title: true,
      description: true,
      priority: true,
      createdAt: true,
      category: { select: { name: true } },
      requester: { select: { name: true, email: true } },
    },
  });

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Operacao
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Fila de atendimento
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Chamados abertos e ainda sem um agente responsavel.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Aguardando atendimento
          </p>
          <p className="mt-1 text-3xl font-bold">{tickets.length}</p>
        </div>
      </header>

      {tickets.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold text-slate-900">Fila vazia</p>
          <p className="mt-2 text-sm text-slate-500">
            Nao ha chamados aguardando atendimento neste momento.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-2">
          {tickets.map((ticket) => (
            <article
              key={ticket.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                    #{ticket.number} · {ticket.category.name}
                  </p>
                  <h2 className="mt-2 text-lg font-bold text-slate-950">
                    {ticket.title}
                  </h2>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyles[ticket.priority]}`}
                >
                  {priorityLabels[ticket.priority]}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                {ticket.description}
              </p>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Solicitante
                  </p>
                  <p className="mt-1 font-semibold text-slate-800">
                    {ticket.requester.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {ticket.requester.email}
                  </p>
                </div>
                <div className="sm:text-right">
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Aberto em
                  </p>
                  <time
                    dateTime={ticket.createdAt.toISOString()}
                    className="mt-1 block font-semibold text-slate-800"
                  >
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                      timeStyle: "short",
                    }).format(ticket.createdAt)}
                  </time>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}
