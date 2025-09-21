/**
 * API Configuration
 * Handles different environments (local, Railway, etc.)
 */

const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:8000';
  }
  
  // Default to Railway production URL
  return 'https://codemate-production.up.railway.app';
};

export const API_CONFIG = {
  baseURL: getApiBaseUrl(),
  timeout: 10000,
  retries: 3,
  retryDelay: 1000,
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
