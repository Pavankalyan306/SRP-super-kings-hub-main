import { useState } from "react";
import { useData } from "@/context/DataContext";
import { PhotoItem } from "@/types/cricket";
import { motion } from "framer-motion";
import { Plus, Trash2, Image } from "lucide-react";

export default function PhotosAdmin() {
  const { photos, addPhoto, deletePhoto } = useData();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [matchTag, setMatchTag] = useState("");
  const [imageData, setImageData] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImageData(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!imageData) return;
    addPhoto({
      image: imageData,
      title: title || undefined,
      matchTag: matchTag || undefined,
      date: new Date().toISOString().slice(0, 10),
    });
    setTitle("");
    setMatchTag("");
    setImageData("");
    setAdding(false);
  };

  return (
    <div>
      <button
        onClick={() => setAdding(true)}
        className="flex items-center gap-2 gradient-gold text-primary-foreground font-semibold px-4 py-2 rounded-md mb-6 hover:opacity-90 transition-opacity"
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
                className="w-full text-sm text-muted-foreground file:mr-3 file:px-3 file:py-1.5 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground file:font-medium file:text-xs file:cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title (optional)</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Victory Celebration"
                className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Match Tag (optional)</label>
              <input
                value={matchTag}
                onChange={(e) => setMatchTag(e.target.value)}
                placeholder="e.g. vs Mumbai Warriors"
                className="w-full bg-secondary text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
          {imageData && (
            <img src={imageData} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-border" />
          )}
          <div className="flex gap-2">
            <button onClick={save} className="gradient-gold text-primary-foreground font-semibold px-6 py-2 rounded-md hover:opacity-90 transition-opacity">
              Save
            </button>
            <button onClick={() => { setAdding(false); setImageData(""); }} className="bg-secondary text-secondary-foreground px-6 py-2 rounded-md hover:opacity-80 transition-opacity">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {photos.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No photos uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="relative group rounded-lg overflow-hidden border border-border bg-card">
              <img src={photo.image} alt={photo.title || "Photo"} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="p-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-80 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {photo.title && (
                <div className="p-2">
                  <p className="text-xs text-muted-foreground truncate">{photo.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
