"use client";

import { useActionState } from "react";

import {
  assignTicketAction,
  type AssignTicketState,
} from "@/app/fila/actions";

const initialState: AssignTicketState = {};

export function AssignTicketButton({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(
    assignTicketAction,
    initialState,
  );

  return (
    <form action={formAction} className="mt-5">
      <input type="hidden" name="ticketId" value={ticketId} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Assumindo..." : "Assumir chamado"}
      </button>
      {state.error ? (
        <p role="alert" className="mt-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
