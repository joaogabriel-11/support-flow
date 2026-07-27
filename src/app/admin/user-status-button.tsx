"use client";

import { useActionState } from "react";

import {
  setUserActiveAction,
  type SetUserActiveState,
} from "@/app/admin/actions";

const initialState: SetUserActiveState = {};

export function UserStatusButton({
  userId,
  isActive,
  isCurrentUser,
}: {
  userId: string;
  isActive: boolean;
  isCurrentUser: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    setUserActiveAction,
    initialState,
  );

  return (
    <form action={formAction}>
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="isActive" value={String(!isActive)} />
      <button
        type="submit"
        disabled={pending || (isCurrentUser && isActive)}
        title={isCurrentUser && isActive ? "Voce nao pode desativar sua propria conta." : undefined}
        className={`rounded-lg px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          isActive
            ? "border border-red-200 text-red-700 hover:bg-red-50"
            : "bg-emerald-700 text-white hover:bg-emerald-600"
        }`}
      >
        {pending ? "Salvando..." : isActive ? "Desativar" : "Ativar"}
      </button>
      {state.message && !state.success ? (
        <p role="alert" className="mt-2 text-xs text-red-700">{state.message}</p>
      ) : null}
    </form>
  );
}
