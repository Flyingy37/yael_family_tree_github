import React, { useEffect, useRef } from 'react';
import { ITINERARY } from '../constants';

// Declare global Leaflet variable since we are loading it via script tag for plugin support
declare const L: any;

export const TripMap: React.FC = () => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);

    useEffect(() => {
        if (!mapContainer.current || mapInstance.current) return;

        // Initialize Map
        const map = L.map(mapContainer.current).setView([40.4168, -3.7038], 13); // Center on Madrid
        mapInstance.current = map;

        // Add Tile Layer (CartoDB Dark Matter for Dark Mode)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        // Initialize Marker Cluster Group with Custom Styling
        const markers = L.markerClusterGroup({
            showCoverageOnHover: false,
            zoomToBoundsOnClick: false, // Disable default zoom to implement custom smooth zoom
            maxClusterRadius: 40,
            iconCreateFunction: function(cluster: any) {
                return L.divIcon({ 
                    html: `<span>${cluster.getChildCount()}</span>`, 
                    className: 'custom-cluster-icon', 
                    iconSize: L.point(40, 40) 
                });
            }
        });

        // Add Smooth Zoom Handler
        markers.on('clusterclick', (a: any) => {
            map.flyToBounds(a.layer.getBounds(), {
                padding: [50, 50],
                duration: 0.8,
                easeLinearity: 0.25
            });
        });

        // Collect all locations
        const locations = ITINERARY.flatMap(day => 
            day.events.filter(e => e.coords).map(e => ({
                ...e,
                dayName: day.dayName
            }))
        );

        // Create Markers and add to Cluster Group
        const bounds = L.latLngBounds([]);

        locations.forEach(loc => {
            if (!loc.coords) return;

            // Custom HTML Marker
            const customIcon = L.divIcon({
                className: 'custom-marker-wrapper',
                html: `<div class="custom-marker-pin"></div>`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32]
            });

            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((loc.location || loc.title) + " Madrid")}`;

            // Handle image HTML
            const imageHtml = loc.image 
                ? `<div style="width: 100%; height: 100px; overflow: hidden; position: relative;">
                     <img src="${loc.image}" style="width: 100%; height: 100%; object-fit: cover;" alt="${loc.title}" />
                     <div style="position: absolute; top: 0; left: 0; right: 0; height: 100%; background: linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 40%);"></div>
                   </div>`
                : `<div class="bg-gradient-to-r from-blue-900 to-blue-800 h-2 w-full"></div>`; // Fallback bar if no image

            const headerClass = loc.image 
                ? 'absolute top-2 right-2 left-2 flex justify-between items-center z-10 text-white' 
                : 'flex justify-between items-center relative z-10 p-3 pt-4 bg-gradient-to-r from-blue-900 to-blue-800 text-white';

            // Popup Content with Dark Mode Classes
            const popupContent = `
                <div class="font-sans text-right" dir="rtl" style="min-width: 240px; overflow: hidden; border-radius: 12px;">
                    ${imageHtml}
                    <div class="${headerClass}" style="${loc.image ? 'text-shadow: 0 1px 3px rgba(0,0,0,0.8);' : ''}">
                        ${loc.image ? '' : '<div class="absolute top-0 left-0 right-0 h-1 bg-amber-400"></div>'}
                         <span class="text-xs font-bold opacity-90 tracking-wide">${loc.dayName}</span>
                         <span class="text-xs font-mono bg-blue-950/80 px-2 py-0.5 rounded text-amber-300 font-bold border border-white/20 shadow-sm backdrop-blur-sm">${loc.time}</span>
                    </div>
                    <div class="p-4 bg-[#1e293b] relative text-white">
                        <h3 class="font-bold text-white text-base mb-1.5 leading-snug">${loc.title}</h3>
                        ${loc.description ? `<p class="text-sm text-slate-300 mb-4 leading-relaxed border-l-2 border-slate-600 pl-2 ml-1">${loc.description}</p>` : ''}
                        
                        <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
                           class="flex items-center justify-center gap-2 w-full bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-bold py-2.5 rounded-lg border border-slate-600 hover:border-amber-500/50 transition-colors shadow-sm">
                           <span>נווט למקום</span>
                           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                        </a>
                    </div>
                </div>
            `;

            const marker = L.marker(loc.coords, { icon: customIcon })
                .bindPopup(popupContent);
            
            markers.addLayer(marker);
            bounds.extend(loc.coords);
        });

        // Add Cluster Group to Map
        map.addLayer(markers);

        // Fit bounds if locations exist
        if (locations.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

        // Cleanup
        return () => {
            map.remove();
            mapInstance.current = null;
        };
    }, []);

    return (
        <div className="relative w-full h-[calc(100vh-140px)] bg-slate-900">
             {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full z-0" />
            
            {/* Overlay Info */}
            <div className="absolute top-4 right-4 left-4 z-[400] pointer-events-none">
                <div className="bg-[#1e293b]/90 backdrop-blur-md border border-slate-600 p-3 rounded-xl shadow-lg flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-900 to-blue-800 flex items-center justify-center shrink-0 shadow-sm border border-blue-700">
                        <div className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.6)]"></div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-white uppercase tracking-wide">מפת הטיול</p>
                        <p className="text-[11px] text-slate-300 font-medium">כל הנקודות החשובות למדריד</p>
                    </div>
                </div>
            </div>
        </div>
    );
};