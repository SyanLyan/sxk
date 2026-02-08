"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation, Send, User, Radar, Heart, MapPin, Globe, Map as MapIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

const SignalMap = dynamic(() => import("./SignalMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-purple-900/10 animate-pulse flex items-center justify-center text-purple-500/30 font-mono text-xs">INITIALIZING SAT-LINK...</div>
});

// ...existing code...
// (Keep CONSTANTS: HER_AVATAR, MY_AVATAR_FALLBACK, etc. unchanged)
const HER_AVATAR = "/Avatar/kuu.jpeg";
const MY_AVATAR = "/Avatar/sai.jpg";
const MY_AVATAR_FALLBACK = "S";

const KM_PER_HOUR_DRIVE = 40;
const LOCAL_ID_KEY = "sxk-client-id";
const SESSION_CODE_KEY = "sxk-session-code";
const SESSION_ORIGIN_KEY = "sxk-session-origin";

// (Keep Helper Functions: calculateDistance, deg2rad, formatKm, getDriveMinutes, getBearing, bearingToCompass unchanged)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

function formatKm(km: number) {
  if (km < 1) return `${(km * 1000).toFixed(0)}m`;
  return `${km.toFixed(1)}km`;
}

function getDriveMinutes(km: number) {
  return Math.max(1, Math.round((km / KM_PER_HOUR_DRIVE) * 60));
}

function getBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const y = Math.sin(deg2rad(lon2 - lon1)) * Math.cos(deg2rad(lat2));
  const x =
    Math.cos(deg2rad(lat1)) * Math.sin(deg2rad(lat2)) -
    Math.sin(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.cos(deg2rad(lon2 - lon1));
  const bearing = (Math.atan2(y, x) * 180) / Math.PI;
  return (bearing + 360) % 360;
}

function bearingToCompass(bearing: number) {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}

type LocationPoint = {
  lat: number;
  lng: number;
  updatedAt?: string;
};

