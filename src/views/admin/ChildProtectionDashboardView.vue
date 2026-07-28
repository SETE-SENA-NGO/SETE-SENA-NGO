<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImagePickerField from '@/components/admin/ImagePickerField.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()
useAdminTheme()

/* ─── Types ─────────────────────────────────────── */
interface EditableSection {
  id: string
  label: string
  heading: string
  body: string
  items: string
}

interface PageDraft {
  slug: string
  route: string
  group: string
  title: string
  eyebrow: string
  headline: string
  intro: string
  heroImageUrl: string
  primaryAction: string
  secondaryAction: string
  sections: EditableSection[]
  updatedAt: string
}

interface StatItem {
  number: string
  label: string
  description: string
}

/* ─── Default Child Protection Page ─────────────── */
function createDefaultCPPage(): PageDraft {
  return {
    slug: 'programs-child-protection',
    route: '/programs/child-protection',
    group: 'Programs',
    title: 'Child Protection',
    eyebrow: 'Child Protection',
    headline: 'Safeguarding children through local action.',
    intro: 'Cross-border migration, poverty and family separation put rural Cambodian children at risk of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to build the safety net closest to the child — before anything goes wrong.',
    heroImageUrl: '',
    primaryAction: '',
    secondaryAction: '',
    sections: [
      {
        id: 'child-protection-work',
        label: 'What we do',
        heading: 'What we do',
        body: 'Anti-trafficking campaigns, village child protection networks, peer-educator groups and family reintegration — safeguarding children through local action.',
        items: 'Anti-trafficking campaigns at borders, markets and schools\nVillage Child Protection Networks trained in identification and referral\nChild rights advocacy with commune councils and provincial authorities\nPeer-educator youth groups on safe migration, health and rights\nFamily reintegration support for children returning from unsafe labour\nSafeguarding training for every teacher, monk and volunteer',
      },
      {
        id: 'child-protection-approach',
        label: 'Approach',
        heading: 'Our approach',
        body: 'Every network is anchored by the people children already trust — mothers, monks, teachers, commune council members. We train, coach and connect them to formal referral pathways so every case reaches the provincial social affairs office the same day it is identified.',
        items: '',
      },
      {
        id: 'child-protection-team',
        label: 'Organizational Structure',
        heading: 'Who delivers child protection on the ground',
        body: 'Our dedicated team works across provinces building community safeguarding systems that keep children safe.',
        items: 'Program Director | compass | Oversees child protection programs, advocacy, and partnerships across provinces.\nField Coordinators | map | Manage child protection networks, peer education and safe migration training.\nSafeguarding Trainers | heart | Deliver training for teachers, monks and volunteers on child rights and referral.\nMonitoring & Evaluation | chart | Track case outcomes, network coverage and community impact.',
      },
      {
        id: 'child-protection-why',
        label: 'Why it matters',
        heading: 'Why it matters',
        body: 'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
        items: 'The safest village is one where every adult knows every child\'s name\nEarly identification prevents trafficking before it happens\nLocal networks respond faster than any external agency\nChildren who feel safe stay in school and out of harm',
      },
    ],
    updatedAt: '',
  }
}

const statsBand = ref<StatItem[]>([
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
])

/* ─── State ─────────────────────────────────────── */
const loading = ref(false)
const saving = ref(false)
const page = ref<PageDraft>(createDefaultCPPage())
const savedSnapshot = ref('')
const storageMode = ref<'supabase' | 'local'>('supabase')
const editing = ref(false)

function toggleEditing() {
  editing.value = !editing.value
}
const STORAGE_KEY = 'cp-dashboard-page'

/* ─── Collapsible panels ───────────────────────── */
const expandedPanels = ref<Record<string, boolean>>({
  'quick-links': true,
  'hero-header': true,
  'stats': true,
  'content': true,
})

function togglePanel(id: string) {
  expandedPanels.value[id] = !expandedPanels.value[id]
}

