import { CommentForm } from "@/app/chamados/[id]/comment-form";
import { prisma } from "@/lib/prisma";
import { requireActiveSession } from "@/lib/server-authorization";
import Link from "next/link";
import { notFound } from "next/navigation";

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

const activityLabels = {
  CHAMADO_CRIADO: "Chamado criado",
  CHAMADO_ATRIBUIDO: "Chamado assumido",
  CHAMADO_REATRIBUIDO: "Chamado reatribuido",
  STATUS_ALTERADO: "Status alterado",
  STATUS_ALTERADO_AUTOMATICAMENTE: "Status alterado automaticamente",
  PRIORIDADE_ALTERADA: "Prioridade alterada",
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function assignmentDescription(activity: {
  type: string;
  metadata: unknown;
}) {
  if (
    activity.type !== "CHAMADO_ATRIBUIDO" &&
    activity.type !== "CHAMADO_REATRIBUIDO"
  ) {
    return null;
  }
  if (
    typeof activity.metadata !== "object" ||
    activity.metadata === null ||
    Array.isArray(activity.metadata)
  ) {
    return null;
  }

  const metadata = activity.metadata as Record<string, unknown>;
  const previousName =
    typeof metadata.previousAgentName === "string"
      ? metadata.previousAgentName
      : null;
  const newName =
    typeof metadata.newAgentName === "string"
      ? metadata.newAgentName
      : null;

  if (!newName) return null;
  return previousName ? `${previousName} -> ${newName}` : `Responsavel: ${newName}`;
}

export default async function TicketDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireActiveSession();
  const { id } = await params;
  const ticket = await prisma.ticket.findFirst({
    where: {
      id,
      ...(session.user.role === "SOLICITANTE"
        ? { requesterId: session.user.id }
        : session.user.role === "AGENTE"
          ? { agentId: session.user.id }
          : {}),
    },
    include: {
      category: { select: { name: true } },
      requester: { select: { name: true, email: true } },
      agent: { select: { name: true, email: true } },
      activities: {
        orderBy: { createdAt: "asc" },
        include: { actor: { select: { name: true } } },
      },
      comments: {
        where:
          session.user.role === "SOLICITANTE"
            ? { type: "PUBLICO" }
            : undefined,
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, role: true } },
        },
      },
    },
  });

  if (!ticket) notFound();

  const backHref =
    session.user.role === "AGENTE"
      ? "/meus-atendimentos"
      : session.user.role === "ADMIN"
        ? "/admin/chamados"
        : "/chamados";

  return (
    <div className="space-y-8">
      <Link href={backHref} className="inline-flex text-sm font-bold text-blue-700 hover:text-blue-900">
        Voltar para a listagem
      </Link>

      <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-300">
          Chamado #{ticket.number}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{ticket.title}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
            {statusLabels[ticket.status]}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
            Prioridade {priorityLabels[ticket.priority]}
          </span>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold">
            {ticket.category.name}
          </span>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)]">
        <main className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">Descricao</h2>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
              {ticket.description}
            </p>
          </section>

          <section
            aria-labelledby="conversation-title"
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div>
              <h2 id="conversation-title" className="text-xl font-bold text-slate-950">
                Conversa
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                Mensagens e atualizacoes sobre este atendimento.
              </p>
            </div>
            {ticket.comments.length ? (
              <div className="mt-6 space-y-4">
                {ticket.comments.map((comment) => (
                  <article
                    key={comment.id}
                    className={`rounded-2xl border p-5 ${
                      comment.type === "INTERNO"
                        ? "border-amber-200 bg-amber-50"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-slate-950">
                          {comment.author.name}
                        </p>
                        <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                          {comment.type === "INTERNO"
                            ? "Nota interna"
                            : comment.author.role === "SOLICITANTE"
                              ? "Solicitante"
                              : "Equipe de suporte"}
                        </p>
                      </div>
                      <time
                        dateTime={comment.createdAt.toISOString()}
                        className="text-xs text-slate-500"
                      >
                        {formatDate(comment.createdAt)}
                      </time>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {comment.content}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-6 rounded-2xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                Nenhuma mensagem enviada ainda.
              </p>
            )}
            <CommentForm
              ticketId={ticket.id}
              canCreateInternal={session.user.role !== "SOLICITANTE"}
            />
          </section>

          <section aria-labelledby="history-title">
            <h2 id="history-title" className="text-xl font-bold text-slate-950">
              Historico
            </h2>
            <div className="mt-5 space-y-4">
              {ticket.activities.map((activity) => (
                <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-950">{activityLabels[activity.type]}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {activity.actor?.name ?? "Sistema"}
                      </p>
                    </div>
                    <time dateTime={activity.createdAt.toISOString()} className="text-xs text-slate-500">
                      {formatDate(activity.createdAt)}
                    </time>
                  </div>
                  {assignmentDescription(activity) ? (
                    <p className="mt-3 text-sm text-slate-600">
                      {assignmentDescription(activity)}
                    </p>
                  ) : activity.previousValue && activity.newValue ? (
                    <p className="mt-3 text-sm text-slate-600">
                      {statusLabels[activity.previousValue as keyof typeof statusLabels] ??
                        priorityLabels[activity.previousValue as keyof typeof priorityLabels] ??
                        activity.previousValue}
                      {" -> "}
                      {statusLabels[activity.newValue as keyof typeof statusLabels] ??
                        priorityLabels[activity.newValue as keyof typeof priorityLabels] ??
                        activity.newValue}
                    </p>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Pessoas</h2>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-slate-500">Solicitante</dt>
                <dd className="mt-1 font-semibold text-slate-900">{ticket.requester.name}</dd>
                <dd className="text-slate-500">{ticket.requester.email}</dd>
              </div>
              <div>
                <dt className="text-slate-500">Agente responsavel</dt>
                <dd className="mt-1 font-semibold text-slate-900">
                  {ticket.agent?.name ?? "Aguardando atribuicao"}
                </dd>
                {ticket.agent ? <dd className="text-slate-500">{ticket.agent.email}</dd> : null}
              </div>
            </dl>
          </section>
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-bold text-slate-950">Datas</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-slate-500">Criado</dt><dd className="font-semibold text-slate-900">{formatDate(ticket.createdAt)}</dd></div>
              {ticket.assignedAt ? <div><dt className="text-slate-500">Assumido</dt><dd className="font-semibold text-slate-900">{formatDate(ticket.assignedAt)}</dd></div> : null}
              {ticket.resolvedAt ? <div><dt className="text-slate-500">Resolvido</dt><dd className="font-semibold text-slate-900">{formatDate(ticket.resolvedAt)}</dd></div> : null}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
