'use client';

import { useEffect, useRef, useState } from 'react';
import { DataSubmission } from '@/lib/types';
import { MapPin, Navigation, Layers, ShieldCheck, Loader2 } from 'lucide-react';

interface GisMapProps {
  submissions: DataSubmission[];
  selectedSubmissionId?: string | null;
  onMarkerClick?: (submission: DataSubmission) => void;
}

export default function GisMap({
  submissions,
  selectedSubmissionId,
  onMarkerClick,
}: GisMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;

      try {
        const L = (await import('leaflet')).default;
        // Import leaflet css
        await import('leaflet/dist/leaflet.css');

        if (!mapInstanceRef.current && mapContainerRef.current) {
          // Default center (Bangladesh coordinates from seed data or 0,0)
          const centerLat = submissions[0]?.gps_location?.latitude || 23.8103;
          const centerLng = submissions[0]?.gps_location?.longitude || 90.4125;

          const map = L.map(mapContainerRef.current, {
            center: [centerLat, centerLng],
            zoom: 8,
            zoomControl: false,
          });

          L.control.zoom({ position: 'bottomright' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors | Innovative Data Platform',
            maxZoom: 19,
          }).addTo(map);

          markersLayerRef.current = L.layerGroup().addTo(map);
          mapInstanceRef.current = map;
          if (isMounted) setMapLoaded(true);
        }
      } catch (err) {
        console.error('Failed to initialize Leaflet GIS map:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // Update markers when submissions change
  useEffect(() => {
    if (!mapLoaded || !mapInstanceRef.current || !markersLayerRef.current) return;

    async function updateMarkers() {
      const L = (await import('leaflet')).default;
      markersLayerRef.current.clearLayers();

      const bounds = L.latLngBounds([]);
      let validLocations = 0;

      submissions.forEach((sub) => {
        const lat = sub.gps_location?.latitude;
        const lng = sub.gps_location?.longitude;

        if (lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng)) {
          const isSelected = selectedSubmissionId === sub.id;

          // Custom HTML marker pin
          const pinColor = isSelected
            ? '#2563eb'
            : sub.status === 'flagged'
            ? '#f59e0b'
            : '#10b981';

          const customIcon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `
              <div style="
                background-color: ${pinColor};
                width: 28px;
                height: 28px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 12px;
                cursor: pointer;
                transition: transform 0.2s ease;
              ">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 28],
            popupAnchor: [0, -28],
          });

          const marker = L.marker([lat, lng], { icon: customIcon });

          const popupContent = `
            <div style="font-family: sans-serif; font-size: 11px; padding: 2px; min-width: 170px;">
              <div style="font-weight: 700; color: #0f172a; font-size: 12px; margin-bottom: 2px;">
                ${sub.team_member_name || 'Field Collector'}
              </div>
              <div style="color: #64748b; margin-bottom: 4px;">
                ${sub.project_name || 'Project Survey'}
              </div>
              <div style="background: #f1f5f9; padding: 4px 6px; border-radius: 6px; margin-bottom: 6px;">
                <strong>GPS:</strong> ${lat.toFixed(4)}°, ${lng.toFixed(4)}°
                <br/><span style="color: #64748b;">${sub.gps_location?.address || 'Field Location'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #10b981; font-weight: 600; text-transform: uppercase;">
                  ${sub.sync_status}
                </span>
                <span style="color: #94a3b8; font-size: 10px;">
                  ${new Date(sub.submitted_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);

          marker.on('click', () => {
            if (onMarkerClick) onMarkerClick(sub);
          });

          marker.addTo(markersLayerRef.current);
          bounds.extend([lat, lng]);
          validLocations++;
        }
      });

      if (validLocations > 0 && mapInstanceRef.current) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }

    updateMarkers();
  }, [mapLoaded, submissions, selectedSubmissionId, onMarkerClick]);

  return (
    <div className="relative w-full h-[450px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xs">
      {!mapLoaded && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-50 text-slate-500 gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-semibold">Initializing Leaflet GIS Engine...</span>
        </div>
      )}

      {/* Floating Map Legend & Stats Overlay */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-xs px-3.5 py-2.5 rounded-xl border border-slate-200/80 shadow-md text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <span>Real-Time GIS Tracking</span>
        </div>
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Verified ({submissions.filter((s) => s.status === 'verified').length})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            Flagged ({submissions.filter((s) => s.status === 'flagged').length})
          </span>
        </div>
      </div>

      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}
