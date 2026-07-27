"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createUserAction,
  type CreateUserState,
} from "@/app/admin/actions";

const initialState: CreateUserState = {};

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState(
    createUserAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success, state.createdUserId]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-semibold text-slate-800">
          Nome
        </label>
        <input
          id="name"
          name="name"
          minLength={2}
          maxLength={100}
          required
          autoComplete="name"
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.errors?.name ? <p id="name-error" className="mt-1 text-sm text-red-700">{state.errors.name}</p> : null}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-800">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-describedby={state.errors?.email ? "email-error" : undefined}
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.errors?.email ? <p id="email-error" className="mt-1 text-sm text-red-700">{state.errors.email}</p> : null}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="role" className="block text-sm font-semibold text-slate-800">
            Perfil
          </label>
          <select
            id="role"
            name="role"
            defaultValue="SOLICITANTE"
            required
            className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          >
            <option value="SOLICITANTE">Solicitante</option>
            <option value="AGENTE">Agente</option>
            <option value="ADMIN">Administrador</option>
          </select>
          {state.errors?.role ? <p className="mt-1 text-sm text-red-700">{state.errors.role}</p> : null}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold text-slate-800">
            Senha inicial
          </label>
          <input
            id="password"
            name="password"
            type="password"
            minLength={8}
            maxLength={72}
            required
            autoComplete="new-password"
            aria-describedby={state.errors?.password ? "password-error" : undefined}
            className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
          {state.errors?.password ? <p id="password-error" className="mt-1 text-sm text-red-700">{state.errors.password}</p> : null}
        </div>
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
        {pending ? "Criando..." : "Criar usuario"}
      </button>
    </form>
  );
}
