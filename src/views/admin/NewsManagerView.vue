<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import { newsPostSelect, slugify, type NewsPostRow } from '@/lib/newsContent'

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

const ui = useUiStore()
useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const config = {
  title: 'News',
  eyebrow: 'Publishing',
  description: 'Create, publish and manage public news stories.',
  newLabel: 'New news',
  categories: ['Education', 'Environment', 'Child Protection', 'Livelihood', 'WASH'],
}

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
  return value.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function toDbStatus(status: RecordStatus) { return status.toLowerCase() as 'published' | 'draft' | 'archived' }
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
  const url = metadata.image_url; const path = metadata.image_path
  return typeof url === 'string' ? url : typeof path === 'string' ? path : ''
}

function rowToRecord(row: NewsPostRow): NewsRecord {
  const title = String(row.title ?? '')
  return {
    id: String(row.id), title, status: toRecordStatus(row.status),
    author: String(row.author_name ?? 'Santi Sena Communications Team'),
    category: categoryName(row.news_categories),
    updatedAt: String(row.updated_at ?? row.published_at ?? new Date().toISOString()),
    thumbnail: initials(title), summary: String(row.excerpt ?? ''),
    content: String(row.body ?? ''), image_url: imageUrlFromMetadata(row.metadata),
  }
}

async function ensureCategoryId(name: string) {
  const cleanName = name.trim() || config.categories[0] || 'News'
  const slug = slugify(cleanName)
  const { data: existing } = await supabase.from('news_categories').select('id').eq('slug', slug).maybeSingle()
  if (existing?.id) return String(existing.id)
  const { data } = await supabase.from('news_categories').insert({ slug, name: cleanName, is_visible: true }).select('id').single()
  return String(data.id)
}

function formatDate(value: string) { return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value)) }

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  let rows = records.value.filter((r) => {
    const match = !query || r.title.toLowerCase().includes(query) || r.category.toLowerCase().includes(query) || r.author.toLowerCase().includes(query) || r.summary.toLowerCase().includes(query)
    const status = statusFilter.value === 'all' || r.status === statusFilter.value
    return match && status
  })
  return [...rows].sort((a, b) => {
    if (sortKey.value === 'updatedAt') return Date.parse(b.updatedAt) - Date.parse(a.updatedAt)
    return String(a[sortKey.value]).localeCompare(String(b[sortKey.value]))
  })
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredRows.value.length / pageSize)))
const pagedRows = computed(() => { const s = (page.value - 1) * pageSize; return filteredRows.value.slice(s, s + pageSize) })
const selectedCount = computed(() => selectedIds.value.length)
const allVisibleSelected = computed(() => pagedRows.value.length > 0 && pagedRows.value.every((r) => selectedIds.value.includes(r.id)))
const stats = computed(() => [
  { label: 'Total records', value: records.value.length, tone: 'blue' },
  { label: 'Published', value: records.value.filter((r) => r.status === 'Published').length, tone: 'green' },
  { label: 'Draft', value: records.value.filter((r) => r.status === 'Draft').length, tone: 'orange' },
  { label: 'Archived', value: records.value.filter((r) => r.status === 'Archived').length, tone: 'slate' },
])

function isSelected(id: string) { return selectedIds.value.includes(id) }
function toggleSelected(id: string) {
  selectedIds.value = isSelected(id) ? selectedIds.value.filter((sid) => sid !== id) : [...selectedIds.value, id]
}
function toggleVisibleSelection(event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  const visibleIds = pagedRows.value.map((r) => r.id)
  selectedIds.value = checked ? Array.from(new Set([...selectedIds.value, ...visibleIds])) : selectedIds.value.filter((id) => !visibleIds.includes(id))
}

function openCreate() {
  editingId.value = null
  form.value = { title: '', category: config.categories[0] ?? 'Announcement', status: 'Draft', author: 'Admin', summary: '', content: '', image_url: '' }
  formOpen.value = true
}

function editRecord(record: NewsRecord) {
  editingId.value = record.id
  form.value = { title: record.title, category: record.category, status: record.status, author: record.author, summary: record.summary, content: record.content ?? '', image_url: record.image_url ?? '' }
  formOpen.value = true
}

