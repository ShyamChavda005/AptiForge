/**
 * Centralized API Base URL Configuration.
 * 
 * - Production Mode (`npm run build`): Uses `VITE_API_URL` from `.env`
 * - Local Development Mode (`npm run dev`): Defaults to `http://localhost:8000`
 */
const getApiBaseUrl = () => {
    // When running Vite dev server locally, use local backend URL
    if (import.meta.env.DEV) {
        return import.meta.env.VITE_DEV_API_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";
    }

    // When built for production, use VITE_API_URL from .env
    return import.meta.env.VITE_API_URL || "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl().replace(/\/+$/, "");
