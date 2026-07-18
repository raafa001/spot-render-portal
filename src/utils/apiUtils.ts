const API_BASE = typeof window !== 'undefined'
  ? (window.location.origin || '')
  : (process.env.NEXT_PUBLIC_API_URL || '');

const AI_BASE = typeof window !== 'undefined'
  ? (window.location.origin || '')
  : (process.env.NEXT_PUBLIC_AI_API_URL || process.env.NEXT_PUBLIC_API_URL || '');

export function getApiUrl(path: string = ''): string {
  const base = API_BASE.replace(/\/$/, '');
  return path ? `${base}${path}` : base;
}

export function getAiUrl(path: string = ''): string {
  const base = AI_BASE.replace(/\/$/, '');
  return path ? `${base}${path}` : base;
}

export function getApiBase(): string {
  return API_BASE;
}

export function getAiApiUrl(): string {
  return AI_BASE;
}
