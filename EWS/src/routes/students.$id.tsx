import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, TrendingUp,
  TrendingDown, Award, BookOpen, Users, Heart, AlertTriangle, Sparkles,
  Clock, Target, Activity, MessageSquare, Download, Edit3,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { AppLayout } from "@/components/AppLayout";
import { students } from "@/lib/mock";

export const Route = createFileRoute("/students/$id")({ component: StudentProfile });

const riskMeta: Record<string, { label: string; bg: string; ring: string; text: string }> = {
  low:    { label: "Low Risk",    bg: "bg-gradient-success", ring: "ring-emerald-500/40", text: "text-emerald-400" },
  medium: { label: "Medium Risk", bg: "bg-gradient-warning", ring: "ring-amber-500/40",   text: "text-amber-400" },
  high:   { label: "High Risk",   bg: "bg-gradient-danger",  ring: "ring-rose-500/40",    text: "text-rose-400" },
};

function StudentProfile() {
  const { id } = useParams({ from: "/students/$id" });
  const student = students.find((s) => s.id === id) ?? students[0];
  const r = riskMeta[student.risk];

  const trend = Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    score: Math.max(40, Math.min(100, Math.round(student.score + Math.sin(i) * 8 + (Math.random() - 0.5) * 6))),
    attendance: Math.max(50, Math.min(100, Math.round(student.attendance + Math.cos(i) * 5 + (Math.random() - 0.5) * 4))),
  }));

  const radar = [
    { k: "Math", v: Math.round(student.score - 5 + Math.random() * 15) },
    { k: "Science", v: Math.round(student.score - 8 + Math.random() * 18) },
    { k: "English", v: Math.round(student.score - 3 + Math.random() * 12) },
    { k: "History", v: Math.round(student.score + Math.random() * 10) },
    { k: "Art", v: Math.round(70 + Math.random() * 25) },
    { k: "PE", v: Math.round(75 + Math.random() * 20) },
  ];

  const timeline = [
    { t: "Today", title: "Counseling session scheduled", kind: "intervention", icon: Heart },
    { t: "2d ago", title: "Missed Math class", kind: "alert", icon: AlertTriangle },
    { t: "5d ago", title: "Submitted Science project (A-)", kind: "win", icon: Award },
    { t: "1w ago", title: "Parent meeting completed", kind: "intervention", icon: Users },
    { t: "2w ago", title: "Quiz score improved by 12 pts", kind: "win", icon: TrendingUp },
  ];

  const badges = [
    { label: "Top 10 in Art", icon: Award },
    { label: "Perfect Attendance · Sep", icon: Calendar },
    { label: "Reading Club", icon: BookOpen },
  ];

  return (
    <AppLayout>
      {/* Back link */}
      <Link
        to="/students"
        className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to students
      </Link>

      {/* HERO */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 shadow-elevated sm:p-8"
      >
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-gradient-primary opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-24 h-64 w-64 rounded-full bg-gradient-to-br from-accent to-primary-glow opacity-20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with halo */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-3xl ${r.bg} opacity-60 blur-xl`} />
              <div className={`relative grid h-24 w-24 place-items-center rounded-3xl ${r.bg} text-3xl font-bold text-white shadow-glow ring-4 ${r.ring}`}>
                {student.avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-emerald-500 text-[10px] font-bold text-white">
                ●
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{student.name}</h1>
                <span className={`inline-flex items-center gap-1 rounded-full ${r.bg} px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-glow`}>
                  <Sparkles className="h-3 w-3" /> {r.label}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><GraduationCap className="h-4 w-4" /> Grade {student.grade}</span>
                <span className="inline-flex items-center gap-1.5">ID · {student.id}</span>
                <span className="inline-flex items-center gap-1.5">{student.gender === "M" ? "Male" : "Female"}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> Phnom Penh</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {badges.map((b) => (
                  <span key={b.label} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/60 px-2.5 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
                    <b.icon className="h-3.5 w-3.5 text-primary" /> {b.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary">
              <MessageSquare className="h-4 w-4" /> Message
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary">
              <Download className="h-4 w-4" /> Export
            </button>
            <button className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow">
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Attendance", value: `${student.attendance}%`, icon: Activity, trend: "+2.1%", up: true },
            { label: "Avg. Score", value: student.score, icon: Target, trend: "-1.4%", up: false },
            { label: "Engagement", value: "78", suffix: "/100", icon: TrendingUp, trend: "+4.0%", up: true },
            { label: "Risk Score", value: student.risk === "high" ? 82 : student.risk === "medium" ? 56 : 24, suffix: "/100", icon: AlertTriangle, trend: student.risk === "high" ? "+6.2%" : "-2.5%", up: student.risk === "high" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-background/40 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <s.icon className="h-4 w-4 text-muted-foreground" />
                <span className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${s.up ? "text-emerald-400" : "text-rose-400"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />} {s.trend}
                </span>
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="font-display text-2xl font-bold">{s.value}<span className="ml-0.5 text-sm text-muted-foreground">{s.suffix ?? ""}</span></div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Body grid */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Charts */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Performance Trend</h3>
              <p className="text-xs text-muted-foreground">Score & attendance over the last 8 weeks</p>
            </div>
            <div className="flex gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Score</span>
              <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Attendance</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend}>
                <defs>
                  <linearGradient id="gScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.7 0.2 290)" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="oklch(0.7 0.2 290)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gAtt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.75 0.18 155)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.75 0.18 155)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.5 0 0 / 0.15)" />
                <XAxis dataKey="week" stroke="oklch(0.6 0 0)" fontSize={11} />
                <YAxis stroke="oklch(0.6 0 0)" fontSize={11} domain={[40, 100]} />
                <Tooltip
                  contentStyle={{
                    background: "oklch(0.15 0.02 280)",
                    border: "1px solid oklch(0.3 0.02 280)",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Area type="monotone" dataKey="score" stroke="oklch(0.7 0.2 290)" strokeWidth={2.5} fill="url(#gScore)" />
                <Area type="monotone" dataKey="attendance" stroke="oklch(0.75 0.18 155)" strokeWidth={2.5} fill="url(#gAtt)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Right: Radar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <h3 className="font-display text-lg font-bold">Subject Mastery</h3>
          <p className="mb-2 text-xs text-muted-foreground">Per-subject performance</p>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radar}>
                <PolarGrid stroke="oklch(0.5 0 0 / 0.2)" />
                <PolarAngleAxis dataKey="k" tick={{ fill: "oklch(0.65 0 0)", fontSize: 11 }} />
                <PolarRadiusAxis tick={{ fill: "oklch(0.5 0 0)", fontSize: 10 }} angle={30} domain={[0, 100]} />
                <Radar dataKey="v" stroke="oklch(0.7 0.2 290)" fill="oklch(0.7 0.2 290)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* AI Insight */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-2"
        >
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-primary opacity-20 blur-3xl" />
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">AI Insight</h3>
              <p className="text-xs text-muted-foreground">Generated by EduGuard AI · updated 2m ago</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90">
            {student.name} shows a <span className={`font-semibold ${r.text}`}>{r.label.toLowerCase()}</span> trajectory.
            {" "}Recent attendance dropped {Math.round(Math.random() * 6 + 3)}% versus the previous month, and score volatility increased in Math & Science.
            {" "}Strong points: Art and PE consistently above peers.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Schedule counseling", icon: Heart, tone: "bg-gradient-warning" },
              { label: "Parent outreach", icon: Users, tone: "bg-gradient-primary" },
              { label: "Peer tutoring", icon: BookOpen, tone: "bg-gradient-success" },
            ].map((a) => (
              <button key={a.label} className="group flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left transition-all hover:border-primary hover:shadow-glow">
                <div className={`grid h-9 w-9 place-items-center rounded-lg ${a.tone} text-white`}>
                  <a.icon className="h-4 w-4" />
                </div>
                <div className="text-sm font-medium">{a.label}</div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card"
        >
          <h3 className="font-display text-lg font-bold">Guardian & Contact</h3>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary text-foreground"><Users className="h-4 w-4" /></div>
              <div>
                <div className="font-semibold">Mrs. Chenda {student.name.split(" ").slice(-1)[0]}</div>
                <div className="text-xs text-muted-foreground">Mother · Primary contact</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Phone className="h-4 w-4" /></div>
              <div className="text-sm">+855 12 345 678</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><Mail className="h-4 w-4" /></div>
              <div className="text-sm">guardian.{student.id.toLowerCase()}@school.kh</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-secondary"><MapPin className="h-4 w-4" /></div>
              <div className="text-sm">Sangkat Toul Tom Poung, Phnom Penh</div>
            </div>
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-card lg:col-span-3"
        >
          <h3 className="font-display text-lg font-bold">Recent Activity</h3>
          <p className="text-xs text-muted-foreground">Interventions, alerts and achievements</p>
          <ol className="relative mt-5 space-y-4 border-l border-border pl-6">
            {timeline.map((e, i) => {
              const tone =
                e.kind === "alert" ? "bg-gradient-danger" :
                e.kind === "win" ? "bg-gradient-success" : "bg-gradient-primary";
              return (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="relative"
                >
                  <span className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full ${tone} text-white shadow-glow ring-4 ring-card`}>
                    <e.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-background/40 px-4 py-3">
                    <div className="text-sm font-medium">{e.title}</div>
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" /> {e.t}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </motion.div>
      </div>
    </AppLayout>
  );
}