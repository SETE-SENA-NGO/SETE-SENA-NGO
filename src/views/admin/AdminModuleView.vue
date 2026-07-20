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

const loading = ref(false)
const saving = ref(false)

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

const totalCount = computed(() => filteredRows.value.length)
const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

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

const pageNumbers = computed(() => {
  const total = totalPages.value
  const current = page.value
  const delta = 2
  const range: (number | '...')[] = []

  if (total <= 7) {
    for (let i = 1; i <= total; i++) range.push(i)
    return range
  }

  range.push(1)
  if (current - delta > 2) range.push('...')
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }
  if (current + delta < total - 1) range.push('...')
  range.push(total)

  return range
})

const stats = computed(() => [
  { label: 'Total records', value: records.value.length, tone: 'blue', icon: 'grid' },
  {
    label: 'Published',
    value: records.value.filter((row) => row.status === 'Published').length,
    tone: 'green',
    icon: 'check',
  },
  {
    label: 'Draft',
    value: records.value.filter((row) => row.status === 'Draft').length,
    tone: 'orange',
    icon: 'edit',
  },
  {
    label: 'Archived',
    value: records.value.filter((row) => row.status === 'Archived').length,
    tone: 'slate',
    icon: 'archive',
  },
])

watch(
  moduleKey,
  () => {
    selectedIds.value = []
    page.value = 1
    formOpen.value = false
    void fetchRecords()
  },
  { immediate: true },
)

watch([search, statusFilter], () => {
  page.value = 1
})

async function fetchRecords() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('module_records')
      .select('*')
      .eq('module', moduleKey.value)
      .order('updated_at', { ascending: false })

    if (error) throw error

    records.value = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      status: (row.status as RecordStatus) || 'Draft',
      author: (row.author as string) || 'Admin',
      category: (row.category as string) || 'General',
      updatedAt: (row.updated_at as string) || new Date().toISOString(),
      thumbnail: initials(row.title as string),
      summary: (row.summary as string) || '',
    }))
  } catch (error) {
    ui.addToast(
      error instanceof Error ? error.message : 'Failed to load records.',
      'error',
    )
    records.value = []
  } finally {
    loading.value = false
  }
}

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

function relativeTime(value: string) {
  const diff = Date.now() - Date.parse(value)
  if (diff < 60000) return 'Just now'
  const minutes = Math.floor(diff / 60000)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(value)
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

function closeForm() {
  formOpen.value = false
}

async function saveRecord() {
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
    const payload = {
      module: moduleKey.value,
      title,
      category: form.value.category,
      status: form.value.status,
      author: form.value.author.trim() || 'Admin',
      summary: form.value.summary.trim(),
      updated_at: new Date().toISOString(),
    }

    if (editingId.value) {
      const { error } = await supabase
        .from('module_records')
        .update(payload)
        .eq('id', editingId.value)

      if (error) throw error
    } else {
      const { error } = await supabase
        .from('module_records')
        .insert(payload)

      if (error) throw error
    }

    formOpen.value = false
    ui.addToast(`${title} saved.`, 'success')
    await fetchRecords()
  } catch (error) {
    ui.addToast(
      error instanceof Error ? error.message : 'Failed to save record.',
      'error',
    )
  } finally {
    saving.value = false
  }
}

async function duplicateRecord(record: AdminRecord) {
  saving.value = true
  try {
    const { error } = await supabase.from('module_records').insert({
      module: moduleKey.value,
      title: `${record.title} copy`,
      category: record.category,
      status: 'Draft',
      author: record.author,
      category: record.category,
      summary: record.summary,
      updated_at: new Date().toISOString(),
    })

    if (error) throw error

    ui.addToast('Record duplicated as draft.', 'info')
    await fetchRecords()
  } catch (error) {
    ui.addToast(
      error instanceof Error ? error.message : 'Failed to duplicate record.',
      'error',
    )
  } finally {
    saving.value = false
  }
}

async function togglePublish(record: AdminRecord) {
  const nextStatus: RecordStatus =
    record.status === 'Published' ? 'Draft' : 'Published'

  try {
    const { error } = await supabase
      .from('module_records')
      .update({ status: nextStatus, updated_at: new Date().toISOString() })
      .eq('id', record.id)

    if (error) throw error

    ui.addToast(`${record.title} marked ${nextStatus.toLowerCase()}.`, 'success')
    await fetchRecords()
  } catch (error) {
    ui.addToast(
      error instanceof Error ? error.message : 'Failed to update status.',
      'error',
    )
  }
}

