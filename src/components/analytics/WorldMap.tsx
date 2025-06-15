import React, {useState, useMemo} from "react";
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {createPortal} from "react-dom";

const geoUrl = "https://unpkg.com/world-atlas@2/countries-110m.json";

interface CountryData {
  label: string;
  count: number;
  percentage: number;
  relative: number;
}

interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  country: string;
  count: number;
}

interface WorldMapProps {
  data: CountryData[];
  className?: string;
  height?: number;
}

const WorldMap: React.FC<WorldMapProps> = ({data, className = "", height = 400}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    country: "",
    count: 0,
  });

  const [geoError, setGeoError] = useState<string | null>(null);

  // Create a map of country names to their data for quick lookup
  const countryDataMap = useMemo(() => {
    const map: Record<string, CountryData> = {};
    data.forEach((item) => {
      // Handle different possible country name formats
      const normalizedName = item.label.toLowerCase();
      map[normalizedName] = item;

      // Add common variations and aliases
      if (normalizedName === "united states") {
        map["usa"] = item;
        map["united states of america"] = item;
        map["us"] = item;
      }
      if (normalizedName === "united kingdom") {
        map["uk"] = item;
        map["great britain"] = item;
        map["england"] = item;
      }
      if (normalizedName === "south korea") {
        map["korea, south"] = item;
        map["republic of korea"] = item;
      }
      if (normalizedName === "germany") {
        map["deutschland"] = item;
      }
      if (normalizedName === "netherlands") {
        map["holland"] = item;
      }
    });
    return map;
  }, [data]);

  // Find the maximum count for color scaling
  const maxCount = useMemo(() => {
    return Math.max(...data.map((item) => item.count), 1);
  }, [data]);

  // Function to get country color based on visitor count using Tailwind CSS colors
  const getCountryColor = (countryName: string): string => {
    const normalizedName = countryName.toLowerCase();
    const countryData = countryDataMap[normalizedName];

    if (!countryData) {
      return "hsl(var(--muted))"; // Light gray for countries with no data
    }

    const intensity = countryData.count / maxCount;

    // Use chart colors from globals.css for different intensities
    if (intensity === 1) {
      return "hsl(var(--chart-1))"; // Primary chart color for highest count
    } else if (intensity >= 0.8) {
      return "hsl(var(--chart-2))"; // Second chart color
    } else if (intensity >= 0.6) {
      return "hsl(var(--chart-3))"; // Third chart color
    } else if (intensity >= 0.4) {
      return "hsl(var(--chart-4))"; // Fourth chart color
    } else if (intensity >= 0.2) {
      return "hsl(var(--chart-5))"; // Fifth chart color
    } else {
      return "hsl(var(--chart-6))"; // Lightest chart color
    }
  };

  const handleMouseEnter = (
    event: React.MouseEvent,
    geography: {
      properties: {
        NAME?: string;
        NAME_EN?: string;
        NAME_LONG?: string;
        name?: string;
        NAME_SORT?: string;
      };
    },
  ) => {
    const countryName =
      geography.properties.NAME ||
      geography.properties.NAME_EN ||
      geography.properties.NAME_LONG ||
      geography.properties.name ||
      geography.properties.NAME_SORT ||
      "";
    const normalizedName = countryName.toLowerCase();
    const countryData = countryDataMap[normalizedName];

    if (countryData) {
      setTooltip({
        show: true,
        x: event.clientX,
        y: event.clientY,
        country: countryData.label,
        count: countryData.count,
      });
    }
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
      }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip({
      show: false,
      x: 0,
      y: 0,
      country: "",
      count: 0,
    });
  };

  return (
    <div className={cn("relative w-full", className)}>
      {geoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground mb-2">{geoError}</p>
            <p className="text-xs text-muted-foreground">Please check your internet connection</p>
          </div>
        </div>
      )}
      <ComposableMap
        height={height}
        projectionConfig={{
          scale: 200,
        }}
        style={{width: "100%", height: "100%"}}>
        <ZoomableGroup>
          <Geographies
            geography={geoUrl}
            onError={(error) => {
              console.error("Geography loading error:", error);
              setGeoError("Failed to load map data");
            }}>
            {({geographies}) => {
              if (geographies.length === 0) {
                console.warn("No geographies loaded");
                setGeoError("No map data available");
              }
              return geographies.map((geo) => {
                const countryName =
                  geo.properties.NAME ||
                  geo.properties.NAME_EN ||
                  geo.properties.NAME_LONG ||
                  geo.properties.name ||
                  geo.properties.NAME_SORT ||
                  "";
                const color = getCountryColor(countryName);
                const hasData = countryDataMap[countryName.toLowerCase()];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    onMouseEnter={(event) => handleMouseEnter(event, geo)}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                    style={{
                      default: {
                        fill: color,
                        stroke: "hsl(var(--border))",
                        strokeWidth: 0.5,
                        outline: "none",
                        cursor: hasData ? "pointer" : "default",
                      },
                      hover: {
                        fill: hasData ? "#6366f1" : color,
                        stroke: "#cbd5e1",
                        strokeWidth: 1,
                        outline: "none",
                        cursor: hasData ? "pointer" : "default",
                      },
                      pressed: {
                        fill: hasData ? "#4f46e5" : color,
                        stroke: "#cbd5e1",
                        strokeWidth: 1,
                        outline: "none",
                      },
                    }}
                  />
                );
              });
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {tooltip.show &&
        createPortal(
          <motion.div
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.8}}
            transition={{duration: 0.15}}
            className="fixed z-50 pointer-events-none"
            style={{
              left: tooltip.x + 10,
              top: tooltip.y - 10,
            }}>
            <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
              <div className="flex w-full flex-wrap items-center gap-2">
                <div
                  className="shrink-0 rounded-[2px] h-2.5 w-2.5"
                  style={{
                    backgroundColor: getCountryColor(tooltip.country),
                  }}
                />
                <div className="flex flex-1 items-center leading-none">
                  <span className="text-muted-foreground">{tooltip.country}:</span>
                  <span className="font-mono font-medium tabular-nums text-foreground ml-1">
                    {tooltip.count.toLocaleString()} visitor{tooltip.count !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>,
          document.body,
        )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
        <p className="text-xs font-medium text-foreground mb-2">Visitors</p>
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{backgroundColor: "hsl(var(--chart-1))"}}></div>
              <span className="text-xs text-muted-foreground">High</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{backgroundColor: "hsl(var(--chart-3))"}}></div>
              <span className="text-xs text-muted-foreground">Medium</span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm"
                style={{backgroundColor: "hsl(var(--chart-6))"}}></div>
              <span className="text-xs text-muted-foreground">Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-muted"></div>
              <span className="text-xs text-muted-foreground">No data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
