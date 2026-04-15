export interface BusData {
  id: string;
  name: string;
  eta: number;
  occupancy: number;
  lat: number;
  lng: number;
  route: string;
  color: string;
  source: string;
  destination: string;
}

export type PreferenceMode = "balanced" | "fast" | "comfort";

// Bangalore stops
export const BANGALORE_STOPS = [
  "Majestic",
  "Whitefield",
  "Koramangala",
  "Indiranagar",
  "Electronic City",
  "Hebbal",
  "Jayanagar",
  "BTM Layout",
  "Marathahalli",
  "Banashankari",
  "Yelahanka",
  "KR Puram",
  "Silk Board",
  "MG Road",
  "Rajajinagar",
];

// Bangalore center
const CENTER_LAT = 12.9716;
const CENTER_LNG = 77.5946;

export const USER_LOCATION = { lat: CENTER_LAT, lng: CENTER_LNG };

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

// Route definitions with Bangalore stops
interface RouteDefinition {
  id: string;
  name: string;
  source: string;
  destination: string;
  color: string;
  stops: string[];
}

const ROUTES: RouteDefinition[] = [
  { id: "500A", name: "500A", source: "Majestic", destination: "Whitefield", color: "#ef4444", stops: ["Majestic", "MG Road", "Indiranagar", "Marathahalli", "Whitefield"] },
  { id: "500B", name: "500B", source: "Majestic", destination: "Whitefield", color: "#22c55e", stops: ["Majestic", "Rajajinagar", "Hebbal", "KR Puram", "Whitefield"] },
  { id: "500C", name: "500C", source: "Majestic", destination: "Whitefield", color: "#f59e0b", stops: ["Majestic", "Koramangala", "Silk Board", "Marathahalli", "Whitefield"] },
  { id: "201", name: "201", source: "Majestic", destination: "Electronic City", color: "#8b5cf6", stops: ["Majestic", "Jayanagar", "BTM Layout", "Silk Board", "Electronic City"] },
  { id: "201D", name: "201D", source: "Majestic", destination: "Electronic City", color: "#06b6d4", stops: ["Majestic", "Banashankari", "BTM Layout", "Electronic City"] },
  { id: "300", name: "300", source: "Majestic", destination: "Koramangala", color: "#ec4899", stops: ["Majestic", "MG Road", "Indiranagar", "Koramangala"] },
  { id: "401", name: "401", source: "Koramangala", destination: "Whitefield", color: "#14b8a6", stops: ["Koramangala", "Silk Board", "Marathahalli", "Whitefield"] },
  { id: "335", name: "335", source: "Hebbal", destination: "Electronic City", color: "#f97316", stops: ["Hebbal", "MG Road", "Koramangala", "Silk Board", "Electronic City"] },
  { id: "600", name: "600", source: "Indiranagar", destination: "Banashankari", color: "#a855f7", stops: ["Indiranagar", "MG Road", "Majestic", "Jayanagar", "Banashankari"] },
  { id: "252", name: "252", source: "Yelahanka", destination: "Silk Board", color: "#64748b", stops: ["Yelahanka", "Hebbal", "MG Road", "Koramangala", "Silk Board"] },
];

export function findRoutesForTrip(source: string, destination: string): RouteDefinition[] {
  return ROUTES.filter((route) => {
    const srcIdx = route.stops.findIndex((s) => s.toLowerCase() === source.toLowerCase());
    const destIdx = route.stops.findIndex((s) => s.toLowerCase() === destination.toLowerCase());
    return srcIdx !== -1 && destIdx !== -1 && srcIdx < destIdx;
  });
}

export function getBusesForRoute(source: string, destination: string): BusData[] {
  const matchedRoutes = findRoutesForTrip(source, destination);
  if (matchedRoutes.length === 0) return [];

  return matchedRoutes.map((route, i) => ({
    id: route.id,
    name: `Bus ${route.name}`,
    eta: Math.floor(Math.random() * 10) + 2,
    occupancy: Math.floor(Math.random() * 70) + 15,
    lat: CENTER_LAT + (Math.random() - 0.5) * 0.03,
    lng: CENTER_LNG + (Math.random() - 0.5) * 0.03,
    route: `${route.source} → ${route.destination}`,
    color: route.color,
    source: route.source,
    destination: route.destination,
  }));
}

export function getInitialBuses(): BusData[] {
  return [];
}

export function simulateUpdate(buses: BusData[]): BusData[] {
  return buses.map((bus) => {
    let newEta = bus.eta - 0.1;
    let newLat = bus.lat;
    let newLng = bus.lng;
    let newOccupancy = bus.occupancy;

    if (newEta <= 0) {
      newEta = Math.floor(Math.random() * 8) + 4;
      newOccupancy = Math.floor(Math.random() * 60) + 20;
      newLat = USER_LOCATION.lat + (Math.random() - 0.5) * 0.02;
      newLng = USER_LOCATION.lng + (Math.random() - 0.5) * 0.02;
    } else {
      const dlat = (USER_LOCATION.lat - bus.lat) * 0.02;
      const dlng = (USER_LOCATION.lng - bus.lng) * 0.02;
      newLat += dlat + (Math.random() - 0.5) * 0.0003;
      newLng += dlng + (Math.random() - 0.5) * 0.0003;

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
