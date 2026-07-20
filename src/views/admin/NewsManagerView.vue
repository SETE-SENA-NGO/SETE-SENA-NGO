<script setup lang="ts">
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import { imageUrlHelpText, normalizeMediaUrl } from '@/lib/media'
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

  // optional fields for rendering / future expansion
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
const imageUrlHint = imageUrlHelpText()

const records = ref<NewsRecord[]>([])
const search = ref('')
const statusFilter = ref<'all' | RecordStatus>('all')
const sortKey = ref<'updatedAt' | 'title' | 'status'>('updatedAt')
const selectedIds = ref<string[]>([])
const page = ref(1)
const pageSize = 6

const formOpen = ref(false)
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
  const value = typeof imageUrl === 'string'
    ? imageUrl
    : typeof imagePath === 'string'
      ? imagePath
      : ''
  return normalizeMediaUrl(value)
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
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
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
  formOpen.value = true
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
  formOpen.value = true
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
      metadata: { image_url: normalizeMediaUrl(form.value.image_url) },
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

    formOpen.value = false
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
        metadata: { image_url: normalizeMediaUrl(record.image_url ?? '') },
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
    // Bulk update strategy: iterate so every row gets a clean publish timestamp.
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
  <div :class="['admin-module-page', { 'sidebar-open': false }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="module-main">
        <header class="module-hero">
          <div>
            <p class="eyebrow">{{ config.eyebrow }}</p>
            <h1>{{ config.title }}</h1>
            <p>{{ config.description }}</p>
          </div>
          <div class="hero-actions">
            <button class="button button-secondary" type="button">Export CSV</button>
            <button class="button button-primary" type="button" @click="openCreate">
              {{ config.newLabel }}
            </button>
          </div>
        </header>

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

        <section v-if="formOpen" class="form-card" aria-label="News form">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
              <h2>{{ editingId ? 'Update news' : config.newLabel }}</h2>
            </div>
            <button class="icon-button" type="button" @click="formOpen = false">Close</button>
          </div>

          <form class="module-form" @submit.prevent="saveRecord">
            <label>
              <span>Title</span>
              <input v-model="form.title" name="news-title" required />
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
              <input v-model="form.author" name="news-author" />
            </label>
            <label class="full">
              <span>Summary</span>
              <textarea v-model="form.summary" name="news-summary" rows="3"></textarea>
            </label>
            <label class="full">
              <span>Content (HTML)</span>
              <textarea v-model="form.content" name="news-content" rows="5"></textarea>
            </label>
            <label class="full">
              <span>Image URL</span>
              <input
                v-model="form.image_url"
                name="news-image-url"
                placeholder="https://drive.google.com/file/d/.../view"
              />
              <small>{{ imageUrlHint }}</small>
            </label>

            <div class="form-actions full">
              <button class="button button-secondary" type="button" @click="formOpen = false">
                Cancel
              </button>
              <button class="button button-primary" type="submit">Save</button>
            </div>
          </form>
        </section>

        <section class="table-card">
          <div class="table-toolbar">
            <label class="search-field">
              <span class="sr-only">Search news</span>
              <input
                v-model="search"
                name="news-search"
                type="search"
                placeholder="Search title, category, author..."
              />
            </label>
            <select
              v-model="statusFilter"
              name="news-status-filter"
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <select v-model="sortKey" name="news-sort-key" aria-label="Sort news">
              <option value="updatedAt">Newest</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div v-if="selectedCount" class="bulk-bar">
            <strong>{{ selectedCount }} selected</strong>
            <button type="button" @click="bulkPublish">Bulk publish</button>
            <button type="button" @click="bulkArchive">Bulk archive</button>
            <button type="button" class="danger" @click="bulkDelete">Bulk delete</button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      name="news-select-all"
                      :checked="allVisibleSelected"
                      aria-label="Select visible rows"
                      @change="toggleVisibleSelection"
                    />
                  </th>
                  <th>Thumbnail</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Author</th>
                  <th>Category</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in pagedRows" :key="record.id">
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
                    <strong>{{ record.title }}</strong>
                    <small>{{ record.summary }}</small>
                  </td>
                  <td>
                    <span class="status" :class="record.status.toLowerCase()">{{ record.status }}</span>
                  </td>
                  <td>{{ record.author }}</td>
                  <td>{{ record.category }}</td>
                  <td>{{ formatDate(record.updatedAt) }}</td>
                  <td>
                    <div class="row-actions">
                      <button type="button" @click="editRecord(record)">Edit</button>
                      <button type="button" @click="duplicateRecord(record)">Duplicate</button>
                      <button type="button" @click="togglePublish(record)">
                        {{ record.status === 'Published' ? 'Unpublish' : 'Publish' }}
                      </button>
                      <button type="button" class="danger" @click="confirmDelete(record)">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!pagedRows.length">
                  <td colspan="8">
                    <div class="empty-state">
                      <strong>No records found</strong>
                      <span>Try another search or create a new record.</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <footer class="pagination">
            <span>Page {{ page }} of {{ totalPages }}</span>
            <div>
              <button type="button" :disabled="page === 1" @click="page -= 1">Previous</button>
              <button type="button" :disabled="page === totalPages" @click="page += 1">Next</button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-module-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-text: var(--admin-theme-text);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-muted: var(--admin-theme-muted);
  --admin-blue: var(--admin-theme-teal);
  --admin-success: var(--admin-theme-primary);
  --admin-warning: var(--admin-theme-gold);
  --admin-error: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
}

