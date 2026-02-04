"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import DistanceCalculator from "@/components/DistanceCalculator";

const quotes = [
  "You remain my constant.",
  "In every lifetime, I would choose you.",
  "Time grows quiet in your presence.",
  "Where I am held by you, I am home.",
  "Time has only refined what we share.",
  "A story written patiently, moment by moment.",
  "Unhurried. Unbroken. Ours.",
  "Measured in time, held in the heart."
];

export default function Home() {
  const [elapsed, setElapsed] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // START DATE: December 27th, 2024, 00:00:00 (Yangon Time: UTC+06:30)
    const startDate = new Date("2024-12-27T00:00:00+06:30");

    const timer = setInterval(() => {
      const now = new Date();
      const difference = now.getTime() - startDate.getTime();

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      const milliseconds = Math.floor(difference % 1000);

      setElapsed({ days, hours, minutes, seconds, milliseconds });
    }, 28); // Refresh ~30fps for smooth ms counter

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearInterval(quoteInterval);
    };
  }, []);

  return (
    <main className="w-full relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-300/20 dark:bg-purple-900/20 blur-[120px] rounded-full pointer-events-none -z-10" />

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center min-h-screen w-full relative">
        <div className="relative">
          <h1 className="text-6xl md:text-9xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-purple-700 to-purple-500 dark:from-white dark:to-gray-500 font-sans relative z-10 transition-all">
            Sai <span className="text-purple-600 dark:text-purple-500">x</span> Kuu
          </h1>
        </div>

        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.5, duration: 1 }}
            className="flex flex-col items-center mt-2 group cursor-default"
        >
          <span className="text-xs md:text-sm font-mono text-foreground/80 dark:text-purple-300 tracking-widest mb-4 opacity-80 font-medium">
            Every moment with you has been counting since...
          </span>

          <div className="text-4xl md:text-6xl font-mono text-foreground dark:text-purple-300 tracking-widest font-bold text-glow-accent">
            {elapsed.days} <span className="text-lg md:text-2xl text-accent dark:text-purple-500 font-sans">DAYS</span>
          </div>
          <div className="text-xl md:text-3xl font-mono text-foreground/90 dark:text-purple-400/80 mt-2 tracking-wider font-semibold">
             {String(elapsed.hours).padStart(2, '0')}:{String(elapsed.minutes).padStart(2, '0')}:{String(elapsed.seconds).padStart(2, '0')}<span className="text-sm md:text-lg opacity-60">.{String(elapsed.milliseconds).padStart(3, '0')}</span>
          </div>
        </motion.div>

        <div className="h-16 flex items-center justify-center mt-8">
            <motion.p
                key={quoteIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-gray-800 dark:text-gray-400 italic text-center max-w-md font-mono font-medium"
            >
                &quot;{quotes[quoteIndex]}&quot;
            </motion.p>
        </div>

        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-8 flex flex-col items-center gap-2"
        >
           <span className="text-xs text-purple-500 dark:text-gray-600 font-mono font-semibold">SCROLL TO CONNECT</span>
           <div className="w-[1px] h-12 bg-gradient-to-b from-purple-500 dark:from-purple-500 to-transparent" />
        </motion.div>
      </section>

      {/* DISTANCE SECTION */}
      <DistanceCalculator />
    </main>
  );
}
