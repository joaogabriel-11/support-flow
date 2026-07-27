"use client";

import { useActionState } from "react";

import {
  completeTicketAction,
  type CompleteTicketState,
} from "@/app/meus-atendimentos/actions";

const initialState: CompleteTicketState = {};

export function CompleteTicketForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(
    completeTicketAction,
    initialState,
  );

  return (
    <form
      action={formAction}
      className="mt-5 border-t border-slate-100 pt-5"
    >
      <input type="hidden" name="ticketId" value={ticketId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Concluindo..." : "Marcar como concluido"}
      </button>
      {state.message ? (
        <p
          role="status"
          className={`mt-2 text-sm font-medium ${
            state.success ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