.admin-layout {
  display: flex;
}

.module-main {
  flex: 1;
  width: 100%;
  padding: 1.25rem 2rem 2rem;
}

.module-hero,
.stat-card,
.form-card,
.table-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.module-hero {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem;
}

.eyebrow {
  margin: 0 0 0.45rem;
  color: var(--admin-blue);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0.35rem;
  color: var(--admin-contrast);
  font-size: clamp(1.7rem, 3vw, 2.4rem);
}

h2 {
  margin-bottom: 0;
  color: var(--admin-contrast);
  font-size: 1.05rem;
}

.module-hero p:not(.eyebrow) {
  max-width: 660px;
  margin-bottom: 0;
  color: var(--admin-muted);
  line-height: 1.65;
}

.hero-actions,
.form-actions,
.row-actions,
.pagination div {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.button,
.icon-button,
.bulk-bar button,
.row-actions button,
.pagination button {
  min-height: 40px;
  border-radius: 10px;
  padding: 0.55rem 0.85rem;
  font-weight: 850;
  cursor: pointer;
}

.button-primary {
  border: 1px solid var(--admin-blue);
  background: var(--admin-blue);
  color: #ffffff;
}

.button-secondary,
.icon-button,
.pagination button {
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  color: var(--admin-contrast);
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.stat-card {
  display: grid;
  gap: 0.35rem;
  min-height: 110px;
  padding: 1rem;
  border-top: 4px solid var(--tone);
}

.stat-card span {
  color: var(--admin-muted);
  font-weight: 850;
}

.stat-card strong {
  color: var(--admin-contrast);
  font-size: 2rem;
  line-height: 1;
}

.tone-blue {
  --tone: var(--admin-blue);
}

.tone-green {
  --tone: var(--admin-success);
}

.tone-orange {
  --tone: var(--admin-warning);
}

.tone-slate {
  --tone: #64748b;
}

.form-card,
.table-card {
  margin-top: 1rem;
  padding: 1rem;
}

.panel-heading,
.table-toolbar,
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.module-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
  margin-top: 1rem;
}

label {
  display: grid;
  gap: 0.4rem;
  color: var(--admin-muted);
  font-weight: 800;
}

.full {
  grid-column: 1 / -1;
}

input,
select,
textarea {
  width: 100%;
  border: 1px solid var(--admin-border-strong);
  border-radius: 12px;
  background: var(--admin-surface);
  color: var(--admin-contrast);
  padding: 0.72rem 0.82rem;
}

.table-toolbar {
  flex-wrap: wrap;
}

.search-field {
  flex: 1 1 280px;
}

.sr-only {
  width: 1px;
  height: 1px;
  position: absolute;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.bulk-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.6rem;
  margin-top: 0.9rem;
  border: 1px solid rgba(37, 99, 235, 0.18);
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.08);
  padding: 0.75rem;
}

.bulk-bar .danger,
.row-actions .danger {
  border-color: rgba(220, 38, 38, 0.35);
  color: var(--admin-error);
}

.table-wrap {
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid var(--admin-border);
  border-radius: 14px;
}

table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--admin-border);
  padding: 0.85rem;
  text-align: left;
  vertical-align: top;
}

th {
  background: var(--admin-surface-soft);
  color: var(--admin-muted);
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

td {
  color: var(--admin-text);
}

td small {
  display: block;
  max-width: 320px;
  margin-top: 0.2rem;
  color: var(--admin-muted);
  line-height: 1.45;
}

.thumb {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--admin-blue);
  font-weight: 900;
}

.status {
  display: inline-flex;
  border-radius: 999px;
  padding: 0.28rem 0.55rem;
  font-size: 0.76rem;
  font-weight: 900;
}

.status.published {
  background: rgba(22, 163, 74, 0.12);
  color: #15803d;
}

.status.draft {
  background: rgba(249, 115, 22, 0.12);
  color: #c2410c;
}

.status.archived {
  background: rgba(100, 116, 139, 0.14);
  color: #475569;
}

.empty-state {
  display: grid;
  place-items: center;
  gap: 0.25rem;
  min-height: 160px;
  color: var(--admin-muted);
  text-align: center;
}

.pagination {
  margin-top: 1rem;
}

.pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .module-main {
    padding: 1rem;
  }
  .module-hero,
  .panel-heading,
  .pagination {
    display: grid;
  }
  .module-form,
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
