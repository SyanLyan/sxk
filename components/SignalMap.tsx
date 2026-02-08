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
function AutoFitBounds({ points, myLocation }: { points: [number, number][], myLocation: Location | null }) {
  const map = useMap();

  useEffect(() => {
    // Fix for Leaflet rendering in a resizing container (Framer Motion)
    const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize();
    });
    resizeObserver.observe(map.getContainer());
    
    // Slight delay to ensure container has size before fitting
    setTimeout(() => {
        map.invalidateSize();
        if (points.length > 1) {
            const bounds = L.latLngBounds(points);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, animate: true, duration: 1.5 });
        } else if (myLocation) {
             map.flyTo([myLocation.lat, myLocation.lng], 13, { animate: true, duration: 1.5 });
        }
    }, 100);

    return () => resizeObserver.disconnect();
  }, [points, map, myLocation]);

  return null;
}

type Location = {
  lat: number;
  lng: number;
};

type SignalMapProps = {
  myLocation: Location | null;
  partnerLocation: Location | null;
  myAvatar: string;
  herAvatar: string;
};

export default function SignalMap({ myLocation, partnerLocation, myAvatar, herAvatar }: SignalMapProps) {
  // Center default (somewhere neutral or 0,0)
  const defaultCenter: [number, number] = [20, 0];
  
  // Valid points to show bounds
  const points: [number, number][] = [];
  if (myLocation) points.push([myLocation.lat, myLocation.lng]);
  if (partnerLocation) points.push([partnerLocation.lat, partnerLocation.lng]);

  // If no location, don't render map or render placeholder? 
  // We'll render map but centered globally if empty
  
  const myIcon = myAvatar ? createAvatarIcon(myAvatar, false) : createFallbackIcon("S");
  const herIcon = herAvatar ? createAvatarIcon(herAvatar, true) : createFallbackIcon("K");
  
  // THEME: "Modern Clean"
  // Standard OSM tiles, no filters.

  return (
    <div className="w-full h-full relative isolate rounded-xl overflow-hidden border border-gray-200 dark:border-purple-500/30 shadow-2xl bg-gray-50 dark:bg-gray-900">
        
       <MapContainer 
         center={defaultCenter} 
         zoom={4} 
         scrollWheelZoom={true} 
         className="w-full h-full z-0"
         zoomControl={false} 
         attributionControl={false}
       >
         {/* BASE LAYER - Standard OSM */}
         <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
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
                   weight: 4, 
                   opacity: 0.8,
                   lineCap: 'round'
               }} 
             />
         )}

         <AutoFitBounds points={points} myLocation={myLocation} />
       </MapContainer>
    </div>
  );
}
