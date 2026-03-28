import { useState, useMemo, useCallback, useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ReactFlowProvider } from '@xyflow/react';
import { useFamilyData } from './hooks/useFamilyData';
import { useLang } from './app/[lang]/layout';
import { PersonDetailPanel } from './components/PersonDetailPanel';
import { SearchBar } from './components/SearchBar';
import { FilterPanel, applyFilters, DEFAULT_FILTERS, type Filters } from './components/FilterPanel';
import { StatsPanel } from './components/StatsPanel';
import { TreeView } from './components/TreeView';
import { Breadcrumb } from './components/Breadcrumb';
import { MapView } from './components/MapView';
import { TimelineView } from './components/TimelineView';
import { StatisticsView } from './components/StatisticsView';
import { WelcomeModal } from './components/WelcomeModal';
import { getSubtreeIds } from './utils/subtree';
import {
  downloadLastWebVitalsSnapshot,
  getLastWebVitalsSnapshot,
} from './performance/webVitals';

type ViewMode = 'tree' | 'map' | 'timeline' | 'stats';

const VIEW_TABS: Record<'en' | 'he', { id: ViewMode; label: string; icon: string }[]> = {
  en: [
    { id: 'tree', label: 'Tree', icon: '🌳' },
    { id: 'map', label: 'Map', icon: '🗺️' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'stats', label: 'Statistics', icon: '📊' },
  ],
  he: [
    { id: 'tree', label: 'עץ', icon: '🌳' },
    { id: 'map', label: 'מפה', icon: '🗺️' },
    { id: 'timeline', label: 'ציר זמן', icon: '📅' },
    { id: 'stats', label: 'סטטיסטיקות', icon: '📊' },
  ],
};

const VALID_VIEWS: ViewMode[] = ['tree', 'map', 'timeline', 'stats'];
const INCLUDE_SPOUSE_BRANCHES_STORAGE_KEY = 'includeSpouseBranches';

function buildBloodAdjacency(
  personIds: Iterable<string>,
  families: Map<string, { spouses: string[]; children: string[] }>
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();
  for (const id of personIds) adjacency.set(id, new Set<string>());

  for (const family of families.values()) {
    for (const parentId of family.spouses) {
      if (!adjacency.has(parentId)) continue;
      for (const childId of family.children) {
        if (!adjacency.has(childId)) continue;
        adjacency.get(parentId)!.add(childId);
        adjacency.get(childId)!.add(parentId);
      }
    }

    const visibleChildren = family.children.filter(id => adjacency.has(id));
    for (let i = 0; i < visibleChildren.length; i += 1) {
      for (let j = i + 1; j < visibleChildren.length; j += 1) {
        const a = visibleChildren[i];
        const b = visibleChildren[j];
        adjacency.get(a)!.add(b);
        adjacency.get(b)!.add(a);
      }
    }
  }

  return adjacency;
}

