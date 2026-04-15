import { useState, useEffect, useCallback } from "react";
import { BusData, PreferenceMode, getBusesForRoute, simulateUpdate, rankBuses, generateInsights } from "@/lib/busEngine";

export function useBusSimulation() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [mode, setMode] = useState<PreferenceMode>("balanced");
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (buses.length === 0) return;
    const interval = setInterval(() => {
      setBuses((prev) => simulateUpdate(prev));
    }, 3000);
    return () => clearInterval(interval);
  }, [buses.length]);

  const searchRoute = useCallback((source: string, destination: string) => {
    const found = getBusesForRoute(source, destination);
    setBuses(found);
    setHasSearched(true);
  }, []);

  const ranked = buses.length > 0 ? rankBuses(buses, mode) : [];
  const bestBus = ranked[0] ?? null;
  const insights = buses.length > 0 ? generateInsights(buses, mode) : [];

  return { buses, ranked, bestBus, insights, mode, setMode, hasSearched, searchRoute };
}
