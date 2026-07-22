// File: src/views/admin/NewsManagerView.vue
// A Vue 3 component for the Admin News Manager (CRUD for news_posts)
// Features: list, search, filter, sort, bulk actions, inline form with image preview,
// status management, pagination, and a polished UI matching the admin theme.

<script setup lang="ts">
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import { newsPostSelect, slugify, type NewsPostRow } from '@/lib/newsContent'
import { onMounted, ref, computed } from 'vue'

type RecordStatus = 'Published' | 'Draft' | 'Archived'

type NewsRecord = {
  id: string
  title: string
  status: RecordStatus
  author: string
  category: string
  updatedAt: string
  thumbnail: string
  summary: string
  content?: string
  image_url?: string
}

type NewsManagerConfig = {
  title: string
  eyebrow: string
  description: string
  newLabel: string
  categories: string[]
}

const config: NewsManagerConfig = {
  title: 'News',
  eyebrow: 'Publishing',
  description: 'Create, publish and manage public news stories.',
  newLabel: 'New news',
  categories: ['Education', 'Environment', 'Child Protection', 'Livelihood', 'WASH'],
}

const ui = useUiStore()

const records = ref<NewsRecord[]>([])
const search = ref('')
const statusFilter = ref<'all' | RecordStatus>('all')
const sortKey = ref<'updatedAt' | 'title' | 'status'>('updatedAt')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = 6

const formOpen = ref(false)
const formVisible = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  title: '',
  category: config.categories[0] ?? 'Announcement',
  status: 'Draft' as RecordStatus,
  author: 'Admin',
  summary: '',
  content: '',
  image_url: '',
})

function initials(value: string) {
  return value
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function toDbStatus(status: RecordStatus) {
  return status.toLowerCase() as 'published' | 'draft' | 'archived'
}

function toRecordStatus(status: string | null | undefined): RecordStatus {
  if (status === 'published') return 'Published'
  if (status === 'archived') return 'Archived'
  return 'Draft'
}

function categoryName(value: NewsPostRow['news_categories']) {
  if (Array.isArray(value)) return value[0]?.name ?? config.categories[0] ?? 'News'
  return value?.name ?? config.categories[0] ?? 'News'
}

function imageUrlFromMetadata(metadata: NewsPostRow['metadata']) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return ''
  const imageUrl = metadata.image_url
  const imagePath = metadata.image_path
  return typeof imageUrl === 'string'
    ? imageUrl
    : typeof imagePath === 'string'
      ? imagePath
      : ''
}

function rowToRecord(row: NewsPostRow): NewsRecord {
  const title = String(row.title ?? '')
  return {
    id: String(row.id),
    title,
    status: toRecordStatus(row.status),
    author: String(row.author_name ?? 'Santi Sena Communications Team'),
    category: categoryName(row.news_categories),
    updatedAt: String(row.updated_at ?? row.published_at ?? new Date().toISOString()),
    thumbnail: initials(title),
    summary: String(row.excerpt ?? ''),
    content: String(row.body ?? ''),
    image_url: imageUrlFromMetadata(row.metadata),
  }
}

