import { createRoot } from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App.tsx";
import "./index.css";
import { performanceMonitor } from './lib/performance';
import config from './lib/config';

// Monitor Core Web Vitals in production
if (config.isProduction) {
  performanceMonitor.getCoreWebVitals();
  performanceMonitor.logBundleSize();
}

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
