# 🚀 Supabase Cricket App - Developer Quick Start

**Everything You Need to Know in 2 Minutes**

---

## 🔑 Quick Setup

### 1. Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database (Copy-Paste into Supabase SQL)
See `SUPABASE_INTEGRATION_FULL.md` → Database Schema section

### 3. Start Dev Server
```bash
npm run dev
```

---

## 📦 What Services Exist?

| Service | Import | Main Functions |
|---------|--------|-----------------|
| **Auth** | `src/lib/auth` | signUp, signIn, signOut |
| **Matches** | `src/lib/matches` | createMatch, updateMatch, fetchMatches |
| **Players** | `src/lib/players` | createPlayer, fetchPlayers, getPlayerStats |
| **Teams** | `src/lib/teams` | createTeam, fetchTeams, getTeamRoster |
| **Balls** | `src/lib/balls` | insertBall, fetchBallsByMatch |
| **Photos** | `src/lib/photos` | uploadPhoto, fetchPhotos, deletePhoto |

---

## 🎣 What Hooks Do I Use?

### Authentication
```typescript
import { useAuth } from '@/context/AuthContext';
const { user, isAdmin, login, logout } = useAuth();
```

### Data Operations
```typescript
// Matches
import { useMatches, useCreateMatch } from '@/hooks/useMatches';
const { data: matches } = useMatches();
const { mutate: createMatch } = useCreateMatch();

// Players
import { usePlayers, useCreatePlayer } from '@/hooks/usePlayers';
const { data: players } = usePlayers();
const { mutate: createPlayer } = useCreatePlayer();

// Teams
import { useTeams, useCreateTeam } from '@/hooks/useTeams';
const { data: teams } = useTeams();

// Photos
import { usePhotos, useUploadPhoto } from '@/hooks/usePhotos';
const { data: photos } = usePhotos();
const { mutate: uploadPhoto } = useUploadPhoto();
```

### Real-time
```typescript
import { useBallsRealtime } from '@/hooks/useRealtime';
const { data: balls, isConnected } = useBallsRealtime(matchId);
```

---

## 🏗️ Common Patterns

### Fetch Data
```typescript
const { data, isLoading, error } = useMatches();

if (isLoading) return <Spinner />;
if (error) return <Error message={error.message} />;

return <div>{data?.map(m => <Match key={m.id} match={m} />)}</div>;
```

### Create Data (Admin)
```typescript
const { mutate: createMatch, isPending } = useCreateMatch();

const handleCreate = () => {
  createMatch(matchData, {
    onSuccess: () => showToast('Created!'),
    onError: (err) => showToast(`Error: ${err.message}`),
  });
};

return <button onClick={handleCreate}>{isPending ? 'Creating...' : 'Create'}</button>;
```

### Upload File
```typescript
const { mutate: uploadPhoto } = useUploadPhoto();

const handleUpload = (file: File) => {
  uploadPhoto({
    file,
    matchId: 'optional',
    uploadedBy: user.id,
  });
};
```

### Real-time Subscription
```typescript
const { data: balls, isConnected } = useBallsRealtime(matchId);

return (
  <div>
    <StatusBadge connected={isConnected} />
    {balls?.map(ball => <Ball key={ball.id} ball={ball} />)}
  </div>
);
```

---

## 🔒 Protected Routes

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

<ProtectedRoute requiredRole="admin">
  <AdminPanel />
</ProtectedRoute>
```

Or use hook:
```typescript
import { useProtectedRoute } from '@/hooks/useProtectedRoute';

const { hasAccess } = useProtectedRoute('admin');
if (!hasAccess) return <AccessDenied />;
```

---

## 📊 Common Use Cases

### Display All Players
```typescript
import { usePlayers } from '@/hooks/usePlayers';

export default function Players() {
  const { data: players } = usePlayers();
  return <PlayerGrid players={players} />;
}
```

### Add Player to Team
```typescript
import { useAddPlayerToTeam } from '@/hooks/useTeams';

const { mutate } = useAddPlayerToTeam();
mutate({ teamId, playerId, jerseyNumber: 7 });
```

### Record Ball in Match
```typescript
import { useInsertBall } from '@/hooks/useBalls';

const { mutate } = useInsertBall();
mutate({
  matchId,
  overNumber: 5,
  ballNumber: 3,
  runs: '4',
  batterId,
  bowlerId,
});
```

### Upload Match Photos
```typescript
import { useUploadPhoto } from '@/hooks/usePhotos';

