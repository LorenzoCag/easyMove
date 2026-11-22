import type { ReactNode } from "react";

export function SectionCard({
  step,
  title,
  subtitle,
  children,
  id,
}: {
  step: number;
  title: string;
  subtitle?: string | undefined;
  children: ReactNode;
  id?: string | undefined;
}) {
  return (
    <section id={id} className="scroll-mt-6 rounded-2xl border bg-card p-6 shadow-card sm:p-8">
      <header className="mb-6 flex items-start gap-4">
        <span className="font-display flex size-10 shrink-0 items-center justify-center rounded-full bg-cta text-lg font-bold text-cta-foreground">
          {step}
        </span>
        <div>
          <h2 className="text-xl font-bold text-navy sm:text-2xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
      </header>
      {children}
    </section>
  );
}

export function FieldError({ message }: { message?: string | undefined }) {
  if (!message) return null;
  return <p className="mt-1.5 text-sm font-medium text-destructive">{message}</p>;
}
