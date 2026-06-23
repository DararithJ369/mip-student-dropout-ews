import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { CambodiaMap } from "@/components/CambodiaMap";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { getAnalyticsData } from "@/lib/api";
import { Loader2, AlertCircle } from "lucide-react";
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await getAnalyticsData();
        setData(res);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch analytics statistics. Ensure backend is running.");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Generating live analytics...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !data) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p className="font-semibold">{error || "Analytics data not found."}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.analytics.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.analytics.subtitle}</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4 mb-6">
        {[
          { label: "Active Student Profiles", value: data.kpis.total },
          { label: "High Risk Students", value: data.kpis.high, color: "text-rose-500" },
          { label: "Medium Risk Students", value: data.kpis.medium, color: "text-amber-500" },
          { label: "Safe / Low Risk", value: data.kpis.low, color: "text-emerald-500" },
          { label: "Overall Attendance Rate", value: `${data.kpis.attendance}%` },
          { label: "Average Class Score", value: `${data.kpis.avgScore}/100` },
        ].map((kpi, idx) => (
          <div key={idx} className="rounded-xl border border-border bg-card p-4 shadow-card">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{kpi.label}</div>
            <div className={`text-2xl font-bold font-display ${kpi.color || ""}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h3 className="mb-2 font-display text-lg font-semibold">Risk Trajectory ( Cambodian System )</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
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
              <BarChart data={data.attendanceByGrade}>
                <defs>
                  <linearGradient id="attendanceBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.18 265)" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="oklch(0.55 0.18 265)" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="grade" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="rate" fill="url(#attendanceBarGrad)" stroke="oklch(0.55 0.18 265)" strokeWidth={1.5} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <CambodiaMap provinceData={data.provinceData || {}} />
      </div>
    </AppLayout>
  );
}