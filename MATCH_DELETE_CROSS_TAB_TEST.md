# Match Deletion Cross-Tab Sync Test

## Test Scenario: Delete Match & Verify Across Tabs

### Prerequisites
- ✅ Dev server running: http://localhost:8081/
- ✅ Admin logged in
- ✅ Supabase database connected
- ✅ At least 1 match exists in database

---

## Step-by-Step Test

### Step 1: Open Tab A (First Browser Tab)
```
1. Open: http://localhost:8081/
2. Login as Admin
3. Go to: Matches page
4. View all matches
5. Note down a match to delete (e.g., "SRP vs Mumbai")
```

### Step 2: Delete Match in Tab A
```
1. In Tab A → Matches page
2. Find the match you want to delete
3. Click "Delete" button
4. Confirm deletion
5. Verify match disappears from Tab A list
   Expected: ✅ Match removed from UI instantly
```

### Step 3: Check Database (Supabase)
```
1. Open Supabase Dashboard in new tab
2. Go to: Project → SQL Editor
3. Run this query:
   SELECT * FROM matches WHERE id = '<match_id>';
4. Expected Result:
   ✅ "No rows" message = Match deleted from database
   ❌ If row exists = Deletion failed
```

### Step 4: Open Tab B (New Browser Tab - SAME USER)
```
1. Open new tab: http://localhost:8081/
2. Automatically logged in (session persists)
3. Go to: Matches page
4. Expected Behavior:
   ✅ Deleted match NOT in the list (synced via Realtime)
   ❌ Match still shows = Sync not working
```

### Step 5: Verify Real-Time Sync
```
1. Keep both Tab A and Tab B open
2. In Tab A: Add a new match
3. Watch Tab B (without clicking refresh)
4. Expected:
   ✅ New match appears in Tab B within 1 second (Realtime)
   ❌ Doesn't appear = Real-time subscription not working
```

### Step 6: Browser Console Check (Optional)
```
1. In Tab A: Press F12 → Console
2. Look for errors:
   ✅ No red errors = Good
   ⚠️ Warnings OK (yellow)
   ❌ Red errors = Problem
3. Check for messages like:
   - "Subscription to matches failed" = Sync issue
   - "Delete error" = Delete issue
```

---

## Expected Results

### ✅ Successful (Database-Only Storage Working)

**Tab A After Delete:**
- Match removed from list ✓
- UI updates instantly ✓

**Database Check:**
- Query returns "No rows" ✓
- Match completely removed ✓

**Tab B (New Tab):**
- Match does NOT appear ✓
- Sync happened automatically (no refresh) ✓
- Real-time subscription working ✓

---

### ❌ Failed (Something Wrong)

| Issue | Cause | Solution |
|-------|-------|----------|
| Match still shows in new tab | Real-time sync broken | Check Supabase subscription |
| Match in database after "delete" | Delete didn't work | Check browser console for errors |
| Takes 5+ seconds to sync | Network lag | Check internet connection |
| Console shows red errors | Application error | See error details below |

---

## Troubleshooting Errors

### Error: "RLS policy denied access"
```
Problem: Delete failed due to Supabase Row Level Security
Check: 
  - Are you admin user?
  - Does RLS policy allow admin delete?
Solution:
  - Go to Supabase → Auth → Users
  - Confirm user has admin role
  - Check RLS policy allows this user
```

### Error: "Match not found"
```
Problem: Trying to delete match that doesn't exist
Check:
  - Is the match ID correct?
  - Was it already deleted?
Solution:
  - Refresh page and try with different match
```

### Error: "Cannot read property 'id' of undefined"
```
Problem: Component state issue
Check:
  - Matches loaded properly?
  - Data structure correct?
Solution:
  - Hard refresh (Ctrl+F5)
  - Check Network tab for failed API calls
```

### Real-Time Sync Not Working
```
Problem: Tab B doesn't show deleted match
Check:
  - Are both tabs logged in to same account?
  - Is internet connected?
  - Check Network tab → Filter "WSS" (WebSocket)
Solution:
  - Verify WebSocket connection to Supabase
  - Check if subscription error in console
```

---

## Network Inspection (Advanced)

### Check if Delete API Call Succeeds

```
1. Tab A: F12 → Network tab
2. Filter for: "matches" or "api"
3. Delete the match
4. Look for request:
   POST /rest/v1/matches?id=eq.<match_id> → DELETE
5. Check Response:
   Status: 200 OK ✅ = Success
   Status: 403 Forbidden ❌ = RLS denied
   Status: 404 Not Found ❌ = Match not found
```

### Check Real-Time Subscription

```
1. F12 → Network → Filter "WSS"
2. Look for: "realtime.supabase.co"
3. If exists:
   ✅ Real-time subscription active
4. Send Test Message:
   Click match delete in Tab A
   Watch WebSocket tab for messages
   Should see postgres_changes event
```

---

## Test Results Template

### Fill This Out After Testing

```
TEST RESULTS
============

Date: _______________
Test Environment: Local (http://localhost:8081/)
User: Admin

1. Delete Match in Tab A
   Result: [ ] Success [ ] Failed
   Reason: ___________________

2. Database Check (Supabase)
   Match deleted: [ ] Yes [ ] No
   Query result: ___________________

3. Tab B Check (New Tab)
   Match appears: [ ] Yes [ ] No
   Expected: [ ] No (correct)

4. Real-Time Sync
   Sync time: _____ seconds
   Working: [ ] Yes [ ] No

5. Console Errors
   Any errors: [ ] Yes [ ] No
   If yes: ___________________

OVERALL RESULT: 
[ ] ✅ ALL TESTS PASSED - Database sync working!
[ ] ⚠️ PARTIAL - Some features working
[ ] ❌ FAILED - Issues detected
```

---

## Summary

### What This Test Verifies
✅ Database-only storage working
✅ Delete operation successful
✅ Real-time sync between tabs
✅ No localStorage caching
✅ Cross-tab synchronization

### If All Passes
- Delete works perfectly ✅
- Database updated immediately ✅
- All tabs see changes instantly ✅
- Ready for production ✅

### If Something Fails
- Review troubleshooting guide
- Check browser console for errors
- Verify Supabase connection
- Check RLS policies
- Look at Network tab for failed calls

---

## Commands for Testing

### Run Dev Server (if not running)
```bash
npm run dev
```

### Build for Production Test
```bash
npm run build
```

### Check Git Status
```bash
git status
```

### View Latest Commits
```bash
git log --oneline -10
```
