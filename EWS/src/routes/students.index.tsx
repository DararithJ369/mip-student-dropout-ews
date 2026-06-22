import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, Download, Plus, Loader2, X, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { getStudents, addStudent } from "@/lib/api";

export const Route = createFileRoute("/students/")({ component: StudentsPage });

const riskColors: Record<string, string> = {
  low: "oklch(0.65 0.17 155)",
  medium: "oklch(0.78 0.16 75)",
  high: "oklch(0.62 0.22 25)",
};

function StudentsPage() {
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [risk, setRisk] = useState<string>("all");
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form modal state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Add student form state
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(7);
  const [gender, setGender] = useState("Female");
  const [age, setAge] = useState(16);
  const [province, setProvince] = useState("Kampot");
  const [livingWith, setLivingWith] = useState("Both parents");
  const [distance, setDistance] = useState("between 1km-5km");
  const [transport, setTransport] = useState("Motorbike");
  const [attendance, setAttendance] = useState("5 - 6 days");
  const [monthlyAverage, setMonthlyAverage] = useState("Between 25.00 to 40.00");
  const [absence, setAbsence] = useState("Sometimes");
  const [parentalEducation, setParentalEducation] = useState("Secondary School");
  const [familyIncome, setFamilyIncome] = useState("Medium");
  const [workSupport, setWorkSupport] = useState("No");
  const [externalSupport, setExternalSupport] = useState("No");

  const fetchStudentsList = async () => {
    setLoading(true);
    try {
      const data = await getStudents(q, risk);
      setStudentsList(data);
      setError(null);
    } catch (e: any) {
      console.error(e);
      setError("Failed to fetch students. Ensure the backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsList();
    setCurrentPage(1);
  }, [q, risk]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError("Name is required");
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      await addStudent({
        name,
        grade,
        gender,
        age,
        province,
        living_with: livingWith,
        distance,
        transport,
        attendance,
        monthly_average: monthlyAverage,
        absence,
        parental_education: parentalEducation,
        family_income: familyIncome,
        work_support: workSupport,
        external_support: externalSupport,
      });
      setIsAddOpen(false);
      setName("");
      fetchStudentsList();
    } catch (err: any) {
      console.error(err);
      setFormError(err.message || "Failed to add student. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExport = () => {
    if (!studentsList.length) return;
    const headers = ["ID", "Name", "Grade", "Gender", "Attendance Rate", "Score", "Risk Level"];
    const rows = studentsList.map(s => [s.id, s.name, `G${s.grade}`, s.gender, `${s.attendance}%`, s.score, s.risk]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "students_risk_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Pagination Calculations
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedStudents = studentsList.slice(startIndex, endIndex);
  const totalPages = Math.ceil(studentsList.length / pageSize);

  const pgText = lang === "km" ? {
    show: "បង្ហាញ:",
    showing: "បង្ហាញពី",
    to: "ដល់",
    of: "នៃសិស្សសរុប",
    students: "នាក់",
    prev: "មុន",
    next: "បន្ទាប់"
  } : {
    show: "Show:",
    showing: "Showing",
    to: "to",
    of: "of",
    students: "students",
    prev: "Previous",
    next: "Next"
  };

  return (
    <AppLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{t.students.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t.students.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handleExport}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm font-medium hover:border-primary cursor-pointer"
          >
            <Download className="h-4 w-4" /> {t.students.export}
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-glow cursor-pointer"
          >
            <Plus className="h-4 w-4" /> {t.students.addStudent}
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.students.search}
            className="h-10 min-w-[240px] flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <div className="flex gap-1 rounded-xl border border-border bg-background p-1">
            {["all", "high", "medium", "low"].map(r => (
              <button
                key={r}
                onClick={() => setRisk(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  risk === r ? "bg-gradient-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r === "all" ? "All" : t.risk[r as "low" | "medium" | "high"]}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger animate-in fade-in-50">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {loading ? (
          <div className="flex h-40 flex-col items-center justify-center text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Loading student database...</p>
          </div>
        ) : studentsList.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-background/40">
            <p className="text-sm text-muted-foreground">No students match your query.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 pr-3">{t.students.name}</th>
                    <th className="py-3 pr-3">ID</th>
                    <th className="py-3 pr-3">{t.students.grade}</th>
                    <th className="py-3 pr-3">{t.students.attendance}</th>
                    <th className="py-3 pr-3">{t.students.score}</th>
                    <th className="py-3 pr-3">{t.students.risk}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStudents.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="cursor-pointer border-b border-border/60 hover:bg-background/40"
                      onClick={() => navigate({ to: "/students/$id", params: { id: s.id } })}
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-xs font-bold text-primary-foreground">
                            {s.avatar}
                          </div>
                          <div>
                            <Link to="/students/$id" params={{ id: s.id }} className="font-semibold hover:text-primary" onClick={(e) => e.stopPropagation()}>
                              {s.name}
                            </Link>
                            <div className="text-xs text-muted-foreground">{s.gender === "M" ? "Male" : "Female"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-muted-foreground">{s.id}</td>
                      <td className="py-3 pr-3">G{s.grade}</td>
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-secondary">
                            <div className="h-full bg-gradient-primary" style={{ width: `${s.attendance}%` }} />
                          </div>
                          <span className="text-xs">{s.attendance}%</span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 font-medium">{s.score}</td>
                      <td className="py-3 pr-3">
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ background: riskColors[s.risk] }}
                        >
                          {t.risk[s.risk]}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {studentsList.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-4 text-sm text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <div className="flex items-center gap-2">
                    <span>{pgText.show}</span>
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 rounded-lg border border-border bg-background px-2 text-xs outline-none focus:border-primary cursor-pointer transition-colors"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                  <div>
                    {pgText.showing} <span className="font-semibold text-foreground">{startIndex + 1}</span> {pgText.to}{" "}
                    <span className="font-semibold text-foreground">
                      {Math.min(endIndex, studentsList.length)}
                    </span>{" "}
                    {pgText.of} <span className="font-semibold text-foreground">{studentsList.length}</span> {pgText.students}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:border-primary disabled:opacity-40 disabled:hover:border-border cursor-pointer transition-colors"
                    title={pgText.prev}
                  >
                    <ChevronLeft className="h-4 w-4 text-foreground" />
                  </button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`grid h-9 w-9 place-items-center rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                          currentPage === page
                            ? "bg-gradient-primary text-primary-foreground font-bold shadow-glow"
                            : "border border-border bg-background hover:border-primary"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background hover:border-primary disabled:opacity-40 disabled:hover:border-border cursor-pointer transition-colors"
                    title={pgText.next}
                  >
                    <ChevronRight className="h-4 w-4 text-foreground" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Elegant Add Student Modal */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsAddOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative z-10 w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-glow"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-xl font-bold">Register New Student</h3>
                <button 
                  onClick={() => setIsAddOpen(false)}
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

              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full Name">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Chan Sopheak"
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </Field>

                  <Field label="Grade Level">
                    <select
                      value={grade}
                      onChange={(e) => setGrade(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value={7}>Grade 7</option>
                      <option value={8}>Grade 8</option>
                      <option value={9}>Grade 9</option>
                    </select>
                  </Field>

                  <Field label="Gender">
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
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
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    />
                  </Field>

                  <Field label="Province">
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
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
                      value={livingWith}
                      onChange={(e) => setLivingWith(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Both parents">Both parents</option>
                      <option value="One parent">One parent</option>
                      <option value="Guardians/Relatives">Guardians/Relatives</option>
                    </select>
                  </Field>

                  <Field label="Distance to School">
                    <select
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Less than 1km">Less than 1km</option>
                      <option value="between 1km-5km">1km - 5km</option>
                      <option value="More than 5km">More than 5km</option>
                    </select>
                  </Field>

                  <Field label="Means of Transport">
                    <select
                      value={transport}
                      onChange={(e) => setTransport(e.target.value)}
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
                      value={attendance}
                      onChange={(e) => setAttendance(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="5 - 6 days">5 - 6 days / week</option>
                      <option value="3 -4 days">3 - 4 days / week</option>
                      <option value="0 - 2 days">0 - 2 days / week</option>
                    </select>
                  </Field>

                  <Field label="Monthly Study Average">
                    <select
                      value={monthlyAverage}
                      onChange={(e) => setMonthlyAverage(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="More than 40.00">High (&gt; 40.00)</option>
                      <option value="Between 25.00 to 40.00">Medium (25.00 - 40.00)</option>
                      <option value="Less than 25.00">Low (&lt; 25.00)</option>
                    </select>
                  </Field>

                  <Field label="Absence Frequency">
                    <select
                      value={absence}
                      onChange={(e) => setAbsence(e.target.value)}
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
                      value={parentalEducation}
                      onChange={(e) => setParentalEducation(e.target.value)}
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
                      value={familyIncome}
                      onChange={(e) => setFamilyIncome(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </Field>

                  <Field label="Work to Support Family">
                    <select
                      value={workSupport}
                      onChange={(e) => setWorkSupport(e.target.value)}
                      className="h-10 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </Field>

                  <Field label="External Financial Support">
                    <select
                      value={externalSupport}
                      onChange={(e) => setExternalSupport(e.target.value)}
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
                    onClick={() => setIsAddOpen(false)}
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
                    Save Student
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
