import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck, UserPlus, Trash2, Edit3, Search, Users, Activity,
  Database, Server, Lock, KeyRound, CheckCircle2, XCircle,
} from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

type Role = "Super Admin" | "Admin" | "Teacher" | "Counselor" | "Viewer";
type Status = "active" | "suspended";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
  lastActive: string;
}

const KEY = "eduguard.admin.users.v1";

const seedUsers: AdminUser[] = [
  { id: "U-001", name: "Sokha Director", email: "sokha@eduguard.edu", role: "Super Admin", status: "active", lastActive: "2m ago" },
  { id: "U-002", name: "Dara Heng", email: "dara@eduguard.edu", role: "Admin", status: "active", lastActive: "1h ago" },
  { id: "U-003", name: "Bopha Lim", email: "bopha@eduguard.edu", role: "Teacher", status: "active", lastActive: "5h ago" },
  { id: "U-004", name: "Vannak Pen", email: "vannak@eduguard.edu", role: "Counselor", status: "active", lastActive: "Yesterday" },
  { id: "U-005", name: "Mealea Sun", email: "mealea@eduguard.edu", role: "Teacher", status: "suspended", lastActive: "3 days ago" },
  { id: "U-006", name: "Rithy Sam", email: "rithy@eduguard.edu", role: "Viewer", status: "active", lastActive: "Just now" },
];

const roles: Role[] = ["Super Admin", "Admin", "Teacher", "Counselor", "Viewer"];

const auditLog = [
  { who: "Sokha Director", action: "Updated risk thresholds", when: "2 min ago", type: "config" },
  { who: "Dara Heng", action: "Created user Rithy Sam", when: "1 hour ago", type: "user" },
  { who: "AI Engine", action: "Re-trained model v2.4.1", when: "3 hours ago", type: "ai" },
  { who: "Bopha Lim", action: "Exported student report (Grade 8)", when: "Yesterday", type: "export" },
  { who: "System", action: "Database backup completed", when: "Yesterday", type: "system" },
];

function roleColor(r: Role) {
  switch (r) {
    case "Super Admin": return "bg-gradient-primary text-primary-foreground border-transparent";
    case "Admin": return "bg-accent/15 text-accent border-accent/30";
    case "Teacher": return "bg-primary/10 text-primary border-primary/20";
    case "Counselor": return "bg-success/15 text-success border-success/30";
    case "Viewer": return "bg-muted text-muted-foreground border-border";
  }
}

export const Route = createFileRoute("/admin")({ component: AdminPanel });

