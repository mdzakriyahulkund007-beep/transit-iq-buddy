import { useState } from "react";
import { MapPin, Search, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { BANGALORE_STOPS } from "@/lib/busEngine";

interface Props {
  onSearch: (source: string, destination: string) => void;
  hasSearched: boolean;
}

export default function RouteSearch({ onSearch, hasSearched }: Props) {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [focusedField, setFocusedField] = useState<"source" | "destination" | null>(null);

  const filteredStops = BANGALORE_STOPS.filter((stop) =>
    stop.toLowerCase().includes(
      (focusedField === "source" ? source : destination).toLowerCase()
    )
  ).slice(0, 5);

  const handleSelect = (stop: string) => {
    if (focusedField === "source") {
      setSource(stop);
    } else {
      setDestination(stop);
    }
    setFocusedField(null);
  };

  const handleSearch = () => {
    if (source && destination) {
      onSearch(source, destination);
    }
  };

  const showDropdown = focusedField && (focusedField === "source" ? source : destination).length > 0 && filteredStops.length > 0;

  return (
    <div className="relative space-y-2">
      <div className="rounded-xl bg-card border border-border p-3 space-y-2">
        {/* Source */}
        <div className="relative flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-green-400" />
          </div>
          <input
            type="text"
            placeholder="From — e.g. Majestic"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            onFocus={() => setFocusedField("source")}
            onBlur={() => setTimeout(() => setFocusedField((f) => f === "source" ? null : f), 150)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div className="flex items-center gap-2 px-3">
          <div className="w-px h-4 bg-border ml-[11px]" />
          <ArrowDown className="w-3 h-3 text-muted-foreground" />
        </div>

        {/* Destination */}
        <div className="relative flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
          </div>
          <input
            type="text"
            placeholder="To — e.g. Whitefield"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onFocus={() => setFocusedField("destination")}
            onBlur={() => setTimeout(() => setFocusedField((f) => f === "destination" ? null : f), 150)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!source || !destination}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          <Search className="w-4 h-4" />
          Find Buses
        </button>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute left-0 right-0 z-50 bg-card border border-border rounded-xl overflow-hidden shadow-lg"
            style={{ top: focusedField === "source" ? "52px" : "130px" }}
          >
            {filteredStops.map((stop) => (
              <button
                key={stop}
                onMouseDown={() => handleSelect(stop)}
                className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                {stop}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
