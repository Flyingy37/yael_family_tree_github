import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LangLayout from './app/[lang]/layout';
import TreePage from './app/[lang]/tree/page';
import PersonPage from './app/[lang]/person/[id]/page';
import InsightsPage from './app/[lang]/insights/page';

const FamilyArchivePage = lazy(() => import('./pages/FamilyArchivePage'));

export default function App() {
  return (
    <Routes>
      {/* Marketing pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* ── App routes ── /:lang/{tree,person/:id,insights} ─────────── */}
      <Route path="/:lang" element={<LangLayout />}>
        <Route index element={<Navigate to="tree" replace />} />
        <Route path="tree" element={<TreePage />} />
        <Route path="person/:id" element={<PersonPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route
          path="archive"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-[40vh] items-center justify-center bg-stone-50 text-sm text-stone-500">
                  טוען ארכיון…
                </div>
              }
            >
              <FamilyArchivePage />
            </Suspense>
          }
        />
      </Route>

      {/* Legacy /explore/* redirects */}
      <Route path="/explore" element={<Navigate to="/he/tree" replace />} />
      <Route path="/explore/tree" element={<Navigate to="/he/tree" replace />} />
      <Route path="/explore/map" element={<Navigate to="/he/tree" replace />} />
      <Route path="/explore/timeline" element={<Navigate to="/he/tree" replace />} />
      <Route path="/explore/statistics" element={<Navigate to="/he/insights" replace />} />

      <Route path="*" element={<Navigate to="/he/tree" replace />} />
    </Routes>
  );
}