type SyncedRow = {
  session_code: string;
  requester_lat: number | null;
  requester_lng: number | null;
  partner_lat: number | null;
  partner_lng: number | null;
  is_synced: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type DistanceCalculatorProps = {
  sessionCode?: string;
};

export default function DistanceCalculator({
  sessionCode,
}: DistanceCalculatorProps) {
  const [myLocation, setMyLocation] = useState<LocationPoint | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationPoint | null>(
    null,
  );
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState(false); // DB flag
  const [showMap, setShowMap] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const [activeSessionCode, setActiveSessionCode] = useState<string | null>(
    sessionCode ?? null,
  );
  const [sessionOrigin, setSessionOrigin] = useState<"local" | "link" | null>(
    null,
  );
  const CALC_DELAY_MS = 800;

  // ...existing code...
  // (All useEffect hooks remain the same)
  const supabase = useMemo(() => {
    if (!activeSessionCode) return null;
    return createBrowserSupabaseClient();
  }, [activeSessionCode]);

  useEffect(() => {
    if (sessionCode) {
      setActiveSessionCode(sessionCode);
      return;
    }
    const stored = localStorage.getItem(SESSION_CODE_KEY);
    if (stored) setActiveSessionCode(stored);
  }, [sessionCode]);

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_ORIGIN_KEY);
    if (stored === "local" || stored === "link") {
      setSessionOrigin(stored);
    }
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (typeof customEvent.detail === "string") {
        setActiveSessionCode(customEvent.detail);
      }
    };
    window.addEventListener("sxk-session-code", handler as EventListener);
    const originHandler = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      if (customEvent.detail === "local" || customEvent.detail === "link") {
        setSessionOrigin(customEvent.detail);
      }
    };
    window.addEventListener(
      "sxk-session-origin",
      originHandler as EventListener,
    );
    return () => {
      window.removeEventListener("sxk-session-code", handler as EventListener);
      window.removeEventListener(
        "sxk-session-origin",
        originHandler as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    let stored = localStorage.getItem(LOCAL_ID_KEY);
    if (!stored) {
      stored = crypto.randomUUID();
      localStorage.setItem(LOCAL_ID_KEY, stored);
    }
    setClientId(stored);
  }, []);

  useEffect(() => {
    if (!activeSessionCode || !supabase || !clientId) return;

    const applySyncedRow = (row: SyncedRow | null) => {
      if (!row) return;
      
      const synced = row.is_synced === true;
      setIsSynced(synced);
      if (row.updated_at) {
        setLastSyncedTime(row.updated_at);
      }

      const requesterPoint =
        row.requester_lat !== null && row.requester_lng !== null
          ? { lat: row.requester_lat, lng: row.requester_lng }
          : null;
      const partnerPoint =
        row.partner_lat !== null && row.partner_lng !== null
          ? { lat: row.partner_lat, lng: row.partner_lng }
          : null;
      
      const isLink = sessionOrigin === "link";
      setMyLocation(isLink ? partnerPoint : requesterPoint);
      setPartnerLocation(isLink ? requesterPoint : partnerPoint);
    };

    const fetchSyncedData = async () => {
      const { data } = await supabase
        .from("synced_locations")
        .select("session_code, requester_lat, requester_lng, partner_lat, partner_lng, is_synced, updated_at")
        .eq("session_code", activeSessionCode)
        .maybeSingle();

      applySyncedRow(data ?? null);
    };

    // Initial fetch
    fetchSyncedData();

    // Realtime subscription
    const locationChannel = supabase
      .channel(`synced-locations-${activeSessionCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "synced_locations",
          filter: `session_code=eq.${activeSessionCode}`,
        },
        (payload) => {
          const row = (payload.new ?? payload.old) as SyncedRow | null;
          applySyncedRow(row ?? null);
        },
      )
      .subscribe();

    // 3s interval polling as requested
    const intervalId = setInterval(() => {
      fetchSyncedData();
    }, 3000);

    return () => {
      supabase.removeChannel(locationChannel);
      clearInterval(intervalId);
    };
  }, [clientId, activeSessionCode, supabase, sessionOrigin]);

  useEffect(() => {
    if (!myLocation || !partnerLocation) return;
    const dist = calculateDistance(
      myLocation.lat,
      myLocation.lng,
      partnerLocation.lat,
      partnerLocation.lng,
    );
    setDistanceKm(dist);
  }, [myLocation, partnerLocation]);



  const syncLocation = async (setSyncedStatus?: boolean): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          const isLink = sessionOrigin === "link";

          setMyLocation({ lat: currentLat, lng: currentLng });

          if (activeSessionCode && supabase && clientId) {
            const payload: any = isLink
              ? {
                  session_code: activeSessionCode,
                  partner_lat: currentLat,
                  partner_lng: currentLng,
                  updated_at: new Date().toISOString(),
                }
              : {
                  session_code: activeSessionCode,
                  requester_lat: currentLat,
                  requester_lng: currentLng,
                  updated_at: new Date().toISOString(),
                };

            if (typeof setSyncedStatus === "boolean") {
              payload.is_synced = setSyncedStatus;
            }

            const { error: upsertError } = await supabase
              .from("synced_locations")
              .upsert(payload, { onConflict: "session_code" });

            if (upsertError) {
              reject(upsertError);
            } else {
              resolve();
            }
          } else {
            resolve();
          }
        },
        (err) => {
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    });
  };

  const requestLocation = async () => {
    if (!activeSessionCode || !supabase || !clientId) {
      return;
    }

    setRequesting(true);
    setError(null);
    setLoading(true);

    try {
      // Sync as requester, set is_synced = false
      await syncLocation(false);
      
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const entryUrl = origin
        ? `${origin}/?session=${activeSessionCode}`
        : `/?session=${activeSessionCode}`;
      const message = `📍 Signal Request.\nPartner is waiting at: ${entryUrl}`;

      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      if (!res.ok) {
        throw new Error("Telegram API failed");
      }
      // No more pair_requests table logic
    } catch (err) {
      setError("Failed to sync and send request");
    } finally {
      setRequesting(false);
      setLoading(false);
    }
  };

  const shareLocation = async () => {
    setLoading(true);
    setError(null);

    try {
      // Sync as partner, set is_synced = true
      await syncLocation(true);
    } catch (err) {
      setError("Location access denied or failed");
    } finally {
      setTimeout(() => setLoading(false), CALC_DELAY_MS);
    }
  };

  const displayDistanceKm = distanceKm;
  const driveMinutes = displayDistanceKm
    ? getDriveMinutes(displayDistanceKm)
    : null;
  const bearing =
    myLocation && partnerLocation
      ? getBearing(
          myLocation.lat,
          myLocation.lng,
          partnerLocation.lat,
          partnerLocation.lng,
        )
      : 0;
  const direction = bearingToCompass(bearing);
  const isLinkSession = sessionOrigin === "link";
  const partnerSynced = Boolean(partnerLocation);

  const formatLastSynced = (isoString: string | null) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs === 1) return "1 hr ago";
    return `${diffHrs} hrs ago`;
  };

  return (
    <section className="min-h-[60vh] w-full flex flex-col items-center justify-center relative py-12 px-4 overflow-hidden">
      {/* Radar Effect - More ambient & large */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-visible flex items-center justify-center -z-10">
        <div className="w-[600px] h-[600px] border border-purple-500/10 dark:border-purple-500/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute w-[400px] h-[400px] border border-purple-500/20 dark:border-purple-500/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
        <div className="absolute w-[200px] h-[200px] border border-purple-500/30 dark:border-purple-500/30 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_2s]" />
      </div>

      {/* --- MAIN CARD --- */}
      <div className="max-w-2xl w-full relative z-10 flex flex-col items-center">
        {/* SIGNAL HEADER */}
        <div className="text-center mb-12 flex flex-col items-center gap-2">
          <Radar className="text-purple-500 w-5 h-5 animate-pulse" />
          <h3 className="text-sm md:text-md font-mono tracking-[0.3em] uppercase text-purple-200">
            Signal Link
          </h3>
          {!isLinkSession && (
            <p className="text-[10px] font-mono tracking-[0.3em] uppercase text-gray-500">
              {isSynced
                ? "Connection Established"
                : myLocation
                  ? "Waiting for partner to sync..."
                  : "Send a ping to request sync"}
            </p>
          )}
        </div>

        {/* TWO POINTS LAYOUT */}
        <div className="w-full flex items-center justify-between px-2 md:px-12 relative mb-16">
          {/* CENTER LINE */}
          <div className="absolute left-16 right-16 top-1/2 -translate-y-1/2 h-[1px] bg-purple-500/20">
            {distanceKm !== null && (
              <motion.div
                layoutId="signal-beam"
                className="h-[2px] bg-purple-500 shadow-[0_0_10px_#a855f7]"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5 }}
              />
            )}
          </div>

          {/* LEFT: YOU */}
          <div className="relative flex flex-col items-center gap-4 group cursor-default z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-full border border-gray-700 bg-background/50 backdrop-blur-md flex items-center justify-center relative shadow-2xl z-10 overflow-hidden"
            >
              {loading ? (
                <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent animate-spin" />
              ) : (
                <img
                  src={MY_AVATAR}
                  alt="Sai"
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                />
              )}
            </motion.div>
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
              Sai
            </span>
          </div>

          {/* RIGHT: HER */}
          <div className="relative flex flex-col items-center gap-4 group cursor-default z-10">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className={cn(
                "w-16 h-16 rounded-full border border-gray-700 bg-background/50 backdrop-blur-md flex items-center justify-center relative shadow-2xl z-10 overflow-hidden",
                distanceKm !== null &&
                  "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]",
              )}
            >
              {/* Image or Icon */}
              <img
                src={HER_AVATAR}
                alt="Her"
                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
              />
            </motion.div>
            <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">
              Kuu
            </span>
          </div>
        </div>

        {/* DISTANCE (Moved below avatars) */}
        <AnimatePresence>
          {distanceKm !== null && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-12 flex flex-col items-center"
            >
              <div className="bg-white/90 dark:bg-black/80 border border-purple-200 dark:border-purple-500/30 backdrop-blur-md px-10 py-6 rounded-2xl text-center shadow-xl dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] min-w-[240px]">
                <div className="flex items-baseline gap-1 justify-center">
                  <span className="text-5xl font-bold font-mono text-purple-900 dark:text-white tracking-tighter">
                    {formatKm(distanceKm)}
                  </span>
                </div>

                <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-500/50 to-transparent my-3" />

                <div className="flex flex-col gap-1">
                  {driveMinutes && (
                    <span className="text-xs text-purple-600 dark:text-purple-200 uppercase tracking-widest font-semibold block">
                      ~{driveMinutes} mins away
                    </span>
                  )}
                  {lastSyncedTime && (
                    <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono block">
                       Hearts synced {formatLastSynced(lastSyncedTime)}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* --- MINI MAP TOGGLE & VIEW --- */}
        <AnimatePresence>
          {(myLocation || partnerLocation) && (
             <motion.div 
               layout
               initial={{ opacity: 0 }} 
               animate={{ opacity: 1 }}
               className="w-full max-w-md flex flex-col items-center gap-4 mb-8"
             >
                {/* Toggle Button */}
                <button 
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center gap-2 px-5 py-2.5 border border-purple-200 dark:border-purple-500/30 rounded-full bg-white/50 dark:bg-purple-500/5 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-all shadow-sm group"
                >
                    <Globe size={14} className="text-purple-600 dark:text-purple-400 group-hover:text-purple-700 dark:group-hover:text-purple-300 animate-[spin_10s_linear_infinite]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-purple-700 dark:text-purple-300 group-hover:text-purple-900 dark:group-hover:text-purple-200 font-semibold">
                        {showMap ? "Close Map View" : "Open Map View"}
                    </span>
                </button>

                {/* The Map */}
                <AnimatePresence>
                    {showMap && (
                        <motion.div
                           initial={{ height: 0, opacity: 0, scale: 0.95 }}
                           animate={{ height: 320, opacity: 1, scale: 1 }}
                           exit={{ height: 0, opacity: 0, scale: 0.95 }}
                           className="w-full rounded-2xl overflow-hidden shadow-2xl border border-gray-100 dark:border-purple-500/20 relative"
                        >
                            <SignalMap 
                              myLocation={myLocation} 
                              partnerLocation={partnerLocation} 
                              myAvatar={MY_AVATAR}
                              herAvatar={HER_AVATAR} 
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
             </motion.div>
          )}
        </AnimatePresence>
        {/* ERROR MESSAGE */}
        {error && (
          <p className="text-red-400 text-xs font-mono mb-6 bg-red-900/20 px-3 py-1 rounded border border-red-900/30">
            Error: {error}
          </p>
        )}

        {/* Control Actions */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8 mb-10">
          {isLinkSession && (
            <button
              onClick={shareLocation}
              disabled={loading}
              className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none"
            >
              <div className="absolute inset-0 w-full h-full bg-purple-100 dark:bg-purple-500/10 border border-purple-400 dark:border-purple-500/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 dark:group-hover:border-purple-400/70 transition-colors" />
              <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700 dark:via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

              <span className="relative font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 text-purple-950 dark:text-purple-100 font-bold">
                {loading ? (
                  <Radar
                    size={16}
                    className="animate-spin text-purple-800 dark:text-purple-200"
                  />
                ) : (
                  <Navigation
                    size={16}
                    className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-500 text-purple-800 dark:text-purple-200"
                  />
                )}
                {loading
                  ? "Scanning..."
                  : isSynced
                    ? "Update Location"
                    : "Initiate Scan"}
              </span>
            </button>
          )}

          {!isLinkSession && activeSessionCode && supabase && (
            <button
              onClick={requestLocation}
              disabled={requesting || (!!myLocation && !isSynced)}
              className={cn(
                "group relative px-8 py-4 bg-transparent overflow-hidden rounded-none transition-opacity",
                !!myLocation && !isSynced && "opacity-50 cursor-not-allowed",
              )}
            >
              <div className="absolute inset-0 w-full h-full bg-white/50 dark:bg-white/5 border border-purple-400/50 dark:border-purple-500/20 group-hover:border-purple-500/50 transition-colors" />

              <span className="relative font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 text-purple-950 dark:text-purple-100 font-bold">
                <Send
                  size={16}
                  className={cn(
                    "text-purple-800 dark:text-purple-200",
                    requesting && "animate-pulse",
                  )}
                />
                {requesting
                  ? "Pinging..."
                  : isSynced
                    ? "Update My Signal"
                    : !!myLocation
                      ? "Signal Sent"
                      : "Ping Signal"}
              </span>
            </button>
          )}
        </div>

        {/* DIRECTION FOOTER */}
        {distanceKm !== null && direction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-12 text-center mb-20"
          >
            <div className="inline-flex items-center gap-2 text-gray-500 text-[10px] font-mono uppercase tracking-widest border border-gray-800 px-3 py-1 rounded-full">
              <Navigation
                size={10}
                style={{ transform: `rotate(${bearing}deg)` }}
              />
              <span>Direction: {direction}</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
