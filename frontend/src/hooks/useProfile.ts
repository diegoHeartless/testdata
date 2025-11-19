import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { GenerationParams, ProfilesListResponse } from '../types';

export function useGenerateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: GenerationParams) => apiClient.generateProfile(params),
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', profile.id], profile);
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useProfile(id: string | null) {
  return useQuery({
    queryKey: ['profile', id],
    queryFn: () => (id ? apiClient.getProfile(id) : null),
    enabled: !!id,
  });
}

export function useProfilesList(page: number = 1, limit: number = 20) {
  return useQuery<ProfilesListResponse>({
    queryKey: ['profiles', page, limit],
    queryFn: () => apiClient.listProfiles(page, limit),
  });
}

export function useDeleteProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deleteProfile(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles'] });
    },
  });
}

export function useExportProfile() {
  return useMutation({
    mutationFn: ({ id, format }: { id: string; format: 'json' | 'pdf' }) =>
      apiClient.exportProfile(id, format),
  });
}

