import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-5xl p-8">
      <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-sm text-slate-500">Bem-vindo ao Support Flow</p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {session.user.name}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {session.user.email} · {session.user.role}
          </p>
        </div>

        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </form>
      </div>
    </main>
  );
}
