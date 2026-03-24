interface Props {
  totalPersons: number;
  filteredCount: number;
  familyCount: number;
  holocaustVictimCount: number;
  filteredHolocaustVictimCount: number;
  language?: 'en' | 'he';
}

export function StatsPanel({
  totalPersons,
  filteredCount,
  familyCount,
  holocaustVictimCount,
  filteredHolocaustVictimCount,
  language = 'en',
}: Props) {
  const t = language === 'he';
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-1" dir={t ? 'rtl' : 'ltr'}>
      <div className="font-bold text-gray-700 mb-2">{t ? 'סטטיסטיקות' : 'Statistics'}</div>
      <div className="flex justify-between">
        <span className="text-gray-500">{t ? 'סך הכל אנשים:' : 'Total people:'}</span>
        <span className="font-medium">{totalPersons.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">{t ? 'מוצגים:' : 'Shown:'}</span>
        <span className="font-medium text-blue-600">{filteredCount.toLocaleString()}</span>
      </div>
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
