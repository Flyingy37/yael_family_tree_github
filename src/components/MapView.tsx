import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type { Person } from '../types';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

/** Shape for static geocoded rows (e.g. CSV pipeline); map view builds this internally from `Person` clusters too. */
export interface GeocodedLocation {
  original_location: string;
  lat: number;
  lon: number;
  resolved_name: string;
  peopleCount?: number;
}

interface Props {
  persons: Map<string, Person>;
  filteredIds: Set<string>;
  onSelectPerson: (id: string) => void;
  language?: 'en' | 'he';
}

interface ClusterPoint {
  lat: number;
  lng: number;
  persons: Person[];
  key: string;
}

function FitBounds({ points }: { points: ClusterPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    map.fitBounds(
      [
        [Math.min(...lats) - 0.5, Math.min(...lngs) - 0.5],
        [Math.max(...lats) + 0.5, Math.max(...lngs) + 0.5],
      ],
      { padding: [28, 28] }
    );
  }, [points, map]);
  return null;
}

function MapResizer() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

function clusterToLocation(cluster: ClusterPoint): GeocodedLocation {
  const places = [...new Set(cluster.persons.map(p => p.birthPlace).filter(Boolean))] as string[];
  const primary =
    places[0] ?? `${cluster.lat.toFixed(2)}, ${cluster.lng.toFixed(2)}`;
  return {
    original_location: primary,
    lat: cluster.lat,
    lon: cluster.lng,
    resolved_name: places.length > 1 ? places.join(' · ') : primary,
    peopleCount: cluster.persons.length,
  };
}

export function MapView({ persons, filteredIds, onSelectPerson, language = 'en' }: Props) {
  const t = language === 'he';

  const points = useMemo(() => {
    const locationMap = new Map<string, Person[]>();
    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person?.coordinates) continue;
      const key = `${person.coordinates[0].toFixed(2)},${person.coordinates[1].toFixed(2)}`;
      if (!locationMap.has(key)) locationMap.set(key, []);
      locationMap.get(key)!.push(person);
    }
    const clusters: ClusterPoint[] = [];
    for (const [key, personList] of locationMap) {
      const [lat, lng] = key.split(',').map(Number);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
      clusters.push({ lat, lng, persons: personList, key });
    }
    return clusters;
  }, [persons, filteredIds]);

  const totalPeople = useMemo(() => points.reduce((s, p) => s + p.persons.length, 0), [points]);

  return (
    <div className="w-full flex-1 min-h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200 relative">
      <div
        className="absolute top-4 end-4 z-[400] bg-white/95 backdrop-blur-sm px-5 py-3 rounded-xl shadow-lg border border-slate-200 max-w-[min(20rem,calc(100%-2rem))]"
        dir={t ? 'rtl' : 'ltr'}
      >
        <h3 className="font-bold text-slate-800 text-lg">
          {t ? 'מפת מסע המשפחה' : 'Family journey map'}
        </h3>
        <p className="text-sm text-slate-500">
          {t ? (
            <>
              מציג <span className="font-semibold text-blue-600">{points.length}</span> מיקומים היסטוריים
              {totalPeople > 0 && (
                <>
                  {' '}
                  (<span className="font-semibold text-slate-700">{totalPeople}</span> אנשים)
                </>
              )}
            </>
          ) : (
            <>
              Showing <span className="font-semibold text-blue-600">{points.length}</span> locations
              {totalPeople > 0 && (
                <>
                  {' '}
                  (<span className="font-semibold text-slate-700">{totalPeople}</span> people)
                </>
              )}
            </>
          )}
        </p>
      </div>

      <MapContainer
        center={[45.0, 30.0]}
        zoom={4}
        className="w-full h-full"
        style={{ width: '100%', height: '100%', zIndex: 10, background: '#e2e8f0' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizer />
        <FitBounds points={points} />
        {points.map(cluster => {
          const loc = clusterToLocation(cluster);
          const distinctPlaces = new Set(
            cluster.persons.map(p => p.birthPlace).filter(Boolean)
          );
          return (
            <Marker key={cluster.key} position={[cluster.lat, cluster.lng]}>
              <Popup>
                <div className={t ? 'text-right' : 'text-left'} dir={t ? 'rtl' : 'ltr'}>
                  <strong className="block text-[15px] text-slate-800 mb-1">{loc.original_location}</strong>
                  {distinctPlaces.size > 1 && (
                    <span className="block text-xs text-slate-500 mb-2 leading-relaxed">{loc.resolved_name}</span>
                  )}
                  {loc.peopleCount != null && loc.peopleCount > 0 && (
                    <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-1 rounded-md mb-2">
                      {t
                        ? `${loc.peopleCount} בני משפחה קשורים למקום זה`
                        : `${loc.peopleCount} family members at this place`}
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto text-xs border-t border-slate-100 pt-2 mt-1 space-y-0.5">
                    {cluster.persons.slice(0, 20).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className={`block w-full py-0.5 text-blue-600 hover:underline ${t ? 'text-right' : 'text-left'}`}
                        onClick={() => onSelectPerson(p.id)}
                      >
                        {p.fullName}
                        {p.birthDate && <span className="text-slate-400"> ({p.birthDate})</span>}
                      </button>
                    ))}
                    {cluster.persons.length > 20 && (
                      <div className="text-slate-400 pt-1">
                        +{cluster.persons.length - 20} {t ? 'נוספים…' : 'more…'}
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
