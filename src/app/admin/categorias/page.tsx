import { CategoryCard } from "@/app/admin/categorias/category-card";
import { CreateCategoryForm } from "@/app/admin/categorias/create-category-form";
import { prisma } from "@/lib/prisma";
import { requirePathAccess } from "@/lib/server-authorization";

export default async function CategoriesPage() {
  await requirePathAccess("/admin/categorias");
  const categories = await prisma.category.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      isActive: true,
      _count: { select: { tickets: true } },
    },
  });
  const activeCount = categories.filter((category) => category.isActive).length;

  return (
    <div className="space-y-10">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Administracao
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Gestao de categorias
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Organize as opcoes usadas pelos solicitantes na abertura de chamados.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-slate-900 px-5 py-4 text-white">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Ativas
            </p>
            <p className="mt-1 text-2xl font-bold">{activeCount}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="mt-1 text-2xl font-bold text-slate-950">
              {categories.length}
            </p>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(280px,0.65fr)_minmax(0,1.35fr)]">
        <section className="self-start rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-xl font-bold text-slate-950">Nova categoria</h2>
          <p className="mt-1 text-sm text-slate-600">
            Categorias novas ficam disponiveis imediatamente.
          </p>
          <CreateCategoryForm />
        </section>

        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="text-xl font-bold text-slate-950">
            Categorias cadastradas
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Categorias com chamados podem ser desativadas, mas nao excluidas.
          </p>
          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={{
                  id: category.id,
                  name: category.name,
                  isActive: category.isActive,
                  ticketCount: category._count.tickets,
                }}
                isLastActive={category.isActive && activeCount === 1}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