function confirmDelete(record: AdminRecord) {
  ui.openModal(
    'Delete content?',
    `Delete "${record.title}" from ${config.value.title}?`,
    async () => {
      try {
        const { error } = await supabase
          .from('module_records')
          .delete()
          .eq('id', record.id)

        if (error) throw error

        selectedIds.value = selectedIds.value.filter((id) => id !== record.id)
        ui.addToast('Content deleted.', 'warning')
        await fetchRecords()
      } catch (error) {
        ui.addToast(
          error instanceof Error ? error.message : 'Failed to delete record.',
          'error',
        )
      }
    },
  )
}

async function bulkPublish() {
  await bulkStatus('Published')
}

async function bulkArchive() {
  await bulkStatus('Archived')
}

async function bulkStatus(status: RecordStatus) {
  if (!selectedIds.value.length) return

  try {
    const { error } = await supabase
      .from('module_records')
      .update({ status, updated_at: new Date().toISOString() })
      .in('id', selectedIds.value)

    if (error) throw error

    ui.addToast(`${selectedIds.value.length} records updated.`, 'success')
    selectedIds.value = []
    await fetchRecords()
  } catch (error) {
    ui.addToast(
      error instanceof Error ? error.message : 'Failed to bulk update.',
      'error',
    )
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
    async () => {
      try {
        const { error } = await supabase
          .from('module_records')
          .delete()
          .in('id', selectedIds.value)

        if (error) throw error

        selectedIds.value = []
        ui.addToast('Selected content deleted.', 'warning')
        await fetchRecords()
      } catch (error) {
        ui.addToast(
          error instanceof Error ? error.message : 'Failed to delete records.',
          'error',
        )
      }
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
        <!-- Hero -->
        <header class="module-hero">
          <div class="hero-pattern" aria-hidden="true"></div>
          <div class="hero-content">
            <div class="hero-eyebrow-row">
              <span class="hero-eyebrow">{{ config.eyebrow }}</span>
              <span v-if="records.length" class="hero-count-badge">{{ records.length }} total</span>
            </div>
            <h1>{{ config.title }}</h1>
            <p>{{ config.description }}</p>
          </div>
          <div class="hero-actions">
            <button class="btn btn-ghost" type="button" :disabled="loading || !records.length">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </button>
            <button
              class="btn btn-primary"
              type="button"
              :disabled="loading || saving"
              @click="openCreate"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              {{ config.newLabel }}
            </button>
          </div>
        </header>

        <!-- Stats -->
        <section class="stat-grid" aria-label="Module statistics">
          <article
            v-for="stat in stats"
            :key="stat.label"
            class="stat-card"
            :class="`tone-${stat.tone}`"
          >
            <div class="stat-icon-wrap">
              <!-- Grid icon -->
              <svg v-if="stat.icon === 'grid'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              <!-- Check icon -->
              <svg v-else-if="stat.icon === 'check'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <!-- Edit icon -->
              <svg v-else-if="stat.icon === 'edit'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              <!-- Archive icon -->
              <svg v-else-if="stat.icon === 'archive'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
            </div>
            <div class="stat-body">
              <span class="stat-label">{{ stat.label }}</span>
              <strong class="stat-value">{{ stat.value }}</strong>
            </div>
          </article>
        </section>

        <!-- Form -->
        <Transition name="form-slide">
          <section v-if="formOpen" class="form-card" aria-label="Content form">
            <div class="form-header">
              <div>
                <span class="form-eyebrow">{{ editingId ? 'Edit' : 'Create' }}</span>
                <h2>{{ editingId ? 'Update content' : config.newLabel }}</h2>
              </div>
              <button class="btn-icon" type="button" @click="closeForm" aria-label="Close form">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form class="module-form" @submit.prevent="saveRecord">
              <div class="form-field">
                <label for="module-title">Title</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <input id="module-title" v-model="form.title" name="module-title" required placeholder="Enter title..." />
                </div>
              </div>
              <div class="form-field">
                <label for="module-category">Category</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v4H4z"/><path d="M4 12h16v8H4z"/></svg>
                  <select id="module-category" v-model="form.category" name="module-category">
                    <option v-for="category in config.categories" :key="category" :value="category">
                      {{ category }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label for="module-status">Status</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  <select id="module-status" v-model="form.status" name="module-status">
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>
              <div class="form-field">
                <label for="module-author">Author</label>
                <div class="input-wrap">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input id="module-author" v-model="form.author" name="module-author" placeholder="Author name..." />
                </div>
              </div>
              <div class="form-field full-width">
                <label for="module-summary">Summary</label>
                <div class="input-wrap textarea-wrap">
                  <svg class="input-icon textarea-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  <textarea id="module-summary" v-model="form.summary" name="module-summary" rows="3" placeholder="Brief summary..."></textarea>
                </div>
              </div>
              <div class="form-actions full-width">
                <button class="btn btn-ghost" type="button" @click="closeForm">
                  Cancel
                </button>
                <button class="btn btn-primary" type="submit" :disabled="saving">
                  <template v-if="saving">
                    <span class="spinner"></span>
                    Saving...
                  </template>
                  <template v-else>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save
                  </template>
                </button>
              </div>
            </form>
          </section>
        </Transition>

        <!-- Table card -->
        <section class="table-card">
          <!-- Toolbar -->
          <div class="table-toolbar">
            <label class="search-field">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                v-model="search"
                name="module-search"
                type="search"
                placeholder="Search title, category, author..."
              />
            </label>
            <div class="toolbar-selects">
              <select v-model="statusFilter" name="module-status-filter" aria-label="Filter by status">
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
          </div>

          <!-- Bulk bar -->
          <Transition name="bulk-slide">
            <div v-if="selectedCount" class="bulk-bar">
              <div class="bulk-info">
                <span class="bulk-check-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </span>
                <strong>{{ selectedCount }} selected</strong>
              </div>
              <div class="bulk-actions">
                <button class="bulk-btn bulk-publish" type="button" :disabled="saving" @click="bulkPublish">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                  Publish
                </button>
                <button class="bulk-btn bulk-archive" type="button" :disabled="saving" @click="bulkArchive">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>
                  Archive
                </button>
                <button class="bulk-btn bulk-delete" type="button" :disabled="saving" @click="bulkDelete">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Delete
                </button>
              </div>
            </div>
          </Transition>

          <!-- Loading skeleton -->
          <div v-if="loading && !records.length" class="loading-skeleton">
            <div v-for="n in 4" :key="n" class="skeleton-row">
              <div class="skeleton-cell skeleton-check"></div>
              <div class="skeleton-cell skeleton-thumb"></div>
              <div class="skeleton-cell skeleton-title">
                <div class="skeleton-line w-60"></div>
                <div class="skeleton-line w-40"></div>
              </div>
              <div class="skeleton-cell skeleton-badge">
                <div class="skeleton-line w-20"></div>
              </div>
              <div class="skeleton-cell skeleton-author">
                <div class="skeleton-line w-24"></div>
              </div>
              <div class="skeleton-cell skeleton-cat">
                <div class="skeleton-line w-28"></div>
              </div>
              <div class="skeleton-cell skeleton-date">
                <div class="skeleton-line w-24"></div>
              </div>
              <div class="skeleton-cell skeleton-actions">
                <div class="skeleton-line w-32"></div>
              </div>
            </div>
          </div>

          <!-- Table -->
          <div v-else class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th class="col-check">
                    <label class="custom-checkbox">
                      <input
                        type="checkbox"
                        name="module-select-all"
                        :checked="allVisibleSelected"
                        aria-label="Select visible rows"
                        @change="toggleVisibleSelection"
                      />
                      <span class="check-visual"></span>
                    </label>
                  </th>
                  <th class="col-thumb">Thumbnail</th>
                  <th class="col-title">Title</th>
                  <th class="col-status">Status</th>
                  <th class="col-author">Author</th>
                  <th class="col-category">Category</th>
                  <th class="col-date">Updated</th>
                  <th class="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="record in pagedRows" :key="record.id" class="data-row">
                  <td>
                    <label class="custom-checkbox">
                      <input
                        type="checkbox"
                        :name="`module-select-${record.id}`"
                        :checked="isSelected(record.id)"
                        :aria-label="`Select ${record.title}`"
                        @change="toggleSelected(record.id)"
                      />
                      <span class="check-visual"></span>
                    </label>
                  </td>
                  <td>
                    <span class="thumb" :class="`thumb-${record.status.toLowerCase()}`">{{ record.thumbnail }}</span>
                  </td>
                  <td class="title-cell">
                    <strong>{{ record.title }}</strong>
                    <span class="title-summary">{{ record.summary || 'No summary' }}</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="record.status.toLowerCase()">
                      <span class="status-dot"></span>
                      {{ record.status }}
                    </span>
                  </td>
                  <td class="author-cell">{{ record.author }}</td>
                  <td>
                    <span class="category-tag">{{ record.category }}</span>
                  </td>
                  <td class="date-cell" :title="formatDate(record.updatedAt)">
                    {{ relativeTime(record.updatedAt) }}
                  </td>
                  <td>
                    <div class="row-actions">
                      <button class="row-action" type="button" :disabled="saving" @click="editRecord(record)" title="Edit">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button class="row-action" type="button" :disabled="saving" @click="duplicateRecord(record)" title="Duplicate">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                      <button class="row-action" :class="{ 'action-publish': record.status !== 'Published' }" type="button" :disabled="saving" @click="togglePublish(record)" :title="record.status === 'Published' ? 'Unpublish' : 'Publish'">
                        <svg v-if="record.status === 'Published'" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="11.5" r="1.5"/></svg>
                        <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </button>
                      <button class="row-action action-delete" type="button" :disabled="saving" @click="confirmDelete(record)" title="Delete">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <!-- Empty state -->
                <tr v-if="!pagedRows.length && !loading">
                  <td colspan="8">
                    <div class="empty-state">
                      <div class="empty-icon">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <strong>{{ search || statusFilter !== 'all' ? 'No matching records' : 'No records yet' }}</strong>
                      <span>{{ search || statusFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Create your first record to get started.' }}</span>
                      <button v-if="!search && statusFilter === 'all'" class="btn btn-primary btn-sm" type="button" @click="openCreate">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        {{ config.newLabel }}
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <footer v-if="totalCount > pageSize" class="pagination">
            <span class="pagination-info">{{ (page - 1) * pageSize + 1 }}-{{ Math.min(page * pageSize, totalCount) }} of {{ totalCount }}</span>
            <div class="pagination-controls">
              <button class="page-btn" type="button" :disabled="page === 1" @click="page = 1" title="First page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/></svg>
              </button>
              <button class="page-btn" type="button" :disabled="page === 1" @click="page -= 1" title="Previous">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <template v-for="num in pageNumbers" :key="num">
                <button
                  v-if="num === '...'"
                  class="page-btn page-ellipsis"
                  type="button"
                  disabled
                >…</button>
                <button
                  v-else
                  class="page-btn"
                  :class="{ active: page === num }"
                  type="button"
                  @click="page = num"
                >{{ num }}</button>
              </template>
              <button class="page-btn" type="button" :disabled="page === totalPages" @click="page += 1" title="Next">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <button class="page-btn" type="button" :disabled="page === totalPages" @click="page = totalPages" title="Last page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>
              </button>
            </div>
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   DESIGN SYSTEM VARIABLES
   ============================================ */
.admin-module-page {
  --bg: #f0f4fb;
  --surface: #ffffff;
  --surface-soft: #f6f9fe;
  --border: #e2e9f5;
  --border-strong: #cbd9ec;
  --text: #2c3d5f;
  --contrast: #0f1a33;
  --muted: #6a7d9e;
  --blue: #2962ff;
  --blue-soft: #e8efff;
  --green: #0f973d;
  --green-soft: #e6f9ed;
  --orange: #e67e22;
  --orange-soft: #fef4e6;
  --red: #dc2626;
  --red-soft: #fef2f2;
  --slate: #6b7280;
  --slate-soft: #f1f5f9;
  --shadow-sm: 0 1px 3px rgba(15, 26, 51, 0.06);
  --shadow-md: 0 4px 14px rgba(15, 26, 51, 0.07);
  --shadow-lg: 0 12px 40px rgba(15, 26, 51, 0.09);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: padding-left 0.25s ease;
}

:global(.admin-dark) .admin-module-page {
  --bg: #0a0f1f;
  --surface: #111827;
  --surface-soft: #0f172a;
  --border: #1e2a45;
  --border-strong: #2d3b5a;
  --text: #c8d2e6;
  --contrast: #eef2f8;
  --muted: #8896b5;
  --blue: #3b82f6;
  --blue-soft: #1a2a45;
  --green: #22c55e;
  --green-soft: #142c1e;
  --orange: #f59e0b;
  --orange-soft: #2a2015;
  --red: #ef4444;
  --red-soft: #2a1515;
  --slate: #8b96b0;
  --slate-soft: #111b2e;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.25);
  --shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.35);
}

.admin-layout {
  display: flex;
}

.module-main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2rem 2.5rem;
}

/* ============================================
   BUTTON SYSTEM
   ============================================ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0.5rem 1.1rem;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  border: 1px solid transparent;
  white-space: nowrap;
}

.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.btn-primary {
  background: var(--blue);
  color: #fff;
  border-color: var(--blue);
  box-shadow: 0 4px 14px rgba(41, 98, 255, 0.25);
}

.btn-primary:hover {
  background: #1a50e0;
  border-color: #1a50e0;
  box-shadow: 0 6px 20px rgba(41, 98, 255, 0.32);
}

.btn-ghost {
  background: var(--surface);
  color: var(--text);
  border-color: var(--border);
}

.btn-ghost:hover {
  border-color: var(--border-strong);
  background: var(--surface-soft);
  box-shadow: var(--shadow-sm);
}

.btn-sm {
  min-height: 34px;
  padding: 0.35rem 0.85rem;
  font-size: 0.8rem;
}

.btn-icon {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: var(--border-strong);
  color: var(--contrast);
  background: var(--surface-soft);
}

/* ============================================
   HERO
   ============================================ */
.module-hero {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1.5rem;
  padding: 1.8rem 2rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-soft) 100%);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.hero-pattern {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(var(--border) 1px, transparent 1px);
  background-size: 24px 24px;
  opacity: 0.5;
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 1;
}

.hero-eyebrow-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.hero-eyebrow {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--blue);
  background: var(--blue-soft);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
}

.hero-count-badge {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--muted);
  background: var(--surface-soft);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--border);
}

