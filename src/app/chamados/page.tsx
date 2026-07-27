import { auth } from "@/auth";
import { TicketForm } from "@/app/chamados/ticket-form";
import { prisma } from "@/lib/prisma";

const priorityStyles = {
  BAIXA: "bg-slate-100 text-slate-700",
  MEDIA: "bg-blue-100 text-blue-800",
  ALTA: "bg-amber-100 text-amber-800",
  CRITICA: "bg-red-100 text-red-800",
};

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

export default async function Page() {
  const session = await auth();

  if (!session?.user) return null;

  const [categories, tickets] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.ticket.findMany({
      where: { requesterId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        number: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Central de suporte
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Meus chamados
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Abra uma solicitacao com contexto suficiente e acompanhe o
            atendimento em um so lugar.
          </p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">
            Total de chamados
          </p>
          <p className="mt-1 text-3xl font-bold">{tickets.length}</p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Abrir novo chamado
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Os campos ajudam a equipe a priorizar e resolver mais rapido.
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
              Novo
            </span>
          </div>

          {session.user.role === "SOLICITANTE" ? (
            <TicketForm categories={categories} />
          ) : (
            <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
              Apenas solicitantes podem abrir novos chamados.
            </p>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Historico recente
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Chamados mais recentes primeiro.
              </p>
            </div>
          </div>

          {tickets.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-12 text-center">
              <p className="font-semibold text-slate-800">
                Nenhum chamado aberto ainda
              </p>
              <p className="mt-2 text-sm text-slate-500">
                Seu primeiro chamado aparecera aqui assim que for enviado.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {tickets.map((ticket) => (
                <article
                  key={ticket.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                        #{ticket.number} · {ticket.category.name}
                      </p>
                      <h3 className="mt-2 truncate font-bold text-slate-950">
                        {ticket.title}
                      </h3>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyles[ticket.priority]}`}
                    >
                      {priorityLabels[ticket.priority]}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">
                      {statusLabels[ticket.status]}
                    </span>
                    <time dateTime={ticket.createdAt.toISOString()}>
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(ticket.createdAt)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
