<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

type EditableSection = {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

type PageDraft = {
  slug: string
  route: string
  previewRoute?: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
  updatedAt: string
}

type PageRow = {
  slug: string
  title: string
  body: string
  updated_at: string | null
}

type StoredPageBody = {
  kind: 'santi-sena-page-content'
  version: 1
  route: string
  group: string
  eyebrow: string
  headline: string
  intro: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
}

const contentKind = 'santi-sena-page-content'

const defaultPages: PageDraft[] = [
  {
    slug: 'contact',
    route: '/contact',
    group: 'Contact',
    title: 'Contact',
    eyebrow: 'Contact',
    headline: 'Write to us. We read every letter.',
    intro: 'Whether you wish to partner, donate, visit or simply learn more, our team in Cambodia is ready to hear from you.',
    primaryAction: 'Send message',
    secondaryAction: '',
    sections: [
      {
        id: 'contact-offices',
        label: 'Offices',
        heading: 'Office details',
        body: 'Contact details shown beside the public contact form.',
        items: 'Head Office | Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org\nPhone | +855 (0) 12 345 678\nField offices | Prey Veng Province, Kratie Province',
      },
      {
        id: 'contact-form',
        label: 'Form',
        heading: 'Send a message',
        body: 'Name, email, subject and message fields are shown on the public contact form.',
        items: 'Name\nEmail\nSubject\nMessage\nMessage sent',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'contact-head-office',
    route: '/contact/headoffice',
    group: 'Contact',
    title: 'Head Office',
    eyebrow: 'Contact - Head Office',
    headline: 'Visit us in Svay Rieng.',
    intro: 'Our headquarters sits in Svay Rieng town, walking distance from the provincial pagoda where Santi Sena was founded thirty years ago.',
    primaryAction: 'Send a message',
    secondaryAction: '',
    sections: [
      {
        id: 'head-office-contact',
        label: 'Contact blocks',
        heading: 'Head office contact details',
        body: 'Address, email, phone and office hours.',
        items: 'Address | Santi Sena Organization, Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia\nEmail | info@santisena.org, partnerships@santisena.org, media@santisena.org\nPhone | +855 (0) 12 345 678, +855 (0) 44 987 654\nOffice hours | Monday - Friday, 8:00 - 17:00 Cambodia time, Saturday by appointment',
      },
      {
        id: 'head-office-travel',
        label: 'Travel',
        heading: 'Getting here',
        body: 'Travel notes for visitors.',
        items: 'From Phnom Penh: about 2.5 hours by road via National Road 1\nFrom Ho Chi Minh City: about 4 hours via the Bavet-Moc Bai border\nNearest airport: Phnom Penh International\nTuk-tuks available from Svay Rieng town centre',
      },
      {
        id: 'head-office-guidance',
        label: 'Visitor guidance',
        heading: 'Visitor guidance',
        body: 'Please email at least two weeks ahead so staff can arrange availability and field visits. Modest dress is appreciated.',
        items: '',
      },
    ],
    updatedAt: '',
  },
  {
    slug: 'contact-field-offices',
    route: '/contact/fieldoffice',
    group: 'Contact',
    title: 'Field Offices',
    eyebrow: 'Contact - Field Offices',
    headline: 'Where the work actually happens.',
    intro: 'Our two provincial field offices are the daily home of the staff who walk into villages and the easiest way to reach a program directly.',
    primaryAction: 'Visit head office',
    secondaryAction: '',
    sections: [
      {
        id: 'field-offices-list',
        label: 'Field offices',
        heading: 'Field office contact details',
        body: 'Provincial field office details.',
        items: 'Prey Veng Field Office | Prey Veng Town, Prey Veng Province, Cambodia | preyveng@santisena.org | +855 (0) 12 111 222\nKratie Field Office | Kratie Town, Kratie Province, Cambodia | kratie@santisena.org | +855 (0) 12 333 444',
      },
      {
        id: 'field-offices-visits',
        label: 'Visits',
        heading: 'Field visits',
        body: 'Donors, partners and researchers are welcome to visit a project site by arranging through head office at least two weeks in advance.',
        items: '',
      },
      {
        id: 'field-offices-hours',
        label: 'Hours',
        heading: 'Office hours',
        body: 'Field office availability.',
        items: 'Monday - Friday: 8:00 - 17:00 Cambodia time\nField staff are often in villages; email response may take 24-48 hours\nProvincial coordinators available by phone during office hours',
      },
    ],
    updatedAt: '',
  },
]

const route = useRoute()
const router = useRouter()
const ui = useUiStore()

const drafts = ref<PageDraft[]>(defaultPages.map(clonePage))
const loading = ref(false)
const savingSlug = ref<string | null>(null)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)
const savedSnapshot = ref<Record<string, string>>({})
const previewVisible = ref(true)
const activeSectionIndex = ref<number | null>(null)

const requestedSlug = computed(() => route.params.slug as string)

const activePage = computed<PageDraft>(() => {
  return (
    drafts.value.find((page) => page.slug === requestedSlug.value) ??
    drafts.value[0] ??
    clonePage(defaultPages[0] as PageDraft)
  )
})

const activePageDirty = computed(() => isDirty(activePage.value.slug))
const activePreviewRoute = computed(() => getPreviewRoute(activePage.value))

const previewItems = computed(() => {
  return activePage.value.sections.map((section) => ({
    ...section,
    parsedItems: section.items
      ? section.items.split('\n').filter((line) => line.trim())
      : [],
  }))
})

const sectionCountLabel = computed(() => {
  const count = activePage.value.sections.length
  return `${count} section${count !== 1 ? 's' : ''}`
})

onMounted(() => {
  void loadPages()
})

watch(
  requestedSlug,
  (slug) => {
    if (!drafts.value.some((page) => page.slug === slug) && slug !== requestedSlug.value) {
      void router.replace('/admin/editor/home')
    }
  },
  { immediate: true },
)

function clonePage(page: PageDraft): PageDraft {
  return {
    ...page,
    sections: page.sections.map((section) => ({ ...section })),
  }
}

function getPreviewRoute(page: PageDraft) {
  if (page.previewRoute) return page.previewRoute
  return page.route.replace(/:id\b/g, '1')
}

function cloneSection(section?: Partial<EditableSection>): EditableSection {
  return {
    id: section?.id || createSectionId(),
    label: section?.label || 'New section',
    heading: section?.heading || '',
    body: section?.body || '',
    items: section?.items || '',
  }
}

function createSectionId() {
  return `section-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function pageBody(page: PageDraft): StoredPageBody {
  return {
    kind: contentKind,
    version: 1,
    route: page.route,
    group: page.group,
    eyebrow: page.eyebrow,
    headline: page.headline,
    intro: page.intro,
    primaryAction: page.primaryAction,
    secondaryAction: page.secondaryAction,
    sections: page.sections.map((section) => ({ ...section })),
  }
}

function snapshot(page: PageDraft) {
  return JSON.stringify({
    title: page.title,
    body: pageBody(page),
  })
}

function serializeBody(page: PageDraft) {
  return JSON.stringify(pageBody(page), null, 2)
}

function isDirty(slug: string) {
  const page = drafts.value.find((item) => item.slug === slug)
  if (!page) return false
  return savedSnapshot.value[slug] !== snapshot(page)
}

function parseStoredBody(body: string): Partial<StoredPageBody> | null {
  try {
    const parsed = JSON.parse(body) as unknown
    if (!isRecord(parsed) || parsed.kind !== contentKind) return null

    return {
      route: getString(parsed, 'route'),
      group: getString(parsed, 'group'),
      eyebrow: getString(parsed, 'eyebrow'),
      headline: getString(parsed, 'headline'),
      intro: getString(parsed, 'intro'),
      primaryAction: getString(parsed, 'primaryAction'),
      secondaryAction: getString(parsed, 'secondaryAction'),
      sections: getSections(parsed.sections),
    }
  } catch {
    return null
  }
}

function getSections(value: unknown): EditableSection[] {
  if (!Array.isArray(value)) return []

  return value.filter(isRecord).map((section) =>
    cloneSection({
      id: getString(section, 'id') || createSectionId(),
      label: getString(section, 'label') || 'Section',
      heading: getString(section, 'heading'),
      body: getString(section, 'body'),
      items: getString(section, 'items'),
    }),
  )
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key]
  return typeof value === 'string' ? value : ''
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function mergeRow(defaultPage: PageDraft, row: PageRow): PageDraft {
  const parsed = parseStoredBody(row.body)

  if (!parsed) {
    return {
      ...clonePage(defaultPage),
      title: row.title || defaultPage.title,
      intro: row.body || defaultPage.intro,
      updatedAt: row.updated_at ?? '',
    }
  }

  return {
    ...clonePage(defaultPage),
    title: row.title || defaultPage.title,
    route: parsed.route || defaultPage.route,
    group: parsed.group || defaultPage.group,
    eyebrow: parsed.eyebrow ?? defaultPage.eyebrow,
    headline: parsed.headline ?? defaultPage.headline,
    intro: parsed.intro ?? defaultPage.intro,
    primaryAction: parsed.primaryAction ?? defaultPage.primaryAction,
    secondaryAction: parsed.secondaryAction ?? defaultPage.secondaryAction,
    sections: parsed.sections?.length
      ? parsed.sections.map(cloneSection)
      : clonePage(defaultPage).sections,
    updatedAt: row.updated_at ?? '',
  }
}

async function loadPages() {
  loading.value = true
  notice.value = null

  try {
const slugs = ['contact', 'contact-head-office', 'contact-field-offices']
    const { data, error } = await supabase
      .from('pages')
      .select('slug, title, body, updated_at')
      .in('slug', slugs)

    if (error) throw error

    const rows = new Map<string, PageRow>()
    for (const row of (data ?? []) as PageRow[]) {
      rows.set(row.slug, row)
    }

    drafts.value = defaultPages.map((page) => {
      const row = rows.get(page.slug)
      return row ? mergeRow(page, row) : clonePage(page)
    })

    savedSnapshot.value = Object.fromEntries(
      drafts.value.map((page) => [page.slug, snapshot(page)]),
    )
  } catch (error) {
    notice.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Could not load website content.',
    }
  } finally {
    loading.value = false
  }
}

async function persistPage(page: PageDraft): Promise<PageDraft> {
  const savedAt = new Date().toISOString()
  const payload = {
    slug: page.slug,
    title: page.title.trim() || page.headline.trim() || page.slug,
    body: serializeBody(page),
    updated_at: savedAt,
  }

  const { data, error } = await supabase
    .from('pages')
    .upsert(payload, { onConflict: 'slug' })
    .select('slug, title, body, updated_at')
    .single()

  if (error) throw error

  return data ? mergeRow(page, data as PageRow) : { ...clonePage(page), updatedAt: savedAt }
}

function replaceDraft(page: PageDraft) {
  const index = drafts.value.findIndex((item) => item.slug === page.slug)
  if (index === -1) return
  drafts.value[index] = page
  savedSnapshot.value[page.slug] = snapshot(page)
}

async function saveCurrentPage() {
  const page = activePage.value
  savingSlug.value = page.slug
  notice.value = null

  try {
    replaceDraft(await persistPage(page))
    notice.value = { type: 'success', message: `${page.title} saved.` }
    ui.addToast(`${page.title} saved.`, 'success')
  } catch (error) {
    notice.value = {
      type: 'error',
      message: error instanceof Error ? error.message : 'Could not save this page.',
    }
    ui.addToast(notice.value.message, 'error')
  } finally {
    savingSlug.value = null
  }
}

function addSection() {
  activePage.value.sections.push(
    cloneSection({
      label: `Section ${activePage.value.sections.length + 1}`,
    }),
  )
  activeSectionIndex.value = activePage.value.sections.length - 1
}

function removeSection(index: number) {
  const section = activePage.value.sections[index]
  if (!section) return

  ui.openModal(
    'Remove this section?',
    `Remove "${section.label || section.heading || 'this section'}" from ${activePage.value.title}?`,
    () => {
      activePage.value.sections.splice(index, 1)
      if (activeSectionIndex.value === index) activeSectionIndex.value = null
      ui.addToast('Section removed.', 'warning')
    },
  )
}

function duplicateSection(index: number) {
  const section = activePage.value.sections[index]
  if (!section) return

  activePage.value.sections.splice(
    index + 1,
    0,
    cloneSection({
      ...section,
      id: createSectionId(),
      label: `${section.label || 'Section'} copy`,
    }),
  )
}

function moveSection(index: number, direction: -1 | 1) {
  const target = index + direction
  const sections = activePage.value.sections
  const current = sections[index]
  const next = sections[target]
  if (!current || !next) return
  sections[index] = next
  sections[target] = current
}

function resetCurrentToDefault() {
  ui.openModal(
    'Reset this page?',
    `This restores ${activePage.value.title} to the default content and keeps it unsaved until you click Save page.`,
    applyDefaultReset,
  )
}

function applyDefaultReset() {
  const fallback = defaultPages.find((page) => page.slug === activePage.value.slug)
  if (!fallback) return

  const index = drafts.value.findIndex((page) => page.slug === fallback.slug)
  if (index === -1) return
  drafts.value[index] = clonePage(fallback)
  ui.addToast(`${fallback.title} reset to default draft.`, 'info')
}

function formatDate(value: string) {
  if (!value) return 'Not saved yet'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not saved yet'

  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

/* ==============================
   ITEM WIZARD (Program-card style editing)
   Each "item" line inside a section is parsed into structured
   fields (icon, title, description, note, photo) so it can be
   edited one-at-a-time with Previous / Next, matching the
   reference "Program 1 of 4" card layout.
   ============================== */

type EditableItem = {
  icon: string
  title: string
  description: string
  note: string
  photo: string
  whatWeDo: string
  whyItMatters: string
}

const ICONS = [
  { key: 'heart', path: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z' },
  { key: 'people', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75' },
  { key: 'leaf', path: 'M11 20A7 7 0 0 1 4 13c0-8 7-11 15-11 0 9-2 16-8 18z' },
  { key: 'chat', path: 'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z' },
  { key: 'megaphone', path: 'M3 11l18-5v12L3 13v-2z M6 13v5a2 2 0 0 0 2 2h1v-6' },
  { key: 'book', path: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
  { key: 'shield', path: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
] as const

const ICON_KEYS = new Set(ICONS.map((icon) => icon.key))

function iconPath(key: string) {
  return ICONS.find((icon) => icon.key === key)?.path ?? ''
}

function emptyItem(): EditableItem {
  return {
    icon: '',
    title: '',
    description: '',
    note: '',
    photo: '',
    whatWeDo: '',
    whyItMatters: '',
  }
}

function parseItemLine(line: string): EditableItem {
  let raw = line
  let icon = ''

  const separatorIndex = raw.lastIndexOf('::')
  if (separatorIndex !== -1) {
    const candidate = raw.slice(separatorIndex + 2).trim()
    if (ICON_KEYS.has(candidate)) {
      icon = candidate
      raw = raw.slice(0, separatorIndex)
    }
  }

  const parts = raw.split('|').map((part) => part.trim())
  return {
    icon,
    title: parts[0] ?? '',
    description: parts[1] ?? '',
    note: parts[2] ?? '',
    photo: parts[3] ?? '',
    whatWeDo: parts[4] ?? '',
    whyItMatters: parts[5] ?? '',
  }
}

function serializeItem(item: EditableItem): string {
  const parts = [
    item.title,
    item.description,
    item.note,
    item.photo,
    item.whatWeDo,
    item.whyItMatters,
  ]
  while (parts.length && !parts[parts.length - 1]) parts.pop()

  let line = parts.join(' | ')
  if (item.icon) line = `${line}::${item.icon}`
  return line
}

function getItems(section: EditableSection): EditableItem[] {
  return section.items
    ? section.items.split('\n').filter((line) => line.trim().length > 0).map(parseItemLine)
    : []
}

function setItems(section: EditableSection, items: EditableItem[]) {
  section.items = items.map(serializeItem).join('\n')
}

const activeItemIndex = ref<Record<string, number>>({})

function getActiveItemIndex(section: EditableSection) {
  const items = getItems(section)
  const current = activeItemIndex.value[section.id] ?? 0
  return Math.min(Math.max(current, 0), Math.max(items.length - 1, 0))
}

function setActiveItemIndex(section: EditableSection, index: number) {
  activeItemIndex.value[section.id] = index
}

/**
 * Short label used inside the pill-style tab strip.
 * Some legacy item lines store a full sentence as the "title"
 * (no `|` separator was used when the content was authored),
 * which — combined with `white-space: nowrap` on `.item-tab` —
 * used to render as one giant pill that broke onto its own line
 * and pushed every other tab out of its expected order visually.
 * Truncating here keeps every tab a small, uniform pill so the
 * row wraps cleanly and items stay in their real array order.
 * The untruncated text is still shown via the `title` attribute
 * (tooltip) in the template below.
 */
function itemTabLabel(item: EditableItem, index: number) {
  const label = item.title.trim() || `Item ${index + 1}`
  const maxLength = 28
  return label.length > maxLength ? `${label.slice(0, maxLength - 2)}…` : label
}

function updateActiveItem(section: EditableSection, patch: Partial<EditableItem>) {
  const items = getItems(section)
  const index = getActiveItemIndex(section)
  const current = items[index]
  if (!current) return
  items[index] = { ...current, ...patch }
  setItems(section, items)
}

function addItem(section: EditableSection) {
  const items = getItems(section)
  items.push(emptyItem())
  setItems(section, items)
  setActiveItemIndex(section, items.length - 1)
}

function removeItem(section: EditableSection, index: number) {
  const items = getItems(section)
  if (items.length <= 1) return
  items.splice(index, 1)
  setItems(section, items)
  const next = Math.min(index, items.length - 1)
  setActiveItemIndex(section, next)
}

function goToItem(section: EditableSection, index: number) {
  const items = getItems(section)
  if (index < 0 || index >= items.length) return
  setActiveItemIndex(section, index)
}

function stepItem(section: EditableSection, direction: -1 | 1) {
  const items = getItems(section)
  const current = getActiveItemIndex(section)
  const next = current + direction
  if (next < 0 || next >= items.length) return
  setActiveItemIndex(section, next)
}

function onPhotoChange(section: EditableSection, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = () => {
    if (typeof reader.result === 'string') {
      updateActiveItem(section, { photo: reader.result })
    }
  }
  reader.readAsDataURL(file)
  input.value = ''
}

function clearPhoto(section: EditableSection) {
  updateActiveItem(section, { photo: '' })
}
</script>

<template>
  <div :class="['editor-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="main">
        <!-- Toast notice -->
        <Transition name="notice-slide">
          <div v-if="notice" class="notice" :class="`notice-${notice.type}`" role="status">
            <div class="notice-inner">
              <svg v-if="notice.type === 'success'" class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ notice.message }}</span>
            </div>
            <button class="notice-dismiss" type="button" @click="notice = null" aria-label="Dismiss notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </Transition>

        <div class="editor-container">
          <!-- Editor Column -->
          <section class="editor-column" aria-label="Page editor">
            <!-- Page Header -->
            <header class="editor-header">
              <div class="header-left">
                <h1 class="header-title">Edit {{ activePage.title.toLowerCase() }} page</h1>
                <p class="header-subtitle">Change the text and photos your visitors see</p>
              </div>
              <div class="header-right">
                <div class="header-actions">
                  <RouterLink
                    v-if="activePage.route !== 'global'"
                    class="btn btn-ghost"
                    :to="activePage.route"
                    title="View this page on the live site"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    View page
                  </RouterLink>
                  <button
                    class="btn btn-primary"
                    type="button"
                    :disabled="savingSlug === activePage.slug || loading"
                    @click="saveCurrentPage"
                  >
                    <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                    <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    {{ savingSlug === activePage.slug ? 'Saving...' : 'Publish changes' }}
                  </button>
                  <button class="btn-icon-sm" type="button" @click="resetCurrentToDefault" title="Undo my changes">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                  </button>
                </div>
                <div class="save-indicator" :class="{ dirty: activePageDirty }">
                  <span class="save-dot"></span>
                  <span class="save-label">{{ activePageDirty ? 'Unsaved changes' : 'Saved' }}</span>
                </div>
              </div>
            </header>

            <!-- Form Panels -->
            <div class="form-panels">
              <!-- Top of page -->
              <section class="form-card">
                <div class="card-header">
                  <div class="card-header-left">
                    <div class="card-icon card-icon-violet">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </div>
                    <div>
                      <h3 class="card-title">Top of page</h3>
                      <span class="card-subtitle">This is the first thing people see</span>
                    </div>
                  </div>
                </div>
                <div class="card-body">
                  <label class="field field-block">
                    <span class="field-label">Small label above the title</span>
                    <input v-model="activePage.eyebrow" name="page-eyebrow" placeholder="e.g. Our Programs" />
                  </label>
                  <label class="field field-block">
                    <span class="field-label">Big title</span>
                    <textarea v-model="activePage.headline" name="page-headline" rows="2" placeholder="The main headline for this page"></textarea>
                  </label>
                  <label class="field field-block">
                    <span class="field-label">Short paragraph</span>
                    <textarea v-model="activePage.intro" name="page-intro" rows="4" placeholder="A short paragraph under the title"></textarea>
                  </label>
                  <div class="form-grid">
                    <label class="field">
                      <span class="field-label">Button text</span>
                      <input v-model="activePage.primaryAction" name="page-primary-action" placeholder="e.g. Support Us" />
                    </label>
                    <label class="field">
                      <span class="field-label">Second button text (optional)</span>
                      <input v-model="activePage.secondaryAction" name="page-secondary-action" placeholder="e.g. Learn More" />
                    </label>
                  </div>
                </div>
              </section>

              <!-- Page Sections (wizard-style, one card per section) -->
              <section
                v-for="(section, sIndex) in activePage.sections"
                :id="`edit-${section.id}`"
                :key="section.id"
                class="form-card"
              >
                <div class="card-header">
                  <div class="card-header-left">
                    <div class="card-icon card-icon-amber">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    </div>
                    <div>
                      <input v-model="section.label" class="card-title-input" :name="`section-${section.id}-label`" placeholder="Section name" />
                      <span class="card-subtitle">{{ activePage.sections.length > 1 ? `Section ${sIndex + 1} of ${activePage.sections.length}` : 'One section on this page' }}</span>
                    </div>
                  </div>
                  <div class="section-actions">
                    <button type="button" class="btn-icon" :disabled="sIndex === 0" aria-label="Move up" title="Move up" @click="moveSection(sIndex, -1)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
                    </button>
                    <button type="button" class="btn-icon" :disabled="sIndex === activePage.sections.length - 1" aria-label="Move down" title="Move down" @click="moveSection(sIndex, 1)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <button type="button" class="btn-icon" aria-label="Duplicate" title="Duplicate" @click="duplicateSection(sIndex)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button type="button" class="btn-icon danger" aria-label="Remove" title="Remove" @click="removeSection(sIndex)">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                <div class="card-body">
                  <label class="field field-block">
                    <span class="field-label">Heading</span>
                    <input v-model="section.heading" :name="`section-${section.id}-heading`" placeholder="Section heading" />
                  </label>
                  <label class="field field-block">
                    <span class="field-label">Short description</span>
                    <textarea v-model="section.body" :name="`section-${section.id}-body`" rows="2" placeholder="A sentence or two about this section"></textarea>
                  </label>

                  <!-- Item wizard -->
                  <div v-if="getItems(section).length" class="item-wizard">
                    <span class="field-label">{{ section.label || 'Items' }}</span>
                    <p class="field-hint-line">One card per item. Switch tabs or use Previous / Next.</p>

                    <div class="item-tabs">
                      <button
                        v-for="(item, iIndex) in getItems(section)"
                        :key="iIndex"
                        type="button"
                        class="item-tab"
                        :class="{ active: getActiveItemIndex(section) === iIndex }"
                        :title="item.title || `Item ${iIndex + 1}`"
                        @click="goToItem(section, iIndex)"
                      >
                        <svg v-if="item.icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="iconPath(item.icon)" /></svg>
                        <span class="item-tab-label">{{ itemTabLabel(item, iIndex) }}</span>
                      </button>
                    </div>

                    <div class="item-card">
                      <div class="item-card-header">
                        <div>
                          <strong>{{ section.label || 'Item' }} {{ getActiveItemIndex(section) + 1 }} of {{ getItems(section).length }}</strong>
                          <small>This becomes one card on the page</small>
                        </div>
                        <button
                          type="button"
                          class="btn-icon danger"
                          :disabled="getItems(section).length <= 1"
                          title="Remove this item"
                          @click="removeItem(section, getActiveItemIndex(section))"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>

                      <div class="item-card-body">
                        <label class="field field-block">
                          <span class="field-label">Photo</span>
                          <div class="photo-picker">
                            <div class="photo-preview" :class="{ filled: !!getItems(section)[getActiveItemIndex(section)]?.photo }">
                              <img
                                v-if="getItems(section)[getActiveItemIndex(section)]?.photo"
                                :src="getItems(section)[getActiveItemIndex(section)]?.photo"
                                alt=""
                              />
                              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                            </div>
                            <div class="photo-picker-actions">
                              <label class="btn btn-secondary photo-choose-btn">
                                Choose photo
                                <input type="file" accept="image/*" class="photo-input" @change="onPhotoChange(section, $event)" />
                              </label>
                              <button
                                v-if="getItems(section)[getActiveItemIndex(section)]?.photo"
                                type="button"
                                class="btn btn-ghost"
                                @click="clearPhoto(section)"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </label>

                        <label class="field field-block">
                          <span class="field-label">Icon</span>
                          <div class="icon-picker">
                            <button
                              v-for="icon in ICONS"
                              :key="icon.key"
                              type="button"
                              class="icon-option"
                              :class="{ active: getItems(section)[getActiveItemIndex(section)]?.icon === icon.key }"
                              :title="icon.key"
                              @click="updateActiveItem(section, { icon: getItems(section)[getActiveItemIndex(section)]?.icon === icon.key ? '' : icon.key })"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path :d="icon.path" /></svg>
                            </button>
                          </div>
                        </label>

                        <label class="field field-block">
                          <span class="field-label">Title</span>
                          <input
                            :value="getItems(section)[getActiveItemIndex(section)]?.title"
                            :name="`item-${section.id}-title`"
                            placeholder="e.g. Environment"
                            @input="updateActiveItem(section, { title: ($event.target as HTMLInputElement).value })"
                          />
                        </label>

                        <label class="field field-block">
                          <span class="field-label">Description</span>
                          <textarea
                            :value="getItems(section)[getActiveItemIndex(section)]?.description"
                            :name="`item-${section.id}-description`"
                            rows="3"
                            placeholder="A sentence or two about this item"
                            @input="updateActiveItem(section, { description: ($event.target as HTMLTextAreaElement).value })"
                          ></textarea>
                        </label>

                        <label class="field field-block">
                          <span class="field-label">Quote from the community (optional)</span>
                          <textarea
                            :value="getItems(section)[getActiveItemIndex(section)]?.note"
                            :name="`item-${section.id}-note`"
                            rows="2"
                            placeholder="A short quote or extra detail"
                            @input="updateActiveItem(section, { note: ($event.target as HTMLTextAreaElement).value })"
                          ></textarea>
                        </label>

                        <label class="field field-block">
                          <span class="field-label">What we do (optional)</span>
                          <textarea
                            :value="getItems(section)[getActiveItemIndex(section)]?.whatWeDo"
                            :name="`item-${section.id}-what-we-do`"
                            rows="3"
                            placeholder="The main activities for this item"
                            @input="updateActiveItem(section, { whatWeDo: ($event.target as HTMLTextAreaElement).value })"
                          ></textarea>
                        </label>

                        <label class="field field-block">
                          <span class="field-label">Why it matters (optional)</span>
                          <textarea
                            :value="getItems(section)[getActiveItemIndex(section)]?.whyItMatters"
                            :name="`item-${section.id}-why-it-matters`"
                            rows="3"
                            placeholder="Why this work matters to the community"
                            @input="updateActiveItem(section, { whyItMatters: ($event.target as HTMLTextAreaElement).value })"
                          ></textarea>
                        </label>
                      </div>

                      <div class="item-card-footer">
                        <button type="button" class="btn btn-ghost" :disabled="getActiveItemIndex(section) === 0" @click="stepItem(section, -1)">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                          Previous
                        </button>
                        <span class="section-toolbar-hint">Changes save automatically as you type</span>
                        <button type="button" class="btn btn-ghost" :disabled="getActiveItemIndex(section) === getItems(section).length - 1" @click="stepItem(section, 1)">
                          Next
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div v-else class="empty-sections">
                    <p>No items in this section yet</p>
                    <button class="btn btn-secondary" type="button" @click="addItem(section)">Add your first item</button>
                  </div>
                </div>
              </section>

              <button class="btn btn-secondary add-section-btn-full" type="button" @click="addSection">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add section
              </button>
            </div>

            <!-- Bottom Save Bar -->
            <div class="save-bar">
              <div class="save-bar-left">
                <span class="save-dot-large" :class="{ dirty: activePageDirty }"></span>
                <div>
                  <strong>{{ activePageDirty ? 'You have unsaved changes' : 'Everything is saved' }}</strong>
                  <small>Last published {{ formatDate(activePage.updatedAt) }}</small>
                </div>
              </div>
              <div class="save-bar-right">
                <button
                  class="btn btn-primary"
                  type="button"
                  :disabled="savingSlug === activePage.slug || loading"
                  @click="saveCurrentPage"
                >
                  <svg v-if="savingSlug === activePage.slug" class="spin" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ savingSlug === activePage.slug ? 'Saving...' : 'Publish changes' }}
                </button>
              </div>
            </div>
          </section>

          <!-- Preview Column -->
          <Transition name="preview-slide">
            <aside v-if="previewVisible" class="preview-column" aria-label="Content preview">
              <div class="preview-header">
                <div class="preview-header-left">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <span>Live preview</span>
                </div>
                <button class="btn-icon-sm" type="button" @click="previewVisible = false" aria-label="Close preview">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>

              <div class="preview-content">
                <!-- Hero Preview -->
                <div class="preview-hero">
                  <span class="preview-eyebrow">{{ activePage.eyebrow || 'Eyebrow text' }}</span>
                  <h2 class="preview-headline">{{ activePage.headline || 'Headline' }}</h2>
                  <p class="preview-intro">{{ activePage.intro || 'Intro text...' }}</p>
                  <div v-if="activePage.primaryAction || activePage.secondaryAction" class="preview-actions">
                    <span v-if="activePage.primaryAction" class="preview-btn preview-btn-primary">{{ activePage.primaryAction }}</span>
                    <span v-if="activePage.secondaryAction" class="preview-btn preview-btn-secondary">{{ activePage.secondaryAction }}</span>
                  </div>
                </div>

                <!-- Sections Preview -->
                <div class="preview-sections">
                  <div
                    v-for="section in previewItems"
                    :key="section.id"
                    class="preview-section"
                  >
                    <h3 class="preview-section-heading">{{ section.heading || 'Section heading' }}</h3>
                    <p class="preview-section-body" v-if="section.body">{{ section.body }}</p>

                    <div v-if="section.parsedItems.length" class="preview-items">
                      <template v-for="item in section.parsedItems" :key="item">
                        <div v-if="item.includes('|')" class="preview-item-card">
                          <strong>{{ item.split('|')[0]?.trim() }}</strong>
                          <span>{{ item.split('|').slice(1).join('|').replace(/::[a-z]+$/, '').trim() }}</span>
                        </div>
                        <div v-else class="preview-item-simple">
                          <span class="preview-bullet"></span>
                          <span>{{ item.replace(/::[a-z]+$/, '') }}</span>
                        </div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <div class="preview-footer">
                <span>Auto-refreshes on edit</span>
              </div>
            </aside>
          </Transition>

          <!-- Preview toggle button (when preview is hidden) -->
          <button
            v-if="!previewVisible"
            class="preview-toggle-btn"
            type="button"
            @click="previewVisible = true"
            title="Show preview"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ==============================
   DESIGN TOKENS
   ============================== */
.editor-page {
  --admin-bg: #f1f5f9;
  --admin-bg-deep: #e2e8f0;
  --admin-surface: #ffffff;
  --admin-surface-soft: #f8fafc;
  --admin-contrast: #0f172a;
  --admin-contrast-soft: #1e293b;
  --admin-text: #334155;
  --admin-muted: #64748b;
  --admin-muted-light: #94a3b8;
  --admin-border: #e2e8f0;
  --admin-border-strong: #cbd5e1;
  --admin-blue: #2563eb;
  --admin-blue-soft: #eff6ff;
  --admin-violet: #7c3aed;
  --admin-violet-soft: #f5f3ff;
  --admin-amber: #d97706;
  --admin-amber-soft: #fffbeb;
  --admin-green: #16a34a;
  --admin-green-soft: #f0fdf4;
  --admin-red: #dc2626;
  --admin-red-soft: #fef2f2;
  --admin-gold: #f59e0b;
  --admin-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
  --admin-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
  --admin-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -2px rgba(0, 0, 0, 0.04);
  --admin-shadow-xl: 0 20px 40px -8px rgba(0, 0, 0, 0.08);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Helvetica,
    Arial,
    sans-serif;
  transition: padding-left 0.25s ease;
}

:global(.admin-dark) .editor-page {
  --admin-bg: #0b1120;
  --admin-bg-deep: #111827;
  --admin-surface: #1a2332;
  --admin-surface-soft: #0f172a;
  --admin-contrast: #f1f5f9;
  --admin-contrast-soft: #e2e8f0;
  --admin-text: #cbd5e1;
  --admin-muted: #94a3b8;
  --admin-muted-light: #64748b;
  --admin-border: #1e293b;
  --admin-border-strong: #334155;
  --admin-blue-soft: rgba(37, 99, 235, 0.12);
  --admin-violet-soft: rgba(124, 58, 237, 0.12);
  --admin-amber-soft: rgba(217, 119, 6, 0.12);
  --admin-green-soft: rgba(22, 163, 74, 0.12);
  --admin-red-soft: rgba(220, 38, 38, 0.12);
  --admin-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.2);
  --admin-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  --admin-shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --admin-shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.3);
  --admin-shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 1.5rem 2rem;
}

/* ==============================
   NOTICE
   ============================== */
.notice {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  border-radius: 10px;
  padding: 0.75rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid transparent;
}

.notice-inner {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.notice-icon {
  flex-shrink: 0;
}

.notice-success {
  border-color: rgba(22, 163, 74, 0.25);
  background: var(--admin-green-soft);
  color: #166534;
}

.notice-error {
  border-color: rgba(220, 38, 38, 0.25);
  background: var(--admin-red-soft);
  color: #991b1b;
}

.notice-dismiss {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.notice-dismiss:hover {
  opacity: 1;
}

.notice-slide-enter-active,
.notice-slide-leave-active {
  transition: all 0.25s ease;
}
.notice-slide-enter-from,
.notice-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ==============================
   EDITOR LAYOUT
   ============================== */
.editor-container {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  position: relative;
}

.editor-column {
  flex: 1;
  min-width: 0;
  max-width: 860px;
}

/* ==============================
   EDITOR HEADER
   ============================== */
.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem 1.25rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.header-left {
  min-width: 0;
  display: grid;
  gap: 0.15rem;
}

.header-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.header-subtitle {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--admin-muted);
}

.header-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  flex-shrink: 0;
}

.save-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.65rem;
  border-radius: 8px;
  background: var(--admin-green-soft);
  font-size: 0.75rem;
  font-weight: 700;
  color: #166534;
}

.save-indicator.dirty {
  background: var(--admin-amber-soft);
  color: #92400e;
}

.save-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #16a34a;
}

.save-indicator.dirty .save-dot {
  background: var(--admin-amber);
}

.save-label {
  white-space: nowrap;
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 36px;
  border-radius: 8px;
  padding: 0.45rem 0.9rem;
  font-weight: 600;
  font-size: 0.82rem;
  cursor: pointer;
  text-decoration: none;
  border: 1px solid transparent;
  transition: all 0.15s ease, transform 0.15s ease;
  white-space: nowrap;
  will-change: transform;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.btn-primary {
  background: var(--admin-blue);
  color: #ffffff;
  border-color: var(--admin-blue);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
  border-color: #1d4ed8;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.35);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--admin-surface);
  color: var(--admin-contrast);
  border-color: var(--admin-border-strong);
}

.btn-secondary:hover:not(:disabled) {
  border-color: var(--admin-muted);
  background: var(--admin-surface-soft);
  box-shadow: var(--admin-shadow);
}

.btn-ghost {
  background: transparent;
  color: var(--admin-muted);
  border-color: var(--admin-border);
}

.btn-ghost:hover:not(:disabled) {
  background: var(--admin-bg);
  color: var(--admin-contrast);
  border-color: var(--admin-border-strong);
}

.btn-icon {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--admin-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon:hover:not(:disabled) {
  background: var(--admin-bg);
  color: var(--admin-contrast);
}

.btn-icon:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.btn-icon.danger:hover:not(:disabled) {
  color: #dc2626;
  background: var(--admin-red-soft);
}

.btn-icon-sm {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--admin-border);
  border-radius: 8px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.btn-icon-sm:hover {
  background: var(--admin-bg);
  color: var(--admin-contrast);
}

.header-actions {
  display: flex;
  gap: 0.35rem;
  align-items: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==============================
   FORM CARDS
   ============================== */
.form-panels {
  display: grid;
  gap: 1rem;
}

.form-card {
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.form-card:hover {
  box-shadow: var(--admin-shadow-md);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface-soft);
}

.card-header-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  min-width: 0;
  flex: 1;
}

.card-icon {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 9px;
  flex-shrink: 0;
}

.card-icon-violet {
  background: var(--admin-violet-soft);
  color: var(--admin-violet);
}

.card-icon-amber {
  background: var(--admin-amber-soft);
  color: var(--admin-amber);
}

.card-subtitle {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-muted);
  margin-top: 0.05rem;
}

.card-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.card-title-input {
  border: none;
  background: transparent;
  padding: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--admin-contrast);
  width: 100%;
  min-width: 120px;
}

.card-title-input:focus {
  outline: none;
  box-shadow: none;
}

.card-body {
  padding: 1rem 1.1rem 1.15rem;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
}

/* ==============================
   FORM FIELDS
   ============================== */
.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.35rem;
}

.field-block {
  margin-top: 0.85rem;
}

.field-block:first-child {
  margin-top: 0;
}

.field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
  letter-spacing: 0.01em;
}

.field-hint {
  display: block;
  font-weight: 600;
  color: var(--admin-muted);
  font-size: 0.72rem;
  margin-top: 0.15rem;
}

.field-hint-line {
  margin: 0.15rem 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--admin-muted);
}

input, textarea {
  width: 100%;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.62rem 0.78rem;
  font-size: 0.88rem;
  line-height: 1.5;
  font-family: inherit;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

textarea {
  resize: vertical;
  min-height: 48px;
}

input:focus, textarea:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

input::placeholder, textarea::placeholder {
  color: var(--admin-muted-light);
}

/* ==============================
   ITEM WIZARD (pill tabs + "Item N of M" card)
   ============================== */
.item-wizard {
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--admin-border);
}

.item-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.85rem;
}

.item-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  border: 1.5px solid var(--admin-border-strong);
  background: var(--admin-surface);
  color: var(--admin-text);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  /* Constrain each pill so a long, unstructured title (a full
     sentence stored with no "|" separator) can never expand into
     a full-width block and shove the following tabs out of the
     visual row order. Combined with itemTabLabel() truncation
     above, this keeps every tab compact and the row wrapping
     predictably in the tabs' real array order. */
  max-width: 200px;
  overflow: hidden;
}

.item-tab-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-tab:hover {
  border-color: var(--admin-blue);
  color: var(--admin-blue);
}

.item-tab.active {
  background: var(--admin-blue-soft);
  border-color: var(--admin-blue);
  color: var(--admin-blue);
}

.item-card {
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface-soft);
  overflow: hidden;
}

.item-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 0.9rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.item-card-header strong {
  display: block;
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.item-card-header small {
  display: block;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--admin-muted);
  margin-top: 0.1rem;
}

.item-card-body {
  padding: 0.9rem;
}

.item-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.7rem 0.9rem;
  border-top: 1px solid var(--admin-border);
  background: var(--admin-surface);
}

.item-card-footer .btn {
  min-height: 32px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
}

.section-toolbar-hint {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--admin-muted-light);
  text-align: center;
  flex: 1;
}

.photo-picker {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.photo-preview {
  width: 64px;
  height: 64px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1.5px dashed var(--admin-border-strong);
  background: var(--admin-surface);
  color: var(--admin-muted-light);
  overflow: hidden;
}

.photo-preview.filled {
  border-style: solid;
  border-color: var(--admin-border);
}

.photo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-picker-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.photo-choose-btn {
  position: relative;
  overflow: hidden;
}

.photo-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.icon-picker {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.icon-option {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  border: 1.5px solid var(--admin-border-strong);
  background: var(--admin-surface);
  color: var(--admin-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-option:hover {
  border-color: var(--admin-blue);
  color: var(--admin-blue);
}

.icon-option.active {
  background: var(--admin-blue-soft);
  border-color: var(--admin-blue);
  color: var(--admin-blue);
}

.add-item-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  width: 100%;
  margin-top: 0.75rem;
  padding: 0.6rem;
  border-radius: 10px;
  border: 1.5px dashed var(--admin-border-strong);
  background: transparent;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
}

.add-item-btn:hover {
  border-color: var(--admin-blue);
  color: var(--admin-blue);
  background: var(--admin-blue-soft);
}

.add-section-btn-full {
  justify-content: center;
  border-style: dashed;
}

/* Empty state */
.empty-sections {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2rem 1rem;
  color: var(--admin-muted);
  text-align: center;
}

.empty-sections p {
  font-size: 0.9rem;
  font-weight: 700;
  margin: 0;
}

/* ==============================
   SAVE BAR
   ============================== */
.save-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  padding: 0.85rem 1.1rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg);
  position: sticky;
  bottom: 1rem;
  z-index: 10;
}

.save-bar-left {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.save-bar-left strong {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.save-bar-left small {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--admin-muted);
}

.save-dot-large {
  width: 10px;
  height: 10px;
  flex-shrink: 0;
  border-radius: 999px;
  background: var(--admin-blue);
  box-shadow: 0 0 0 5px color-mix(in srgb, var(--admin-blue) 18%, transparent);
}

.save-dot-large.dirty {
  background: var(--admin-amber);
  box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.15);
}

.save-bar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* ==============================
   PREVIEW COLUMN
   ============================== */
.preview-column {
  width: 340px;
  flex-shrink: 0;
  position: sticky;
  top: calc(60px + 1.25rem);
  align-self: flex-start;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-lg);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px - 2.5rem);
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid var(--admin-border);
  background: var(--admin-bg-deep);
  flex-shrink: 0;
}

.preview-header-left {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.preview-header-left svg {
  color: var(--admin-blue);
}

.preview-content {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 1rem;
  display: grid;
  gap: 1.25rem;
}

.preview-hero {
  display: grid;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--admin-border);
}

.preview-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--admin-blue);
}

.preview-headline {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--admin-contrast);
  line-height: 1.25;
}

.preview-intro {
  margin: 0;
  font-size: 0.78rem;
  color: var(--admin-muted);
  line-height: 1.55;
}

.preview-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.15rem;
}

.preview-btn {
  display: inline-block;
  padding: 0.3rem 0.65rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
}

.preview-btn-primary {
  background: var(--admin-blue);
  color: #ffffff;
}

.preview-btn-secondary {
  border: 1px solid var(--admin-border-strong);
  color: var(--admin-contrast);
}

.preview-sections {
  display: grid;
  gap: 1rem;
}

.preview-section {
  padding: 0.65rem;
  border-radius: 8px;
}

.preview-section-heading {
  margin: 0 0 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--admin-contrast);
}

.preview-section-body {
  margin: 0 0 0.5rem;
  font-size: 0.72rem;
  color: var(--admin-muted);
  line-height: 1.5;
}

.preview-items {
  display: grid;
  gap: 0.35rem;
}

.preview-item-card {
  padding: 0.45rem 0.55rem;
  border: 1px solid var(--admin-border);
  border-radius: 6px;
  background: var(--admin-surface-soft);
}

.preview-item-card strong {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--admin-contrast);
  margin-bottom: 0.08rem;
}

.preview-item-card span {
  font-size: 0.68rem;
  color: var(--admin-muted);
}

.preview-item-simple {
  display: flex;
  align-items: baseline;
  gap: 0.4rem;
  font-size: 0.75rem;
  color: var(--admin-text);
}

.preview-bullet {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: var(--admin-muted-light);
  flex-shrink: 0;
  margin-top: 0.3em;
}

.preview-footer {
  padding: 0.5rem 0.85rem;
  border-top: 1px solid var(--admin-border);
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--admin-muted-light);
  text-align: center;
  flex-shrink: 0;
}

/* Preview Slider Transitions */
.preview-slide-enter-active,
.preview-slide-leave-active {
  transition: all 0.3s ease;
}

.preview-slide-enter-from,
.preview-slide-leave-to {
  opacity: 0;
  transform: translateX(20px);
}

/* Preview toggle button */
.preview-toggle-btn {
  position: fixed;
  right: 1.5rem;
  bottom: 5rem;
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface);
  color: var(--admin-muted);
  cursor: pointer;
  box-shadow: var(--admin-shadow-lg);
  z-index: 20;
  transition: all 0.2s ease;
}

.preview-toggle-btn:hover {
  color: var(--admin-blue);
  border-color: var(--admin-blue);
  box-shadow: var(--admin-shadow-xl);
  transform: translateY(-2px);
}

/* ==============================
   RESPONSIVE
   ============================== */
@media (min-width: 900px) {
  .editor-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .preview-column {
    display: none;
  }

  .preview-toggle-btn {
    display: grid;
  }
}

@media (max-width: 900px) {
  .editor-column {
    max-width: 100%;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 0.75rem;
  }

  .editor-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 0.85rem;
  }

  .header-right {
    width: 100%;
    align-items: flex-start;
  }

  .header-actions {
    flex-wrap: wrap;
  }

  .btn {
    font-size: 0.78rem;
    padding: 0.35rem 0.6rem;
    min-height: 32px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .save-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .save-bar-right {
    justify-content: flex-end;
  }

  .preview-toggle-btn {
    right: 0.75rem;
    bottom: 3rem;
  }

  .item-card-footer {
    flex-wrap: wrap;
  }

  .section-toolbar-hint {
    order: 3;
    width: 100%;
  }
}

@media (min-width: 1101px) {
  .preview-toggle-btn {
    display: none;
  }
}
</style>