h1 {
  margin: 0 0 0.3rem;
  color: var(--contrast);
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 850;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.module-hero p:not(.hero-eyebrow) {
  max-width: 580px;
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.6;
}

.hero-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 0.6rem;
  flex-shrink: 0;
}

/* ============================================
   STAT CARDS
   ============================================ */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-top: 1.25rem;
}

.stat-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 1.15rem 1.2rem;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: color-mix(in srgb, var(--tone) 25%, var(--border));
}

.stat-icon-wrap {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  border-radius: var(--radius-md);
  background: color-mix(in srgb, var(--tone) 12%, var(--surface));
  color: var(--tone);
  transition: transform 0.25s ease;
}

.stat-card:hover .stat-icon-wrap {
  transform: scale(1.08);
}

.stat-body {
  display: grid;
  gap: 0.15rem;
}

.stat-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.stat-value {
  font-size: 1.85rem;
  font-weight: 900;
  color: var(--contrast);
  line-height: 1;
  letter-spacing: -0.02em;
}

.tone-blue { --tone: var(--blue); }
.tone-green { --tone: var(--green); }
.tone-orange { --tone: var(--orange); }
.tone-slate { --tone: var(--slate); }

/* ============================================
   FORM
   ============================================ */
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.form-slide-enter-from,
.form-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.98);
}

