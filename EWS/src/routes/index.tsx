import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users, AlertTriangle, AlertCircle, ShieldCheck, CalendarCheck, GraduationCap,
  ArrowUpRight, TrendingUp,
} from "lucide-react";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { KpiCard } from "@/components/KpiCard";
import { useI18n } from "@/lib/i18n";
import { kpis, trendData, distribution, attendanceByGrade, alerts, students } from "@/lib/mock";

export const Route = createFileRoute("/")({ component: Dashboard });

const riskColors: Record<string, string> = {
  low: "oklch(0.65 0.17 155)",
  medium: "oklch(0.78 0.16 75)",
  high: "oklch(0.62 0.22 25)",
};

function Dashboard() {
  const { t } = useI18n();
  const atRisk = [...students].sort((a, b) => (a.risk === "high" ? -1 : 1)).slice(0, 5);

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
              Live · AI monitoring active
            </div>
            <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{t.dashboard.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t.dashboard.subtitle}</p>
          </div>
          <Link to="/predict" className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]">
            {t.nav.predict} <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <KpiCard label={t.kpi.total} value={kpis.total.toLocaleString()} icon={Users} tone="primary" trend="+3.2%" />
        <KpiCard label={t.kpi.high} value={kpis.high} icon={AlertTriangle} tone="danger" trend="-4.1%" />
        <KpiCard label={t.kpi.medium} value={kpis.medium} icon={AlertCircle} tone="warning" trend="+1.6%" />
        <KpiCard label={t.kpi.low} value={kpis.low.toLocaleString()} icon={ShieldCheck} tone="success" trend="+2.4%" />
        <KpiCard label={t.kpi.attendance} value={kpis.attendance} suffix="%" icon={CalendarCheck} tone="accent" trend="+0.8%" />
        <KpiCard label={t.kpi.avgScore} value={kpis.avgScore} icon={GraduationCap} tone="primary" trend="+1.1%" />
      </div>

      {/* Charts row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold">{t.dashboard.trends}</h3>
              <p className="text-xs text-muted-foreground">7-month risk evolution across the school</p>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
              <TrendingUp className="h-3 w-3" /> Improving
            </span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="hi" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={riskColors.high} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={riskColors.high} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="me" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={riskColors.medium} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={riskColors.medium} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="medium" stroke={riskColors.medium} strokeWidth={2} fill="url(#me)" />
                <Area type="monotone" dataKey="high" stroke={riskColors.high} strokeWidth={2} fill="url(#hi)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold">{t.dashboard.distribution}</h3>
          <p className="text-xs text-muted-foreground">Current AI risk segmentation</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3} strokeWidth={0}>
                  {distribution.map((d) => (
                    <Cell key={d.name} fill={riskColors[d.name]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-2">
            {distribution.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: riskColors[d.name] }} />
                  <span className="capitalize">{t.risk[d.name as "low" | "medium" | "high"]}</span>
                </div>
                <span className="font-semibold">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="font-display text-lg font-semibold">{t.dashboard.attendanceTrend}</h3>
          <div className="mt-3 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByGrade}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="rate" fill="oklch(0.55 0.18 265)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{t.dashboard.recentAlerts}</h3>
            <Link to="/alerts" className="text-xs font-semibold text-primary hover:underline">{t.dashboard.viewAll}</Link>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 4).map((a) => (
              <div key={a.id} className="flex items-start gap-3 rounded-xl border border-border bg-background/40 p-3">
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                  a.severity === "high" ? "bg-danger" : a.severity === "medium" ? "bg-warning" : "bg-success"
                }`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold">{a.student}</p>
                    <span className="text-[10px] text-muted-foreground">{a.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{a.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold">{t.dashboard.atRisk}</h3>
            <Link to="/students" className="text-xs font-semibold text-primary hover:underline">{t.dashboard.viewAll}</Link>
          </div>
          <div className="space-y-2">
            {atRisk.map((s) => (
              <div key={s.id} className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                  {s.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.name}</div>
                  <div className="text-xs text-muted-foreground">G{s.grade} · {s.attendance}% att · {s.score} pts</div>
                </div>
                <span
                  className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                  style={{ background: riskColors[s.risk] }}
                >
                  {s.risk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