/* ─── Confirmation helpers ─────────────────────── */
function confirmDeleteStat(index: number) {
  const stat = statsBand.value[index]
  const label = stat?.label?.trim() || `Stat ${index + 1}`
  ui.openModal(
    'Delete statistic',
    `Permanently delete <strong>${stat?.number || ''} ${label}</strong>? This action cannot be undone.`,
    () => {
      statsBand.value.splice(index, 1)
      ui.addToast(`Statistic "${label}" deleted.`, 'success')
    },
  )
}

function loadFromLocalStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const saved = JSON.parse(raw) as Record<string, unknown>
      const defaults = createDefaultCPPage()
      page.value = {
        ...defaults,
        eyebrow: (saved.eyebrow as string) || defaults.eyebrow,
        headline: (saved.headline as string) || defaults.headline,
        intro: (saved.intro as string) || defaults.intro,
        heroImageUrl: (saved.heroImageUrl as string) || '',
        primaryAction: (saved.primaryAction as string) || '',
        secondaryAction: (saved.secondaryAction as string) || '',
        sections: saved.sections && Array.isArray(saved.sections)
          ? mergeSectionsWithDefaults(saved.sections as EditableSection[], defaults)
          : defaults.sections,
        updatedAt: (saved.updatedAt as string) || '',
      }
      if (saved.statsBand && Array.isArray(saved.statsBand) && saved.statsBand.length > 0) {
        statsBand.value = saved.statsBand as StatItem[]
      }
    }
  } catch { /* ignore */ }
}

function mergeSectionsWithDefaults(dbSections: EditableSection[], defaults: PageDraft): EditableSection[] {
  const dbMap = new Map<string, EditableSection>()
  for (const s of dbSections) dbMap.set(s.id, s)

  return defaults.sections.map(defSec => {
    const dbSec = dbMap.get(defSec.id)
    if (!dbSec) return { ...defSec }
    return {
      id: dbSec.id,
      label: dbSec.label?.trim() ? dbSec.label : defSec.label,
      heading: dbSec.heading?.trim() ? dbSec.heading : defSec.heading,
      body: dbSec.body?.trim() ? dbSec.body : defSec.body,
      items: dbSec.items?.trim() ? dbSec.items : defSec.items,
    }
  })
}

function saveToLocalStorage(): void {
  try {
    const p = page.value
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      eyebrow: p.eyebrow,
      headline: p.headline,
      intro: p.intro,
      heroImageUrl: p.heroImageUrl,
      primaryAction: p.primaryAction,
      secondaryAction: p.secondaryAction,
      sections: p.sections,
      statsBand: statsBand.value,
      updatedAt: new Date().toISOString(),
    }))
  } catch { /* ignore */ }
}

function snapshotData(): string {
  return JSON.stringify({
    eyebrow: page.value.eyebrow,
    headline: page.value.headline,
    intro: page.value.intro,
    heroImageUrl: page.value.heroImageUrl,
    primaryAction: page.value.primaryAction,
    secondaryAction: page.value.secondaryAction,
    sections: page.value.sections.map(s => ({ ...s })),
    statsBand: statsBand.value.map(s => ({ ...s })),
  })
}

const isDirty = computed(() => savedSnapshot.value !== snapshotData())

async function loadPageContent() {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, description, metadata, updated_at')
      .eq('slug', 'programs-child-protection')
      .maybeSingle()

    if (error) {
      console.warn('Supabase load failed, falling back to localStorage:', error.message)
      loadFromLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      loading.value = false
      return
    }

    if (data) {
      const defaults = createDefaultCPPage()
      const meta = data.metadata as Record<string, unknown> | null

      page.value = {
        ...defaults,
        title: data.title || defaults.title,
        eyebrow: (meta?.eyebrow as string) || defaults.eyebrow,
        headline: (meta?.headline as string) || defaults.headline,
        intro: data.summary || (meta?.intro as string) || defaults.intro,
        heroImageUrl: (meta?.heroImageUrl as string) || '',
        primaryAction: (meta?.primaryAction as string) || '',
        secondaryAction: (meta?.secondaryAction as string) || '',
        sections: meta?.sections && Array.isArray(meta.sections)
          ? mergeSectionsWithDefaults(meta.sections as EditableSection[], defaults)
          : defaults.sections,
        updatedAt: data.updated_at || '',
      }

      if (meta?.statsBand && Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
        statsBand.value = meta.statsBand as StatItem[]
      }

      storageMode.value = 'supabase'
      saveToLocalStorage()
    } else {
      loadFromLocalStorage()
      storageMode.value = 'local'
    }

    savedSnapshot.value = snapshotData()
  } catch (e: unknown) {
    console.warn('Load crashed:', e)
    loadFromLocalStorage()
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    loading.value = false
  }
}

