<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

const ui = useUiStore()

/* ─── Tabs ─────────────────────────────────────── */
type TabId = 'overview' | 'program' | 'metrics' | 'partners' | 'content'
const activeTab = ref<TabId>('overview')

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'program', label: 'Program Info', icon: 'file' },
  { id: 'metrics', label: 'Impact Metrics', icon: 'bar-chart' },
  { id: 'partners', label: 'Partners', icon: 'users' },
  { id: 'content', label: 'Page Content', icon: 'layout' },
]

/* ─── Toast notifications ──────────────────────── */
type ToastType = 'success' | 'error' | 'info'
interface Toast { message: string; type: ToastType; id: number }
const toasts = ref<Toast[]>([])
let toastId = 0

function addToast(message: string, type: ToastType = 'info') {
  const id = ++toastId
  toasts.value.push({ message, type, id })
  setTimeout(() => { toasts.value = toasts.value.filter(t => t.id !== id) }, 3000)
}

/* ─── PROGRAM INFO ─────────────────────────────── */
const program = ref({ title: '', summary: '', description: '', pillar: '' })
const programLoading = ref(false)
const programSaving = ref(false)

async function loadProgram() {
  programLoading.value = true
  try {
    const { data } = await supabase
      .from('programs')
      .select('title, summary, description, pillar')
      .eq('slug', 'programs-environment')
      .maybeSingle()
    if (data) program.value = { title: data.title || '', summary: data.summary || '', description: data.description || '', pillar: data.pillar || '' }
  } catch (e: unknown) { console.warn('load program:', e instanceof Error ? e.message : e) }
  finally { programLoading.value = false }
}

async function saveProgram() {
  programSaving.value = true
  try {
    const { error } = await supabase
      .from('programs')
      .upsert({
        slug: 'programs-environment',
        title: program.value.title,
        pillar: program.value.pillar || 'Environment',
        summary: program.value.summary,
        description: program.value.description,
        status: 'published',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'slug' })
    if (error) throw error
    addToast('Program info saved!', 'success')
  } catch (e: unknown) {
    addToast(e instanceof Error ? e.message : 'Failed to save program', 'error')
  } finally { programSaving.value = false }
}

/* ─── IMPACT METRICS ───────────────────────────── */
interface Metric { id?: string; label: string; value_text: string; unit: string; icon: string; sort_order: number; metric_key?: string }
const metrics = ref<Metric[]>([])
const metricsLoading = ref(false)
const editingMetric = ref<Metric | null>(null)
const showMetricForm = ref(false)
const metricForm = reactive<Metric>({ label: '', value_text: '', unit: '', icon: 'tree', sort_order: 0 })

async function loadMetrics() {
  metricsLoading.value = true
  try {
    const { data } = await supabase
      .from('impact_metrics')
      .select('id, metric_key, label, value_text, unit, icon, sort_order')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
    metrics.value = (data ?? []) as Metric[]
  } catch (e: unknown) { console.warn('load metrics:', e instanceof Error ? e.message : e) }
  finally { metricsLoading.value = false }
}

function openMetricForm(m?: Metric) {
  if (m) {
    editingMetric.value = m
    Object.assign(metricForm, { label: m.label, value_text: m.value_text, unit: m.unit || '', icon: m.icon || 'tree', sort_order: m.sort_order })
  } else {
    editingMetric.value = null
    Object.assign(metricForm, { label: '', value_text: '', unit: '', icon: 'tree', sort_order: metrics.value.length + 1 })
  }
  showMetricForm.value = true
}

async function saveMetric() {
  if (!metricForm.label || !metricForm.value_text) { addToast('Label and value are required', 'error'); return }
  try {
    const key = editingMetric.value?.metric_key || `env-${metricForm.label.toLowerCase().replace(/\s+/g, '-')}`
    const payload = {
      metric_key: key,
      label: metricForm.label,
      value_text: metricForm.value_text,
      unit: metricForm.unit || null,
      icon: metricForm.icon || 'globe',
      sort_order: metricForm.sort_order,
      is_visible: true,
    }
    const { error } = editingMetric.value
      ? await supabase.from('impact_metrics').update(payload).eq('id', editingMetric.value.id)
      : await supabase.from('impact_metrics').upsert(payload, { onConflict: 'metric_key' })
    if (error) throw error
    addToast(editingMetric.value ? 'Metric updated!' : 'Metric created!', 'success')
    showMetricForm.value = false
    await loadMetrics()
  } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Failed to save metric', 'error') }
}

