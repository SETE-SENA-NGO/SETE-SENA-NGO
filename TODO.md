# TODO: Implement CRUD Home Slideshow Editor

## ✅ Completed
- Analyzed all relevant files (PageEditorView, Slideshow, AdminSidebar, etc.)
- PageEditorView already has all JS logic (add/remove/move/upload/preview slides, MAX_HOME_SLIDES=4)

## Steps

### ✅ Step 1: PageEditorView.vue - Add `sectionCountLabel` computed
Added the missing `sectionCountLabel` computed property referenced in the template.

### ✅ Step 2: PageEditorView.vue - Conditionally render slideshow editor
In the section field area, added a `<template v-if="section.id === 'home-slideshow'">` block that renders:
- A header with "Add slide" button (disabled when max reached) and "Preview" button
- Empty state message when no slides exist
- Slide cards with: image preview + file upload, title, eyebrow, description, alt text, primary/secondary labels/URLs, image position selector
- Move up/down and delete buttons per slide
- For all other sections, the standard items textarea is rendered

### ✅ Step 3: AdminSidebar.vue - Add Home Slideshow shortcut link
Added `{ slug: 'home-slideshow', label: 'Home Slideshow', path: '/admin/editor/home-slideshow' }` under the Home group in the sidebar.

### ✅ Step 4: All changes verified
- The template properly conditionally renders slideshow editor for `home-slideshow` section
- All JS functions (addHomeSlide, removeHomeSlide, moveHomeSlide, onHomeSlideImageUpload, openPreviewModal) are now used in the template
- Sidebar now shows "Home Slideshow" link under Home group
- Preview modal already existed and works
- MAX_HOME_SLIDES=4 enforced in template and JS

