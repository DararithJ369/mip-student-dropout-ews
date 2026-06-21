import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { trendData, attendanceByGrade } from "@/lib/mock";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, Legend,
} from "recharts";

export const Route = createFileRoute("/analytics")({ component: AnalyticsPage });

const tooltipStyle = {
  background: "var(--color-card)",
  border: "1px solid var(--color-border)",
  borderRadius: 12,
  fontSize: 12,
};

const radarData = [
  { factor: "Attendance", value: 84 },
  { factor: "Academic", value: 76 },
  { factor: "Support", value: 62 },
  { factor: "Family", value: 70 },
  { factor: "Transport", value: 81 },
  { factor: "Wellness", value: 73 },
];

function AnalyticsPage() {
  const { t } = useI18n();
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.analytics.subtitle}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-2 font-display text-lg font-semibold">Risk Trajectory</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="high" stroke="oklch(0.62 0.22 25)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="medium" stroke="oklch(0.78 0.16 75)" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="low" stroke="oklch(0.65 0.17 155)" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-2 font-display text-lg font-semibold">Holistic Student Profile</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--color-border)" />
                <PolarAngleAxis dataKey="factor" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <PolarRadiusAxis tick={false} axisLine={false} />
                <Radar name="School avg" dataKey="value" stroke="oklch(0.55 0.18 265)" fill="oklch(0.55 0.18 265)" fillOpacity={0.35} />
                <Tooltip contentStyle={tooltipStyle} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-2 font-display text-lg font-semibold">Attendance by Grade</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceByGrade}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[70, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="rate" fill="oklch(0.7 0.15 195)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-3 font-display text-lg font-semibold">Risk Heatmap</h3>
          <div className="grid grid-cols-12 gap-1.5">
            {Array.from({ length: 84 }).map((_, i) => {
              const v = ((i * 53 + 17) % 100) / 100;
              const c = v > 0.85 ? "oklch(0.62 0.22 25)" : v > 0.65 ? "oklch(0.78 0.16 75)" : v > 0.4 ? "oklch(0.65 0.17 155 / 0.55)" : "oklch(0.65 0.17 155 / 0.25)";
              return <div key={i} className="aspect-square rounded-md" style={{ background: c }} />;
            })}
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.65 0.17 155)" }} />Safe</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.78 0.16 75)" }} />Warning</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm" style={{ background: "oklch(0.62 0.22 25)" }} />High Risk</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}