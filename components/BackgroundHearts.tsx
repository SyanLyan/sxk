"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useEffect, useState } from "react";

export default function BackgroundHearts() {
  const [mounted, setMounted] = useState(false);
  const [hearts, setHearts] = useState<Array<{
    id: number;
    color: string;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
    floatY: number;
    isFilled: boolean;
  }>>([]);

  useEffect(() => {
    setMounted(true);
    // Generate hearts only on client-side mount
    const heartCount = 15;
    const newHearts = Array.from({ length: heartCount }).map((_, i) => ({
      id: i,
      color: i % 2 === 0 ? "text-purple-500" : "text-purple-300",
      x: Math.random() * 100, // Percentage
      y: Math.random() * 100, // Percentage
      size: Math.random() * 30 + 10,
      duration: 10 + Math.random() * 10,
      delay: Math.random() * 5,
      floatY: Math.random() * -100,
      isFilled: i % 3 === 0,
    }));
    setHearts(newHearts);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {hearts.map((heart) => (
        <motion.div
          key={heart.id}
          className={`absolute ${heart.color} opacity-40 dark:opacity-70`}
          initial={{ 
            opacity: 0, 
            scale: 0,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.5, 0.5],
            y: [0, heart.floatY] // Float upward relative to initial top %
          }}
          transition={{
            duration: heart.duration,
            repeat: Infinity,
            delay: heart.delay,
            ease: "easeInOut",
          }}
          style={{
            left: `${heart.x}%`,
            top: `${heart.y}%`,
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
