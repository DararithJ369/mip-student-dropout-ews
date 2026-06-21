import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Link } from "@tanstack/react-router";
import { alerts as seedAlerts } from "@/lib/mock";
import { cn } from "@/lib/utils";

const READ_KEY = "eduguard.alerts.read.v1";

type Severity = "high" | "medium" | "low";
interface Notif {
  id: number;
  student: string;
  message: string;
  severity: Severity;
  time: string;
}

const sevMeta: Record<Severity, { icon: typeof Bell; cls: string; ring: string }> = {
  high:   { icon: AlertTriangle, cls: "text-danger",  ring: "bg-danger/15" },
  medium: { icon: AlertCircle,   cls: "text-warning", ring: "bg-warning/15" },
  low:    { icon: Info,          cls: "text-primary", ring: "bg-primary/15" },
};

function loadRead(): number[] {
  if (typeof localStorage === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(READ_KEY) || "[]"); } catch { return []; }
}
function saveRead(ids: number[]) {
  if (typeof localStorage !== "undefined") localStorage.setItem(READ_KEY, JSON.stringify(ids));
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [read, setRead] = useState<number[]>([]);
  const items = seedAlerts as Notif[];

  useEffect(() => { setRead(loadRead()); }, []);

  const unread = useMemo(() => items.filter(a => !read.includes(a.id)).length, [items, read]);

  const markAll = () => {
    const ids = items.map(a => a.id);
    setRead(ids); saveRead(ids);
  };
  const markOne = (id: number) => {
    if (read.includes(id)) return;
    const next = [...read, id]; setRead(next); saveRead(next);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative grid h-10 w-10 place-items-center rounded-xl border border-border bg-card hover:border-primary"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <>
              <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white shadow-glow">
                {unread > 9 ? "9+" : unread}
              </span>
              <span className="absolute right-1.5 top-1.5 h-4 w-4 animate-ping rounded-full bg-danger/40" />
            </>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-card to-background px-4 py-3">
          <div>
            <div className="font-display text-sm font-semibold">Notifications</div>
            <div className="text-[11px] text-muted-foreground">
              {unread > 0 ? `${unread} unread alert${unread === 1 ? "" : "s"}` : "You're all caught up"}
            </div>
          </div>
          {unread > 0 && (
            <button onClick={markAll} className="inline-flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-semibold hover:border-primary hover:text-primary">
              <CheckCheck className="h-3 w-3" /> Mark all
            </button>
          )}
        </div>
        <div className="max-h-[380px] overflow-y-auto">
          <AnimatePresence initial={false}>
            {items.map((a) => {
              const isRead = read.includes(a.id);
              const M = sevMeta[a.severity];
              const Icon = M.icon;
              return (
                <motion.button
                  key={a.id}
                  layout
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  onClick={() => markOne(a.id)}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-secondary/40",
                    !isRead && "bg-primary/[0.04]"
                  )}
                >
                  <div className={cn("relative grid h-9 w-9 shrink-0 place-items-center rounded-xl", M.ring)}>
                    <Icon className={cn("h-4 w-4", M.cls)} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="truncate text-sm font-semibold">{a.student}</div>
                      <div className="shrink-0 text-[10px] text-muted-foreground">{a.time}</div>
                    </div>
                    <div className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{a.message}</div>
                  </div>
                  {!isRead && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary shadow-glow" />}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-card px-4 py-2.5">
          <Link to="/alerts" onClick={() => setOpen(false)} className="text-xs font-semibold text-primary hover:underline">
            View all alerts →
          </Link>
          <button onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">
            <X className="h-3 w-3" /> Close
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}