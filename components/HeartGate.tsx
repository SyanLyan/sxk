"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Heart, Fingerprint, Lock, Sparkles } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

interface HeartGateProps {
  onUnlock: () => void;
}

export default function HeartGate({ onUnlock }: HeartGateProps) {
  const [isHolding, setIsHolding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sessionSetRef = useRef(false);
  const SESSION_CODE_KEY = "sxk-session-code";
  const SESSION_ORIGIN_KEY = "sxk-session-origin";

  // Audio Context Ref
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  const playUnlockSound = useCallback(() => {
    try {
      if (!audioContextRef.current) {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          audioContextRef.current = new AudioContext();
        }
      }

      const ctx = audioContextRef.current;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;

      // C5, E5, G5, D6 - Success Chord
      const frequencies = [523.25, 659.25, 783.99, 1174.66]; 
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.value = freq;
        osc.type = "sine";
        
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.05, now + 0.05 + (i * 0.05));
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start(now + (i * 0.05));
        osc.stop(now + 2.0);
      });

      // Sparkle texture
      const oscHigh = ctx.createOscillator();
      const gainHigh = ctx.createGain();
      oscHigh.frequency.value = 2000;
      oscHigh.type = "triangle";
      gainHigh.gain.setValueAtTime(0, now);
      gainHigh.gain.linearRampToValueAtTime(0.02, now + 0.1);
      gainHigh.gain.linearRampToValueAtTime(0, now + 0.5);
      oscHigh.connect(gainHigh);
      gainHigh.connect(ctx.destination);
      oscHigh.start(now);
      oscHigh.stop(now + 0.5);

    } catch (error) {
      console.error("Audio error:", error);
    }
  }, []);

  useEffect(() => {
    // Lock body scroll when locked
    if (!isUnlocked) {
      document.body.style.overflow = "hidden";
    }

    if (isHolding && !isUnlocked) {
      intervalRef.current = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          return prev + (prev > 70 ? 3 : 2); // Accelerate
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

    if (progress >= 100 && !isUnlocked) {
        handleUnlock();
    }

    return () => {
      document.body.style.overflow = "unset";
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isHolding, isUnlocked, progress]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionFromUrl = params.get("session");
    if (sessionFromUrl) {
      handleUnlock(sessionFromUrl, "link");
    }
  }, []);

  const generateSessionCode = () => {
    return Math.random().toString(36).slice(2, 8).toUpperCase();
  };

  const handleUnlock = (code?: string, origin?: "local" | "link") => {
    if (isUnlocked) return;
    playUnlockSound();

    if (code) {
      setSessionCode(code);
      if (origin) setSessionOrigin(origin);
    } else if (!sessionSetRef.current) {
      setSessionCode(generateSessionCode());
      setSessionOrigin("local");
    }
    
    setIsUnlocked(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    setTimeout(() => {
      onUnlock();
    }, 1200);
  };

  const setSessionCode = (code: string) => {
    try {
      sessionSetRef.current = true;
      localStorage.setItem(SESSION_CODE_KEY, code);
      window.dispatchEvent(
        new CustomEvent("sxk-session-code", { detail: code }),
      );
    } catch {
      // Ignore
    }
  };

  const setSessionOrigin = (origin: "local" | "link") => {
    try {
      localStorage.setItem(SESSION_ORIGIN_KEY, origin);
      window.dispatchEvent(
        new CustomEvent("sxk-session-origin", { detail: origin }),
      );
    } catch {
      // Ignore
    }
  };

  const containerVariants = {
      idle: { scale: 1 },
      holding: { scale: 1.05 },
      shaking: { 
          x: [0, -2, 2, -2, 2, 0],
          transition: { duration: 0.2, repeat: Infinity }
      },
      unlocked: { scale: 1.1, filter: "brightness(1.2)" }
  };

  return (
    <AnimatePresence>
      {!isUnlocked && (
        <motion.div
           exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
           transition={{ duration: 0.8, ease: "easeInOut" }}
           className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background select-none overflow-hidden touch-none"
           onMouseDown={() => setIsHolding(true)}
           onMouseUp={() => setIsHolding(false)}
           onTouchStart={() => setIsHolding(true)}
           onTouchEnd={() => setIsHolding(false)}
           onContextMenu={(e) => e.preventDefault()}
        >
          {/* Enhanced Background */}
          <motion.div 
            className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent pointer-events-none"
            animate={{ opacity: isHolding ? 0.6 : 0.2 }}
          />

          {/* Ambient Particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow" />
             <motion.div 
                animate={{ scale: isHolding ? 1.2 : 0.8, opacity: isHolding ? 0.3 : 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-600/20 blur-[80px] rounded-full transition-all duration-500"
             />
          </div>

          <motion.div 
             className="relative z-10 flex flex-col items-center gap-16 cursor-pointer"
             variants={containerVariants}
             animate={progress > 85 && !isUnlocked ? "shaking" : isHolding ? "holding" : "idle"}
          >
            <div className="relative">
               {/* Rings */}
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

              {/* Ring Progress */}
              <motion.svg
                className="absolute inset-[-20%] w-[140%] h-[140%] -rotate-90 pointer-events-none"
                animate={{ rotate: 360 }}
                transition={{ duration: 16, ease: "linear", repeat: Infinity }}
                style={{ transformOrigin: "50% 50%" }}
              >
                <defs>
                  <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-200/10"
                />
                <motion.circle
                  cx="50%"
                  cy="50%"
                  r="48%"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-purple-500"
                  strokeDasharray="100"
                  strokeDashoffset={100 - progress}
                  pathLength="100"
                  filter="url(#ringGlow)"
                />
              </motion.svg>

               <div className="relative w-32 h-32 flex items-center justify-center">
                  <Heart 
                    size={80} 
                    className="text-purple-200/50 dark:text-white/5 absolute transition-colors" 
                    strokeWidth={1}
                  />

                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-full" 
                       style={{ 
                           clipPath: `inset(${100 - progress}% 0 0 0)`,
                           filter: "drop-shadow(0 0 10px rgba(124,58,237,0.5))"
                        }}>
                     <Heart 
                        size={80} 
                        className="text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400" 
                        strokeWidth={0}
                     />
                     <div className="absolute top-0 right-0 w-full h-full rounded-full bg-gradient-to-tr from-transparent via-white/20 to-transparent opacity-50" />
                  </div>
                  
                  <motion.div 
                    animate={{ opacity: isHolding ? 0 : 0.6, scale: isHolding ? 0.8 : 1 }}
                    className="absolute inset-0 flex items-center justify-center text-purple-700/60 dark:text-purple-400/40"
                  >
                     <Fingerprint size={42} className={cn("transition-opacity", progress > 0 ? "opacity-0" : "opacity-100")} />
                  </motion.div>

                  <AnimatePresence>
                    {isUnlocked && (
                        <motion.div 
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            className="absolute inset-0 flex items-center justify-center text-white drop-shadow-lg z-20"
                        >
                            <Sparkles size={48} className="text-yellow-200 fill-yellow-200" />
                        </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>

            <div className="flex flex-col items-center gap-3">
                <motion.div 
                   className="flex items-center gap-2"
                   animate={{ 
                       opacity: isHolding ? 1 : 0.7, 
                       y: isHolding ? -2 : 0
                   }}
                >
                    <Lock size={12} className={cn("text-purple-400", isUnlocked ? "text-green-400" : "")} />
                    <motion.p 
                        className="text-sm font-mono uppercase text-purple-950 dark:text-purple-200 font-bold tracking-[0.25em] drop-shadow-sm"
                    >
                        {isUnlocked 
                            ? "ACCESS GRANTED" 
                            : (progress > 0 
                                ? `IDENTIFYING ${Math.floor(progress)}%` 
                                : "HOLD TO CONNECT")}
                    </motion.p>
                </motion.div>
                
                <div className="w-64 h-0.5 bg-gray-200/20 dark:bg-white/5 rounded-full overflow-hidden flex items-center justify-center">
                    <motion.div 
                     className="h-full rounded-full bg-gradient-to-r from-transparent via-purple-500 to-transparent shadow-[0_0_15px_#7c3aed]"
                       style={{ width: `${progress}%`, opacity: progress > 0 ? 1 : 0 }}
                    />
                </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute bottom-12 text-[10px] flex items-center gap-2 font-mono text-purple-900/30 dark:text-white/20 tracking-[0.3em] uppercase font-semibold selection:bg-none"
          >
             Sai x Kuu Secure Link
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
