"use client";

import { useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { SampleChip } from "@/components/dashboard/section-cards";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatMoney } from "@/lib/format";
import type { SamplePoint } from "@/lib/sample-dashboard";

type Metric = "rsvps" | "spend";
const RANGES = [{ days: 7, label: "7 days" }, { days: 30, label: "30 days" }, { days: 90, label: "90 days" }] as const;
const METRICS: { key: Metric; label: string; color: string }[] = [
  { key: "rsvps", label: "Guests confirmed", color: "var(--chart-1)" },
  { key: "spend", label: "Budget spent", color: "var(--chart-2)" },
];
const dayFmt = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const fmtDay = (iso: string) => dayFmt.format(new Date(`${iso}T00:00:00`));

function Segmented<T extends string | number>({ label, value, options, onChange }: {
  label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-md bg-secondary p-0.5 text-sm font-medium">
      {options.map((o) => (
        <button
          key={o.value} type="button" role="radio" aria-checked={value === o.value} onClick={() => onChange(o.value)}
          className="rounded-sm px-3 py-1.5 text-muted-foreground transition-colors duration-100 aria-checked:bg-card aria-checked:text-foreground"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OverviewChart({ points }: { points: SamplePoint[] }) {
  const [metric, setMetric] = useState<Metric>("rsvps");
  const [range, setRange] = useState<number>(30);
  const m = METRICS.find((x) => x.key === metric)!;
  const data = points.slice(-range);
  const config = { [metric]: { label: m.label, color: m.color } } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid gap-1">
          <CardTitle className="flex items-center gap-2">Progress<SampleChip /></CardTitle>
          <CardDescription>Running total over the last {range} days</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2">
          <Segmented label="Metric" value={metric} onChange={setMetric} options={METRICS.map((x) => ({ value: x.key, label: x.label }))} />
          <Segmented label="Range" value={range} onChange={setRange} options={RANGES.map((r) => ({ value: r.days, label: r.label }))} />
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-64 w-full">
          <AreaChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <defs>
              <linearGradient id="fill-metric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={m.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={m.color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} tickFormatter={fmtDay} />
            <YAxis
              tickLine={false} axisLine={false} width={metric === "spend" ? 64 : 36}
              tickFormatter={(v: number) => (metric === "spend" ? `${Math.round(v / 1000)}k` : String(v))}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  labelFormatter={(_, p) => fmtDay(String(p?.[0]?.payload?.date ?? ""))}
                  formatter={(v) => (
                    <span className="font-medium tabular-nums">{metric === "spend" ? formatMoney(Number(v)) : `${v} guests`}</span>
                  )}
                />
              }
            />
            <Area dataKey={metric} type="monotone" stroke={m.color} strokeWidth={2} fill="url(#fill-metric)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
