"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackgroundHearts() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const [hearts, setHearts] = useState<Array<{
    id: number;
    color: string;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    floatY: number;
    driftX: number;
    opacity: number;
    blur: number;
    isFilled: boolean;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined"
      ? localStorage.getItem("sxk-bg-hearts")
      : null;

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHearts(parsed);
          return;
        }
      } catch {
        // Fall back to regeneration
      }
    }

    // Generate hearts only on client-side mount
    const heartCount = 15;
    const palette = [
      "text-purple-500",
      "text-purple-300",
      "text-pink-400",
      "text-fuchsia-400",
      "text-sky-400",
    ];

    const newHearts = Array.from({ length: heartCount }).map((_, i) => {
      const size = Math.random() * 30 + 10;
      const depth = Math.min(1, Math.max(0, (size - 10) / 30));
      const opacity = 0.25 + depth * 0.35;
      const blur = Math.max(0, (1 - depth) * 2.5);

      return {
        id: i,
        color: palette[i % palette.length],
        x: Math.random() * 100,
        y: Math.random() * 100,
        size,
        duration: 10 + Math.random() * 10,
        delay: Math.random() * 5,
        floatY: Math.random() * -100,
        driftX: (Math.random() * 40 - 20),
        opacity,
        blur,
        isFilled: i % 3 === 0,
      };
    });

    setHearts(newHearts);
    try {
      localStorage.setItem("sxk-bg-hearts", JSON.stringify(newHearts));
    } catch {
      // Ignore storage errors
    }
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className={`absolute ${heart.color} transform-gpu will-change-transform`}
          initial={{ 
            opacity: 0, 
            scale: 0,
          }}
          animate={{
            opacity: prefersReducedMotion ? heart.opacity : [0, heart.opacity, 0],
            scale: prefersReducedMotion ? 1 : [0.5, 1.5, 0.5],
            y: prefersReducedMotion ? 0 : [0, heart.floatY],
            x: prefersReducedMotion ? 0 : [0, heart.driftX, 0],
          }}
          transition={{
            duration: prefersReducedMotion ? 0 : heart.duration,
            repeat: prefersReducedMotion ? 0 : Infinity,
            delay: prefersReducedMotion ? 0 : heart.delay,
            ease: "easeInOut",
          }}
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
            opacity: heart.opacity,
            filter: `blur(${heart.blur}px)`,
          }}
        >
           <Heart 
             size={heart.size} 
             strokeWidth={1.5}
             className={heart.isFilled ? "fill-current" : ""} 
           />
        </motion.div>
      ))}
    </div>
  );
}
