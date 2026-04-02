import { describe, it, expect, beforeEach, vi } from 'vitest';
import { fetchFamilyGraph, invalidateCache } from './dataService';

describe('dataService', () => {
  beforeEach(() => {
    invalidateCache();
    vi.restoreAllMocks();
  });

  describe('fetchFamilyGraph', () => {
    it('fetches and returns family graph data', async () => {
      const mockGraph = {
        persons: [{ id: '@I1@', fullName: 'Alice' }],
        families: [{ id: '@F1@', spouses: ['@I1@'], children: [] }],
        rootPersonId: '@I1@',
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGraph),
      }));

      const result = await fetchFamilyGraph();
      expect(result).toEqual(mockGraph);
      expect(fetch).toHaveBeenCalledWith('/family-graph.json', { signal: undefined });
    });

    it('caches result after first fetch', async () => {
      const mockGraph = {
        persons: [],
        families: [],
        rootPersonId: '@I1@',
      };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGraph),
      }));

      const first = await fetchFamilyGraph();
      const second = await fetchFamilyGraph();

      expect(first).toBe(second);
      expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('throws on non-OK HTTP response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      }));

      await expect(fetchFamilyGraph()).rejects.toThrow('Failed to load family graph: HTTP 404');
    });

    it('throws on HTTP 500 error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }));

      await expect(fetchFamilyGraph()).rejects.toThrow('Failed to load family graph: HTTP 500');
    });

    it('passes abort signal to fetch', async () => {
      const controller = new AbortController();
      const mockGraph = { persons: [], families: [], rootPersonId: '' };

      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockGraph),
      }));

      await fetchFamilyGraph(controller.signal);
      expect(fetch).toHaveBeenCalledWith('/family-graph.json', { signal: controller.signal });
    });

    it('propagates network errors', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network error')));

      await expect(fetchFamilyGraph()).rejects.toThrow('Network error');
    });
  });

  describe('invalidateCache', () => {
    it('clears cache so next fetch goes to network', async () => {
      const graph1 = { persons: [], families: [], rootPersonId: 'A' };
      const graph2 = { persons: [], families: [], rootPersonId: 'B' };

      let callCount = 0;
      vi.stubGlobal('fetch', vi.fn().mockImplementation(() => {
        callCount++;
        const data = callCount === 1 ? graph1 : graph2;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(data),
        });
      }));

      const first = await fetchFamilyGraph();
      expect(first.rootPersonId).toBe('A');

      invalidateCache();

      const second = await fetchFamilyGraph();
      expect(second.rootPersonId).toBe('B');
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });
});