async function ensureCategoryId(name: string) {
  const cleanName = name.trim() || config.categories[0] || 'News'
  const slug = slugify(cleanName)

  const { data: existing, error: existingError } = await supabase
    .from('news_categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existingError) throw existingError
  if (existing?.id) return String(existing.id)

  const { data, error } = await supabase
    .from('news_categories')
    .insert({ slug, name: cleanName, is_visible: true })
    .select('id')
    .single()

  if (error) throw error
  return String(data.id)
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

function formatDateRelative(value: string) {
  const now = Date.now()
  const date = new Date(value).getTime()
  const diff = now - date
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return formatDate(value)
}

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  const rows = records.value.filter((record) => {
    const matchesQuery =
      !query ||
      record.title.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      record.author.toLowerCase().includes(query) ||
      record.summary.toLowerCase().includes(query)
    const matchesStatus = statusFilter.value === 'all' || record.status === statusFilter.value
    return matchesQuery && matchesStatus
  })

  return [...rows].sort((a, b) => {
    if (sortKey.value === 'updatedAt') return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    return String(a[sortKey.value]).localeCompare(String(b[sortKey.value]))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))

const pagedRows = computed(() => {
  const start = (page.value - 1) * pageSize
  return filteredRows.value.slice(start, start + pageSize)
})

const selectedCount = computed(() => selectedIds.value.length)

const allVisibleSelected = computed(() => {
  return pagedRows.value.length > 0 && pagedRows.value.every((row) => selectedIds.value.includes(row.id))
})

const stats = computed(() => [
  { label: 'Total records', value: records.value.length, tone: 'blue' },
  {
    label: 'Published',
    value: records.value.filter((row) => row.status === 'Published').length,
    tone: 'green',
  },
  {
    label: 'Draft',
    value: records.value.filter((row) => row.status === 'Draft').length,
    tone: 'orange',
  },
  {
    label: 'Archived',
    value: records.value.filter((row) => row.status === 'Archived').length,
    tone: 'slate',
  },
])

const hasImagePreview = computed(() => {
  return form.value.image_url && form.value.image_url.trim().length > 0
})

function isSelected(id: string) {
  return selectedIds.value.includes(id)
}

function toggleSelected(id: string) {
  selectedIds.value = isSelected(id)
    ? selectedIds.value.filter((selectedId) => selectedId !== id)
    : [...selectedIds.value, id]
}

function toggleVisibleSelection(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const visibleIds = pagedRows.value.map((row) => row.id)

  selectedIds.value = checked
    ? Array.from(new Set([...selectedIds.value, ...visibleIds]))
    : selectedIds.value.filter((id) => !visibleIds.includes(id))
}

function openCreate() {
  editingId.value = null
  form.value = {
    title: '',
    category: config.categories[0] ?? 'Announcement',
    status: 'Draft',
    author: 'Admin',
    summary: '',
    content: '',
    image_url: '',
  }
  formVisible.value = true
  setTimeout(() => { formOpen.value = true }, 20)
}

function editRecord(record: NewsRecord) {
  editingId.value = record.id
  form.value = {
    title: record.title,
    category: record.category,
    status: record.status,
    author: record.author,
    summary: record.summary,
    content: record.content ?? '',
    image_url: record.image_url ?? '',
  }
  formVisible.value = true
  setTimeout(() => { formOpen.value = true }, 20)
}

function closeForm() {
  formOpen.value = false
  setTimeout(() => { formVisible.value = false }, 250)
}

async function saveRecord() {
  const title = form.value.title.trim()
  if (!title) {
    ui.addToast('Title is required.', 'error')
    return
  }

  const payload: Partial<NewsRecord> = {
    title,
    category: form.value.category,
    status: form.value.status,
    author: form.value.author.trim() || 'Admin',
    summary: form.value.summary.trim(),
    updatedAt: new Date().toISOString(),
    thumbnail: initials(title),
  }

  try {
    const savedAt = payload.updatedAt ?? new Date().toISOString()
    const categoryId = await ensureCategoryId(form.value.category)
    const dbStatus = toDbStatus(form.value.status)
    const rowPayload = {
      title: payload.title,
      slug: slugify(title),
      category_id: categoryId,
      excerpt: payload.summary,
      body: form.value.content,
      status: dbStatus,
      author_name: payload.author,
      read_time: '3 min read',
      published_at: dbStatus === 'published' ? savedAt : null,
      metadata: { image_url: form.value.image_url },
      updated_at: savedAt,
    }

    if (editingId.value) {
      const { data, error } = await supabase
        .from('news_posts')
        .update(rowPayload)
        .eq('id', editingId.value)
        .select(newsPostSelect)
        .single()

      if (error) throw error
      const saved = rowToRecord(data as NewsPostRow)

      records.value = records.value.map((r) => (r.id === editingId.value ? saved : r))
      ui.addToast(`${saved.title} saved.`, 'success')
    } else {
      const { data, error } = await supabase
        .from('news_posts')
        .insert(rowPayload)
        .select(newsPostSelect)
        .single()

      if (error) throw error
      const saved = rowToRecord(data as NewsPostRow)

      records.value = [saved, ...records.value]
      ui.addToast(`${saved.title} saved.`, 'success')
    }

    closeForm()
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not save news.'
    ui.addToast(msg, 'error')
  }
}

async function duplicateRecord(record: NewsRecord) {
  try {
    const title = `${record.title} copy`
    const categoryId = await ensureCategoryId(record.category)
    const { data, error } = await supabase
      .from('news_posts')
      .insert({
        title,
        slug: `${slugify(title)}-${Date.now()}`,
        category_id: categoryId,
        excerpt: record.summary,
        body: record.content ?? '',
        status: 'draft',
        author_name: record.author,
        read_time: '3 min read',
        metadata: { image_url: record.image_url ?? '' },
      })
      .select(newsPostSelect)
      .single()

    if (error) throw error

    records.value = [rowToRecord(data as NewsPostRow), ...records.value]
    ui.addToast('Record duplicated as draft.', 'info')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not duplicate news.'
    ui.addToast(msg, 'error')
  }
}

async function togglePublish(record: NewsRecord) {
  const nextStatus: RecordStatus = record.status === 'Published' ? 'Draft' : 'Published'
  try {
    const savedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('news_posts')
      .update({
        status: toDbStatus(nextStatus),
        published_at: nextStatus === 'Published' ? savedAt : null,
        updated_at: savedAt,
      })
      .eq('id', record.id)
      .select(newsPostSelect)
      .single()

    if (error) throw error

    const updated = rowToRecord(data as NewsPostRow)

    records.value = records.value.map((r) => (r.id === record.id ? updated : r))
    ui.addToast(`${record.title} marked ${nextStatus.toLowerCase()}.`, 'success')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not update status.'
    ui.addToast(msg, 'error')
  }
}

function confirmDelete(record: NewsRecord) {
  ui.openModal('Delete content?', `Delete "${record.title}" from News?`, async () => {
    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', record.id)
      if (error) throw error

      records.value = records.value.filter((item) => item.id !== record.id)
      selectedIds.value = selectedIds.value.filter((id) => id !== record.id)
      ui.addToast('Content deleted.', 'warning')
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Could not delete.'
      ui.addToast(msg, 'error')
    }
  })
}

async function bulkStatus(status: RecordStatus) {
  if (!selectedIds.value.length) return

  try {
    const ids = [...selectedIds.value]
    const savedAt = new Date().toISOString()
    await Promise.all(
      ids.map(async (id) => {
        const { error } = await supabase
          .from('news_posts')
          .update({
            status: toDbStatus(status),
            published_at: status === 'Published' ? savedAt : null,
            updated_at: savedAt,
          })
          .eq('id', id)
        if (error) throw error
      }),
    )

    records.value = records.value.map((r) =>
      selectedIds.value.includes(r.id)
        ? { ...r, status, updatedAt: new Date().toISOString() }
        : r,
    )

    ui.addToast(`${selectedIds.value.length} records updated.`, 'success')
    selectedIds.value = []
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Bulk update failed.'
    ui.addToast(msg, 'error')
  }
}

function bulkPublish() {
  void bulkStatus('Published')
}

function bulkArchive() {
  void bulkStatus('Archived')
}

function bulkDelete() {
  if (!selectedIds.value.length) return

  ui.openModal(
    'Delete selected content?',
    `${selectedIds.value.length} records will be removed.`,
    async () => {
      try {
        const ids = [...selectedIds.value]
        const { error } = await supabase.from('news_posts').delete().in('id', ids)
        if (error) throw error

        const set = new Set(ids)
        records.value = records.value.filter((r) => !set.has(r.id))
        selectedIds.value = []
        ui.addToast('Selected content deleted.', 'warning')
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'Bulk delete failed.'
        ui.addToast(msg, 'error')
      }
    },
  )
}

async function loadNews() {
  try {
    const { data, error } = await supabase
      .from('news_posts')
      .select(newsPostSelect)
      .order('updated_at', { ascending: false })

    if (error) throw error

    records.value = ((data ?? []) as NewsPostRow[]).map(rowToRecord)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not load news.'
    ui.addToast(msg, 'error')
    records.value = []
  }
}

onMounted(() => {
  void loadNews()
})
</script>

<template>
  <div :class="['admin-module-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="module-main">
        <!-- Hero -->
        <header class="module-hero">
          <div>
            <p class="eyebrow">{{ config.eyebrow }}</p>
            <h1>{{ config.title }}</h1>
            <p>{{ config.description }}</p>
          </div>
          <div class="hero-actions">
            <button class="button button-secondary" type="button">Export CSV</button>
            <button class="button button-primary" type="button" @click="openCreate">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {{ config.newLabel }}
            </button>
          </div>
        </header>

        <!-- Stats -->
        <section class="stat-grid" aria-label="News statistics">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
            :class="`tone-${stat.tone}`"
          >
            <span>{{ stat.label }}</span>
            <strong>{{ stat.value }}</strong>
          </article>
        </section>

        <!-- Form (Slide-in) -->
        <transition name="form-slide">
          <section v-if="formVisible" class="form-card" aria-label="News form">
            <div class="panel-heading">
              <div>
                <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
                <h2>{{ editingId ? 'Update news' : config.newLabel }}</h2>
              </div>
              <button class="icon-button" type="button" @click="closeForm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form class="module-form" :class="{ 'form-visible': formOpen }" @submit.prevent="saveRecord">
              <label>
                <span>Title <span class="required">*</span></span>
                <input v-model="form.title" name="news-title" required placeholder="Enter news title" />
              </label>
              <label>
                <span>Category</span>
                <select v-model="form.category" name="news-category">
                  <option v-for="c in config.categories" :key="c" :value="c">{{ c }}</option>
                </select>
              </label>
              <label>
                <span>Status</span>
                <select v-model="form.status" name="news-status">
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>
              <label>
                <span>Author</span>
                <input v-model="form.author" name="news-author" placeholder="Author name" />
              </label>
              <label class="full">
                <span>Summary</span>
                <textarea v-model="form.summary" name="news-summary" rows="3"
                  placeholder="Brief summary of the news article..."></textarea>
              </label>
              <label class="full">
                <span>Content (HTML)</span>
                <textarea v-model="form.content" name="news-content" rows="8"
                  placeholder="<p>Write your news content here...</p>"
                  class="code-textarea"></textarea>
              </label>
              <label class="full">
                <span>Image URL</span>
                <input v-model="form.image_url" name="news-image-url"
                  placeholder="https://example.com/image.jpg" />
              </label>

              <!-- Image preview -->
              <div v-if="hasImagePreview" class="image-preview full">
                <img :src="form.image_url" alt="Preview" @error="($event.target as HTMLImageElement).style.display = 'none'" />
              </div>

              <div class="form-actions full">
                <button class="button button-secondary" type="button" @click="closeForm">
                  Cancel
                </button>
                <button class="button button-primary" type="submit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  {{ editingId ? 'Update' : 'Save' }}
                </button>
              </div>
            </form>
          </section>
        </transition>

        <!-- Table Card -->
        <section class="table-card">
          <div class="table-toolbar">
            <label class="search-field">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                v-model="search"
                name="news-search"
                type="search"
                placeholder="Search title, category, author..."
                class="search-input"
              />
            </label>
            <select
              v-model="statusFilter"
              name="news-status-filter"
              aria-label="Filter by status"
              class="filter-select"
            >
              <option value="all">All status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <select v-model="sortKey" name="news-sort-key" aria-label="Sort news" class="filter-select">
              <option value="updatedAt">Newest</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <!-- Bulk Action Bar -->
          <transition name="bulk-fade">
            <div v-if="selectedCount" class="bulk-bar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              <strong>{{ selectedCount }} selected</strong>
              <button type="button" class="bulk-btn publish" @click="bulkPublish">Bulk publish</button>
              <button type="button" class="bulk-btn archive" @click="bulkArchive">Bulk archive</button>
              <button type="button" class="bulk-btn danger" @click="bulkDelete">Bulk delete</button>
            </div>
          </transition>

          <!-- Table -->
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="col-check">
                    <input
                      type="checkbox"
                      name="news-select-all"
                      :checked="allVisibleSelected"
                      aria-label="Select visible rows"
                      @change="toggleVisibleSelection"
                    />
                  </th>
                  <th class="col-thumb">Thumb.</th>
                  <th class="col-title">Title</th>
                  <th class="col-status">Status</th>
                  <th class="col-author">Author</th>
                  <th class="col-category">Category</th>
                  <th class="col-date">Updated</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in pagedRows" :key="record.id" class="data-row"
                  :class="{ 'row-selected': isSelected(record.id) }">
                  <td>
                    <input
                      type="checkbox"
                      :name="`news-select-${record.id}`"
                      :checked="isSelected(record.id)"
                      :aria-label="`Select ${record.title}`"
                      @change="toggleSelected(record.id)"
                    />
                  </td>
                  <td>
                    <span class="thumb">{{ record.thumbnail }}</span>
                  </td>
                  <td>
                    <div class="title-cell">
                      <strong>{{ record.title }}</strong>
                      <small>{{ record.summary }}</small>
                    </div>
                  </td>
                  <td>
                    <span class="status" :class="record.status.toLowerCase()">{{ record.status }}</span>
                  </td>
                  <td>
                    <span class="author-name">{{ record.author }}</span>
                  </td>
                  <td>
                    <span class="category-tag">{{ record.category }}</span>
                  </td>
                  <td>
                    <span class="date-cell" :title="formatDate(record.updatedAt)">
                      {{ formatDateRelative(record.updatedAt) }}
                    </span>
                  </td>
                  <td>
                    <div class="row-actions">
                      <button type="button" class="row-action-btn" title="Edit" @click="editRecord(record)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button type="button" class="row-action-btn" title="Duplicate" @click="duplicateRecord(record)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      </button>
                      <button type="button" class="row-action-btn"
                        :class="{ 'publish-btn': record.status !== 'Published', 'unpublish-btn': record.status === 'Published' }"
                        :title="record.status === 'Published' ? 'Unpublish' : 'Publish'"
                        @click="togglePublish(record)">
                        <svg v-if="record.status === 'Published'" width="14" height="14" viewBox="0 0 24 24"
                          fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                          stroke-linejoin="round">
                          <rect x="6" y="4" width="4" height="16" />
                          <rect x="14" y="4" width="4" height="16" />
                        </svg>
                        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" stroke-width="2.2" stroke-linecap="round"
                          stroke-linejoin="round">
                          <polygon points="5 3 19 12 5 21 5 3" />
                        </svg>
                      </button>
                      <button type="button" class="row-action-btn danger" title="Delete"
                        @click="confirmDelete(record)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!pagedRows.length">
                  <td colspan="8">
                    <div class="empty-state">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="12" y1="18" x2="12" y2="12" />
                        <line x1="9" y1="15" x2="15" y2="15" />
                      </svg>
                      <strong>No records found</strong>
                      <span>Try another search or create a new record.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <footer class="pagination">
            <div class="pagination-info">
              <span>Page {{ page }} of {{ totalPages }}</span>
              <span class="total-records">({{ filteredRows.length }} records)</span>
            </div>
            <div class="pagination-controls">
              <button type="button" class="page-btn" :disabled="page === 1" @click="page = 1" title="First page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="11 17 6 12 11 7" />
                  <polyline points="18 17 13 12 18 7" />
                </svg>
              </button>
              <button type="button" class="page-btn" :disabled="page === 1" @click="page -= 1">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Previous
              </button>
              <span class="page-indicator">
                <input
                  type="number"
                  :value="page"
                  @change="(e) => { const v = parseInt((e.target as HTMLInputElement).value); if (v >= 1 && v <= totalPages) page = v; }"
                  :min="1"
                  :max="totalPages"
                  class="page-input"
                />
                <span class="page-sep">/</span>
                <span class="page-total">{{ totalPages }}</span>
              </span>
              <button type="button" class="page-btn" :disabled="page === totalPages" @click="page += 1">
                Next
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
              <button type="button" class="page-btn" :disabled="page === totalPages" @click="page = totalPages" title="Last page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="13 17 18 12 13 7" />
                  <polyline points="6 17 11 12 6 7" />
                </svg>
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ===== Layout ===== */
.admin-module-page {
  min-height: 100vh;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-text);
}

