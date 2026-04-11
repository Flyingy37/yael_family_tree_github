import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import AssistLoopWidget from './components/AssistLoopWidget';

const HomePage = lazy(() => import('./pages/HomePage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const LangLayout = lazy(() => import('./app/[lang]/layout'));
const TreePage = lazy(() => import('./app/[lang]/tree/page'));
const PersonPage = lazy(() => import('./app/[lang]/person/[id]/page'));
const InsightsPage = lazy(() => import('./app/[lang]/insights/page'));
const ArchivePage = lazy(() => import('./app/[lang]/archive/page'));
const GinzburgLiandresBranchPage = lazy(() => import('./app/[lang]/branches/ginzburg-liandres/page'));

function RouteFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="text-center px-4" dir="rtl">
        <div className="text-5xl mb-4 animate-bounce">🌳</div>
        <div className="text-base font-medium text-stone-700">טוען את האתר...</div>
        <div className="text-sm text-stone-500 mt-2">Loading the family archive...</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/:lang" element={<LangLayout />}>
            <Route index element={<Navigate to="tree" replace />} />
            <Route path="tree" element={<TreePage />} />
            <Route path="person/:id" element={<PersonPage />} />
            <Route path="branches/ginzburg-liandres" element={<GinzburgLiandresBranchPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="archive" element={<ArchivePage />} />
          </Route>

          <Route path="/explore" element={<Navigate to="/he/tree" replace />} />
          <Route path="/explore/tree" element={<Navigate to="/he/tree" replace />} />
          <Route path="/explore/map" element={<Navigate to="/he/tree" replace />} />
          <Route path="/explore/timeline" element={<Navigate to="/he/tree" replace />} />
          <Route path="/explore/statistics" element={<Navigate to="/he/insights" replace />} />

          <Route path="*" element={<Navigate to="/he/tree" replace />} />
        </Routes>
      </Suspense>
      <AssistLoopWidget />
      <SpeedInsights />
    </>
  );
}