.form-card {
  margin-top: 1.25rem;
  padding: 1.35rem 1.5rem;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-md);
}

.form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
}

.form-eyebrow {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--blue);
  background: var(--blue-soft);
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}

.form-header h2 {
  margin: 0;
  color: var(--contrast);
  font-size: 1.05rem;
  font-weight: 800;
}

.module-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field {
  display: grid;
  gap: 0.4rem;
}

.form-field.full-width {
  grid-column: 1 / -1;
}

.form-field label {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  color: var(--muted);
  pointer-events: none;
  z-index: 1;
}

.textarea-icon {
  align-self: flex-start;
  margin-top: 14px;
}

.input-wrap input,
.input-wrap select,
.input-wrap textarea {
  width: 100%;
  padding: 0.7rem 0.85rem 0.7rem 2.2rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--contrast);
  font-size: 0.9rem;
  transition: all 0.2s ease;
  font-family: inherit;
}

.input-wrap textarea {
  padding-left: 2.2rem;
}

.input-wrap input:focus,
.input-wrap select:focus,
.input-wrap textarea:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(41, 98, 255, 0.1);
}

.input-wrap select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a7d9e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 2.2rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.form-actions.full-width {
  grid-column: 1 / -1;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   TABLE CARD
   ============================================ */
.table-card {
  margin-top: 1.25rem;
  padding: 1.35rem 1.5rem;
  border-radius: var(--radius-lg);
  background: var(--surface);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

/* Toolbar */
.table-toolbar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.search-field {
  flex: 1 1 260px;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}

.search-field input {
  width: 100%;
  padding: 0.62rem 0.85rem 0.62rem 2.2rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--contrast);
  font-size: 0.88rem;
  transition: all 0.2s ease;
}

.search-field input:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(41, 98, 255, 0.1);
}

