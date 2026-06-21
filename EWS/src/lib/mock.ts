export type Risk = "low" | "medium" | "high";

export interface Student {
  id: string;
  name: string;
  grade: 7 | 8 | 9;
  gender: "M" | "F";
  attendance: number; // %
  score: number; // 0-100
  risk: Risk;
  avatar: string;
}

const names = [
  "Sok Pisey", "Chan Dara", "Ratha Mey", "Vannak Heng", "Bopha Lim",
  "Sokha Kim", "Sothea Nov", "Channary Pen", "Kosal Tep", "Mealea Sun",
  "Phally Rin", "Sokunthea Va", "Borey Chea", "Sreyleak Ouk", "Visal Kong",
  "Theary Mok", "Rithy Sam", "Dara Suon", "Nita Por", "Sopheak Yim",
];

function riskFrom(att: number, score: number): Risk {
  const r = (100 - att) * 0.6 + (100 - score) * 0.6;
  if (r > 55) return "high";
  if (r > 30) return "medium";
  return "low";
}

export const students: Student[] = names.map((n, i) => {
  const attendance = Math.round(60 + Math.random() * 39);
  const score = Math.round(45 + Math.random() * 50);
  const grade = ((i % 3) + 7) as 7 | 8 | 9;
  return {
    id: `STU-${(1000 + i).toString()}`,
    name: n,
    grade,
    gender: i % 2 === 0 ? "M" : "F",
    attendance,
    score,
    risk: riskFrom(attendance, score),
    avatar: n.split(" ").map(p => p[0]).join(""),
  };
});

export const kpis = {
  total: students.length + 1234,
  high: students.filter(s => s.risk === "high").length + 38,
  medium: students.filter(s => s.risk === "medium").length + 124,
  low: students.filter(s => s.risk === "low").length + 1072,
  attendance: 91.4,
  avgScore: 76.2,
};

export const trendData = [
  { month: "Jan", high: 42, medium: 110, low: 1080 },
  { month: "Feb", high: 48, medium: 118, low: 1062 },
  { month: "Mar", high: 54, medium: 125, low: 1045 },
  { month: "Apr", high: 51, medium: 121, low: 1054 },
  { month: "May", high: 45, medium: 128, low: 1063 },
  { month: "Jun", high: 39, medium: 124, low: 1072 },
  { month: "Jul", high: 38, medium: 124, low: 1078 },
];

export const attendanceByGrade = [
  { grade: "G7", rate: 93.1 },
  { grade: "G8", rate: 90.7 },
  { grade: "G9", rate: 88.4 },
];

export const distribution = [
  { name: "low", value: kpis.low },
  { name: "medium", value: kpis.medium },
  { name: "high", value: kpis.high },
];

export const alerts = [
  { id: 1, student: "Sok Pisey", message: "5 consecutive absences this week", severity: "high", time: "2m ago" },
  { id: 2, student: "Visal Kong", message: "Score dropped 18 points", severity: "high", time: "12m ago" },
  { id: 3, student: "Bopha Lim", message: "Attendance below 75%", severity: "medium", time: "1h ago" },
  { id: 4, student: "Kosal Tep", message: "Missed scheduled counseling", severity: "medium", time: "3h ago" },
  { id: 5, student: "Nita Por", message: "Family support flag raised", severity: "low", time: "1d ago" },
];