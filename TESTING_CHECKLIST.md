# Website & Database Testing Checklist

## Environment Setup
- ✅ Environment variables configured: `.env.local`
  - `VITE_SUPABASE_URL` - Set
  - `VITE_SUPABASE_ANON_KEY` - Set

## Test 1: Login / Authentication
- [ ] Open http://localhost:5173 (dev server)
- [ ] Click "Admin Login"
- [ ] Try login with invalid credentials (should show error)
- [ ] Login with valid admin account
- [ ] Verify you can access dashboard
- [ ] **Expected**: Session stored in localStorage

## Test 2: Database Read Operations (Tables)
- [ ] Go to Players page
  - [ ] Verify players list loads from database
  - [ ] Check that data displays correctly
- [ ] Go to Teams page
  - [ ] Verify teams list loads from database
  - [ ] Check team details
- [ ] Go to Matches page
  - [ ] Verify matches load
  - [ ] Check live scores update
- [ ] Go to News page
  - [ ] Verify news articles load from database

## Test 3: Database Create Operations
- [ ] **Add Photo**:
  - [ ] Go to Photos section
  - [ ] Upload a test image
  - [ ] Verify it appears in the list immediately
  - [ ] Check in Supabase: Photo should be in `photos` table
  - [ ] Verify `uploaded_by` = your user ID
  - [ ] Verify timestamp is recent

- [ ] **Add Player** (Admin only):
  - [ ] Go to Admin → Players
  - [ ] Add a new player
  - [ ] Verify it appears in players list
  - [ ] Check in Supabase: Player should be in `players` table

- [ ] **Add Team** (Admin only):
  - [ ] Go to Admin → Teams
  - [ ] Add a new team
  - [ ] Verify it appears in teams list
  - [ ] Check in Supabase: Team should be in `teams` table

## Test 4: Database Update Operations
- [ ] **Edit Player**:
  - [ ] Go to admin, edit an existing player
  - [ ] Change a field (e.g., jersey number)
  - [ ] Save changes
  - [ ] Verify update appears immediately on page
  - [ ] Check in Supabase: Data is updated

- [ ] **Edit Team**:
  - [ ] Edit team details
  - [ ] Save changes
  - [ ] Verify in database

## Test 5: Database Delete Operations ⭐ (CRITICAL FIX)
- [ ] **Delete Photo** (This was the bug fix):
  - [ ] Go to Photos section
  - [ ] Click delete on a photo you uploaded
  - [ ] **Verify in Supabase**:
    - [ ] Go to Supabase Dashboard → SQL Editor
    - [ ] Run: `SELECT * FROM photos WHERE id = '<your_photo_id>';`
    - [ ] Result should be: **"No rows" (photo is deleted)**
  - [ ] **Cross-Device Test**:
    - [ ] Open another browser tab (or private window)
    - [ ] Login as different user
    - [ ] Refresh photos page
    - [ ] Verify deleted photo does NOT appear
    - [ ] **Expected**: Delete persists across devices ✅

- [ ] **Admin Delete Photo**:
  - [ ] As admin, try to delete a photo uploaded by another user
  - [ ] **Expected**: Should work successfully (bug fix)
  - [ ] Verify deletion in Supabase: Photo gone from database

- [ ] **Delete Player**:
  - [ ] As admin, delete a player
  - [ ] Verify removal from list
  - [ ] Check Supabase: Player removed from `players` table

## Test 6: Real-Time Sync
- [ ] Open app in 2 browser windows (side-by-side)
  - [ ] Window A: Login
  - [ ] Window B: Login (as different user or same)
  - [ ] Window A: Add/Delete something
  - [ ] Window B: Check if data updates in **real-time** (without refresh)
  - [ ] **Expected**: Changes appear instantly on both windows

## Test 7: File Storage
- [ ] Upload a photo
- [ ] Verify it displays
- [ ] Go to Supabase Storage → photos bucket
- [ ] Verify file exists there
- [ ] Download file from storage → should work

## Test 8: Error Handling
- [ ] Open browser console (F12 → Console tab)
- [ ] Perform all operations above
- [ ] **Expected**: No red error messages
- [ ] **Warnings** are OK (yellow), but critical errors are NOT

## Test 9: Performance
- [ ] Check that pages load within 2 seconds
- [ ] Database queries responsive (< 1 second)
- [ ] No UI lag when interacting

## Test 10: Mobile Responsiveness
- [ ] Open DevTools (F12)
- [ ] Toggle device toolbar (mobile view)
- [ ] Verify all pages work on mobile
- [ ] Check that photos, forms display correctly

---

## Verification Results

### Database Connection Status
- [ ] Can read data? **(YES/NO)**
- [ ] Can create data? **(YES/NO)**
- [ ] Can update data? **(YES/NO)**
- [ ] Can delete data? **(YES/NO)**

### Overall Status
- **Website Working?** _________
- **Database Connected?** _________
- **Real-Time Sync Working?** _________
- **Delete Function Working?** _________ (This was the recent fix)

---

## If You Find Issues:

### Issue: Blank Page / 404 Error
- Solution: Make sure dev server is running (`npm run dev`)
- Check: F12 Console for errors

### Issue: "Cannot connect to database"
- Solution: Verify `.env.local` has correct Supabase credentials
- Check: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

### Issue: Delete not working
- Solution: Check Supabase RLS policies are enabled
- Run in Supabase SQL Editor:
  ```sql
  SELECT tablename, rowsecurity 
  FROM pg_tables 
  WHERE schemaname='public';
  ```
- All should show `rowsecurity = true` (RLS enabled)

### Issue: Real-time updates not working
- Solution: Open browser console, check for subscription errors
- Verify RLS policies allow read/delete operations

---

## Notes
- Keep this file for future testing
- Update status after each test run
- Document any bugs found
