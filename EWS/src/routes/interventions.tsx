import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  HeartHandshake, Calendar as CalendarIcon, MessageSquare, CheckCircle2,
  Plus, Pencil, Trash2, Search, Users, GraduationCap, BookOpen, DollarSign, Sparkles, Clock, Send,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { students } from "@/lib/mock";

export const Route = createFileRoute("/interventions")({ component: InterventionsPage });

type Status = "Pending" | "In Progress" | "Resolved";
type Kind = "Counseling" | "Parent Meeting" | "Tutoring" | "Mentoring" | "Financial Aid" | "Other";

interface Comment {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface Intervention {
  id: string;
  studentId: string;
  studentName: string;
  kind: Kind;
  plan: string;
  scheduledAt: string; // ISO datetime-local
  status: Status;
  createdAt: string;
  updatedAt: string;
  comments: Comment[];
}

const STORAGE_KEY = "eduguard.interventions.v1";

const KIND_META: Record<Kind, { icon: typeof MessageSquare; tint: string }> = {
  "Counseling": { icon: MessageSquare, tint: "from-primary to-accent" },
  "Parent Meeting": { icon: Users, tint: "from-accent to-primary" },
  "Tutoring": { icon: BookOpen, tint: "from-success to-primary" },
  "Mentoring": { icon: HeartHandshake, tint: "from-primary to-warning" },
  "Financial Aid": { icon: DollarSign, tint: "from-warning to-danger" },
  "Other": { icon: Sparkles, tint: "from-muted to-primary" },
};

const STATUS_META: Record<Status, { cls: string; icon: typeof Clock }> = {
  "Pending":     { cls: "bg-warning/15 text-warning border-warning/30", icon: Clock },
  "In Progress": { cls: "bg-primary/15 text-primary border-primary/30", icon: HeartHandshake },
  "Resolved":    { cls: "bg-success/15 text-success border-success/30", icon: CheckCircle2 },
};

const SEED: Intervention[] = [
  {
    id: crypto.randomUUID(), studentId: students[0]?.id ?? "STU-1000", studentName: students[0]?.name ?? "Sok Pisey",
    kind: "Counseling", plan: "Weekly counseling sessions to address motivation and absenteeism.",
    scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16),
    status: "In Progress", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    comments: [{ id: crypto.randomUUID(), author: "Ms. Sokha", text: "First session went well. Student engaged.", createdAt: new Date().toISOString() }],
  },
  {
    id: crypto.randomUUID(), studentId: students[1]?.id ?? "STU-1001", studentName: students[1]?.name ?? "Chan Dara",
    kind: "Parent Meeting", plan: "Schedule family meeting to discuss declining grades and home support.",
    scheduledAt: new Date(Date.now() + 86400000 * 5).toISOString().slice(0, 16),
    status: "Pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), comments: [],
  },
  {
    id: crypto.randomUUID(), studentId: students[3]?.id ?? "STU-1003", studentName: students[3]?.name ?? "Vannak Heng",
    kind: "Tutoring", plan: "After-school math and science tutoring twice per week.",
    scheduledAt: new Date(Date.now() - 86400000 * 3).toISOString().slice(0, 16),
    status: "Resolved", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    comments: [{ id: crypto.randomUUID(), author: "Mr. Dara", text: "Grades improved by 12 points.", createdAt: new Date().toISOString() }],
  },
];

