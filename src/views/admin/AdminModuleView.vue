<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

type RecordStatus = 'Published' | 'Draft' | 'Archived'

type DbRecord = Record<string, unknown>

type AdminRecord = {
  id: string
  title: string
  status: RecordStatus
  author: string
  category: string
  updatedAt: string
  thumbnail: string
  summary: string
}

type ModuleForm = {
  title: string
  category: string
  status: RecordStatus
  author: string
  summary: string
}

type ModuleConfig = {
  title: string
  eyebrow: string
  description: string
  newLabel: string
  categories: string[]
}

type ModuleSource = {
  table: string
  select: string
  orderBy: string
  ascending?: boolean
  canCreate: boolean
  canDelete: boolean
  canDuplicate: boolean
  canStatus: boolean
  mapRow: (row: DbRecord) => AdminRecord
  buildCreate: (form: ModuleForm, currentRecords: AdminRecord[]) => DbRecord
  buildUpdate: (form: ModuleForm) => DbRecord
  buildStatus?: (status: RecordStatus) => DbRecord
}

const moduleConfigs: Record<string, ModuleConfig> = {
  programs: {
    title: 'Programs',
    eyebrow: 'Website content',
    description: 'Create, publish and organize public program content.',
    newLabel: 'New program',
    categories: ['Education', 'Environment', 'Livelihood', 'Child Protection'],
  },
  news: {
    title: 'News',
    eyebrow: 'Publishing',
    description: 'Manage announcements, field updates and press content.',
    newLabel: 'New news',
    categories: ['Announcement', 'Field Update', 'Press', 'Story'],
  },
  partners: {
    title: 'Partners',
    eyebrow: 'Relationships',
    description: 'Track partner profiles, logos, links and visibility.',
    newLabel: 'New partner',
    categories: ['Funding', 'Technical', 'Community', 'Government'],
  },
  'impact-stories': {
    title: 'Impact Stories',
    eyebrow: 'Storytelling',
    description: 'Publish stories that show program outcomes and community voices.',
    newLabel: 'New story',
    categories: ['Education', 'Climate', 'Livelihood', 'Protection'],
  },
  users: {
    title: 'Users',
    eyebrow: 'Administration',
    description: 'Manage admin accounts, status and assigned roles.',
    newLabel: 'Add user',
    categories: ['Super Admin', 'Admin', 'Editor', 'Viewer'],
  },
  profile: {
    title: 'Profile',
    eyebrow: 'Account',
    description: 'Review profile records and account activity.',
    newLabel: 'New note',
    categories: ['Profile', 'Security', 'Login', 'Preferences'],
  },
}

const fallbackModuleConfig = moduleConfigs.programs as ModuleConfig

const route = useRoute()
const ui = useUiStore()

