interface Props {
  /** Everyone in the loaded graph file (before filters). */
  fullFilePersonCount: number;
  /** People matching the current filters (e.g. connected to Yael, generation, etc.). */
  afterFiltersCount: number;
  /** People actually shown in tree/map/timeline (may be smaller in subtree mode). */
  shownInViewCount: number;
  familyCount: number;
  holocaustVictimCount: number;
  filteredHolocaustVictimCount: number;
  language?: 'en' | 'he';
}

export function StatsPanel({
  fullFilePersonCount,
  afterFiltersCount,
  shownInViewCount,
  familyCount,
  holocaustVictimCount,
  filteredHolocaustVictimCount,
  language = 'en',
}: Props) {
  const t = language === 'he';
  const subtreeNarrowed = shownInViewCount !== afterFiltersCount;
  const filtersExcludeSome = afterFiltersCount < fullFilePersonCount;
  const excludedByFilters = fullFilePersonCount - afterFiltersCount;
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-1" dir={t ? 'rtl' : 'ltr'}>
      <div className="font-bold text-gray-700 mb-2">{t ? 'סטטיסטיקות' : 'Statistics'}</div>
      <div className="flex justify-between items-baseline">
        <span className="text-gray-700 font-medium">{t ? 'אחרי סינון:' : 'After filters:'}</span>
        <span className="font-semibold text-blue-600 text-base">{afterFiltersCount.toLocaleString()}</span>
      </div>
      {subtreeNarrowed && (
        <div className="flex justify-between">
          <span className="text-gray-500">{t ? 'בתצוגה (תת־עץ):' : 'In view (subtree):'}</span>
          <span className="font-medium text-blue-600">{shownInViewCount.toLocaleString()}</span>
        </div>
      )}
      {filtersExcludeSome && (
        <div className="flex justify-between text-xs text-gray-400 pt-0.5 border-t border-gray-100">
          <span>{t ? 'לא בטווח הסינון הנוכחי:' : 'Outside current filters:'}</span>
          <span>{excludedByFilters.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-gray-500">{t ? 'משפחות:' : 'Families:'}</span>
        <span className="font-medium">{familyCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">{t ? 'קורבנות שואה:' : 'Holocaust victims:'}</span>
        <span className="font-medium text-rose-700">
          {filteredHolocaustVictimCount.toLocaleString()} / {holocaustVictimCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
