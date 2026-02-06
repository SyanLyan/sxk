"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

// --- CUSTOM ICONS ---
// We use L.divIcon to render our React-style avatars as map markers
const createAvatarIcon = (url: string, isHer: boolean) => {
  const colorClass = isHer ? "border-purple-500 shadow-[0_0_15px_#a855f7]" : "border-gray-400";
  
  return L.divIcon({
    className: "bg-transparent",
    html: `
      <div class="w-10 h-10 rounded-full border-2 ${colorClass} overflow-hidden bg-black relative">
        <img src="${url}" class="w-full h-full object-cover" />
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20], // Center it
  });
};

const createFallbackIcon = (initial: string) => {
    return L.divIcon({
        className: "bg-transparent",
        html: `
          <div class="w-10 h-10 rounded-full border-2 border-gray-500 bg-gray-900 flex items-center justify-center text-white font-mono font-bold shadow-lg">
            ${initial}
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });
}

// --- AUTO FIT BOUNDS COMPONENT ---
function AutoFitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(points);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true, duration: 1.5 });
  }, [points, map]);

  return null;
}

type Location = {
  lat: number;
  lng: number;
};

type SignalMapProps = {
  myLocation: Location | null;
  partnerLocation: Location | null;
  herAvatar: string;
};

export default function SignalMap({ myLocation, partnerLocation, herAvatar }: SignalMapProps) {
  // Center default (somewhere neutral or 0,0)
  const defaultCenter: [number, number] = [20, 0];
  
  // Valid points to show bounds
  const points: [number, number][] = [];
  if (myLocation) points.push([myLocation.lat, myLocation.lng]);
  if (partnerLocation) points.push([partnerLocation.lat, partnerLocation.lng]);

  // If no location, don't render map or render placeholder? 
  // We'll render map but centered globally if empty
  
  const myIcon = createFallbackIcon("S"); // Hardcoded 'S' based on parent logic
  const herIcon = createAvatarIcon(herAvatar, true);
  
  // THEME: "Retro Grid"
  // We use CartoDB Dark Matter tiles + CSS filters to make it purple/cyberpunk.

  return (
    <div className="w-full h-full relative isolate rounded-xl overflow-hidden border border-purple-500/30 shadow-2xl">
        
       {/* Scanline Overlay */}
       <div className="absolute inset-0 z-[401] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
       <div className="absolute inset-0 z-[401] pointer-events-none bg-gradient-to-b from-transparent via-purple-500/5 to-transparent" />

       <MapContainer 
         center={points[0] || defaultCenter} 
         zoom={2} 
         scrollWheelZoom={false} // Keep it static-ish for "mini map" feel unless interacted
         className="w-full h-full z-0 bg-[#1a1a1a]"
         zoomControl={false} // Clean retro look
         attributionControl={false}
       >
         {/* BASE LAYER - Dark Matter */}
         <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            className="map-tiles-retro" // We will inject CSS to style this class
         />

         {/* YOU */}
         {myLocation && (
             <Marker position={[myLocation.lat, myLocation.lng]} icon={myIcon} />
         )}

         {/* HER */}
         {partnerLocation && (
             <Marker position={[partnerLocation.lat, partnerLocation.lng]} icon={herIcon} />
         )}

         {/* CONNECTION LINE */}
         {myLocation && partnerLocation && (
             <Polyline 
               positions={[
                   [myLocation.lat, myLocation.lng], 
                   [partnerLocation.lat, partnerLocation.lng]
               ]} 
               pathOptions={{ 
                   color: '#a855f7', // purple-500
                   weight: 2, 
                   dashArray: '5, 10', 
                   opacity: 0.8 
               }} 
             />
         )}

         <AutoFitBounds points={points} />
       </MapContainer>

       {/* INJECT CSS FILTERS FOR TILES */}
       <style jsx global>{`
         .map-tiles-retro {
            filter: contrast(1.1) brightness(0.8) sepia(1) hue-rotate(240deg) saturate(1.2) !important;
         }
         .leaflet-container {
            background: #050505 !important;
         }
       `}</style>
    </div>
  );
}
