"use client";

import * as React from "react";
import {createPortal} from "react-dom";
import {motion, AnimatePresence, LayoutGroup, type Transition} from "framer-motion";
import {cn} from "@/lib/utils";

type Side = "top" | "bottom" | "left" | "right";
type Align = "start" | "center" | "end";

type TooltipData = {
  content: React.ReactNode;
  rect: DOMRect;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
  className?: string;
};

type GlobalTooltipContextType = {
  showTooltip: (data: TooltipData) => void;
  hideTooltip: () => void;
  currentTooltip: TooltipData | null;
  transition: Transition;
  globalId: string;
};

const GlobalTooltipContext = React.createContext<GlobalTooltipContextType | undefined>(undefined);

const useGlobalTooltip = () => {
  const context = React.useContext(GlobalTooltipContext);
  if (!context) {
    throw new Error("useGlobalTooltip must be used within a TooltipProvider");
  }
  return context;
};

type TooltipPosition = {
  x: number;
  y: number;
  transform: string;
};

function getTooltipPosition({
  rect,
  side,
  sideOffset,
  align,
  alignOffset,
}: {
  rect: DOMRect;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
}): TooltipPosition {
  switch (side) {
    case "top":
      if (align === "start") {
        return {
          x: rect.left + alignOffset,
          y: rect.top - sideOffset,
          transform: "translate(0, -100%)",
        };
      } else if (align === "end") {
        return {
          x: rect.right + alignOffset,
          y: rect.top - sideOffset,
          transform: "translate(-100%, -100%)",
        };
      } else {
        // center
        return {
          x: rect.left + rect.width / 2,
          y: rect.top - sideOffset,
          transform: "translate(-50%, -100%)",
        };
      }
    case "bottom":
      if (align === "start") {
        return {
          x: rect.left + alignOffset,
          y: rect.bottom + sideOffset,
          transform: "translate(0, 0)",
        };
      } else if (align === "end") {
        return {
          x: rect.right + alignOffset,
          y: rect.bottom + sideOffset,
          transform: "translate(-100%, 0)",
        };
      } else {
        // center
        return {
          x: rect.left + rect.width / 2,
          y: rect.bottom + sideOffset,
          transform: "translate(-50%, 0)",
        };
      }
    case "left":
      if (align === "start") {
        return {
          x: rect.left - sideOffset,
          y: rect.top + alignOffset,
          transform: "translate(-100%, 0)",
        };
      } else if (align === "end") {
        return {
          x: rect.left - sideOffset,
          y: rect.bottom + alignOffset,
          transform: "translate(-100%, -100%)",
        };
      } else {
        // center
        return {
          x: rect.left - sideOffset,
          y: rect.top + rect.height / 2,
          transform: "translate(-100%, -50%)",
        };
      }
    case "right":
      if (align === "start") {
        return {
          x: rect.right + sideOffset,
          y: rect.top + alignOffset,
          transform: "translate(0, 0)",
        };
      } else if (align === "end") {
        return {
          x: rect.right + sideOffset,
          y: rect.bottom + alignOffset,
          transform: "translate(0, -100%)",
        };
      } else {
        // center
        return {
          x: rect.right + sideOffset,
          y: rect.top + rect.height / 2,
          transform: "translate(0, -50%)",
        };
      }
  }
}

type TooltipProviderProps = {
  children: React.ReactNode;
  openDelay?: number;
  closeDelay?: number;
  transition?: Transition;
};

export function AnimatedTooltipProvider({
  children,
  openDelay = 0,
  closeDelay = 0,
  transition = {
    type: "spring",
    stiffness: 400,
    damping: 30,
    mass: 0.8,
  },
}: TooltipProviderProps) {
  const globalId = React.useId();
  const [currentTooltip, setCurrentTooltip] = React.useState<TooltipData | null>(null);
  const timeoutRef = React.useRef<number | null>(null);
  const lastCloseTimeRef = React.useRef<number>(0);

  const showTooltip = React.useCallback(
    (data: TooltipData) => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (currentTooltip !== null) {
        setCurrentTooltip(data);
        return;
      }
      const now = Date.now();
      const delay = now - lastCloseTimeRef.current < closeDelay ? 0 : openDelay;
      timeoutRef.current = window.setTimeout(() => setCurrentTooltip(data), delay);
    },
    [openDelay, closeDelay, currentTooltip],
  );

  const hideTooltip = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      setCurrentTooltip(null);
      lastCloseTimeRef.current = Date.now();
    }, closeDelay);
  }, [closeDelay]);

  const hideImmediate = React.useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setCurrentTooltip(null);
    lastCloseTimeRef.current = Date.now();
  }, []);

  React.useEffect(() => {
    window.addEventListener("scroll", hideImmediate, true);
    return () => window.removeEventListener("scroll", hideImmediate, true);
  }, [hideImmediate]);

  return (
    <GlobalTooltipContext.Provider
      value={{
        showTooltip,
        hideTooltip,
        currentTooltip,
        transition,
        globalId,
      }}>
      <LayoutGroup>{children}</LayoutGroup>
      <TooltipOverlay />
    </GlobalTooltipContext.Provider>
  );
}

