import {useRef, useCallback} from "react";

export const useDragScroll = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragScroll = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollRef.current) return;

    const startX = e.pageX - scrollRef.current.offsetLeft;
    const scrollLeft = scrollRef.current.scrollLeft;

    const onMouseMove = (event: MouseEvent) => {
      if (!scrollRef.current) return;
      const walk = (event.pageX - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!scrollRef.current || e.touches.length !== 1) return;

    const startX = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const scrollLeft = scrollRef.current.scrollLeft;

    const onTouchMove = (event: TouchEvent) => {
      if (!scrollRef.current || event.touches.length !== 1) return;
      const walk = (event.touches[0].pageX - startX) * 2;
      scrollRef.current.scrollLeft = scrollLeft - walk;
      event.preventDefault(); // Prevents page scrolling while dragging
    };

    const onTouchEnd = () => {
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };

    document.addEventListener("touchmove", onTouchMove, {passive: false});
    document.addEventListener("touchend", onTouchEnd);
  }, []);

  return {scrollRef, handleDragScroll, handleTouchStart};
};