async function savePageContent() {
  saving.value = true
  try {
    const now = new Date().toISOString()
    const p = page.value

    const payload = {
      slug: p.slug,
      title: p.title.trim() || p.headline.trim() || p.slug,
      pillar: 'Child Protection',
      summary: p.intro || '',
      description: p.intro || '',
      status: 'published',
      metadata: {
        eyebrow: p.eyebrow,
        headline: p.headline,
        intro: p.intro,
        heroImageUrl: p.heroImageUrl,
        primaryAction: p.primaryAction,
        secondaryAction: p.secondaryAction,
        sections: p.sections.map(s => ({
          id: s.id,
          label: s.label,
          heading: s.heading,
          body: s.body,
          items: s.items,
        })),
        statsBand: statsBand.value,
      },
      updated_at: now,
    }

    saveToLocalStorage()

    const { error } = await supabase
      .from('programs')
      .upsert(payload, { onConflict: 'slug' })

    if (error) {
      console.warn('Supabase save failed:', error)
      ui.addToast(`DB write blocked: ${error.message}`, 'error')
      saveToLocalStorage()
      storageMode.value = 'local'
      savedSnapshot.value = snapshotData()
      saving.value = false
      return
    }

    storageMode.value = 'supabase'
    savedSnapshot.value = snapshotData()
    ui.addToast(`${p.title} page saved!`, 'success')
  } catch (e: unknown) {
    console.error('Save crashed:', e)
    ui.addToast('Saved to browser (database error)', 'info')
    storageMode.value = 'local'
    savedSnapshot.value = snapshotData()
  } finally {
    saving.value = false
  }
}

function parsedItemsForSection(section: EditableSection): string[] {
  return section.items
    ? section.items.split('\n').map(l => l.trim()).filter(Boolean)
    : []
}

onMounted(async () => {
  await loadPageContent()
})
</script>

