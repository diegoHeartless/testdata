import { ApiResponse, Profile, GenerationParams, ProfilesListResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || 'test-api-key';

class ApiClient {
  private baseUrl: string;
  private apiKey: string;

  constructor(baseUrl: string, apiKey: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Request failed');
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  async generateProfile(params: GenerationParams): Promise<Profile> {
    const response = await this.request<{ id: string; profile: Profile }>(
      '/profiles/generate',
      {
        method: 'POST',
        body: JSON.stringify(params),
      },
    );

    if (!response.success || !response.data?.profile) {
      throw new Error(response.error?.message || 'Failed to generate profile');
    }

    return response.data.profile;
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
    const response = await fetch(url, {
      headers: {
        'X-API-Key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export profile');
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient(API_BASE_URL, API_KEY);



