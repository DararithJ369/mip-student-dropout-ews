import { useState } from "react";
import { cambodiaMapData, MapLocation } from "./CambodiaMapData";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";
import { MapPin, Users, AlertTriangle, ShieldCheck } from "lucide-react";

interface CambodiaMapProps {
  provinceData: Record<string, {
    student_count: number;
    avg_risk: number;
    high_risk_count: number;
  }>;
}

export function CambodiaMap({ provinceData }: CambodiaMapProps) {
  const { lang } = useI18n();
  const [hovered, setHovered] = useState<{
    location: MapLocation;
    stats: { student_count: number; avg_risk: number; high_risk_count: number };
    x: number;
    y: number;
  } | null>(null);

  const getProvinceStats = (name: string) => {
    return provinceData[name] || { student_count: 0, avg_risk: 0, high_risk_count: 0 };
  };

  const getProvinceColor = (stats: { student_count: number; avg_risk: number; high_risk_count: number }) => {
    if (stats.student_count === 0) {
      return "fill-muted/20 stroke-border/40 hover:fill-muted/40";
    }
    const risk = stats.avg_risk;
    if (risk < 40) {
      return "fill-success/20 stroke-success/70 hover:fill-success/40";
    } else if (risk < 70) {
      return "fill-warning/25 stroke-warning/70 hover:fill-warning/50";
    } else {
      return "fill-danger/30 stroke-danger/80 hover:fill-danger/60";
    }
  };

  const handleMouseMove = (e: React.MouseEvent, loc: MapLocation) => {
    const svgRect = e.currentTarget.parentElement?.getBoundingClientRect();
    
    // Position tooltip relative to the SVG container coordinates
    const x = e.clientX - (svgRect?.left || 0) + 15;
    const y = e.clientY - (svgRect?.top || 0) - 95;
    
    const stats = getProvinceStats(loc.name);
    setHovered({
      location: loc,
      stats,
      x,
      y
    });
  };

  return (
    <div className="relative w-full rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-display text-lg font-semibold">
            {lang === "en" ? "Cambodia Regional Risk Map" : "ផែនទីហានិភ័យតាមតំបន់នៃកម្ពុជា"}
          </h3>
          <p className="text-xs text-muted-foreground">
            {lang === "en" ? "Interactive geographic early warning heatmap" : "ផែនទីកំដៅព្រមានជាមុនតាមភូមិសាស្ត្រ"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-success/20 border border-success" /> {lang === "en" ? "Safe (< 40%)" : "សុវត្ថិភាព (< ៤០%)"}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-warning/25 border border-warning" /> {lang === "en" ? "Warning (40-70%)" : "ព្រមាន (៤០-៧០%)"}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-danger/30 border border-danger" /> {lang === "en" ? "High Risk (≥ 70%)" : "ហានិភ័យខ្ពស់ (≥ ៧០%)"}</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-sm bg-muted/20 border border-border/40" /> {lang === "en" ? "No Data" : "គ្មានទិន្នន័យ"}</span>
        </div>
      </div>

      <div className="relative flex justify-center overflow-hidden h-[340px] md:h-[400px]">
        <svg
          viewBox={cambodiaMapData.viewBox}
          className="h-full w-auto select-none transition-all drop-shadow-md"
        >
          {cambodiaMapData.locations.map((loc) => {
            const stats = getProvinceStats(loc.name);
            const colorClass = getProvinceColor(stats);
            const isHovered = hovered?.location.id === loc.id;
            
            return (
              <path
                key={loc.id}
                d={loc.path}
                className={`cursor-pointer transition-all duration-300 stroke-[1.2px] outline-none ${colorClass}`}
                onMouseMove={(e) => handleMouseMove(e, loc)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  transform: isHovered ? "scale(1.025)" : "scale(1)",
                  filter: isHovered ? "drop-shadow(0 4px 10px rgba(0,0,0,0.15))" : "none"
                }}
              />
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="absolute pointer-events-none z-10 w-52 rounded-xl border border-border bg-card/95 p-3.5 shadow-xl backdrop-blur-md"
              style={{
                left: hovered.x,
                top: hovered.y,
              }}
            >
              <div className="flex items-center gap-1.5 border-b border-border pb-1.5 mb-2 font-display text-sm font-bold">
                <MapPin className="h-3.5 w-3.5 text-accent" />
                {hovered.location.name}
              </div>
              
              {hovered.stats.student_count > 0 ? (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1"><Users className="h-3 w-3" /> Students</span>
                    <span className="font-semibold text-foreground">{hovered.stats.student_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      {hovered.stats.avg_risk >= 70 ? (
                        <AlertTriangle className="h-3 w-3 text-danger" />
                      ) : (
                        <ShieldCheck className="h-3 w-3 text-success" />
                      )}
                      Avg Risk
                    </span>
                    <span className={`font-semibold ${
                      hovered.stats.avg_risk >= 70 
                        ? "text-danger" 
                        : hovered.stats.avg_risk >= 40 
                          ? "text-warning" 
                          : "text-success"
                    }`}>{hovered.stats.avg_risk}%</span>
                  </div>
                  {hovered.stats.high_risk_count > 0 && (
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1 text-danger"><AlertTriangle className="h-3 w-3" /> High Risk</span>
                      <span className="font-semibold text-danger">{hovered.stats.high_risk_count}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-xs italic text-muted-foreground py-1">
                  {lang === "en" ? "No students recorded" : "គ្មានទិន្នន័យសិស្ស"}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
