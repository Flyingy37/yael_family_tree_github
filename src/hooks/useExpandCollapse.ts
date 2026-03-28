import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Person, Family } from '../types';
import {
  getNeighborPersonIds,
  addSpousesForVisibleSet,
  computeInitialLazyVisibleIds,
} from '../utils/treeHelpers';

export interface UseExpandCollapseOptions {
  /** Parent generations above root (default 2, i.e. ~2–3 gen window with descendants) */
  ancestorGenerations?: number;
  /** Child generations below root (default 2) */
  descendantGenerations?: number;
  /** Above this many people in `filteredIds`, lazy mode is on (default 400) */
  lazyThreshold?: number;
}

/**
 * Lazy visibility for large trees: start with a small neighborhood around `rootPersonId`,
 * then expand one graph hop (+ spouse closure) per `expandBranch` call.
 *
 * TreeView pairs this with a **full** Dagre layout over `filteredIds` and uses React Flow
 * `node.hidden` / `edge.hidden` so `expandBranch` reveals people without re-running the layout.
 */
export function useExpandCollapse(
  rootPersonId: string,
  filteredIds: Set<string>,
  persons: Map<string, Person>,
  families: Map<string, Family>,
  options?: UseExpandCollapseOptions
) {
  const ancestorGenerations = options?.ancestorGenerations ?? 2;
  const descendantGenerations = options?.descendantGenerations ?? 2;
  const lazyThreshold = options?.lazyThreshold ?? 400;

  const isLazyMode = filteredIds.size > lazyThreshold;

  const [lazyVisibleIds, setLazyVisibleIds] = useState<Set<string>>(() => {
    if (filteredIds.size === 0) return new Set();
    if (filteredIds.size > lazyThreshold) {
      return computeInitialLazyVisibleIds(
        rootPersonId,
        persons,
        families,
        filteredIds,
        ancestorGenerations,
        descendantGenerations
      );
    }
    return new Set(filteredIds);
  });

  /** Bumps after each expand so TreeView can run fitView */
  const [expandTick, setExpandTick] = useState(0);

  useEffect(() => {
    if (filteredIds.size === 0) {
      setLazyVisibleIds(new Set());
      setExpandTick(0);
      return;
    }
    if (filteredIds.size > lazyThreshold) {
      setLazyVisibleIds(
        computeInitialLazyVisibleIds(
          rootPersonId,
          persons,
          families,
          filteredIds,
          ancestorGenerations,
          descendantGenerations
        )
      );
    } else {
      setLazyVisibleIds(new Set(filteredIds));
    }
    setExpandTick(0);
  }, [
    rootPersonId,
    filteredIds,
    persons,
    families,
    lazyThreshold,
    ancestorGenerations,
    descendantGenerations,
  ]);

  const graphVisibleIds = useMemo(() => {
    const s = new Set<string>();
    for (const id of lazyVisibleIds) {
      if (filteredIds.has(id)) s.add(id);
    }
    return s;
  }, [lazyVisibleIds, filteredIds]);

  const expandBranch = useCallback(
    (personId: string) => {
      if (!isLazyMode) return;
      setLazyVisibleIds(prev => {
        const next = new Set(prev);
        for (const nid of getNeighborPersonIds(personId, persons, families)) {
          if (filteredIds.has(nid)) next.add(nid);
        }
        addSpousesForVisibleSet(next, persons, families, filteredIds);
        return next;
      });
      setExpandTick(t => t + 1);
    },
    [isLazyMode, persons, families, filteredIds]
  );

  const hiddenNeighborCountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (!isLazyMode) return map;
    for (const id of graphVisibleIds) {
      let n = 0;
      for (const nid of getNeighborPersonIds(id, persons, families)) {
        if (filteredIds.has(nid) && !graphVisibleIds.has(nid)) n += 1;
      }
      if (n > 0) map.set(id, n);
    }
    return map;
  }, [graphVisibleIds, filteredIds, persons, families, isLazyMode]);

  const hasHiddenRelatives = useCallback(
    (id: string) => (hiddenNeighborCountMap.get(id) ?? 0) > 0,
    [hiddenNeighborCountMap]
  );

  const hiddenRelativeCount = useCallback(
    (id: string) => hiddenNeighborCountMap.get(id) ?? 0,
    [hiddenNeighborCountMap]
  );

  return {
    graphVisibleIds,
    expandBranch,
    expandTick,
    isLazyMode,
    hasHiddenRelatives,
    hiddenRelativeCount,
  };
}
