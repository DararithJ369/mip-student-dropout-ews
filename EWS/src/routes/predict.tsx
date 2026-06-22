import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, RotateCcw, AlertTriangle, ShieldCheck, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { useI18n } from "@/lib/i18n";
import { getApiUrl } from "@/lib/api";


export const Route = createFileRoute("/predict")({ component: PredictPage });

interface Form {
  gender: "Male" | "Female" | "Other";
  age: number;
  province:
    | "Phnom Penh"
    | "Kandal"
    | "Kampot"
    | "Takeo"
    | "Battambang"
    | "Kampong Cham"
    | "Siem Reap"
    | "Prey Veng"
    | "Banteay Meanchey"
    | "Kampong Thom"
    | "Pursat"
    | "Svay Rieng"
    | "Kep"
    | "Koh Kong";
  living_with: "Both parents" | "One parent" | "Guardians/Relatives";
  distance: "Less than 1km" | "between 1km-5km" | "More than 5km";
  transport: "Motorbike" | "Bicycle" | "Walk" | "Car";
  attendance: "0 - 2 days" | "3 -4 days" | "5 - 6 days";
  monthly_average: "Less than 25.00" | "Between 25.00 to 40.00" | "More than 40.00";
  absence: "Never" | "Rarely" | "Sometimes" | "Often";
  parental_education: "No education" | "Primary school" | "Secondary School" | "High School" | "Higher education";
  family_income: "Low" | "Medium";
  work_support: "Yes" | "No";
  external_support: "Yes" | "No";
}

const initial: Form = {
  gender: "Male",
  age: 16,
  province: "Kampot",
  living_with: "Both parents",
  distance: "between 1km-5km",
  transport: "Motorbike",
  attendance: "5 - 6 days",
  monthly_average: "Between 25.00 to 40.00",
  absence: "Sometimes",
  parental_education: "Secondary School",
  family_income: "Medium",
  work_support: "No",
  external_support: "No",
};

interface PredictResult {
  probability: number;
  level: "low" | "medium" | "high";
  reasons: string[];
  recommendation: string;
}

const factorTranslations: Record<string, Record<"en" | "km", string>> = {
  "Low attendance quality": {
    en: "Low attendance quality",
    km: "គុណភាពវត្តមានទាប",
  },
  "Low engagement score": {
    en: "Low engagement score",
    km: "ពិន្ទុចូលរួមសិក្សាទាប",
  },
  "Low socioeconomic support": {
    en: "Low socioeconomic support",
    km: "ការគាំទ្រសេដ្ឋកិច្ចសង្គមទាប",
  },
  "Weak support environment": {
    en: "Weak support environment",
    km: "បរិយាកាសគាំទ្រទន់ខ្សោយ",
  },
  "High commute burden": {
    en: "High commute burden",
    km: "បន្ទុកធ្វើដំណើរខ្ពស់",
  },
};

const getRecommendation = (level: "low" | "medium" | "high", lang: "en" | "km") => {
  if (level === "high") {
    return lang === "en"
      ? "Immediate counseling, weekly parent contact, financial-aid review, and after-school academic tutoring."
      : "ការផ្តល់ប្រឹក្សាយោបល់ភ្លាមៗ ការទាក់ទងឪពុកម្តាយរៀងរាល់សប្តាហ៍ ការពិនិត្យឡើងវិញនូវជំនួយហិរញ្ញវត្ថុ និងការបង្រៀនបន្ថែមក្រោយម៉ោងសិក្សា។";
  }
  if (level === "medium") {
    return lang === "en"
      ? "Bi-weekly counselor check-ins, mentor pairing, and targeted academic support in weakest subjects."
      : "ការជួបពិភាក្សាជាមួយគ្រូប្រឹក្សារៀងរាល់ពីរសប្តាហ៍ម្តង ការភ្ជាប់ទំនាក់ទំនងជាមួយអ្នកណែនាំ និងការគាំទ្រការសិក្សាលើមុខវិជ្ជាដែលខ្សោយបំផុត។";
  }
  return lang === "en"
    ? "Continue monitoring. Maintain positive reinforcement and quarterly parent updates."
    : "បន្តតាមដានការសិក្សា។ រក្សាការលើកទឹកចិត្តជាវិជ្ជមាន និងការជួបសំណេះសំណាលជាមួយឪពុកម្តាយរៀងរាល់ត្រីមាស។";
};

