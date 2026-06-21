import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Lang = "en" | "km";

const dict = {
  en: {
    appName: "EduGuard AI",
    tagline: "Early Warning System",
    nav: {
      dashboard: "Dashboard",
      students: "Students",
      predict: "AI Prediction",
      alerts: "Alerts",
      analytics: "Analytics",
      interventions: "Interventions",
      reports: "Reports",
      settings: "Settings",
    },
    kpi: {
      total: "Total Students",
      high: "High Risk",
      medium: "Medium Risk",
      low: "Low Risk",
      attendance: "Attendance Rate",
      avgScore: "Average Score",
    },
    risk: { high: "High Risk", medium: "Medium Risk", low: "Low Risk", safe: "Safe" },
    grades: { g7: "Grade 7", g8: "Grade 8", g9: "Grade 9" },
    dashboard: {
      title: "Smart Dashboard",
      subtitle: "Real-time AI monitoring of student dropout risk",
      trends: "Dropout Risk Trends",
      distribution: "Risk Distribution",
      recentAlerts: "Recent Alerts",
      attendanceTrend: "Attendance by Grade",
      atRisk: "Students Needing Attention",
      viewAll: "View all",
    },
    students: {
      title: "Student Management",
      subtitle: "Monitor, manage and protect every student",
      search: "Search by name, ID, or grade…",
      addStudent: "Add Student",
      name: "Student",
      grade: "Grade",
      attendance: "Attendance",
      score: "Score",
      risk: "Risk",
      actions: "Actions",
      filter: "Filter",
      export: "Export",
    },
    predict: {
      title: "AI Dropout Prediction",
      subtitle: "Enter student factors. Our AI returns risk in real time.",
      run: "Run Prediction",
      reset: "Reset",
      result: "Prediction Result",
      probability: "Risk Probability",
      reasoning: "AI Reasoning",
      recommendation: "Recommended Intervention",
      emptyHint: "Submit the form to see live AI assessment.",
      fields: {
        gender: "Gender",
        male: "Male",
        female: "Female",
        external_support: "External Support",
        through_dropout: "Previously Dropped Out",
        monthly_average_score: "Monthly Average Score",
        work_to_support_family: "Works to Support Family",
        parental_education: "Parental Education Level",
        absence: "Total Absences (days)",
        attendance_day: "Days Attended",
        transport: "Has Transport",
        distance_to_school: "Distance to School (km)",
        living_with: "Living With",
        yes: "Yes",
        no: "No",
        none: "None",
        primary: "Primary",
        secondary: "Secondary",
        higher: "Higher",
        parents: "Both Parents",
        single: "Single Parent",
        relatives: "Relatives",
        alone: "Alone",
      },
    },
    alerts: { title: "Alert Center", subtitle: "Real-time risk and attendance alerts" },
    analytics: { title: "Advanced Analytics", subtitle: "School-wide intelligence" },
    common: { signedInAs: "Signed in as", admin: "Academic Admin" },
  },
  km: {
    appName: "អេឌូហ្គាដ AI",
    tagline: "ប្រព័ន្ធព្រមានទុកមុន",
    nav: {
      dashboard: "ផ្ទាំងគ្រប់គ្រង",
      students: "សិស្ស",
      predict: "ការទស្សន៍ទាយ AI",
      alerts: "ការជូនដំណឹង",
      analytics: "វិភាគទិន្នន័យ",
      interventions: "អន្តរាគមន៍",
      reports: "របាយការណ៍",
      settings: "ការកំណត់",
    },
    kpi: {
      total: "សិស្សសរុប",
      high: "ហានិភ័យខ្ពស់",
      medium: "ហានិភ័យមធ្យម",
      low: "ហានិភ័យទាប",
      attendance: "អត្រាវត្តមាន",
      avgScore: "ពិន្ទុមធ្យម",
    },
    risk: { high: "ហានិភ័យខ្ពស់", medium: "ហានិភ័យមធ្យម", low: "ហានិភ័យទាប", safe: "សុវត្ថិភាព" },
    grades: { g7: "ថ្នាក់ទី៧", g8: "ថ្នាក់ទី៨", g9: "ថ្នាក់ទី៩" },
    dashboard: {
      title: "ផ្ទាំងគ្រប់គ្រងឆ្លាតវៃ",
      subtitle: "តាមដានហានិភ័យបោះបង់ការសិក្សាក្នុងពេលវេលាជាក់ស្តែង",
      trends: "និន្នាការហានិភ័យបោះបង់ការសិក្សា",
      distribution: "ការចែកចាយហានិភ័យ",
      recentAlerts: "ការជូនដំណឹងថ្មីៗ",
      attendanceTrend: "វត្តមានតាមថ្នាក់",
      atRisk: "សិស្សត្រូវការការយកចិត្តទុកដាក់",
      viewAll: "មើលទាំងអស់",
    },
    students: {
      title: "ការគ្រប់គ្រងសិស្ស",
      subtitle: "តាមដាន និងការពារសិស្សគ្រប់រូប",
      search: "ស្វែងរកតាមឈ្មោះ លេខ ឬថ្នាក់…",
      addStudent: "បន្ថែមសិស្ស",
      name: "សិស្ស",
      grade: "ថ្នាក់",
      attendance: "វត្តមាន",
      score: "ពិន្ទុ",
      risk: "ហានិភ័យ",
      actions: "សកម្មភាព",
      filter: "តម្រង",
      export: "នាំចេញ",
    },
    predict: {
      title: "ការទស្សន៍ទាយការបោះបង់ការសិក្សាដោយ AI",
      subtitle: "បំពេញព័ត៌មានសិស្ស។ AI ផ្តល់លទ្ធផលភ្លាមៗ។",
      run: "ដំណើរការទស្សន៍ទាយ",
      reset: "កំណត់ឡើងវិញ",
      result: "លទ្ធផលទស្សន៍ទាយ",
      probability: "ប្រូបាប៊ីលីតេហានិភ័យ",
      reasoning: "ការវិភាគរបស់ AI",
      recommendation: "អន្តរាគមន៍ដែលណែនាំ",
      emptyHint: "ដាក់ស្នើទម្រង់ដើម្បីមើលការវាយតម្លៃរបស់ AI។",
      fields: {
        gender: "ភេទ",
        male: "ប្រុស",
        female: "ស្រី",
        external_support: "ការគាំទ្រខាងក្រៅ",
        through_dropout: "ធ្លាប់បោះបង់ការសិក្សា",
        monthly_average_score: "ពិន្ទុមធ្យមប្រចាំខែ",
        work_to_support_family: "ធ្វើការដើម្បីជួយគ្រួសារ",
        parental_education: "កម្រិតអប់រំឪពុកម្តាយ",
        absence: "ការអវត្តមានសរុប (ថ្ងៃ)",
        attendance_day: "ថ្ងៃចូលរៀន",
        transport: "មានមធ្យោបាយធ្វើដំណើរ",
        distance_to_school: "ចម្ងាយទៅសាលា (គម)",
        living_with: "រស់នៅជាមួយ",
        yes: "បាទ/ចាស",
        no: "ទេ",
        none: "គ្មាន",
        primary: "បឋមសិក្សា",
        secondary: "មធ្យមសិក្សា",
        higher: "ឧត្តមសិក្សា",
        parents: "ឪពុកម្តាយទាំងពីរ",
        single: "ឪពុកម្តាយតែម្នាក់",
        relatives: "សាច់ញាតិ",
        alone: "តែម្នាក់ឯង",
      },
    },
    alerts: { title: "មជ្ឈមណ្ឌលជូនដំណឹង", subtitle: "ការជូនដំណឹងហានិភ័យពេលវេលាជាក់ស្តែង" },
    analytics: { title: "វិភាគកម្រិតខ្ពស់", subtitle: "ភាពឆ្លាតវៃទូទាំងសាលា" },
    common: { signedInAs: "ចូលក្នុងនាម", admin: "អ្នកគ្រប់គ្រងសិក្សា" },
  },
} as const;

type Dict = (typeof dict)["en"];

const I18nCtx = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: Dict }>({
  lang: "en",
  setLang: () => {},
  t: dict.en,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  useEffect(() => {
    const saved = (typeof localStorage !== "undefined" && localStorage.getItem("lang")) as Lang | null;
    if (saved === "en" || saved === "km") setLang(saved);
  }, []);
  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang;
    if (typeof localStorage !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);
  return <I18nCtx.Provider value={{ lang, setLang, t: dict[lang] as Dict }}>{children}</I18nCtx.Provider>;
}

export const useI18n = () => useContext(I18nCtx);