function TooltipPortal({children}: {children: React.ReactNode}) {
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => setIsMounted(true), []);
  return isMounted ? createPortal(children, document.body) : null;
}

function TooltipOverlay() {
  const {currentTooltip, transition, globalId} = useGlobalTooltip();

  const position = React.useMemo(() => {
    if (!currentTooltip) return null;
    return getTooltipPosition({
      rect: currentTooltip.rect,
      side: currentTooltip.side,
      sideOffset: currentTooltip.sideOffset,
      align: currentTooltip.align,
      alignOffset: currentTooltip.alignOffset,
    });
  }, [currentTooltip]);

  return (
    <AnimatePresence mode="wait">
      {currentTooltip && currentTooltip.content && position && (
        <TooltipPortal>
          <motion.div
            className="fixed z-[100]"
            style={{
              top: position.y,
              left: position.x,
              transform: position.transform,
            }}>
            <motion.div
              layoutId={`tooltip-overlay-${globalId}`}
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              transition={transition}
              className={currentTooltip.className}>
              {currentTooltip.content}
            </motion.div>
          </motion.div>
        </TooltipPortal>
      )}
    </AnimatePresence>
  );
}

type TooltipContextType = {
  content: React.ReactNode;
  setContent: React.Dispatch<React.SetStateAction<React.ReactNode>>;
  side: Side;
  sideOffset: number;
  align: Align;
  alignOffset: number;
  id: string;
  className?: string;
  setClassName: React.Dispatch<React.SetStateAction<string | undefined>>;
};

const TooltipContext = React.createContext<TooltipContextType | undefined>(undefined);

const useTooltip = () => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error("useTooltip must be used within a Tooltip");
  }
  return context;
};

type TooltipProps = {
  children: React.ReactNode;
  side?: Side;
  sideOffset?: number;
  align?: Align;
  alignOffset?: number;
};

export function AnimatedTooltip({
  children,
  side = "right",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
}: TooltipProps) {
  const id = React.useId();
  const [content, setContent] = React.useState<React.ReactNode>(null);
  const [className, setClassName] = React.useState<string | undefined>(undefined);

  return (
    <TooltipContext.Provider
      value={{
        content,
        setContent,
        side,
        sideOffset,
        align,
        alignOffset,
        id,
        className,
        setClassName,
      }}>
      {children}
    </TooltipContext.Provider>
  );
}

type TooltipContentProps = {
  children: React.ReactNode;
  className?: string;
};

export function AnimatedTooltipContent({children, className}: TooltipContentProps) {
  const {setContent, setClassName} = useTooltip();
  React.useEffect(() => {
    setContent(children);
    setClassName(className);
  }, [children, className, setContent, setClassName]);
  return null;
}

type TooltipTriggerProps = {
  children: React.ReactElement;
};

export function AnimatedTooltipTrigger({children}: TooltipTriggerProps) {
  const {content, side, sideOffset, align, alignOffset, id, className} = useTooltip();
  const {showTooltip, hideTooltip, currentTooltip} = useGlobalTooltip();
  const triggerRef = React.useRef<HTMLElement>(null);

  const handleOpen = React.useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    showTooltip({
      content,
      rect,
      side,
      sideOffset,
      align,
      alignOffset,
      id,
      className,
    });
  }, [showTooltip, content, side, sideOffset, align, alignOffset, id, className]);

  const handleMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      (children.props as React.HTMLAttributes<HTMLElement>)?.onMouseEnter?.(e);
      handleOpen();
    },
    [handleOpen, children.props],
  );

  const handleMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      (children.props as React.HTMLAttributes<HTMLElement>)?.onMouseLeave?.(e);
      hideTooltip();
    },
    [hideTooltip, children.props],
  );

  const handleFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      (children.props as React.HTMLAttributes<HTMLElement>)?.onFocus?.(e);
      handleOpen();
    },
    [handleOpen, children.props],
  );

  const handleBlur = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      (children.props as React.HTMLAttributes<HTMLElement>)?.onBlur?.(e);
      hideTooltip();
    },
    [hideTooltip, children.props],
  );

  React.useEffect(() => {
    if (currentTooltip?.id !== id) return;
    if (!triggerRef.current) return;

    if (currentTooltip.content === content && currentTooltip.className === className) return;

    const rect = triggerRef.current.getBoundingClientRect();
    showTooltip({
      content,
      rect,
      side,
      sideOffset,
      align,
      alignOffset,
      id,
      className,
    });
  }, [content, className, currentTooltip?.id]);

  return React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    onFocus: handleFocus,
    onBlur: handleBlur,
  } as React.HTMLAttributes<HTMLElement>);
}
