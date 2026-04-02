import { Routes, Route, Navigate } from 'react-router-dom';
import { SpeedInsights } from '@vercel/speed-insights/react';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LangLayout from './app/[lang]/layout';
import TreePage from './app/[lang]/tree/page';
import PersonPage from './app/[lang]/person/[id]/page';
import InsightsPage from './app/[lang]/insights/page';
import ArchivePage from './app/[lang]/archive/page';
import D3TreePage from './app/[lang]/d3tree/page';

export default function App() {
  return (
    <>
      <Routes>
        {/* Marketing pages */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />

        {/* ── App routes ── /:lang/{tree,person/:id,insights,archive,d3tree} ─ */}
        <Route path="/:lang" element={<LangLayout />}>
          <Route index element={<Navigate to="tree" replace />} />
          <Route path="tree" element={<TreePage />} />
          <Route path="person/:id" element={<PersonPage />} />
          <Route path="insights" element={<InsightsPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="d3tree" element={<D3TreePage />} />
        </Route>

        {/* Legacy /explore/* redirects */}
        <Route path="/explore" element={<Navigate to="/he/tree" replace />} />
        <Route path="/explore/tree" element={<Navigate to="/he/tree" replace />} />
        <Route path="/explore/map" element={<Navigate to="/he/tree" replace />} />
        <Route path="/explore/timeline" element={<Navigate to="/he/tree" replace />} />
        <Route path="/explore/statistics" element={<Navigate to="/he/insights" replace />} />

        <Route path="*" element={<Navigate to="/he/tree" replace />} />
      </Routes>
      <SpeedInsights />
    </>
  );
}
