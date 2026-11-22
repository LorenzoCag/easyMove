import { Clock, Info, Ruler, Truck, Users, Weight } from "lucide-react";
import type { Estimate } from "@/lib/estimate";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export function EstimateResult({
  estimate,
  from,
  to,
  approximateDistance,
}: {
  estimate: Estimate;
  from: string;
  to: string;
  approximateDistance: boolean;
}) {
  const stats = [
    { icon: Ruler, label: "Distance", value: `${approximateDistance ? "~" : ""}${estimate.miles.toLocaleString("en-US")} mi` },
    { icon: Weight, label: "Est. weight", value: `${estimate.weightLbs.toLocaleString("en-US")} lbs` },
    { icon: Users, label: "Crew", value: `${estimate.crew} movers` },
    { icon: Truck, label: "Truck", value: estimate.truck },
    ...(estimate.hours ? [{ icon: Clock, label: "Est. time", value: `${estimate.hours} hrs` }] : []),
  ];

  return (
    <section
      id="estimate"
      aria-live="polite"
      className="animate-rise scroll-mt-6 overflow-hidden rounded-2xl border bg-card shadow-card"
    >
      <div className="bg-hero relative px-6 py-8 text-navy-foreground sm:px-8">
        <div className="pattern-dots absolute inset-0 opacity-40" />
        <div className="relative">
          <p className="text-sm font-semibold uppercase tracking-widest text-cta">
            Your {estimate.moveType === "local" ? "local" : "long-distance"} move estimate
          </p>
          <p className="mt-1 text-sm opacity-80">
            {from} → {to}
          </p>
          <p className="font-display mt-4 text-4xl font-extrabold sm:text-5xl">
            {usd(estimate.low)} – {usd(estimate.high)}
          </p>
          <p className="mt-2 text-sm opacity-80">
            Most likely around <strong className="text-navy-foreground">{usd(estimate.mid)}</strong> ·
            range ±{estimate.spreadPct}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-border sm:flex">
        {stats.map((s) => (
          <div key={s.label} className="bg-card p-4 sm:flex-1">
            <s.icon className="mb-1 size-4 text-cta" />
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="font-semibold text-navy">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        <h3 className="mb-3 font-bold text-navy">Price breakdown</h3>
        <ul className="divide-y">
          {estimate.lines.map((l) => (
            <li key={l.label} className="flex justify-between gap-4 py-2.5 text-sm">
              <span className="text-foreground">{l.label}</span>
              <span className="font-semibold tabular-nums text-navy">{usd(l.amount)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4 pt-3 font-bold">
            <span className="text-navy">Estimated total</span>
            <span className="tabular-nums text-navy">{usd(estimate.mid)}</span>
          </li>
        </ul>

        {estimate.spreadPct > 10 && (
          <p className="mt-5 flex gap-2 rounded-lg bg-cta-soft p-3 text-sm text-accent-foreground">
            <Info className="mt-0.5 size-4 shrink-0" />
            Add walkthrough videos for more rooms to narrow your range down to ±10%.
          </p>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          This is an estimate, not a binding quote. Final pricing depends on the actual items moved
          and conditions on moving day.
        </p>
      </div>
    </section>
  );
}
