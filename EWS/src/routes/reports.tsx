import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { FileText, Download } from "lucide-react";

export const Route = createFileRoute("/reports")({ component: ReportsPage });

const reports = [
  { name: "Student Risk Report", desc: "Detailed AI risk breakdown by student", format: "PDF" },
  { name: "Attendance Report", desc: "Daily, weekly and monthly attendance", format: "Excel" },
  { name: "School Analytics Report", desc: "Performance and risk trends school-wide", format: "PDF" },
  { name: "Teacher Activity Report", desc: "Teacher interactions and interventions", format: "Excel" },
  { name: "Intervention Report", desc: "Status and outcomes of all interventions", format: "CSV" },
];

function ReportsPage() {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Reports</h1>
        <p className="mt-1 text-sm text-muted-foreground">Generate professional PDF, Excel and CSV reports.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.name} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-muted-foreground">{r.desc}</div>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{r.format}</span>
            <button className="grid h-9 w-9 place-items-center rounded-lg border border-border hover:border-primary">
              <Download className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </AppLayout>
  );
}