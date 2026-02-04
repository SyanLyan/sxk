"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Loader2 } from "lucide-react";
const HER_LOCATION = {
  lat: 16.789663, // Yangon Latitude
  lng: 96.191354, // Yangon Longitude
  name: "Her Heart",
};

const MY_LOCATION = {
  lat: 16.855284,
  lng: 96.1209266,
};

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

export default function DistanceCalculator() {
  const [myLocation, setMyLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const CALC_DELAY_MS = 5000;

  const getLocation = () => {
    setLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      useFallbackLocation("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;

        setMyLocation({ lat: currentLat, lng: currentLng });

        const dist = calculateDistance(
          currentLat,
          currentLng,
          HER_LOCATION.lat,
          HER_LOCATION.lng,
        );

        setTimeout(() => {
          setDistance(dist);
          setLoading(false);
        }, CALC_DELAY_MS);
      },
      () => {
        useFallbackLocation("Using saved coordinates");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };
  const useFallbackLocation = (message?: string) => {
    const { lat, lng } = MY_LOCATION;

    setMyLocation({ lat, lng });

    const dist = calculateDistance(
      lat,
      lng,
      HER_LOCATION.lat,
      HER_LOCATION.lng,
    );

    setTimeout(() => {
      setDistance(dist);
      setError(message ?? null);
      setLoading(false);
    }, CALC_DELAY_MS);
  };

  return (
    <section className="min-h-screen w-full flex flex-col items-center justify-center relative py-20">
      {/* Floating Elements without Card */}
      <div className="max-w-4xl w-full mx-4 relative flex flex-col items-center">
        {/* Radar Effect - More ambient & large */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-visible flex items-center justify-center -z-10">
          <div className="w-[600px] h-[600px] border border-purple-500/10 dark:border-purple-500/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <div className="absolute w-[400px] h-[400px] border border-purple-500/20 dark:border-purple-500/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
          <div className="absolute w-[200px] h-[200px] border border-purple-500/30 dark:border-purple-500/30 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
        </div>

        <h3 className="text-xl md:text-2xl font-mono text-purple-950 dark:text-purple-300 text-center mb-16 uppercase tracking-[0.3em] flex items-center justify-center gap-4">
          <Navigation size={20} className="animate-pulse text-purple-700 dark:text-purple-400" /> Signal Link
        </h3>

        {/* Connection Visual - Minimal & Wide */}
        <div className="flex justify-between items-center w-full max-w-2xl mb-24 relative">
          {/* My Location Node */}
          <div className="flex flex-col items-center gap-4 z-10 group">
            <div
              className={`w-16 h-16 rounded-full border border-gray-300 dark:border-white/20 flex items-center justify-center transition-all duration-500 bg-white dark:bg-black/50 backdrop-blur-sm ${myLocation ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)]" : "group-hover:border-purple-600 dark:group-hover:border-white/50"}`}
            >
              <MapPin
                size={24}
                className={
                  myLocation
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-700 dark:text-gray-600"
                }
              />
            </div>
            <span className="text-[10px] md:text-xs font-mono text-gray-800 dark:text-gray-500 tracking-[0.2em] uppercase font-semibold">
              Your Location
            </span>
          </div>

          {/* Connecting Line - Glowing Laser */}
          <div className="flex-1 h-[1px] bg-purple-200 dark:bg-white/5 mx-8 relative overflow-hidden">
            {distance !== null && (
              <>
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "circOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-700 dark:via-purple-500 to-transparent shadow-[0_0_20px_rgba(124,58,237,0.8)] dark:shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                />
                <div className="absolute inset-0 bg-purple-500/20 dark:bg-purple-500/20 blur-sm" />
              </>
            )}
          </div>

          {/* Her Location Node */}
          <div className="flex flex-col items-center gap-4 z-10">
            <div className="w-16 h-16 rounded-full border border-purple-600 dark:border-purple-500 bg-purple-100 dark:bg-purple-500/10 backdrop-blur-sm text-purple-700 dark:text-purple-400 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.4)] dark:shadow-[0_0_30px_rgba(168,85,247,0.4)] animate-pulse-slow">
              <MapPin size={24} />
            </div>
            <span className="text-[10px] md:text-xs font-mono text-gray-800 dark:text-gray-500 tracking-[0.2em] uppercase font-semibold">
              Her Heart
            </span>
          </div>
        </div>

        {/* Results / Action */}
        <div className="text-center relative z-10 min-h-[120px] flex flex-col justify-center items-center">
          {distance !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs text-purple-700 dark:text-purple-300/50 font-mono mb-2 tracking-widest font-semibold">
                CALCULATED DISTANCE
              </span>
              <h2 className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-gray-900 to-purple-900 dark:from-white dark:to-white/50 font-sans tracking-tighter">
                {distance.toFixed(0)}
                <span className="text-2xl md:text-4xl text-purple-700 dark:text-purple-500 ml-2">
                  KM
                </span>
              </h2>
              <p className="text-sm text-gray-900 dark:text-gray-400 mt-6 font-mono max-w-md leading-relaxed border-t border-purple-200 dark:border-white/10 pt-6 font-medium">
                "No specific number can measure <br /> how close we truly are."
              </p>
            </motion.div>
          ) : (
            <>
              {loading ? (
                <div className="flex flex-col items-center gap-4 text-purple-700 dark:text-purple-400">
                  <Loader2 className="animate-spin w-8 h-8" />
                  <span className="text-xs font-mono animate-pulse tracking-widest font-semibold">
                    TRIANGULATING SATELLITES...
                  </span>
                </div>
              ) : (
                <button
                  onClick={getLocation}
                  className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none"
                >
                  <div className="absolute inset-0 w-full h-full bg-purple-100 dark:bg-purple-500/10 border border-purple-400 dark:border-purple-500/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 dark:group-hover:border-purple-400/70 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700 dark:via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                  <span className="relative font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 text-purple-950 dark:text-purple-100 font-bold">
                    <Navigation
                      size={16}
                      className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-500 text-purple-800 dark:text-purple-200"
                    />
                    Initiate Scan
                  </span>
                </button>
              )}
              {error && (
                <p className="text-red-500 text-xs mt-6 font-mono bg-red-500/10 px-4 py-2 rounded">
                  {error}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
