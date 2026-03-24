import { onCLS, onFCP, onINP, onLCP, onTTFB, type Metric } from 'web-vitals';

type VitalName = 'CLS' | 'FCP' | 'INP' | 'LCP' | 'TTFB';

interface VitalsSnapshot {
  createdAt: string;
  url: string;
  metrics: Partial<Record<VitalName, number>>;
}

const SNAPSHOT_KEY = 'yael-family-tree:web-vitals:last';

const EXPECTED_VITALS: VitalName[] = ['CLS', 'FCP', 'INP', 'LCP', 'TTFB'];

function roundMetricValue(name: VitalName, value: number): number {
  // CLS is unitless and usually very small, so we keep 3 decimals.
  if (name === 'CLS') return Number(value.toFixed(3));
  return Number(value.toFixed(0));
}

function readLastSnapshot(): VitalsSnapshot | null {
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VitalsSnapshot;
  } catch {
    return null;
  }
}

function writeSnapshot(snapshot: VitalsSnapshot): void {
  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot));
  } catch {
    // Ignore quota/privacy mode errors.
  }
}

export function getLastWebVitalsSnapshot(): VitalsSnapshot | null {
  return readLastSnapshot();
}

export function downloadLastWebVitalsSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const snapshot = readLastSnapshot();
  if (!snapshot) return false;

  const payload = JSON.stringify(snapshot, null, 2);
  const blob = new Blob([payload], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date(snapshot.createdAt).toISOString().replace(/[:.]/g, '-');
  const filename = `yael-family-tree-web-vitals-${timestamp}.json`;

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return true;
}

function formatDelta(current: number, previous: number | undefined): string {
  if (previous === undefined) return '-';
  const delta = current - previous;
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta.toFixed(2)}`;
}

function asVitalName(metricName: string): VitalName | null {
  if (EXPECTED_VITALS.includes(metricName as VitalName)) return metricName as VitalName;
  return null;
}

function printSummary(
  current: Partial<Record<VitalName, number>>,
  ratings: Partial<Record<VitalName, Metric['rating']>>,
  previous: VitalsSnapshot | null,
  store: boolean
): void {
  const rows = EXPECTED_VITALS.filter(name => current[name] !== undefined).map(name => {
    const value = current[name]!;
    const prev = previous?.metrics?.[name];
    return {
      metric: name,
      value,
      rating: ratings[name] ?? '-',
      delta_from_previous: formatDelta(value, prev),
      previous: prev ?? '-',
    };
  });

  if (rows.length > 0) {
    console.groupCollapsed('[Web Vitals] Current run');
    console.table(rows);
    if (previous) {
      console.info(
        `[Web Vitals] Compared with snapshot from ${new Date(previous.createdAt).toLocaleString()}`
      );
    } else {
      console.info('[Web Vitals] No previous snapshot found for comparison.');
    }
    if (store) {
      console.info(
        `[Web Vitals] Snapshot saved in localStorage key "${SNAPSHOT_KEY}".`
      );
    }
    console.groupEnd();
  }
}

export function initWebVitalsTracking(): void {
  if (typeof window === 'undefined') return;

  const currentValues: Partial<Record<VitalName, number>> = {};
  const currentRatings: Partial<Record<VitalName, Metric['rating']>> = {};
  const previous = readLastSnapshot();
  let didReport = false;

  const shouldLog =
    import.meta.env.DEV ||
    window.location.search.includes('vitals=1') ||
    localStorage.getItem('yael-family-tree:web-vitals:always-log') === '1';

  const report = (metric: Metric): void => {
    const name = asVitalName(metric.name);
    if (!name) return;
    currentValues[name] = roundMetricValue(name, metric.value);
    currentRatings[name] = metric.rating;

    if (shouldLog) {
      const unit = name === 'CLS' ? '' : 'ms';
      console.debug(
        `[Web Vitals] ${name}: ${currentValues[name]}${unit} (${metric.rating})`
      );
    }

    const collectedAll = EXPECTED_VITALS.every(v => currentValues[v] !== undefined);
    if (collectedAll && !didReport) {
      didReport = true;
      const snapshot: VitalsSnapshot = {
        createdAt: new Date().toISOString(),
        url: window.location.pathname,
        metrics: currentValues,
      };
      writeSnapshot(snapshot);
      if (shouldLog) printSummary(currentValues, currentRatings, previous, true);
    }
  };

  onCLS(report);
  onFCP(report);
  onINP(report);
  onLCP(report);
  onTTFB(report);

  // Fallback: emit partial summary even if one metric was not reported.
  window.setTimeout(() => {
    if (didReport || !shouldLog) return;
    if (Object.keys(currentValues).length === 0) return;
    const snapshot: VitalsSnapshot = {
      createdAt: new Date().toISOString(),
      url: window.location.pathname,
      metrics: currentValues,
    };
    writeSnapshot(snapshot);
    printSummary(currentValues, currentRatings, previous, true);
  }, 15000);
}
