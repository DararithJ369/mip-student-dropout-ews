import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function KpiCard({
  label, value, icon: Icon, tone = "primary", trend, suffix,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "accent";
  trend?: string;
  suffix?: string;
}) {
  const toneBg: Record<string, string> = {
    primary: "bg-gradient-primary",
    success: "bg-gradient-success",
    warning: "bg-gradient-warning",
    danger: "bg-gradient-danger",
    accent: "bg-gradient-to-br from-accent to-primary-glow",
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card"
    >
      <div className={cn("absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-40", toneBg[tone])} />
      <div className="flex items-start justify-between">
        <div className={cn("grid h-11 w-11 place-items-center rounded-xl text-primary-foreground shadow-glow", toneBg[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span className="rounded-full border border-border bg-background/60 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold tracking-tight">
        {value}
        {suffix && <span className="ml-1 text-base text-muted-foreground">{suffix}</span>}
      </div>
    </motion.div>
  );
}