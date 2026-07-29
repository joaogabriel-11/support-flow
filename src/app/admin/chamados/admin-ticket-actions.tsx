"use client";

import { useActionState } from "react";

import {
  assignTicketByAdminAction,
  completeTicketByAdminAction,
  type AdminTicketActionState,
} from "@/app/admin/chamados/actions";

const initialState: AdminTicketActionState = {};

export function AdminTicketActions({
  ticket,
  adminId,
  activeAgents,
}: {
  ticket: {
    id: string;
    status: "ABERTO" | "EM_ANDAMENTO" | "AGUARDANDO_SOLICITANTE" | "RESOLVIDO" | "FECHADO";
    agentId: string | null;
  };
  adminId: string;
  activeAgents: Array<{ id: string; name: string }>;
}) {
  const [assignmentState, assignmentAction, assigning] = useActionState(
    assignTicketByAdminAction,
    initialState,
  );
  const [completionState, completionAction, completing] = useActionState(
    completeTicketByAdminAction,
    initialState,
  );
  const isFinal = ticket.status === "RESOLVIDO" || ticket.status === "FECHADO";
  const isAdminResponsible = ticket.agentId === adminId;

  if (isFinal) return null;

  return (
    <div className="mt-5 space-y-4 border-t border-slate-100 pt-5">
      {!ticket.agentId ? (
        <form action={assignmentAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <input type="hidden" name="targetAgentId" value={adminId} />
          <button
            type="submit"
            disabled={assigning}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {assigning ? "Atribuindo..." : "Assumir chamado"}
          </button>
        </form>
      ) : null}

      <form action={assignmentAction}>
        <input type="hidden" name="ticketId" value={ticket.id} />
        <label
          htmlFor={`target-agent-${ticket.id}`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          {ticket.agentId ? "Reatribuir para" : "Atribuir para"}
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select
            id={`target-agent-${ticket.id}`}
            name="targetAgentId"
            defaultValue=""
            required
            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="" disabled>
              Selecione um agente ativo
            </option>
            {activeAgents
              .filter((agent) => agent.id !== ticket.agentId)
              .map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={assigning || activeAgents.length === 0}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {assigning
              ? "Salvando..."
              : ticket.agentId
                ? "Reatribuir"
                : "Atribuir"}
          </button>
        </div>
      </form>

      {isAdminResponsible && ticket.status === "EM_ANDAMENTO" ? (
        <form action={completionAction}>
          <input type="hidden" name="ticketId" value={ticket.id} />
          <button
            type="submit"
            disabled={completing}
            className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {completing ? "Concluindo..." : "Marcar como concluido"}
          </button>
        </form>
      ) : null}

      {assignmentState.message ? (
        <p
          role={assignmentState.success ? "status" : "alert"}
          className={`text-sm font-medium ${
            assignmentState.success ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {assignmentState.message}
        </p>
      ) : null}
      {completionState.message ? (
        <p
          role={completionState.success ? "status" : "alert"}
          className={`text-sm font-medium ${
            completionState.success ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {completionState.message}
        </p>
      ) : null}
    </div>
  );
}
