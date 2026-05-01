/**
 * Motsy Canvas Phase 2.1.5 — device preset injection.
 *
 * Lit le query param `?device=` (set par le parent Canvas via l'iframe
 * src) et configure le viewport meta + le CSS env() safe-area-inset
 * pour simuler le device cible (iPad / iPhone 14 Pro Max). Le viewport
 * width est ce qui compte pour la responsiveness — le DPR n'a pas
 * d'impact sur le layout, on le laisse de côté pour Phase 2.1.5.
 *
 * Aucune dépendance React/Vite — pur DOM API. Appelé au tout début
 * par motsy-instrumentation.ts.
 */

export type MotsyDevice = "desktop" | "tablet" | "iphone14promax";

export function getDeviceFromUrl(): MotsyDevice {
  if (typeof window === "undefined") return "desktop";
  try {
    const params = new URLSearchParams(window.location.search);
    const d = params.get("device");
    if (d === "tablet" || d === "iphone14promax") return d;
    return "desktop";
  } catch {
    return "desktop";
  }
}

/**
 * Inject viewport meta + safe-area CSS + max-width body selon le device.
 * Idempotent : appel multiple = override propre (replaceWith / id check).
 */
export function injectDeviceStyles(device: MotsyDevice): void {
  if (typeof document === "undefined") return;

  // 1. Viewport meta — différent par device.
  const existing = document.querySelector('meta[name="viewport"]');
  const viewport = document.createElement("meta");
  viewport.name = "viewport";
  if (device === "iphone14promax") {
    viewport.content =
      "width=430, initial-scale=1, viewport-fit=cover, user-scalable=no";
  } else if (device === "tablet") {
    viewport.content = "width=820, initial-scale=1, viewport-fit=cover";
  } else {
    viewport.content = "width=device-width, initial-scale=1";
  }
  if (existing) existing.replaceWith(viewport);
  else document.head.appendChild(viewport);

  // 2. Safe areas iPhone 14 Pro Max (CSS env() — fallback hardcoded
  //    car pas de vrai notch en iframe).
  const SAFE_STYLE_ID = "motsy-safe-area";
  const oldSafe = document.getElementById(SAFE_STYLE_ID);
  if (oldSafe) oldSafe.remove();
  if (device === "iphone14promax") {
    const style = document.createElement("style");
    style.id = SAFE_STYLE_ID;
    style.textContent = `
      :root {
        --motsy-safe-top: 59px;
        --motsy-safe-bottom: 34px;
      }
      body {
        padding-top: env(safe-area-inset-top, var(--motsy-safe-top));
        padding-bottom: env(safe-area-inset-bottom, var(--motsy-safe-bottom));
      }
    `;
    document.head.appendChild(style);
  }

  // 3. Force max-width sur <html> pour simuler le viewport restreint
  //    quand on charge le site dans une iframe wider que viewport cible.
  const html = document.documentElement;
  if (device === "iphone14promax") {
    html.style.maxWidth = "430px";
    html.style.margin = "0 auto";
  } else if (device === "tablet") {
    html.style.maxWidth = "820px";
    html.style.margin = "0 auto";
  } else {
    // desktop : reset (idempotence).
    html.style.maxWidth = "";
    html.style.margin = "";
  }
}
