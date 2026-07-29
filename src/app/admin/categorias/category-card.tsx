"use client";

import { useActionState } from "react";

import {
  changeCategoryStatusAction,
  deleteCategoryAction,
  updateCategoryAction,
  type CategoryActionState,
} from "@/app/admin/categorias/actions";

const initialState: CategoryActionState = {};

export function CategoryCard({
  category,
  isLastActive,
}: {
  category: {
    id: string;
    name: string;
    isActive: boolean;
    ticketCount: number;
  };
  isLastActive: boolean;
}) {
  const [updateState, updateAction, updating] = useActionState(
    updateCategoryAction,
    initialState,
  );
  const [statusState, statusAction, changingStatus] = useActionState(
    changeCategoryStatusAction,
    initialState,
  );
  const [deleteState, deleteAction, deleting] = useActionState(
    deleteCategoryAction,
    initialState,
  );
  const feedback = updateState.message
    ? updateState
    : statusState.message
      ? statusState
      : deleteState;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-950">{category.name}</h3>
          <span
            className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
              category.isActive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {category.isActive ? "Ativa" : "Inativa"}
          </span>
          <p className="mt-2 text-sm text-slate-500">
            {category.ticketCount} chamado(s) vinculado(s)
          </p>
        </div>
        <form action={statusAction}>
          <input type="hidden" name="categoryId" value={category.id} />
          <input
            type="hidden"
            name="isActive"
            value={String(!category.isActive)}
          />
          <button
            type="submit"
            disabled={changingStatus || isLastActive}
            title={
              isLastActive
                ? "A ultima categoria ativa nao pode ser desativada."
                : undefined
            }
            className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
              category.isActive
                ? "border border-amber-300 text-amber-800 hover:bg-amber-50"
                : "bg-emerald-700 text-white hover:bg-emerald-600"
            }`}
          >
            {changingStatus
              ? "Salvando..."
              : category.isActive
                ? "Desativar"
                : "Ativar"}
          </button>
        </form>
      </div>

      <form action={updateAction} className="mt-5">
        <input type="hidden" name="categoryId" value={category.id} />
        <label
          htmlFor={`category-name-${category.id}`}
          className="block text-xs font-bold uppercase tracking-wider text-slate-500"
        >
          Nome
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id={`category-name-${category.id}`}
            name="name"
            defaultValue={category.name}
            minLength={2}
            maxLength={60}
            required
            className="min-w-0 flex-1 rounded-xl border border-slate-300 px-4 py-2.5 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
          <button
            type="submit"
            disabled={updating}
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:bg-slate-700 disabled:opacity-50"
          >
            {updating ? "Salvando..." : "Salvar nome"}
          </button>
        </div>
        {updateState.nameError ? (
          <p className="mt-1 text-sm text-red-700">{updateState.nameError}</p>
        ) : null}
      </form>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !window.confirm(
                `Excluir permanentemente a categoria "${category.name}"?`,
              )
            ) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="categoryId" value={category.id} />
          <button
            type="submit"
            disabled={deleting || category.ticketCount > 0 || isLastActive}
            title={
              category.ticketCount > 0
                ? "Categorias com chamados so podem ser desativadas."
                : isLastActive
                  ? "A ultima categoria ativa nao pode ser excluida."
                  : undefined
            }
            className="text-xs font-bold text-red-700 hover:text-red-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? "Excluindo..." : "Excluir permanentemente"}
          </button>
        </form>
      </div>

      {feedback.message ? (
        <p
          role={feedback.success ? "status" : "alert"}
          className={`mt-3 text-sm font-medium ${
            feedback.success ? "text-emerald-700" : "text-red-700"
          }`}
        >
          {feedback.message}
        </p>
      ) : null}
    </article>
  );
}
