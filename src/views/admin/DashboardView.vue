<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

type PageRow = {
  slug: string
  title: string
  body: string
  updated_at: string | null
}

const loading = ref(false)
const pageCount = ref(0)
const savedCount = ref(0)
const latestUpdate = ref('')
const ui = useUiStore()

const monthlyVisitors = [
  { month: 'Jan', visitors: 4200, views: 12800 },
  { month: 'Feb', visitors: 5100, views: 14300 },
  { month: 'Mar', visitors: 6800, views: 18100 },
  { month: 'Apr', visitors: 6200, views: 17200 },
  { month: 'May', visitors: 7900, views: 20900 },
  { month: 'Jun', visitors: 8600, views: 23600 },
]

const quickActions = [
  {
    label: 'Edit Home Page',
    detail: 'Edit public homepage content',
    to: '/admin/editor/home',
    tone: 'blue',
  },
  {
    label: 'New Program',
    detail: 'Open program content workflow',
    to: '/admin/modules/programs',
    tone: 'green',
  },
  {
    label: 'New News',
    detail: 'Draft an announcement or update',
    to: '/admin/modules/news',
    tone: 'orange',
  },
  {
    label: 'Add User',
    detail: 'Create an admin account',
    to: '/admin/modules/users',
    tone: 'slate',
  },
]

const maxVisitors = computed(() => {
  return Math.max(1, ...monthlyVisitors.map((item) => item.visitors))
})

const dashboardStats = computed(() => [
  {
    label: 'Total Visitors',
    value: '42.8K',
    tone: 'blue',
  },
  {
    label: 'Public Pages',
    value: String(pageCount.value),
    tone: 'green',
  },
  {
    label: 'Saved Pages',
    value: String(savedCount.value),
    tone: 'blue',
  },
  {
    label: 'Content Modules',
    value: '6',
    tone: 'orange',
  },
  {
    label: 'Total Programs',
    value: '4',
    tone: 'green',
  },
  {
    label: 'Registered Users',
    value: '8',
    tone: 'slate',
  },
])

onMounted(() => {
  void loadPageStats()
})

async function loadPageStats() {
  loading.value = true
  try {
    const { data, error } = await supabase.from('pages').select('slug, updated_at')

    if (error) throw error

    const rows = (data ?? []) as { slug: string; updated_at: string | null }[]
    pageCount.value = rows.length
    savedCount.value = rows.filter((row) => row.updated_at).length

    const timestamps = rows
      .map((row) => Date.parse(row.updated_at ?? ''))
      .filter((ts) => Number.isFinite(ts))
    if (timestamps.length) {
      latestUpdate.value = new Date(Math.max(...timestamps)).toISOString()
    }
  } catch {
    // Silently fall back to defaults
  } finally {
    loading.value = false
  }
}

function formatDate(value: string) {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function percent(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}

function barWidth(value: number, total: number) {
  return `${Math.max(8, percent(value, total))}%`
}
</script>

<template>
  <div :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="main">
        <section class="dashboard-overview" aria-label="Admin dashboard">
          <!-- Stats Cards -->
          <section class="dashboard-cards" aria-label="Website summary">
            <article
              v-for="card in dashboardStats"
              :key="card.label"
              class="dashboard-card"
              :class="`card-${card.tone}`"
            >
              <div class="card-top">
                <span class="stat-icon" aria-hidden="true"></span>
              </div>
              <span>{{ card.label }}</span>
              <strong>{{ card.value }}</strong>
            </article>
          </section>

          <!-- Analytics & Panels -->
          <section class="analytics-grid" aria-label="Website analytics">
            <article class="dashboard-panel visitors-panel">
              <header>
                <div>
                  <p class="eyebrow">Analytics</p>
                  <h2>Monthly visitors</h2>
                </div>
                <strong>Last 6 months</strong>
              </header>
              <div class="visitor-chart">
                <div v-for="month in monthlyVisitors" :key="month.month" class="visitor-bar">
                  <span
                    :style="{ height: barWidth(month.visitors, maxVisitors) }"
                    :aria-label="`${month.month}: ${month.visitors} visitors`"
                  ></span>
                  <small>{{ month.month }}</small>
                </div>
              </div>
            </article>

            <article class="dashboard-panel quick-actions-panel">
              <header>
                <div>
                  <p class="eyebrow">Quick actions</p>
                  <h2>Create and manage</h2>
                </div>
              </header>
              <div class="quick-action-list">
                <RouterLink
                  v-for="action in quickActions"
                  :key="action.label"
                  class="quick-action"
                  :class="`action-${action.tone}`"
                  :to="action.to"
                >
                  <span aria-hidden="true"></span>
                  <div>
                    <strong>{{ action.label }}</strong>
                    <small>{{ action.detail }}</small>
                  </div>
                </RouterLink>
              </div>
            </article>

            <article class="dashboard-panel publish-panel">
              <header>
                <div>
                  <p class="eyebrow">Publishing</p>
                  <h2>Saved content</h2>
                </div>
                <strong>{{ formatDate(latestUpdate) }}</strong>
              </header>
              <div
                class="publish-chart"
                :style="{ '--saved': `${percent(savedCount, pageCount)}%` }"
              >
                <strong>{{ pageCount ? percent(savedCount, pageCount) : 0 }}%</strong>
                <span>Saved</span>
              </div>
            </article>
          </section>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-blue: var(--admin-theme-teal);
  --admin-pink: var(--admin-theme-danger);
  --admin-violet: var(--admin-theme-teal);
  --admin-gold: var(--admin-theme-gold);
  --admin-green: var(--admin-theme-primary);
  --admin-green-deep: var(--admin-theme-primary-deep);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: var(--font-family-base);
  transition: padding-left 0.25s ease;
}

