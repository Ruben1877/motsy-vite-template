/**
 * Motsy Canvas Phase 2.1.5 — instrumentation iframe sandbox.
 *
 * Module side-effect : importé en tout 1er par main.tsx pour s'exécuter
 * AVANT que React render. Fait 2 choses :
 *
 *   1. Inject device-aware viewport/safe-area styles (cf
 *      motsy-device-styles.ts) selon `?device=` query param.
 *
 *   2. Mesure document.documentElement.scrollHeight et postMessage au
 *      parent (window.parent) avec `{ type: 'motsy:height', height,
 *      device }`. Le parent (CanvasFrame côté Motsy) écoute et resize
 *      l'iframe à la hauteur réelle pour afficher TOUT le site (pas
 *      que le above-the-fold).
 *
 *   3. Re-post sur ResizeObserver (throttle 200ms) pour les content
 *      changes (HMR, image load, font swap, accordéon ouvert, etc.).
 *
 *   4. Re-post sur Vite HMR `vite:afterUpdate` pour rebondir post-rebuild.
 *
 * No-op si window.parent === window (= page chargée hors iframe, ex:
 * test direct sur localhost). Pas d'erreur, pas de spam.
 *
 * Sécurité : la cible postMessage est `'*'` car le parent sait filtrer
 * via origin + event.source côté CanvasFrame. Ne contient AUCUN secret.
 */
import {
  getDeviceFromUrl,
  injectDeviceStyles,
  type MotsyDevice,
} from "./motsy-device-styles";

interface MotsyHeightMessage {
  type: "motsy:height";
  height: number;
  device: MotsyDevice;
}

const MAX_HEIGHT = 50_000; // cap defensive contre runaway resize
const THROTTLE_MS = 200;

let lastPostMs = 0;
let cachedDevice: MotsyDevice = "desktop";

function postHeight(): void {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  if (window.parent === window) return; // pas dans iframe → no-op
  try {
    const height = Math.max(
      document.documentElement.scrollHeight,
      document.body?.scrollHeight ?? 0,
    );
    if (height <= 0 || height > MAX_HEIGHT) return;
    const message: MotsyHeightMessage = {
      type: "motsy:height",
      height,
      device: cachedDevice,
    };
    window.parent.postMessage(message, "*");
  } catch {
    // postMessage peut throw si cross-origin policies très strictes —
    // pas d'impact fonctionnel, on ignore silencieusement.
  }
}

function postHeightThrottled(): void {
  const now = Date.now();
  if (now - lastPostMs < THROTTLE_MS) return;
  lastPostMs = now;
  postHeight();
}

/**
 * Phase 2.1.5.1 Bug #3 — forward Cmd/Ctrl+wheel events au parent canvas.
 * Sans ça, le wheel inside iframe trigger le browser zoom natif au lieu
 * du canvas zoom (le wheel listener parent n'est jamais notifié car
 * l'event est dispatché sur le contentDocument iframe, pas le parent).
 * On preventDefault local + postMessage `motsy:wheel` au parent qui
 * reproduit la logique anchored-zoom.
 */
function forwardWheelToParent(e: WheelEvent): void {
  if (window.parent === window) return;
  // Seulement forward si modifier (zoom), sinon laisser scroll natif
  // pour l'user qui scroll dans son site.
  if (!e.ctrlKey && !e.metaKey) return;
  try {
    e.preventDefault();
    window.parent.postMessage(
      {
        type: "motsy:wheel",
        deltaX: e.deltaX,
        deltaY: e.deltaY,
        ctrlKey: e.ctrlKey,
        metaKey: e.metaKey,
        clientX: e.clientX,
        clientY: e.clientY,
      },
      "*",
    );
  } catch {
    // silent
  }
}

if (typeof window !== "undefined") {
  cachedDevice = getDeviceFromUrl();
  injectDeviceStyles(cachedDevice);

  if (window.parent !== window) {
    // Bug #3 — wheel forward (passive: false pour pouvoir preventDefault).
    try {
      document.addEventListener("wheel", forwardWheelToParent, {
        passive: false,
        capture: true,
      });
    } catch {
      // silent
    }


    // Post initial après hydratation React (petit délai pour laisser
    // le DOM se stabiliser).
    if (document.readyState === "complete") {
      setTimeout(postHeight, 100);
    } else {
      window.addEventListener("load", () => setTimeout(postHeight, 100));
    }

    // Re-post sur mutations DOM (image load, accordéon, font swap, etc.).
    if (typeof ResizeObserver !== "undefined") {
      try {
        const ro = new ResizeObserver(postHeightThrottled);
        // Observer dès que body est dispo (parfois pas encore au module-init).
        const startObserve = () => {
          if (document.body) ro.observe(document.body);
        };
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", startObserve);
        } else {
          startObserve();
        }
      } catch {
        // ResizeObserver pas supporté — fallback silent.
      }
    }

    // Re-post sur Vite HMR. `import.meta.hot` peut être undefined côté
    // build prod — wrap try/catch défensif.
    try {
      const hot = (import.meta as ImportMeta & { hot?: { on: Function } }).hot;
      if (hot && typeof hot.on === "function") {
        hot.on("vite:afterUpdate", () => {
          setTimeout(postHeightThrottled, 100);
        });
      }
    } catch {
      // pas de HMR (build prod ou autre) — silent.
    }
  }
}
