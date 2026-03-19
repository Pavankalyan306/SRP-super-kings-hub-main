# 📸 Photo Management System - Quick Reference Card

## 🚀 Quick Start for Developers

### Import Components
```typescript
import PhotoUploader from '@/components/PhotoUploader';
import MatchPhotos from '@/components/MatchPhotos';
```

### Import Hooks
```typescript
import { 
  useUploadPhoto,
  usePhotos,
  usePhotosByMatch,
  useDeletePhoto,
  useUpdatePhotoMetadata
} from '@/hooks/usePhotos';
```

### Use in Components

#### Option 1: Show Upload + Gallery
```typescript
<PhotoUploader matchId={matchId} onUploadSuccess={handleSuccess} />
```

#### Option 2: Show Gallery Only
```typescript
<MatchPhotos matchId={matchId} allowDelete={false} />
```

#### Option 3: All Photos (Admin)
```typescript
<PhotoUploader />  {/* All photos, admin upload */}
```

---

## 📋 Component Props

### PhotoUploader
```typescript
{
  matchId?: string;           // Optional: filter/tag photos by match
  onUploadSuccess?: () => void; // Optional: success callback
}
```

### MatchPhotos
```typescript
{
  matchId: string;    // Required: which match to show
  allowDelete?: boolean; // Optional: show delete buttons (default: true)
}
```

---

## 🎣 Hook Usage

### Upload Photo
```typescript
const { mutate: uploadPhoto, isPending } = useUploadPhoto();

uploadPhoto({
  file: File,
  matchId: 'optional-id',
  uploadedBy: 'user-id'
});
```

### Get All Photos
```typescript
const { data: photos, isLoading } = usePhotos();
// Returns: PhotoRecord[]
```

### Get Match Photos
```typescript
const { data: photos } = usePhotosByMatch('match-123');
// Returns: PhotoRecord[]
```

### Delete Photo
```typescript
const { mutate: deletePhoto } = useDeletePhoto();

deletePhoto({ 
  photoId: 'id', 
  storagePath: 'path' 
});
```

---

## 🗂️ File Structure

```
src/
├── components/
│   ├── PhotoUploader.tsx      ← Upload UI + Gallery
│   └── MatchPhotos.tsx        ← Match photo display
├── hooks/
│   └── usePhotos.ts           ← 6 React Query hooks
├── lib/
│   ├── supabase.ts           ← Supabase client
│   └── photos.ts             ← Service functions (6)
├── types/
│   └── cricket.ts            ← PhotoRecord type
├── pages/
│   └── Photos.tsx            ← Gallery page (updated)
└── context/
    └── AuthContext.tsx       ← User auth (already integrated)

Docs/
├── PHOTO_SYSTEM_GUIDE.md                 (400+ lines)
├── PHOTO_COMPONENTS_INTEGRATION.md       (250+ lines)
├── PHOTO_SYSTEM_IMPLEMENTATION.md        (300+ lines)
└── PHOTO_SYSTEM_SESSION_SUMMARY.md       (300+ lines)
```

---

## 🎯 API Reference

### Service Functions
```typescript
// Upload
uploadPhoto(data: PhotoUploadData): Promise<UploadPhotoResponse>
uploadPhotos(files: File[], matchId?: string): Promise<UploadPhotoResponse>

// Fetch
fetchPhotos(): Promise<PhotoRecord[]>
fetchPhotosByMatch(matchId: string): Promise<PhotoRecord[]>

// Delete
deletePhoto(photoId: string, storagePath: string): Promise<{success: boolean}>

// Update
updatePhotoMetadata(photoId: string, data: Partial<PhotoRecord>): Promise<{success: boolean}>
```

### React Query Hooks
```typescript
useUploadPhoto(): UseMutationResult
useUploadPhotos(): UseMutationResult
usePhotos(): UseQueryResult<PhotoRecord[]>
usePhotosByMatch(matchId: string): UseQueryResult<PhotoRecord[]>
useDeletePhoto(): UseMutationResult
useUpdatePhotoMetadata(): UseMutationResult
```

---

## 📊 Type Definitions

```typescript
interface PhotoRecord {
  id: string;          // UUID
  match_id?: string;   // Optional match association
  url: string;         // Public image URL
  title?: string;      // Photo title
  description?: string; // Photo description
  file_name: string;   // Original filename
  file_size: number;   // File size in bytes
  file_type: string;   // MIME type
  storage_path: string; // Storage path
  uploaded_by: string; // User ID
  created_at: string;  // Timestamp
  updated_at?: string; // Timestamp
}
```

---

## ✅ Features at a Glance

