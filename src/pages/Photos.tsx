import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePhotos } from "@/hooks/usePhotos";
import PhotoUploader from "@/components/PhotoUploader";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera } from "lucide-react";

export default function Photos() {
  const { user, isAdmin } = useAuth();
  const { data: photos, isLoading } = usePhotos();
  const [selected, setSelected] = useState<string | null>(null);

  const selectedPhoto = photos?.find((p) => p.id === selected);

  return (
    <div className="container py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-gradient-gold mb-2">
          Gallery
        </h1>
        <p className="text-muted-foreground mb-8">Photos from matches, training & events</p>
      </motion.div>

      {/* Upload Section */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <PhotoUploader />
        </motion.div>
      )}

      {/* Photos Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: user ? 0.2 : 0.1 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : !photos || photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
            <Camera className="w-12 h-12 mb-4 opacity-40" />
            <p className="text-lg font-medium">No photos yet</p>
            <p className="text-sm">
              {isAdmin ? "Upload photos using the form above." : "Photos will appear here soon."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {photos.map((photo, i) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setSelected(photo.id)}
                className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer border border-border bg-card"
              >
                <img
                  src={photo.url}
                  alt={photo.title || "Gallery photo"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  {photo.title && (
                    <p className="text-sm font-medium text-foreground truncate">{photo.title}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

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
            <motion.img
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              src={selectedPhoto.url}
              alt={selectedPhoto.title || "Photo"}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            {selectedPhoto.title && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center">
                <p className="font-heading text-lg text-foreground">{selectedPhoto.title}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
