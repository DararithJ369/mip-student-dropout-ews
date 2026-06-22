import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, AlertTriangle, AlertCircle, Info, Loader2, type LucideIcon } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { useState, useEffect } from "react";
import { getInterventionsData } from "@/lib/api";

export const Route = createFileRoute("/alerts")({ component: AlertsPage });

const sevMeta: Record<string, { bg: string; icon: LucideIcon; label: string }> = {
  high: { bg: "bg-gradient-danger", icon: AlertTriangle, label: "Critical" },
  medium: { bg: "bg-gradient-warning", icon: AlertCircle, label: "Warning" },
  low: { bg: "bg-gradient-success", icon: Info, label: "Info" },
};

function AlertsPage() {
  const { t } = useI18n();
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const data = await getInterventionsData();
        setAlertsList(data.alerts);
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError("Failed to fetch live alerts.");
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.alerts.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.alerts.subtitle}</p>
      </div>

      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading active alerts...</p>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      ) : alertsList.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <p className="text-sm text-muted-foreground">No active risk alerts recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alertsList.map((a, i) => {
            const m = sevMeta[a.severity] || sevMeta["low"];
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
      )}
    </AppLayout>
  );
}