"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createTicketAction,
  type CreateTicketState,
} from "./actions";

type Category = {
  id: string;
  name: string;
};

const initialState: CreateTicketState = {};

export function TicketForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState(
    createTicketAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success, state.ticketNumber]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-5">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-semibold text-slate-800"
        >
          Titulo
        </label>
        <input
          id="title"
          name="title"
          minLength={5}
          maxLength={120}
          required
          placeholder="Ex.: Notebook nao conecta ao Wi-Fi"
          aria-describedby={state.errors?.title ? "title-error" : undefined}
          className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.errors?.title ? (
          <p id="title-error" className="mt-1.5 text-sm text-red-700">
            {state.errors.title}
          </p>
        ) : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="categoryId"
            className="block text-sm font-semibold text-slate-800"
          >
            Categoria
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue=""
            aria-describedby={
              state.errors?.categoryId ? "category-error" : undefined
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="" disabled>
              Selecione
            </option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {state.errors?.categoryId ? (
            <p id="category-error" className="mt-1.5 text-sm text-red-700">
              {state.errors.categoryId}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-semibold text-slate-800"
          >
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            required
            defaultValue="MEDIA"
            aria-describedby={
              state.errors?.priority ? "priority-error" : undefined
            }
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="BAIXA">Baixa</option>
            <option value="MEDIA">Media</option>
            <option value="ALTA">Alta</option>
            <option value="CRITICA">Critica</option>
          </select>
          {state.errors?.priority ? (
            <p id="priority-error" className="mt-1.5 text-sm text-red-700">
              {state.errors.priority}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-semibold text-slate-800"
        >
          Descricao
        </label>
        <textarea
          id="description"
          name="description"
          minLength={10}
          maxLength={5000}
          rows={6}
          required
          placeholder="Descreva o problema, quando comecou e o que voce ja tentou."
          aria-describedby={
            state.errors?.description ? "description-error" : undefined
          }
          className="mt-2 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.errors?.description ? (
          <p id="description-error" className="mt-1.5 text-sm text-red-700">
            {state.errors.description}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-medium ${
            state.success
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-800"
          }`}
        >
          {state.message}
          {state.ticketNumber ? ` Numero #${state.ticketNumber}.` : ""}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || categories.length === 0}
        className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Abrindo chamado..." : "Abrir chamado"}
      </button>
    </form>
  );
}
