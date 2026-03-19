# Photo Management System - Complete Guide

## Overview
The photo management system provides complete functionality for uploading, storing, displaying, and managing photos with Supabase integration.

## Components

### 1. PhotoUploader Component
**Path**: `src/components/PhotoUploader.tsx`

#### Features
- **Drag & Drop Upload**: Users can drag files directly onto the drop zone
- **File Selection**: Click to open file picker
- **Multi-file Support**: Upload multiple photos at once
- **Preview Thumbnails**: See selected photos before upload
- **Progress Tracking**: Visual feedback during upload
- **Photo Gallery**: View all uploaded photos with filtering
- **Delete Management**: Remove photos with confirmation

#### Usage
```typescript
import PhotoUploader from '@/components/PhotoUploader';

// Basic usage (all photos)
<PhotoUploader />

// With specific match
<PhotoUploader matchId="match-123" onUploadSuccess={() => console.log('Done')} />
```

#### Props
```typescript
interface PhotoUploaderProps {
  matchId?: string;        // Optional: filter photos by match
  onUploadSuccess?: () => void;  // Callback after successful upload
}
```

#### Validation
- **File Types**: JPEG, PNG, GIF, WebP only
- **File Size**: Max 5MB per file
- **Authentication**: Required (checks `useAuth`)

#### Styling
- Responsive grid layout (2-4 columns based on screen size)
- Tailwind CSS with custom card styling
- Framer Motion animations
- Drag zone highlight on active state

---

### 2. MatchPhotos Component
**Path**: `src/components/MatchPhotos.tsx`

#### Features
- **Match-Specific Display**: Shows only photos from a specific match
- **Lightbox Preview**: Click to view full-size image
- **Delete Permissions**: Only uploader can delete their photos
- **Loading States**: Spinner while fetching
- **Empty State**: Friendly message when no photos exist
- **Animations**: Smooth entrance and exit animations

#### Usage
```typescript
import MatchPhotos from '@/components/MatchPhotos';

// Display photos for a match
<MatchPhotos matchId="match-456" />

// View-only mode (no delete buttons)
<MatchPhotos matchId="match-456" allowDelete={false} />
```

#### Props
```typescript
interface MatchPhotosProps {
  matchId: string;      // Required: the match ID to filter by
  allowDelete?: boolean; // Optional: default true - show delete buttons
}
```

#### File Structure
```
Match Photos Component
├── Loading State (spinner)
├── Empty State (no photos message)
└── Photos Grid
    ├── Photo Item
    │   ├── Image Thumbnail
    │   ├── Hover Overlay
    │   └── Delete Button
    └── Lightbox Modal
        ├── Full-size Image
        ├── Photo Title
        └── Close Button
```

---

### 3. Updated Photos Page
**Path**: `src/pages/Photos.tsx`

#### Features
- **Admin Upload Section**: PhotoUploader visible only to admins
- **Photo Gallery**: View all photos in responsive grid
- **Lightbox Preview**: Click photos to enlarge
- **Loading States**: Proper loading indicators
- **No DataContext Dependency**: Uses new Supabase hooks

#### User Experience
- **Regular Users**: See photo gallery only
- **Admin Users**: See upload form + gallery

#### Layout
```
Photos Page
├── Header (Title & Description)
├── Admin Upload Section (if isAdmin)
│   └── PhotoUploader Component
└── Photos Gallery
    ├── Loading Spinner OR
    ├── Empty State OR
    └── Photo Grid + Lightbox
```

---

## Hooks Integration

### useUploadPhoto
```typescript
const { mutate: uploadPhoto, isPending, data } = useUploadPhoto();

uploadPhoto({
  file: File,
  matchId?: string,
  uploadedBy: string,
});
```

### usePhotos
```typescript
const { data: photos, isLoading } = usePhotos();
// Returns: PhotoRecord[] (all photos)
```

### usePhotosByMatch
```typescript
const { data: photos, isLoading } = usePhotosByMatch('match-123');
// Returns: PhotoRecord[] (filtered by match)
```

### useDeletePhoto
```typescript
const { mutate: deletePhoto, isPending } = useDeletePhoto();

deletePhoto({
  photoId: string,
  storagePath: string,
});
```

---

## Service Functions

### uploadPhoto (Single)
```typescript
await uploadPhoto({
  file: File,
  matchId?: string,
  uploadedBy: string,
});
// Returns: UploadPhotoResponse
```

### uploadPhotos (Batch)
```typescript
await uploadPhotos(
  files: File[],
  matchId?: string,
);
// Returns: UploadPhotoResponse
```

### fetchPhotos
```typescript
const photos = await fetchPhotos();
// Returns: PhotoRecord[]
```

### fetchPhotosByMatch
```typescript
const photos = await fetchPhotosByMatch('match-123');
// Returns: PhotoRecord[]
```

### deletePhoto
```typescript
const response = await deletePhoto(photoId, storagePath);
// Deletes from Storage and Database
```

### updatePhotoMetadata
```typescript
const response = await updatePhotoMetadata(photoId, {
  title?: string,
  description?: string,
});
```