async function deleteMetric(m: Metric) {
  if (!m.id) return
  if (!confirm(`Delete "${m.label}"?`)) return
  try {
    const { error } = await supabase.from('impact_metrics').delete().eq('id', m.id)
    if (error) throw error
    addToast('Metric deleted', 'info')
    await loadMetrics()
  } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Failed to delete', 'error') }
}

/* ─── PARTNERS ─────────────────────────────────── */
interface Partner { id?: string; name: string; partner_type: string; description: string; sort_order: number }
const partners = ref<Partner[]>([])
const partnersLoading = ref(false)
const editingPartner = ref<Partner | null>(null)
const showPartnerForm = ref(false)
const partnerForm = reactive<Partner>({ name: '', partner_type: 'International Partner', description: '', sort_order: 0 })

async function loadPartners() {
  partnersLoading.value = true
  try {
    const { data } = await supabase
      .from('partners')
      .select('id, name, partner_type, description, sort_order')
      .eq('is_visible', true)
      .order('sort_order', { ascending: true })
    partners.value = (data ?? []) as Partner[]
  } catch (e: unknown) { console.warn('load partners:', e instanceof Error ? e.message : e) }
  finally { partnersLoading.value = false }
}

function openPartnerForm(p?: Partner) {
  if (p) {
    editingPartner.value = p
    Object.assign(partnerForm, { name: p.name, partner_type: p.partner_type, description: p.description || '', sort_order: p.sort_order })
  } else {
    editingPartner.value = null
    Object.assign(partnerForm, { name: '', partner_type: 'International Partner', description: '', sort_order: partners.value.length + 1 })
  }
  showPartnerForm.value = true
}

async function savePartner() {
  if (!partnerForm.name) { addToast('Partner name is required', 'error'); return }
  try {
    const payload = {
      name: partnerForm.name,
      partner_type: partnerForm.partner_type,
      description: partnerForm.description || null,
      sort_order: partnerForm.sort_order,
      is_visible: true,
    }
    const { error } = editingPartner.value
      ? await supabase.from('partners').update(payload).eq('id', editingPartner.value.id)
      : await supabase.from('partners').upsert(payload, { onConflict: 'name,partner_type' })
    if (error) throw error
    addToast(editingPartner.value ? 'Partner updated!' : 'Partner added!', 'success')
    showPartnerForm.value = false
    await loadPartners()
  } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Failed to save partner', 'error') }
}

async function deletePartner(p: Partner) {
  if (!p.id) return
  if (!confirm(`Remove "${p.name}"?`)) return
  try {
    const { error } = await supabase.from('partners').delete().eq('id', p.id)
    if (error) throw error
    addToast('Partner removed', 'info')
    await loadPartners()
  } catch (e: unknown) { addToast(e instanceof Error ? e.message : 'Failed to delete', 'error') }
}

/* ─── PAGE CONTENT (from managed pages) ────────── */
interface PageSection { id: string; label: string; heading: string; items: { title: string; body: string }[] }
const pageSections = ref<PageSection[]>([])
const pageContentLoading = ref(false)

async function loadPageContent() {
  pageContentLoading.value = true
  try {
    const { data } = await supabase
      .from('page_sections')
      .select('id, slug, label, heading, body, sort_order')
      .in('slug', ['conservation', 'sustainability', 'community-engagement', 'initiatives'])
      .eq('status', 'published')
      .order('sort_order', { ascending: true })

    if (data) {
      pageSections.value = await Promise.all((data as { id: string; label: string; heading: string | null; body: string | null; sort_order: number }[]).map(async (s) => {
        const { data: items } = await supabase
          .from('section_items')
          .select('title, body')
          .eq('section_id', s.id)
          .order('sort_order', { ascending: true })
        return {
          id: s.id,
          label: s.label,
          heading: s.heading || '',
          items: (items ?? []).map((i: { title: string; body: string | null }) => ({ title: i.title, body: i.body || '' })),
        }
      }))
    }
  } catch (e: unknown) { console.warn('load sections:', e instanceof Error ? e.message : e) }
  finally { pageContentLoading.value = false }
}

