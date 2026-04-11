import { useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import type { Person } from '../types';
import { approximateCoordinatesForBirthPlace } from '../utils/birthPlaceCoordinates';

// Vite bundles image imports as full URLs; delete the prototype method
// that auto-constructs the path from the CSS imagePath (which doubles the URL).
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
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
  /** True when position comes from birthPlace lookup, not Person.coordinates */
  isApprox: boolean;
}

/** Leaflet needs a size refresh after the flex panel gets its height (tab switch, sidebar). */
function MapResizeObserver() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => {
      map.invalidateSize({ animate: false });
    });
    ro.observe(el);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => map.invalidateSize({ animate: false }));
    });
    return () => {
      cancelAnimationFrame(id);
      ro.disconnect();
    };
  }, [map]);
  return null;
}

function FitBounds({ points }: { points: ClusterPoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const lats = points.map(p => p.lat);
    const lngs = points.map(p => p.lng);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const latPad = Math.max(0.35, (north - south) * 0.15 || 0.5);
    const lngPad = Math.max(0.35, (east - west) * 0.15 || 0.5);
    map.fitBounds(
      [
        [south - latPad, west - lngPad],
        [north + latPad, east + lngPad],
      ],
      { padding: [36, 36], maxZoom: 12 }
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

export function MapView({ persons, filteredIds, onSelectPerson, language = 'en' }: Props) {
  const t = language === 'he';

  const points = useMemo(() => {
    const locationMap = new Map<string, ClusterPoint>();

    const add = (key: string, lat: number, lng: number, person: Person, isApprox: boolean) => {
      let c = locationMap.get(key);
      if (!c) {
        c = { lat, lng, persons: [], key, isApprox };
        locationMap.set(key, c);
      }
      c.persons.push(person);
    };

    for (const id of filteredIds) {
      const person = persons.get(id);
      if (!person) continue;

      if (person.coordinates) {
        const [lat, lng] = person.coordinates;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
        const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;
        add(key, lat, lng, person, false);
        continue;
      }

      const approx = approximateCoordinatesForBirthPlace(person.birthPlace);
      if (approx) {
        add(`~${approx.label}`, approx.lat, approx.lng, person, true);
      }
    }

    return [...locationMap.values()];
  }, [persons, filteredIds]);

  const totalPeople = useMemo(() => points.reduce((s, p) => s + p.persons.length, 0), [points]);
  const exactMarkers = useMemo(() => points.filter(p => !p.isApprox).length, [points]);
  const approxMarkers = useMemo(() => points.filter(p => p.isApprox).length, [points]);

  return (
    <div className="relative flex-1 min-h-0 w-full flex flex-col overflow-hidden rounded-2xl border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(246,243,236,0.86),rgba(239,233,224,0.96))] shadow-xl">
      <div
        className="absolute top-4 end-4 z-[400] max-w-[min(20rem,calc(100%-2rem))] rounded-xl border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(250,247,242,0.96))] px-5 py-3 shadow-lg backdrop-blur-sm"
        dir={t ? 'rtl' : 'ltr'}
      >
        <h3 className="text-lg font-bold text-[rgb(94,87,78)]">
          {t ? 'מפת מסע המשפחה' : 'Family journey map'}
        </h3>
        <p className="text-sm text-[rgb(116,108,96)]">
          {t ? (
            <>
              <span className="font-semibold text-[rgb(90,118,133)]">{points.length}</span> נקודות על המפה
              {totalPeople > 0 && (
                <>
                  {' '}
                  (<span className="font-semibold text-[rgb(94,87,78)]">{totalPeople}</span> אנשים)
                </>
              )}
            </>
          ) : (
            <>
              <span className="font-semibold text-[rgb(90,118,133)]">{points.length}</span> locations on the map
              {totalPeople > 0 && (
                <>
                  {' '}
                  (<span className="font-semibold text-[rgb(94,87,78)]">{totalPeople}</span> people)
                </>
              )}
            </>
          )}
        </p>
        {(exactMarkers > 0 || approxMarkers > 0) && (
          <p className="mt-1 text-xs leading-snug text-[rgb(141,134,123)]">
            {t
              ? `${exactMarkers} מקור GPS · ${approxMarkers} משוער ממקום לידה`
              : `${exactMarkers} with coordinates · ${approxMarkers} estimated from birthplace`}
          </p>
        )}
      </div>

      {points.length === 0 && (
        <div
          className="absolute inset-0 z-[500] flex items-center justify-center bg-[rgba(246,243,236,0.92)] px-6 text-center"
          dir={t ? 'rtl' : 'ltr'}
        >
          <p className="max-w-md text-sm text-[rgb(116,108,96)]">
            {t
              ? 'אין מיקומים להצגה: אין קואורדינטות או מקום לידה שמזוהה לסינון הנוכחי. נסי להרחיב את הסינון או לבחור אנשים עם מקום לידה מפורט.'
              : 'No locations to show for the current filter: no coordinates or recognizable birth places. Try widening filters or including people with place names in their birth field.'}
          </p>
        </div>
      )}

      <MapContainer
        center={[50.45, 22.0]}
        zoom={4}
        className="flex-1 min-h-[280px] w-full z-[10]"
        style={{ width: '100%', height: '100%', minHeight: 280, background: '#e8e4dc' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapResizeObserver />
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
                  {cluster.isApprox && (
                    <span className="mb-1 block text-[11px] font-medium text-[rgb(133,109,72)]">
                      {t ? 'מיקום משוער לפי מקום לידה' : '~Approximate (from birthplace text)'}
                    </span>
                  )}
                  <strong className="mb-1 block text-[15px] text-[rgb(94,87,78)]">{loc.original_location}</strong>
                  {distinctPlaces.size > 1 && (
                    <span className="mb-2 block text-xs leading-relaxed text-[rgb(126,117,104)]">{loc.resolved_name}</span>
                  )}
                  {loc.peopleCount != null && loc.peopleCount > 0 && (
                    <div className="mb-2 inline-block rounded-md border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(248,245,240,0.96),rgba(240,235,228,0.88))] px-2 py-1 text-xs font-semibold text-[rgb(90,118,133)]">
                      {t
                        ? `${loc.peopleCount} בני משפחה קשורים למקום זה`
                        : `${loc.peopleCount} family members at this place`}
                    </div>
                  )}
                  <div className="mt-1 max-h-48 space-y-0.5 overflow-y-auto border-t border-[rgba(160,147,125,0.12)] pt-2 text-xs">
                    {cluster.persons.slice(0, 20).map(p => (
                      <button
                        key={p.id}
                        type="button"
                        className={`block w-full py-0.5 text-[rgb(90,118,133)] hover:underline ${t ? 'text-right' : 'text-left'}`}
                        onClick={() => onSelectPerson(p.id)}
                      >
                        {p.fullName}
                        {p.birthDate && <span className="text-[rgb(141,134,123)]"> ({p.birthDate})</span>}
                      </button>
                    ))}
                    {cluster.persons.length > 20 && (
                      <div className="pt-1 text-[rgb(141,134,123)]">
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
