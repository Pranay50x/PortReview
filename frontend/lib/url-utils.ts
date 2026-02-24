// Utility functions for URL construction

/**
 * Properly join base URL with path, avoiding double slashes
 */
export function joinUrl(baseUrl: string, path: string): string {
  // Remove trailing slash from baseUrl
  const cleanBase = baseUrl.replace(/\/+$/, '');
  
  // Remove leading slash from path and ensure it starts with /
  const cleanPath = path.replace(/^\/+/, '');
  
  return `${cleanBase}/${cleanPath}`;
}

/**
 * Get the API base URL from environment
 */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
}

/**
 * Construct API endpoint URL
 */
export function getApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl();
  return joinUrl(baseUrl, endpoint);
}