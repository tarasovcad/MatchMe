import React, {useState} from "react";
import AnalyticsSectionHeader from "./AnalyticsSectionHeader";
import {Calendar} from "lucide-react";
import {motion} from "framer-motion";
import {createPortal} from "react-dom";
import {HeatmapDataPoint} from "@/functions/analytics/transformPostHogDataToHeatmap";
import LoadingButtonCircle from "../ui/LoadingButtonCirlce";

const COLOR_THRESHOLDS = [
  {min: 1, color: "hsl(var(--chart-1))"},
  {min: 0.8, color: "hsl(var(--chart-2))"},
  {min: 0.6, color: "hsl(var(--chart-3))"},
  {min: 0.4, color: "hsl(var(--chart-4))"},
  {min: 0.2, color: "hsl(var(--chart-5))"},
  {min: 0, color: "hsl(var(--chart-6))"},
];

// Find the maximum intensity to normalize colors properly
const getMaxIntensity = (data: HeatmapDataPoint[]) => {
  return Math.max(...data.map((d) => d.intensity), 1); // Minimum of 1 to avoid division by zero
};

const getIntensityColor = (intensity: number, maxIntensity: number) => {
  const normalizedIntensity = intensity / maxIntensity;

  const threshold = COLOR_THRESHOLDS.find((t) => normalizedIntensity >= t.min);
  return threshold?.color || COLOR_THRESHOLDS[COLOR_THRESHOLDS.length - 1].color;
};

// Tooltip interface
interface TooltipState {
  show: boolean;
  x: number;
  y: number;
  day: string;
  hour: number;
  intensity: number;
}

const TOOLTIP_OFFSET = {x: 10, y: -10};

interface WeeklyHeatmapProps {
  selectedHeatmapType: string;
  data?: {
    success: boolean;
    data: HeatmapDataPoint[];
    meta: {
      dateRange: string;
      type: string;
      totalDataPoints: number;
    };
  };
  isLoading?: boolean;
  error?: Error;
}