async function saveRecord() {
  const title = form.value.title.trim()
  if (!title) { ui.addToast('Title is required.', 'error'); return }
  const payload: Partial<NewsRecord> = { title, category: form.value.category, status: form.value.status, author: form.value.author.trim() || 'Admin', summary: form.value.summary.trim(), updatedAt: new Date().toISOString(), thumbnail: initials(title) }
  try {
    const savedAt = payload.updatedAt ?? new Date().toISOString()
    const categoryId = await ensureCategoryId(form.value.category)
    const dbStatus = toDbStatus(form.value.status)
    const rowPayload = { title: payload.title, slug: slugify(title), category_id: categoryId, excerpt: payload.summary, body: form.value.content, status: dbStatus, author_name: payload.author, read_time: '3 min read', published_at: dbStatus === 'published' ? savedAt : null, metadata: { image_url: form.value.image_url }, updated_at: savedAt }

    if (editingId.value) {
      const { data, error } = await supabase.from('news_posts').update(rowPayload).eq('id', editingId.value).select(newsPostSelect).single()
      if (error) throw error
      const saved = rowToRecord(data as NewsPostRow)
      records.value = records.value.map((r) => (r.id === editingId.value ? saved : r))
      ui.addToast(`${saved.title} saved.`, 'success')
    } else {
      const { data, error } = await supabase.from('news_posts').insert(rowPayload).select(newsPostSelect).single()
      if (error) throw error
      const saved = rowToRecord(data as NewsPostRow)
      records.value = [saved, ...records.value]
      ui.addToast(`${saved.title} saved.`, 'success')
    }
    formOpen.value = false
  } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Could not save news.', 'error') }
}

async function duplicateRecord(record: NewsRecord) {
  try {
    const title = `${record.title} copy`
    const categoryId = await ensureCategoryId(record.category)
    const { data, error } = await supabase.from('news_posts').insert({ title, slug: `${slugify(title)}-${Date.now()}`, category_id: categoryId, excerpt: record.summary, body: record.content ?? '', status: 'draft', author_name: record.author, read_time: '3 min read', metadata: { image_url: record.image_url ?? '' } }).select(newsPostSelect).single()
    if (error) throw error
    records.value = [rowToRecord(data as NewsPostRow), ...records.value]
    ui.addToast('Record duplicated as draft.', 'info')
  } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Could not duplicate news.', 'error') }
}

async function togglePublish(record: NewsRecord) {
  const nextStatus: RecordStatus = record.status === 'Published' ? 'Draft' : 'Published'
  try {
    const savedAt = new Date().toISOString()
    const { data, error } = await supabase.from('news_posts').update({ status: toDbStatus(nextStatus), published_at: nextStatus === 'Published' ? savedAt : null, updated_at: savedAt }).eq('id', record.id).select(newsPostSelect).single()
    if (error) throw error
    const updated = rowToRecord(data as NewsPostRow)
    records.value = records.value.map((r) => (r.id === record.id ? updated : r))
    ui.addToast(`${record.title} marked ${nextStatus.toLowerCase()}.`, 'success')
  } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Could not update status.', 'error') }
}

function confirmDelete(record: NewsRecord) {
  confirmDialog('Delete content?', `Delete "${record.title}" from News?`, async () => {
    try {
      const { error } = await supabase.from('news_posts').delete().eq('id', record.id)
      if (error) throw error
      records.value = records.value.filter((item) => item.id !== record.id)
      selectedIds.value = selectedIds.value.filter((id) => id !== record.id)
      ui.addToast('Content deleted.', 'warning')
    } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Could not delete.', 'error') }
  })
}

async function bulkStatus(status: RecordStatus) {
  if (!selectedIds.value.length) return
  try {
    const ids = [...selectedIds.value]
    const savedAt = new Date().toISOString()
    await Promise.all(ids.map(async (id) => {
      const { error } = await supabase.from('news_posts').update({ status: toDbStatus(status), published_at: status === 'Published' ? savedAt : null, updated_at: savedAt }).eq('id', id)
      if (error) throw error
    }))
    records.value = records.value.map((r) => selectedIds.value.includes(r.id) ? { ...r, status, updatedAt: new Date().toISOString() } : r)
    ui.addToast(`${selectedIds.value.length} records updated.`, 'success')
    selectedIds.value = []
  } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Bulk update failed.', 'error') }
}

function bulkDelete() {
  if (!selectedIds.value.length) return
  confirmDialog('Delete selected content?', `${selectedIds.value.length} records will be removed.`, async () => {
    try {
      const ids = [...selectedIds.value]
      const { error } = await supabase.from('news_posts').delete().in('id', ids)
      if (error) throw error
      const set = new Set(ids)
      records.value = records.value.filter((r) => !set.has(r.id))
      selectedIds.value = []
      ui.addToast('Selected content deleted.', 'warning')
    } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Bulk delete failed.', 'error') }
  })
}

async function loadNews() {
  try {
    const { data, error } = await supabase.from('news_posts').select(newsPostSelect).order('updated_at', { ascending: false })
    if (error) throw error
    records.value = ((data ?? []) as NewsPostRow[]).map(rowToRecord)
  } catch (e) { ui.addToast(e instanceof Error ? e.message : 'Could not load news.', 'error'); records.value = [] }
}

onMounted(() => { void loadNews() })
</script>