<template>
  <v-app :class="['cp-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="hero-glow" aria-hidden="true"></div>
          <div class="hero-accent-line" aria-hidden="true"></div>
          <div class="hero-content-wrap">
            <div class="hero-icon-wrap">
              <v-icon size="22" color="primary">mdi-shield-check</v-icon>
            </div>
            <div class="manager-title">
              <p class="eyebrow">Child Protection Program</p>
              <h1>Manage Child Protection page</h1>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs/child-protection" target="_blank" size="small">
              <v-icon start size="16">mdi-open-in-new</v-icon>
              View page
            </v-btn>
            <v-btn
              variant="tonal"
              :color="editing ? 'primary' : 'default'"
              size="small"
              @click="toggleEditing"
            >
              <v-icon start size="16">{{ editing ? 'mdi-lock-open' : 'mdi-lock' }}</v-icon>
              {{ editing ? 'Editing enabled' : 'Enable editing' }}
            </v-btn>
            <v-btn
              color="primary"
              size="small"
              :loading="saving"
              :disabled="saving || loading || !isDirty || !editing"
              @click="savePageContent"
            >
              <v-icon start size="16">mdi-content-save</v-icon>
              {{ saving ? 'Saving...' : 'Save changes' }}
            </v-btn>
          </div>
        </header>

        <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
          <v-progress-circular indeterminate color="primary" :size="36" :width="4" />
          <span class="mt-4 font-weight-bold">Loading Child Protection content...</span>
        </div>

        <div v-else class="content-grid" :class="{ 'view-mode': !editing }">
          <!-- ═══ Quick links ═══ -->
          <section class="editor-panel quick-links-panel" aria-labelledby="quick-links-heading">
            <button class="panel-header panel-header-clickable" aria-expanded="true" @click="togglePanel('quick-links')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-folder-open</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Shortcuts</p>
                  <h2 id="quick-links-heading">Related tools</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['quick-links'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['quick-links']" class="panel-body quick-links-body">
                <RouterLink class="quick-link" to="/admin/media">
                  <v-icon size="18">mdi-folder-open</v-icon>
                  <div>
                    <strong>Media Library</strong>
                    <span>Upload images for this page</span>
                  </div>
                </RouterLink>
                <RouterLink class="quick-link" to="/admin/modules/programs">
                  <v-icon size="18">mdi-layers</v-icon>
                  <div>
                    <strong>Program Records</strong>
                    <span>Manage child protection data entries</span>
                  </div>
                </RouterLink>
              </div>
            </Transition>
          </section>

          <!-- ═══ Hero & header ═══ -->
          <section class="editor-panel" aria-labelledby="hero-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['hero-header']" @click="togglePanel('hero-header')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-shield-check</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Public page</p>
                  <h2 id="hero-heading">Hero &amp; header</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['hero-header'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['hero-header']" class="image-editor-grid">
                <figure class="image-preview hero-preview">
                  <v-img v-if="page.heroImageUrl" :src="page.heroImageUrl" aspect-ratio="16/10" cover />
                  <div v-else class="slot-empty">
                    <v-icon size="22" color="disabled">mdi-image</v-icon>
                    <span>No image set</span>
                  </div>
                </figure>

                <div class="form-stack">
                  <div class="form-grid">
                    <v-text-field v-model="page.eyebrow" label="Eyebrow / badge" placeholder="e.g. Child Protection" hide-details density="comfortable" variant="outlined" />
                    <v-text-field v-model="page.headline" label="Headline (main title)" placeholder="Safeguarding children through local action." hide-details density="comfortable" variant="outlined" class="field-wide" />
                    <v-textarea v-model="page.intro" label="Intro / description" rows="3" placeholder="Cross-border migration, poverty and family separation..." hide-details density="comfortable" variant="outlined" class="field-wide" />
                  </div>

                  <ImagePickerField
                    v-model="page.heroImageUrl"
                    label="Upload or paste URL"
                    hint="Background image for the hero section"
                    hide-preview
                    @success="(msg) => ui.addToast(msg, 'success')"
                    @error="(msg) => ui.addToast(msg, 'error')"
                  />
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Stats band ═══ -->
          <section class="editor-panel" aria-labelledby="stats-heading">
            <div class="panel-header">
              <div class="panel-header-left panel-header-left-clickable" @click="togglePanel('stats')">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-chart-bar</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Stats band</p>
                  <h2 id="stats-heading">Impact statistics</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-btn v-if="editing" variant="tonal" color="accent" size="x-small" @click="statsBand.push({ number: '', label: '', description: '' })">
                  <v-icon start size="14">mdi-plus</v-icon>
                  Add stat
                </v-btn>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['stats'] }">mdi-chevron-down</v-icon>
              </div>
            </div>
            <Transition name="collapse">
              <div v-show="expandedPanels['stats']" class="panel-body">
                <p class="panel-desc">Edit the statistics shown on the public Child Protection page.</p>

                <div class="stack-list">
                  <article v-for="(stat, index) in statsBand" :key="index" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="item-number">{{ String(index + 1).padStart(2, '0') }}</span>
                      <h3>Stat {{ index + 1 }}</h3>
                      <v-btn v-if="editing" icon variant="tonal" color="error" size="x-small" aria-label="Remove stat" @click="confirmDeleteStat(index)">
                        <v-icon size="15">mdi-delete</v-icon>
                      </v-btn>
                    </header>
                    <div class="sub-editor-body form-grid">
                      <v-text-field v-model="stat.number" label="Number" placeholder="e.g. 43" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="stat.label" label="Label" placeholder="e.g. COMMUNES" hide-details density="compact" variant="outlined" />
                      <v-text-field v-model="stat.description" label="Description" placeholder="Brief description" hide-details density="compact" variant="outlined" class="field-wide" />
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>

          <!-- ═══ Page sections ═══ -->
          <section class="editor-panel" aria-labelledby="sections-heading">
            <button class="panel-header panel-header-clickable" :aria-expanded="expandedPanels['content']" @click="togglePanel('content')">
              <div class="panel-header-left">
                <div class="panel-icon-wrap">
                  <v-icon size="18">mdi-book-open-variant</v-icon>
                </div>
                <div>
                  <p class="panel-kicker">Content</p>
                  <h2 id="sections-heading">What we do, approach &amp; why it matters</h2>
                </div>
              </div>
              <div class="panel-header-actions">
                <v-icon size="15" color="disabled">mdi-pencil</v-icon>
                <v-icon size="18" class="chevron" :class="{ 'chevron-up': !expandedPanels['content'] }">mdi-chevron-down</v-icon>
              </div>
            </button>
            <Transition name="collapse">
              <div v-show="expandedPanels['content']" class="panel-body">
                <p class="panel-desc">Edit the main content blocks shown on the public Child Protection page.</p>

                <div class="stack-list">
                  <article v-for="section in page.sections" :key="section.id" class="sub-editor">
                    <header class="sub-editor-header">
                      <span class="section-badge">{{ section.label }}</span>
                      <h3>{{ section.heading || 'No heading yet' }}</h3>
                    </header>
                    <div class="sub-editor-body">
                      <v-text-field v-model="section.heading" label="Heading" :placeholder="'Heading for ' + section.label" hide-details density="compact" variant="outlined" class="field-wide" />
                      <v-textarea v-model="section.body" label="Body / description" rows="3" :placeholder="'Description for ' + section.label" hide-details density="compact" variant="outlined" class="field-wide" />
                      <v-textarea v-model="section.items" label="Bullet items (one per line)" rows="5" placeholder="Anti-trafficking campaigns&#10;Child Protection Networks&#10;Child rights advocacy" hide-details density="compact" variant="outlined" class="field-wide" />
                      <div v-if="parsedItemsForSection(section).length" class="item-chips">
                        <v-chip v-for="item in parsedItemsForSection(section)" :key="item" size="x-small" variant="tonal" color="primary">{{ item }}</v-chip>
                      </div>
                    </div>
                  </article>
                </div>
              </div>
            </Transition>
          </section>
        </div>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.cp-admin {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  min-height: 100vh;
}

.manager-main {
  min-height: 100vh;
  padding: 1.25rem;
}

.manager-hero {
  position: relative;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem 1.25rem;
  padding: 1.25rem 1.35rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: linear-gradient(135deg, var(--admin-theme-surface) 0%, color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 100%);
  box-shadow: var(--admin-theme-shadow);
  overflow: hidden;
}

.hero-glow {
  position: absolute;
  top: -60%;
  right: -10%;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--admin-theme-primary) 20%, transparent) 0%, transparent 70%);
  pointer-events: none;
}

