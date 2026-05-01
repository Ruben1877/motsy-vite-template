// Motsy Canvas Phase 2.1.5 — postMessage motsy:height + device-aware
// viewport/safe-area. MUST be imported FIRST (avant React) pour set le
// viewport meta + max-width body AVANT que React render. Side-effect
// only, no API exposed.
import "./motsy-instrumentation";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

const base = import.meta.env.BASE_URL || "/";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={base}>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
