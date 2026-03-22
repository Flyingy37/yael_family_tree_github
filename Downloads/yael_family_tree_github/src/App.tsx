import { useState, useMemo, useCallback } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { useFamilyData } from './hooks/useFamilyData';
import { TreeView } from './components/TreeView';
import { PersonDetailPanel } from './components/PersonDetailPanel';
import { SearchBar } from './components/SearchBar';
import { FilterPanel, applyFilters, DEFAULT_FILTERS, type Filters } from './components/FilterPanel';
import { StatsPanel } from './components/StatsPanel';

export default function App() {
  const { persons, families, rootPersonId, personList, searchIndex, loading, error } = useFamilyData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filteredIds = useMemo(
    () => applyFilters(personList, filters),
    [personList, filters]
  );

  const selectedPerson = selectedPersonId ? persons.get(selectedPersonId) : null;

  const handleSelectPerson = useCallback((id: string) => {
    setSelectedPersonId(id);
  }, []);

  const handleNavigate = useCallback((id: string) => {
    setSelectedPersonId(id);
    // Expand filters if person is outside current range
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
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 shadow-sm z-10">
        <h1 className="text-lg font-bold text-gray-800 whitespace-nowrap">
          🌳 אילן יוחסין — משפחת לבנת זיידמן
        </h1>
        <SearchBar searchIndex={searchIndex} onSelect={handleSelectPerson} />
        <div className="flex-1" />
        <div className="text-xs text-gray-400">
          {filteredIds.size.toLocaleString()} / {personList.length.toLocaleString()} אנשים
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - filters */}
        <div className="w-64 p-3 space-y-3 overflow-y-auto border-l border-gray-200 bg-gray-50">
          <FilterPanel filters={filters} onChange={setFilters} personList={personList} />
          <StatsPanel
            totalPersons={personList.length}
            filteredCount={filteredIds.size}
            familyCount={families.size}
          />
        </div>

        {/* Tree */}
        <div className="flex-1">
          <ReactFlowProvider>
            <TreeView
              persons={persons}
              families={families}
              filteredIds={filteredIds}
              rootPersonId={rootPersonId}
              selectedPersonId={selectedPersonId}
              onSelectPerson={handleSelectPerson}
            />
          </ReactFlowProvider>
        </div>

        {/* Right sidebar - person details */}
        {selectedPerson && (
          <PersonDetailPanel
            person={selectedPerson}
            persons={persons}
            families={families}
            onNavigate={handleNavigate}
            onClose={() => setSelectedPersonId(null)}
          />
        )}
      </div>
    </div>
  );
}
