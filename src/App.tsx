import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import FamilyExplorer from './FamilyExplorer';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/explore" element={<Navigate to="/explore/tree" replace />} />
      <Route path="/explore/:view" element={<FamilyExplorer />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
