"use client";

import { useEffect, useRef } from "react";

type Blob = {
  className: string;
  depth: number;
};

const BLOBS: Blob[] = [
  {
    className:
      "top-[10%] left-[8%] h-28 w-28 bg-brand-soft/70 rounded-[48px_40px_44px_36px]",
    depth: 8,
  },
  {
    className:
      "top-[48%] right-[12%] h-36 w-36 bg-brand/60 rounded-[70px_28px_60px_52px]",
    depth: 18,
  },
  {
    className:
      "top-[52%] right-[16%] h-20 w-20 bg-brand-soft/80 rounded-[36px_30px_32px_26px]",
    depth: 22,
  },
  {
    className:
      "bottom-[4%] left-[10%] h-24 w-24 bg-brand-soft/60 rounded-[40px_34px_38px_30px] hidden sm:block",
    depth: 6,
  },
];

export function NotFoundBlobs() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const blobEls = Array.from(
      container.querySelectorAll<HTMLElement>("[data-blob]")
    );

    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const offsetX = (event.clientX / innerWidth - 0.5) * 2;
      const offsetY = (event.clientY / innerHeight - 0.5) * 2;

      blobEls.forEach((el) => {
        const depth = Number(el.dataset.depth ?? 0);
        el.style.transform = `translate(${offsetX * depth}px, ${
          offsetY * depth
        }px)`;
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {BLOBS.map((blob, index) => (
        <div
          key={index}
          data-blob
          data-depth={blob.depth}
          aria-hidden="true"
          className={`pointer-events-none absolute transition-transform duration-300 ease-out motion-reduce:!transform-none ${blob.className}`}
        />
      ))}
    </div>
  );
}