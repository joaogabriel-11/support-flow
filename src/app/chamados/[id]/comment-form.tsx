"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  addCommentAction,
  type AddCommentState,
} from "@/app/chamados/[id]/actions";

const initialState: AddCommentState = {};

export function CommentForm({
  ticketId,
  canCreateInternal,
}: {
  ticketId: string;
  canCreateInternal: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    addCommentAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success, state.commentId]);

  return (
    <form ref={formRef} action={formAction} className="mt-5 space-y-4">
      <input type="hidden" name="ticketId" value={ticketId} />
      {canCreateInternal ? (
        <div>
          <label htmlFor="comment-type" className="block text-sm font-semibold text-slate-800">
            Visibilidade
          </label>
          <select
            id="comment-type"
            name="type"
            defaultValue="PUBLICO"
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="PUBLICO">Mensagem publica</option>
            <option value="INTERNO">Nota interna</option>
          </select>
        </div>
      ) : (
        <input type="hidden" name="type" value="PUBLICO" />
      )}
      <div>
        <label htmlFor="comment-content" className="block text-sm font-semibold text-slate-800">
          Mensagem
        </label>
        <textarea
          id="comment-content"
          name="content"
          minLength={2}
          maxLength={2000}
          rows={4}
          required
          placeholder="Escreva uma atualizacao sobre o chamado."
          aria-describedby={state.contentError ? "comment-error" : undefined}
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.contentError ? (
          <p id="comment-error" className="mt-1 text-sm text-red-700">{state.contentError}</p>
        ) : null}
      </div>
      {state.message ? (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm font-medium ${state.success ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"}`}>
          {state.message}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Enviar mensagem"}
      </button>
    </form>
  );
}
