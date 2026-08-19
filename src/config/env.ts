/**
 * Central environment configuration for the CMK CareSuite frontend.
 *
 * All environment variables MUST be prefixed with VITE_ to be exposed
 * to the browser by Vite's build system.
 *
 * To configure:
 *   - Development : copy .env.example → .env.local and fill in values
 *   - Production  : set VITE_* variables in your CI / hosting environment
 */

/** Base URL of the CMK CareSuite REST API (without trailing slash) */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_URL ?? "http://192.168.31.18:5000/api/v1";

/** App name shown in titles / branding */
export const APP_NAME: string =
  import.meta.env.VITE_APP_NAME ?? "CMK CareSuite";

/** Current environment */
export const NODE_ENV: string =
  import.meta.env.MODE ?? "development";

export const IS_DEV = NODE_ENV === "development";
export const IS_PROD = NODE_ENV === "production";