/* ─── OVERVIEW STATS (from Supabase) ───────────── */
interface QuickStat { label: string; value: string; desc: string; icon: string }
const overviewStats = ref<QuickStat[]>([
  { label: 'Forest Area', value: '571 ha', desc: 'Protected & restored', icon: 'tree' },
  { label: 'Villages Served', value: '18', desc: 'In program areas', icon: 'map' },
  { label: 'Program Records', value: '0', desc: 'Total in system', icon: 'database' },
  { label: 'Partners', value: '0', desc: 'Active partners', icon: 'users' },
])

async function loadOverviewStats() {
  try {
    const { count: programCount } = await supabase.from('programs').select('*', { count: 'exact', head: true }).eq('status', 'published')
    const { count: partnerCount } = await supabase.from('partners').select('*', { count: 'exact', head: true }).eq('is_visible', true)
    if (programCount !== null) overviewStats.value[2].value = String(programCount)
    if (partnerCount !== null) overviewStats.value[3].value = String(partnerCount)
  } catch { /* ignore */ }
}

/* ─── Init ──────────────────────────────────────── */
onMounted(async () => {
  await Promise.all([
    loadProgram(),
    loadMetrics(),
    loadPartners(),
    loadPageContent(),
    loadOverviewStats(),
  ])
})
</script>

