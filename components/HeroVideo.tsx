"use client";

import { useRef, useEffect } from "react";

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Force play on mount — some mobile browsers need this
    videoRef.current?.play().catch(() => {});
  }, []);

  return (
    <>
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        poster="/images/covehero.jpg"
        aria-hidden="true"
      >
        <source src="/videos/covehero.webm" type="video/webm" />
        <source src="/videos/covehero.mp4" type="video/mp4" />
      </video>

      {/* Gradient overlay — light at top to let sky breathe, solid at bottom seam */}
      <div
        className="absolute inset-0"
        aria-hidden="true"
        style={{
          background:
            "linear-gradient(to bottom, rgba(11,45,27,0.05) 0%, rgba(11,45,27,0.15) 35%, rgba(11,45,27,0.5) 75%, #0b2d1b 100%)",
        }}
      />
    </>
  );
}