.admin-layout {
  display: flex;
}

.module-main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 2rem 2rem;
}

/* ===== Shared Card ===== */
.module-hero,
.stat-card,
.form-card,
.table-card {
  border: 1px solid var(--admin-theme-border);
  border-radius: 16px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

/* ===== Hero ===== */
.module-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
}

.eyebrow {
  margin: 0 0 0.4rem;
  color: var(--admin-theme-teal);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

h1 {
  margin: 0 0 0.35rem;
  color: var(--admin-theme-contrast);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
}

h2 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.05rem;
  font-weight: 700;
}

.module-hero p:not(.eyebrow) {
  max-width: 660px;
  margin: 0;
  color: var(--admin-theme-muted);
  line-height: 1.6;
  font-size: 0.9rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  align-items: flex-start;
}

/* ===== Buttons ===== */
.button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  border-radius: 10px;
  padding: 0.55rem 1rem;
  font-weight: 700;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.button-primary {
  border: 1px solid var(--admin-theme-teal);
  background: var(--admin-theme-teal);
  color: #ffffff;
}

.button-primary:hover {
  background: color-mix(in srgb, var(--admin-theme-teal) 85%, #000);
  border-color: color-mix(in srgb, var(--admin-theme-teal) 80%, #000);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--admin-theme-teal) 30%, transparent);
}

.button-secondary,
.icon-button {
  border: 1px solid var(--admin-theme-border);
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
}

.button-secondary:hover {
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border-strong);
}

.icon-button {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  cursor: pointer;
  padding: 0;
  flex-shrink: 0;
}

.icon-button:hover {
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border-strong);
}

