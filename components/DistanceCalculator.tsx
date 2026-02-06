"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Navigation,
  Send,
  User,
  Radar,
  Heart,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

// ...existing code...
// (Keep CONSTANTS: HER_AVATAR, MY_AVATAR_FALLBACK, etc. unchanged)
const HER_AVATAR = "/Her/img/casual/1000009032.jpeg";
const MY_AVATAR_FALLBACK = "S"; 

const HER_LOCATION = {
  lat: 16.789663,
  lng: 96.191354,
  name: "Her",
};

const KM_PER_HOUR_DRIVE = 40;
const LOCAL_ID_KEY = "sxk-client-id";

// (Keep Helper Functions: calculateDistance, deg2rad, formatKm, getDriveMinutes, getBearing, bearingToCompass unchanged)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
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

type RequestRow = {
  id: string;
  requester_id: string;
  requester_label: string | null;
  created_at: string;
};

type DistanceCalculatorProps = {
  sessionCode?: string;
};

export default function DistanceCalculator({ sessionCode }: DistanceCalculatorProps) {
  const [myLocation, setMyLocation] = useState<LocationPoint | null>(null);
  const [partnerLocation, setPartnerLocation] = useState<LocationPoint | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingRequest, setPendingRequest] = useState<RequestRow | null>(null);
  const [clientId, setClientId] = useState<string | null>(null);
  const CALC_DELAY_MS = 800;

  // ...existing code...
  // (All useEffect hooks remain the same)
  const supabase = useMemo(() => {
        if (!sessionCode) return null;
        return createBrowserSupabaseClient();
      }, [sessionCode]);
    
      useEffect(() => {
        if (!sessionCode) {
          setPartnerLocation({ lat: HER_LOCATION.lat, lng: HER_LOCATION.lng });
        }
      }, [sessionCode]);
    
      useEffect(() => {
        let stored = localStorage.getItem(LOCAL_ID_KEY);
        if (!stored) {
          stored = crypto.randomUUID();
          localStorage.setItem(LOCAL_ID_KEY, stored);
        }
        setClientId(stored);
      }, []);
    
      useEffect(() => {
        if (!sessionCode || !supabase || !clientId) return;
    
        const fetchInitial = async () => {
          const { data } = await supabase
            .from("pair_locations")
            .select("client_id, lat, lng, updated_at")
            .eq("session_code", sessionCode);
    
          data?.forEach((row) => {
            const point = {
              lat: row.lat,
              lng: row.lng,
              updatedAt: row.updated_at,
            };
            if (row.client_id === clientId) setMyLocation(point);
            else setPartnerLocation(point);
          });
        };
    
        fetchInitial();
    
        const locationChannel = supabase
          .channel(`pair-locations-${sessionCode}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "pair_locations",
              filter: `session_code=eq.${sessionCode}`,
            },
            (payload) => {
              const row = payload.new as {
                client_id: string;
                lat: number;
                lng: number;
                updated_at: string;
              };
              const point = {
                lat: row.lat,
                lng: row.lng,
                updatedAt: row.updated_at,
              };
              if (row.client_id === clientId) setMyLocation(point);
              else setPartnerLocation(point);
            },
          )
          .subscribe();
    
        const requestChannel = supabase
          .channel(`pair-requests-${sessionCode}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "pair_requests",
              filter: `session_code=eq.${sessionCode}`,
            },
            (payload) => {
              const row = payload.new as RequestRow;
              if (row.requester_id !== clientId) {
                setPendingRequest(row);
              }
            },
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(locationChannel);
          supabase.removeChannel(requestChannel);
        };
      }, [clientId, sessionCode, supabase]);
    
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

  const syncLocation = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentLat = position.coords.latitude;
          const currentLng = position.coords.longitude;
          setMyLocation({ lat: currentLat, lng: currentLng });

          if (sessionCode && supabase && clientId) {
            const { error: upsertError } = await supabase
              .from("pair_locations")
              .upsert(
                {
                  session_code: sessionCode,
                  client_id: clientId,
                  lat: currentLat,
                  lng: currentLng,
                  updated_at: new Date().toISOString(),
                },
                { onConflict: "session_code,client_id" },
              );

            if (upsertError) {
              reject(upsertError);
            } else {
              resolve();
            }
          } else if (!sessionCode) {
             // Allow offline/demo use
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
    if (!sessionCode || !supabase || !clientId) return;

    setRequesting(true);
    setError(null);
    
    // Also set loading state for visual feedback on the map icon
    setLoading(true);

    try {
      // 1. Sync my location first so it's ready when they open the link
      await syncLocation();

      // 2. Send the Telegram Notification
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const entryUrl = origin
        ? `${origin}/entry/${sessionCode}`
        : `/entry/${sessionCode}`;
      const message = `📍 Signal Request.\nPartner is waiting at: ${entryUrl}`;

      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      // 3. Create a request record to trigger UI on their active screen (if open)
      await supabase.from("pair_requests").insert({
        session_code: sessionCode,
        requester_id: clientId,
        requester_label: "Partner",
      });
    } catch (err) {
      console.error(err);
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
      await syncLocation();

      /* Accept any pending request when sharing */
      if (pendingRequest?.id && supabase) {
        await supabase
          .from("pair_requests")
          .delete()
          .eq("id", pendingRequest.id);
        setPendingRequest(null);
      }
    } catch (err) {
      console.error(err);
      setError("Location access denied or failed");
    } finally {
      // Add a small artificial delay for UX smoothness if it was too fast
      setTimeout(() => setLoading(false), CALC_DELAY_MS);
    }
  };

  const displayDistanceKm = distanceKm;
  const driveMinutes = displayDistanceKm ? getDriveMinutes(displayDistanceKm) : null;
  const bearing = (myLocation && partnerLocation) 
    ? getBearing(myLocation.lat, myLocation.lng, partnerLocation.lat, partnerLocation.lng)
    : 0;
  const direction = bearingToCompass(bearing);

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
                 <div className="relative flex flex-col items-center gap-4 group cursor-default">
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className="w-16 h-16 rounded-full border border-gray-700 bg-background/50 backdrop-blur-md flex items-center justify-center relative shadow-2xl z-10"
                    >
                         {loading ? (
                             <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 border-r-transparent animate-spin" />
                         ) : (
                             <MapPin size={20} className={cn("text-gray-400 group-hover:text-purple-400 transition-colors", distanceKm !== null && "text-purple-500")} />
                         )}
                    </motion.div>
                    <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Your Location</span>
                 </div>

                 {/* DISTANCE (Floating in middle if active) */}
                 <AnimatePresence>
                     {distanceKm !== null && (
                         <motion.div 
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 20, opacity: 0 }}
                            className="absolute left-1/2 -translate-x-1/2 -top-12 bg-black/50 border border-purple-500/30 backdrop-blur-md px-4 py-2 rounded text-center z-20"
                         >
                             <span className="block text-2xl font-bold font-mono text-white text-shadow-glow">
                                 {formatKm(distanceKm)}
                             </span>
                             {driveMinutes && (
                                 <span className="text-[9px] text-gray-400 uppercase tracking-wider block">
                                     ~{driveMinutes} mins away
                                 </span>
                             )}
                         </motion.div>
                     )}
                 </AnimatePresence>

                 {/* RIGHT: HER */}
                 <div className="relative flex flex-col items-center gap-4 group cursor-default">
                    <motion.div 
                        whileHover={{ scale: 1.1 }}
                        className={cn(
                            "w-16 h-16 rounded-full border border-gray-700 bg-background/50 backdrop-blur-md flex items-center justify-center relative shadow-2xl z-10 overflow-hidden",
                            distanceKm !== null && "border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        )}
                    >
                         {/* Image or Icon */}
                        <img src={HER_AVATAR} alt="Her" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                    <span className="text-[10px] font-mono tracking-widest text-gray-500 uppercase">Her Heart</span>
                 </div>
            </div>

            {/* PENDING REQUEST ALERT */}
            <AnimatePresence>
                {pendingRequest && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mb-8 w-full max-w-sm"
                    >
                        <div className="bg-purple-900/20 border border-purple-500/40 p-4 rounded text-center">
                            <p className="text-xs text-purple-300 font-mono mb-3 uppercase tracking-wider">Incoming Signal Request</p>
                            <button onClick={shareLocation} className="text-xs bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded uppercase font-bold tracking-widest">
                                Accept Link
                            </button>
                        </div>
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
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mt-8">
                <button
                  onClick={shareLocation}
                  disabled={loading}
                  className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none"
                >
                  <div className="absolute inset-0 w-full h-full bg-purple-100 dark:bg-purple-500/10 border border-purple-400 dark:border-purple-500/30 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 dark:group-hover:border-purple-400/70 transition-colors" />
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-700 dark:via-purple-400 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                  <span className="relative font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 text-purple-950 dark:text-purple-100 font-bold">
                    {loading ? (
                        <Radar size={16} className="animate-spin text-purple-800 dark:text-purple-200" />
                    ) : ( 
                        <Navigation
                        size={16}
                        className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-500 text-purple-800 dark:text-purple-200"
                        />
                    )}
                    {loading ? "Scanning..." : "Initiate Scan"}
                  </span>
                </button>

                {sessionCode && supabase && (
                    <button
                        onClick={requestLocation}
                        disabled={requesting}
                        className="group relative px-8 py-4 bg-transparent overflow-hidden rounded-none"
                    >
                        <div className="absolute inset-0 w-full h-full bg-white/50 dark:bg-white/5 border border-purple-400/50 dark:border-purple-500/20 group-hover:border-purple-500/50 transition-colors" />
                        
                        <span className="relative font-mono text-sm tracking-[0.3em] uppercase flex items-center gap-3 text-purple-950 dark:text-purple-100 font-bold">
                            <Send size={16} className={cn("text-purple-800 dark:text-purple-200", requesting && "animate-pulse")} />
                            {requesting ? "Pinging..." : "Ping Signal"}
                        </span>
                    </button>
                )}
            </div>

            {/* DIRECTION FOOTER */}
            {distanceKm !== null && direction && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-12 text-center"
                >
                    <div className="inline-flex items-center gap-2 text-gray-500 text-[10px] font-mono uppercase tracking-widest border border-gray-800 px-3 py-1 rounded-full">
                        <Navigation size={10} style={{ transform: `rotate(${bearing}deg)` }} />
                        <span>Direction: {direction}</span>
                    </div>
                </motion.div>
            )}

        </div>
    </section>
  );
}