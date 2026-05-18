/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Partial migration: custom element used before design-system rollout
// BUG (Easy/TS): non-standard element — triggers ESLint/TS warnings intentionally
declare namespace JSX {
  interface IntrinsicElements {
    'motion-root': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
  }
}
