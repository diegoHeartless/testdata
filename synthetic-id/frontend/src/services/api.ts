import { ApiResponse, Profile, GenerationParams, ProfilesListResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getApiKey(): string {
    const stored = localStorage.getItem('api_key');
    if (!stored) {
      throw new Error('API key not configured. Please set it in settings.');
    }
    return stored;
  }

  setApiKey(key: string): void {
    localStorage.setItem('api_key', key);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const apiKey = this.getApiKey();
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Request failed';
        const error = new Error(errorMessage);
        (error as any).code = data.error?.code;
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async generateProfile(params: GenerationParams): Promise<Profile> {
    const response = await this.request<{ id: string; profile: Profile; created_at: string }>(
      '/profiles/generate',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to generate profile');
    }

    // Бекенд возвращает { id, profile, created_at }
    const profile = (response.data as any).profile || response.data;
    return profile as Profile;
  }

  async getProfile(id: string): Promise<Profile> {
    const response = await this.request<{ id: string; profile: Profile }>(
      `/profiles/${id}`,
      {
        method: 'GET',
      },
    );

    if (!response.success || !response.data?.profile) {
      throw new Error(response.error?.message || 'Profile not found');
    }

    return response.data.profile;
  }

  async listProfiles(page: number = 1, limit: number = 20): Promise<ProfilesListResponse> {
    const response = await this.request<ProfilesListResponse>(
      `/profiles?page=${page}&limit=${limit}`,
      {
        method: 'GET',
      },
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch profiles');
    }

    return response.data;
  }

  async deleteProfile(id: string): Promise<void> {
    const response = await this.request(`/profiles/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error?.message || 'Failed to delete profile');
    }
  }

  async exportProfile(id: string, format: 'json' | 'pdf' = 'json'): Promise<Blob> {
    const url = `${this.baseUrl}/profiles/${id}/export?format=${format}`;
    const apiKey = this.getApiKey();
    const response = await fetch(url, {
      headers: {
        'X-API-Key': apiKey,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'Failed to export profile');
    }

    return response.blob();
  }

  // Метрики для пользователей
  async getUserUsageMetrics() {
    const response = await this.request<any>('/metrics/usage');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch usage metrics');
    }
    return response.data;
  }

  async getUserProfileMetrics() {
    const response = await this.request<any>('/metrics/profiles');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch profile metrics');
    }
    return response.data;
  }

  // Метрики для администраторов
  async getSystemMetrics() {
    const response = await this.request<any>('/admin/metrics/system');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch system metrics');
    }
    return response.data;
  }

  async getUsersMetrics() {
    const response = await this.request<any>('/admin/metrics/users');
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch users metrics');
    }
    return response.data;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);






