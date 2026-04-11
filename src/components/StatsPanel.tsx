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
    <div
      className="rounded-lg border border-[rgba(160,147,125,0.16)] bg-[linear-gradient(180deg,rgba(255,255,255,0.7),rgba(250,247,242,0.92))] p-3 text-sm space-y-1 shadow-sm"
      dir={t ? 'rtl' : 'ltr'}
    >
      <div className="mb-2 font-bold text-[rgb(94,87,78)]">{t ? 'סטטיסטיקות' : 'Statistics'}</div>
      <div className="flex justify-between items-baseline">
        <span className="font-medium text-[rgb(116,108,96)]">{t ? 'אחרי סינון:' : 'After filters:'}</span>
        <span className="text-base font-semibold text-[rgb(90,118,133)]">{afterFiltersCount.toLocaleString()}</span>
      </div>
      {subtreeNarrowed && (
        <div className="flex justify-between">
          <span className="text-[rgb(126,117,104)]">{t ? 'בתצוגה (תת־עץ):' : 'In view (subtree):'}</span>
          <span className="font-medium text-[rgb(90,118,133)]">{shownInViewCount.toLocaleString()}</span>
        </div>
      )}
      {filtersExcludeSome && (
        <div className="flex justify-between border-t border-[rgba(160,147,125,0.12)] pt-0.5 text-xs text-[rgb(141,134,123)]">
          <span>{t ? 'לא בטווח הסינון הנוכחי:' : 'Outside current filters:'}</span>
          <span>{excludedByFilters.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-[rgb(126,117,104)]">{t ? 'משפחות:' : 'Families:'}</span>
        <span className="font-medium">{familyCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-[rgb(126,117,104)]">{t ? 'קורבנות שואה:' : 'Holocaust victims:'}</span>
        <span className="font-medium text-[rgb(145,95,90)]">
          {filteredHolocaustVictimCount.toLocaleString()} / {holocaustVictimCount.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
