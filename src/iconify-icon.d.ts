// Iconify CDN (web component) — typage de l'élément custom <iconify-icon>.
// Chargé via le <script> iconify-icon dans index.html (CDN, on-demand SVG).
// Usage : <iconify-icon icon="fa6-solid:star" width="20" />
//         <iconify-icon icon="fa6-brands:instagram" />  (logos de marque)
//         <iconify-icon icon="ph:heart-fill" />          (Phosphor, premium)
//
// Type volontairement permissif (`any`) + double déclaration (global JSX
// legacy ET React.JSX pour React 19 + jsx:react-jsx) → l'élément est TOUJOURS
// reconnu en TSX, ne peut JAMAIS provoquer d'erreur de type qui casserait le
// build, quelle que soit la version de React/TS.
import "react";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "iconify-icon": any;
    }
  }
}

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "iconify-icon": any;
    }
  }
}

export {};