const { mutate } = useUploadPhoto();
files.forEach(file => {
  mutate({ file, matchId, uploadedBy: user.id });
});
```

---

## 🧪 Testing Credentials

```
Email: test@example.com
Password: Any password you set

Admin Email: ppavankalyan3306@gmail.com
Password: X8*?Y4%5f-CpF%h
```

---

## 📚 Where to Find Things

| Need | File | Type |
|------|------|------|
| Service functions | `src/lib/{name}.ts` | TypeScript |
| React hooks | `src/hooks/{name}.ts` | TypeScript |
| UI components | `src/components/*.tsx` | React |
| Page components | `src/pages/*.tsx` | React |
| Type definitions | `src/types/cricket.ts` | TypeScript |
| Authentication state | `src/context/AuthContext.tsx` | React Context |

---

## 🆘 Debugging Tips

### Issue: Data not loading
```typescript
// Check if using wrong hook
const { data } = useMatches(); // Correct
const { matches } = useMatches(); // Wrong - returns null
```

### Issue: Updates not reflecting
```typescript
// Make sure to handle success
onSuccess: () => {
  // React Query auto-invalidates, but you can force refresh too
  queryClient.invalidateQueries({ queryKey: ['matches'] });
}
```

### Issue: Auth not working
```typescript
// Check if wrapped in AuthProvider
<AuthProvider>
  <App />
</AuthProvider>
```

### Issue: Realtime not updating
```typescript
// Make sure match is live
if (match?.status !== 'live') return null;
const { data } = useBallsRealtime(matchId); // Only works if match is live
```

---

## ⚡ Performance Tips

1. **Use specific hooks**
   ```typescript
   // ✅ Good - only fetches one player
   const { data: player } = usePlayer(playerId);
   
   // ❌ Bad - fetches all players
   const { data: players } = usePlayers();
   ```

2. **Enable conditional fetching**
   ```typescript
   // ✅ Good - only fetches when ID exists
   const { data } = usePlayer(id);
   
   // ❌ Bad - tries to fetch undefined
   const { data } = usePlayer(id, { enabled: !!id });
   ```

3. **Use pagination for large data**
   ```typescript
   // Architecture ready for pagination
   // Add limit/offset parameters when implementing
   ```

---

## 🚀 Deployment Checklist

- [ ] Database tables created
- [ ] RLS policies configured
- [ ] Admin user created
- [ ] Environment variables set (production)
- [ ] Storage bucket created (photos)
- [ ] Email verification enabled
- [ ] Monitoring set up
- [ ] Backups configured

---

## 📖 Full Documentation

- **Complete Setup**: `SUPABASE_INTEGRATION_FULL.md`
- **Players & Teams**: `PLAYERS_TEAMS_INTEGRATION.md`
- **Photos**: `PHOTO_SYSTEM_GUIDE.md`
- **Summary**: `SUPABASE_INTEGRATION_SUMMARY.md`

---

## 🎯 Most Important Files

```
src/lib/auth.ts              ← Authentication logic
src/context/AuthContext.tsx  ← Global auth state
src/lib/matches.ts           ← Match operations
src/hooks/useMatches.ts      ← Match hooks
src/components/ProtectedRoute.tsx ← Route protection
src/pages/Login.tsx          ← Login UI
```

---

## 💡 Pro Tips

1. **Always check loading state**
   ```typescript
   if (isLoading) return <Spinner />;
   ```

2. **Always handle errors**
   ```typescript
   if (error) return <ErrorMessage error={error} />;
   ```

3. **Use TypeScript for autocompletion**
   - Hover over objects to see available fields
   - TS will catch typos at compile time

4. **Check React Query DevTools** (in production mode)
   - Shows all queries and their cache state
   - Helps debug data issues

5. **Use Supabase Studio to inspect database**
   - See all data in real-time
   - Test SQL queries
   - View logs

---

## 📞 Emergency Contacts

| Issue | Check | Doc |
|-------|-------|-----|
| Auth failing | .env.local vars | SUPABASE_INTEGRATION_FULL.md |
| Data not showing | Hook import path | Service-specific guide |
| Real-time not working | Match status == 'live' | PHOTO_SYSTEM_GUIDE.md |
| Upload failing | File type/size | PHOTO_SYSTEM_GUIDE.md |
| Permission error | User role/RLS | SUPABASE_INTEGRATION_FULL.md |

---

**You're all set! Happy coding! 🚀**

