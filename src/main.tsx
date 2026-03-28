import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initWebVitalsTracking } from './performance/webVitals';

initWebVitalsTracking();

// import.meta.env.BASE_URL is set by Vite from the `base` config option
// (populated by VITE_BASE_PATH in CI). Falls back to '/' in local dev.
const basename = import.meta.env.BASE_URL;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