/* ===== Stat Grid ===== */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  display: grid;
  gap: 0.35rem;
  min-height: 100px;
  padding: 1rem 1.25rem;
  border-top: 4px solid var(--tone);
}

.stat-card span {
  color: var(--admin-theme-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stat-card strong {
  color: var(--admin-theme-contrast);
  font-size: 1.8rem;
  line-height: 1;
  font-weight: 700;
}

.tone-blue { --tone: var(--admin-theme-teal); }
.tone-green { --tone: var(--admin-theme-primary); }
.tone-orange { --tone: var(--admin-theme-gold); }
.tone-slate { --tone: #64748b; }

/* ===== Form Card ===== */
.form-card {
  margin-top: 1rem;
  padding: 1.25rem;
  overflow: hidden;
}

.panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.module-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1.25rem;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.module-form.form-visible {
  opacity: 1;
  transform: translateY(0);
}

label {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.required {
  color: var(--admin-theme-danger);
}

.full {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  padding: 0.65rem 0.82rem;
  font-family: inherit;
  font-size: 0.9rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: var(--admin-theme-teal);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-teal) 15%, transparent);
}

.code-textarea {
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.82rem;
  line-height: 1.5;
  tab-size: 2;
}

.image-preview {
  overflow: hidden;
  border-radius: 10px;
  border: 1px solid var(--admin-theme-border);
  max-height: 200px;
}

.image-preview img {
  width: 100%;
  height: auto;
  max-height: 200px;
  object-fit: cover;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.55rem;
  margin-top: 0.5rem;
}

/* ===== Form transition ===== */
.form-slide-enter-active {
  transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
}
.form-slide-leave-active {
  transition: all 0.25s ease;
}
.form-slide-enter-from,
.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-15px) scale(0.97);
}