<template>
  <v-app :class="['news-manager', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="text-caption font-weight-bold text-primary text-uppercase mb-1">{{ config.eyebrow }}</p>
            <h1>{{ config.title }}</h1>
            <p class="text-body-2 text-medium-emphasis mb-0">{{ config.description }}</p>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" prepend-icon="mdi-download" size="small">Export CSV</v-btn>
            <v-btn color="primary" variant="flat" prepend-icon="mdi-plus" size="small" @click="openCreate">{{ config.newLabel }}</v-btn>
          </div>
        </header>

        <!-- Stats -->
        <div class="stat-grid">
          <v-card v-for="stat in stats" :key="stat.label" variant="outlined" class="stat-card" :class="`stat-${stat.tone}`">
            <v-card-text class="pa-4">
              <p class="text-caption font-weight-bold text-medium-emphasis text-uppercase mb-1">{{ stat.label }}</p>
              <p class="text-h4 font-weight-bold mb-0">{{ stat.value }}</p>
            </v-card-text>
          </v-card>
        </div>

        <!-- Form -->
        <v-expand-transition>
          <v-card v-if="formOpen" variant="outlined" class="mt-4">
            <v-card-title class="d-flex align-center justify-space-between pa-4">
              <div>
                <p class="text-caption font-weight-bold text-primary text-uppercase mb-1">{{ editingId ? 'Edit' : 'Create' }}</p>
                <h2 class="text-h6 mb-0">{{ editingId ? 'Update news' : config.newLabel }}</h2>
              </div>
              <v-btn icon variant="tonal" size="small" @click="formOpen = false"><v-icon>mdi-close</v-icon></v-btn>
            </v-card-title>
            <v-card-text class="pa-4 pt-0">
              <v-form @submit.prevent="saveRecord">
                <div class="form-grid">
                  <v-text-field v-model="form.title" label="Title" required hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-select v-model="form.category" label="Category" :items="config.categories" hide-details density="comfortable" variant="outlined" />
                  <v-select v-model="form.status" label="Status" :items="['Draft','Published','Archived']" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="form.author" label="Author" hide-details density="comfortable" variant="outlined" />
                  <v-textarea v-model="form.summary" label="Summary" rows="3" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="form.content" label="Content (HTML)" rows="5" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-text-field v-model="form.image_url" label="Image URL" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <div class="field-wide d-flex ga-2 justify-end mt-2">
                    <v-btn variant="tonal" @click="formOpen = false">Cancel</v-btn>
                    <v-btn color="primary" variant="flat" type="submit">Save</v-btn>
                  </div>
                </div>
              </v-form>
            </v-card-text>
          </v-card>
        </v-expand-transition>

        <!-- Table -->
        <v-card variant="outlined" class="mt-4">
          <v-card-text class="pa-4">
            <!-- Toolbar -->
            <div class="d-flex flex-wrap align-center ga-3 mb-3">
              <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" label="Search title, category, author..." hide-details density="compact" variant="outlined" class="search-field" clearable />
              <v-select v-model="statusFilter" label="Filter" :items="[{value:'all',title:'All status'},{value:'Published',title:'Published'},{value:'Draft',title:'Draft'},{value:'Archived',title:'Archived'}]" hide-details density="compact" variant="outlined" class="flex-shrink-0" style="min-width:140px" item-title="title" item-value="value" />
              <v-select v-model="sortKey" label="Sort" :items="[{value:'updatedAt',title:'Newest'},{value:'title',title:'Title'},{value:'status',title:'Status'}]" hide-details density="compact" variant="outlined" class="flex-shrink-0" style="min-width:120px" item-title="title" item-value="value" />
            </div>

            <!-- Bulk actions -->
            <v-expand-transition>
              <div v-if="selectedCount" class="bulk-bar">
                <span class="font-weight-bold">{{ selectedCount }} selected</span>
                <v-btn size="x-small" variant="tonal" color="primary" @click="bulkStatus('Published')">Publish</v-btn>
                <v-btn size="x-small" variant="tonal" color="warning" @click="bulkStatus('Archived')">Archive</v-btn>
                <v-btn size="x-small" variant="tonal" color="error" @click="bulkDelete">Delete</v-btn>
              </div>
            </v-expand-transition>

            <!-- Table wrapper -->
            <div class="table-wrap">
              <v-table density="comfortable" hover>
                <thead>
                  <tr>
                    <th class="text-caption font-weight-bold text-uppercase" style="width:40px">
                      <v-checkbox-btn :model-value="allVisibleSelected" @update:model-value="toggleVisibleSelection" hide-details density="compact" />
                    </th>
                    <th class="text-caption font-weight-bold text-uppercase">Thumbnail</th>
                    <th class="text-caption font-weight-bold text-uppercase">Title</th>
                    <th class="text-caption font-weight-bold text-uppercase">Status</th>
                    <th class="text-caption font-weight-bold text-uppercase">Author</th>
                    <th class="text-caption font-weight-bold text-uppercase">Category</th>
                    <th class="text-caption font-weight-bold text-uppercase">Updated</th>
                    <th class="text-caption font-weight-bold text-uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in pagedRows" :key="record.id">
                    <td><v-checkbox-btn :model-value="isSelected(record.id)" @update:model-value="toggleSelected(record.id)" hide-details density="compact" /></td>
                    <td><v-avatar size="36" color="primary" variant="tonal" class="font-weight-bold">{{ record.thumbnail }}</v-avatar></td>
                    <td>
                      <div class="font-weight-bold">{{ record.title }}</div>
                      <div class="text-caption text-medium-emphasis text-truncate" style="max-width:240px">{{ record.summary }}</div>
                    </td>
                    <td>
                      <v-chip :color="record.status === 'Published' ? 'success' : record.status === 'Draft' ? 'warning' : 'default'" size="x-small" variant="tonal">{{ record.status }}</v-chip>
                    </td>
                    <td class="text-body-2">{{ record.author }}</td>
                    <td><v-chip size="x-small" variant="tonal">{{ record.category }}</v-chip></td>
                    <td class="text-body-2 text-medium-emphasis">{{ formatDate(record.updatedAt) }}</td>
                    <td>
                      <div class="d-flex ga-1 flex-nowrap">
                        <v-btn icon variant="text" size="x-small" @click="editRecord(record)" title="Edit"><v-icon size="small">mdi-pencil</v-icon></v-btn>
                        <v-btn icon variant="text" size="x-small" @click="duplicateRecord(record)" title="Duplicate"><v-icon size="small">mdi-content-copy</v-icon></v-btn>
                        <v-btn icon variant="text" size="x-small" @click="togglePublish(record)" :title="record.status === 'Published' ? 'Unpublish' : 'Publish'">
                          <v-icon size="small">{{ record.status === 'Published' ? 'mdi-cloud-off-outline' : 'mdi-cloud-check' }}</v-icon>
                        </v-btn>
                        <v-btn icon variant="text" size="x-small" color="error" @click="confirmDelete(record)" title="Delete"><v-icon size="small">mdi-delete</v-icon></v-btn>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!pagedRows.length">
                    <td colspan="8">
                      <div class="d-flex flex-column align-center pa-8 text-medium-emphasis">
                        <v-icon size="48" class="mb-2">mdi-inbox-outline</v-icon>
                        <span class="font-weight-bold">No records found</span>
                        <span class="text-caption">Try another search or create a new record.</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
            </div>

            <!-- Pagination -->
            <div class="d-flex align-center justify-space-between mt-3">
              <span class="text-caption text-medium-emphasis">Page {{ page }} of {{ totalPages }}</span>
              <div class="d-flex ga-2">
                <v-btn variant="tonal" size="small" :disabled="page === 1" @click="page -= 1">Previous</v-btn>
                <v-btn variant="tonal" size="small" :disabled="page === totalPages" @click="page += 1">Next</v-btn>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </main>
    </div>
    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.news-manager { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
.admin-layout { min-height: 100vh; }
.manager-main { min-height: 100vh; padding: 1.5rem 2rem 2.5rem; }
.manager-hero { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; padding: 1rem 1.5rem; border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); }
.manager-hero h1 { margin: 0; color: var(--admin-theme-contrast); font-size: 1.32rem; line-height: 1.2; }
.manager-title { display: grid; gap: 0.15rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.5rem; }
.stat-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.85rem; margin-top: 1rem; }
.stat-card { border-top: 3px solid; }
.stat-blue { border-top-color: var(--admin-theme-teal); }
.stat-green { border-top-color: var(--admin-theme-success, #22c55e); }
.stat-orange { border-top-color: var(--admin-theme-gold); }
.stat-slate { border-top-color: #64748b; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.form-grid .field-wide { grid-column: 1 / -1; }
.search-field { flex: 1; min-width: 200px; }
.bulk-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0.75rem; border-radius: 8px; background: color-mix(in srgb, var(--admin-theme-teal) 8%, transparent); border: 1px solid color-mix(in srgb, var(--admin-theme-teal) 15%, var(--admin-theme-border)); margin-bottom: 0.75rem; }
:global(.admin-dark) .bulk-bar { background: color-mix(in srgb, #3b82f6 10%, transparent); border-color: color-mix(in srgb, #3b82f6 20%, var(--admin-theme-border)); }
.table-wrap { overflow-x: auto; border: 1px solid var(--admin-theme-border); border-radius: 8px; }
@media (min-width: 900px) { .news-manager.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); }
  .manager-hero { flex-direction: column; align-items: stretch; }
  .hero-actions { width: 100%; }
  .stat-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
