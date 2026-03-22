interface Props {
  totalPersons: number;
  filteredCount: number;
  familyCount: number;
}

export function StatsPanel({ totalPersons, filteredCount, familyCount }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm space-y-1" dir="rtl">
      <div className="font-bold text-gray-700 mb-2">סטטיסטיקות</div>
      <div className="flex justify-between">
        <span className="text-gray-500">סך הכל אנשים:</span>
        <span className="font-medium">{totalPersons.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">מוצגים:</span>
        <span className="font-medium text-blue-600">{filteredCount.toLocaleString()}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-500">משפחות:</span>
        <span className="font-medium">{familyCount.toLocaleString()}</span>
      </div>
    </div>
  );
}