function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>(seedUsers);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<{ name: string; email: string; role: Role }>({
    name: "", email: "", role: "Teacher",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setUsers(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(users)); } catch {}
  }, [users]);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.role.toLowerCase().includes(query.toLowerCase())
  );

  function openCreate() {
    setEditing(null);
    setForm({ name: "", email: "", role: "Teacher" });
    setOpen(true);
  }
  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({ name: u.name, email: u.email, role: u.role });
    setOpen(true);
  }
  function save() {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    if (editing) {
      setUsers(prev => prev.map(u => u.id === editing.id ? { ...u, ...form } : u));
      toast.success("User updated");
    } else {
      const id = `U-${String(Date.now()).slice(-4)}`;
      setUsers(prev => [{ id, ...form, status: "active", lastActive: "Just now" }, ...prev]);
      toast.success("User created");
    }
    setOpen(false);
  }
  function remove(id: string) {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success("User removed");
  }
  function toggleStatus(id: string) {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, status: u.status === "active" ? "suspended" : "active" }
      : u));
  }

  const stats = [
    { label: "Total Users", value: users.length, icon: Users, gradient: "bg-gradient-primary" },
    { label: "Active Now", value: users.filter(u => u.status === "active").length, icon: Activity, gradient: "bg-gradient-success" },
    { label: "Admins", value: users.filter(u => u.role === "Admin" || u.role === "Super Admin").length, icon: ShieldCheck, gradient: "bg-gradient-warning" },
    { label: "Suspended", value: users.filter(u => u.status === "suspended").length, icon: Lock, gradient: "bg-gradient-danger" },
  ];

  return (
    <AppLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-2 md:flex-row md:items-center md:justify-between"
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
            <ShieldCheck className="h-3.5 w-3.5" /> Administration
          </div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Admin Panel</h1>
          <p className="text-sm text-muted-foreground">
            Manage users, roles, system configuration and audit trails.
          </p>
        </div>
        <Button onClick={openCreate} className="bg-gradient-primary shadow-glow">
          <UserPlus className="mr-2 h-4 w-4" /> New User
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</div>
                <div className="mt-1 font-display text-2xl font-bold">{s.value}</div>
              </div>
              <div className={`grid h-10 w-10 place-items-center rounded-xl ${s.gradient} shadow-glow`}>
                <s.icon className="h-5 w-5 text-primary-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-card/60 backdrop-blur">
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users & Roles</TabsTrigger>
          <TabsTrigger value="system"><Server className="mr-2 h-4 w-4" />System</TabsTrigger>
          <TabsTrigger value="audit"><Activity className="mr-2 h-4 w-4" />Audit Log</TabsTrigger>
        </TabsList>

        {/* USERS */}
        <TabsContent value="users" className="space-y-4">
          <div className="glass flex items-center gap-3 rounded-2xl p-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search users by name, email, role…"
                className="pl-9"
              />
            </div>
          </div>

          <div className="glass overflow-hidden rounded-2xl shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {u.name.split(" ").map(p => p[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-medium">{u.name}</div>
                          <div className="text-xs text-muted-foreground">{u.email}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={roleColor(u.role)} variant="outline">{u.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleStatus(u.id)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-0.5 text-xs font-semibold hover:border-primary"
                      >
                        {u.status === "active" ? (
                          <><CheckCircle2 className="h-3 w-3 text-success" /> Active</>
                        ) : (
                          <><XCircle className="h-3 w-3 text-danger" /> Suspended</>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.lastActive}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" onClick={() => openEdit(u)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => remove(u.id)}>
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                      No users match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* SYSTEM */}
        <TabsContent value="system" className="grid gap-4 md:grid-cols-2">
          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold">AI Model</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Version</span><span className="font-mono">v2.4.1</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Accuracy</span><span className="font-semibold text-success">94.2%</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last trained</span><span>3 hours ago</span></div>
              <Button className="w-full bg-gradient-primary">Retrain Model</Button>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card">
            <div className="mb-4 flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-accent" />
              <h3 className="font-display text-lg font-bold">Security & Access</h3>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Two-factor authentication</div>
                  <div className="text-xs text-muted-foreground">Require 2FA for all admins</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Audit logging</div>
                  <div className="text-xs text-muted-foreground">Track sensitive actions</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Auto-suspend inactive (90d)</div>
                  <div className="text-xs text-muted-foreground">Disable unused accounts</div>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 shadow-card md:col-span-2">
            <div className="mb-4 flex items-center gap-2">
              <Server className="h-4 w-4 text-primary" />
              <h3 className="font-display text-lg font-bold">System Health</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { label: "API Uptime", value: "99.98%", tone: "text-success" },
                { label: "DB Latency", value: "42ms", tone: "text-primary" },
                { label: "AI Inference", value: "118ms", tone: "text-accent" },
                { label: "Storage Used", value: "62%", tone: "text-warning" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-card/60 p-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground">{m.label}</div>
                  <div className={`mt-1 font-display text-2xl font-bold ${m.tone}`}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* AUDIT */}
        <TabsContent value="audit">
          <div className="glass rounded-2xl p-2 shadow-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map((l, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">{l.who}</TableCell>
                    <TableCell>{l.action}</TableCell>
                    <TableCell><Badge variant="outline" className="capitalize">{l.type}</Badge></TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">{l.when}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create/Edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit user" : "Invite new user"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@school.edu" />
            </div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {roles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} className="bg-gradient-primary">
              {editing ? "Save changes" : "Create user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}