function PredictPage() {
  const { t, lang } = useI18n();
  const [form, setForm] = useState<Form>(initial);
  const [result, setResult] = useState<PredictResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  const genderOptions = [
    { value: "Male", label: lang === "en" ? "Male" : "ប្រុស" },
    { value: "Female", label: lang === "en" ? "Female" : "ស្រី" },
    { value: "Other", label: lang === "en" ? "Other" : "ផ្សេងៗ" },
  ];

  const provinceOptions = [
    { value: "Phnom Penh", label: lang === "en" ? "Phnom Penh" : "ភ្នំពេញ" },
    { value: "Kandal", label: lang === "en" ? "Kandal" : "កណ្តាល" },
    { value: "Kampot", label: lang === "en" ? "Kampot" : "កំពត" },
    { value: "Takeo", label: lang === "en" ? "Takeo" : "តាកែវ" },
    { value: "Battambang", label: lang === "en" ? "Battambang" : "បាត់ដំបង" },
    { value: "Kampong Cham", label: lang === "en" ? "Kampong Cham" : "កំពង់ចាម" },
    { value: "Siem Reap", label: lang === "en" ? "Siem Reap" : "សៀមរាប" },
    { value: "Prey Veng", label: lang === "en" ? "Prey Veng" : "ព្រៃវែង" },
    { value: "Banteay Meanchey", label: lang === "en" ? "Banteay Meanchey" : "បន្ទាយមានជ័យ" },
    { value: "Kampong Thom", label: lang === "en" ? "Kampong Thom" : "កំពង់ធំ" },
    { value: "Pursat", label: lang === "en" ? "Pursat" : "ពោធិ៍សាត់" },
    { value: "Svay Rieng", label: lang === "en" ? "Svay Rieng" : "ស្វាយរៀង" },
    { value: "Kep", label: lang === "en" ? "Kep" : "កែប" },
    { value: "Koh Kong", label: lang === "en" ? "Koh Kong" : "កោះកុង" },
  ];

  const livingWithOptions = [
    { value: "Both parents", label: lang === "en" ? "Both Parents" : "ឪពុកម្តាយទាំងពីរ" },
    { value: "One parent", label: lang === "en" ? "Single Parent" : "ឪពុកម្តាយតែម្នាក់" },
    { value: "Guardians/Relatives", label: lang === "en" ? "Guardians/Relatives" : "អាណាព្យាបាល/សាច់ញាតិ" },
  ];

  const distanceOptions = [
    { value: "Less than 1km", label: lang === "en" ? "Less than 1km" : "តិចជាង ១គីឡូម៉ែត្រ" },
    { value: "between 1km-5km", label: lang === "en" ? "1km - 5km" : "ចន្លោះ ១-៥គីឡូម៉ែត្រ" },
    { value: "More than 5km", label: lang === "en" ? "More than 5km" : "ច្រើនជាង ៥គីឡូម៉ែត្រ" },
  ];

  const transportOptions = [
    { value: "Motorbike", label: lang === "en" ? "Motorbike" : "ម៉ូតូ" },
    { value: "Bicycle", label: lang === "en" ? "Bicycle" : "កង់" },
    { value: "Walk", label: lang === "en" ? "Walk" : "ដើរ" },
    { value: "Car", label: lang === "en" ? "Car" : "ឡាន" },
  ];

  const attendanceOptions = [
    { value: "5 - 6 days", label: lang === "en" ? "5 - 6 days / week" : "៥ - ៦ ថ្ងៃក្នុងមួយសប្តាហ៍" },
    { value: "3 -4 days", label: lang === "en" ? "3 - 4 days / week" : "៣ - ៤ ថ្ងៃក្នុងមួយសប្តាហ៍" },
    { value: "0 - 2 days", label: lang === "en" ? "0 - 2 days / week" : "០ - ២ ថ្ងៃក្នុងមួយសប្តាហ៍" },
  ];

  const monthlyAverageOptions = [
    { value: "More than 40.00", label: lang === "en" ? "High (> 40.00)" : "ខ្ពស់ (> ៤០.០០)" },
    { value: "Between 25.00 to 40.00", label: lang === "en" ? "Medium (25.00 - 40.00)" : "មធ្យម (២៥.០០ - ៤០.០០)" },
    { value: "Less than 25.00", label: lang === "en" ? "Low (< 25.00)" : "ទាប (< ២៥.០០)" },
  ];

  const absenceOptions = [
    { value: "Never", label: lang === "en" ? "Never" : "មិនដែល" },
    { value: "Rarely", label: lang === "en" ? "Rarely" : "កម្រ" },
    { value: "Sometimes", label: lang === "en" ? "Sometimes" : "ម្តងម្កាល" },
    { value: "Often", label: lang === "en" ? "Often" : "ញឹកញាប់" },
  ];

  const parentalEducationOptions = [
    { value: "No education", label: lang === "en" ? "No education" : "គ្មានការសិក្សា" },
    { value: "Primary school", label: lang === "en" ? "Primary school" : "បឋមសិក្សា" },
    { value: "Secondary School", label: lang === "en" ? "Secondary School" : "មធ្យមសិក្សា" },
    { value: "High School", label: lang === "en" ? "High School" : "វិទ្យាល័យ" },
    { value: "Higher education", label: lang === "en" ? "Higher education" : "ឧត្តមសិក្សា" },
  ];

  const familyIncomeOptions = [
    { value: "Low", label: lang === "en" ? "Low" : "ទាប" },
    { value: "Medium", label: lang === "en" ? "Medium" : "មធ្យម" },
  ];

  const yesNoOptions = [
    { value: "Yes", label: lang === "en" ? "Yes" : "បាទ/ចាស" },
    { value: "No", label: lang === "en" ? "No" : "ទេ" },
  ];

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl("/predict"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status: ${response.status}`);
      }

      const data = await response.json();
      const probPercent = Math.round(data.dropout_probability * 100);
      const mappedLevel = data.risk_level.toLowerCase().split(" ")[0] as "low" | "medium" | "high";

      // Translate SHAP reasons
      const translatedReasons = data.top_risk_factors.map((f: string) => {
        return factorTranslations[f]?.[lang] || f;
      });

      setResult({
        probability: probPercent,
        level: mappedLevel,
        reasons: translatedReasons.length ? translatedReasons : [lang === "en" ? "All indicators within healthy range." : "សូចនាករទាំងអស់ស្ថិតក្នុងកម្រិតល្អ។"],
        recommendation: getRecommendation(mappedLevel, lang),
      });
    } catch (e: any) {
      console.error(e);
      setError(
        lang === "en"
          ? "Failed to connect to the AI Predictor service. Please ensure the backend server is running and accessible."
          : "មិនអាចភ្ជាប់ទៅសេវាកម្មទស្សន៍ទាយ AI បានទេ។ សូមប្រាកដថាម៉ាស៊ីនមេ backend កំពុងដំណើរការ និងអាចចូលប្រើបាន។"
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-accent">
          <Sparkles className="h-3 w-3 animate-pulse text-primary" /> Powered by EduGuard ML v2.1
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">{t.predict.title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t.predict.subtitle}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Form */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card lg:col-span-3">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t.predict.fields.gender}>
              <Segmented
                value={form.gender}
                onChange={(v) => set("gender", v as Form["gender"])}
                options={genderOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <NumberField
              label={lang === "en" ? "Age (years)" : "អាយុ (ឆ្នាំ)"}
              value={form.age}
              min={10}
              max={25}
              onChange={(v) => set("age", v)}
            />

            <Field label={lang === "en" ? "Province" : "ខេត្ត"}>
              <Select
                value={form.province}
                onChange={(v) => set("province", v as Form["province"])}
                options={provinceOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={t.predict.fields.living_with}>
              <Select
                value={form.living_with}
                onChange={(v) => set("living_with", v as Form["living_with"])}
                options={livingWithOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Distance to School" : "ចម្ងាយទៅសាលារៀន"}>
              <Select
                value={form.distance}
                onChange={(v) => set("distance", v as Form["distance"])}
                options={distanceOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Means of Transport" : "មធ្យោបាយធ្វើដំណើរ"}>
              <Select
                value={form.transport}
                onChange={(v) => set("transport", v as Form["transport"])}
                options={transportOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Weekly Attendance" : "វត្តមានប្រចាំសប្តាហ៍"}>
              <Segmented
                value={form.attendance}
                onChange={(v) => set("attendance", v as Form["attendance"])}
                options={attendanceOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Monthly Study Average" : "មធ្យមភាគការសិក្សាប្រចាំខែ"}>
              <Select
                value={form.monthly_average}
                onChange={(v) => set("monthly_average", v as Form["monthly_average"])}
                options={monthlyAverageOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Absence Frequency" : "ភាពញឹកញាប់នៃការឈប់រៀន"}>
              <Segmented
                value={form.absence}
                onChange={(v) => set("absence", v as Form["absence"])}
                options={absenceOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={t.predict.fields.parental_education}>
              <Select
                value={form.parental_education}
                onChange={(v) => set("parental_education", v as Form["parental_education"])}
                options={parentalEducationOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={lang === "en" ? "Family Income Level" : "កម្រិតជីវភាពគ្រួសារ"}>
              <Segmented
                value={form.family_income}
                onChange={(v) => set("family_income", v as Form["family_income"])}
                options={familyIncomeOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={t.predict.fields.work_to_support_family}>
              <Segmented
                value={form.work_support}
                onChange={(v) => set("work_support", v as Form["work_support"])}
                options={yesNoOptions.map((o) => [o.value, o.label])}
              />
            </Field>

            <Field label={t.predict.fields.external_support}>
              <Segmented
                value={form.external_support}
                onChange={(v) => set("external_support", v as Form["external_support"])}
                options={yesNoOptions.map((o) => [o.value, o.label])}
              />
            </Field>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handlePredict}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-75"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              {t.predict.run}
            </button>
            <button
              onClick={() => {
                setForm(initial);
                setResult(null);
                setError(null);
              }}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium hover:border-primary disabled:opacity-75"
            >
              <RotateCcw className="h-4 w-4" /> {t.predict.reset}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="lg:col-span-2">
          {error && (
            <div className="mb-4 rounded-xl border border-danger/20 bg-danger/10 p-4 text-sm text-danger flex items-start gap-2 animate-in fade-in-50">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}
          <ResultPanel
            result={result}
            emptyHint={t.predict.emptyHint}
            loading={loading}
            labels={{
              result: t.predict.result,
              probability: t.predict.probability,
              reasoning: t.predict.reasoning,
              recommendation: t.predict.recommendation,
              riskLabels: t.risk,
            }}
          />
        </div>
      </div>
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

function Segmented({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl border border-border bg-background p-1">
      {options.map(([v, l]) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex-1 min-w-[70px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            value === v
              ? "bg-gradient-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v}>
          {l}
        </option>
      ))}
    </select>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step ?? 1}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
      />
    </Field>
  );
}

function ResultPanel({
  result,
  emptyHint,
  loading,
  labels,
}: {
  result: PredictResult | null;
  emptyHint: string;
  loading: boolean;
  labels: {
    result: string;
    probability: string;
    reasoning: string;
    recommendation: string;
    riskLabels: Record<string, string>;
  };
}) {
  const colorMap = {
    low: {
      bg: "bg-gradient-success",
      text: "text-muted-foreground",
      ring: "stroke-[oklch(0.65_0.17_155)]",
      icon: ShieldCheck,
    },
    medium: {
      bg: "bg-gradient-warning",
      text: "text-foreground",
      ring: "stroke-[oklch(0.78_0.16_75)]",
      icon: AlertCircle,
    },
    high: {
      bg: "bg-gradient-danger",
      text: "text-foreground",
      ring: "stroke-[oklch(0.62_0.22_25)]",
      icon: AlertTriangle,
    },
  } as const;

  return (
    <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-card">
      <h3 className="font-display text-lg font-semibold">{labels.result}</h3>
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-col items-center justify-center p-10 text-center"
          >
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">AI is processing student factors...</p>
          </motion.div>
        ) : !result ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background/40 p-10 text-center"
          >
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <Brain className="h-7 w-7" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{emptyHint}</p>
          </motion.div>
        ) : (
          <motion.div
            key={result.level + result.probability}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6"
          >
            <Gauge probability={result.probability} level={result.level} colorMap={colorMap} />
            <div
              className={`mt-4 flex items-center justify-center gap-2 rounded-xl ${
                colorMap[result.level].bg
              } px-4 py-2 text-sm font-bold uppercase tracking-wider text-white`}
            >
              {(() => {
                const I = colorMap[result.level].icon;
                return <I className="h-4 w-4" />;
              })()}
              {labels.riskLabels[result.level] || result.level.toUpperCase()}
            </div>

            <div className="mt-5">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {labels.reasoning}
              </div>
              <ul className="mt-2 space-y-1.5">
                {result.reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/40 p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                {labels.recommendation}
              </div>
              <p className="mt-1.5 text-sm leading-relaxed">{result.recommendation}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Gauge({
  probability,
  level,
  colorMap,
}: {
  probability: number;
  level: "low" | "medium" | "high";
  colorMap: any;
}) {
  const r = 70;
  const c = 2 * Math.PI * r;
  const offset = c - (probability / 100) * c;
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 180 180" className="h-full w-full -rotate-90">
        <circle cx="90" cy="90" r={r} className="stroke-secondary" strokeWidth="14" fill="none" />
        <motion.circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          className={colorMap[level].ring}
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Probability</div>
        <div className="font-display text-4xl font-bold">
          {probability}
          <span className="text-xl">%</span>
        </div>
      </div>
    </div>
  );
}