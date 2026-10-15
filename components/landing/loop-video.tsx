"use client";

import { useEffect, useRef } from "react";

// Muted background loop: plays only while on screen, never under reduced motion.
export function LoopVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // SSR markup omits the `muted` attribute, so set it before play() or autoplay is blocked.
    video.muted = true;
    const io = new IntersectionObserver(([entry]) =>
      entry.isIntersecting ? video.play().catch(() => {}) : video.pause(),
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden
      className={className}
    />
  );
}
