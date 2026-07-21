# Remove Dark Mode from Public Website

## Completed
- [x] 1. Remove `publicDarkMode` state and functions from `src/stores/ui.store.ts`
- [x] 2. Remove dark mode toggle button from `src/layouts/HeaderView.vue`
- [x] 3. Remove `.public-dark` CSS block from `src/assets/base.css`
- [x] 4. Clean up any remaining references

## Summary
- ✅ Store: Removed `publicDarkMode`, `getInitialPublicDarkMode()`, `applyPublicDarkMode()`, `setPublicDarkMode()`, `togglePublicDarkMode()` - admin dark mode (`darkMode`/`toggleDarkMode`) remains untouched
- ✅ Header: Removed the sun/moon dark mode toggle button and its associated CSS
- ✅ base.css: Removed the entire `.public-dark` CSS block (including all `.public-dark .site-header`, `.public-dark .mega-menu-card`, etc.)
- ✅ Build: Passes successfully with no errors
- ✅ Admin dark mode still works: The toggle in `AdminHeader.vue` and `SettingsView.vue` still uses `ui.toggleDarkMode()` and `ui.setDarkMode()` which are unchanged
