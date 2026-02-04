"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback, type FormEvent } from "react";
import {
  Lock,
  Image as ImageIcon,
  Grid,
  ChevronLeft,
  ChevronRight,
  X,
  Heart,
  ScanLine,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- ANIMATION VARIANTS ---
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

// Helper to check for video files
const isVideo = (src: string) => /\.(mp4|webm|mov)$/i.test(src);

export type Collection = {
  id: string;
  title: string;
  description: string;
  cover: string;
  images: string[];
};

const SECRET_CODE = "forever";

// Combine collections with dynamic "Favorites" collection
const useCollections = (baseCollections: Collection[], favorites: string[]) => {
  const favoriteCollection = {
    id: "favorites",
    title: "Lovely Favorites",
    description: "Your cherished moments",
    cover: favorites.length > 0 ? favorites[0] : "/none",
    images: favorites,
  };

  if (favorites.length > 0) {
    return [favoriteCollection, ...baseCollections];
  }
  return baseCollections;
};

interface GalleryClientProps {
  initialCollections: Collection[];
}

export default function GalleryClient({ initialCollections }: GalleryClientProps) {
  const [unlocked, setUnlocked] = useState(false);
  const [decrypting, setDecrypting] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [activeCollection, setActiveCollection] = useState<string | null>(null);
  const [secretUnlocked, setSecretUnlocked] = useState(false);

  const [favorites, setFavorites] = useState<string[]>([]);

  // Load favorites on mount
  useEffect(() => {
    const saved = localStorage.getItem("gallery_favorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const savedSecret = localStorage.getItem("gallery_secret_unlocked");
    if (savedSecret === "true") {
      setSecretUnlocked(true);
    }
  }, []);

  const toggleFavorite = (e: React.MouseEvent, src: string) => {
    e.stopPropagation(); // Prevent lightbox from opening
    const newFavorites = favorites.includes(src)
      ? favorites.filter((f) => f !== src)
      : [...favorites, src];

    setFavorites(newFavorites);
    localStorage.setItem("gallery_favorites", JSON.stringify(newFavorites));
  };

  // Lightbox State
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(0);

  // Dynamic Collections List
  const allCollections = useCollections(initialCollections, favorites).filter(
    (collection) => secretUnlocked || collection.id !== "secret",
  );

  // Derived Data
  const selectedCollectionData = allCollections.find(
    (c) => c.id === activeCollection,
  );
  const currentImages = selectedCollectionData?.images || [];

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    const normalized = password.toLowerCase().trim();
    if (normalized === SECRET_CODE) {
      setSecretUnlocked(true);
      localStorage.setItem("gallery_secret_unlocked", "true");
      setDecrypting(true);
      setTimeout(() => {
        setDecrypting(false);
        setUnlocked(true);
      }, 2000);
      return;
    }
    if (
      normalized === "love" ||
      normalized === "1227"
    ) {
      setSecretUnlocked(false);
      localStorage.removeItem("gallery_secret_unlocked");
      setDecrypting(true);
      setTimeout(() => {
        setDecrypting(false);
        setUnlocked(true);
      }, 2000);
    } else {
      setError(true);
      setTimeout(() => setError(false), 500);
    }
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const nextImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setDirection(1);
    setLightboxIndex((prev) => (prev! + 1) % currentImages.length);
  }, [currentImages.length, lightboxIndex]);

  const prevImage = useCallback(() => {
    if (lightboxIndex === null) return;
    setDirection(-1);
    setLightboxIndex(
      (prev) => (prev! - 1 + currentImages.length) % currentImages.length,
    );
  }, [currentImages.length, lightboxIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape") closeLightbox();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxIndex, nextImage, prevImage]);

  if (!unlocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--background)] text-[var(--foreground)] overflow-hidden transition-colors duration-500">
        {/* Decrypting Sequence */}
        {decrypting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            >
              <ScanLine size={48} className="text-purple-600 dark:text-purple-500" />
            </motion.div>
            <div className="font-mono text-xl tracking-[0.3em] text-purple-600 dark:text-purple-400">
              DECRYPTING ARCHIVES...
            </div>
            <div className="w-64 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.8, ease: "easeInOut" }}
                className="h-full bg-purple-600 dark:bg-purple-500 box-shadow-[0_0_10px_#7c3aed] dark:box-shadow-[0_0_10px_#a855f7]"
              />
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-green-600 dark:text-green-400 font-mono text-xs tracking-widest mt-4"
            >
              ACCESS GRANTED
            </motion.div>
          </motion.div>
        ) : (
          // Lock Screen (Existing but connected to decrypting)
          <>
            {/* Ambient Moving Background */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-200/40 via-purple-50/50 to-white dark:from-purple-500/20 dark:via-black dark:to-black pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative z-10 flex flex-col items-center w-full max-w-lg px-8 text-center"
            >
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 0px rgba(124,58,237,0)",
                    "0 0 50px rgba(124,58,237,0.3)",
                    "0 0 0px rgba(124,58,237,0)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="mb-12 p-8 rounded-full border border-gray-200 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-sm relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Lock
                  size={24}
                  className="text-purple-300 dark:text-gray-300 group-hover:text-purple-500 dark:group-hover:text-purple-300 transition-colors"
                />
              </motion.div>

              <h2 className="text-4xl md:text-6xl font-serif italic text-gray-900 dark:text-white mb-6 tracking-tight">
                Classified
              </h2>
              <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-300 dark:via-white/40 to-transparent mb-6" />
              <p className="text-gray-600 dark:text-gray-300 font-mono text-[10px] tracking-[0.4em] uppercase mb-16">
                Restricted Access // Memory Archives
              </p>

              <form onSubmit={handleLogin} className="w-full relative group">
                <motion.input
                  type="password"
                  autoFocus
                  placeholder="ENTER PASSCODE"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error}
                  aria-describedby="gallery-passcode-hint gallery-passcode-error"
                  animate={
                    error
                      ? { x: [-10, 10, -10, 10, 0], color: "#ef4444" }
                      : { color: "var(--foreground)" }
                  }
                  className="w-full bg-transparent border-b border-gray-300 dark:border-white/20 py-4 text-center text-2xl font-mono tracking-[0.5em] focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 transition-all placeholder:text-gray-400 dark:placeholder:text-white/20 placeholder:text-sm placeholder:tracking-widest text-gray-900 dark:text-white"
                />
                <div className="absolute bottom-0 left-0 w-full h-px bg-purple-600 dark:bg-purple-400 scale-x-0 group-focus-within:scale-x-100 transition-transform duration-700 ease-out shadow-[0_0_10px_rgba(124,58,237,0.5)]" />

                <div className="mt-4 space-y-2">
                  <p
                    id="gallery-passcode-hint"
                    className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-500 dark:text-gray-400"
                  >
                    Hint: Anniversary Date?
                  </p>
                  <p
                    id="gallery-passcode-error"
                    className={cn(
                      "text-xs font-mono text-red-500 transition-opacity",
                      error ? "opacity-100" : "opacity-0",
                    )}
                  >
                    Incorrect passcode. Try again.
                  </p>
                </div>

                <AnimatePresence>
                  {password.length > 0 && (
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      type="submit"
                      className="absolute -bottom-20 left-0 right-0 mx-auto text-purple-500 dark:text-gray-400 text-[10px] tracking-[0.2em] hover:text-purple-700 dark:hover:text-white transition-colors uppercase font-mono"
                    >
                      [ Press Enter to Decrypt ]
                    </motion.button>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full pt-28 pb-32 px-4 md:px-12 relative z-10">
      {/* Navbar Logic */}
      <div className="flex justify-between items-start mb-12 border-b border-gray-200/50 dark:border-white/10 pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-purple-700 to-indigo-500 dark:from-purple-300 dark:via-purple-300 dark:to-indigo-300 font-serif italic">
            {activeCollection ? selectedCollectionData?.title : "Muse"}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-mono text-xs tracking-widest uppercase">
            {activeCollection
              ? selectedCollectionData?.description
              : "A CURATED COLLECTION OF BEAUTY"}
          </p>
        </div>
        <div className="flex gap-4">
          {activeCollection && (
            <button
              onClick={() => setActiveCollection(null)}
              aria-label="Back to collections"
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <Grid size={20} />
            </button>
          )}
          <button
            onClick={() => setUnlocked(false)}
            aria-label="Lock gallery"
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 dark:text-gray-400 hover:text-purple-600 dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
          >
            <Lock size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!activeCollection ? (
          // COLLECTIONS GRID (With 3D Hover & Glassmorphism)
          <motion.div
            key="collections"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {allCollections.map((collection, index) => {
              const hasVideo = isVideo(collection.cover);
              return (
                <motion.div
                  key={collection.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02, rotateY: 2, rotateX: 2 }}
                  transition={{
                    delay: index * 0.1,
                    type: "spring",
                    stiffness: 300,
                  }}
                  onClick={() => setActiveCollection(collection.id)}
                  className="group relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden cursor-pointer border border-gray-200/50 dark:border-white/10"
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/30 dark:from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10 pointer-events-none" />

                  {/* Cover Media */}
                  <div className="absolute inset-0">
                    {hasVideo ? (
                      <video
                        src={collection.cover}
                        className="w-full h-full object-cover opacity-90 dark:opacity-80 grayscale contrast-125 brightness-90 sepia-[0.2] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:sepia-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-in-out"
                        muted
                        loop
                        playsInline
                        onMouseEnter={(e) => e.currentTarget.play()}
                        onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                        }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={collection.cover}
                        alt={collection.title}
                        className="w-full h-full object-cover opacity-90 dark:opacity-80 grayscale contrast-125 brightness-90 sepia-[0.2] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:sepia-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000 ease-in-out"
                      />
                    )}
                  </div>

                  {/* Film Grain + Vignette (before hover) */}
                  <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none z-10" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none z-10" />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-end p-8 z-20">
                    <span
                      className={cn(
                        "text-xs font-mono mb-2 track-widest border-l-2 pl-3",
                        collection.id === "favorites"
                          ? "text-red-400 border-red-500"
                          : "text-purple-300 dark:text-purple-400 border-purple-500 dark:border-purple-500",
                      )}
                    >
                      {collection.images.length} {hasVideo ? "VIDEOS" : "PHOTOS"}
                    </span>
                    <h3
                      className={cn(
                        "text-3xl font-bold font-serif italic transition-colors",
                        collection.id === "favorites"
                          ? "text-red-100 group-hover:text-red-300"
                          : "text-white group-hover:text-purple-200 dark:group-hover:text-purple-200",
                      )}
                    >
                      {collection.title}
                    </h3>
                  </div>
                </motion.div>
              );
            })}

            {/* Coming Soon Placeholders */}
            {[1, 2].map((i) => (
              <div
                key={i}
                className="aspect-[4/5] md:aspect-square rounded-2xl border-2 border-dashed border-gray-300/50 dark:border-white/5 bg-gray-100/50 dark:bg-white/[0.02] flex flex-col items-center justify-center text-gray-500 dark:text-gray-600 hover:border-purple-400 dark:hover:border-white/10 hover:bg-purple-50/[0.1] dark:hover:bg-white/[0.05] transition-all"
              >
                <ImageIcon size={32} className="mb-2 opacity-50 dark:opacity-30" />
                <span className="text-xs font-mono uppercase tracking-widest opacity-70 dark:opacity-50">
                  Locked
                </span>
              </div>
            ))}
          </motion.div>
        ) : (
          // SINGLE COLLECTION STAGGERED GRID
          <motion.div
            key="single-collection"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
          >
            {currentImages.map((src, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, filter: "blur(10px)" }}
                whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => openLightbox(index)}
                className="break-inside-avoid relative rounded-xl overflow-hidden cursor-zoom-in group border border-gray-200/50 dark:border-white/5 hover:border-purple-500/30 transition-all"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {isVideo(src) ? (
                   <video 
                      src={src} 
                      className={cn(
                        "w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500 object-cover",
                        activeCollection === "beach" &&
                          "grayscale contrast-125 brightness-90 sepia-[0.2] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:sepia-0",
                      )}
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.currentTarget.play()}
                      onMouseLeave={(e) => {
                          e.currentTarget.pause();
                          e.currentTarget.currentTime = 0;
                      }}
                   />
                ) : (
                    <img
                    src={src}
                    alt="Gallery Item"
                    className={cn(
                      "w-full h-auto opacity-90 group-hover:opacity-100 transition-opacity duration-500",
                      activeCollection === "beach" &&
                        "grayscale contrast-125 brightness-90 sepia-[0.2] group-hover:grayscale-0 group-hover:contrast-100 group-hover:brightness-100 group-hover:sepia-0",
                    )}
                    />
                )}

                {activeCollection === "beach" && (
                  <>
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 group-hover:opacity-0 transition-opacity duration-700 pointer-events-none z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none z-10" />
                  </>
                )}

                {/* Hover Overlay Interactions */}
                {activeCollection !== "beach" && (
                  <div className="absolute inset-0 bg-purple-900/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                )}

                {/* Floating Like Button */}
                <div className="absolute bottom-4 right-4 translate-y-10 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
                  <button
                    onClick={(e) => toggleFavorite(e, src)}
                    aria-label={favorites.includes(src) ? "Remove from favorites" : "Add to favorites"}
                    className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white/70 hover:text-red-400 hover:bg-black/70 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                  >
                    <Heart
                      size={18}
                      className={cn(
                        "transition-all",
                        favorites.includes(src) && "fill-red-500 text-red-500",
                      )}
                    />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ENHANCED LIGHTBOX */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-black/95 backdrop-blur-xl"
          >
            {/* Controls */}
            <button
              onClick={closeLightbox}
              aria-label="Close"
              className="absolute top-6 right-20 md:right-24 p-2 rounded-full bg-white/80 text-gray-900 hover:bg-white dark:bg-white/10 dark:text-white dark:hover:bg-white/20 transition-all z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 dark:focus-visible:ring-white/60"
            >
              <X size={24} />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Previous"
              className="absolute left-4 md:left-8 p-3 rounded-full bg-white/5 hover:bg-purple-500/20 text-white/50 hover:text-white transition-all z-50 hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ChevronLeft size={32} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Next"
              className="absolute right-4 md:right-8 p-3 rounded-full bg-white/5 hover:bg-purple-500/20 text-white/50 hover:text-white transition-all z-50 hidden md:block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <ChevronRight size={32} />
            </button>

            {/* Main Image Container */}
            <div
              className="relative w-full h-full flex items-center justify-center p-4 md:p-20"
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence initial={false} custom={direction}>
                {isVideo(currentImages[lightboxIndex]) ? (
                    <motion.video
                        key={lightboxIndex}
                        src={currentImages[lightboxIndex]}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "tween", ease: "easeOut", duration: 0.35 },
                          opacity: { duration: 0.2 },
                        }}
                        controls
                        autoPlay
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl bg-black"
                    />
                ) : (
                    <motion.img
                        key={lightboxIndex}
                        src={currentImages[lightboxIndex]}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                          x: { type: "tween", ease: "easeOut", duration: 0.35 },
                          opacity: { duration: 0.2 },
                        }}
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = Math.abs(offset.x) * velocity.x;
                            if (swipe < -10000) nextImage();
                            else if (swipe > 10000) prevImage();
                        }}
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl select-none"
                    />
                )}
              </AnimatePresence>

              {/* Image Counter */}
              <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none space-y-2">
                <span className="inline-block px-4 py-2 rounded-full bg-black/50 backdrop-blur-md text-white/70 font-mono text-xs tracking-widest border border-white/10">
                  {lightboxIndex + 1} / {currentImages.length}
                </span>
                <div className="block md:hidden text-[10px] uppercase tracking-[0.3em] text-white/50 font-mono">
                  Swipe to navigate
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