.hero-accent-line {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--admin-theme-primary), color-mix(in srgb, var(--admin-theme-primary) 30%, transparent));
}

.hero-content-wrap {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.hero-icon-wrap {
  display: grid;
  width: 2.6rem;
  height: 2.6rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 8px;
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 12%, var(--admin-theme-surface));
}

.manager-title {
  display: grid;
  gap: 0.32rem;
  min-width: 0;
}

.manager-title .eyebrow {
  margin: 0;
}

.manager-title h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.35rem;
  line-height: 1.2;
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: 0.1rem;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0;
}

.panel-desc {
  color: var(--admin-theme-muted);
  font-size: 0.82rem;
  margin-bottom: 0.85rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.85rem;
}

.field-wide {
  grid-column: 1 / -1;
}

.quick-links-body {
  padding: 1rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.65rem;
}

.quick-link {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  padding: 0.7rem 0.85rem;
  text-decoration: none;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.quick-link:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  transform: translateY(-1px);
}

.quick-link strong {
  display: block;
  color: var(--admin-theme-contrast);
  font-size: 0.85rem;
  font-weight: 800;
}

.quick-link span {
  display: block;
  color: var(--admin-theme-muted);
  font-size: 0.74rem;
  font-weight: 600;
}

.image-editor-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.7fr) minmax(320px, 1.3fr);
  gap: 1.1rem;
  padding: 1.1rem;
}

