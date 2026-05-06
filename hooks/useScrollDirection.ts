"use client";

import { useState, useEffect, useRef } from "react";

/**
 * Returns `true` when the user is scrolling DOWN (chrome should hide),
 * `false` when scrolling UP or near the top (chrome should show).
 *
 * Uses a 12px dead-zone so micro-scrolls don't jitter the UI.
 */
export function useScrollDirection(threshold = 40): boolean {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    function onScroll() {
      const y = window.scrollY;

      // Always show chrome near the top of the page
      if (y < 60) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      // Always show chrome at the bottom of the page
      const atBottom = (window.innerHeight + y) >= (document.documentElement.scrollHeight - 60);
      if (atBottom) {
        setHidden(false);
        lastY.current = y;
        return;
      }

      const delta = y - lastY.current;

      if (delta > threshold) {
        // scrolling down — hide
        setHidden(true);
        lastY.current = y;
      } else if (delta < -threshold) {
        // scrolling up — show
        setHidden(false);
        lastY.current = y;
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
