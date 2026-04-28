import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePhotos, useUploadPhoto, useDeletePhoto } from "@/hooks/usePhotos";
import { motion } from "framer-motion";
import { Plus, Trash2, Image, Loader } from "lucide-react";

export default function PhotosAdmin() {
  const { user } = useAuth();
  const { data: photos = [], isLoading } = usePhotos();
  const uploadMutation = useUploadPhoto();
  const deleteMutation = useDeletePhoto();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [matchTag, setMatchTag] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!imageFile || !user) return;
    
    await uploadMutation.mutateAsync({
      file: imageFile,
      title: title || undefined,
      matchId: matchTag || undefined,
    });

    setTitle("");
    setMatchTag("");
    setImageFile(null);
    setPreview("");
    setAdding(false);
  };

  const handleDelete = (photoId: string, storagePath: string) => {
    deleteMutation.mutate({ photoId, storagePath });
  };


  return (
    <div>
      <button
        onClick={() => setAdding(true)}
        disabled={uploadMutation.isPending}
        className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-6 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        <Plus className="w-4 h-4" /> Upload Photo
      </button>

      {adding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Photo *</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadMutation.isPending}
                className="w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:text-xs file:cursor-pointer disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Victory Celebration"
                disabled={uploadMutation.isPending}
                className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Match ID (optional)</label>
              <input
                value={matchTag}
                onChange={(e) => setMatchTag(e.target.value)}
                placeholder="e.g. match-id-uuid"
                disabled={uploadMutation.isPending}
                className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
              />
            </div>
          </div>
          {preview && (
            <img src={preview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-border" />
          )}
          <div className="flex gap-2">
            <button
              onClick={save}
              disabled={!imageFile || uploadMutation.isPending}
              className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" /> Uploading...
                </>
              ) : (
                "Save"
              )}
            </button>
            <button
              onClick={() => {
                setAdding(false);
                setPreview("");
                setImageFile(null);
              }}
              disabled={uploadMutation.isPending}
              className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border bg-card">
              <img
                src={photo.url || photo.image_url}
                alt={photo.title || "Photo"}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDelete(photo.id, photo.storage_path || "")}
                  disabled={deleteMutation.isPending}
                  className="p-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {(photo.title || photo.caption) && (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.title || photo.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