:global(.admin-dark) .admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-shadow: var(--admin-theme-shadow);
  --admin-blue: var(--admin-theme-teal);
  --admin-pink: var(--admin-theme-danger);
  --admin-violet: var(--admin-theme-teal);
  --admin-gold: var(--admin-theme-gold);
  --admin-green: var(--admin-theme-primary);
  --admin-green-deep: var(--admin-theme-primary-deep);
}

.admin-layout {
  display: flex;
  flex: 1;
  background: var(--admin-bg);
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2.25rem 2.5rem;
  background: var(--admin-bg);
}

.dashboard-overview {
  display: grid;
  gap: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.5rem;
  color: var(--admin-green-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 0.45rem;
  color: var(--admin-contrast);
  font-size: 2rem;
  line-height: 1.12;
}

h2 {
  margin-bottom: 0.35rem;
  color: var(--admin-contrast);
  font-size: 1.1rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.overview-header {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.6rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  min-height: 190px;
}

.overview-copy {
  display: grid;
  align-content: start;
  gap: 0.6rem;
}

.overview-header p:not(.eyebrow) {
  max-width: 660px;
  margin-bottom: 0;
  color: var(--admin-muted);
  line-height: 1.65;
}

.overview-metrics {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.5rem;
}

.overview-metrics span {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--admin-border);
  border-radius: 999px;
  background: var(--admin-surface-soft);
  color: var(--admin-muted);
  padding: 0.42rem 0.7rem;
  font-weight: 800;
}

.overview-metrics strong {
  color: var(--admin-contrast);
}

.overview-actions {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  justify-content: flex-end;
  gap: 0.7rem;
}

.button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  padding: 0.65rem 1.1rem;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.12s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  transform: none;
}

.button-primary {
  border: 1px solid var(--admin-green);
  background: linear-gradient(180deg, var(--admin-green), var(--admin-green-deep));
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(15, 125, 56, 0.28);
}

.button-primary:hover {
  background: linear-gradient(180deg, var(--admin-green), var(--admin-green-deep));
  border-color: var(--admin-green-deep);
}

.button-secondary {
  border: 1px solid var(--admin-border-strong);
  background: var(--admin-surface);
  color: var(--admin-contrast-soft);
}

.button-secondary:hover {
  border-color: var(--admin-green);
  background: var(--admin-surface-soft);
  color: var(--admin-green-deep);
  box-shadow: 0 8px 18px rgba(16, 88, 51, 0.1);
}

/* Stats Cards */
.dashboard-cards {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 1.1rem;
}

.dashboard-card {
  min-height: 154px;
  display: grid;
  align-content: start;
  gap: 0.5rem;
  padding: 1.25rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  border-color: color-mix(in srgb, var(--card-accent) 40%, var(--admin-border));
  box-shadow: 0 20px 40px rgba(16, 88, 51, 0.12);
}

.dashboard-card::before {
  width: 44px;
  height: 4px;
  border-radius: 999px;
  background: var(--card-accent);
  content: '';
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.card-top small {
  border-radius: 999px;
  background: var(--admin-surface-soft);
  color: var(--admin-muted);
  padding: 0.18rem 0.42rem;
  font-size: 0.7rem;
  font-weight: 800;
}

.stat-icon {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 10px;
  background: color-mix(in srgb, var(--card-accent) 16%, transparent);
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--card-accent) 28%, transparent);
  position: relative;
}

.stat-icon::after {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--card-accent);
  font-size: 1.05rem;
  font-weight: 800;
  content: '●';
}

.dashboard-card span {
  color: var(--admin-muted);
  font-weight: 700;
}

.dashboard-card strong {
  color: var(--admin-contrast);
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1;
}

.dashboard-card p {
  margin: 0;
  color: var(--admin-muted);
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.55;
}

.card-blue {
  --card-accent: var(--admin-blue);
}
.card-green {
  --card-accent: var(--admin-green);
}
.card-orange,
.card-gold {
  --card-accent: var(--admin-gold);
}
.card-red,
.card-pink {
  --card-accent: var(--admin-pink);
}
.card-slate,
.card-violet {
  --card-accent: #64748b;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.9fr);
  gap: 1.1rem;
}