export default function FamilyExplorer() {
  const { lang: langParam } = useParams<{ lang: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { persons, families, rootPersonId, personList, searchIndex, loading, error, reload } = useFamilyData();
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [subtreeRootId, setSubtreeRootId] = useState<string | null>(null);
  const [subtreeDepth, setSubtreeDepth] = useState(4);
  const [includeSpouseBranches, setIncludeSpouseBranches] = useState(true);
  const { lang: language, setLang: setLanguage } = useLang();
  const [hasVitalsSnapshot, setHasVitalsSnapshot] = useState(false);
  const viewTabs = VIEW_TABS[language];
  const basePath = `/${langParam || language}`;

  // View mode via ?view= query param (defaults to 'tree')
  const rawViewParam = searchParams.get('view');
  const viewMode: ViewMode = (rawViewParam && VALID_VIEWS.includes(rawViewParam as ViewMode))
    ? (rawViewParam as ViewMode)
    : 'tree';
  const setViewMode = useCallback((v: string) => {
    setSearchParams(prev => { prev.set('view', v); return prev; }, { replace: true });
  }, [setSearchParams]);

  const connectedToYaelIds = useMemo(() => {
    const adjacency = buildBloodAdjacency(persons.keys(), families);

    const connected = new Set<string>();
    const queue: string[] = [rootPersonId];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (connected.has(current)) continue;
      connected.add(current);
      const neighbors = adjacency.get(current);
      if (!neighbors) continue;
      for (const next of neighbors) {
        if (!connected.has(next)) queue.push(next);
      }
    }
    return connected;
  }, [persons, families, rootPersonId]);

  const filteredIds = useMemo(
    () => applyFilters(personList, filters, connectedToYaelIds),
    [personList, filters, connectedToYaelIds]
  );

  const displayIds = useMemo(() => {
    if (!subtreeRootId) return filteredIds;
    const subtreeIds = getSubtreeIds(
      subtreeRootId,
      persons,
      families,
      subtreeDepth,
      subtreeDepth,
      includeSpouseBranches
    );
    const intersection = new Set<string>();
    for (const id of subtreeIds) {
      if (filteredIds.has(id)) intersection.add(id);
    }
    return intersection;
  }, [filteredIds, subtreeRootId, persons, families, subtreeDepth, includeSpouseBranches]);

  const selectedPerson = selectedPersonId ? persons.get(selectedPersonId) : null;
  /** Holocaust victims within current filter scope (not full file). */
  const holocaustVictimCountInScope = useMemo(() => {
    let count = 0;
    for (const id of filteredIds) {
      if (persons.get(id)?.holocaustVictim) count += 1;
    }
    return count;
  }, [filteredIds, persons]);
  const filteredHolocaustVictimCount = useMemo(() => {
    let count = 0;
    for (const id of displayIds) {
      const person = persons.get(id);
      if (person?.holocaustVictim) count += 1;
    }
    return count;
  }, [displayIds, persons]);

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

  const handleShowSubtree = useCallback(
    (id: string) => {
      setSubtreeRootId(id);
      navigate(`${basePath}/tree`);
    },
    [navigate]
  );

  const handleExportVitals = useCallback(() => {
    const ok = downloadLastWebVitalsSnapshot();
    if (!ok) {
      window.alert(language === 'he'
        ? 'עדיין אין snapshot של Web Vitals לייצוא. טעני מחדש ובדקי Console.'
        : 'No Web Vitals snapshot available yet. Reload and check the console.');
    }
  }, [language]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = window.localStorage.getItem(INCLUDE_SPOUSE_BRANCHES_STORAGE_KEY);
    if (raw === 'true' || raw === 'false') {
      setIncludeSpouseBranches(raw === 'true');
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      INCLUDE_SPOUSE_BRANCHES_STORAGE_KEY,
      String(includeSpouseBranches)
    );
  }, [includeSpouseBranches]);

  useEffect(() => {
    setHasVitalsSnapshot(getLastWebVitalsSnapshot() !== null);
  }, [loading, error]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4">🌳</div>
          <div className="text-lg text-gray-600">{language === 'he' ? 'טוען את אילן היוחסין...' : 'Loading family tree...'}</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-red-600 max-w-md px-4">
          <div className="text-lg font-bold">{language === 'he' ? 'שגיאה בטעינת הנתונים' : 'Data loading error'}</div>
          <div className="text-sm mt-2 break-words">{error}</div>
          <button
            onClick={reload}
            className="mt-4 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {language === 'he' ? 'נסה/י שוב' : 'Retry'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <WelcomeModal language={language} />
      <header className="bg-white border-b border-gray-200 px-4 py-2 z-10 flex-shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <div
            className="flex gap-1 bg-gray-100 rounded-lg p-0.5"
            role="tablist"
            aria-label={language === 'he' ? 'בחירת תצוגה' : 'View mode'}
          >
            {viewTabs.map(tab => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={viewMode === tab.id}
                aria-controls="explorer-main-panel"
                id={`explorer-tab-${tab.id}`}
                tabIndex={viewMode === tab.id ? 0 : -1}
                onClick={() => setViewMode(tab.id)}
                onKeyDown={e => {
                  if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
                  e.preventDefault();
                  const i = viewTabs.findIndex(t => t.id === tab.id);
                  const delta =
                    language === 'he'
                      ? e.key === 'ArrowLeft'
                        ? 1
                        : -1
                      : e.key === 'ArrowRight'
                        ? 1
                        : -1;
                  const next = (i + delta + viewTabs.length) % viewTabs.length;
                  const nextId = viewTabs[next].id;
                  setViewMode(nextId);
                  queueMicrotask(() => {
                    document.getElementById(`explorer-tab-${nextId}`)?.focus({ preventScroll: true });
                  });
                }}
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

          <SearchBar
            searchIndex={searchIndex}
            onSelect={handleSelectPerson}
            language={language}
            allowedPersonIds={filteredIds}
          />
          <div className="flex-1" />
          <button
            type="button"
            onClick={handleExportVitals}
            className={`text-xs px-2.5 py-1.5 rounded-md border transition-colors whitespace-nowrap ${
              hasVitalsSnapshot
                ? 'border-gray-300 text-gray-600 hover:bg-gray-100'
                : 'border-gray-200 text-gray-400 hover:bg-gray-50'
            }`}
            title={language === 'he' ? 'ייצוא snapshot אחרון של Web Vitals לקובץ JSON' : 'Export latest Web Vitals snapshot as JSON'}
          >
            {language === 'he' ? 'ייצוא Web Vitals' : 'Export Web Vitals'}
          </button>
          <div className="text-xs text-gray-400 whitespace-nowrap" title={language === 'he' ? 'בטווח הסינון והתצוגה הנוכחיים' : 'Current filter and view scope'}>
            {displayIds.size !== filteredIds.size
              ? `${displayIds.size.toLocaleString()} / ${filteredIds.size.toLocaleString()}`
              : displayIds.size.toLocaleString()}{' '}
            {language === 'he' ? 'אנשים' : 'people'}
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 p-3 space-y-3 overflow-y-auto border-l border-gray-200 bg-gray-50 flex-shrink-0">
          {subtreeRootId && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm" dir={language === 'he' ? 'rtl' : 'ltr'}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-amber-700">{language === 'he' ? 'תצוגת עץ משנה' : 'Subtree view'}</span>
                <button
                  type="button"
                  className="text-xs text-amber-600 hover:text-amber-800"
                  onClick={() => setSubtreeRootId(null)}
                >
                  {language === 'he' ? '✕ ביטול' : '✕ Clear'}
                </button>
              </div>
              <div className="text-amber-600 text-xs mb-2">
                {language === 'he' ? 'מרוכז ב:' : 'Focused on:'} {persons.get(subtreeRootId)?.fullName}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-amber-600">{language === 'he' ? 'עומק:' : 'Depth:'}</label>
                <input
                  type="range"
                  min={1}
                  max={10}
                  value={subtreeDepth}
                  onChange={e => setSubtreeDepth(parseInt(e.target.value, 10))}
                  className="flex-1"
                />
                <span className="text-xs font-medium text-amber-700 w-4">{subtreeDepth}</span>
              </div>
              <label className="mt-2 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeSpouseBranches}
                  onChange={e => setIncludeSpouseBranches(e.target.checked)}
                  className="rounded"
                />
                <span className="text-xs text-amber-700">{language === 'he' ? 'כלול ענפי בני זוג' : 'Include spouse branches'}</span>
              </label>
            </div>
          )}

          <FilterPanel filters={filters} onChange={setFilters} personList={personList} language={language} />
          <StatsPanel
            fullFilePersonCount={personList.length}
            afterFiltersCount={filteredIds.size}
            shownInViewCount={displayIds.size}
            familyCount={families.size}
            holocaustVictimCount={holocaustVictimCountInScope}
            filteredHolocaustVictimCount={filteredHolocaustVictimCount}
            language={language}
          />
        </div>

        <div id="explorer-main-panel" className="flex-1 flex flex-col overflow-hidden" role="tabpanel" aria-labelledby={`explorer-tab-${viewMode}`}>
          {/* Breadcrumb — only visible when a person is selected in tree view */}
          {viewMode === 'tree' && (
            <Breadcrumb
              selectedPersonId={selectedPersonId}
              persons={persons}
              families={families}
              onSelectPerson={handleSelectPerson}
              language={language}
            />
          )}

          {viewMode === 'tree' && (
            <ReactFlowProvider>
              <TreeView
                persons={persons}
                families={families}
                filteredIds={displayIds}
                rootPersonId={subtreeRootId || rootPersonId}
                selectedPersonId={selectedPersonId}
                onSelectPerson={handleSelectPerson}
                onFocusSubtree={handleShowSubtree}
                language={language}
              />
            </ReactFlowProvider>
          )}
          {viewMode === 'map' && (
            <MapView
              persons={persons}
              filteredIds={displayIds}
              onSelectPerson={handleSelectPerson}
              language={language}
            />
          )}
          {viewMode === 'timeline' && (
            <TimelineView
              persons={persons}
              filteredIds={displayIds}
              onSelectPerson={handleSelectPerson}
              language={language}
            />
          )}
          {viewMode === 'stats' && (
            <StatisticsView
              personList={personList}
              filteredIds={displayIds}
              connectedToYaelIds={connectedToYaelIds}
              onSelectPerson={handleSelectPerson}
              language={language}
            />
          )}
        </div>

        {selectedPerson && (
          <PersonDetailPanel
            person={selectedPerson}
            persons={persons}
            families={families}
            rootPersonId={rootPersonId}
            activeFilters={filters}
            isConnectedToYael={connectedToYaelIds.has(selectedPerson.id)}
            onNavigate={handleNavigate}
            onClose={() => setSelectedPersonId(null)}
            onShowSubtree={handleShowSubtree}
            language={language}
          />
        )}
      </div>
    </div>
  );
}