<template>
  <div :class="['env-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <!-- Toasts -->
        <div class="toast-container">
          <TransitionGroup name="toast">
            <div v-for="t in toasts" :key="t.id" :class="['toast', `toast-${t.type}`]">
              <svg v-if="t.type === 'success'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="t.type === 'error'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <span>{{ t.message }}</span>
            </div>
          </TransitionGroup>
        </div>

        <!-- BANNER -->
        <header class="dash-banner">
          <div class="banner-glow" aria-hidden="true"></div>
          <div class="banner-particles" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
          <div class="banner-inner">
            <div class="banner-breadcrumb">
              <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-label">Programs</span>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Environment</span>
            </div>
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge env-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                  Environment Program
                </div>
                <h1 class="banner-title">Environment Dashboard</h1>
                <p class="banner-desc">Manage all environment program data — content, metrics, partners, and page sections.</p>
              </div>
              <div class="banner-actions">
                <RouterLink class="btn btn-ghost" to="/admin/editor/programs-environment">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Page
                </RouterLink>
                <RouterLink class="btn btn-primary env-primary" to="/programs/environment">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Page
                </RouterLink>
              </div>
            </div>
            <div class="banner-stats">
              <div v-for="stat in overviewStats" :key="stat.label" class="bstat">
                <div class="bstat-icon">
                  <svg v-if="stat.icon === 'tree'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-8"/><path d="M12 2C8 2 4 6 4 10c0 3 2 5.5 4 7l4-3 4 3c2-1.5 4-4 4-7 0-4-4-8-8-8z"/></svg>
                  <svg v-else-if="stat.icon === 'map'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
                  <svg v-else-if="stat.icon === 'database'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ stat.value }}</strong>
                  <small>{{ stat.label }}</small>
                  <span class="bstat-desc">{{ stat.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- TAB NAVIGATION -->
        <nav class="tab-nav" aria-label="Environment management tabs">
          <button v-for="tab in tabs" :key="tab.id" :class="['tab-btn', { active: activeTab === tab.id }]" @click="activeTab = tab.id">
            <svg v-if="tab.icon === 'grid'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            <svg v-else-if="tab.icon === 'file'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <svg v-else-if="tab.icon === 'bar-chart'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            <svg v-else-if="tab.icon === 'users'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
            {{ tab.label }}
          </button>
        </nav>

        <!-- ================ TAB: OVERVIEW ================ -->
        <section v-if="activeTab === 'overview'" class="tab-content">
          <div class="quick-links-grid">
            <RouterLink v-for="link in [
              { title: 'Edit Page Content', desc: 'Hero text, headline, intro', to: '/admin/editor/programs-environment', color: 'emerald' },
              { title: 'Manage Records', desc: 'Create & organize data entries', to: '/admin/modules/programs', color: 'blue' },
              { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'amber' },
              { title: 'Impact Stories', desc: 'Publish success stories', to: '/admin/modules/impact-stories', color: 'violet' },
            ]" :key="link.title" :to="link.to" class="link-card" :class="'link-' + link.color">
              <div class="link-icon">
                <svg v-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6"/></svg>
                <svg v-else-if="link.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                <svg v-else-if="link.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
              </div>
              <div class="link-text"><strong>{{ link.title }}</strong><small>{{ link.desc }}</small></div>
              <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
            </RouterLink>
          </div>

          <div class="overview-cards">
            <div class="overview-card-item">
              <span class="oc-label">Program Info</span>
              <p v-if="program.summary" class="oc-text">{{ program.summary.slice(0, 120) }}...</p>
              <p v-else class="oc-text muted">No program info saved yet.</p>
              <button class="oc-action" @click="activeTab = 'program'">Edit →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Impact Metrics</span>
              <p class="oc-text">{{ metrics.length }} metrics configured</p>
              <button class="oc-action" @click="activeTab = 'metrics'">Manage →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Partners</span>
              <p class="oc-text">{{ partners.length }} partners listed</p>
              <button class="oc-action" @click="activeTab = 'partners'">Manage →</button>
            </div>
            <div class="overview-card-item">
              <span class="oc-label">Page Sections</span>
              <p class="oc-text">{{ pageSections.length }} content sections</p>
              <button class="oc-action" @click="activeTab = 'content'">View →</button>
            </div>
          </div>
        </section>

        <!-- ================ TAB: PROGRAM INFO ================ -->
        <section v-if="activeTab === 'program'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>Environment Program Details</h2>
              <p>Edit the program info shown on the public environment page. These values feed into the hero section.</p>
            </div>
            <div class="sc-body">
              <label class="field">
                <span class="field-label">Program Title</span>
                <input v-model="program.title" placeholder="Environment Program" />
              </label>
              <label class="field field-block">
                <span class="field-label">Summary (hero subtitle)</span>
                <textarea v-model="program.summary" rows="3" placeholder="Brief summary shown below the hero title"></textarea>
              </label>
              <label class="field field-block">
                <span class="field-label">Full Description</span>
                <textarea v-model="program.description" rows="6" placeholder="Detailed description of the environment program"></textarea>
              </label>
              <label class="field">
                <span class="field-label">Pillar</span>
                <input v-model="program.pillar" placeholder="Environment" />
              </label>
              <div class="form-actions">
                <button class="btn btn-primary" :disabled="programSaving" @click="saveProgram">
                  <svg v-if="programSaving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/></svg>
                  {{ programSaving ? 'Saving...' : 'Save Program Info' }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- ================ TAB: IMPACT METRICS ================ -->
        <section v-if="activeTab === 'metrics'" class="tab-content">
          <div class="section-card">
            <div class="sc-header sc-header-row">
              <div>
                <h2>Impact Metrics</h2>
                <p>Manage the statistics shown on the environment page's impact section.</p>
              </div>
              <button class="btn btn-primary" @click="openMetricForm()">+ Add Metric</button>
            </div>
            <div class="sc-body">
              <div v-if="showMetricForm" class="inline-form">
                <h4>{{ editingMetric ? 'Edit Metric' : 'New Metric' }}</h4>
                <div class="form-row">
                  <label class="field"><span class="field-label">Label</span><input v-model="metricForm.label" placeholder="e.g. Trees Planted" /></label>
                  <label class="field"><span class="field-label">Value</span><input v-model="metricForm.value_text" placeholder="e.g. 500" /></label>
                </div>
                <div class="form-row">
                  <label class="field"><span class="field-label">Unit</span><input v-model="metricForm.unit" placeholder="e.g. K+, ha" /></label>
                  <label class="field">
                    <span class="field-label">Icon</span>
                    <select v-model="metricForm.icon">
                      <option value="tree">Tree</option>
                      <option value="community">Community</option>
                      <option value="globe">Globe</option>
                      <option value="people">People</option>
                      <option value="map">Map</option>
                    </select>
                  </label>
                  <label class="field"><span class="field-label">Order</span><input v-model.number="metricForm.sort_order" type="number" min="1" /></label>
                </div>
                <div class="form-actions">
                  <button class="btn btn-primary" @click="saveMetric">{{ editingMetric ? 'Update' : 'Create' }}</button>
                  <button class="btn btn-ghost" @click="showMetricForm = false">Cancel</button>
                </div>
              </div>

              <div v-if="metricsLoading" class="loading-text">Loading metrics...</div>
              <div v-else-if="metrics.length === 0" class="empty-state">No metrics yet. Add your first one!</div>
              <div v-else class="data-table-wrap">
                <table class="data-table">
                  <thead><tr><th>Order</th><th>Icon</th><th>Label</th><th>Value</th><th>Unit</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr v-for="m in metrics" :key="m.id">
                      <td>{{ m.sort_order }}</td>
                      <td><span class="metric-icon">{{ m.icon }}</span></td>
                      <td><strong>{{ m.label }}</strong></td>
                      <td>{{ m.value_text }}</td>
                      <td>{{ m.unit || '—' }}</td>
                      <td class="actions-cell">
                        <button class="btn-sm" @click="openMetricForm(m)">Edit</button>
                        <button class="btn-sm btn-sm-danger" @click="deleteMetric(m)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- ================ TAB: PARTNERS ================ -->
        <section v-if="activeTab === 'partners'" class="tab-content">
          <div class="section-card">
            <div class="sc-header sc-header-row">
              <div>
                <h2>Partners</h2>
                <p>Manage partner organizations displayed on the environment page.</p>
              </div>
              <button class="btn btn-primary" @click="openPartnerForm()">+ Add Partner</button>
            </div>
            <div class="sc-body">
              <div v-if="showPartnerForm" class="inline-form">
                <h4>{{ editingPartner ? 'Edit Partner' : 'New Partner' }}</h4>
                <div class="form-row">
                  <label class="field"><span class="field-label">Name</span><input v-model="partnerForm.name" placeholder="Organization name" /></label>
                  <label class="field">
                    <span class="field-label">Type</span>
                    <select v-model="partnerForm.partner_type">
                      <option value="International Partner">International Partner</option>
                      <option value="Local NGO">Local NGO</option>
                      <option value="Funding Partner">Funding Partner</option>
                      <option value="Conservation Partner">Conservation Partner</option>
                      <option value="Technology Partner">Technology Partner</option>
                      <option value="Global Supporter">Global Supporter</option>
                    </select>
                  </label>
                </div>
                <label class="field field-block">
                  <span class="field-label">Description</span>
                  <textarea v-model="partnerForm.description" rows="2" placeholder="Brief description"></textarea>
                </label>
                <div class="form-actions">
                  <button class="btn btn-primary" @click="savePartner">{{ editingPartner ? 'Update' : 'Add' }}</button>
                  <button class="btn btn-ghost" @click="showPartnerForm = false">Cancel</button>
                </div>
              </div>

              <div v-if="partnersLoading" class="loading-text">Loading partners...</div>
              <div v-else-if="partners.length === 0" class="empty-state">No partners yet. Add your first one!</div>
              <div v-else class="data-table-wrap">
                <table class="data-table">
                  <thead><tr><th>Order</th><th>Name</th><th>Type</th><th>Description</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr v-for="p in partners" :key="p.id">
                      <td>{{ p.sort_order }}</td>
                      <td><strong>{{ p.name }}</strong></td>
                      <td><span class="type-badge">{{ p.partner_type }}</span></td>
                      <td class="desc-cell">{{ p.description || '—' }}</td>
                      <td class="actions-cell">
                        <button class="btn-sm" @click="openPartnerForm(p)">Edit</button>
                        <button class="btn-sm btn-sm-danger" @click="deletePartner(p)">Delete</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- ================ TAB: PAGE CONTENT ================ -->
        <section v-if="activeTab === 'content'" class="tab-content">
          <div class="section-card">
            <div class="sc-header">
              <h2>Page Content Sections</h2>
              <p>Content blocks from the page_sections table. Edit text content that appears below the hero on the environment page.</p>
            </div>
            <div class="sc-body">
              <div v-if="pageContentLoading" class="loading-text">Loading sections...</div>
              <div v-else-if="pageSections.length === 0" class="empty-state">
                No page sections found. Run the seed SQL to populate them, or edit via the
                <RouterLink to="/admin/editor/programs-environment">Page Editor</RouterLink>.
              </div>
              <div v-else class="sections-list">
                <div v-for="sec in pageSections" :key="sec.id" class="section-card-mini">
                  <div class="scm-header">
                    <span class="scm-label">{{ sec.label }}</span>
                    <h4>{{ sec.heading }}</h4>
                  </div>
                  <div v-if="sec.items.length > 0" class="scm-items">
                    <div v-for="item in sec.items" :key="item.title" class="scm-item">
                      <strong>{{ item.title }}</strong>
                      <p v-if="item.body">{{ item.body }}</p>
                    </div>
                  </div>
                  <div v-else class="scm-empty">No items in this section</div>
                </div>
              </div>
              <div class="form-actions" style="margin-top: 1rem;">
                <RouterLink class="btn btn-primary" to="/admin/editor/programs-environment">
                  Edit Full Page Content →
                </RouterLink>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ─── VARIABLES ─── */
.env-dash {
  --bg: var(--admin-theme-bg);
  --surface: var(--admin-theme-surface);
  --border: var(--admin-theme-border);
  --border-s: var(--admin-theme-border-strong);
  --text: var(--admin-theme-text);
  --contrast: var(--admin-theme-contrast);
  --muted: var(--admin-theme-muted);
  --emerald: var(--admin-theme-primary);
  --emerald-glow: color-mix(in srgb, var(--admin-theme-primary) 25%, transparent);
  --emerald-soft: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
  --blue: var(--admin-theme-teal);
  --blue-soft: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  --amber: var(--admin-theme-gold);
  --amber-soft: color-mix(in srgb, var(--admin-theme-gold) 12%, transparent);
  --violet: #7c3aed;
  --violet-soft: color-mix(in srgb, #7c3aed 12%, transparent);
  --slate: #64748b;
  --slate-soft: color-mix(in srgb, #64748b 12%, transparent);
  --red: var(--admin-theme-danger);
  --red-soft: color-mix(in srgb, var(--admin-theme-danger) 12%, transparent);
  --shadow-xs: var(--admin-theme-shadow);
  --shadow-sm: var(--admin-theme-shadow);
  --shadow-md: var(--admin-theme-shadow);
  --shadow-lg: var(--admin-theme-shadow);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
  min-height: 100vh; background: var(--bg); color: var(--text);
  font-family: inherit;
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}
.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; position: relative; }

/* ─── TOASTS ─── */
.toast-container { position: fixed; top: 72px; right: 1.5rem; z-index: 200; display: grid; gap: 0.4rem; }
.toast { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border-radius: var(--radius-sm); font-size: 0.82rem; font-weight: 700; box-shadow: var(--shadow-md); background: var(--surface); border: 1px solid var(--border); }
.toast-success { border-color: var(--emerald); color: var(--emerald); }
.toast-error { border-color: var(--red); color: var(--red); }
.toast-info { border-color: var(--blue); color: var(--blue); }
.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from { opacity: 0; transform: translateX(30px); }
.toast-leave-to { opacity: 0; transform: translateX(30px); }

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex; align-items: center; gap: 0.45rem; min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
  cursor: pointer; text-decoration: none; transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  border: 1px solid transparent; font-family: inherit;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary { background: linear-gradient(135deg, #059669, #10b981); color: #fff; box-shadow: 0 4px 14px rgba(5,150,105,0.3); }
.btn-primary:hover { box-shadow: 0 6px 24px rgba(5,150,105,0.4); }
.btn-ghost { background: rgba(255,255,255,0.7); color: var(--contrast); border-color: var(--border); backdrop-filter: blur(8px); }
.btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }
.btn:disabled { opacity: 0.5; cursor: wait; }
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
.btn-sm { padding: 0.25rem 0.5rem; font-size: 0.75rem; font-weight: 700; border-radius: 4px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; transition: all 0.15s ease; }
.btn-sm:hover { border-color: var(--border-s); background: var(--bg); }
.btn-sm-danger { color: var(--red); border-color: var(--red-soft); }
.btn-sm-danger:hover { background: var(--red-soft); }

/* ─── BANNER ─── */
.dash-banner { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-md); overflow: hidden; }
.banner-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 400px 200px at 10% 30%, rgba(5,150,105,0.08) 0%, transparent 70%), radial-gradient(ellipse 300px 200px at 90% 80%, rgba(37,99,235,0.05) 0%, transparent 70%); pointer-events: none; }
.banner-particles { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
.banner-particles span { position: absolute; width: 6px; height: 6px; border-radius: 50%; background: rgba(5,150,105,0.1); }
.banner-particles span:nth-child(1) { top: 15%; left: 10%; animation: float 8s ease-in-out infinite; }
.banner-particles span:nth-child(2) { top: 60%; right: 15%; width: 4px; height: 4px; animation: float 6s ease-in-out infinite reverse; }
.banner-particles span:nth-child(3) { bottom: 20%; left: 40%; width: 5px; height: 5px; animation: float 10s ease-in-out infinite 2s; }
.banner-particles span:nth-child(4) { top: 25%; right: 30%; animation: float 7s ease-in-out infinite 1s; }
@keyframes float { 0%,100% { transform: translateY(0) scale(1); opacity: 0.4; } 50% { transform: translateY(-12px) scale(1.2); opacity: 0.8; } }
.banner-inner { position: relative; z-index: 1; }
.banner-breadcrumb { display: flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.25rem; background: rgba(255,255,255,0.5); backdrop-filter: blur(8px); border-bottom: 1px solid var(--border); font-size: 0.76rem; font-weight: 700; }
:global(.admin-dark) .banner-breadcrumb { background: rgba(16,24,38,0.5); }
.bcrumb-link { color: var(--blue); text-decoration: none; }
.bcrumb-link:hover { text-decoration: underline; }
.bcrumb-sep { color: var(--muted); width: 10px; }
.bcrumb-label { color: var(--muted); }
.bcrumb-current { color: var(--contrast); }
.banner-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem 1.25rem 0.75rem; }
.banner-text { display: grid; gap: 0.3rem; }
.banner-badge { display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--emerald); background: var(--emerald-soft); padding: 0.2rem 0.7rem; border-radius: 999px; }
.banner-title { margin: 0; color: var(--contrast); font-size: clamp(1.35rem,2.8vw,1.85rem); font-weight: 700; letter-spacing: -0.025em; line-height: 1.1; }
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.5; max-width: 460px; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }
.banner-stats { display: grid; grid-template-columns: repeat(4,1fr); border-top: 1px solid var(--border); }
.bstat { display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem 1rem; border-right: 1px solid var(--border); transition: all 0.2s ease; }
.bstat:last-child { border-right: none; }
.bstat:hover { background: var(--surface); }
.bstat-icon { width: 40px; height: 40px; display: grid; place-items: center; border-radius: var(--radius-sm); flex-shrink: 0; background: var(--emerald-soft); color: var(--emerald); transition: transform 0.2s ease; }
.bstat:hover .bstat-icon { transform: scale(1.08); }
.bstat-info strong { display: block; color: var(--contrast); font-size: 1.05rem; font-weight: 700; line-height: 1.2; }
.bstat-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.bstat-desc { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 500; margin-top: 1px; }

