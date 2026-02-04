"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { Calendar, Heart, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineEvent = {
  year: string;
  title: string;
  date: string;
  location?: string;
  description: string;
  tags: string[];
  image: string | null;
};

export default function TimelineClient({ events }: { events: TimelineEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"]
  });
  
  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <div className="min-h-screen w-full text-gray-900 dark:text-white overflow-hidden relative pb-32">
       {/* Background Elements - Made transparent to show global hearts */}
       <div className="fixed inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/10 via-transparent to-transparent dark:from-purple-900/20 -z-10" />
       
       <div className="max-w-5xl mx-auto px-4 py-20 md:py-32" ref={containerRef}>
          {/* Header */}
          <div className="text-center mb-24 relative">
             <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className="inline-block mb-4"
             >
                <div className="p-3 rounded-full bg-white/20 dark:bg-white/5 border border-black/10 dark:border-white/10 backdrop-blur-md">
                   <Sparkles className="text-purple-600 dark:text-purple-400" size={24} />
                </div>
             </motion.div>
             <motion.h1 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-5xl md:text-7xl font-serif italic text-black dark:text-white mb-6 tracking-tight"
             >
                Our Journey
             </motion.h1>
             <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto font-mono text-xs tracking-[0.2em] uppercase">
                From the first hello to forever
             </p>
          </div>

          {/* Timeline Container */}
          <div className="relative">
             {/* Center Line (Desktop) */}
             <div className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-purple-500/30 to-transparent md:-translate-x-1/2" />
             
             {/* Dynamic Filling Line */}
            <motion.div 
                style={{ scaleY, originY: 0 }}
                className="absolute left-[19px] md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-400 via-purple-500 to-indigo-400 md:-translate-x-1/2 origin-top shadow-[0_0_15px_rgba(168,85,247,0.5)]"
            />

             <div className="space-y-12 md:space-y-32 mt-12">
                {events.map((event, index) => (
                   <TimelineItem key={index} event={event} index={index} />
                ))}
            </div>
             
             {/* End Marker */}
             <div className="absolute -bottom-8 left-[11px] md:left-1/2 md:-translate-x-1/2 p-2 bg-white dark:bg-black rounded-full border border-purple-300 dark:border-purple-500/50">
                <Heart size={16} className="text-purple-600 dark:text-purple-400 fill-purple-600 dark:fill-purple-400 animate-pulse" />
             </div>
          </div>
       </div>
    </div>
  );
}

function TimelineItem({ event, index }: { event: TimelineEvent, index: number }) {
  const isEven = index % 2 === 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className={cn(
        "relative flex flex-col md:flex-row gap-8 items-start",
        isEven ? "md:flex-row-reverse" : ""
      )}
    >
        {/* Date/Time Marker (Mobile: Left, Desktop: Center) */}
        <div className="absolute left-[10px] md:left-1/2 w-5 h-5 bg-white dark:bg-black border-2 border-purple-400 dark:border-purple-400 rounded-full z-10 md:-translate-x-1/2 mt-8 shadow-[0_0_15px_rgba(168,85,247,0.8)] dark:shadow-[0_0_15px_rgba(168,85,247,0.8)] flex items-center justify-center group-hover:scale-125 transition-transform">
            <div className="w-2 h-2 bg-purple-500 dark:bg-purple-500 rounded-full" />
        </div>

        {/* Content Card Side */}
        <div className={cn(
            "ml-12 md:ml-0 md:w-1/2 flex",
            isEven ? "md:pl-16 justify-start" : "md:pr-16 justify-end"
        )}>
             <div className="group relative w-full max-w-lg">
                {/* Visual Line Connector to Center (Desktop) */}
                <div className={cn(
                   "hidden md:block absolute top-10 h-px bg-gradient-to-r from-transparent via-purple-400/50 dark:via-purple-500/50 to-transparent w-16",
                   isEven ? "-left-16" : "-right-16"
                )} />

                <div className="relative overflow-hidden rounded-2xl bg-white/70 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 p-8 backdrop-blur-sm hover:bg-purple-50/50 dark:hover:bg-white/[0.06] hover:border-purple-400/50 dark:hover:border-purple-500/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl">
                   {/* Hover Glow */}
                   <div className="absolute -inset-0 bg-gradient-to-r from-purple-400/10 to-purple-600/10 dark:from-purple-500/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
                   
                   <div className="relative z-10">
                      <div className="flex items-center gap-3 text-purple-600 dark:text-purple-300 mb-4 font-mono text-xs tracking-wider">
                         <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 dark:bg-purple-500/10 border border-purple-500/20 dark:border-purple-500/20">
                            <Calendar size={12} /> {event.date}, {event.year}
                         </span>
                         {event.location && (
                           <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300">
                                <MapPin size={12} /> {event.location}
                           </span>
                         )}
                      </div>

                      <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-serif italic">{event.title}</h3>
                      
                      <p className="text-gray-700 dark:text-gray-400 leading-relaxed text-sm md:text-base mb-6 font-light">
                         {event.description}
                      </p>

                      {/* Photo Placeholder / Inspiration */}
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900 border border-black/5 dark:border-white/5 group-hover:border-purple-400/50 dark:group-hover:border-purple-500/20 transition-colors">
                          {event.image ? (
                             // eslint-disable-next-line @next/next/no-img-element
                             <img 
                                src={event.image} 
                                alt={event.title}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" 
                             />
                          ) : (
                             <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-700">
                                {/* Placeholder gradient mimicking the inspiration style */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-50 dark:from-purple-900 dark:via-zinc-900 dark:to-black opacity-50" />
                                <span className="relative font-serif italic block text-center opacity-80 dark:opacity-30 text-lg z-10 px-4">
                                  "Time stands still best in moments like this."
                                </span>
                             </div>
                          )}
                      </div>
                      
                      {/* Tags */}
                      <div className="flex gap-2 mt-6 flex-wrap">
                         {event.tags.map((tag: string, i: number) => (
                            <span key={i} className="text-[10px] uppercase tracking-widest text-purple-500 dark:text-gray-600 border border-purple-200 dark:border-white/5 px-2 py-1 rounded hover:border-purple-400 dark:hover:border-white/20 hover:text-purple-700 dark:hover:text-gray-400 transition-colors">#{tag}</span>
                         ))}
                      </div>
                   </div>
                </div>
             </div>
        </div>

        {/* Empty side for layout balance on Desktop */}
        <div className="hidden md:block md:w-1/2" />
    </motion.div>
  );
}