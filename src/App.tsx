import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import LangLayout from './app/[lang]/layout';
import TreePage from './app/[lang]/tree/page';
import PersonPage from './app/[lang]/person/[id]/page';
import InsightsPage from './app/[lang]/insights/page';
import ArchivePage from './app/[lang]/archive/page';
import DashboardPage from './pages/DashboardPage';
import PeoplePage from './pages/PeoplePage';
import PersonProfilePage from './pages/PersonProfilePage';
import ResearchTreePage from './pages/ResearchTreePage';
import DnaPage from './pages/DnaPage';
import MergeReviewPage from './pages/MergeReviewPage';
import { FamilyGraphProvider } from './hooks/useFamilyData';

export default function App() {
  return (
    <Routes>
      {/* Marketing pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />

      {/* ── App routes ── /:lang/{tree,person/:id,insights,archive} ─ */}
      <Route
        path="/:lang"
        element={
          <FamilyGraphProvider>
            <LangLayout />
          </FamilyGraphProvider>
        }
      >
        <Route index element={<Navigate to="tree" replace />} />
        <Route path="tree" element={<TreePage />} />
        <Route path="person/:id" element={<PersonPage />} />
        <Route path="insights" element={<InsightsPage />} />
        <Route path="archive" element={<ArchivePage />} />
        <Route path="research" element={<DashboardPage />} />
        <Route path="people" element={<PeoplePage />} />
        <Route path="research/profile/:profileId" element={<PersonProfilePage />} />
        <Route path="research/workspace-tree" element={<ResearchTreePage />} />
        <Route path="research/dna" element={<DnaPage />} />
        <Route path="research/merge" element={<MergeReviewPage />} />
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