.search-field input::placeholder {
  color: var(--muted);
  opacity: 0.7;
}

.toolbar-selects {
  display: flex;
  gap: 0.6rem;
}

.toolbar-selects select {
  padding: 0.62rem 2rem 0.62rem 0.85rem;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--contrast);
  font-size: 0.84rem;
  font-weight: 600;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236a7d9e' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.toolbar-selects select:focus {
  outline: none;
  border-color: var(--blue);
  box-shadow: 0 0 0 4px rgba(41, 98, 255, 0.1);
}

/* Bulk bar */
.bulk-slide-enter-active,
.bulk-slide-leave-active {
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.bulk-slide-enter-from,
.bulk-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}

.bulk-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-top: 1rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-sm);
  background: var(--blue-soft);
  border: 1px solid color-mix(in srgb, var(--blue) 20%, var(--border));
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bulk-check-icon {
  width: 26px;
  height: 26px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--blue);
  color: #fff;
}

.bulk-info strong {
  color: var(--contrast);
  font-size: 0.85rem;
  font-weight: 800;
}

.bulk-actions {
  display: flex;
  gap: 0.45rem;
}

.bulk-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.bulk-btn:hover { transform: translateY(-1px); }
.bulk-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.bulk-publish:hover { border-color: var(--green); color: var(--green); }
.bulk-archive:hover { border-color: var(--orange); color: var(--orange); }
.bulk-delete { border-color: color-mix(in srgb, var(--red) 30%, var(--border)); color: var(--red); }
.bulk-delete:hover { border-color: var(--red); background: var(--red-soft); }

