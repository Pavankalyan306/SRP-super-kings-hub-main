import { useState } from 'react';
import { usePhotosByMatch, useDeletePhoto } from '@/hooks/usePhotos';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Trash2, Image as ImageIcon } from 'lucide-react';

interface MatchPhotosProps {
  matchId: string;
  allowDelete?: boolean;
}

export default function MatchPhotos({ matchId, allowDelete = true }: MatchPhotosProps) {
  const { user } = useAuth();
  const { data: photos, isLoading } = usePhotosByMatch(matchId);
  const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPhoto = photos?.find((p) => p.id === selected);

  const handleDelete = (photoId: string, storagePath: string) => {
    if (confirm('Delete this photo?')) {
      deletePhoto({ photoId, storagePath });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No photos uploaded for this match</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Photos Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        <AnimatePresence>
          {photos.map((photo, idx) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.05 }}
              className="group relative"
            >
              <div
                className="relative overflow-hidden rounded-lg bg-secondary aspect-square cursor-pointer"
                onClick={() => setSelected(photo.id)}
              >
                <img
                  src={photo.url}
                  alt={photo.title || 'Match photo'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-xs font-semibold">View</p>
                </div>
              </div>

              {/* Delete Button */}
              {allowDelete && user?.id === photo.uploaded_by && (
                <button
                  onClick={() =>
                    handleDelete(photo.id, photo.storage_path || '')
                  }
                  disabled={isDeleting}
                  className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}

              {/* Photo Title */}
              {photo.title && (
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {photo.title}
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-foreground hover:bg-destructive transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title || 'Photo'}
                className="max-w-full max-h-[75vh] object-contain rounded-lg"
              />
              {selectedPhoto.title && (
                <p className="mt-4 text-center text-foreground">
                  {selectedPhoto.title}
                </p>
              )}
              {selectedPhoto.description && (
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
                  {selectedPhoto.description}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
