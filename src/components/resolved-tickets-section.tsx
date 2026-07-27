import type { ReactNode } from "react";

type ResolvedTicketsSectionProps = {
  count: number;
  description: string;
  children: ReactNode;
  titleClassName?: string;
};

export function ResolvedTicketsSection({
  count,
  description,
  children,
  titleClassName = "text-xl",
}: ResolvedTicketsSectionProps) {
  return (
    <section aria-label="Resolvidos">
      <details className="group">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-xl outline-none focus-visible:ring-4 focus-visible:ring-blue-100">
          <div>
            <h2 className={`${titleClassName} font-bold text-slate-950`}>
              Resolvidos
            </h2>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
          <span className="shrink-0 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition group-open:border-slate-400 group-open:bg-slate-50">
            <span className="group-open:hidden">
              Mostrar resolvidos ({count})
            </span>
            <span className="hidden group-open:inline">Esconder resolvidos</span>
          </span>
        </summary>
        <div className="mt-5">{children}</div>
      </details>
    </section>
  );
}
