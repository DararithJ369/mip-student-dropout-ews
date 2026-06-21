import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { Moon, Sun, Languages, type LucideIcon } from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

function SettingsPage() {
  const { lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalize your EduGuard experience.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Row title="Language / ភាសា" icon={Languages}>
          <div className="flex gap-1 rounded-xl border border-border bg-background p-1">
            {(["en", "km"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  lang === l ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground"
                }`}>
                {l === "en" ? "English" : "ខ្មែរ"}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Appearance" icon={theme === "dark" ? Moon : Sun}>
          <button onClick={toggle} className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold capitalize hover:border-primary">
            {theme} mode
          </button>
        </Row>
      </div>
    </AppLayout>
  );
}

function Row({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon: LucideIcon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
          <Icon className="h-5 w-5" />
        </div>
        <div className="font-semibold">{title}</div>
      </div>
      {children}
    </div>
  );
}