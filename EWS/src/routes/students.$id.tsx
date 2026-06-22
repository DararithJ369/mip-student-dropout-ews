import { createFileRoute, Link, useParams, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, GraduationCap, TrendingUp,
  TrendingDown, Award, BookOpen, Users, Heart, AlertTriangle, Sparkles,
  Clock, Target, Activity, MessageSquare, Download, Edit3, Loader2, AlertCircle, Plus, X, Trash2
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from "recharts";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { getStudentById, addIntervention, updateStudent, deleteStudent } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/students/$id")({ component: StudentProfile });

const riskMeta: Record<string, { label: string; bg: string; ring: string; text: string }> = {
  "low risk":    { label: "Low Risk",    bg: "bg-gradient-success", ring: "ring-emerald-500/40", text: "text-emerald-400" },
  "medium risk": { label: "Medium Risk", bg: "bg-gradient-warning", ring: "ring-amber-500/40",   text: "text-amber-400" },
  "high risk":   { label: "High Risk",   bg: "bg-gradient-danger",  ring: "ring-rose-500/40",    text: "text-rose-400" },
};

function StudentProfile() {
  const { id } = useParams({ from: "/students/$id" });
  const navigate = useNavigate();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Intervention modal state
  const [isIntervOpen, setIsIntervOpen] = useState(false);
  const [action, setAction] = useState("");
  const [severity, setSeverity] = useState("medium");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Edit student modal state
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editGrade, setEditGrade] = useState(7);
  const [editGender, setEditGender] = useState("Female");
  const [editAge, setEditAge] = useState(16);
  const [editProvince, setEditProvince] = useState("Kampot");
  const [editLivingWith, setEditLivingWith] = useState("Both parents");
  const [editDistance, setEditDistance] = useState("between 1km-5km");
  const [editTransport, setEditTransport] = useState("Motorbike");
  const [editAttendance, setEditAttendance] = useState("5 - 6 days");
  const [editMonthlyAverage, setEditMonthlyAverage] = useState("Between 25.00 to 40.00");
  const [editAbsence, setEditAbsence] = useState("Sometimes");
  const [editParentalEducation, setEditParentalEducation] = useState("Secondary School");
  const [editFamilyIncome, setEditFamilyIncome] = useState("Medium");
  const [editWorkSupport, setEditWorkSupport] = useState("No");
  const [editExternalSupport, setEditExternalSupport] = useState("No");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const data = await getStudentById(id);
      setStudent(data);
      setError(null);
      
      // Initialize edit fields
      setEditName(data.name);
      setEditGrade(data.grade);
      setEditGender(data.gender);
      setEditAge(data.age);
      setEditProvince(data.province);
      setEditLivingWith(data.living_with);
      setEditDistance(data.distance);
      setEditTransport(data.transport);
      setEditAttendance(data.attendance);
      setEditMonthlyAverage(data.monthly_average);
      setEditAbsence(data.absence);
      setEditParentalEducation(data.parental_education);
      setEditFamilyIncome(data.family_income);
      setEditWorkSupport(data.work_support);
      setEditExternalSupport(data.external_support);
    } catch (e: any) {
      console.error(e);
      setError("Failed to load student details. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [id]);

  const handleAddIntervention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) {
      setFormError("Action description is required");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addIntervention({
        student_id: id,
        action,
        severity,
        notes,
        assigned_by: localStorage.getItem("ews_user_name") || "Counselor",
      });
      setIsIntervOpen(false);
      setAction("");
      setNotes("");
      fetchStudentData();
      toast.success("Intervention assigned successfully!");
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to log intervention.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError("Name is required");
      return;
    }
    setEditSubmitting(true);
    setEditError(null);
    try {
      await updateStudent(id, {
        name: editName,
        grade: editGrade,
        gender: editGender,
        age: editAge,
        province: editProvince,
        living_with: editLivingWith,
        distance: editDistance,
        transport: editTransport,
        attendance: editAttendance,
        monthly_average: editMonthlyAverage,
        absence: editAbsence,
        parental_education: editParentalEducation,
        family_income: editFamilyIncome,
        work_support: editWorkSupport,
        external_support: editExternalSupport,
      });
      setIsEditOpen(false);
      fetchStudentData();
      toast.success("Student profile updated successfully!");
    } catch (err: any) {
      console.error(err);
      setEditError(err.message || "Failed to update profile.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteStudent(id);
      setIsDeleteConfirmOpen(false);
      toast.success("Student deleted successfully!");
      navigate({ to: "/students" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete student.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex h-80 flex-col items-center justify-center text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading student profile...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !student) {
    return (
      <AppLayout>
        <Link to="/students" className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to students
        </Link>
        <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-danger/20 bg-danger/10 text-danger">
          <AlertCircle className="h-10 w-10 mb-2" />
          <p className="font-semibold">{error || "Student profile not found."}</p>
        </div>
      </AppLayout>
    );
  }

  const rKey = (student.risk_level || "Low Risk").toLowerCase();
  const r = riskMeta[rKey] || riskMeta["low risk"];
  const attRate = student.attendance_rate || 90;
  const scoreVal = student.score || 75;

  const trend = Array.from({ length: 8 }).map((_, i) => ({
    week: `W${i + 1}`,
    score: Math.max(40, Math.min(100, Math.round(scoreVal + Math.sin(i) * 8 + (Math.random() - 0.5) * 6))),
    attendance: Math.max(50, Math.min(100, Math.round(attRate + Math.cos(i) * 5 + (Math.random() - 0.5) * 4))),
  }));

  const radar = [
    { k: "Math", v: Math.round(scoreVal - 5) },
    { k: "Science", v: Math.round(scoreVal - 8) },
    { k: "English", v: Math.round(scoreVal - 3) },
    { k: "History", v: Math.round(scoreVal + 2) },
    { k: "Art", v: Math.round(75) },
    { k: "PE", v: Math.round(80) },
  ];

  const avatar = student.name.split(" ").map((n: string) => n[0]).join("");

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

        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar with halo */}
            <div className="relative">
              <div className={`absolute inset-0 rounded-3xl ${r.bg} opacity-60 blur-xl`} />
              <div className={`relative grid h-24 w-24 place-items-center rounded-3xl ${r.bg} text-3xl font-bold text-white shadow-glow ring-4 ${r.ring}`}>
                {avatar}
              </div>
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
                <span className="inline-flex items-center gap-1.5">{student.gender}</span>
                <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" /> {student.province}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => setIsEditOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-4 text-sm font-medium hover:border-primary cursor-pointer"
            >
              <Edit3 className="h-4 w-4" /> Edit Profile
            </button>
            <button 
              onClick={() => setIsDeleteConfirmOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl border border-danger/20 bg-danger/10 text-danger px-4 text-sm font-semibold hover:bg-danger/20 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" /> Delete Student
            </button>
            <button 
              onClick={() => setIsIntervOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-1.5 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Log Intervention
            </button>
          </div>
        </div>

        {/* Quick stats */}
        <div className="relative mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Attendance", value: `${Math.round(attRate)}%`, icon: Activity },
            { label: "Avg. Score", value: Math.round(scoreVal), icon: Target },
            { label: "Dropout Probability", value: `${Math.round(student.dropout_probability * 100)}%`, icon: AlertTriangle },
            { label: "Risk Category", value: student.risk_level, icon: Sparkles },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-background/40 p-4 backdrop-blur">
              <div className="flex items-center justify-between">
                <s.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="mt-2 text-[11px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
              <div className="font-display text-2xl font-bold">{s.value}</div>
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
              <h3 className="font-display text-lg font-bold">AI Risk Factors Explanations (SHAP)</h3>
              <p className="text-xs text-muted-foreground">EduGuard ML Explainer</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm leading-relaxed text-foreground/90">
              {student.name} shows a <span className={`font-semibold ${r.text}`}>{r.label.toLowerCase()}</span> risk profile. 
              {student.top_risk_factors && student.top_risk_factors.length > 0 ? (
                <> The machine learning model identified the following active risk factors driving this prediction:</>
              ) : (
                <> All student indices are currently in the healthy range, indicating low risk of school dropout.</>
              )}
            </p>
            {student.top_risk_factors && student.top_risk_factors.length > 0 && (
              <ul className="mt-3 space-y-2">
                {student.top_risk_factors.map((factor: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-rose-400">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                    {factor}
                  </li>
                ))}
              </ul>
            )}
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
              <div className="text-sm">{student.province}, Cambodia</div>
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
          <h3 className="font-display text-lg font-bold">Interventions & Actions Log</h3>
          <p className="text-xs text-muted-foreground">Assigned interventions from database</p>
          
          {student.interventions && student.interventions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-background/20 p-6 text-center text-sm text-muted-foreground">
              No active interventions logged. Click "Log Intervention" to assign one.
            </div>
          ) : (
            <ol className="relative mt-5 space-y-4 border-l border-border pl-6">
              {student.interventions && student.interventions.map((e: any, i: number) => {
                const tone =
                  e.severity === "high" ? "bg-gradient-danger" :
                  e.severity === "medium" ? "bg-gradient-warning" : "bg-gradient-success";
                return (
                  <motion.li
                    key={e.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 * i }}
                    className="relative"
                  >
                    <span className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full ${tone} text-white shadow-glow ring-4 ring-card`}>
                      <Activity className="h-3.5 w-3.5" />
                    </span>
                    <div className="rounded-xl border border-border bg-background/40 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-semibold">{e.action}</div>
                        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> {e.assigned_date}
                        </div>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Assigned by: <span className="font-medium text-foreground">{e.assigned_by}</span> | Status: <span className="font-semibold uppercase tracking-wider text-accent">{e.status}</span>
                      </div>
                      {e.notes && (
                        <div className="mt-2 rounded-lg bg-background/30 p-2 text-xs leading-relaxed text-muted-foreground border border-border/40">
                          {e.notes}
                        </div>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ol>
          )}
        </motion.div>
      </div>

      {/* Log Intervention Modal */}
      <AnimatePresence>
        {isIntervOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsIntervOpen(false)}
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
                  onClick={() => setIsIntervOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {formError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>{formError}</div>
                </div>
              )}

              <form onSubmit={handleAddIntervention} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Intervention Action
                  </label>
                  <input
                    type="text"
                    required
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="e.g. Schedule counselor session"
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Severity / Priority
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Detailed Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide context or instructions..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsIntervOpen(false)}
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
                    Assign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteConfirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsDeleteConfirmOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <div className="mb-4">
                <h3 className="font-display text-xl font-bold">Delete Student Record?</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  This will permanently delete the record for <strong>{student.name}</strong> and all linked intervention plans.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  disabled={deleting}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-secondary cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-danger text-white px-5 text-sm font-semibold shadow-glow cursor-pointer disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Delete Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Student Modal */}
      <AnimatePresence>
        {isEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsEditOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Edit Student Profile</h3>
                <button 
                  onClick={() => setIsEditOpen(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-secondary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {editError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-3 text-sm text-danger">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <div>{editError}</div>
                </div>
              )}

              <form onSubmit={handleEditStudent} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. Chan Sopheak"
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </Field>

                  <Field label="Grade Level">
                    <select
                      value={editGrade}
                      onChange={(e) => setEditGrade(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value={7}>Grade 7</option>
                      <option value={8}>Grade 8</option>
                      <option value={9}>Grade 9</option>
                    </select>
                  </Field>

                  <Field label="Gender">
                    <select
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </Field>

                  <Field label="Age (years)">
                    <input
                      type="number"
                      required
                      min={10}
                      max={25}
                      value={editAge}
                      onChange={(e) => setEditAge(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </Field>

                  <Field label="Province">
                    <select
                      value={editProvince}
                      onChange={(e) => setEditProvince(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Phnom Penh">Phnom Penh</option>
                      <option value="Kandal">Kandal</option>
                      <option value="Kampot">Kampot</option>
                      <option value="Takeo">Takeo</option>
                      <option value="Battambang">Battambang</option>
                      <option value="Kampong Cham">Kampong Cham</option>
                      <option value="Siem Reap">Siem Reap</option>
                      <option value="Prey Veng">Prey Veng</option>
                    </select>
                  </Field>

                  <Field label="Living With">
                    <select
                      value={editLivingWith}
                      onChange={(e) => setEditLivingWith(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Both parents">Both parents</option>
                      <option value="One parent">One parent</option>
                      <option value="Guardians/Relatives">Guardians/Relatives</option>
                    </select>
                  </Field>

                  <Field label="Distance to School">
                    <select
                      value={editDistance}
                      onChange={(e) => setEditDistance(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Less than 1km">Less than 1km</option>
                      <option value="between 1km-5km">1km - 5km</option>
                      <option value="More than 5km">More than 5km</option>
                    </select>
                  </Field>

                  <Field label="Means of Transport">
                    <select
                      value={editTransport}
                      onChange={(e) => setEditTransport(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Motorbike">Motorbike</option>
                      <option value="Bicycle">Bicycle</option>
                      <option value="Walk">Walk</option>
                      <option value="Car">Car</option>
                    </select>
                  </Field>

                  <Field label="Weekly Attendance">
                    <select
                      value={editAttendance}
                      onChange={(e) => setEditAttendance(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="5 - 6 days">5 - 6 days / week</option>
                      <option value="3 -4 days">3 - 4 days / week</option>
                      <option value="0 - 2 days">0 - 2 days / week</option>
                    </select>
                  </Field>

                  <Field label="Monthly Study Average">
                    <select
                      value={editMonthlyAverage}
                      onChange={(e) => setEditMonthlyAverage(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="More than 40.00">High (&gt; 40.00)</option>
                      <option value="Between 25.00 to 40.00">Medium (25.00 - 40.00)</option>
                      <option value="Less than 25.00">Low (&lt; 25.00)</option>
                    </select>
                  </Field>

                  <Field label="Absence Frequency">
                    <select
                      value={editAbsence}
                      onChange={(e) => setEditAbsence(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Never">Never</option>
                      <option value="Rarely">Rarely</option>
                      <option value="Sometimes">Sometimes</option>
                      <option value="Often">Often</option>
                    </select>
                  </Field>

                  <Field label="Parental Education">
                    <select
                      value={editParentalEducation}
                      onChange={(e) => setEditParentalEducation(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="No education">No education</option>
                      <option value="Primary school">Primary school</option>
                      <option value="Secondary School">Secondary school</option>
                      <option value="High School">High school</option>
                      <option value="Higher education">Higher education</option>
                    </select>
                  </Field>

                  <Field label="Family Income Level">
                    <select
                      value={editFamilyIncome}
                      onChange={(e) => setEditFamilyIncome(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </Field>

                  <Field label="Work to Support Family">
                    <select
                      value={editWorkSupport}
                      onChange={(e) => setEditWorkSupport(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </Field>

                  <Field label="External Financial Support">
                    <select
                      value={editExternalSupport}
                      onChange={(e) => setEditExternalSupport(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </Field>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3 border-t border-border pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    disabled={editSubmitting}
                    className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium hover:bg-secondary cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editSubmitting}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-gradient-primary px-5 text-sm font-semibold text-primary-foreground shadow-glow cursor-pointer disabled:opacity-50"
                  >
                    {editSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Save Profile
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}