import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Filter, Download, Plus } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { students } from "@/lib/mock";

export const Route = createFileRoute("/students")({ component: StudentsPage });

const riskColors: Record<string, string> = {
  low: "oklch(0.65 0.17 155)",
  medium: "oklch(0.78 0.16 75)",
  high: "oklch(0.62 0.22 25)",
};

function StudentsPage() {
  const { t } = useI18n();
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const filtered = students.filter(s =>
    (risk === "all" || s.risk === risk) &&
    (q === "" || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t.students.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.students.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary">
            <Filter className="h-4 w-4" /> {t.students.filter}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary">
            <Download className="h-4 w-4" /> {t.students.export}
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow">
            <Plus className="h-4 w-4" /> {t.students.addStudent}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.students.search}
            className="h-10 min-w-[240px] flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-1 rounded-xl border border-border bg-background p-1">
            {["all", "high", "medium", "low"].map(r => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  risk === r ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "all" ? "All" : t.risk[r as "low" | "medium" | "high"]}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="py-3 pr-3">{t.students.name}</th>
                <th className="py-3 pr-3">ID</th>
                <th className="py-3 pr-3">{t.students.grade}</th>
                <th className="py-3 pr-3">{t.students.attendance}</th>
                <th className="py-3 pr-3">{t.students.score}</th>
                <th className="py-3 pr-3">{t.students.risk}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="cursor-pointer border-b border-border/60 hover:bg-background/40"
                  onClick={() => { window.location.href = `/students/${s.id}`; }}
                >
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                        {s.avatar}
                      </div>
                      <div>
                        <Link to="/students/$id" params={{ id: s.id }} className="font-semibold hover:text-primary" onClick={(e) => e.stopPropagation()}>
                          {s.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">{s.gender === "M" ? "Male" : "Female"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-3 text-muted-foreground">{s.id}</td>
                  <td className="py-3 pr-3">G{s.grade}</td>
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                        <div className="h-full bg-gradient-primary" style={{ width: `${s.attendance}%` }} />
                      </div>
                      <span className="text-xs">{s.attendance}%</span>
                    </div>
                  </td>
                  <td className="py-3 pr-3 font-medium">{s.score}</td>
                  <td className="py-3 pr-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: riskColors[s.risk] }}
                    >
                      {t.risk[s.risk]}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}