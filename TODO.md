# Admin Inline News Editing - Implementation Steps

## Step 1: Edit `src/views/public/NewsView.vue`
- [x] Plan approved
- [x] Import `useAuthStore`, `supabase`, `slugify`, `newsPostSelect`, `normalizeMediaUrl`
- [x] Add reactive state: `adminEditMode`, `editingCardId`, `addFormOpen`, `editFormData`
- [x] Add computed `isAdmin` from auth store
- [x] Add Admin Edit Mode toggle bar (visible when `isAdmin` is true)
- [x] Add edit icon overlay on each card when in edit mode
- [x] Add inline popover/modal for editing title & image URL
- [x] Add "+ Add News Card" floating button and form
- [x] Implement save logic for update (title + image_url) and create (new card)
- [x] Add corresponding admin-specific CSS styles

## Step 2: Edit `src/views/public/NewsDetailView.vue`
- [x] Import `useAuthStore`, `supabase`
- [x] Add reactive state: `editMode`, `editContent`
- [x] Add computed `isAdmin` from auth store
- [x] Add "Edit Content" button when `isAdmin` is true
- [x] Toggle content area into textarea editor with live preview
- [x] Implement save logic (update body in Supabase)
- [x] Add Cancel/Reset functionality
- [x] Add corresponding admin-specific CSS styles

## Step 3: Verify
- [x] Build passes with 0 errors (vite build successful)
- [ ] Test that admin toolbar only shows for authenticated admins
- [ ] Test updating title and image on news list page
- [ ] Test adding new news card on news list page
- [ ] Test editing body content on news detail page
- [ ] Verify fallback sample data still displays when no published news

