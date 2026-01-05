# Cloud Build Feature - Manual Testing Guide

## Prerequisites
✅ Cloud Function deployed: `triggerCloudBuild`  
✅ Dev server running: http://localhost:3000  
✅ Firebase Authentication configured  

## Test Steps

### Step 1: Access Build Page
1. Open browser and navigate to: **http://localhost:3000/build**
2. You should see three tabs:
   - ✅ Download Pre-built (green)
   - ✅ Build Locally (blue)
   - ✅ **Cloud Build** (purple) ← Click this one

### Step 2: Verify Cloud Build Tab Content
After clicking "Cloud Build", you should see:

**If NOT logged in:**
- Purple card with lock icon
- Title: "Authentication Required"
- Message: "Please sign in to start a cloud build..."
- Button: "Sign In to Continue"
- ✅ **No "Coming Soon" message** (this was the bug!)

**If logged in:**
- Purple header with lightning bolt icon
- Title: "Cloud Build"
- Subtitle: "Build LFS on Google Cloud infrastructure"
- Blue info box showing: "Logged in as [your email]"
- Full build form with all fields

### Step 3: Sign In
1. Click **"Sign In to Continue"** button
2. Google sign-in popup should appear
3. Select your Google account
4. After successful authentication, page should reload showing the build form

### Step 4: Fill Out Build Form
The form should have these fields:

**Required:**
- ✅ **Project Name** (text input) - e.g., "my-test-build"

**Configuration:**
- ✅ **LFS Version** (dropdown) - 12.0 or 12.1
- ✅ **Kernel Version** (text input) - default "6.4.12"
- ✅ **Optimization** (dropdown) - O2, O3, or Os

**Options (checkboxes):**
- ✅ **Enable Networking Tools** (checked by default)
- ✅ **Enable Debug Symbols** (unchecked by default)

**Optional:**
- ✅ **Additional Notes** (textarea)

**Info Section:**
- Estimated time: 4-6 hours
- Build environment: Google Cloud Run (8 CPU, 32GB RAM)
- One active build per user

### Step 5: Submit Build
1. Fill in at minimum the **Project Name** field
2. Click **"Start Cloud Build"** button (purple gradient)
3. Button should show loading state: "Starting Build..."
4. If successful:
   - Should redirect to `/build/{buildId}` page
   - Check URL bar for build ID (20-character alphanumeric)

### Step 6: Verify Build Created
**Option A: Check Firestore Console**
1. Open: https://console.firebase.google.com/project/alfs-bd1e0/firestore
2. Navigate to `builds` collection
3. Find document with your build ID
4. Should have fields:
   - `userId`: Your Firebase UID
   - `email`: Your email
   - `projectName`: What you entered
   - `status`: Should start as "SUBMITTED" → "PENDING" → "RUNNING"
   - `submittedAt`: Timestamp
   - `buildOptions`: Your configuration

**Option B: Check Browser Console**
1. Open browser DevTools (F12)
2. Check Console tab for any errors
3. Check Network tab for `/api/cloud-build` request:
   - Status should be `201 Created`
   - Response should include `buildId` and `success: true`

### Step 7: Monitor Build Progress
After redirection to `/build/{buildId}`:
- Should see build monitoring page
- Status updates in real-time
- Can view logs as they come in
- Can see build stages complete

## Expected Results

### ✅ Success Indicators
- [x] No "Coming Soon" message visible
- [x] Cloud Build tab shows full CloudBuildForm component
- [x] Authentication works (Google sign-in popup)
- [x] Form validation works (required fields)
- [x] Submit creates Firestore document
- [x] Redirect to monitoring page happens
- [x] Build pipeline triggers automatically

### ❌ Possible Issues

#### Issue 1: Still seeing "Coming Soon"
**Solution:**
```bash
# Clear cache and restart dev server
cd lfs-learning-platform
rm -rf .next
npm run dev
```

#### Issue 2: "Failed to start cloud build" error
**Possible causes:**
- Cloud Function not deployed
- Authentication token invalid
- Network issue

**Check:**
1. Verify function deployed: https://console.firebase.google.com/project/alfs-bd1e0/functions
2. Check browser console for error details
3. Check function logs: `firebase functions:log --only triggerCloudBuild`

#### Issue 3: "You already have an active build"
**This is expected behavior!**
- Only one build allowed per user at a time
- Wait for previous build to complete
- Or manually update status in Firestore to "SUCCESS" or "FAILED"

#### Issue 4: Form doesn't appear after login
**Solution:**
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cache
- Try incognito/private browsing mode

## Testing Checklist

- [ ] Build page loads without errors
- [ ] Three tabs visible (Download, Local, Cloud)
- [ ] Click Cloud Build tab
- [ ] **No "Coming Soon" text** appears ✨
- [ ] Login prompt shows for unauthenticated users
- [ ] Google sign-in popup works
- [ ] After login, full form appears
- [ ] All form fields are editable
- [ ] Submit button is clickable (not disabled)
- [ ] Form submission shows loading state
- [ ] Redirects to `/build/{buildId}` on success
- [ ] Firestore document created with correct data
- [ ] Build pipeline triggers (status changes to PENDING/RUNNING)
- [ ] No console errors in browser DevTools

## Quick Command Reference

```bash
# Start dev server
cd lfs-learning-platform
npm run dev

# Clear cache
rm -rf .next .netlify

# View function logs
firebase functions:log --only triggerCloudBuild

# Deploy to production
netlify deploy --prod

# Check Firestore
# Visit: https://console.firebase.google.com/project/alfs-bd1e0/firestore
```

## Success Screenshot Checklist

Take screenshots for documentation:
1. 📸 Build page with Cloud Build tab selected
2. 📸 Authentication required card (not logged in)
3. 📸 Full build form (logged in)
4. 📸 Form filled out with test data
5. 📸 Submit button clicked (loading state)
6. 📸 Redirect to monitoring page
7. 📸 Firestore document in console

## Next Steps After Testing

Once manual testing confirms everything works:

1. **Deploy to Production:**
   ```bash
   cd lfs-learning-platform
   netlify deploy --prod
   ```

2. **Update Documentation:**
   - Add screenshots to thesis documentation
   - Update user guide with cloud build instructions
   - Create video tutorial (optional)

3. **Monitor Production:**
   - Watch Cloud Function logs for errors
   - Check Cloud Run Job executions
   - Monitor build success rate

4. **Collect Feedback:**
   - Test with real users
   - Gather UX feedback on form
   - Optimize build process based on usage

---

🎉 **Cloud Build feature is now fully functional!**  
No more "Coming Soon" - users can now trigger real cloud builds!
