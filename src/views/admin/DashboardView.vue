<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'
import { useUiStore } from '@/stores/ui.store'

const auth = useAuthStore()
const ui = useUiStore()

// ── State ──
const loading = ref(true)
const loadError = ref('')
const stats = ref({
  pages: { total: 0, published: 0, draft: 0 },
  programs: { total: 0, published: 0, draft: 0 },
  media: 0,
  partners: 0,
  offices: 0,
  profiles: 0,
  donations: 0,
})
const recentPages = ref<{ slug: string; title: string; status: string; updated_at: string; locale: string }[]>([])
const programsByPillar = ref<{ pillar: string; status: string; title: string }[]>([])

// ── Computed ──

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const adminName = computed(() => {
  const p = auth.profile
  if (p?.email) return p.email.split('@')[0]
  return 'Admin'
})

const adminRole = computed(() => {
  const role = auth.profile?.role ?? 'viewer'
  return role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')
})

const totalContent = computed(() =>
  stats.value.pages.total + stats.value.programs.total,
)

const publishedRate = computed(() => {
  if (!totalContent.value) return 0
  const published =
    stats.value.pages.published +
    stats.value.programs.published
  return Math.round((published / totalContent.value) * 100)
})

const draftRate = computed(() => {
  if (!totalContent.value) return 0
  const draft =
    stats.value.pages.draft +
    stats.value.programs.draft
  return Math.round((draft / totalContent.value) * 100)
})

// ── Quick actions with real routes ──
const quickActions = [
  {
    label: 'Edit Home',
    detail: 'Update homepage content & slideshow',
    to: '/admin/editor/home',
    color: 'emerald',
    icon: 'home',
  },
  {
    label: 'Manage Programs',
    detail: 'All 4 program pillars',
    to: '/admin/programs',
    color: 'blue',
    icon: 'layers',
  },
  {
    label: 'Media Library',
    detail: 'Upload & manage images',
    to: '/admin/media',
    color: 'violet',
    icon: 'image',
  },
  {
    label: 'Contact Page',
    detail: 'Offices, form & Telegram',
    to: '/admin/contact',
    color: 'cyan',
    icon: 'message-square',
  },
  {
    label: 'Donation QR',
    detail: 'Bank accounts & QR codes',
    to: '/admin/donate',
    color: 'rose',
    icon: 'credit-card',
  },
]

// ── Helpers ──
function statusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'published': return '#10b981'
    case 'draft': return '#f59e0b'
    case 'archived': return '#6b7280'
    default: return '#6b7280'
  }
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date)
}

function countByStatus(items: { status: string }[], status: string) {
  return items.filter((i) => i.status?.toLowerCase() === status.toLowerCase()).length
}

// ── Data loading ──
async function loadDashboard() {
  loading.value = true
  loadError.value = ''

  try {
    const results = await Promise.allSettled([
      supabase.from('pages').select('slug, title, status, updated_at, locale'),
      supabase.from('programs').select('slug, title, pillar, status'),
      supabase.from('media_assets').select('id', { count: 'exact', head: true }),
      supabase.from('partners').select('id', { count: 'exact', head: true }),
      supabase.from('offices').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('donation_methods').select('id', { count: 'exact', head: true }),
    ])

    // Pages
    if (results[0].status === 'fulfilled' && results[0].value.data) {
      const rows = results[0].value.data as { slug: string; title: string; status: string; updated_at: string; locale: string }[]
      stats.value.pages.total = rows.length
      stats.value.pages.published = countByStatus(rows, 'published')
      stats.value.pages.draft = countByStatus(rows, 'draft')
      recentPages.value = rows
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, 10)
    }

    // Programs
    if (results[1].status === 'fulfilled' && results[1].value.data) {
      const rows = results[1].value.data as { slug: string; title: string; pillar: string; status: string }[]
      stats.value.programs.total = rows.length
      stats.value.programs.published = countByStatus(rows, 'published')
      stats.value.programs.draft = countByStatus(rows, 'draft')
      programsByPillar.value = rows
    }

    // Counts
    const extractCount = (result: PromiseSettledResult<{ count: number | null }>, fallback = 0) =>
      result.status === 'fulfilled' ? (result.value.count ?? fallback) : fallback

    stats.value.media = extractCount(results[2])
    stats.value.partners = extractCount(results[3])
    stats.value.offices = extractCount(results[4])
    stats.value.profiles = extractCount(results[5])
    stats.value.donations = extractCount(results[6])

  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load dashboard data.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  void loadDashboard()
})

