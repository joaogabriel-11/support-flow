import { auth } from "@/auth";
import { CompleteTicketForm } from "@/app/meus-atendimentos/status-form";
import { ResolvedTicketsSection } from "@/components/resolved-tickets-section";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

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

export default async function Page() {
  const session = await auth();
  if (!session?.user) return null;

  const tickets = await prisma.ticket.findMany({
    where: { agentId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      number: true,
      title: true,
      description: true,
      status: true,
      priority: true,
      assignedAt: true,
      category: { select: { name: true } },
      requester: { select: { name: true } },
    },
  });
  const activeTickets = tickets.filter(
    (ticket) => ticket.status !== "RESOLVIDO" && ticket.status !== "FECHADO",
  );
  const resolvedTickets = tickets.filter(
    (ticket) => ticket.status === "RESOLVIDO" || ticket.status === "FECHADO",
  );

  const renderTicket = (ticket: (typeof tickets)[number]) => (
    <article
      key={ticket.id}
      aria-labelledby={`assigned-ticket-${ticket.id}-title`}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            #{ticket.number} - {ticket.category.name}
          </p>
          <h3
            id={`assigned-ticket-${ticket.id}-title`}
            className="mt-2 text-lg font-bold text-slate-950"
          >
            {ticket.title}
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            Solicitante: {ticket.requester.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${priorityStyles[ticket.priority]}`}>
            {ticket.priority}
          </span>
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">
            {statusLabels[ticket.status]}
          </span>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-600">{ticket.description}</p>
      {ticket.assignedAt ? (
        <p className="mt-5 text-xs text-slate-500">
          Assumido em{" "}
          {new Intl.DateTimeFormat("pt-BR", {
            dateStyle: "short",
            timeStyle: "short",
          }).format(ticket.assignedAt)}
        </p>
      ) : null}
      {ticket.status === "EM_ANDAMENTO" ? (
        <CompleteTicketForm ticketId={ticket.id} />
      ) : null}
      <Link
        href={`/chamados/${ticket.id}`}
        className="mt-4 inline-flex text-sm font-bold text-blue-700 hover:text-blue-900"
      >
        Ver detalhes
      </Link>
    </article>
  );

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Minha operacao</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">Meus atendimentos</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Chamados sob sua responsabilidade, do atendimento a resolucao.</p>
        </div>
        <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-400">Em acompanhamento</p>
          <p className="mt-1 text-3xl font-bold">{activeTickets.length}</p>
        </div>
      </header>

      {tickets.length === 0 ? (
        <section className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-bold text-slate-900">Nenhum atendimento atribuido</p>
          <p className="mt-2 text-sm text-slate-500">Assuma um chamado na fila para comecar o atendimento.</p>
        </section>
      ) : (
        <div className="space-y-10">
          <section aria-labelledby="active-tickets-title">
            <h2 id="active-tickets-title" className="text-xl font-bold text-slate-950">Para resolver</h2>
            <p className="mt-1 text-sm text-slate-600">Chamados que ainda precisam da sua atuacao.</p>
            {activeTickets.length ? (
              <div className="mt-5 space-y-4">{activeTickets.map(renderTicket)}</div>
            ) : (
              <p className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Nenhum chamado aguardando resolucao.</p>
            )}
          </section>
          <ResolvedTicketsSection
            count={resolvedTickets.length}
            description="Historico dos chamados que voce ja concluiu."
          >
            {resolvedTickets.length ? (
              <div className="space-y-4">{resolvedTickets.map(renderTicket)}</div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">Nenhum chamado resolvido ainda.</p>
            )}
          </ResolvedTicketsSection>
        </div>
      )}
    </div>
  );
}