/* ============================================
   LOADING SKELETON
   ============================================ */
.loading-skeleton {
  margin-top: 1rem;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 0;
  border-bottom: 1px solid var(--border);
}

.skeleton-row:last-child { border-bottom: none; }

.skeleton-cell { flex-shrink: 0; }

.skeleton-cell.skeleton-check { width: 20px; }
.skeleton-cell.skeleton-thumb { width: 42px; }
.skeleton-cell.skeleton-title { flex: 1; }
.skeleton-cell.skeleton-badge { width: 90px; }
.skeleton-cell.skeleton-author { width: 100px; }
.skeleton-cell.skeleton-cat { width: 110px; }
.skeleton-cell.skeleton-date { width: 100px; }
.skeleton-cell.skeleton-actions { width: 140px; }

.skeleton-line {
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--border) 25%, var(--surface-soft) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  margin-bottom: 6px;
}

.skeleton-line:last-child { margin-bottom: 0; }

.skeleton-line.w-60 { width: 60%; }
.skeleton-line.w-40 { width: 40%; }
.skeleton-line.w-20 { width: 40%; }
.skeleton-line.w-24 { width: 70px; }
.skeleton-line.w-28 { width: 85px; }
.skeleton-line.w-32 { width: 100px; }

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ============================================
   TABLE
   ============================================ */
.table-wrap {
  overflow-x: auto;
  margin-top: 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
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
  min-width: 920px;
  border-collapse: collapse;
}

th, td {
  padding: 0.85rem;
  text-align: left;
  vertical-align: middle;
}

th {
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--border);
}

td {
  border-bottom: 1px solid var(--border);
  color: var(--text);
  font-size: 0.88rem;
}

/* Column widths */
.col-check { width: 40px; }
.col-thumb { width: 70px; }
.col-status { width: 110px; }
.col-author { width: 120px; }
.col-category { width: 130px; }
.col-date { width: 120px; }
.col-actions { width: 170px; }

/* Data rows */
.data-row {
  transition: all 0.2s ease;
}

.data-row:hover {
  background: var(--surface-soft);
}

.data-row:last-child td {
  border-bottom: none;
}

/* Custom checkbox */
.custom-checkbox {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  position: relative;
}

.custom-checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.check-visual {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border-strong);
  border-radius: 5px;
  display: block;
  transition: all 0.2s ease;
  position: relative;
}

.custom-checkbox input:checked + .check-visual {
  background: var(--blue);
  border-color: var(--blue);
}