const WeeklyHeatmap = ({selectedHeatmapType, data, isLoading, error}: WeeklyHeatmapProps) => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  const CELL_WIDTH = 56;
  const CELL_HEIGHT = 8;
  const CELL_GAP = 2;

  const [tooltip, setTooltip] = useState<TooltipState>({
    show: false,
    x: 0,
    y: 0,
    day: "",
    hour: 0,
    intensity: 0,
  });

  // Generate time labels (every 3 hours: 0:00, 3:00, 6:00, etc.)
  const getTimeLabel = (hour: number) => {
    if (hour % 3 === 0) {
      return `${hour.toString().padStart(2, "0")}:00`;
    }
    return "";
  };

  // Animation variants
  const containerVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.003,
        delayChildren: 0.05,
        duration: 0.3,
      },
    },
  } as const;

  const dayHeaderVariants = {
    hidden: {opacity: 0, y: -10},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 35,
        duration: 0.3,
      },
    },
  } as const;

  const timeLabelVariants = {
    hidden: {opacity: 0, x: -10},
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 35,
        duration: 0.3,
      },
    },
  } as const;

  const columnVariants = {
    hidden: {opacity: 0},
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01,
        duration: 0.2,
      },
    },
  } as const;

  const cellVariants = {
    hidden: {
      scale: 0,
      opacity: 0,
    },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 600,
        damping: 30,
        duration: 0.2,
      },
    },
  } as const;

  const legendVariants = {
    hidden: {opacity: 0, y: 10},
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        type: "spring",
        stiffness: 500,
        damping: 35,
        duration: 0.2,
      },
    },
  } as const;

  // Tooltip handlers
  const showTooltip = (event: React.MouseEvent, day: string, hour: number, intensity: number) => {
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      day,
      hour,
      intensity,
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
    setTooltip({show: false, x: 0, y: 0, day: "", hour: 0, intensity: 0});
  };

  // Handle loading state
  if (isLoading) {
    return (
      <HeatmapSkeleton CELL_WIDTH={CELL_WIDTH} CELL_HEIGHT={CELL_HEIGHT} CELL_GAP={CELL_GAP} />
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="w-full mt-[14px] flex items-center justify-center h-[200px]">
        <div className="text-center">
          <p className="text-muted-foreground text-sm">Failed to load heatmap data</p>
          <p className="text-xs text-muted-foreground mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  // Get the heatmap data or fallback to empty data
  const heatmapData = data?.data || [];
  const maxIntensity = getMaxIntensity(heatmapData);

  // Tooltip render function
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
              style={{backgroundColor: getIntensityColor(tooltip.intensity, maxIntensity)}}
            />
            <div className="flex flex-1 items-center leading-none">
              <span className="text-muted-foreground">
                {tooltip.day} {tooltip.hour.toString().padStart(2, "0")}:00:
              </span>
              <span className="font-mono font-medium tabular-nums text-foreground ml-1">
                {Math.round(tooltip.intensity).toLocaleString()} {selectedHeatmapType.toLowerCase()}
              </span>
            </div>
          </div>
        </div>
      </motion.div>,
      document.body,
    );
  };

  return (
    <motion.div
      className="w-full mt-[14px]"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <div className="flex">
        {/* Time labels column */}
        <div className="flex flex-col items-start pr-2">
          {/* Empty space to align with day headers */}
          <div style={{height: "24px", marginBottom: "3px"}}></div>

          {/* Time labels */}
          {Array.from({length: 24}, (_, hour) => (
            <motion.div
              key={hour}
              variants={timeLabelVariants}
              className="flex items-center justify-end text-xs text-muted-foreground"
              style={{
                height: `${CELL_HEIGHT}px`,
                marginBottom: hour < 23 ? `${CELL_GAP}px` : "0",
                lineHeight: `${CELL_HEIGHT}px`,
              }}>
              {getTimeLabel(hour)}
            </motion.div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1">
          {/* Day headers */}
          <div className="flex mb-2">
            {days.map((day, dayIndex) => (
              <motion.div
                key={day}
                variants={dayHeaderVariants}
                className="text-center text-xs text-muted-foreground"
                style={{
                  width: `${CELL_WIDTH + (dayIndex < days.length - 1 ? CELL_GAP : 0)}px`,
                }}>
                {day}
              </motion.div>
            ))}
          </div>

          {/* Heatmap cells */}
          <div className="flex">
            {days.map((day, dayIndex) => (
              <motion.div
                key={day}
                className="flex flex-col"
                style={{width: `${CELL_WIDTH + (dayIndex < days.length - 1 ? CELL_GAP : 0)}px`}}
                variants={columnVariants}>
                {Array.from({length: 24}, (_, hour) => {
                  const dataPoint = heatmapData.find(
                    (d) => d.dayIndex === dayIndex && d.hour === hour,
                  );
                  const intensity = dataPoint?.intensity || 0;

                  return (
                    <motion.div
                      key={`${day}-${hour}`}
                      variants={cellVariants}
                      className="hover:opacity-80 transition-opacity"
                      style={{
                        width: `${CELL_WIDTH}px`,
                        height: `${CELL_HEIGHT}px`,
                        marginBottom: hour < 23 ? `${CELL_GAP}px` : "0",
                        marginRight: dayIndex < days.length - 1 ? `${CELL_GAP}px` : "0",
                      }}
                      onMouseEnter={(event) => showTooltip(event, day, hour, intensity)}
                      onMouseMove={updateTooltipPosition}
                      onMouseLeave={hideTooltip}>
                      <div
                        className="rounded-sm w-full h-full"
                        style={{
                          backgroundColor: getIntensityColor(intensity, maxIntensity),
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <motion.div className="mt-4" variants={legendVariants}>
        <div className="text-xs text-muted-foreground mb-2">
          <span>Activity Level</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground mr-2">Low</span>
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((normalizedIntensity, index) => (
            <motion.div
              key={index}
              initial={{scale: 0}}
              animate={{scale: 1}}
              transition={{
                delay: 0.4 + index * 0.02,
                type: "spring",
                stiffness: 600,
                damping: 30,
                duration: 0.15,
              }}
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: getIntensityColor(
                  normalizedIntensity * maxIntensity,
                  maxIntensity,
                ),
              }}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-2">High</span>
        </div>
      </motion.div>

      {renderTooltip()}
    </motion.div>
  );
};

const HeatmapSkeleton = ({
  CELL_WIDTH,
  CELL_HEIGHT,
  CELL_GAP,
}: {
  CELL_WIDTH: number;
  CELL_HEIGHT: number;
  CELL_GAP: number;
}) => {
  const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div className="w-full mt-[14px]">
      <div className="flex">
        {/* Time labels column skeleton */}
        <div className="flex flex-col items-start pr-2">
          {/* Empty space to align with day headers */}
          <div style={{height: "24px", marginBottom: "3px"}}></div>

          {/* Time labels skeleton */}
          {Array.from({length: 24}, (_, hour) => (
            <div
              key={hour}
              className="flex items-center justify-end text-xs text-muted-foreground"
              style={{
                height: `${CELL_HEIGHT}px`,
                marginBottom: hour < 23 ? `${CELL_GAP}px` : "0",
                lineHeight: `${CELL_HEIGHT}px`,
              }}>
              {hour % 3 === 0 && (
                <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8" />
              )}
            </div>
          ))}
        </div>

        {/* Heatmap grid skeleton */}
        <div className="flex-1">
          {/* Day headers skeleton */}
          <div className="flex mb-2">
            {days.map((day, dayIndex) => (
              <div
                key={day}
                className="text-center text-xs text-muted-foreground"
                style={{
                  width: `${CELL_WIDTH + (dayIndex < days.length - 1 ? CELL_GAP : 0)}px`,
                }}>
                <div className="h-3 bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-6 mx-auto" />
              </div>
            ))}
          </div>

          {/* Heatmap cells skeleton */}
          <div className="flex">
            {days.map((day, dayIndex) => (
              <div
                key={day}
                className="flex flex-col"
                style={{width: `${CELL_WIDTH + (dayIndex < days.length - 1 ? CELL_GAP : 0)}px`}}>
                {Array.from({length: 24}, (_, hour) => (
                  <div
                    key={`${day}-${hour}`}
                    style={{
                      width: `${CELL_WIDTH}px`,
                      height: `${CELL_HEIGHT}px`,
                      marginBottom: hour < 23 ? `${CELL_GAP}px` : "0",
                      marginRight: dayIndex < days.length - 1 ? `${CELL_GAP}px` : "0",
                    }}>
                    <div className="rounded-sm w-full h-full bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend skeleton */}
      <div className="mt-4">
        <div className="text-xs text-muted-foreground mb-2">
          <div className="h-[1.125rem] bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-20" />
        </div>
        <div className="flex items-center gap-1">
          <div className="h-[1.125rem] bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-6 mr-2" />
          {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((_, index) => (
            <div
              key={index}
              className="w-3 h-3 rounded-sm bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite]"
            />
          ))}
          <div className="h-[1.125rem] bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 bg-[length:200%_100%] animate-[shimmer_2s_ease-in-out_infinite] rounded w-8 ml-2" />
        </div>
      </div>
    </div>
  );
};

export default WeeklyHeatmap;
