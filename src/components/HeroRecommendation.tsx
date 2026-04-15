import { motion, AnimatePresence } from "framer-motion";
import { Bus, Zap, Users, Armchair } from "lucide-react";
import { BusData, getComfortScore, getSeatProbability, calculateScore, PreferenceMode } from "@/lib/busEngine";

interface Props {
  bus: BusData & { score: number };
  mode: PreferenceMode;
  insights: string[];
}

export default function HeroRecommendation({ bus, mode, insights }: Props) {
  const comfort = getComfortScore(bus.score);
  const seatProb = getSeatProbability(bus.occupancy);

  return (
    <motion.div
      layout
      className="rounded-2xl border border-primary/30 gradient-hero glow-primary p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">AI Recommendation</p>
            <p className="text-sm text-secondary-foreground font-medium">
              {mode === "fast" ? "Fastest" : mode === "comfort" ? "Most Comfortable" : "Balanced"}
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold animate-pulse-glow">
          LIVE
        </div>
      </div>

      {/* Main recommendation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bus.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-center gap-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
            <Bus className="w-7 h-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              ✅ TAKE {bus.name.toUpperCase()}
            </h1>
            <p className="text-muted-foreground text-sm">{bus.route}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={<Zap className="w-4 h-4" />} label="ETA" value={`${Math.max(0, Math.ceil(bus.eta))} min`} color="text-primary" />
        <StatBox icon={<Users className="w-4 h-4" />} label="Occupancy" value={`${bus.occupancy}%`} color={bus.occupancy > 80 ? "text-danger" : bus.occupancy > 50 ? "text-warning" : "text-success"} />
        <StatBox icon={<Armchair className="w-4 h-4" />} label="Comfort" value={`${comfort}`} color="text-info" />
      </div>

      {/* Seat probability bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Seat Probability</span>
          <span className="text-foreground font-mono font-semibold">{seatProb}%</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${seatProb}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Insights */}
      <div className="space-y-1.5">
        {insights.map((insight, i) => (
          <motion.p
            key={insight}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="text-xs text-secondary-foreground bg-secondary/50 rounded-lg px-3 py-2"
          >
            {insight}
          </motion.p>
        ))}
      </div>
    </motion.div>
  );
}

function StatBox({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-secondary/50 rounded-xl p-3 text-center space-y-1">
      <div className={`flex justify-center ${color}`}>{icon}</div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold font-mono ${color}`}>{value}</p>
    </div>
  );
}