/* ─── TAB NAV ─── */
.tab-nav { display: flex; gap: 0.35rem; margin-top: 1.25rem; padding: 0 0.25rem; overflow-x: auto; }
.tab-btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--muted); font-size: 0.8rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease; white-space: nowrap; font-family: inherit; }
.tab-btn:hover { border-color: var(--border-s); color: var(--contrast); }
.tab-btn.active { background: var(--emerald-soft); border-color: var(--emerald); color: var(--emerald); }
:global(.admin-dark) .tab-btn.active { background: rgba(16,185,129,0.1); }

/* ─── TAB CONTENT ─── */
.tab-content { margin-top: 1.25rem; }

/* ─── QUICK LINKS ─── */
.quick-links-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.7rem; margin-bottom: 1.25rem; }
.link-card { display: flex; align-items: center; gap: 0.7rem; padding: 0.75rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--border); background: var(--surface); text-decoration: none; transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
.link-card:hover { border-color: var(--border-s); box-shadow: var(--shadow-sm); transform: translateY(-2px); }
.link-icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: var(--radius-sm); flex-shrink: 0; }
.link-emerald .link-icon { background: var(--emerald-soft); color: var(--emerald); }
.link-blue .link-icon { background: var(--blue-soft); color: var(--blue); }
.link-amber .link-icon { background: var(--amber-soft); color: var(--amber); }
.link-violet .link-icon { background: var(--violet-soft); color: var(--violet); }
.link-text { flex: 1; min-width: 0; }
.link-text strong { display: block; color: var(--contrast); font-size: 0.82rem; font-weight: 700; margin-bottom: 1px; }
.link-text small { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { flex-shrink: 0; color: var(--muted); transition: transform 0.2s ease; }
.link-card:hover .link-arrow { transform: translateX(3px); color: var(--emerald); }

/* ─── OVERVIEW CARDS ─── */
.overview-cards { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.85rem; }
.overview-card-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; transition: box-shadow 0.2s ease; }
.overview-card-item:hover { box-shadow: var(--shadow-sm); }
.oc-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--emerald); }
.oc-text { color: var(--muted); font-size: 0.85rem; margin: 0.35rem 0; line-height: 1.4; }
.oc-text.muted { font-style: italic; }
.oc-action { background: none; border: none; color: var(--blue); font-size: 0.78rem; font-weight: 700; cursor: pointer; padding: 0; font-family: inherit; }
.oc-action:hover { text-decoration: underline; }

