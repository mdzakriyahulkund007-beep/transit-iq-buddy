import { Bus, MapPin } from "lucide-react";
import { useBusSimulation } from "@/hooks/useBusSimulation";
import HeroRecommendation from "@/components/HeroRecommendation";
import BusComparisonCard from "@/components/BusComparisonCard";
import PreferenceToggle from "@/components/PreferenceToggle";
import BusMap from "@/components/BusMap";
import RouteSearch from "@/components/RouteSearch";

export default function Index() {
  const { buses, ranked, bestBus, insights, mode, setMode, hasSearched, searchRoute } = useBusSimulation();

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border px-4 py-3">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Bus className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-none">TransitIQ</h2>
              <p className="text-[10px] text-muted-foreground">Smart Bus Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            Bangalore
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-4 mt-4">
        {/* Route Search */}
        <RouteSearch onSearch={searchRoute} hasSearched={hasSearched} />

        {hasSearched && buses.length === 0 && (
          <div className="rounded-xl bg-card border border-border p-6 text-center space-y-2">
            <p className="text-sm text-muted-foreground">No buses found for this route.</p>
            <p className="text-xs text-muted-foreground">Try different stops like Majestic → Whitefield</p>
          </div>
        )}

        {buses.length > 0 && (
          <>
            {/* Preference Toggle */}
            <PreferenceToggle mode={mode} setMode={setMode} />

            {/* Hero AI Recommendation */}
            {bestBus && <HeroRecommendation bus={bestBus} mode={mode} insights={insights} />}

            {/* Bus Comparison */}
            <section className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Available Buses
              </h2>
              {ranked.map((bus) => (
                <BusComparisonCard key={bus.id} bus={bus} isBest={bus.rank === 1} />
              ))}
            </section>

            {/* Live Map */}
            <section className="space-y-2">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Live Tracking
              </h2>
              <BusMap buses={buses} />
            </section>
          </>
        )}
      </main>
    </div>
  );
}
