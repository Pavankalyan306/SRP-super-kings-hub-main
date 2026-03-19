import { useState, useRef } from 'react';
import { useUploadPhoto, usePhotos, useDeletePhoto } from '@/hooks/usePhotos';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, CheckCircle2, AlertCircle, Trash2, Image as ImageIcon } from 'lucide-react';

interface PhotoUploaderProps {
  matchId?: string;
  onUploadSuccess?: () => void;
}

export default function PhotoUploader({ matchId, onUploadSuccess }: PhotoUploaderProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  const { mutate: uploadPhoto, isPending: isUploading, data: uploadResponse } = useUploadPhoto();
  const { data: photos, isLoading: photosLoading } = usePhotos();
  const { mutate: deletePhoto, isPending: isDeleting } = useDeletePhoto();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      alert('Please select image files only');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...imageFiles]);

    // Create previews
    imageFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPreview((prev) => [...prev, e.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreview((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0 || !user) return;

    // Upload each file
    for (const file of selectedFiles) {
      uploadPhoto(
        {
          file,
          matchId,
          uploadedBy: user.id,
        },
        {
          onSuccess: (response) => {
            if (response.success) {
              handleRemoveFile(selectedFiles.indexOf(file));
              onUploadSuccess?.();
            }
          },
        }
      );
    }
  };

  const handleDeletePhoto = (photoId: string, storagePath: string) => {
    if (confirm('Delete this photo?')) {
      deletePhoto({ photoId, storagePath });
    }
  };

  const matchPhotos = matchId ? photos?.filter((p) => p.match_id === matchId) : photos;

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg overflow-hidden"
      >
        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-8 text-center cursor-pointer transition-colors ${
            dragActive
              ? 'bg-primary/10 border-t-2 border-primary'
              : 'bg-secondary hover:bg-secondary/80'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <motion.div
            animate={dragActive ? { scale: 1.1 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-lg font-semibold text-foreground mb-1">
              {dragActive ? 'Drop files here' : 'Drag files here or click to select'}
            </p>
            <p className="text-sm text-muted-foreground">
              Supported: JPEG, PNG, GIF, WebP (Max 5MB)
            </p>
          </motion.div>
        </div>

        {/* Selected Files Preview */}
        {selectedFiles.length > 0 && (
          <div className="p-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <AnimatePresence>
                {preview.map((src, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative group"
                  >
                    <img
                      src={src}
                      alt={`Preview ${idx}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFile(idx);
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Upload Response */}
            {uploadResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-3 rounded-lg flex items-start gap-2 ${
                  uploadResponse.success
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-destructive/10 border border-destructive/20'
                }`}
              >
                {uploadResponse.success ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                )}
                <p className={`text-sm ${uploadResponse.success ? 'text-green-700' : 'text-destructive'}`}>
                  {uploadResponse.message}
                </p>
              </motion.div>
            )}

            {/* Upload Button */}
            <button
              onClick={handleUpload}
              disabled={isUploading || selectedFiles.length === 0 || !user}
              className="w-full mt-4 py-2 px-4 rounded-lg bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Photo' : 'Photos'}
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>

      {/* Photos Gallery */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6" />
          {matchId ? 'Match Photos' : 'All Photos'} ({matchPhotos?.length || 0})
        </h2>

        {photosLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : matchPhotos && matchPhotos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {matchPhotos.map((photo, idx) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-lg bg-secondary aspect-square">
                    <img
                      src={photo.url}
                      alt={photo.title || 'Photo'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                      {photo.title && <p className="text-white text-sm font-semibold">{photo.title}</p>}
                      {user?.id === photo.uploaded_by && (
                        <button
                          onClick={() => handleDeletePhoto(photo.id, photo.storage_path || '')}
                          disabled={isDeleting}
                          className="p-2 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground truncate">
                    {photo.title || photo.file_name}
                  </p>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">
              {matchId ? 'No photos for this match yet' : 'No photos uploaded yet'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
