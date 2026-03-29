import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
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

/** Strip HTML and collapse whitespace for safe popup text. */
function plainTextSnippet(raw: string | null | undefined, maxLen: number): string | null {
  if (!raw?.trim()) return null;
  const plain = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!plain) return null;
  if (plain.length <= maxLen) return plain;
  return `${plain.slice(0, Math.max(0, maxLen - 1))}…`;
}

function lifespanLabel(p: Person): string | null {
  const b = p.birthDate?.trim();
  const d = p.deathDate?.trim();
  if (b && d) return `${b} – ${d}`;
  if (b) return b;
  if (d) return d;
  return null;
}

interface MapPersonBlockProps {
  person: Person;
  onSelect: (id: string) => void;
  t: boolean;
}

function MapPersonBlock({ person: p, onSelect, t }: MapPersonBlockProps) {
  const life = lifespanLabel(p);
  const hebrewAlt =
    p.hebrewName && p.hebrewName.trim() && p.hebrewName.trim() !== p.fullName.trim()
      ? p.hebrewName.trim()
      : null;
  const noteSrc = p.note_plain?.trim() || p.note;
  const snippet = plainTextSnippet(noteSrc, t ? 130 : 160);
  const migrationShort = plainTextSnippet(p.migrationInfo, t ? 100 : 120);
  const tags = (p.tags || []).slice(0, 5);

  return (
    <button
      type="button"
      className={`block w-full text-start rounded-lg border border-slate-100 bg-slate-50/80 px-2 py-1.5 mb-1.5 hover:bg-blue-50/90 hover:border-blue-100 transition-colors ${t ? 'text-right' : 'text-left'}`}
      onClick={() => onSelect(p.id)}
    >
      <span className="font-semibold text-slate-800 text-[13px] leading-tight block">{p.fullName}</span>
      {hebrewAlt && (
        <span className="block text-[11px] text-slate-600 mt-0.5 leading-snug">{hebrewAlt}</span>
      )}
      {life && (
        <span className="block text-[11px] text-slate-500 mt-0.5">
          {t ? 'תאריכים: ' : ''}
          {life}
        </span>
      )}
      {p.title && (
        <span className="block text-[10px] text-slate-500 mt-0.5 italic leading-snug line-clamp-2">
          {p.title}
        </span>
      )}
      {p.relationToYael && (
        <span className="block text-[11px] text-violet-700 mt-1 leading-snug">{p.relationToYael}</span>
      )}
      {(p.holocaustVictim || p.warCasualty) && (
        <span className="flex flex-wrap gap-1 mt-1">
          {p.holocaustVictim && (
            <span className="text-[9px] font-medium uppercase tracking-wide bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded">
              {t ? 'שואה' : 'Shoah'}
            </span>
          )}
          {p.warCasualty && (
            <span className="text-[9px] font-medium uppercase tracking-wide bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
              {t ? 'נפילה בקרב' : 'War'}
            </span>
          )}
        </span>
      )}
      {tags.length > 0 && (
        <span className="flex flex-wrap gap-0.5 mt-1">
          {tags.map(tag => (
            <span
              key={tag}
              className="text-[9px] font-medium bg-white text-slate-600 border border-slate-200 px-1 py-px rounded"
            >
              {tag}
            </span>
          ))}
        </span>
      )}
      {migrationShort && (
        <span className="block text-[10px] text-sky-800 mt-1 leading-snug border-s border-sky-200 ps-1.5">
          {t ? 'מסלול: ' : ''}
          {migrationShort}
        </span>
      )}
      {snippet && (
        <span className="block text-[10px] text-slate-600 mt-1 leading-relaxed line-clamp-3">{snippet}</span>
      )}
      <span className="block text-[10px] text-blue-600 mt-1 font-medium">
        {t ? 'לחצו לפרטים מלאים ←' : 'Open details →'}
      </span>
    </button>
  );
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
    <div className="w-full h-full min-h-[400px] bg-slate-100 rounded-2xl overflow-hidden shadow-xl border border-slate-200 relative">
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
        <FitBounds points={points} />
        {points.map(cluster => {
          const loc = clusterToLocation(cluster);
          const distinctPlaces = new Set(
            cluster.persons.map(p => p.birthPlace).filter(Boolean)
          );
          const sortedPersons = [...cluster.persons].sort((a, b) =>
            a.fullName.localeCompare(b.fullName, undefined, { sensitivity: 'base' })
          );
          const tooltipLine =
            loc.peopleCount != null && loc.peopleCount > 1
              ? `${loc.original_location} (${loc.peopleCount})`
              : sortedPersons[0]?.fullName || loc.original_location;
          return (
            <Marker key={cluster.key} position={[cluster.lat, cluster.lng]}>
              <Tooltip direction="top" offset={[0, -10]} opacity={0.92}>
                <span dir={t ? 'rtl' : 'ltr'}>{tooltipLine}</span>
              </Tooltip>
              <Popup maxWidth={440} className="map-person-popup">
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
                  <div className="max-h-[min(70vh,22rem)] overflow-y-auto text-xs border-t border-slate-100 pt-2 mt-1">
                    {sortedPersons.map(p => (
                      <MapPersonBlock key={p.id} person={p} onSelect={onSelectPerson} t={t} />
                    ))}
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
