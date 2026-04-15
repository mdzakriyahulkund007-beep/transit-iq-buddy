import { motion } from "framer-motion";
import { Bus, Clock, Users, Armchair } from "lucide-react";
import { BusData, getComfortScore, getSeatProbability, getOccupancyStatus } from "@/lib/busEngine";

interface Props {
  bus: BusData & { score: number; rank: number };
  isBest: boolean;
}

export default function BusComparisonCard({ bus, isBest }: Props) {
  const comfort = getComfortScore(bus.score);
  const seatProb = getSeatProbability(bus.occupancy);
  const status = getOccupancyStatus(bus.occupancy);

  const levelClasses = {
    success: "gradient-success border-success/30",
    warning: "gradient-warning border-warning/30",
    danger: "gradient-danger border-danger/30",
  };

  const barColors = {
    success: "bg-success",
    warning: "bg-warning",
    danger: "bg-danger",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: bus.rank * 0.1 }}
      className={`rounded-xl border p-4 space-y-3 transition-all ${
        isBest ? "border-primary/40 glow-primary gradient-hero" : `${levelClasses[status.level]}`
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: bus.color + "22", color: bus.color }}
          >
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">{bus.name}</h3>
            <p className="text-xs text-muted-foreground">{bus.route}</p>
          </div>
        </div>
        <div className="text-right">
          {isBest && (
            <span className="text-[10px] uppercase tracking-widest bg-primary/20 text-primary px-2 py-0.5 rounded-full font-semibold">
              Best
            </span>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {status.emoji} {status.label}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 text-center">
        <MiniStat icon={<Clock className="w-3.5 h-3.5" />} label="ETA" value={`${Math.max(0, Math.ceil(bus.eta))}m`} />
        <MiniStat icon={<Users className="w-3.5 h-3.5" />} label="Crowd" value={`${bus.occupancy}%`} />
        <MiniStat icon={<Armchair className="w-3.5 h-3.5" />} label="Comfort" value={`${comfort}`} />
        <MiniStat icon={<Armchair className="w-3.5 h-3.5" />} label="Seat" value={`${seatProb}%`} />
      </div>

      {/* Occupancy bar */}
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barColors[status.level]}`}
          animate={{ width: `${bus.occupancy}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </motion.div>
  );
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-center text-muted-foreground">{icon}</div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="text-sm font-bold font-mono text-foreground">{value}</p>
    </div>
  );
}
