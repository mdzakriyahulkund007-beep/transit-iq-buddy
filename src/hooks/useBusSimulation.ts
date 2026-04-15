import { useState, useEffect, useCallback } from "react";
import { BusData, PreferenceMode, getInitialBuses, simulateUpdate, rankBuses, generateInsights } from "@/lib/busEngine";

export function useBusSimulation() {
  const [buses, setBuses] = useState<BusData[]>(getInitialBuses);
  const [mode, setMode] = useState<PreferenceMode>("balanced");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setBuses((prev) => simulateUpdate(prev));
      setTick((t) => t + 1);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const ranked = rankBuses(buses, mode);
  const bestBus = ranked[0];
  const insights = generateInsights(buses, mode);

  const cycleMode = useCallback(() => {
    setMode((prev) => {
      if (prev === "balanced") return "fast";
      if (prev === "fast") return "comfort";
      return "balanced";
    });
  }, []);

  return { buses, ranked, bestBus, insights, mode, setMode, cycleMode, tick };
}
