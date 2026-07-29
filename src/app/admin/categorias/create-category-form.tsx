"use client";

import { useActionState, useEffect, useRef } from "react";

import {
  createCategoryAction,
  type CategoryActionState,
} from "@/app/admin/categorias/actions";

const initialState: CategoryActionState = {};

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(
    createCategoryAction,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success, state.categoryId]);

  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      <div>
        <label
          htmlFor="new-category-name"
          className="block text-sm font-semibold text-slate-800"
        >
          Nome da categoria
        </label>
        <input
          id="new-category-name"
          name="name"
          minLength={2}
          maxLength={60}
          required
          aria-describedby={state.nameError ? "new-category-error" : undefined}
          placeholder="Ex.: Telefonia"
          className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
        />
        {state.nameError ? (
          <p id="new-category-error" className="mt-1 text-sm text-red-700">
            {state.nameError}
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
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Criando..." : "Criar categoria"}
      </button>
    </form>
  );
}
