"use client";
import React, {useState, useRef, useEffect} from "react";
import {useTheme} from "next-themes";
import {motion} from "framer-motion";

type ColorData = {
  main: string;
  dark: string;
  shadow: string;
  glow: string;
};

const PixelatedGrid = () => {
  const {theme, resolvedTheme} = useTheme();
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);
  const [delayedHoverCells, setDelayedHoverCells] = useState<Set<number>>(new Set());
  const [cellsWithSoundPlayed, setCellsWithSoundPlayed] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  const [screenSize, setScreenSize] = useState<"sm" | "md" | "lg">("lg");

  useEffect(() => {
    setMounted(true);

    // Handle screen size detection
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setScreenSize("sm");
      } else if (width < 768) {
        setScreenSize("md");
      } else {
        setScreenSize("lg");
      }
    };

    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isDarkTheme = mounted && (theme === "dark" || resolvedTheme === "dark");
  const [cellColors, setCellColors] = useState<Map<number, ColorData>>(new Map());
  const timeoutRefs = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const audioRefs = useRef<{click: HTMLAudioElement | null; click2: HTMLAudioElement | null}>({
    click: null,
    click2: null,
  });

  const CLICK2_SOUND_PROBABILITY = 0.06; // 6% chance for click2.mp3, 94% for click.mp3
  const PURPLE_COLOR_PROBABILITY = 0.65; // 65% chance for purple color on pattern404 cells

  // Initialize audio elements
  useEffect(() => {
    audioRefs.current.click = new Audio("/sounds/click.mp3");
    audioRefs.current.click2 = new Audio("/sounds/click2.mp3");

    // Set volume (optional)
    if (audioRefs.current.click) audioRefs.current.click.volume = 0.3;
    if (audioRefs.current.click2) audioRefs.current.click2.volume = 0.3;

    return () => {
      // Cleanup audio references
      audioRefs.current.click = null;
      audioRefs.current.click2 = null;
    };
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeout) => clearTimeout(timeout));
      timeoutRefs.current.clear();
    };
  }, []);

  // Responsive grid dimensions and cell size
  const getGridConfig = () => {
    switch (screenSize) {
      case "sm":
        return {
          COLS: 13,
          ROWS: 9,
          CELL_SIZE: 20,
          GAP: 6,
          PADDING: 12,
        };
      case "md":
        return {
          COLS: 15,
          ROWS: 10,
          CELL_SIZE: 26,
          GAP: 8,
          PADDING: 16,
        };
      default:
        return {
          COLS: 17,
          ROWS: 11,
          CELL_SIZE: 32,
          GAP: 10,
          PADDING: 16,
        };
    }
  };

  const {COLS, ROWS, CELL_SIZE, GAP, PADDING} = getGridConfig();

  // Updated patterns for smaller grids
  const getPattern404 = () => {
    const fullPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const smallPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0],
      [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0],
      [0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const mediumPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    switch (screenSize) {
      case "sm":
        return smallPattern;
      case "md":
        return mediumPattern;
      default:
        return fullPattern;
    }
  };

  const getDarkPattern = () => {
    const fullPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1],
    ];

    const smallPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    const mediumPattern = [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    switch (screenSize) {
      case "sm":
        return smallPattern;
      case "md":
        return mediumPattern;
      default:
        return fullPattern;
    }
  };

  const pattern404 = getPattern404();
  const darkpattern = getDarkPattern();

  const isCellHighlighted = (row: number, col: number) => {
    return pattern404[row] && pattern404[row][col] === 1;
  };

  const isCellDarkPattern = (row: number, col: number) => {
    return darkpattern[row] && darkpattern[row][col] === 1;
  };

  const playRandomClickSound = () => {
    const random = Math.random();
    const soundToPlay =
      random < 1 - CLICK2_SOUND_PROBABILITY ? audioRefs.current.click : audioRefs.current.click2;

    if (soundToPlay) {
      // Reset the audio to start from beginning
      soundToPlay.currentTime = 0;
      soundToPlay.play().catch((error) => {
        console.log("Audio play failed:", error);
      });
    }
  };

  const handleMouseEnter = (index: number, row: number, col: number) => {
    setHoveredCell(index);

    // Play sound for pattern404 cells if they haven't played recently
    if (isCellHighlighted(row, col) && !cellsWithSoundPlayed.has(index)) {
      playRandomClickSound();
      setCellsWithSoundPlayed((prev) => new Set(prev).add(index));
    }

    // Set color for pattern404 cells if not already set
    if (isCellHighlighted(row, col) && !cellColors.has(index)) {
      const purpleColor = {
        main: "#7E72EE",
        dark: "#5B4FDB",
        shadow: "91, 79, 219",
        glow: "126, 114, 238",
      };

      const colorPalette = [
        {main: "#ff8308", dark: "#a14800", shadow: "122, 61, 0", glow: "255, 136, 0"}, // Orange
        {main: "#ff6b6b", dark: "#c92a2a", shadow: "150, 42, 42", glow: "255, 107, 107"}, // Red
        {main: "#4ecdc4", dark: "#38a3a5", shadow: "56, 163, 165", glow: "78, 205, 196"}, // Teal
        {main: "#45b7d1", dark: "#2980b9", shadow: "41, 128, 185", glow: "69, 183, 209"}, // Blue
        {main: "#96ceb4", dark: "#6ab04c", shadow: "106, 176, 76", glow: "150, 206, 180"}, // Green
        {main: "#feca57", dark: "#f39c12", shadow: "243, 156, 18", glow: "254, 202, 87"}, // Yellow
        {main: "#ff9ff3", dark: "#e056fd", shadow: "224, 86, 253", glow: "255, 159, 243"}, // Pink
        {main: "#a29bfe", dark: "#6c5ce7", shadow: "108, 92, 231", glow: "162, 155, 254"}, // Purple
        {main: "#fd79a8", dark: "#e84393", shadow: "232, 67, 147", glow: "253, 121, 168"}, // Magenta
        {main: "#fdcb6e", dark: "#e17055", shadow: "225, 112, 85", glow: "253, 203, 110"}, // Peach
      ];

      // Determine color based on probability (only once when first hovered)
      const random = Math.random();
      const selectedColor =
        random < PURPLE_COLOR_PROBABILITY ? purpleColor : colorPalette[index % colorPalette.length];

      setCellColors((prev) => new Map(prev).set(index, selectedColor));
    }

    // Clear any existing timeout for this cell
    const existingTimeout = timeoutRefs.current.get(index);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
      timeoutRefs.current.delete(index);
    }

    // Remove from delayed hover set if it was there
    setDelayedHoverCells((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index);
      return newSet;
    });
  };

  const handleMouseLeave = (index: number, row: number, col: number) => {
    setHoveredCell(null);

    const isPattern404 = isCellHighlighted(row, col);

    // Add to delayed hover set
    setDelayedHoverCells((prev) => new Set(prev).add(index));

    // Handle gray cell queue management (only for non-pattern404 cells)

    // Determine delay based on cell type
    const delay = isPattern404 ? 10000 : 1500; // 10s for pattern404, 1.5s for others

    // Set timeout to remove the effect
    const timeout = setTimeout(() => {
      setDelayedHoverCells((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });

      // Clear sound played flag for pattern404 cells (allows sound to play again)
      if (isPattern404) {
        setCellsWithSoundPlayed((prev) => {
          const newSet = new Set(prev);
          newSet.delete(index);
          return newSet;
        });

        // Clear stored color for pattern404 cells (allows new random color selection)
        setCellColors((prev) => {
          const newMap = new Map(prev);
          newMap.delete(index);
          return newMap;
        });
      }

      timeoutRefs.current.delete(index);
    }, delay);

    timeoutRefs.current.set(index, timeout);
  };

  const getCellType = (row: number, col: number, index: number) => {
    const isCurrentlyHovered = hoveredCell === index;
    const isDelayedHover = delayedHoverCells.has(index);

    if (isCurrentlyHovered || isDelayedHover) {
      // Only pattern404 cells get colorful hover effects
      if (isCellHighlighted(row, col)) {
        // Use stored color or fallback to orange if not set
        const storedColor = cellColors.get(index);
        const fallbackColor = {
          main: "#ff8308",
          dark: "#a14800",
          shadow: "122, 61, 0",
          glow: "255, 136, 0",
        };

        return {type: "hover", colorData: storedColor || fallbackColor};
      } else {
        // All other cells get subtle gray hover
        return {type: "grayHover", color: "#3a3a3a"};
      }
    }

    if (isCellDarkPattern(row, col)) {
      return {type: "dark", color: ""};
    }

    if (isCellHighlighted(row, col)) {
      return {type: "highlighted", color: ""};
    }

    return {type: "default", color: ""};
  };

  const getBackgroundStyle = (cellInfo: ReturnType<typeof getCellType>) => {
    switch (cellInfo.type) {
      case "hover":
        return `linear-gradient(180deg, ${cellInfo.colorData?.main || "#ff8308"} 0%, ${cellInfo.colorData?.dark || "#a14800"} 100%)`;
      case "grayHover":
        if (isDarkTheme) {
          return `linear-gradient(180deg, ${cellInfo.color} 0%, #2a2a2a 100%)`;
        } else {
          return `linear-gradient(180deg, #d1d5db 0%, #9ca3af 100%)`;
        }
      case "dark":
        if (isDarkTheme) {
          return "linear-gradient(180deg, #050505 0%, #000 100%)";
        } else {
          return "linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%)";
        }
      case "highlighted":
        if (isDarkTheme) {
          return "linear-gradient(180deg, #575757 0%, #2e2e2e 100%)";
        } else {
          return "linear-gradient(180deg, #9ca3af 0%, #6b7280 100%)";
        }
      default:
        if (isDarkTheme) {
          return "linear-gradient(180deg, #0f0f0f 0%, #0a0a0a 100%)";
        } else {
          return "linear-gradient(180deg, #f9fafb 0%, #e5e7eb 100%)";
        }
    }
  };

  const getBoxShadowStyle = (cellInfo: ReturnType<typeof getCellType>) => {
    if (cellInfo.type === "hover") {
      const shadowColor = cellInfo.colorData?.shadow || "122, 61, 0";
      const glowColor = cellInfo.colorData?.glow || "255, 136, 0";
      if (isDarkTheme) {
        return `inset 0 -6px 9px 0 rgba(${shadowColor}, 0.51), inset 0 6px 6px 0 rgba(255, 255, 255, 0.25), 0 0 14px 0 rgba(${glowColor}, 0.32), 0 0 24px 0 rgba(${glowColor}, 0.2)`;
      } else {
        return `inset 0 -6px 9px 0 rgba(${shadowColor}, 0.51), inset 0 6px 6px 0 rgba(255, 255, 255, 0.3), 0 0 14px 0 rgba(${glowColor}, 0.35), 0 0 24px 0 rgba(${glowColor}, 0.22)`;
      }
    } else if (cellInfo.type === "grayHover") {
      if (isDarkTheme) {
        return "inset 0 8px 2px -8px rgba(255, 255, 255, 0.08), inset 0 -3px 4px -3px rgba(0, 0, 0, 0.2)";
      } else {
        return "inset 0 2px 4px 0 rgba(0, 0, 0, 0.1), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.1)";
      }
    } else if (cellInfo.type === "dark") {
      if (isDarkTheme) {
        return "inset 0 -2px 3px 0 rgba(64, 64, 64, 0.25), inset 0 1px 2px 0 rgba(28, 28, 28, 0.25)";
      } else {
        return "inset 0 1px 3px 0 rgba(255, 255, 255, 0.8), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.05)";
      }
    } else if (cellInfo.type === "highlighted") {
      if (isDarkTheme) {
        return "inset 0 4px 6px 0 rgba(255, 255, 255, 0.25), inset 0 -5px 6px 0 rgba(0, 0, 0, 0.12), inset 0 2px 2px 0 rgba(255, 255, 255, 0.06)";
      } else {
        return "inset 0 2px 4px 0 rgba(0, 0, 0, 0.2), inset 0 -2px 4px 0 rgba(0, 0, 0, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)";
      }
    } else {
      if (isDarkTheme) {
        return "inset 0 8px 2px -8px rgba(255, 255, 255, 0.08), inset 0 -3px 4px -3px rgba(0, 0, 0, 0.2)";
      } else {
        return "inset 0 1px 2px 0 rgba(0, 0, 0, 0.1), inset 0 -1px 2px 0 rgba(0, 0, 0, 0.05)";
      }
    }
  };

  const getOpacityOverlay = (cellInfo: ReturnType<typeof getCellType>) => {
    if (cellInfo.type === "grayHover") {
      if (isDarkTheme) {
        return "rgba(58, 58, 58, 0.7)";
      } else {
        return "rgba(209, 213, 219, 0.7)";
      }
    } else if (cellInfo.type === "hover") {
      const glowColor = cellInfo.colorData?.glow || "255, 136, 0";
      return `rgba(${glowColor}, 0.1)`;
    }
    return "transparent";
  };

  const getBorderRadius = (row: number, col: number) => {
    if (isCellHighlighted(row, col)) {
      return "8px";
    } else {
      return "4px";
    }
  };

  return (
    <motion.div
      initial={{opacity: 0, y: 20}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.3, delay: 0.3, ease: "easeOut"}}
      className="grid rounded-[8px] dark:bg-black"
      style={{
        gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
        gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
        gap: `${GAP}px`,
        padding: `${PADDING}px`,
        boxShadow: isDarkTheme
          ? "inset 1px 1px 4px 0 rgba(77, 77, 77, 0.25), 1px 1px 4px 0 rgba(255, 255, 255, 0.05)"
          : "inset 1px 1px 4px 0 rgba(0, 0, 0, 0.1), 1px 1px 4px 0 rgba(0, 0, 0, 0.1)",
      }}>
      {Array.from({length: ROWS * COLS}, (_, index) => {
        const row = Math.floor(index / COLS);
        const col = index % COLS;
        const cellInfo = getCellType(row, col, index);

        return (
          <div
            key={index}
            className="relative"
            style={{
              width: `${CELL_SIZE}px`,
              height: `${CELL_SIZE}px`,
              background: getBackgroundStyle(cellInfo),
              borderRadius: getBorderRadius(row, col),
              transition: "all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
              willChange: "background, transform",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            onMouseEnter={() => handleMouseEnter(index, row, col)}
            onMouseLeave={() => handleMouseLeave(index, row, col)}>
            {/* Overlay for smooth color transitions */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: getOpacityOverlay(cellInfo),
                borderRadius: getBorderRadius(row, col),
                transition:
                  "background-color 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                willChange: "background-color, opacity",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            />
            {/* Shadow layer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: getBoxShadowStyle(cellInfo),
                borderRadius: getBorderRadius(row, col),
                transition: "box-shadow 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                willChange: "box-shadow",
                backfaceVisibility: "hidden",
                transform: "translateZ(0)",
              }}
            />
          </div>
        );
      })}
    </motion.div>
  );
};

export default PixelatedGrid;
