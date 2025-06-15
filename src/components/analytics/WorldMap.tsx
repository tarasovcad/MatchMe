import React, {useState, useMemo} from "react";
import {ComposableMap, Geographies, Geography, Marker, ZoomableGroup} from "react-simple-maps";
import {motion} from "framer-motion";
import {cn} from "@/lib/utils";
import {createPortal} from "react-dom";

// Constants
const GEO_URL = "https://unpkg.com/world-atlas@2/countries-110m.json";
const PROJECTION_SCALE = 200;
const TOOLTIP_OFFSET = {x: 10, y: -10};

// Color intensity thresholds
const COLOR_THRESHOLDS = [
  {min: 1, color: "hsl(var(--chart-1))"},
  {min: 0.8, color: "hsl(var(--chart-2))"},
  {min: 0.6, color: "hsl(var(--chart-3))"},
  {min: 0.4, color: "hsl(var(--chart-4))"},
  {min: 0.2, color: "hsl(var(--chart-5))"},
  {min: 0, color: "hsl(var(--chart-6))"},
];

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

interface GeographyProperties {
  NAME?: string;
  NAME_EN?: string;
  NAME_LONG?: string;
  name?: string;
  NAME_SORT?: string;
}

interface Geography {
  rsmKey: string;
  properties: GeographyProperties;
}

// Helper functions
const createCountryAliases = (item: CountryData) => {
  const aliases = [item.label.toLowerCase()];
  const name = item.label.toLowerCase();

  const aliasMap: Record<string, string[]> = {
    "united states": ["usa", "united states of america", "us"],
    "united kingdom": ["uk", "great britain", "england"],
    "south korea": ["korea, south", "republic of korea"],
    germany: ["deutschland"],
    netherlands: ["holland"],
  };

  if (aliasMap[name]) {
    aliases.push(...aliasMap[name]);
  }

  return aliases;
};

const buildCountryDataMap = (data: CountryData[]) => {
  const map: Record<string, CountryData> = {};

  data.forEach((item) => {
    const aliases = createCountryAliases(item);
    aliases.forEach((alias) => {
      map[alias] = item;
    });
  });

  return map;
};

const getCountryName = (properties: GeographyProperties): string => {
  return (
    properties.NAME ||
    properties.NAME_EN ||
    properties.NAME_LONG ||
    properties.name ||
    properties.NAME_SORT ||
    ""
  );
};

const getColorByIntensity = (intensity: number): string => {
  const threshold = COLOR_THRESHOLDS.find((t) => intensity >= t.min);
  return threshold?.color || "hsl(var(--muted))";
};