| Feature | Component | Hook | Service |
|---------|-----------|------|---------|
| Upload | ✅ PhotoUploader | ✅ useUploadPhoto | ✅ uploadPhoto |
| View | ✅ PhotoUploader, MatchPhotos | ✅ usePhotos | ✅ fetchPhotos |
| Filter by Match | ✅ MatchPhotos | ✅ usePhotosByMatch | ✅ fetchPhotosByMatch |
| Delete | ✅ PhotoUploader, MatchPhotos | ✅ useDeletePhoto | ✅ deletePhoto |
| Update Metadata | - | ✅ useUpdatePhotoMetadata | ✅ updatePhotoMetadata |
| Lightbox | ✅ MatchPhotos | - | - |
| Progress | ✅ PhotoUploader | ✅ useUploadPhoto | - |
| Validation | - | - | ✅ photos.ts |
| Auth Check | - | - | ✅ photos.ts |

---

## 🔐 Permissions

| Action | User | Admin |
|--------|------|-------|
| View photos | ✅ | ✅ |
| Upload photos | ❌ | ✅ |
| Delete own | ❌ | ✅ |
| Delete others | ❌ | ❌ |
| See upload form | ❌ | ✅ |

---

## 🎨 Styling Classes Used

### Component Root
```css
.bg-card              /* Card background */
.border-border        /* Card border */
.rounded-lg          /* Rounded corners */
.p-6                 /* Padding */
```

### Drop Zone
```css
.bg-secondary        /* Background */
.border-primary      /* Primary highlight */
.transition-colors   /* Smooth transition */
```

### Grid
```css
.grid                           /* CSS grid */
.grid-cols-2                    /* Mobile: 2 columns */
.sm:grid-cols-3                 /* Tablet: 3 columns */
.md:grid-cols-4                 /* Desktop: 4 columns */
.gap-3, .gap-4                  /* Spacing */
```

### Animations
```css
.animate-spin        /* Loading spinner */
.hover:scale-105     /* Image zoom */
.transition-transform /* Smooth transform */
.duration-300        /* 300ms duration */
```

---

## 🧪 Testing Quick Commands

### Test Upload
```typescript
// Select file > drag or click
// See preview > click Upload
// Verify success message
// Check gallery updates
```

### Test Permissions
```typescript
// Regular user: No upload form
// Admin user: See upload form
// View-only mode: No delete buttons
```

### Test Responsive
```
Mobile (< 640px):   2 columns
Tablet (640-1024):  3 columns
Desktop (> 1024):   4 columns
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Upload not showing | Check auth context |
| Photos don't display | Check usePhotos hook |
| Delete not working | Check user permissions |
| Images not loading | Check Supabase URL |
| Animations lag | Check Framer Motion deps |

---

## 📞 Documentation Links

- [Full System Guide](./PHOTO_SYSTEM_GUIDE.md)
- [Integration Examples](./PHOTO_COMPONENTS_INTEGRATION.md)
- [Implementation Details](./PHOTO_SYSTEM_IMPLEMENTATION.md)
- [Session Summary](./PHOTO_SYSTEM_SESSION_SUMMARY.md)

---

## 💡 Common Patterns

### Pattern 1: Upload & View (Admin)
```typescript
<>
  <PhotoUploader matchId={id} />
  <MatchPhotos matchId={id} />
</>
```

### Pattern 2: View Only (Public)
```typescript
<MatchPhotos matchId={id} allowDelete={false} />
```

### Pattern 3: All Photos (Gallery)
```typescript
<PhotoUploader />
```

### Pattern 4: Conditional Admin
```typescript
{isAdmin && <PhotoUploader />}
<MatchPhotos matchId={id} />
```

---

## 📈 Performance Tips

1. **Use React Query** - Automatic caching (5 min stale)
2. **Lazy Load** - Load photos only when needed
3. **usePhotosByMatch** - Filter before rendering
4. **allowDelete={false}** - Reduce re-renders in view mode
5. **Limit Gallery** - Paginate for large collections (future)

---

## 🎓 Key Concepts

### PhotoUploader
- Drag-and-drop interface
- Multi-file support
- Preview before upload
- Built-in photo gallery

### MatchPhotos  
- Match-specific display
- Lightbox preview
- User-specific delete
- Read-only option

### Hooks
- React Query integration
- Automatic caching
- Mutation handling
- Error management

### Services
- Validation layer
- Auth checking
- Supabase integration
- Error cleanup

---

## ✨ Features Summary

- ✅ Drag-drop upload
- ✅ File validation
- ✅ Multi-file support
- ✅ Preview thumbnails
- ✅ Progress display
- ✅ Gallery view
- ✅ Lightbox modal
- ✅ Delete permission
- ✅ Match filtering
- ✅ Admin controls
- ✅ Responsive grid
- ✅ Animations
- ✅ Error handling
- ✅ Loading states
- ✅ TypeScript
- ✅ React Query cache

---

**Last Updated**: Current Session
**Status**: ✅ Production Ready
**Files**: 2 components + 3 docs + types + services + hooks