/* ===== Table Card ===== */
.table-card {
  margin-top: 1rem;
  padding: 1.25rem;
}

.table-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-field {
  flex: 1 1 280px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--admin-theme-muted);
  pointer-events: none;
}

.search-input {
  padding-left: 2.2rem;
}

.filter-select {
  min-width: 140px;
}

/* ===== Bulk Bar ===== */
.bulk-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.9rem;
  border: 1px solid color-mix(in srgb, var(--admin-theme-teal) 20%, transparent);
  border-radius: 12px;
  background: color-mix(in srgb, var(--admin-theme-teal) 8%, transparent);
  padding: 0.7rem 0.9rem;
  font-size: 0.85rem;
}

.bulk-bar strong {
  color: var(--admin-theme-contrast);
  font-weight: 700;
  margin-right: 0.5rem;
}

.bulk-btn {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  padding: 0.35rem 0.7rem;
  font-weight: 700;
  font-size: 0.78rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.bulk-btn:hover {
  background: var(--admin-theme-surface-soft);
}

.bulk-btn.publish {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, transparent);
  color: var(--admin-theme-primary);
}

.bulk-btn.publish:hover {
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, transparent);
}

.bulk-btn.archive {
  border-color: color-mix(in srgb, #64748b 30%, transparent);
  color: #64748b;
}

.bulk-btn.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 30%, transparent);
  color: var(--admin-theme-danger);
}

