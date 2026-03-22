import { useState, useMemo, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useFamilyData } from './hooks/useFamilyData';
import { TreeView } from './components/TreeView';
import { MapView } from './components/MapView';
import { TimelineView } from './components/TimelineView';
import { PersonDetailPanel } from './components/PersonDetailPanel';
import { SearchBar } from './components/SearchBar';
import { FilterPanel, applyFilters, DEFAULT_FILTERS, type Filters } from './components/FilterPanel';
import { StatsPanel } from './components/StatsPanel';
import { getSubtreeIds } from './utils/subtree';

type ViewMode = 'tree' | 'map' | 'timeline';

const VIEW_TABS: { id: ViewMode; label: string; icon: string }[] = [
  { id: 'tree', label: 'עץ', icon: '🌳' },
  { id: 'map', label: 'מפה', icon: '🗺️' },
  { id: 'timeline', label: 'ציר זמן', icon: '📅' },
];

export default function App() {
  const { persons, families, rootPersonId, personList, searchIndex, loading, error } = useFamilyData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [subtreeRootId, setSubtreeRootId] = useState<string | null>(null);
  const [subtreeDepth, setSubtreeDepth] = useState(4);

  const filteredIds = useMemo(
    () => applyFilters(personList, filters),
    [personList, filters]
  );

  // Apply subtree filter on top of regular filters
  const displayIds = useMemo(() => {
    if (!subtreeRootId) return filteredIds;
    const subtreeIds = getSubtreeIds(subtreeRootId, persons, families, subtreeDepth, subtreeDepth);
    const intersection = new Set<string>();
    for (const id of subtreeIds) {
      if (filteredIds.has(id)) intersection.add(id);
    }
    return intersection;
  }, [filteredIds, subtreeRootId, persons, families, subtreeDepth]);

  const selectedPerson = selectedPersonId ? persons.get(selectedPersonId) : null;

  const handleSelectPerson = useCallback((id: string) => {
    setSelectedPersonId(id);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setSelectedPersonId(id);
    const person = persons.get(id);
    if (person?.generation !== null && person?.generation !== undefined) {
      if (person.generation < filters.generationMin || person.generation > filters.generationMax) {
        setFilters(f => ({
          ...f,
          generationMin: Math.min(f.generationMin, person.generation!),
          generationMax: Math.max(f.generationMax, person.generation!),
        }));
      }
    }
  }, [persons, filters]);

  const handleShowSubtree = useCallback((id: string) => {
    setSubtreeRootId(id);
    setViewMode('tree');
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="text-4xl mb-4">🌳</div>
          <div className="text-lg text-gray-600">טוען את אילן היוחסין...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center text-red-600">
          <div className="text-lg font-bold">שגיאה בטעינת הנתונים</div>
          <div className="text-sm mt-2">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm z-10">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
            🌳 אילן יוחסין
          </h1>

          {/* View tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
            {VIEW_TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setViewMode(tab.id)}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors whitespace-nowrap ${
                  viewMode === tab.id
                    ? 'bg-white shadow-sm font-medium text-gray-800'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <SearchBar searchIndex={searchIndex} onSelect={handleSelectPerson} />
          <div className="flex-1" />
          <div className="text-xs text-gray-400 whitespace-nowrap">
            {displayIds.size.toLocaleString()} / {personList.length.toLocaleString()} אנשים
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - filters */}
        <div className="w-64 p-3 space-y-3 overflow-y-auto border-l border-gray-200 bg-gray-50 flex-shrink-0">
          {/* Subtree control */}
          {subtreeRootId && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm" dir="rtl">
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-700">תצוגת עץ משנה</span>
                <button
                  className="text-xs text-amber-600 hover:text-amber-800"
                  onClick={() => setSubtreeRootId(null)}
                >
                  ✕ ביטול
                </button>
              </div>
              <div className="text-amber-600 text-xs mb-2">
                מרוכז ב: {persons.get(subtreeRootId)?.fullName}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-amber-600">עומק:</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={subtreeDepth}
                  onChange={e => setSubtreeDepth(parseInt(e.target.value))}
                  className="flex-1"
                />
                <span className="text-xs font-medium text-amber-700 w-4">{subtreeDepth}</span>
              </div>
            </div>
          )}

          <FilterPanel filters={filters} onChange={setFilters} personList={personList} />
          <StatsPanel
            totalPersons={personList.length}
            filteredCount={displayIds.size}
            familyCount={families.size}
          />
        </div>

        {/* Main view */}
        <div className="flex-1">
          {viewMode === 'tree' && (
            <ReactFlowProvider>
              <TreeView
                persons={persons}
                families={families}
                filteredIds={displayIds}
                rootPersonId={subtreeRootId || rootPersonId}
                selectedPersonId={selectedPersonId}
                onSelectPerson={handleSelectPerson}
              />
            </ReactFlowProvider>
          )}
          {viewMode === 'map' && (
            <MapView
              persons={persons}
              filteredIds={displayIds}
              onSelectPerson={handleSelectPerson}
            />
          )}
          {viewMode === 'timeline' && (
            <TimelineView
              persons={persons}
              filteredIds={displayIds}
              onSelectPerson={handleSelectPerson}
            />
          )}
        </div>

        {/* Right sidebar - person details */}
        {selectedPerson && (
          <PersonDetailPanel
            person={selectedPerson}
            persons={persons}
            families={families}
            onNavigate={handleNavigate}
            onClose={() => setSelectedPersonId(null)}
            onShowSubtree={handleShowSubtree}
          />
        )}
      </div>
    </div>
  );
}