.dashboard-panel {
  min-height: 300px;
  padding: 1.3rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.dashboard-panel header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin: -1.3rem -1.3rem 1.3rem;
  padding: 1.1rem 1.3rem;
  border-bottom: 1px solid var(--admin-border);
  background: linear-gradient(180deg, var(--admin-surface-soft), transparent);
}

.dashboard-panel h2,
.dashboard-panel p {
  margin: 0;
}

.dashboard-panel header strong {
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: right;
}

.visitors-panel {
  min-height: 360px;
}

.visitor-chart {
  min-height: 230px;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  align-items: end;
  gap: 0.9rem;
  padding: 1rem 0.35rem 0;
}

.visitor-bar {
  height: 100%;
  display: grid;
  grid-template-rows: 1fr auto;
  justify-items: center;
  gap: 0.65rem;
}

.visitor-bar span {
  width: min(100%, 42px);
  min-height: 2rem;
  align-self: end;
  border-radius: 999px 999px 8px 8px;
  background: linear-gradient(180deg, var(--admin-green), var(--admin-green-deep));
  box-shadow: 0 14px 24px rgba(15, 125, 56, 0.22);
  transition: transform 0.15s ease;
}

.visitor-bar:hover span {
  transform: scaleY(1.02);
}

.visitor-bar small {
  color: var(--admin-muted);
  font-weight: 700;
}

.publish-panel {
  display: flex;
  flex-direction: column;
}

.publish-chart {
  width: min(210px, 70vw);
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  align-self: center;
  margin: auto 0;
  border-radius: 999px;
  background:
    radial-gradient(circle at center, var(--admin-surface) 0 53%, transparent 54%),
    conic-gradient(var(--admin-green) var(--saved), var(--admin-surface-soft) 0);
  box-shadow: inset 0 0 0 10px var(--admin-bg-deep);
}

.publish-chart strong,
.publish-chart span {
  grid-area: 1 / 1;
}

.publish-chart strong {
  transform: translateY(-0.5rem);
  color: var(--admin-green);
  font-size: 2.1rem;
  font-weight: 800;
}

.publish-chart span {
  transform: translateY(1.2rem);
  color: var(--admin-muted);
  font-weight: 700;
}

.quick-action-list {
  display: grid;
  gap: 0.85rem;
}

.quick-action {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 0.75rem;
  border: 1px solid var(--admin-border);
  border-radius: 14px;
  background: var(--admin-surface-soft);
  color: var(--admin-text);
  padding: 0.85rem;
  text-decoration: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.quick-action:hover {
  border-color: color-mix(in srgb, var(--action-color) 45%, var(--admin-border));
  box-shadow: 0 14px 26px rgba(16, 88, 51, 0.12);
  transform: translateY(-1px);
}

.quick-action > span {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: color-mix(in srgb, var(--action-color) 16%, transparent);
  box-shadow: inset 0 0 0 1.5px color-mix(in srgb, var(--action-color) 30%, transparent);
  position: relative;
}

.quick-action > span::after {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: var(--action-color);
  font-size: 1.1rem;
  font-weight: 800;
  content: '→';
}

.action-blue {
  --action-color: var(--admin-blue);
}
.action-green {
  --action-color: var(--admin-green);
}
.action-orange {
  --action-color: var(--admin-gold);
}
.action-slate {
  --action-color: #64748b;
}

.quick-action strong {
  color: var(--admin-contrast);
  font-weight: 800;
}

.quick-action small {
  display: block;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 600;
}

@media (min-width: 900px) {
  .admin-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 1100px) {
  .dashboard-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 1rem;
  }

  .overview-header {
    flex-direction: column;
    padding: 1rem;
  }

  .overview-header h1 {
    font-size: 1.6rem;
  }

  .dashboard-cards {
    grid-template-columns: 1fr;
  }

  .dashboard-panel header {
    flex-direction: column;
  }

  h1 {
    font-size: 1.75rem;
  }
}
</style>

<!-- Non-scoped dark mode override to ensure dark background applies in admin-dark mode -->
<style>
.admin-dark .admin-page {
  background: var(--admin-theme-bg, #071311) !important;
}

.admin-dark .admin-page .admin-layout {
  background: var(--admin-theme-bg, #071311) !important;
}

.admin-dark .admin-page .main {
  background: var(--admin-theme-bg, #071311) !important;
}

.admin-dark .admin-page .dashboard-card {
  background: var(--admin-theme-surface, #10241f) !important;
}

.admin-dark .admin-page .dashboard-panel {
  background: var(--admin-theme-surface, #10241f) !important;
}

.admin-dark .admin-page .overview-header {
  background: var(--admin-theme-surface, #10241f) !important;
}
</style>
