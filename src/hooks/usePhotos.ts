import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  uploadPhoto,
  uploadPhotos,
  fetchPhotos,
  fetchPhotosByMatch,
  deletePhoto,
  updatePhotoMetadata,
  PhotoUploadData,
  PhotoRecord,
} from '@/lib/photos';

/**
 * Hook to upload a single photo
 * Automatically updates photo cache after upload
 */
export function useUploadPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadPhoto,
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate photos queries to refetch
        queryClient.invalidateQueries({ queryKey: ['photos'] });
        if (response.data?.match_id) {
          queryClient.invalidateQueries({ queryKey: ['photos', 'match', response.data.match_id] });
        }
      }
    },
    onError: (error) => {
      console.error('Photo upload error:', error);
    },
  });
}

/**
 * Hook to upload multiple photos
 */
export function useUploadPhotos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ files, matchId }: { files: File[]; matchId?: string }) =>
      uploadPhotos(files, matchId),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ['photos'] });
      }
    },
    onError: (error) => {
      console.error('Batch photo upload error:', error);
    },
  });
}

/**
 * Hook to fetch all photos
 */
export function usePhotos() {
  return useQuery({
    queryKey: ['photos'],
    queryFn: async () => {
      const response = await fetchPhotos();
      if (response.error) {
        throw new Error(response.error);
      }
      return (Array.isArray(response.data) ? response.data : []) as PhotoRecord[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Hook to fetch photos by match ID
 */
export function usePhotosByMatch(matchId: string | undefined) {
  return useQuery({
    queryKey: ['photos', 'match', matchId],
    queryFn: async () => {
      if (!matchId) return [];
      const response = await fetchPhotosByMatch(matchId);
      if (response.error) {
        throw new Error(response.error);
      }
      return (response.data as unknown as PhotoRecord[]) || [];
    },
    enabled: !!matchId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  });
}

/**
 * Hook to delete a photo
 */
export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, storagePath }: { photoId: string; storagePath: string }) =>
      deletePhoto(photoId, storagePath),
    onSuccess: () => {
      // Invalidate all photo queries
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      console.error('Photo deletion error:', error);
    },
  });
}

/**
 * Hook to update photo metadata
 */
export function useUpdatePhotoMetadata() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, updates }: { photoId: string; updates: Partial<PhotoRecord> }) =>
      updatePhotoMetadata(photoId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      console.error('Photo metadata update error:', error);
    },
  });
}