.bulk-btn.danger:hover {
  background: color-mix(in srgb, var(--admin-theme-danger) 10%, transparent);
}

/* ===== Bulk Fade Transition ===== */
.bulk-fade-enter-active,
.bulk-fade-leave-active {
  transition: all 0.2s ease;
}
.bulk-fade-enter-from,
.bulk-fade-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

/* ===== Table ===== */
.table-wrap {
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 14px;
}

table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--admin-theme-border);
  padding: 0.75rem 0.85rem;
  text-align: left;
  vertical-align: middle;
}

th {
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.col-check,
.col-thumb {
  width: 48px;
}

.col-actions {
  width: 180px;
}

.col-status {
  width: 100px;
}

.col-category {
  width: 130px;
}

.col-date {
  width: 110px;
}

td {
  color: var(--admin-theme-text);
  font-size: 0.88rem;
}

.data-row {
  transition: background 0.12s ease;
}

.data-row:hover {
  background: color-mix(in srgb, var(--admin-theme-teal) 4%, transparent);
}

.data-row.row-selected {
  background: color-mix(in srgb, var(--admin-theme-teal) 8%, transparent);
}

.data-row:last-child td {
  border-bottom: none;
}

/* ===== Thumbnail ===== */
.thumb {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--admin-theme-teal) 14%, transparent);
  color: var(--admin-theme-teal);
  font-weight: 700;
  font-size: 0.78rem;
}

