import { create } from 'zustand';

interface ApiKeyStore {
  apiKey: string | null;
  apiBaseUrl: string;
  setApiKey: (key: string) => void;
  setApiBaseUrl: (url: string) => void;
  clearApiKey: () => void;
  isConfigured: () => boolean;
  loadFromStorage: () => void;
}

export const useApiKeyStore = create<ApiKeyStore>((set, get) => ({
  apiKey: null,
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  setApiKey: (key: string) => {
    set({ apiKey: key });
    localStorage.setItem('api_key', key);
  },
  setApiBaseUrl: (url: string) => {
    set({ apiBaseUrl: url });
    localStorage.setItem('api_base_url', url);
  },
  clearApiKey: () => {
    set({ apiKey: null });
    localStorage.removeItem('api_key');
  },
  isConfigured: () => {
    const key = get().apiKey || localStorage.getItem('api_key');
    return !!key;
  },
  loadFromStorage: () => {
    const storedKey = localStorage.getItem('api_key');
    const storedUrl = localStorage.getItem('api_base_url');
    if (storedKey) {
      set({ apiKey: storedKey });
    }
    if (storedUrl) {
      set({ apiBaseUrl: storedUrl });
    }
  },
}));