/* ─── SECTION CARD ─── */
.section-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); overflow: hidden; }
.sc-header { padding: 1rem 1.25rem; border-bottom: 1px solid var(--border); }
.sc-header h2 { margin: 0; font-size: 1rem; font-weight: 700; color: var(--contrast); }
.sc-header p { margin: 0.2rem 0 0; color: var(--muted); font-size: 0.82rem; }
.sc-header-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
.sc-body { padding: 1.25rem; }

/* ─── FORMS ─── */
.field { display: grid; gap: 0.25rem; }
.field-block { grid-column: 1 / -1; }
.field-label { font-size: 0.75rem; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; }
.field input, .field textarea, .field select { padding: 0.55rem 0.75rem; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--surface); color: var(--contrast); font-size: 0.88rem; font-family: inherit; transition: border-color 0.15s ease; width: 100%; }
.field input:focus, .field textarea:focus, .field select:focus { outline: none; border-color: var(--emerald); box-shadow: 0 0 0 2px var(--emerald-glow); }
:global(.admin-dark) .field input, :global(.admin-dark) .field textarea, :global(.admin-dark) .field select { background: var(--bg); }
.form-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 0.75rem; }
.form-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
.inline-form { background: var(--bg); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 1rem; }
.inline-form h4 { margin: 0 0 0.75rem; font-size: 0.9rem; color: var(--contrast); }

