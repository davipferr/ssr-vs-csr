import type { ReactNode } from "react";

export type Mode = "ssr" | "csr" | "hybrid";

export const modeStyles: Record<Mode, { label: string; badge: string; border: string }> = {
  ssr: {
    label: "Server-Side Rendering",
    badge: "bg-emerald-600 text-white",
    border: "border-emerald-500/40 bg-emerald-500/[0.06]",
  },
  csr: {
    label: "Client-Side Rendering",
    badge: "bg-amber-500 text-black",
    border: "border-amber-500/40 bg-amber-500/[0.06]",
  },
  hybrid: {
    label: "Hybrid: server data + client island",
    badge: "bg-violet-600 text-white",
    border: "border-violet-500/40 bg-violet-500/[0.06]",
  },
};

export function PageHeader({ mode, title, children }: { mode: Mode; title: string; children?: ReactNode }) {
  const s = modeStyles[mode];
  return (
    <header className="space-y-2">
      <span className={`inline-block rounded px-2 py-0.5 text-xs font-bold uppercase tracking-wide ${s.badge}`}>
        {mode} · {s.label}
      </span>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {children && <div className="max-w-3xl text-sm text-black/70 dark:text-white/70">{children}</div>}
    </header>
  );
}

/** "What happens when this page loads" — a numbered timeline. */
export function LoadSteps({ mode, steps }: { mode: Mode; steps: ReactNode[] }) {
  return (
    <details className={`rounded-lg border p-3 text-sm ${modeStyles[mode].border}`}>
      <summary className="cursor-pointer font-medium">What happens when this page loads?</summary>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-black/75 dark:text-white/75">
        {steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </details>
  );
}

export type InfoItem = { label: string; value: ReactNode; hint?: string };

/** Facts about how THIS render happened. */
export function RenderInfo({ mode, title, items }: { mode: Mode; title: string; items: InfoItem[] }) {
  return (
    <aside className={`rounded-lg border p-3 ${modeStyles[mode].border}`}>
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">{title}</h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} title={item.hint}>
            <dt className="text-xs text-black/55 dark:text-white/55">{item.label}</dt>
            <dd className="font-mono text-sm tabular-nums">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function Card({ title, children, note }: { title: string; children: ReactNode; note?: string }) {
  return (
    <section className="rounded-lg border border-black/10 p-4 dark:border-white/10">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-medium">{title}</h2>
        {note && <span className="text-xs text-black/45 dark:text-white/45">{note}</span>}
      </div>
      {children}
    </section>
  );
}

export function CardSkeleton({ lines = 6 }: { lines?: number }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div key={i} className="h-4 rounded bg-black/10 dark:bg-white/10" style={{ width: `${90 - i * 8}%` }} />
      ))}
    </div>
  );
}
