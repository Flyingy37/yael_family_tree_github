import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Person } from '../types';

interface Props {
  persons: Map<string, Person>;
  filteredIds: Set<string>;
  onSelectPerson: (id: string) => void;
}

interface ClusterPoint {
  lat: number;
  lng: number;
  persons: Person[];
  key: string;
}

function getSexColor(sex: string): string {
  if (sex === 'F') return '#ec4899';
  if (sex === 'M') return '#3b82f6';
  return '#94a3b8';
}

function FitBounds({ points }: { points: ClusterPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    map.fitBounds([
      [Math.min(...lats) - 1, Math.min(...lngs) - 1],
      [Math.max(...lats) + 1, Math.max(...lngs) + 1],
    ]);
  }, [points, map]);
  return null;
}

export function MapView({ persons, filteredIds, onSelectPerson }: Props) {
  const points = useMemo(() => {
    const locationMap = new Map<string, Person[]>();
    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person?.coordinates) continue;
      // Round to ~1km precision for clustering
      const key = `${person.coordinates[0].toFixed(2)},${person.coordinates[1].toFixed(2)}`;
      if (!locationMap.has(key)) locationMap.set(key, []);
      locationMap.get(key)!.push(person);
    }
    const clusters: ClusterPoint[] = [];
    for (const [key, personList] of locationMap) {
      const [lat, lng] = key.split(',').map(Number);
      clusters.push({ lat, lng, persons: personList, key });
    }
    return clusters;
  }, [persons, filteredIds]);

  const totalOnMap = useMemo(() => points.reduce((sum, p) => sum + p.persons.length, 0), [points]);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur rounded-lg px-3 py-2 text-sm shadow" dir="rtl">
        <span className="font-medium">{totalOnMap.toLocaleString()}</span>
        <span className="text-gray-500"> אנשים על המפה</span>
        <span className="text-gray-400"> ({points.length} מיקומים)</span>
      </div>
      <MapContainer
        center={[32.0, 34.8]}
        zoom={3}
        className="w-full h-full"
        style={{ background: '#f0f4f8' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds points={points} />
        {points.map(cluster => (
          <CircleMarker
            key={cluster.key}
            center={[cluster.lat, cluster.lng]}
            radius={Math.min(5 + Math.sqrt(cluster.persons.length) * 3, 25)}
            fillColor={cluster.persons.length === 1 ? getSexColor(cluster.persons[0].sex) : '#8b5cf6'}
            fillOpacity={0.7}
            color="#fff"
            weight={1.5}
          >
            <Popup>
              <div className="max-h-48 overflow-y-auto text-xs" dir="ltr">
                <div className="font-bold mb-1 text-sm">
                  {cluster.persons[0]?.birthPlace || `${cluster.lat}, ${cluster.lng}`}
                </div>
                <div className="text-gray-500 mb-2">{cluster.persons.length} people</div>
                {cluster.persons.slice(0, 20).map(p => (
                  <button
                    key={p.id}
                    className="block w-full text-left py-0.5 hover:text-blue-600 cursor-pointer"
                    onClick={() => onSelectPerson(p.id)}
                  >
                    {p.fullName}
                    {p.birthDate && <span className="text-gray-400 mr-1"> ({p.birthDate})</span>}
                  </button>
                ))}
                {cluster.persons.length > 20 && (
                  <div className="text-gray-400 mt-1">+{cluster.persons.length - 20} more...</div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