const records = ref<AdminRecord[]>([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const statusFilter = ref<'all' | RecordStatus>('all')
const sortKey = ref<'updatedAt' | 'title' | 'status'>('updatedAt')
const selectedIds = ref<string[]>([])
const page = ref(1)
const formOpen = ref(false)
const editingId = ref<string | null>(null)
const form = ref<ModuleForm>({
  title: '',
  category: 'General',
  status: 'Draft' as RecordStatus,
  author: 'Admin',
  summary: '',
})

const pageSize = 6

const moduleKey = computed(() => {
  const value = route.params.module
  return typeof value === 'string' ? value : 'programs'
})

const config = computed<ModuleConfig>(() => moduleConfigs[moduleKey.value] ?? fallbackModuleConfig)
const activeSource = computed(() => moduleSources[moduleKey.value])

const filteredRows = computed(() => {
  const query = search.value.trim().toLowerCase()
  const rows = records.value.filter((record) => {
    const matchesQuery =
      !query ||
      record.title.toLowerCase().includes(query) ||
      record.category.toLowerCase().includes(query) ||
      record.author.toLowerCase().includes(query)
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
  return (
    pagedRows.value.length > 0 && pagedRows.value.every((row) => selectedIds.value.includes(row.id))
  )
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

watch(
  moduleKey,
  (key) => {
    void loadRecords(key)
    selectedIds.value = []
    page.value = 1
    formOpen.value = false
  },
  { immediate: true },
)

watch([search, statusFilter], () => {
  page.value = 1
})

function initials(value: string) {
  return value
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function slugify(value: string) {
  const slug = value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return slug || 'record'
}

function uniqueSlug(value: string) {
  return `${slugify(value)}-${Date.now().toString(36)}`
}

function textValue(value: unknown, fallback = '') {
  return typeof value === 'string' && value.trim() ? value : fallback
}

function booleanValue(value: unknown, fallback = false) {
  return typeof value === 'boolean' ? value : fallback
}

function recordValue(value: unknown): DbRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as DbRecord) : {}
}

function metadataText(row: DbRecord, key: string, fallback = '') {
  return textValue(recordValue(row.metadata)[key], fallback)
}

function relationName(value: unknown) {
  const relation = Array.isArray(value) ? value[0] : value
  return textValue(recordValue(relation).name)
}

function dbStatus(value: RecordStatus) {
  return value.toLowerCase()
}

function statusFromDb(value: unknown): RecordStatus {
  const status = textValue(value).toLowerCase()
  if (status === 'published') return 'Published'
  if (status === 'archived') return 'Archived'
  return 'Draft'
}

function statusFromVisibility(value: unknown): RecordStatus {
  return booleanValue(value, true) ? 'Published' : 'Draft'
}

function roleFromCategory(value: string) {
  const normalized = value.toLowerCase().replace(/\s+/g, '_')
  return ['super_admin', 'admin', 'editor', 'viewer'].includes(normalized) ? normalized : 'viewer'
}

function roleToCategory(value: unknown) {
  const role = textValue(value, 'viewer')
  return role
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function isoDate(value: unknown) {
  return textValue(value, new Date().toISOString())
}

function sourceMetadata(formValue: ModuleForm) {
  return {
    admin_author: formValue.author.trim() || 'Admin',
    admin_category: formValue.category,
  }
}

const profileSource: ModuleSource = {
  table: 'profiles',
  select: 'id, email, full_name, role, updated_at',
  orderBy: 'updated_at',
  ascending: false,
  canCreate: false,
  canDelete: false,
  canDuplicate: false,
  canStatus: false,
  mapRow: (row) => {
    const title = textValue(row.full_name, textValue(row.email, 'Unnamed user'))
    const role = roleToCategory(row.role)
    return {
      id: textValue(row.id),
      title,
      status: role === 'Viewer' ? 'Draft' : 'Published',
      author: textValue(row.email, 'No email'),
      category: role,
      updatedAt: isoDate(row.updated_at),
      thumbnail: initials(title),
      summary: `Role: ${role}`,
    }
  },
  buildCreate: () => ({}),
  buildUpdate: (formValue) => ({
    full_name: formValue.title.trim(),
    role: roleFromCategory(formValue.category),
  }),
}

const moduleSources: Record<string, ModuleSource> = {
  programs: {
    table: 'programs',
    select: 'id, slug, title, pillar, summary, description, status, updated_at, metadata',
    orderBy: 'sort_order',
    ascending: true,
    canCreate: true,
    canDelete: true,
    canDuplicate: true,
    canStatus: true,
    mapRow: (row) => {
      const title = textValue(row.title, 'Untitled program')
      return {
        id: textValue(row.id),
        title,
        status: statusFromDb(row.status),
        author: metadataText(row, 'admin_author', 'CMS'),
        category: textValue(row.pillar, 'Program'),
        updatedAt: isoDate(row.updated_at),
        thumbnail: initials(title),
        summary: textValue(row.summary, textValue(row.description, '')),
      }
    },
    buildCreate: (formValue, currentRecords) => ({
      slug: uniqueSlug(formValue.title),
      title: formValue.title.trim(),
      pillar: formValue.category,
      summary: formValue.summary.trim(),
      description: formValue.summary.trim(),
      status: dbStatus(formValue.status),
      sort_order: currentRecords.length + 1,
      published_at: formValue.status === 'Published' ? new Date().toISOString() : null,
      metadata: sourceMetadata(formValue),
    }),
    buildUpdate: (formValue) => ({
      title: formValue.title.trim(),
      pillar: formValue.category,
      summary: formValue.summary.trim(),
      description: formValue.summary.trim(),
      status: dbStatus(formValue.status),
      published_at: formValue.status === 'Published' ? new Date().toISOString() : null,
      metadata: sourceMetadata(formValue),
    }),
    buildStatus: (status) => ({
      status: dbStatus(status),
      published_at: status === 'Published' ? new Date().toISOString() : null,
    }),
  },
  news: {
    table: 'news_posts',
    select:
      'id, slug, title, excerpt, status, author_name, updated_at, metadata, news_categories(name)',
    orderBy: 'updated_at',
    ascending: false,
    canCreate: true,
    canDelete: true,
    canDuplicate: true,
    canStatus: true,
    mapRow: (row) => {
      const title = textValue(row.title, 'Untitled news')
      return {
        id: textValue(row.id),
        title,
        status: statusFromDb(row.status),
        author: textValue(row.author_name, 'Santi Sena Communications Team'),
        category:
          relationName(row.news_categories) || metadataText(row, 'admin_category', 'News'),
        updatedAt: isoDate(row.updated_at),
        thumbnail: initials(title),
        summary: textValue(row.excerpt),
      }
    },
    buildCreate: (formValue) => ({
      slug: uniqueSlug(formValue.title),
      title: formValue.title.trim(),
      excerpt: formValue.summary.trim(),
      body: formValue.summary.trim(),
      status: dbStatus(formValue.status),
      author_name: formValue.author.trim() || 'Santi Sena Communications Team',
      published_at: formValue.status === 'Published' ? new Date().toISOString() : null,
      metadata: sourceMetadata(formValue),
    }),
    buildUpdate: (formValue) => ({
      title: formValue.title.trim(),
      excerpt: formValue.summary.trim(),
      body: formValue.summary.trim(),
      status: dbStatus(formValue.status),
      author_name: formValue.author.trim() || 'Santi Sena Communications Team',
      published_at: formValue.status === 'Published' ? new Date().toISOString() : null,
      metadata: sourceMetadata(formValue),
    }),
    buildStatus: (status) => ({
      status: dbStatus(status),
      published_at: status === 'Published' ? new Date().toISOString() : null,
    }),
  },
  partners: {
    table: 'partners',
    select: 'id, name, partner_type, description, is_visible, updated_at, metadata',
    orderBy: 'sort_order',
    ascending: true,
    canCreate: true,
    canDelete: true,
    canDuplicate: true,
    canStatus: true,
    mapRow: (row) => {
      const title = textValue(row.name, 'Unnamed partner')
      return {
        id: textValue(row.id),
        title,
        status: statusFromVisibility(row.is_visible),
        author: metadataText(row, 'admin_author', 'CMS'),
        category: textValue(row.partner_type, 'supporter'),
        updatedAt: isoDate(row.updated_at),
        thumbnail: initials(title),
        summary: textValue(row.description),
      }
    },
    buildCreate: (formValue, currentRecords) => ({
      name: formValue.title.trim(),
      partner_type: formValue.category.toLowerCase(),
      description: formValue.summary.trim(),
      is_visible: formValue.status === 'Published',
      sort_order: currentRecords.length + 1,
      metadata: sourceMetadata(formValue),
    }),
    buildUpdate: (formValue) => ({
      name: formValue.title.trim(),
      partner_type: formValue.category.toLowerCase(),
      description: formValue.summary.trim(),
      is_visible: formValue.status === 'Published',
      metadata: sourceMetadata(formValue),
    }),
    buildStatus: (status) => ({ is_visible: status === 'Published' }),
  },
  'impact-stories': {
    table: 'impact_timeline_events',
    select: 'id, event_year, title, description, is_visible, updated_at, metadata',
    orderBy: 'event_year',
    ascending: false,
    canCreate: true,
    canDelete: true,
    canDuplicate: true,
    canStatus: true,
    mapRow: (row) => {
      const title = textValue(row.title, 'Untitled story')
      return {
        id: textValue(row.id),
        title,
        status: statusFromVisibility(row.is_visible),
        author: metadataText(row, 'admin_author', 'CMS'),
        category: metadataText(row, 'admin_category', String(row.event_year ?? 'Impact')),
        updatedAt: isoDate(row.updated_at),
        thumbnail: initials(title),
        summary: textValue(row.description),
      }
    },
    buildCreate: (formValue, currentRecords) => ({
      event_year: new Date().getFullYear(),
      title: formValue.title.trim(),
      description: formValue.summary.trim(),
      sort_order: currentRecords.length + 1,
      is_visible: formValue.status === 'Published',
      metadata: sourceMetadata(formValue),
    }),
    buildUpdate: (formValue) => ({
      title: formValue.title.trim(),
      description: formValue.summary.trim(),
      is_visible: formValue.status === 'Published',
      metadata: sourceMetadata(formValue),
    }),
    buildStatus: (status) => ({ is_visible: status === 'Published' }),
  },
  users: profileSource,
  profile: profileSource,
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

async function loadRecords(key = moduleKey.value) {
  const source = moduleSources[key]
  records.value = []

  if (!source) return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from(source.table)
      .select(source.select)
      .order(source.orderBy, { ascending: source.ascending ?? false })

    if (error) throw error

    records.value = ((data ?? []) as unknown as DbRecord[]).map(source.mapRow)
  } catch {
    ui.addToast(`Could not load ${config.value.title}. Check Supabase permissions.`, 'error')
  } finally {
    loading.value = false
  }
}

async function insertSourceRecord(source: ModuleSource, payload: DbRecord) {
  const { data, error } = await supabase
    .from(source.table)
    .insert(payload)
    .select(source.select)
    .single()

  if (error) throw error
  return source.mapRow((data ?? payload) as unknown as DbRecord)
}

async function updateSourceRecord(source: ModuleSource, id: string, payload: DbRecord) {
  const { data, error } = await supabase
    .from(source.table)
    .update(payload)
    .eq('id', id)
    .select(source.select)
    .single()

  if (error) throw error
  return source.mapRow((data ?? payload) as unknown as DbRecord)
}

async function deleteSourceRecord(source: ModuleSource, id: string) {
  const { error } = await supabase.from(source.table).delete().eq('id', id)
  if (error) throw error
}

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
  if (!activeSource.value?.canCreate) {
    ui.addToast('Create this account in Supabase Auth first, then edit its profile here.', 'info')
    return
  }

  editingId.value = null
  form.value = {
    title: '',
    category: config.value.categories[0] ?? 'General',
    status: 'Draft',
    author: 'Admin',
    summary: '',
  }
  formOpen.value = true
}

function editRecord(record: AdminRecord) {
  editingId.value = record.id
  form.value = {
    title: record.title,
    category: record.category,
    status: record.status,
    author: record.author,
    summary: record.summary,
  }
  formOpen.value = true
}

async function saveRecord() {
  if (saving.value) return

  const source = activeSource.value
  const title = form.value.title.trim()

  if (!source) {
    ui.addToast('This module is not connected to a Supabase table yet.', 'error')
    return
  }

  if (!editingId.value && !source.canCreate) {
    ui.addToast('This module does not support creating rows from this screen.', 'warning')
    return
  }

  if (!title) {
    ui.addToast('Title is required.', 'error')
    return
  }

  saving.value = true
  try {
    const savedRecord = editingId.value
      ? await updateSourceRecord(source, editingId.value, source.buildUpdate(form.value))
      : await insertSourceRecord(source, source.buildCreate(form.value, records.value))

    records.value = editingId.value
      ? records.value.map((record) => (record.id === editingId.value ? savedRecord : record))
      : [savedRecord, ...records.value]

    formOpen.value = false
    ui.addToast(`${savedRecord.title} saved.`, 'success')
  } catch {
    ui.addToast(`Could not save ${title}. Check permissions and required fields.`, 'error')
  } finally {
    saving.value = false
  }
}

async function duplicateRecord(record: AdminRecord) {
  if (saving.value) return

  const source = activeSource.value
  if (!source?.canDuplicate || !source.canCreate) {
    ui.addToast('This module cannot duplicate records from this screen.', 'info')
    return
  }

  saving.value = true
  try {
    const draft: ModuleForm = {
      title: `${record.title} copy`,
      category: record.category,
      status: 'Draft',
      author: record.author,
      summary: record.summary,
    }
    const duplicate = await insertSourceRecord(source, source.buildCreate(draft, records.value))
    records.value = [duplicate, ...records.value]
    ui.addToast('Record duplicated as draft.', 'info')
  } catch {
    ui.addToast('Could not duplicate this record.', 'error')
  } finally {
    saving.value = false
  }
}

async function togglePublish(record: AdminRecord) {
  if (saving.value) return

  const source = activeSource.value
  if (!source?.canStatus || !source.buildStatus) {
    ui.addToast('Use the edit form to update this module.', 'info')
    return
  }

  const nextStatus: RecordStatus = record.status === 'Published' ? 'Draft' : 'Published'

  saving.value = true
  try {
    const updated = await updateSourceRecord(source, record.id, source.buildStatus(nextStatus))
    records.value = records.value.map((item) => (item.id === record.id ? updated : item))
    ui.addToast(`${record.title} marked ${nextStatus.toLowerCase()}.`, 'success')
  } catch {
    ui.addToast(`Could not update ${record.title}.`, 'error')
  } finally {
    saving.value = false
  }
}

function confirmDelete(record: AdminRecord) {
  const source = activeSource.value
  if (!source?.canDelete) {
    ui.addToast('This module cannot delete records from this screen.', 'info')
    return
  }

  ui.openModal('Delete content?', `Delete "${record.title}" from ${config.value.title}?`, () => {
    void deleteRecord(record)
  })
}

function bulkPublish() {
  bulkStatus('Published')
}

function bulkArchive() {
  bulkStatus('Archived')
}

async function bulkStatus(status: RecordStatus) {
  if (!selectedIds.value.length) return

  const source = activeSource.value
  if (!source?.canStatus || !source.buildStatus) {
    ui.addToast('Bulk status changes are not available for this module.', 'info')
    return
  }

  saving.value = true
  try {
    const selected = [...selectedIds.value]
    const { error } = await supabase
      .from(source.table)
      .update(source.buildStatus(status))
      .in('id', selected)

    if (error) throw error

    records.value = records.value.map((record) =>
      selected.includes(record.id)
        ? { ...record, status, updatedAt: new Date().toISOString() }
        : record,
    )
    ui.addToast(`${selected.length} records updated.`, 'success')
    selectedIds.value = []
  } catch {
    ui.addToast('Could not update selected records.', 'error')
  } finally {
    saving.value = false
  }
}

function bulkDelete() {
  if (!selectedIds.value.length) return

  const source = activeSource.value
  if (!source?.canDelete) {
    ui.addToast('Bulk delete is not available for this module.', 'info')
    return
  }

  ui.openModal(
    'Delete selected content?',
    `${selectedIds.value.length} records will be removed.`,
    () => {
      void deleteSelectedRecords()
    },
  )
}

async function deleteRecord(record: AdminRecord) {
  const source = activeSource.value
  if (!source) return

  try {
    await deleteSourceRecord(source, record.id)
    records.value = records.value.filter((item) => item.id !== record.id)
    selectedIds.value = selectedIds.value.filter((id) => id !== record.id)
    ui.addToast('Content deleted.', 'warning')
  } catch {
    ui.addToast(`Could not delete ${record.title}.`, 'error')
  }
}

async function deleteSelectedRecords() {
  const source = activeSource.value
  if (!source || !selectedIds.value.length) return

  try {
    const selected = [...selectedIds.value]
    const { error } = await supabase.from(source.table).delete().in('id', selected)
    if (error) throw error

    const selectedSet = new Set(selected)
    records.value = records.value.filter((record) => !selectedSet.has(record.id))
    selectedIds.value = []
    ui.addToast('Selected content deleted.', 'warning')
  } catch {
    ui.addToast('Could not delete selected records.', 'error')
  }
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function exportCsv() {
  const header = ['Title', 'Status', 'Author', 'Category', 'Updated', 'Summary']
  const rows = records.value.map((record) => [
    record.title,
    record.status,
    record.author,
    record.category,
    record.updatedAt,
    record.summary,
  ])
  const csv = [header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${moduleKey.value}-records.csv`
  link.click()
  URL.revokeObjectURL(url)
  ui.addToast('CSV exported.', 'success')
}
</script>

<template>
  <div :class="['admin-module-page', { 'sidebar-open': ui.sidebarOpen }]">
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
            <button class="button button-secondary" type="button" @click="exportCsv">
              Export CSV
            </button>
            <button
              class="button button-primary"
              type="button"
              :disabled="saving || !activeSource?.canCreate"
              @click="openCreate"
            >
              {{ config.newLabel }}
            </button>
          </div>
        </header>

        <section class="stat-grid" aria-label="Module statistics">
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

        <section v-if="formOpen" class="form-card" aria-label="Content form">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">{{ editingId ? 'Edit' : 'Create' }}</p>
              <h2>{{ editingId ? 'Update content' : config.newLabel }}</h2>
            </div>
            <button class="icon-button" type="button" @click="formOpen = false">Close</button>
          </div>

          <form class="module-form" @submit.prevent="saveRecord">
            <label>
              <span>Title</span>
              <input v-model="form.title" name="module-title" required />
            </label>
            <label>
              <span>Category</span>
              <select v-model="form.category" name="module-category">
                <option v-for="category in config.categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </label>
            <label>
              <span>Status</span>
              <select v-model="form.status" name="module-status">
                <option value="Draft">Draft</option>
                <option value="Published">Published</option>
                <option value="Archived">Archived</option>
              </select>
            </label>
            <label>
              <span>Author</span>
              <input v-model="form.author" name="module-author" />
            </label>
            <label class="full">
              <span>Summary</span>
              <textarea v-model="form.summary" name="module-summary" rows="3"></textarea>
            </label>
            <div class="form-actions full">
              <button class="button button-secondary" type="button" @click="formOpen = false">
                Cancel
              </button>
              <button class="button button-primary" type="submit" :disabled="saving">
                {{ saving ? 'Saving...' : 'Save' }}
              </button>
            </div>
          </form>
        </section>

        <section class="table-card">
          <div class="table-toolbar">
            <label class="search-field">
              <span class="sr-only">Search records</span>
              <input
                v-model="search"
                name="module-search"
                type="search"
                placeholder="Search title, category, author..."
              />
            </label>
            <select
              v-model="statusFilter"
              name="module-status-filter"
              aria-label="Filter by status"
            >
              <option value="all">All status</option>
              <option value="Published">Published</option>
              <option value="Draft">Draft</option>
              <option value="Archived">Archived</option>
            </select>
            <select v-model="sortKey" name="module-sort-key" aria-label="Sort records">
              <option value="updatedAt">Newest</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div v-if="selectedCount" class="bulk-bar">
            <strong>{{ selectedCount }} selected</strong>
            <button type="button" :disabled="saving" @click="bulkPublish">Bulk publish</button>
            <button type="button" :disabled="saving" @click="bulkArchive">Bulk archive</button>
            <button type="button" class="danger" :disabled="saving" @click="bulkDelete">
              Bulk delete
            </button>
          </div>

          <div v-if="loading" class="loading-state">Loading records...</div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      name="module-select-all"
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
                      :name="`module-select-${record.id}`"
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
                    <span class="status" :class="record.status.toLowerCase()">{{
                      record.status
                    }}</span>
                  </td>
                  <td>{{ record.author }}</td>
                  <td>{{ record.category }}</td>
                  <td>{{ formatDate(record.updatedAt) }}</td>
                  <td>
                    <div class="row-actions">
                      <button type="button" @click="editRecord(record)">Edit</button>
                      <button
                        v-if="activeSource?.canDuplicate"
                        type="button"
                        :disabled="saving"
                        @click="duplicateRecord(record)"
                      >
                        Duplicate
                      </button>
                      <button
                        v-if="activeSource?.canStatus"
                        type="button"
                        :disabled="saving"
                        @click="togglePublish(record)"
                      >
                        {{ record.status === 'Published' ? 'Unpublish' : 'Publish' }}
                      </button>
                      <button
                        v-if="activeSource?.canDelete"
                        type="button"
                        class="danger"
                        :disabled="saving"
                        @click="confirmDelete(record)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
                <tr v-if="!loading && !pagedRows.length">
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
  --panel: var(--admin-surface);
  --border: var(--admin-border);
  --text: var(--admin-text);
  --muted: var(--admin-muted);

  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

:global(.admin-dark .admin-module-page) {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-text: var(--admin-theme-text);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-muted: var(--admin-theme-muted);
  --admin-shadow: var(--admin-theme-shadow);
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

.button:disabled,
.bulk-bar button:disabled,
.row-actions button:disabled {
  cursor: wait;
  opacity: 0.58;
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

input:focus,
select:focus,
textarea:focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
  outline: none;
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

.bulk-bar strong {
  color: var(--admin-contrast);
}

.bulk-bar button,
.row-actions button {
  border: 1px solid var(--admin-border);
  background: var(--admin-surface);
  color: var(--admin-contrast);
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

.loading-state {
  margin-top: 0.9rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface-soft);
  color: var(--admin-muted);
  padding: 0.85rem;
  font-weight: 800;
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

td strong,
.pagination span {
  display: block;
  color: var(--admin-contrast);
  font-weight: 900;
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

@media (min-width: 900px) {
  .admin-module-page.sidebar-open {
    padding-left: 260px;
  }
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
