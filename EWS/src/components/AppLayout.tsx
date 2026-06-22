import { Link, useRouterState } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Users, Brain, Bell, BarChart3, HeartHandshake, FileText, Settings,
  Moon, Sun, Languages, Search, Shield, Sparkles, ShieldCheck,
} from "lucide-react";
import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { NotificationBell } from "@/components/NotificationBell";

export function AppLayout({ children }: { children: ReactNode }) {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const nav = [
    { to: "/", icon: LayoutDashboard, label: t.nav.dashboard },
    { to: "/students", icon: Users, label: t.nav.students },
    { to: "/predict", icon: Brain, label: t.nav.predict },
    { to: "/alerts", icon: Bell, label: t.nav.alerts },
    { to: "/analytics", icon: BarChart3, label: t.nav.analytics },
    { to: "/interventions", icon: HeartHandshake, label: t.nav.interventions },
    { to: "/reports", icon: FileText, label: t.nav.reports },
    { to: "/settings", icon: Settings, label: t.nav.settings },
    { to: "/admin", icon: ShieldCheck, label: lang === "en" ? "Admin Panel" : "ផ្ទាំងគ្រប់គ្រង" },
  ];

  return (
    <div className={cn("min-h-screen w-full bg-background text-foreground", lang === "km" && "font-km")}>
      <div className="fixed inset-0 -z-10 grid-bg opacity-[0.25]" />
      <div className="fixed inset-x-0 top-0 -z-10 h-[480px] bg-gradient-hero opacity-[0.10] blur-3xl" />

      <div className="flex">
        {/* Sidebar */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-sidebar-border bg-sidebar/80 backdrop-blur-xl lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <Shield className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
              <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full bg-accent ring-2 ring-sidebar" />
            </div>
            <div>
              <div className="font-display text-base font-bold leading-none">{t.appName}</div>
              <div className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">{t.tagline}</div>
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {nav.map((n) => {
              const active = pathname === n.to;
              return (
                <Link key={n.to} to={n.to} className="block">
                  <div className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all",
                    active
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}>
                    <n.icon className="h-4 w-4 shrink-0" />
                    <span className="font-medium">{n.label}</span>
                    {active && (
                      <motion.span layoutId="dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="m-3 rounded-2xl border border-sidebar-border bg-gradient-to-br from-card to-sidebar-accent p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent">
              <Sparkles className="h-3.5 w-3.5" /> AI Assistant
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {lang === "en"
                ? "Ask EduGuard about any student trend or risk pattern."
                : "សួរ EduGuard អំពីនិន្នាការ ឬហានិភ័យសិស្ស។"}
            </p>
          </div>
        </aside>

        {/* Main */}
        <div className="min-w-0 flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-30 border-b border-border bg-background/70 backdrop-blur-xl">
            <div className="flex h-16 items-center gap-3 px-4 md:px-8">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder={lang === "en" ? "Search students, alerts, reports…" : "ស្វែងរក…"}
                  className="h-10 w-full rounded-xl border border-border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
              </div>
              <button
                onClick={() => setLang(lang === "en" ? "km" : "en")}
                className="ml-auto flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs font-semibold hover:border-primary"
              >
                <Languages className="h-4 w-4" />
                {lang === "en" ? "EN" : "ខ្មែរ"}
              </button>
              <button
                onClick={toggle}
                className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card hover:border-primary"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <NotificationBell />
              <div className="hidden items-center gap-3 rounded-xl border border-border bg-card px-2 py-1.5 md:flex">
                <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                  SD
                </div>
                <div className="pr-1 text-xs leading-tight">
                  <div className="font-semibold">Sokha Director</div>
                  <div className="text-muted-foreground">{t.common.admin}</div>
                </div>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 md:px-8 md:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
}