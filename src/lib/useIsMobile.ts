"use client";

import { useState, useEffect } from "react";

/**
 * Returns true on screens narrower than 768px.
 * Starts as `false` on the server to avoid hydration mismatches;
 * updates on mount via matchMedia.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isMobile;
}