function load(): Intervention[] {
  if (typeof localStorage === "undefined") return SEED;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return SEED;
    return JSON.parse(raw) as Intervention[];
  } catch { return SEED; }
}
function save(items: Intervention[]) {
  if (typeof localStorage !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function InterventionsPage() {
  const [items, setItems] = useState<Intervention[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [editing, setEditing] = useState<Intervention | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Intervention | null>(null);
  const [detail, setDetail] = useState<Intervention | null>(null);

  useEffect(() => { setItems(load()); }, []);
  useEffect(() => { if (items.length) save(items); }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(i =>
      (statusFilter === "all" || i.status === statusFilter) &&
      (!q || i.studentName.toLowerCase().includes(q) || i.plan.toLowerCase().includes(q) || i.kind.toLowerCase().includes(q))
    ).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [items, query, statusFilter]);

  const counts = useMemo(() => ({
    total: items.length,
    pending: items.filter(i => i.status === "Pending").length,
    progress: items.filter(i => i.status === "In Progress").length,
    resolved: items.filter(i => i.status === "Resolved").length,
  }), [items]);

  const upsert = (it: Intervention) => {
    setItems(prev => {
      const idx = prev.findIndex(p => p.id === it.id);
      const next = [...prev];
      if (idx >= 0) next[idx] = it; else next.unshift(it);
      return next;
    });
  };

  const setStatus = (id: string, status: Status) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status, updatedAt: new Date().toISOString() } : i));
    if (detail?.id === id) setDetail(d => d ? { ...d, status } : d);
    toast.success(`Status updated to ${status}`);
  };

  const remove = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    save(items.filter(i => i.id !== id));
    toast.success("Intervention deleted");
    setConfirmDelete(null);
    if (detail?.id === id) setDetail(null);
  };

  const addComment = (id: string, text: string) => {
    const c: Comment = { id: crypto.randomUUID(), author: "Academic Admin", text, createdAt: new Date().toISOString() };
    setItems(prev => prev.map(i => i.id === id ? { ...i, comments: [...i.comments, c], updatedAt: new Date().toISOString() } : i));
    setDetail(d => d && d.id === id ? { ...d, comments: [...d.comments, c] } : d);
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
        <Button onClick={() => setCreating(true)} className="bg-gradient-primary text-primary-foreground shadow-glow hover:scale-[1.02]">
          <Plus className="mr-1 h-4 w-4" /> New Intervention
        </Button>
      </div>

      {/* Stat strip */}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Total" value={counts.total} icon={Sparkles} tint="text-foreground" />
        <Stat label="Pending" value={counts.pending} icon={Clock} tint="text-warning" />
        <Stat label="In Progress" value={counts.progress} icon={HeartHandshake} tint="text-primary" />
        <Stat label="Resolved" value={counts.resolved} icon={CheckCircle2} tint="text-success" />
      </div>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search student, plan, or type…" className="h-11 pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status | "all")}>
          <SelectTrigger className="h-11 w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
            <HeartHandshake className="h-7 w-7" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">No interventions match the filters.</p>
          <Button variant="outline" className="mt-4" onClick={() => setCreating(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create your first intervention
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <AnimatePresence initial={false}>
            {filtered.map(it => {
              const KIcon = KIND_META[it.kind].icon;
              const SIcon = STATUS_META[it.status].icon;
              return (
                <motion.div key={it.id}
                  layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-card transition-all hover:border-primary/40 hover:shadow-glow">
                  <button onClick={() => setDetail(it)} className="absolute inset-0 z-0" aria-label="Open" />
                  <div className="relative z-10 flex items-start gap-4">
                    <div className={`grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${KIND_META[it.kind].tint} text-primary-foreground shadow-glow`}>
                      <KIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{it.studentName}</div>
                          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{it.kind} · {it.studentId}</div>
                        </div>
                        <Badge variant="outline" className={STATUS_META[it.status].cls}>
                          <SIcon className="mr-1 h-3 w-3" /> {it.status}
                        </Badge>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{it.plan}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          {it.scheduledAt ? new Date(it.scheduledAt).toLocaleString() : "—"}
                        </div>
                        <div className="relative z-20 flex gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); setEditing(it); }} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-danger hover:text-danger" onClick={(e) => { e.stopPropagation(); setConfirmDelete(it); }} aria-label="Delete">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {/* Quick status switcher */}
                      <div className="relative z-20 mt-3 flex gap-1 rounded-lg border border-border bg-background p-1">
                        {(["Pending", "In Progress", "Resolved"] as Status[]).map(s => (
                          <button key={s}
                            onClick={(e) => { e.stopPropagation(); setStatus(it.id, s); }}
                            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-colors ${
                              it.status === s ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                            }`}>{s}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Create / Edit dialog */}
      <InterventionFormDialog
        open={creating || !!editing}
        initial={editing}
        onClose={() => { setCreating(false); setEditing(null); }}
        onSubmit={(it) => { upsert(it); toast.success(editing ? "Intervention updated" : "Intervention created"); setCreating(false); setEditing(null); }}
      />

      {/* Detail dialog */}
      <DetailDialog
        item={detail}
        onClose={() => setDetail(null)}
        onAddComment={(text) => detail && addComment(detail.id, text)}
        onStatus={(s) => detail && setStatus(detail.id, s)}
        onEdit={() => { if (detail) { setEditing(detail); setDetail(null); } }}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this intervention?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the plan and all its comments. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-danger text-white hover:bg-danger/90" onClick={() => confirmDelete && remove(confirmDelete.id)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}

function Stat({ label, value, icon: Icon, tint }: { label: string; value: number; icon: typeof Clock; tint: string }) {
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

function InterventionFormDialog({
  open, initial, onClose, onSubmit,
}: {
  open: boolean;
  initial: Intervention | null;
  onClose: () => void;
  onSubmit: (it: Intervention) => void;
}) {
  const [studentId, setStudentId] = useState("");
  const [kind, setKind] = useState<Kind>("Counseling");
  const [plan, setPlan] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [status, setStatus] = useState<Status>("Pending");

  useEffect(() => {
    if (open) {
      setStudentId(initial?.studentId ?? students[0]?.id ?? "");
      setKind(initial?.kind ?? "Counseling");
      setPlan(initial?.plan ?? "");
      setScheduledAt(initial?.scheduledAt ?? new Date(Date.now() + 86400000).toISOString().slice(0, 16));
      setStatus(initial?.status ?? "Pending");
    }
  }, [open, initial]);

  const submit = () => {
    if (!studentId) return toast.error("Select a student");
    if (!plan.trim()) return toast.error("Plan description is required");
    if (plan.length > 1000) return toast.error("Plan must be under 1000 characters");
    const student = students.find(s => s.id === studentId);
    const now = new Date().toISOString();
    const it: Intervention = {
      id: initial?.id ?? crypto.randomUUID(),
      studentId,
      studentName: student?.name ?? initial?.studentName ?? "Unknown",
      kind, plan: plan.trim(), scheduledAt, status,
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      comments: initial?.comments ?? [],
    };
    onSubmit(it);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{initial ? "Edit Intervention" : "New Intervention"}</DialogTitle>
          <DialogDescription>Plan a counseling session, parent meeting, or academic support.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <Field label="Student">
            <Select value={studentId} onValueChange={setStudentId}>
              <SelectTrigger><SelectValue placeholder="Choose student" /></SelectTrigger>
              <SelectContent>
                {students.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    <span className="inline-flex items-center gap-2">
                      <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                      {s.name} · G{s.grade} · {s.id}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Type">
              <Select value={kind} onValueChange={(v) => setKind(v as Kind)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(KIND_META) as Kind[]).map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Status">
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <Field label="Scheduled date & time">
            <Input type="datetime-local" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </Field>
          <Field label="Plan / Notes">
            <Textarea value={plan} onChange={e => setPlan(e.target.value)} rows={4} maxLength={1000}
              placeholder="e.g. Weekly 30-min counseling and bi-weekly parent calls for 6 weeks." />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">{plan.length}/1000</div>
          </Field>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} className="bg-gradient-primary text-primary-foreground shadow-glow">
            {initial ? "Save changes" : "Create intervention"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DetailDialog({
  item, onClose, onAddComment, onStatus, onEdit,
}: {
  item: Intervention | null;
  onClose: () => void;
  onAddComment: (text: string) => void;
  onStatus: (s: Status) => void;
  onEdit: () => void;
}) {
  const [text, setText] = useState("");
  useEffect(() => { if (!item) setText(""); }, [item]);
  if (!item) return null;
  const KIcon = KIND_META[item.kind].icon;
  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className={`grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br ${KIND_META[item.kind].tint} text-primary-foreground shadow-glow`}>
              <KIcon className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="font-display text-xl">{item.studentName}</DialogTitle>
              <DialogDescription>{item.kind} · {item.studentId}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Plan</div>
            <p className="mt-1 text-sm leading-relaxed whitespace-pre-wrap">{item.plan}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarIcon className="h-3.5 w-3.5" /> {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "—"}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</div>
            <div className="flex gap-1 rounded-lg border border-border bg-background p-1">
              {(["Pending", "In Progress", "Resolved"] as Status[]).map(s => (
                <button key={s} onClick={() => onStatus(s)}
                  className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold uppercase tracking-wider transition-colors ${
                    item.status === s ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Comments ({item.comments.length})</div>
            </div>
            <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
              {item.comments.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No comments yet.</div>
              ) : item.comments.map(c => (
                <div key={c.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold">{c.author}</div>
                    <div className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="mt-1 text-sm">{c.text}</div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <Input value={text} onChange={e => setText(e.target.value)} maxLength={500}
                placeholder="Add a comment…"
                onKeyDown={(e) => { if (e.key === "Enter" && text.trim()) { onAddComment(text.trim()); setText(""); } }} />
              <Button onClick={() => { if (text.trim()) { onAddComment(text.trim()); setText(""); } }}
                className="bg-gradient-primary text-primary-foreground shadow-glow">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={onEdit}><Pencil className="mr-1 h-4 w-4" /> Edit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}