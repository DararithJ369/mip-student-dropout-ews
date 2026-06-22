import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeartHandshake, Calendar as CalendarIcon, MessageSquare, CheckCircle2,
  Plus, Search, GraduationCap, Clock, AlertCircle, Loader2, X
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { getInterventionsData, addIntervention, updateInterventionStatus, getStudents } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/interventions")({ component: InterventionsPage });

type Status = "Pending" | "In Progress" | "Resolved";
type Priority = "low" | "medium" | "high";

interface Intervention {
  id: number;
  studentId: string;
  studentName: string;
  action: string;
  severity: Priority;
  status: string;
  assignedBy: string;
  assignedDate: string;
  notes: string;
}

const PRIORITY_META: Record<Priority, { tint: string }> = {
  "low": { tint: "from-emerald-500 to-primary" },
  "medium": { tint: "from-amber-500 to-primary" },
  "high": { tint: "from-rose-500 to-primary" },
};

const STATUS_META: Record<string, { cls: string; label: string }> = {
  "pending":     { cls: "bg-warning/15 text-warning border-warning/30", label: "Pending" },
  "in_progress": { cls: "bg-primary/15 text-primary border-primary/30", label: "In Progress" },
  "completed":    { cls: "bg-success/15 text-success border-success/30", label: "Resolved" },
};

function InterventionsPage() {
  const [items, setItems] = useState<Intervention[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form fields
  const [selStudentId, setSelStudentId] = useState("");
  const [actionText, setActionText] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchInterventions = async () => {
    try {
      const data = await getInterventionsData();
      setItems(data.interventions);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch interventions. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentsList = async () => {
    try {
      const data = await getStudents();
      setStudents(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchInterventions();
    fetchStudentsList();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i =>
      (statusFilter === "all" || i.status === statusFilter) &&
      (!q || i.studentName.toLowerCase().includes(q) || i.action.toLowerCase().includes(q))
    );
  }, [items, query, statusFilter]);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter(i => i.status === "pending").length,
    progress: items.filter(i => i.status === "in_progress").length,
    resolved: items.filter(i => i.status === "completed").length,
  }), [items]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateInterventionStatus(id, newStatus);
      toast.success(`Intervention status updated to ${newStatus.replace("_", " ")}`);
      fetchInterventions();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status.");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selStudentId) {
      toast.error("Please select a student");
      return;
    }
    if (!actionText.trim()) {
      toast.error("Action is required");
      return;
    }
    setSubmitting(true);
    try {
      await addIntervention({
        student_id: selStudentId,
        action: actionText,
        severity: priority,
        notes,
        assigned_by: localStorage.getItem("ews_user_name") || "Administrator",
      });
      toast.success("Intervention assigned successfully!");
      setCreating(false);
      setActionText("");
      setNotes("");
      fetchInterventions();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create intervention.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-accent">
            <HeartHandshake className="h-3 w-3" /> Intervention Workflow
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Intervention Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan, schedule, and track counseling, parent meetings, and academic support.</p>
        </div>
        <button 
          onClick={() => setCreating(true)} 
          className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow hover:scale-[1.02] cursor-pointer"
        >
          <Plus className="h-4 w-4" /> New Intervention
        </button>
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total" value={counts.total} icon={HeartHandshake} tint="text-foreground" />
        <Stat label="Pending" value={counts.pending} icon={Clock} tint="text-warning" />
        <Stat label="In Progress" value={counts.progress} icon={HeartHandshake} tint="text-primary" />
        <Stat label="Resolved" value={counts.resolved} icon={CheckCircle2} tint="text-success" />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Search student, plan, or type…" 
            className="h-11 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
          />
        </div>
        <select 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-11 rounded-xl border border-border bg-card px-3 text-sm outline-none focus:border-primary"
        >
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Resolved</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger animate-in fade-in-50">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="flex h-40 flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-sm text-muted-foreground">Loading active interventions...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No interventions match the filters.</p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {filtered.map(it => {
            const meta = STATUS_META[it.status] || STATUS_META["pending"];
            const priorityMeta = PRIORITY_META[it.severity] || PRIORITY_META["medium"];
            return (
              <motion.div 
                key={it.id}
                layout
                initial={{ opacity: 0, y: 8 }} 
                animate={{ opacity: 1, y: 0 }}
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-glow"
              >
                <div className="relative z-10 flex items-start gap-4">
                  <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${priorityMeta.tint} text-primary-foreground shadow-glow`}>
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="truncate font-semibold">{it.studentName}</div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.studentId} · Priority: {it.severity}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.cls}`}>
                        {meta.label}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{it.action}</p>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {it.assignedDate}
                      </div>
                      <span className="text-xs text-muted-foreground">By: {it.assignedBy}</span>
                    </div>
                    {it.notes && (
                      <div className="mt-2 rounded-lg bg-background/40 p-2 text-xs text-muted-foreground border border-border/60">
                        {it.notes}
                      </div>
                    )}
                    {/* Quick status switcher */}
                    <div className="relative z-20 mt-3 flex gap-1 rounded-lg border border-border bg-background p-1">
                      {[
                        { val: "pending", label: "Pending" },
                        { val: "in_progress", label: "In Progress" },
                        { val: "completed", label: "Resolved" }
                      ].map(s => (
                        <button 
                          key={s.val}
                          onClick={() => handleStatusChange(it.id, s.val)}
                          className={`flex-1 rounded-md py-1.5 text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                            it.status === s.val ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* New Intervention Dialog Modal */}
      <AnimatePresence>
        {creating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setCreating(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Assign Intervention</h3>
                <button 
                  onClick={() => setCreating(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Select Student
                  </label>
                  <select
                    required
                    value={selStudentId}
                    onChange={(e) => setSelStudentId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} · G{s.grade} · {s.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Intervention Plan
                  </label>
                  <input
                    type="text"
                    required
                    value={actionText}
                    onChange={(e) => setActionText(e.target.value)}
                    placeholder="e.g. Schedule weekly counseling"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Priority / Severity
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Context / Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Optional notes..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setCreating(false)}
                    disabled={submitting}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-secondary cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Assign Plan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
}

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: any; tint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        <Icon className={`h-4 w-4 ${tint}`} />
      </div>
      <div className={`mt-1 font-display text-3xl font-bold ${tint}`}>{value}</div>
    </div>
  );
}