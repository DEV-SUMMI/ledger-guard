"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** Stagger delay in ms, applied to the opacity/transform transition */
  delay?: number;
}

/**
 * Scroll-triggered fade-up used throughout the source site:
 * opacity 0 → 1 and translateY(50px) → 0 over 0.8s cubic-bezier(.16,1,.3,1),
 * fired once when the element intersects the viewport.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,transform] duration-800 ease-[cubic-bezier(0.16,1,0.3,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-[50px] opacity-0",
        className,
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
