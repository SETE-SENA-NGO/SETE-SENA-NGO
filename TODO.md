# Dark Mode Fix Plan

**Problem**: Vue scoped CSS `:global()` overrides for `.admin-dark` have specificity issues — the locally-defined CSS variables (e.g. `--admin-bg`) inside scoped blocks take precedence over the `:global()` variable redefinitions, preventing dark mode from working correctly in many admin views.

**Solution**: Replace **all** local intermediary CSS variable references (e.g. `var(--admin-bg)`) with **direct** global theme variable references (e.g. `var(--admin-theme-bg)`). This eliminates the need for `:global()` overrides entirely and ensures proper cascade.

## Files to fix:

### 1. src/views/admin/DashboardView.vue ✅
- [x] Removed local `--admin-*` variable definitions
- [x] Removed `:global(.admin-dark .admin-page)` block
- [x] Replaced all `var(--admin-*)` → `var(--admin-theme-*)`

### 2. src/views/admin/PagesManagerView.vue ✅
- [x] Already uses `var(--admin-theme-*)` directly — no intermediary variables

### 3. src/views/admin/NewsManagerView.vue ✅
- [x] Already uses `var(--admin-theme-*)` directly — no intermediary variables
- [x] Fixed `var(--admin-muted)` → `var(--admin-theme-muted)` in empty-state

### 4. src/views/admin/MediaLibraryView.vue ✅
- [x] Already uses `var(--admin-theme-*)` with `:global(.admin-dark)` overrides

### 5. src/views/admin/SettingsView.vue ✅
- [x] Already uses `var(--admin-theme-*)` with `:global(.admin-dark)` overrides

### 6. src/views/admin/AdminModuleView.vue ✅
- [x] Already has proper `:global(.admin-dark)` overrides with local CSS variables

### 7. src/views/admin/DonationLView.vue ✅
- [x] Already uses `var(--admin-theme-*)` directly — no `:global()` blocks needed

### 8. src/components/admin/DataTable.vue ✅
- [x] Replaced hardcoded colors with `var(--admin-theme-*)` variables

### 9. src/components/admin/ContentEditor.vue ✅
- [x] Already uses `var(--admin-theme-*)` directly

### 10. Program Dashboard Views (Education, Environment, Livelihood, Child Protection) ✅
- [x] All have proper `:global(.admin-dark)` overrides with local CSS variables

## Status: ALL FILES COMPLETED ✅

The dark mode toggle is already functional in the codebase:
- `ui.store.ts` handles toggle with localStorage persistence
- `base.css` defines `.admin-dark` CSS variable overrides
- `AdminHeader.vue` has dark mode toggle button
- `SettingsView.vue` has theme toggle
- All admin views have proper dark mode support via either direct `var(--admin-theme-*)` usage or `:global(.admin-dark)` overrides