---

## Database Schema

### photos table (Supabase)
```sql
create table photos (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id) on delete set null,
  url text not null,
  title text,
  description text,
  file_name text not null,
  file_size integer not null,
  file_type text not null,
  storage_path text not null,
  uploaded_by uuid not null references auth.users(id),
  created_at timestamp default now(),
  updated_at timestamp default now()
);
```

---

## File Upload Process

### Step 1: Client Validation
- Check file type (JPEG, PNG, GIF, WebP)
- Check file size (< 5MB)
- Require authentication

### Step 2: Upload to Supabase Storage
- Generate unique filename: `photos/{match_id}/{timestamp}-{unique_id}.{ext}`
- Upload file to "photos" bucket
- Get public URL automatically

### Step 3: Save Metadata to Database
- Store photo record with URL and metadata
- Track uploader (user ID)
- Store file information (size, type)

### Step 4: Error Handling
- If database insert fails, automatically delete from Storage
- Return detailed error messages
- Preserve user workflow

---

## Type Definitions

```typescript
interface PhotoRecord {
  id: string;
  match_id?: string;
  url: string;
  title?: string;
  description?: string;
  file_name: string;
  file_size: number;
  file_type: string;
  storage_path: string;
  uploaded_by: string;
  created_at: string;
  updated_at?: string;
}

interface PhotoUploadData {
  file: File;
  matchId?: string;
  uploadedBy: string;
}

interface UploadPhotoResponse {
  success: boolean;
  message: string;
  data?: PhotoRecord;
  url?: string;
  error?: string;
}
```

---

## User Permissions

### Regular Users
- ✅ View all photos in gallery
- ✅ View match-specific photos
- ✅ Lightbox preview
- ❌ Upload photos
- ❌ Delete photos

### Admin Users
- ✅ View all photos
- ✅ Upload single/multiple photos
- ✅ Delete own photos
- ✅ Filter by match
- ✅ Update photo metadata
- ✅ Full gallery management

---

## Styling & Animation

### Colors & Theme
- Uses Tailwind CSS with custom card styling
- Respects dark/light mode from system preference
- Card backgrounds: `bg-card`
- Borders: `border-border`

### Animations (Framer Motion)
- Photo grid: Staggered entrance animations
- Upload zone: Highlight on drag
- Lightbox: Scale + fade transitions
- Delete: Smooth exit animation

### Responsive Design
```
Mobile  (< 640px):  2 columns
Tablet  (640-1024): 3 columns
Desktop (> 1024):   4 columns
```

---

## Integration with Existing Pages

### Photos Page
Already integrated with PhotoUploader and MatchPhotos

### Scorecard Page (Option)
```typescript
import MatchPhotos from '@/components/MatchPhotos';

// In Scorecard component:
<MatchPhotos matchId={currentMatch.id} allowDelete={false} />
```

### Admin Pages
```typescript
import PhotoUploader from '@/components/PhotoUploader';

// In PhotosAdmin component:
<PhotoUploader onUploadSuccess={refetch} />
```

---

## Error Handling

### Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "File too large" | File > 5MB | Compress image before upload |
| "Invalid file type" | Not image format | Select JPEG/PNG/GIF/WebP |
| "Not authenticated" | User not logged in | Login required for upload |
| "Storage upload failed" | Network issue | Retry upload |
| "Database error" | Storage insertion failed | Auto-cleanup attempted |

### User Feedback
- Success: Green checkmark + message
- Error: Red alert + detailed error text
- Loading: Spinner animation

---

## Performance Optimization

### Current Implementation
- React Query caching (5-minute stale time)
- Auto-invalidation on mutations
- Lazy image loading
- Optimized grid rendering

### Future Enhancements
- Image compression before upload
- Thumbnail generation
- Batch operation optimization
- Pagination for large galleries
- Search and filter functionality

---

## Security Considerations

### Authentication
- ✅ All uploads require user authentication
- ✅ User ID tracked automatically
- ❌ Public read access to photos (configurable with RLS)

### Authorization
- ✅ Only uploaders can delete their photos
- ✅ Match ownership can be enforced
- ⏳ Row-Level Security (RLS) policies pending

### File Validation
- ✅ File type checking
- ✅ File size limits
- ✅ Filename sanitization

---

## Testing Checklist

- [ ] Upload single photo
- [ ] Upload multiple photos
- [ ] View photos in gallery
- [ ] Delete own photo
- [ ] Cannot delete others' photos
- [ ] File type validation
- [ ] File size validation
- [ ] Match filtering
- [ ] Lightbox preview
- [ ] Responsive layout
- [ ] Error messages display
- [ ] Loading states show
- [ ] Admin/user permissions work

---

## Next Steps

1. **Create Database Schema**: Run SQL migration in Supabase
2. **Set Row-Level Security**: Protect data at DB level
3. **Add Image Compression**: Optimize before upload
4. **Implement Search**: Add photo search functionality
5. **Add Metadata Editor**: Edit title/description
6. **Performance Monitoring**: Track upload times