// ── Pillar config for programs ──
const pillarConfig: Record<string, { label: string; color: string; icon: string }> = {
  Education: { label: 'Education', color: '#2563eb', icon: '📚' },
  Environment: { label: 'Environment', color: '#16a34a', icon: '🌿' },
  Livelihood: { label: 'Livelihood', color: '#ca8a04', icon: '🌾' },
  'Child Protection': { label: 'Child Protection', color: '#dc2626', icon: '🛡️' },
}

const pillarKeys = computed(() => Object.keys(pillarConfig))

const pillarStats = computed(() => {
  return pillarKeys.value.map((key) => {
    const config = pillarConfig[key]
    const items = programsByPillar.value.filter((p) => p.pillar === key)
    return {
      key,
      label: config.label,
      color: config.color,
      icon: config.icon,
      total: items.length,
      published: countByStatus(items, 'published'),
      draft: countByStatus(items, 'draft'),
    }
  })
})


</script>

<template>
  <div :class="['dash-root', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-flex">
      <AdminSidebar />

      <main class="dash-main">
        <!-- Loading -->
        <Transition name="fade">
          <div v-if="loading" class="dash-loading">
            <div class="load-spinner" aria-label="Loading dashboard">
              <span class="spin-ring"></span>
              <span>Loading dashboard...</span>
            </div>
          </div>
        </Transition>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="loadError && !loading" class="dash-error">
            <div class="err-card">
              <span class="err-icon">⚠️</span>
              <div>
                <strong>Could not load dashboard</strong>
                <p>{{ loadError }}</p>
              </div>
              <button type="button" class="btn btn-secondary" @click="loadDashboard">Retry</button>
            </div>
          </div>
        </Transition>

        <!-- Content -->
        <div v-if="!loading" class="dash-content">
          <!-- ── Welcome Banner ── -->
          <header class="welcome-banner">
            <div class="welcome-text">
              <div class="welcome-badge">{{ adminRole }}</div>
              <h1 class="welcome-heading">
                {{ greeting }}, <span class="welcome-name">{{ adminName }}</span>
              </h1>
              <p class="welcome-sub">
                Here's what's happening across your content today.
              </p>
            </div>
            <div class="welcome-actions">
              <RouterLink to="/admin/editor/home" class="btn btn-primary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                <span>Edit homepage</span>
              </RouterLink>
              <RouterLink to="/admin/programs" class="btn btn-ghost">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
                <span>Manage programs</span>
              </RouterLink>
            </div>
          </header>

          <!-- ── Stats Cards ── -->
          <section class="stats-grid" aria-label="Content statistics">
            <article class="stat-card card-emerald">
              <div class="stat-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <div class="stat-body">
                <strong class="stat-value">{{ stats.pages.total }}</strong>
                <span class="stat-label">Pages</span>
              </div>
              <div v-if="stats.pages.total" class="stat-badge" :style="{ '--badge-color': '#10b981' }">
                {{ stats.pages.published }} published
              </div>
            </article>

            <article class="stat-card card-blue">
              <div class="stat-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
              </div>
              <div class="stat-body">
                <strong class="stat-value">{{ stats.programs.total }}</strong>
                <span class="stat-label">Programs</span>
              </div>
              <div v-if="stats.programs.total" class="stat-badge" :style="{ '--badge-color': '#3b82f6' }">
                {{ stats.programs.published }} active
              </div>
            </article>

            <article class="stat-card card-violet">
              <div class="stat-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              </div>
              <div class="stat-body">
                <strong class="stat-value">{{ stats.media }}</strong>
                <span class="stat-label">Media</span>
              </div>
            </article>

            <article class="stat-card card-cyan">
              <div class="stat-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="stat-body">
                <strong class="stat-value">{{ stats.profiles }}</strong>
                <span class="stat-label">Users</span>
              </div>
            </article>

            <article class="stat-card card-rose">
              <div class="stat-icon-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
              </div>
              <div class="stat-body">
                <strong class="stat-value">{{ stats.partners }}</strong>
                <span class="stat-label">Partners</span>
              </div>
            </article>
          </section>

          <!-- ── Charts & Activity Row ── -->
          <section class="charts-row" aria-label="Content overview">
            <!-- Content Status Donut -->
            <article class="chart-card">
              <header class="chart-header">
                <div>
                  <p class="chart-kicker">Content status</p>
                  <h2 class="chart-title">Published vs Draft</h2>
                </div>
                <span class="chart-total">{{ totalContent }} total</span>
              </header>
              <div class="chart-body chart-body-center">
                <div
                  class="donut-chart"
                  :style="{
                    '--pct': publishedRate + '%',
                    background: `radial-gradient(circle at center, var(--admin-theme-surface) 0 58%, transparent 59%),
                                conic-gradient(#10b981 0% ${publishedRate}%, #f59e0b ${publishedRate}% ${publishedRate + draftRate}%, #374151 ${publishedRate + draftRate}% 100%)`,
                  }"
                >
                  <div class="donut-center">
                    <strong>{{ publishedRate }}%</strong>
                    <span>Published</span>
                  </div>
                </div>
                <div class="donut-legend">
                  <div class="legend-item">
                    <span class="legend-dot" style="background: #10b981"></span>
                    <span class="legend-label">Published</span>
                    <strong class="legend-value">{{
                      stats.pages.published + stats.programs.published
                    }}</strong>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background: #f59e0b"></span>
                    <span class="legend-label">Draft</span>
                    <strong class="legend-value">{{
                      stats.pages.draft + stats.programs.draft
                    }}</strong>
                  </div>
                  <div class="legend-item">
                    <span class="legend-dot" style="background: #374151"></span>
                    <span class="legend-label">Archived</span>
                    <strong class="legend-value">{{
                      totalContent - (stats.pages.published + stats.programs.published + stats.pages.draft + stats.programs.draft)
                    }}</strong>
                  </div>
                </div>
              </div>
            </article>

            <!-- Programs by Pillar -->
            <article class="chart-card">
              <header class="chart-header">
                <div>
                  <p class="chart-kicker">Programs</p>
                  <h2 class="chart-title">Pillar overview</h2>
                </div>
                <RouterLink to="/admin/programs" class="chart-link">Manage</RouterLink>
              </header>
              <div class="chart-body">
                <div v-for="pillar in pillarStats" :key="pillar.key" class="pillar-row">
                  <div class="pillar-head">
                    <span class="pillar-icon">{{ pillar.icon }}</span>
                    <div class="pillar-info">
                      <strong>{{ pillar.label }}</strong>
                      <small>{{ pillar.total }} program{{ pillar.total !== 1 ? 's' : '' }}</small>
                    </div>
                    <div class="pillar-badge" v-if="pillar.published" :style="{ background: pillar.color + '18', color: pillar.color }">
                      {{ pillar.published }} active
                    </div>
                  </div>
                  <div class="pillar-bar-track">
                    <div
                      class="pillar-bar-fill"
                      :style="{ 
                        width: pillar.total ? (pillar.published / Math.max(pillar.total, 1)) * 100 + '%' : '0%',
                        background: pillar.color 
                      }"
                    ></div>
                  </div>
                </div>
              </div>
            </article>

            <!-- Recent Activity -->
            <article class="chart-card activity-card">
              <header class="chart-header">
                <div>
                  <p class="chart-kicker">Activity</p>
                  <h2 class="chart-title">Recent updates</h2>
                </div>
                <span class="chart-total">Latest</span>
              </header>
              <div class="chart-body chart-body-scroll">
                <div v-if="!recentPages.length" class="empty-state">
                  <span>No recent activity yet.</span>
                </div>
                <div v-for="page in recentPages.slice(0, 6)" :key="'page-' + page.slug" class="activity-row">
                  <div class="activity-icon-wrap" style="background: #10b98112; color: #10b981">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="activity-body">
                    <div class="activity-head">
                      <RouterLink :to="`/admin/editor/${page.slug}`" class="activity-title">{{ page.title }}</RouterLink>
                      <span class="activity-status" :style="{ background: statusColor(page.status) + '18', color: statusColor(page.status) }">{{ page.status }}</span>
                    </div>
                    <span class="activity-meta">{{ page.locale === 'kh' ? 'Khmer' : 'English' }} · {{ formatDate(page.updated_at) }}</span>
                  </div>
                </div>
              </div>
            </article>
          </section>

          <!-- ── Quick Actions ── -->
          <section class="actions-section" aria-label="Quick actions">
            <header class="actions-header">
              <div>
                <p class="section-kicker">Navigate</p>
                <h2 class="section-title">Quick actions</h2>
              </div>
            </header>
            <div class="actions-grid">
              <RouterLink
                v-for="action in quickActions"
                :key="action.to"
                :to="action.to"
                class="action-card"
                :class="'accent-' + action.color"
              >
                <div class="action-icon-wrap" aria-hidden="true">
                  <svg v-if="action.icon === 'home'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                  <svg v-else-if="action.icon === 'layers'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
                  <svg v-else-if="action.icon === 'file-text'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                  <svg v-else-if="action.icon === 'image'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                  <svg v-else-if="action.icon === 'message-square'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  <svg v-else-if="action.icon === 'credit-card'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                </div>
                <div class="action-body">
                  <strong>{{ action.label }}</strong>
                  <small>{{ action.detail }}</small>
                </div>
                <svg class="action-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </RouterLink>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   DASHBOARD ROOT
   ═══════════════════════════════════════════ */
