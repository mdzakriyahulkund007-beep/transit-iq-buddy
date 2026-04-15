import { motion } from "framer-motion";
import { Zap, Users, Scale } from "lucide-react";
import { PreferenceMode } from "@/lib/busEngine";

interface Props {
  mode: PreferenceMode;
  setMode: (m: PreferenceMode) => void;
}

const modes: { key: PreferenceMode; label: string; icon: React.ReactNode }[] = [
  { key: "fast", label: "Faster", icon: <Zap className="w-4 h-4" /> },
  { key: "balanced", label: "Balanced", icon: <Scale className="w-4 h-4" /> },
  { key: "comfort", label: "Less Crowd", icon: <Users className="w-4 h-4" /> },
];

export default function PreferenceToggle({ mode, setMode }: Props) {
  return (
    <div className="flex rounded-xl bg-secondary p-1 gap-1">
      {modes.map((m) => (
        <button
          key={m.key}
          onClick={() => setMode(m.key)}
          className={`relative flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            mode === m.key ? "text-primary-foreground" : "text-muted-foreground"
          }`}
        >
          {mode === m.key && (
            <motion.div
              layoutId="mode-pill"
              className="absolute inset-0 bg-primary rounded-lg"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative flex items-center gap-1.5">
            {m.icon}
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
}