/* ─── DATA TABLE ─── */
.data-table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-md); }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { text-align: left; padding: 0.55rem 0.75rem; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
.data-table th { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--muted); background: var(--bg); }
.data-table tr:last-child td { border-bottom: none; }
.data-table tbody tr:hover { background: var(--bg); }
.actions-cell { display: flex; gap: 0.3rem; }
.desc-cell { max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--muted); }
.metric-icon { display: inline-block; padding: 0.15rem 0.4rem; border-radius: 4px; background: var(--emerald-soft); color: var(--emerald); font-size: 0.75rem; font-weight: 700; }
.type-badge { display: inline-block; padding: 0.15rem 0.4rem; border-radius: 4px; background: var(--violet-soft); color: var(--violet); font-size: 0.72rem; font-weight: 700; }
.loading-text { color: var(--muted); font-style: italic; padding: 1rem 0; }
.empty-state { color: var(--muted); padding: 1.5rem 0; text-align: center; }

/* ─── SECTIONS LIST ─── */
.sections-list { display: grid; gap: 0.85rem; }
.section-card-mini { border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; background: var(--bg); }
.scm-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--emerald); }
.section-card-mini h4 { margin: 0.25rem 0 0; font-size: 0.9rem; color: var(--contrast); }
.scm-items { display: grid; gap: 0.5rem; margin-top: 0.75rem; }
.scm-item { border-left: 3px solid var(--emerald); padding: 0.5rem 0.75rem; background: var(--surface); border-radius: 0 6px 6px 0; }
.scm-item strong { display: block; font-size: 0.82rem; color: var(--contrast); }
.scm-item p { margin: 0.2rem 0 0; font-size: 0.78rem; color: var(--muted); }
.scm-empty { color: var(--muted); font-style: italic; font-size: 0.82rem; margin-top: 0.5rem; }

/* ─── RESPONSIVE ─── */
@media (min-width: 900px) { .env-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 1100px) { .content-grid { grid-template-columns: 1fr; } }
@media (max-width: 900px) { .banner-stats { grid-template-columns: repeat(2,1fr); } .quick-links-grid { grid-template-columns: 1fr; } .overview-cards { grid-template-columns: 1fr; } }
@media (max-width: 720px) { .dash-main { padding: 1rem; } .banner-content { flex-direction: column; } .banner-stats { grid-template-columns: 1fr; } .bstat { border-right: none; border-bottom: 1px solid var(--border); } .bstat:last-child { border-bottom: none; } .tab-nav { gap: 0.2rem; } .tab-btn { padding: 0.4rem 0.6rem; font-size: 0.72rem; } }
@media (max-width: 600px) { .banner-actions { width: 100%; } .banner-actions .btn { flex: 1; justify-content: center; } }
</style>