.dash-root {
  --dash-bg: var(--admin-theme-bg);
  --dash-surface: var(--admin-theme-surface);
  --dash-surface-soft: var(--admin-theme-surface-soft);
  --dash-border: var(--admin-theme-border);
  --dash-border-strong: var(--admin-theme-border-strong);
  --dash-text: var(--admin-theme-text);
  --dash-contrast: var(--admin-theme-contrast);
  --dash-muted: var(--admin-theme-muted);
  --dash-shadow: var(--admin-theme-shadow);
  --dash-primary: var(--admin-theme-primary);
  --dash-primary-deep: var(--admin-theme-primary-deep);

  min-height: 100vh;
  background: var(--dash-bg);
  color: var(--dash-text);
  font-family: var(--font-family-base);
  transition: padding-left 0.25s ease;
}

.dash-flex {
  display: flex;
  min-height: 100vh;
}

.dash-main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2rem 2.5rem;
  padding-top: 1.5rem;
}

@media (min-width: 900px) {
  .dash-root.sidebar-open {
    padding-left: 260px;
  }
}

/* ═══════════════════════════════════════════
   LOADING & ERROR
   ═══════════════════════════════════════════ */
.dash-loading {
  display: grid;
  place-items: center;
  min-height: 400px;
}

.load-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: var(--dash-muted);
  font-weight: 700;
}

