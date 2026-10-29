"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CountUpProps {
  to: number;
  suffix?: string;
  /** Animation length in ms */
  duration?: number;
}

/** Counts from 0 to `to` with ease-out once visible; the span fades/slides up 20px over 0.5s. */
export function CountUp({ to, suffix = "", duration = 2000 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setVisible(true);
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          setValue(Math.round(eased * to));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [to, duration]);

  return (
    <span
      ref={ref}
      className={cn(
        "inline-block transition-[opacity,transform] duration-500",
        visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0",
      )}
    >
      {value}
      {suffix}
    </span>
  );
}
