"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";

const SPOTIFY_URL =
  "https://open.spotify.com/playlist/0yXxCQ6Lr1H20kScZsvBUV?si=kJAY1n3rQSCDgof2NsylkA&pi=BbMhqPUKQSqN3";

export default function HeroLogo() {
  const lastTap = useRef(0);

  const handleTap = useCallback(() => {
    const now = Date.now();
    if (now - lastTap.current < 400) {
      window.open(SPOTIFY_URL, "_blank", "noopener");
    }
    lastTap.current = now;
  }, []);

  return (
    <Image
      src="/images/logotrans.png"
      alt="Cove"
      width={280}
      height={118}
      className="hero-logo block mb-6 relative z-10 cursor-pointer"
      priority
      onClick={handleTap}
    />
  );
}
