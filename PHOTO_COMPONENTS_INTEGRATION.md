# Photo Components - Quick Integration Guide

## For Scorecard Page

Add to `src/pages/Scorecard.tsx`:

```typescript
import MatchPhotos from '@/components/MatchPhotos';

// Inside your match component, add after scorecard data:
<div className="mt-8">
  <h3 className="text-xl font-bold mb-4">Match Photos</h3>
  <MatchPhotos matchId={matchId} allowDelete={false} />
</div>
```

---

## For Admin Pages

### PhotosAdmin Component
`src/components/admin/PhotosAdmin.tsx`:

```typescript
import PhotoUploader from '@/components/PhotoUploader';
import { useMatches } from '@/hooks/useMatches';

export default function PhotosAdmin() {
  const { data: matches } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Photo Management</h2>
      
      {/* Match Selector */}
      <div>
        <label className="block text-sm font-medium mb-2">Select Match (Optional)</label>
        <select 
          value={selectedMatch || ''} 
          onChange={(e) => setSelectedMatch(e.target.value || null)}
          className="w-full px-3 py-2 border border-border rounded-lg"
        >
          <option value="">All Photos</option>
          {matches?.map(match => (
            <option key={match.id} value={match.id}>
              {match.team_a} vs {match.team_b}
            </option>
          ))}
        </select>
      </div>

      {/* Photo Uploader */}
      <PhotoUploader matchId={selectedMatch} />
    </div>
  );
}
```

---

## For Matches List

Show photo count next to each match:

```typescript
import { usePhotosByMatch } from '@/hooks/usePhotos';
import { ImageIcon } from 'lucide-react';

function MatchCard({ match }) {
  const { data: photos } = usePhotosByMatch(match.id);

  return (
    <div className="card">
      {/* Match info */}
      {photos && photos.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <ImageIcon className="w-4 h-4" />
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </div>
      )}
    </div>
  );
}
```

---

## For News/Updates

Show latest match photos:

```typescript
import MatchPhotos from '@/components/MatchPhotos';

export default function LatestMatchPhotos() {
  const { data: matches } = useMatches();
  const latestMatch = matches?.[0];

  if (!latestMatch) return null;

  return (
    <div className="bg-card rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4">Latest Match Photos</h3>
      <MatchPhotos matchId={latestMatch.id} allowDelete={false} />
    </div>
  );
}
```

---

## PhotoUploader in Modal

```typescript
import { useState } from 'react';
import PhotoUploader from '@/components/PhotoUploader';
import { Dialog, DialogContent } from '@/components/ui/dialog';

export default function UploadPhotosModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Upload Photos</button>
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <PhotoUploader 
            onUploadSuccess={() => setIsOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
```

---

## Conditional Rendering by Role

```typescript
import { useAuth } from '@/context/AuthContext';
import PhotoUploader from '@/components/PhotoUploader';
import MatchPhotos from '@/components/MatchPhotos';

export default function PhotosSection({ matchId }) {
  const { isAdmin } = useAuth();

  return (
    <div className="space-y-6">
      {/* Admin: Upload + view */}
      {isAdmin && <PhotoUploader matchId={matchId} />}

      {/* Everyone: View photos */}
      <MatchPhotos matchId={matchId} allowDelete={isAdmin} />
    </div>
  );
}
```

---

## Key Props Reference

### PhotoUploader
```typescript
<PhotoUploader 
  matchId="optional-match-id"
  onUploadSuccess={() => {
    // Callback when upload completes
  }}
/>
```

### MatchPhotos
```typescript
<MatchPhotos 
  matchId="required-match-id"
  allowDelete={true}  // default: true
/>
```

---

## Common Patterns

### Pattern 1: Upload + View in Admin
```typescript
<PhotoUploader matchId={matchId} />
```

### Pattern 2: View Only (Public)
```typescript
<MatchPhotos matchId={matchId} allowDelete={false} />
```

### Pattern 3: Gallery Manager
```typescript
<PhotoUploader />  // No matchId = all photos
```

### Pattern 4: Match-Specific Gallery
```typescript
<MatchPhotos matchId={matchId} />  // With delete
```

---

## Styling Customization

Both components use Tailwind CSS. To customize:

1. **Colors**: Modify `bg-card`, `border-border`, `text-foreground` in components
2. **Grid Size**: Change `grid grid-cols-` classes
3. **Animations**: Adjust Framer Motion `transition` props
4. **Spacing**: Update padding/margin values

---

## Hooks Reference

```typescript
// Upload photos
const { mutate: uploadPhoto, isPending } = useUploadPhoto();

// Get all photos
const { data: photos, isLoading } = usePhotos();

// Get match photos
const { data: photos } = usePhotosByMatch('match-123');

// Delete photo
const { mutate: deletePhoto, isPending } = useDeletePhoto();

// Update metadata
const { mutate: updateMetadata } = useUpdatePhotoMetadata();
```

---

## Error Handling in Integrations

```typescript
import { useUploadPhoto } from '@/hooks/usePhotos';

export default function MyComponent() {
  const { mutate: uploadPhoto, error } = useUploadPhoto();

  if (error) {
    return <div className="error">{error.message}</div>;
  }

  return <PhotoUploader />;
}
```

---

## Real-Time Updates

Photos automatically update when:
- New photo uploaded
- Photo deleted
- Metadata changed

Because we use React Query cache invalidation in mutations.

---

## Performance Tips

1. **Use `allowDelete={false}`** for public views
2. **Lazy load** match photos only when needed
3. **Paginate** large photo galleries
4. **Compress** images before upload (future enhancement)
5. **Cache** with React Query (already implemented)