.spin-ring {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: 3px solid var(--dash-surface-soft);
  border-top-color: var(--dash-primary);
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.dash-error {
  padding: 1rem 0;
}

.err-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.06);
}

.err-icon { font-size: 1.3rem; }

.err-card strong {
  color: #dc2626;
  font-size: 0.9rem;
}

.err-card p {
  margin: 0;
  color: var(--dash-muted);
  font-size: 0.82rem;
}

/* ═══════════════════════════════════════════
   WELCOME BANNER
   ═══════════════════════════════════════════ */
.welcome-banner {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem 1.75rem;
  border: 1px solid var(--dash-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--dash-surface), var(--dash-surface-soft));
  box-shadow: var(--dash-shadow);
  margin-bottom: 1.25rem;
}

.welcome-badge {
  display: inline-flex;
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  background: color-mix(in srgb, var(--dash-primary) 14%, transparent);
  color: var(--dash-primary-deep);
  margin-bottom: 0.5rem;
  width: fit-content;
}

.welcome-text {
  display: grid;
  gap: 0.25rem;
}

.welcome-heading {
  margin: 0;
  color: var(--dash-contrast);
  font-size: clamp(1.35rem, 2.5vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.welcome-name {
  background: linear-gradient(135deg, var(--dash-primary), var(--dash-primary-deep));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.welcome-sub {
  margin: 0;
  color: var(--dash-muted);
  font-size: 0.88rem;
  line-height: 1.55;
}

.welcome-actions {
  display: flex;
  gap: 0.55rem;
  flex-shrink: 0;
  flex-wrap: wrap;
}

/* ═══════════════════════════════════════════
   BUTTONS
   ═══════════════════════════════════════════ */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 38px;
  padding: 0.45rem 1rem;
  border: 1px solid transparent;
  border-radius: 8px;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(180deg, var(--dash-primary), var(--dash-primary-deep));
  color: #fff;
  border-color: var(--dash-primary-deep);
  box-shadow: 0 8px 16px color-mix(in srgb, var(--dash-primary) 24%, transparent);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px color-mix(in srgb, var(--dash-primary) 32%, transparent);
}

.btn-ghost {
  background: var(--dash-surface);
  color: var(--dash-contrast);
  border-color: color-mix(in srgb, var(--dash-contrast) 18%, var(--dash-border));
}

.btn-ghost:hover {
  border-color: var(--dash-primary);
  background: color-mix(in srgb, var(--dash-primary) 8%, var(--dash-surface));
  color: var(--dash-primary-deep);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--dash-surface);
  color: var(--dash-contrast);
  border-color: var(--dash-border-strong);
}

.btn-secondary:hover {
  background: var(--dash-surface-soft);
  border-color: var(--dash-primary);
}

/* ═══════════════════════════════════════════
   STATS CARDS
   ═══════════════════════════════════════════ */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.65rem 0.85rem;
  padding: 1.1rem 1.1rem 0.95rem;
  border: 1px solid var(--dash-border);
  border-radius: 14px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--card-accent) 40%, var(--dash-border));
  box-shadow: 0 18px 36px color-mix(in srgb, var(--card-accent) 10%, transparent);
}

