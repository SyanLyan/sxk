"use client";

import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Play,
  Image as ImageIcon,
  X,
  MapPin,
  Calendar,
  Film,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

// Helper to check for video files
const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

export type MomentItem = {
  id: number;
  title: string;
  date: string;
  location: string;
  type: "video" | "image";
  src: string;
  description: string;
  tags: string[];
};

export type CollectionItem = {
    id: string;
    title: string;
    description: string;
    cover: string;
    images: string[];
};

export default function MomentsClient({ moments, collections }: { moments: MomentItem[], collections: CollectionItem[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Collection State
  const [selectedCollection, setSelectedCollection] = useState<CollectionItem | null>(null);

  if (moments.length === 0 && collections.length === 0) {
    return (
      <div className="min-h-screen w-full pt-28 pb-32 px-4 md:px-12 relative z-10 flex flex-col items-center">
        <div className="text-center max-w-xl">
          <h1 className="text-4xl md:text-6xl font-serif italic text-gray-900 dark:text-white mb-4">
            No Moments Yet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 font-mono text-xs tracking-[0.2em] uppercase">
            Add images or videos to /assets/together
          </p>
        </div>
      </div>
    );
  }

  const selectedMoment = moments.find((m) => m.id === selectedId);

  const handleCardClick = (id: number, layoutId: string) => {
    setSelectedId(id);
    setActiveLayoutId(layoutId);
  };

  const closeSelection = () => {
    setSelectedId(null);
    setActiveLayoutId(null);
  };

  // Helper to get circular index
  const getMoment = (offset: number) => {
    const index = (activeIndex + offset + moments.length) % moments.length;
    return moments[index];
  };

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % moments.length);
  const prevSlide = () =>
    setActiveIndex((prev) => (prev - 1 + moments.length) % moments.length);

  return (
    <div className="min-h-screen w-full pt-16 pb-12 px-4 md:px-12 relative z-10 flex flex-col items-center">
      <div className="w-full max-w-7xl mx-auto md:min-h-screen flex flex-col justify-start md:justify-center">
        {/* Editorial Header */}
        <div className="text-center mb-10 max-w-2xl mx-auto relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/10 dark:bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-gray-900 dark:text-white mb-2 font-display">
          COLLECTING{" "}
          <span className="font-serif italic text-purple-600 dark:text-purple-300">our unique</span>
        </h1>
        <h2 className="text-4xl md:text-6xl font-serif italic text-gray-900/90 dark:text-white/90">
          love story.
        </h2>
        <div className="mt-8 flex justify-center items-center gap-4 text-[10px] tracking-[0.2em] text-gray-500 dark:text-gray-400 font-mono uppercase">
          <span>Memory Bank</span>
          <div className="w-12 h-[1px] bg-gray-300 dark:bg-white/20" />
          <span>Est. 2024</span>
        </div>
        </div>

        {/* Showcase Layout (Inspired by Juno) */}
        <div className="w-full max-w-7xl mx-auto relative">
        {/* Navigation Buttons */}
        <div className="hidden md:flex absolute top-1/2 left-0 right-0 -translate-y-1/2 justify-between items-center z-30 px-4 pointer-events-none">
          <button
            onClick={prevSlide}
            className="pointer-events-auto p-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-110 transition-all text-gray-600 dark:text-white/70 hover:text-purple-600 dark:hover:text-white group"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={nextSlide}
            className="pointer-events-auto p-4 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-md border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 hover:scale-110 transition-all text-gray-600 dark:text-white/70 hover:text-purple-600 dark:hover:text-white group"
          >
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Desktop Triptych View */}
        <div className="hidden md:flex items-center justify-center gap-6 lg:gap-12 h-[600px] perspective-[1000px]">
          {/* Left Column (Previous) */}
          {getMoment(-1) && (
            <MomentCard
              key={getMoment(-1).id}
              moment={getMoment(-1)}
              layoutId={`desktop-card-${getMoment(-1).id}`}
              onClick={() =>
                handleCardClick(
                  getMoment(-1).id,
                  `desktop-card-${getMoment(-1).id}`,
                )
              }
              className="w-1/4 h-[350px] translate-y-12 opacity-60 hover:opacity-100 transition-opacity"
            />
          )}

          {/* Center Hero (Active) */}
          {getMoment(0) && (
            <MomentCard
              key={getMoment(0).id}
              moment={getMoment(0)}
              layoutId={`desktop-card-${getMoment(0).id}`}
              onClick={() =>
                handleCardClick(
                  getMoment(0).id,
                  `desktop-card-${getMoment(0).id}`,
                )
              }
              className="w-2/4 h-[550px] z-10 shadow-2xl shadow-purple-900/20 ring-1 ring-purple-500/20"
              priority
            />
          )}

          {/* Right Column (Next) */}
          {getMoment(1) && (
            <MomentCard
              key={getMoment(1).id}
              moment={getMoment(1)}
              layoutId={`desktop-card-${getMoment(1).id}`}
              onClick={() =>
                handleCardClick(
                  getMoment(1).id,
                  `desktop-card-${getMoment(1).id}`,
                )
              }
              className="w-1/4 h-[350px] translate-y-12 opacity-60 hover:opacity-100 transition-opacity"
            />
          )}
        </div>

        {/* Mobile/Tablet Grid View (Fallback) */}
        <div className="md:hidden grid grid-cols-1 gap-8">
          {moments.map((moment) => {
            return (
              <MomentCard
                key={moment.id}
                moment={moment}
                layoutId={`mobile-card-${moment.id}`}
                onClick={() => handleCardClick(moment.id, `mobile-card-${moment.id}`)}
                className="aspect-[4/5] w-full"
              />
            );
          })}
        </div>
        </div>

        {/* Collections Section */}
        {collections.length > 0 && (
            <div className="w-full max-w-7xl mx-auto mt-24 md:mt-32 pb-32">
                <div className="text-center mb-12">
                     <h3 className="text-2xl md:text-3xl font-serif italic text-gray-900 dark:text-white mb-2">
                        Shared Chapters
                     </h3>
                     <div className="h-0.5 w-12 bg-purple-500 mx-auto" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {collections.map((collection) => (
                        <motion.div
                            key={collection.id}
                            whileHover={{ y: -5 }}
                            onClick={() => setSelectedCollection(collection)}
                            className="group cursor-pointer relative aspect-[4/5] overflow-hidden rounded-xl border border-gray-200 dark:border-white/10"
                        >
                            {collection.cover ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img 
                                    src={collection.cover}
                                    alt={collection.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                                    <ImageIcon className="text-gray-400" size={32} />
                                </div>
                            )}
                            
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            
                            <div className="absolute bottom-0 left-0 p-6 z-10 w-full">
                                <h4 className="text-white font-serif italic text-xl mb-1">{collection.title}</h4>
                                <p className="text-gray-300 text-xs font-mono tracking-widest uppercase">{collection.images.length} Moments</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        )}
      </div>

      {/* Expanded Modal */}
      <AnimatePresence>
        {selectedId && selectedMoment && activeLayoutId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSelection}
              className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm"
            />

            <motion.div
              layoutId={activeLayoutId}
              className="relative w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col md:flex-row max-h-[80vh] md:max-h-[600px]"
            >
              <button
                onClick={closeSelection}
                className="absolute top-4 right-4 z-50 p-2 bg-purple-50 dark:bg-black/50 rounded-full text-purple-600 dark:text-white hover:bg-purple-100 dark:hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>

              {/* Media Side (Left/Top) */}
              <div className="flex-1 bg-gray-50 dark:bg-black relative flex items-center justify-center overflow-hidden">
                {selectedMoment.src ? (
                  selectedMoment.type === "video" ? (
                    <video
                      src={selectedMoment.src}
                      className="w-full h-full object-contain"
                      controls
                      autoPlay
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMoment.src}
                      alt={selectedMoment.title}
                      className="w-full h-full object-contain"
                    />
                  )
                ) : (
                  <div className="text-gray-700 flex flex-col items-center">
                    {selectedMoment.type === "video" ? (
                      <Film size={48} />
                    ) : (
                      <ImageIcon size={48} />
                    )}
                    <span className="mt-4 font-mono text-sm">
                      No Media Source Found
                    </span>
                  </div>
                )}
              </div>

              {/* Info Side (Right/Bottom) */}
              <div className="w-full md:w-[350px] bg-white dark:bg-gray-900/95 backdrop-blur-xl p-8 flex flex-col border-l border-gray-200 dark:border-white/5">
                <div className="mb-6">
                  <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-300 text-[10px] font-mono rounded mb-3 uppercase tracking-widest">
                    {selectedMoment.tags?.join(" • ")}
                  </span>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {selectedMoment.title}
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 font-mono mt-2">
                    <span className="flex items-center gap-1">
                      <MapPin size={12} /> {selectedMoment.location}
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                    {selectedMoment.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-gray-200 dark:border-white/10">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 font-mono text-center">
                    FOREVER STORED IN MEMORY BANK
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Collection Modal */}
      <AnimatePresence>
          {selectedCollection && (
              <div className="fixed inset-0 z-[10050] flex items-center justify-center bg-white dark:bg-black">
                    <button 
                      onClick={() => setSelectedCollection(null)}
                      className="absolute top-4 left-4 md:top-6 md:left-6 z-50 p-2 text-gray-900 dark:text-white"
                    >
                      <X size={32} />
                  </button>
                  
                  <div className="w-full h-full overflow-y-auto pt-20 pb-20 px-4 md:px-12">
                      <div className="max-w-7xl mx-auto">
                          <div className="text-center mb-16">
                             <h2 className="text-4xl md:text-6xl font-serif italic mb-4">{selectedCollection.title}</h2>
                             <p className="font-mono text-sm tracking-widest uppercase text-gray-500">{selectedCollection.description}</p>
                          </div>
                          
                          <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                              {selectedCollection.images.map((src, idx) => (
                                  <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    className="break-inside-avoid"
                                  >
                                      {isVideo(src) ? (
                                        <video
                                          src={src}
                                          controls
                                          className="w-full rounded-lg shadow-lg"
                                        />
                                      ) : (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img 
                                            src={src}
                                            alt={`${selectedCollection.title} - ${idx}`}
                                            className="w-full rounded-lg shadow-lg"
                                        />
                                      )}
                                  </motion.div>
                              ))}
                          </div>
                          
                          {selectedCollection.images.length === 0 && (
                             <div className="text-center py-20 text-gray-500 font-mono text-xs uppercase tracking-widest">
                                 No images found in collection
                             </div>
                          )}
                      </div>
                  </div>
              </div>
          )}
      </AnimatePresence>

    </div>
  );
}

function MomentCard({
  moment,
  onClick,
  className,
  priority = false,
  layoutId,
}: {
  moment: MomentItem;
  onClick: () => void;
  className?: string;
  priority?: boolean;
  layoutId: string;
}) {
  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["7deg", "-7deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-7deg", "7deg"]);
  const glareX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;

    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={cn("relative group", className)} onClick={onClick}>
      <motion.div
        layoutId={layoutId}
        className="w-full h-full relative"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div
          style={{
            rotateX: priority ? rotateX : 0,
            rotateY: priority ? rotateY : 0,
            transformStyle: "preserve-3d",
          }}
          className="w-full h-full rounded-xl bg-white dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-white/10 hover:border-purple-500/50 dark:hover:border-purple-500/50 transition-colors shadow-2xl relative"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* 3D Glare Filter */}
          <motion.div
            className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${glareX.get() || "50%"} ${glareY.get() || "50%"}, rgba(255,255,255,0.3) 0%, transparent 80%)`,
            }}
          />

          {/* Media Placeholder or Preview */}
          <div className="absolute inset-0 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-700 ease-out">
            {moment.src ? (
              moment.type === "video" ? (
                <video
                  src={moment.src}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-90 transition-opacity duration-500"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={moment.src}
                  alt={moment.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                />
              )
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-700">
                {moment.type === "video" ? (
                  <Film size={32} />
                ) : (
                  <ImageIcon size={32} />
                )}
                <span className="text-xs font-mono uppercase">
                  Media Placeholder
                </span>
              </div>
            )}
          </div>

          {/* Type Indicator Icon */}
          <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md flex items-center justify-center text-purple-600 dark:text-white/80 z-20 shadow-lg border border-gray-200 dark:border-white/5">
            {moment.type === "video" ? (
              <Play size={12} className="fill-current ml-0.5" />
            ) : (
              <ImageIcon size={14} />
            )}
          </div>

          {/* Overlay Info (Bottom) */}
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/95 via-black/60 to-transparent translate-y-4 group-hover:translate-y-0 transition-transform duration-300 z-20">
            <h3
              className={cn(
                "font-bold text-white leading-tight group-hover:text-purple-200 dark:group-hover:text-purple-100 transition-colors",
                priority ? "text-2xl" : "text-lg",
              )}
            >
              {moment.title}
            </h3>
          </div>

          {/* Cinematic Grain/Scanlines */}
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 group-hover:opacity-10 pointer-events-none mix-blend-overlay z-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/5 to-transparent bg-[length:100%_4px] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10 mix-blend-color-dodge" />
        </motion.div>
      </motion.div>
    </div>
  );
}
