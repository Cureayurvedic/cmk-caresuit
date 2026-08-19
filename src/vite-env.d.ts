/// <reference types="vite/client" />

/**
 * Strongly-typed environment variables for CMK CareSuite.
 * Add any new VITE_* variables here so TypeScript can validate their usage.
 */
interface ImportMetaEnv {
  /** Full base URL of the API, e.g. http://localhost:5000/api/v1 */
  readonly VITE_API_URL: string;
  /** Application display name */
  readonly VITE_APP_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.svg" {
  import type * as React from "react";
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}