.stat-icon-wrap {
  grid-row: 1 / 3;
  width: 2.3rem;
  height: 2.3rem;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-accent) 14%, transparent);
  color: var(--card-accent);
}

.stat-body {
  display: grid;
  gap: 0.1rem;
}

.stat-value {
  color: var(--dash-contrast);
  font-size: 1.65rem;
  font-weight: 800;
  line-height: 1;
}

.stat-label {
  color: var(--dash-muted);
  font-size: 0.78rem;
  font-weight: 700;
}

.stat-badge {
  grid-column: 2;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  background: color-mix(in srgb, var(--badge-color) 14%, transparent);
  color: var(--badge-color);
  width: fit-content;
}

.card-emerald { --card-accent: #10b981; }
.card-blue    { --card-accent: #3b82f6; }
.card-amber   { --card-accent: #f59e0b; }
.card-violet  { --card-accent: #8b5cf6; }
.card-cyan    { --card-accent: #06b6d4; }
.card-rose    { --card-accent: #f43f5e; }

/* ═══════════════════════════════════════════
   CHARTS ROW
   ═══════════════════════════════════════════ */
.charts-row {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.1fr) minmax(340px, 1.15fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.chart-card {
  border: 1px solid var(--dash-border);
  border-radius: 14px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--dash-border);
  background: linear-gradient(180deg, var(--dash-surface-soft), transparent);
}

.chart-kicker {
  margin: 0 0 0.15rem;
  color: var(--dash-primary-deep);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.chart-title {
  margin: 0;
  color: var(--dash-contrast);
  font-size: 0.95rem;
  font-weight: 800;
}

.chart-total {
  color: var(--dash-muted);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.chart-link {
  color: var(--dash-primary-deep);
  font-size: 0.78rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  transition: background 0.12s;
}

.chart-link:hover {
  background: color-mix(in srgb, var(--dash-primary) 10%, transparent);
}

.chart-body {
  padding: 1.1rem 1.2rem;
  flex: 1;
}

.chart-body-center {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 1.5rem 1.2rem;
}

.chart-body-scroll {
  max-height: 380px;
  overflow-y: auto;
  scrollbar-width: thin;
}

/* ── Donut Chart ── */
.donut-chart {
  width: 140px;
  height: 140px;
  border-radius: 999px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  box-shadow: inset 0 0 0 8px var(--dash-bg);
  transition: transform 0.3s ease;
}

.donut-chart:hover {
  transform: scale(1.04);
}

.donut-center {
  display: grid;
  place-items: center;
  text-align: center;
}

.donut-center strong {
  color: var(--dash-contrast);
  font-size: 1.7rem;
  font-weight: 800;
  line-height: 1;
}

.donut-center span {
  color: var(--dash-muted);
  font-size: 0.7rem;
  font-weight: 700;
}

.donut-legend {
  display: grid;
  gap: 0.65rem;
}

.legend-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 0.5rem;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.legend-label {
  color: var(--dash-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

.legend-value {
  color: var(--dash-contrast);
  font-size: 0.92rem;
  font-weight: 800;
  text-align: right;
}

/* ── Pillar Bars ── */
.pillar-row {
  display: grid;
  gap: 0.4rem;
  padding: 0.7rem 0;
}

.pillar-row + .pillar-row {
  border-top: 1px solid var(--dash-border);
}

.pillar-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pillar-icon {
  font-size: 1.1rem;
  width: 1.6rem;
  text-align: center;
  flex-shrink: 0;
}

.pillar-info {
  flex: 1;
  min-width: 0;
}

.pillar-info strong {
  display: block;
  color: var(--dash-contrast);
  font-size: 0.86rem;
  font-weight: 800;
}

.pillar-info small {
  color: var(--dash-muted);
  font-size: 0.72rem;
  font-weight: 600;
}

.pillar-badge {
  padding: 0.15rem 0.55rem;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  white-space: nowrap;
}

.pillar-bar-track {
  height: 5px;
  border-radius: 999px;
  background: var(--dash-surface-soft);
  overflow: hidden;
}

.pillar-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ── Activity Feed ── */
.activity-row {
  display: flex;
  gap: 0.75rem;
  padding: 0.7rem 0;
}

.activity-row + .activity-row {
  border-top: 1px solid var(--dash-border);
}

.activity-icon-wrap {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 8px;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.activity-body {
  flex: 1;
  min-width: 0;
}

.activity-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.15rem;
}

.activity-title {
  color: var(--dash-contrast);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-title:hover {
  color: var(--dash-primary-deep);
  text-decoration: underline;
}

.activity-status {
  padding: 0.08rem 0.45rem;
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  white-space: nowrap;
  flex-shrink: 0;
}

.activity-meta {
  color: var(--dash-muted);
  font-size: 0.75rem;
  font-weight: 600;
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 120px;
  color: var(--dash-muted);
  font-size: 0.86rem;
  font-weight: 600;
}

/* ═══════════════════════════════════════════
   QUICK ACTIONS
   ═══════════════════════════════════════════ */
.section-kicker {
  margin: 0 0 0.15rem;
  color: var(--dash-primary-deep);
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  color: var(--dash-contrast);
  font-size: 1rem;
  font-weight: 800;
}

.actions-header {
  margin-bottom: 0.85rem;
}

.actions-section {
  margin-top: 0.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.85rem;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--dash-border);
  border-radius: 12px;
  background: var(--dash-surface);
  box-shadow: var(--dash-shadow);
  text-decoration: none;
  transition: all 0.15s ease;
}

.action-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--action-accent) 45%, var(--dash-border));
  box-shadow: 0 16px 32px color-mix(in srgb, var(--action-accent) 10%, transparent);
}

.action-icon-wrap {
  width: 2.4rem;
  height: 2.4rem;
  display: grid;
  place-items: center;
  border-radius: 10px;
  background: color-mix(in srgb, var(--action-accent) 14%, transparent);
  color: var(--action-accent);
  flex-shrink: 0;
  transition: transform 0.15s ease;
}

.action-card:hover .action-icon-wrap {
  transform: scale(1.08);
}

.action-body {
  flex: 1;
  min-width: 0;
}

.action-body strong {
  display: block;
  color: var(--dash-contrast);
  font-size: 0.88rem;
  font-weight: 800;
  margin-bottom: 0.1rem;
}

.action-body small {
  display: block;
  color: var(--dash-muted);
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.3;
}

.action-chevron {
  flex-shrink: 0;
  color: var(--dash-muted);
  transition: transform 0.15s ease;
}

.action-card:hover .action-chevron {
  transform: translateX(3px);
  color: var(--action-accent);
}

.accent-emerald { --action-accent: #10b981; }
.accent-blue    { --action-accent: #3b82f6; }
.accent-amber   { --action-accent: #f59e0b; }
.accent-violet  { --action-accent: #8b5cf6; }
.accent-cyan    { --action-accent: #06b6d4; }
.accent-rose    { --action-accent: #f43f5e; }

/* ═══════════════════════════════════════════
   TRANSITIONS
   ═══════════════════════════════════════════ */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ═══════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════ */
@media (max-width: 1260px) {
  .stats-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1100px) {
  .charts-row {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 780px) {
  .dash-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .welcome-banner {
    flex-direction: column;
    padding: 1.25rem;
  }

  .welcome-actions {
    width: 100%;
  }

  .welcome-actions .btn {
    flex: 1;
    justify-content: center;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .chart-body-center {
    flex-direction: column;
    gap: 1.25rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>

<!-- Non-scoped dark mode override to ensure dark background applies in admin-dark mode -->
<style>
.admin-dark .admin-page {
  background: #06100F !important;
}
.admin-dark .admin-page .admin-layout {
  background: #06100F !important;
}
.admin-dark .admin-page .main {
  background: #06100F !important;
}
.admin-dark .admin-page .dashboard-card {
  background: #0a1a14 !important;
}
.admin-dark .admin-page .dashboard-panel {
  background: #0a1a14 !important;
}
.admin-dark .admin-page .overview-header {
  background: #0a1a14 !important;
}
</style>