const WorldMap: React.FC<WorldMapProps> = ({data, className = "", height = 400}) => {
  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    country: "",
    count: 0,
  });

  const [geoError, setGeoError] = useState<string | null>(null);

  const countryDataMap = useMemo(() => buildCountryDataMap(data), [data]);
  const maxCount = useMemo(() => Math.max(...data.map((item) => item.count), 1), [data]);

  const getCountryColor = (countryName: string): string => {
    const countryData = countryDataMap[countryName.toLowerCase()];
    if (!countryData) return "hsl(var(--muted))";

    const intensity = countryData.count / maxCount;
    return getColorByIntensity(intensity);
  };

  const showTooltip = (event: React.MouseEvent, countryData: CountryData) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      country: countryData.label,
      count: countryData.count,
    });
  };

  const updateTooltipPosition = (event: React.MouseEvent) => {
    if (tooltip.show) {
      setTooltip((prev) => ({
        ...prev,
        x: event.clientX,
        y: event.clientY,
      }));
    }
  };

  const hideTooltip = () => {
    setTooltip({show: false, x: 0, y: 0, country: "", count: 0});
  };

  const handleMouseEnter = (event: React.MouseEvent, geo: Geography) => {
    const countryName = getCountryName(geo.properties);
    const countryData = countryDataMap[countryName.toLowerCase()];

    if (countryData) {
      showTooltip(event, countryData);
    }
  };

  const handleGeoError = (error: React.SyntheticEvent<SVGGElement, Event>) => {
    console.error("Geography loading error:", error);
    setGeoError("Failed to load map data");
  };

  const renderGeography = (geo: Geography) => {
    const countryName = getCountryName(geo.properties);
    const color = getCountryColor(countryName);
    const hasData = countryDataMap[countryName.toLowerCase()];

    return (
      <Geography
        key={geo.rsmKey}
        geography={geo}
        onMouseEnter={(event) => handleMouseEnter(event, geo)}
        onMouseMove={updateTooltipPosition}
        onMouseLeave={hideTooltip}
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
  };

  const renderTooltip = () => {
    if (!tooltip.show) return null;

    return createPortal(
      <motion.div
        initial={{opacity: 0, scale: 0.8}}
        animate={{opacity: 1, scale: 1}}
        exit={{opacity: 0, scale: 0.8}}
        transition={{duration: 0.15}}
        className="fixed z-50 pointer-events-none"
        style={{
          left: tooltip.x + TOOLTIP_OFFSET.x,
          top: tooltip.y + TOOLTIP_OFFSET.y,
        }}>
        <div className="border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
          <div className="flex w-full flex-wrap items-center gap-2">
            <div
              className="shrink-0 rounded-[2px] h-2.5 w-2.5"
              style={{backgroundColor: getCountryColor(tooltip.country)}}
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
    );
  };

  const renderLegend = () => (
    <motion.div
      initial={{opacity: 0, y: 20, scale: 0.95}}
      animate={{opacity: 1, y: 0, scale: 1}}
      transition={{
        duration: 0.6,
        delay: 0.3,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm border border-border rounded-lg p-3">
      <motion.p
        initial={{opacity: 0, x: -10}}
        animate={{opacity: 1, x: 0}}
        transition={{duration: 0.4, delay: 0.5}}
        className="text-xs font-medium text-foreground mb-2">
        Visitors
      </motion.p>
      <div className="flex flex-col gap-1">
        {[
          {color: "hsl(var(--chart-1))", label: "High"},
          {color: "hsl(var(--chart-3))", label: "Medium"},
          {color: "hsl(var(--chart-6))", label: "Low"},
          {color: "hsl(var(--muted))", label: "No data"},
        ].map(({color, label}, index) => (
          <motion.div
            key={label}
            initial={{opacity: 0, x: -15, scale: 0.8}}
            animate={{opacity: 1, x: 0, scale: 1}}
            transition={{
              duration: 0.4,
              delay: 0.6 + index * 0.1,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="flex items-center gap-2">
            <motion.div
              initial={{scale: 0, rotate: -180}}
              animate={{scale: 1, rotate: 0}}
              transition={{
                duration: 0.5,
                delay: 0.7 + index * 0.1,
                type: "spring",
                stiffness: 200,
                damping: 15,
              }}
              className="w-3 h-3 rounded-sm"
              style={{backgroundColor: color}}
            />
            <motion.span
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              transition={{duration: 0.3, delay: 0.8 + index * 0.1}}
              className="text-xs text-muted-foreground">
              {label}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );

  const renderErrorState = () => {
    if (!geoError) return null;

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg z-10">
        <div className="text-center p-4">
          <p className="text-sm text-muted-foreground mb-2">{geoError}</p>
          <p className="text-xs text-muted-foreground">Please check your internet connection</p>
        </div>
      </div>
    );
  };

  return (
    <div className={cn("relative w-full", className)}>
      {renderErrorState()}

      <ComposableMap
        height={height}
        projectionConfig={{scale: PROJECTION_SCALE}}
        style={{width: "100%", height: "100%"}}>
        <ZoomableGroup>
          <Geographies geography={GEO_URL} onError={handleGeoError}>
            {({geographies}) => {
              if (geographies.length === 0) {
                console.warn("No geographies loaded");
                setGeoError("No map data available");
              }
              return geographies.map(renderGeography);
            }}
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>

      {renderTooltip()}
      {renderLegend()}
    </div>
  );
};

export default WorldMap;
