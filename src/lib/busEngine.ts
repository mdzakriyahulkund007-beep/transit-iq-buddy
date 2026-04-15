export interface BusData {
  id: string;
  name: string;
  eta: number;
  occupancy: number;
  lat: number;
  lng: number;
  route: string;
  color: string;
}

export type PreferenceMode = "balanced" | "fast" | "comfort";

export function calculateScore(bus: BusData, mode: PreferenceMode): number {
  let etaWeight: number;
  let occWeight: number;

  switch (mode) {
    case "fast":
      etaWeight = 0.8;
      occWeight = 0.2;
      break;
    case "comfort":
      etaWeight = 0.3;
      occWeight = 0.7;
      break;
    default:
      etaWeight = 0.6;
      occWeight = 0.4;
  }

  let score = bus.eta * etaWeight + bus.occupancy * occWeight;

  // Heavy penalty for very crowded buses
  if (bus.occupancy > 85) {
    score += 20;
  }

  return score;
}

export function getComfortScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(100 - score)));
}

export function getSeatProbability(occupancy: number): number {
  return Math.max(0, Math.round(100 - occupancy));
}

export function getOccupancyStatus(occupancy: number): { label: string; emoji: string; level: "success" | "warning" | "danger" } {
  if (occupancy > 80) return { label: "Too Crowded", emoji: "❌", level: "danger" };
  if (occupancy > 50) return { label: "Moderate", emoji: "⚠️", level: "warning" };
  return { label: "Comfortable", emoji: "✅", level: "success" };
}

export function rankBuses(buses: BusData[], mode: PreferenceMode): (BusData & { score: number; rank: number })[] {
  return buses
    .map((bus) => ({ ...bus, score: calculateScore(bus, mode), rank: 0 }))
    .sort((a, b) => a.score - b.score)
    .map((bus, i) => ({ ...bus, rank: i + 1 }));
}

export function generateInsights(buses: BusData[], mode: PreferenceMode): string[] {
  const ranked = rankBuses(buses, mode);
  const best = ranked[0];
  const worst = ranked[ranked.length - 1];
  const insights: string[] = [];

  if (best.occupancy < 50) {
    insights.push(`🎯 ${best.name} has plenty of seats available`);
  }

  if (worst.occupancy > 80 && best.occupancy < 60) {
    const diff = worst.occupancy - best.occupancy;
    insights.push(`💡 Switch to ${best.name}, save ${diff}% crowd`);
  }

  const increasing = buses.find((b) => b.occupancy > 70 && b.id !== best.id);
  if (increasing) {
    insights.push(`📈 ${increasing.name} crowd is increasing`);
  }

  if (best.eta <= 3) {
    insights.push(`⚡ ${best.name} arriving very soon!`);
  }

  const etaDiff = ranked.length > 1 ? ranked[1].eta - best.eta : 0;
  if (etaDiff > 3 && best.occupancy < 60) {
    insights.push(`🏆 ${best.name} is the optimal balance of speed & comfort`);
  }

  if (insights.length === 0) {
    insights.push(`✨ ${best.name} is your best option right now`);
  }

  return insights.slice(0, 3);
}

// Initial bus data (simulated in a central location like Mumbai/Delhi area)
const CENTER_LAT = 19.076;
const CENTER_LNG = 72.8777;

export function getInitialBuses(): BusData[] {
  return [
    { id: "A", name: "Bus A", eta: 3, occupancy: 90, lat: CENTER_LAT + 0.008, lng: CENTER_LNG - 0.005, route: "Route 101", color: "#ef4444" },
    { id: "B", name: "Bus B", eta: 8, occupancy: 40, lat: CENTER_LAT - 0.006, lng: CENTER_LNG + 0.009, route: "Route 202", color: "#22c55e" },
    { id: "C", name: "Bus C", eta: 5, occupancy: 70, lat: CENTER_LAT + 0.003, lng: CENTER_LNG + 0.012, route: "Route 303", color: "#f59e0b" },
  ];
}

export const USER_LOCATION = { lat: CENTER_LAT, lng: CENTER_LNG };

export function simulateUpdate(buses: BusData[]): BusData[] {
  return buses.map((bus) => {
    // Decrease ETA
    let newEta = bus.eta - 0.1;
    let newLat = bus.lat;
    let newLng = bus.lng;
    let newOccupancy = bus.occupancy;

    // Reset bus when it "arrives"
    if (newEta <= 0) {
      newEta = Math.floor(Math.random() * 8) + 4;
      newOccupancy = Math.floor(Math.random() * 60) + 20;
      // Respawn at random offset
      newLat = USER_LOCATION.lat + (Math.random() - 0.5) * 0.02;
      newLng = USER_LOCATION.lng + (Math.random() - 0.5) * 0.02;
    } else {
      // Move toward user
      const dlat = (USER_LOCATION.lat - bus.lat) * 0.02;
      const dlng = (USER_LOCATION.lng - bus.lng) * 0.02;
      newLat += dlat + (Math.random() - 0.5) * 0.0003;
      newLng += dlng + (Math.random() - 0.5) * 0.0003;

      // Random occupancy fluctuation
      newOccupancy += Math.floor(Math.random() * 11) - 5;
      newOccupancy = Math.max(10, Math.min(98, newOccupancy));
    }

    return {
      ...bus,
      eta: Math.round(newEta * 10) / 10,
      occupancy: newOccupancy,
      lat: newLat,
      lng: newLng,
    };
  });
}