/* ===== Title Cell ===== */
.title-cell {
  max-width: 280px;
}

.title-cell strong {
  display: block;
  color: var(--admin-theme-contrast);
  font-weight: 700;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.title-cell small {
  display: block;
  margin-top: 0.15rem;
  color: var(--admin-theme-muted);
  font-size: 0.78rem;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ===== Status Badge ===== */
.status {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.2rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status.published {
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, transparent);
  color: var(--admin-theme-primary);
}

.status.draft {
  background: color-mix(in srgb, var(--admin-theme-gold) 14%, transparent);
  color: var(--admin-theme-gold);
}

.status.archived {
  background: color-mix(in srgb, #64748b 14%, transparent);
  color: #64748b;
}

/* ===== Author ===== */
.author-name {
  color: var(--admin-theme-text);
  font-weight: 600;
  font-size: 0.82rem;
}

/* ===== Category Tag ===== */
.category-tag {
  display: inline-flex;
  border-radius: 6px;
  padding: 0.15rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  border: 1px solid var(--admin-theme-border);
}

/* ===== Date Cell ===== */
.date-cell {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
}

/* ===== Row Actions ===== */
.row-actions {
  display: flex;
  gap: 0.2rem;
}

.row-action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--admin-theme-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-action-btn:hover {
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border);
  color: var(--admin-theme-contrast);
}

.row-action-btn.publish-btn:hover {
  color: var(--admin-theme-primary);
  border-color: color-mix(in srgb, var(--admin-theme-primary) 30%, transparent);
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
}

.row-action-btn.unpublish-btn:hover {
  color: var(--admin-theme-gold);
  border-color: color-mix(in srgb, var(--admin-theme-gold) 30%, transparent);
  background: color-mix(in srgb, var(--admin-theme-gold) 8%, transparent);
}

.row-action-btn.danger:hover {
  color: var(--admin-theme-danger);
  border-color: color-mix(in srgb, var(--admin-theme-danger) 30%, transparent);
  background: color-mix(in srgb, var(--admin-theme-danger) 8%, transparent);
}

/* ===== Empty State ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  min-height: 160px;
  justify-content: center;
  color: var(--admin-theme-muted);
  text-align: center;
}

.empty-state svg {
  opacity: 0.25;
  margin-bottom: 0.25rem;
}

.empty-state strong {
  color: var(--admin-theme-contrast-soft);
  font-weight: 700;
}

.empty-state span {
  color: var(--admin-theme-muted);
  font-size: 0.85rem;
}

/* ===== Pagination ===== */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.pagination-info {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.total-records {
  margin-left: 0.35rem;
  opacity: 0.7;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.page-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-height: 36px;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  padding: 0.35rem 0.6rem;
  font-weight: 700;
  font-size: 0.82rem;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.15s ease;
}

.page-btn:hover:not(:disabled) {
  background: var(--admin-theme-surface-soft);
  border-color: var(--admin-theme-border-strong);
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.page-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.page-input {
  width: 40px;
  text-align: center;
  padding: 0.25rem 0.3rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-contrast);
  font-size: 0.82rem;
  font-weight: 700;
  font-family: inherit;
  -moz-appearance: textfield;
}

.page-input::-webkit-outer-spin-button,
.page-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.page-input:focus {
  outline: none;
  border-color: var(--admin-theme-teal);
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--admin-theme-teal) 15%, transparent);
}

.page-sep {
  opacity: 0.5;
}

.page-total {
  font-weight: 700;
  color: var(--admin-theme-contrast);
}

/* ===== Responsive ===== */
@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .module-main {
    padding: 1rem;
  }
}

@media (max-width: 720px) {
  .module-hero {
    flex-direction: column;
  }
  .module-form {
    grid-template-columns: 1fr;
  }
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .pagination {
    flex-direction: column;
    align-items: flex-start;
  }
  .pagination-controls {
    width: 100%;
    justify-content: center;
  }
  .table-toolbar {
    flex-direction: column;
  }
  .search-field {
    width: 100%;
  }
  .filter-select {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
  .hero-actions {
    width: 100%;
  }
  .hero-actions .button {
    flex: 1;
    justify-content: center;
  }
  .row-actions {
    gap: 0.1rem;
  }
  .row-action-btn {
    width: 28px;
    height: 28px;
  }
  .row-action-btn svg {
    width: 12px;
    height: 12px;
  }
}
</style>

