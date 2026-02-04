"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { Heart, Fingerprint } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeartGateProps {
  onUnlock: () => void;
}

export default function HeartGate({ onUnlock }: HeartGateProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound effect refs could go here

  useEffect(() => {
    // Lock body scroll when locked
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
    }

    if (isHolding && !isUnlocked) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleUnlock();
            return 100;
          }
          return prev + 2; // Speed of fill
        });
      }, 20);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (!isUnlocked) {
         // Drain back down if released
         const drain = setInterval(() => {
            setProgress((prev) => {
                if (prev <= 0) {
                    clearInterval(drain);
                    return 0;
                }
                return prev - 5;
            });
         }, 10);
      }
    }

    return () => {
      document.body.style.overflow = "unset";
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, isUnlocked]);

  const handleUnlock = () => {
    setIsUnlocked(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimeout(() => {
      onUnlock();
    }, 1000); // Wait for exit animation
  };

  return (
    <AnimatePresence>
      {!isUnlocked && (
        <motion.div
           exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
           transition={{ duration: 0.8, ease: "easeInOut" }}
           className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background select-none overflow-hidden"
           onMouseDown={() => setIsHolding(true)}
           onMouseUp={() => setIsHolding(false)}
           onTouchStart={() => setIsHolding(true)}
           onTouchEnd={() => setIsHolding(false)}
           onContextMenu={(e) => e.preventDefault()}
        >
          {/* Ambient Particles/Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-12 cursor-pointer">
            <div className="relative">
               {/* Pulsing Rings - Enhanced visibility */}
               <motion.div 
                 animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
                 transition={{ duration: 2, repeat: Infinity }}
                 className="absolute inset-0 rounded-full border border-purple-600/40 dark:border-purple-500/30 scale-150"
               />
               <motion.div 
                 animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0, 0.2] }}
                 transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                 className="absolute inset-0 rounded-full border border-purple-600/30 dark:border-purple-500/20 scale-150"
               />

               {/* The Button Container */}
               <div className="relative w-32 h-32 flex items-center justify-center">
                  {/* Background Track */}
                  <Heart 
                    size={80} 
                    className="text-purple-200/80 dark:text-white/10 absolute transition-colors" 
                    strokeWidth={1}
                  />

                  {/* Filling Heart */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden" style={{ clipPath: `inset(${100 - progress}% 0 0 0)` }}>
                     <Heart 
                        size={80} 
                        className="text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 drop-shadow-[0_0_20px_rgba(124,58,237,0.6)] dark:drop-shadow-[0_0_15px_rgba(168,85,247,0.8)]" 
                        strokeWidth={0}
                     />
                  </div>
                  
                  {/* Fingerprint Hint overlay */}
                  <motion.div 
                    animate={{ opacity: isHolding ? 0 : 0.8 }}
                    className="absolute inset-0 flex items-center justify-center text-purple-700/60 dark:text-purple-400/50"
                  >
                     <Fingerprint size={40} className={cn("transition-opacity", progress > 0 ? "opacity-0" : "opacity-80")} />
                  </motion.div>
               </div>
            </div>

            <div className="flex flex-col items-center gap-2">
                <motion.p 
                   animate={{ opacity: isHolding ? 1 : 0.8, letterSpacing: isHolding ? "0.3em" : "0.2em" }}
                   className="text-sm font-mono uppercase text-purple-950 dark:text-purple-200 font-bold tracking-[0.2em] drop-shadow-sm"
                >
                   {progress >= 100 ? "ACCESS GRANTED" : (isHolding ? "IDENTIFYING HEART..." : "HOLD TO CONNECT")}
                </motion.p>
                
                {/* Progress Bar Line */}
                <div className="w-48 h-1 bg-gray-300 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                       className="h-full bg-purple-600 dark:bg-purple-400 shadow-[0_0_15px_#7c3aed] dark:shadow-[0_0_10px_#a855f7]"
                       style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
          </div>
          
          <div className="absolute bottom-12 text-[10px] items-center gap-2 font-mono text-purple-900/40 dark:text-white/30 tracking-widest uppercase font-semibold">
             Sai x Kuu Secure Link
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