.image-preview {
  margin: 0;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border));
  border-radius: 7px;
  background: var(--admin-theme-surface-soft);
}

.hero-preview {
  aspect-ratio: 16 / 10;
}

.slot-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  color: var(--admin-theme-muted);
  opacity: 0.7;
  font-size: 0.76rem;
  font-weight: 700;
}

.form-stack {
  display: grid;
  gap: 0.85rem;
}

.editor-panel {
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-surface-soft) 50%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
  padding: 0.85rem 1rem;
}

.panel-header h2 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1rem;
}

.panel-header-left {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  min-width: 0;
}

.panel-header-left > div {
  display: grid;
  gap: 0.15rem;
  min-width: 0;
}

.panel-icon-wrap {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: color-mix(in srgb, var(--admin-theme-primary-deep) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.panel-header-actions {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  flex-shrink: 0;
}

.panel-header-clickable {
  width: 100%;
  border: none;
  font: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
}

.panel-header-clickable:hover {
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-primary) 6%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
}

.panel-header-left-clickable {
  cursor: pointer;
  transition: opacity 0.15s ease;
}

.panel-header-left-clickable:hover {
  opacity: 0.8;
}

.panel-body {
  padding: 1rem;
}

.stack-list {
  display: grid;
  gap: 0.75rem;
}

.sub-editor {
  border: 1px solid var(--admin-theme-border);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  overflow: hidden;
  transition: border-color 0.18s ease;
}

.sub-editor:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 34%, var(--admin-theme-border-strong));
}

.sub-editor-header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: linear-gradient(180deg, color-mix(in srgb, var(--admin-theme-surface-soft) 38%, var(--admin-theme-surface)) 0%, var(--admin-theme-surface) 100%);
  padding: 0.75rem 0.85rem;
}

.sub-editor-header h3 {
  flex: 1;
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 0.94rem;
  font-weight: 900;
}

.item-number {
  display: grid;
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  place-items: center;
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-primary-deep);
  font-size: 0.74rem;
  font-weight: 900;
}

.section-badge {
  flex-shrink: 0;
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  padding: 0.2rem 0.6rem;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.sub-editor-body {
  padding: 0.9rem;
  display: grid;
  gap: 0.75rem;
}

.item-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
}

.chevron {
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.chevron-up {
  transform: rotate(-180deg);
}

/* Collapse transition */
.collapse-leave-active,
.collapse-enter-active {
  transition: opacity 0.24s ease, max-height 0.32s cubic-bezier(0.22, 1, 0.36, 1);
  overflow: hidden;
}

.collapse-enter-from,
.collapse-leave-to {
  opacity: 0;
  max-height: 0;
}

.collapse-enter-to,
.collapse-leave-from {
  opacity: 1;
  max-height: 6000px;
}

/* View mode */
.view-mode :deep(input),
.view-mode :deep(textarea),
.view-mode :deep(select) {
  pointer-events: none;
  opacity: 0.6;
  user-select: none;
  cursor: default;
}

@media (min-width: 900px) {
  .cp-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero,
  .panel-header,
  .sub-editor-header {
    align-items: stretch;
    flex-direction: column;
  }

  .hero-actions {
    width: 100%;
  }

  .form-grid,
  .image-editor-grid {
    grid-template-columns: 1fr;
  }

  .hero-content-wrap {
    flex-direction: column;
    text-align: center;
  }
}
</style>
