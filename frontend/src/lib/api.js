export function buildApiUrl(path) {
  // path should start with '/'
  const base = import.meta.env.VITE_API_URL || '';
  if (base) {
    const normalized = base.replace(/\/$/, '');
    const apiBase = normalized.endsWith('/api') ? normalized : `${normalized}/api`;
    return `${apiBase}${path}`;
  }
  // If no VITE_API_URL is set (e.g., deployed static site), use relative /api
  return `/api${path}`;
}
