import Constants from 'expo-constants';

// Auto-detect backend host from Expo dev server so physical devices work
function getApiUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
  // If explicitly set to a non-localhost URL, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) return envUrl;
  // Derive host from Expo dev server (e.g. "192.168.1.5:8081" → "http://192.168.1.5:8000")
  const hostUri: string = (Constants.expoConfig as any)?.hostUri ?? '';
  const host = hostUri.split(':')[0];
  if (host && host !== 'localhost' && host !== '') return `http://${host}:8000`;
  return envUrl || 'http://localhost:8000';
}

export const ENV = {
  SUPABASE_URL:     process.env.EXPO_PUBLIC_SUPABASE_URL     ?? '',
  SUPABASE_ANON_KEY:process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  API_URL:          getApiUrl(),
} as const;
