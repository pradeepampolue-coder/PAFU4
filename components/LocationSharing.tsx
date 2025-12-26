
import React, { useState, useEffect, useRef } from 'react';
import { Location, User } from '../types';

declare const L: any;

interface LocationProps {
  locations: Record<string, Location>;
  onUpdate: (loc: Location) => void;
  otherUser: User;
  currentUserId: string;
  onBack: () => void;
}

const LocationSharing: React.FC<LocationProps> = ({ locations, onUpdate, otherUser, currentUserId, onBack }) => {
  const [isSharing, setIsSharing] = useState(false);
  const [followMode, setFollowMode] = useState<'none' | 'me' | 'partner'>('none');
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Record<string, any>>({});
  const circlesRef = useRef<Record<string, any>>({});
  const watchIdRef = useRef<number | null>(null);

  const myLoc = locations[currentUserId];
  const partnerLoc = locations[otherUser.id];

  // Map Initialization
  useEffect(() => {
    if (!mapRef.current && mapContainerRef.current) {
      mapRef.current = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        maxZoom: 20
      }).setView([0, 0], 2);

      // High-quality Google-style map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
      }).addTo(mapRef.current);

      // Fix for Leaflet initialization in dynamic containers
      setTimeout(() => mapRef.current?.invalidateSize(), 300);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update Markers & Follow logic
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarker = (id: string, lat: number, lng: number, name: string, isMe: boolean) => {
      if (markersRef.current[id]) {
        mapRef.current.removeLayer(markersRef.current[id]);
      }
      if (circlesRef.current[id]) {
        mapRef.current.removeLayer(circlesRef.current[id]);
      }

      const color = isMe ? '#4285F4' : '#EA4335';
      
      const icon = L.divIcon({
        className: 'custom-location-icon',
        html: isMe 
          ? `<div class="relative w-8 h-8">
               <div class="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
               <div class="absolute inset-1.5 bg-white rounded-full shadow-lg"></div>
               <div class="absolute inset-[9px] bg-blue-500 rounded-full border-2 border-white"></div>
             </div>`
          : `<div class="relative group">
               <div class="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-200"></div>
               <div class="relative w-14 h-14 bg-white rounded-3xl border-2 border-white shadow-2xl flex items-center justify-center overflow-hidden transition-transform group-hover:scale-110">
                 <div class="w-full h-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-xl uppercase">${name[0]}</div>
               </div>
             </div>`,
        iconSize: isMe ? [32, 32] : [56, 56],
        iconAnchor: isMe ? [16, 16] : [28, 64]
      });

      markersRef.current[id] = L.marker([lat, lng], { icon }).addTo(mapRef.current);

      circlesRef.current[id] = L.circle([lat, lng], {
        radius: isMe ? 40 : 30,
        fillColor: color,
        fillOpacity: 0.1,
        color: color,
        weight: 1,
        opacity: 0.2
      }).addTo(mapRef.current);
    };

    if (myLoc?.isActive) {
      updateMarker(currentUserId, myLoc.latitude, myLoc.longitude, 'Me', true);
    }
    if (partnerLoc?.isActive) {
      updateMarker(otherUser.id, partnerLoc.latitude, partnerLoc.longitude, otherUser.name, false);
    }

    // Advanced Follow Tracking
    if (followMode === 'me' && myLoc?.isActive) {
      mapRef.current.setView([myLoc.latitude, myLoc.longitude], 17, { animate: true });
    } else if (followMode === 'partner' && partnerLoc?.isActive) {
      mapRef.current.setView([partnerLoc.latitude, partnerLoc.longitude], 17, { animate: true });
    } else if (followMode === 'none' && !mapRef.current._hasPanned) {
        const coords = [];
        if (myLoc?.isActive) coords.push([myLoc.latitude, myLoc.longitude]);
        if (partnerLoc?.isActive) coords.push([partnerLoc.latitude, partnerLoc.longitude]);
        if (coords.length > 0) {
            mapRef.current.fitBounds(coords, { padding: [80, 80], maxZoom: 15 });
            mapRef.current._hasPanned = true;
        }
    }
  }, [myLoc, partnerLoc, followMode]);

  const toggleSharing = () => {
    if (!isSharing) {
      if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
      }
      setIsSharing(true);
      setFollowMode('me');
      
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          onUpdate({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            timestamp: Date.now(),
            isActive: true
          });
        },
        (err) => {
            console.error('GeoError:', err);
            setIsSharing(false);
            alert("Unable to access your location. Please check your permissions.");
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    } else {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsSharing(false);
      setFollowMode('none');
      onUpdate({ latitude: 0, longitude: 0, timestamp: Date.now(), isActive: false });
    }
  };

  return (
    <div className="h-screen w-screen fixed inset-0 flex flex-col z-[50] bg-white text-slate-900 transition-all">
      {/* Google-Style Top Bar */}
      <div className="absolute top-5 left-5 right-5 z-[1000] flex items-center gap-3 pointer-events-none">
        <div className="flex-1 bg-white/95 backdrop-blur-md shadow-xl rounded-full flex items-center px-5 py-2.5 border border-slate-200 pointer-events-auto">
            <button onClick={onBack} className="p-2 text-slate-500 hover:text-rose-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>
            </button>
            <div className="flex-1 px-4">
                <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">Two Sanctuary GPS</p>
                <p className="text-[10px] text-slate-500 font-medium">
                  {isSharing ? 'Live Tracking Active' : 'Standby Mode'}
                </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isSharing ? 'bg-green-500 animate-pulse' : 'bg-slate-300 shadow-inner'}`}></div>
        </div>
      </div>

      {/* Main Map */}
      <div ref={mapContainerRef} className="flex-1 w-full h-full grayscale-[0.2] contrast-[1.1]" />

      {/* Floating Buttons Group */}
      <div className="absolute bottom-36 right-6 z-[1000] flex flex-col gap-4">
        <button 
            onClick={() => {
                if (partnerLoc?.isActive) setFollowMode('partner');
                else alert(`${otherUser.name} isn't sharing right now.`);
            }}
            className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 border-2 ${followMode === 'partner' ? 'bg-rose-600 border-rose-500 text-white' : 'bg-white border-white text-slate-800'}`}
        >
            <span className="text-sm font-black uppercase">{otherUser.name[0]}</span>
        </button>
        <button 
            onClick={() => setFollowMode(prev => prev === 'me' ? 'none' : 'me')}
            className={`w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all active:scale-90 border-2 ${followMode === 'me' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white border-white text-slate-800'}`}
        >
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/></svg>
        </button>
      </div>

      {/* Bottom Info Sheet */}
      <div className="absolute bottom-8 left-6 right-6 z-[1000]">
        <div className="bg-white/95 backdrop-blur-lg shadow-2xl rounded-[2.5rem] border border-slate-100 overflow-hidden">
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 border border-blue-100/50">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase">Sanctuary Shield</h3>
                        <p className="text-[11px] text-slate-500 font-medium">Real-time p2p location tunnel</p>
                    </div>
                </div>
                <button 
                    onClick={toggleSharing}
                    className={`px-8 py-3.5 rounded-[1.25rem] text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95 ${
                        isSharing ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 'bg-blue-600 text-white shadow-blue-200'
                    }`}
                >
                    {isSharing ? 'Off' : 'On'}
                </button>
            </div>
            
            {partnerLoc?.isActive && (
                <div className="px-6 pb-6 pt-4 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-lg shadow-blue-200"></div>
                        <span className="text-[11px] font-bold text-slate-700">{otherUser.name} is Live</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Synced {new Date(partnerLoc.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default LocationSharing;