.custom-checkbox input:checked + .check-visual::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 5px;
  height: 9px;
  border: solid #fff;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.custom-checkbox input:focus-visible + .check-visual {
  box-shadow: 0 0 0 4px rgba(41, 98, 255, 0.15);
}

/* Thumbnail */
.thumb {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  transition: transform 0.2s ease;
}

.data-row:hover .thumb {
  transform: scale(1.05);
}

.thumb-published { background: var(--green-soft); color: var(--green); }
.thumb-draft { background: var(--orange-soft); color: var(--orange); }
.thumb-archived { background: var(--slate-soft); color: var(--slate); }

/* Title cell */
.title-cell strong {
  display: block;
  color: var(--contrast);
  font-weight: 800;
  font-size: 0.9rem;
  margin-bottom: 2px;
}

.title-summary {
  display: block;
  font-size: 0.78rem;
  color: var(--muted);
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Status badge */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.65rem 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  flex-shrink: 0;
}

.status-badge.published {
  background: var(--green-soft);
  color: #15803d;
}

.status-badge.published .status-dot {
  background: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.15);
}

.status-badge.draft {
  background: var(--orange-soft);
  color: #b45309;
}

.status-badge.draft .status-dot {
  background: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
}

.status-badge.archived {
  background: var(--slate-soft);
  color: #4b5563;
}

.status-badge.archived .status-dot {
  background: #9ca3af;
  box-shadow: 0 0 0 3px rgba(156, 163, 175, 0.15);
}

/* Author */
.author-cell {
  color: var(--text);
  font-weight: 600;
}

/* Category tag */
.category-tag {
  display: inline-block;
  padding: 0.2rem 0.55rem;
  border-radius: var(--radius-sm);
  background: var(--surface-soft);
  border: 1px solid var(--border);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
}

/* Date cell */
.date-cell {
  font-size: 0.82rem;
  color: var(--muted);
  white-space: nowrap;
}

/* Row actions */
.row-actions {
  display: flex;
  gap: 0.3rem;
  opacity: 0.3;
  transition: opacity 0.2s ease;
}

.data-row:hover .row-actions {
  opacity: 1;
}

.row-action {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.row-action:hover {
  background: var(--surface-soft);
  border-color: var(--border);
  color: var(--contrast);
}

.row-action:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.action-publish:hover {
  color: var(--green);
  border-color: color-mix(in srgb, var(--green) 30%, var(--border));
  background: var(--green-soft);
}

.action-delete:hover {
  color: var(--red);
  border-color: color-mix(in srgb, var(--red) 30%, var(--border));
  background: var(--red-soft);
}

/* ============================================
   EMPTY STATE
   ============================================ */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  text-align: center;
}

.empty-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--surface-soft);
  border: 1px solid var(--border);
  color: var(--muted);
  margin-bottom: 0.25rem;
}

.empty-state strong {
  color: var(--contrast);
  font-size: 0.95rem;
  font-weight: 800;
}

.empty-state span {
  color: var(--muted);
  font-size: 0.85rem;
}

/* ============================================
   PAGINATION
   ============================================ */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1rem;
}

.pagination-info {
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.page-btn {
  min-width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0 0.4rem;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: var(--border-strong);
  background: var(--surface-soft);
  transform: translateY(-1px);
}

.page-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-btn.active {
  background: var(--blue);
  border-color: var(--blue);
  color: #fff;
  box-shadow: 0 2px 8px rgba(41, 98, 255, 0.2);
}

.page-ellipsis {
  border: none;
  background: transparent;
  color: var(--muted);
  cursor: default;
  min-width: 24px;
}

/* ============================================
   RESPONSIVE
   ============================================ */
@media (min-width: 900px) {
  .admin-module-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 820px) {
  .module-main {
    padding: 1rem 1rem 1.5rem;
  }

  .module-hero {
    flex-direction: column;
    padding: 1.25rem 1.25rem;
  }

  .hero-actions {
    width: 100%;
  }

  .hero-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .module-form {
    grid-template-columns: 1fr;
  }

  .toolbar-selects {
    width: 100%;
  }

  .toolbar-selects select {
    flex: 1;
  }

  .pagination {
    flex-direction: column;
    align-items: stretch;
  }

  .pagination-controls {
    justify-content: center;
    flex-wrap: wrap;
  }

  .table-card {
    padding: 1rem;
  }
}

@media (max-width: 520px) {
  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
