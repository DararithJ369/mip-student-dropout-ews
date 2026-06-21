import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, AlertCircle, Info, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { alerts } from "@/lib/mock";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

const sevMeta: Record<string, { bg: string; icon: LucideIcon; label: string }> = {
  high: { bg: "bg-gradient-danger", icon: AlertTriangle, label: "Critical" },
  medium: { bg: "bg-gradient-warning", icon: AlertCircle, label: "Warning" },
  low: { bg: "bg-gradient-success", icon: Info, label: "Info" },
};

function AlertsPage() {
  const { t } = useI18n();
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.alerts.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.alerts.subtitle}</p>
      </div>
      <div className="space-y-3">
        {alerts.map((a, i) => {
          const m = sevMeta[a.severity];
          const Icon = m.icon;
          return (
            <motion.div key={a.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-card"
            >
              <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${m.bg} text-white shadow-glow`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-semibold">{a.student}</div>
                  <span className="text-xs text-muted-foreground">{a.time}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{a.message}</p>
                <div className="mt-2 inline-flex rounded-full border border-border bg-background/40 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                  {m.label}
                </div>
              </div>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          );
        })}
      </div>
    </AppLayout>
  );
}