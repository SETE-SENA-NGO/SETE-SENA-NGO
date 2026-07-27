<template>
  <div :class="['about-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">About</p>
            <h1>Manage About Page</h1>
            <div class="manager-meta">
              <span>Core values</span>
              <span>Team</span>
              <span>Geographical reach</span>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/about" target="_blank">
              <v-icon start>mdi-open-in-new</v-icon>
              View page
            </v-btn>
            <v-btn variant="tonal" @click="resetToDefaults">
              <v-icon start>mdi-restore</v-icon>
              Reset draft
            </v-btn>
            <v-btn color="primary" variant="tonal" :disabled="saving" @click="savePage">
              <v-icon start>mdi-content-save</v-icon>
              {{ saving ? 'Saving...' : 'Save changes' }}
            </v-btn>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading About page content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          {{ loadError }}
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else>
          <div class="tab-filters">
            <button
              type="button"
              class="tab-filter-btn"
              :class="{ active: activeTab === 'values' }"
              @click="activeTab = 'values'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Core Values
            </button>
            <button
              type="button"
              class="tab-filter-btn"
              :class="{ active: activeTab === 'team' }"
              @click="activeTab = 'team'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Team
            </button>
            <button
              type="button"
              class="tab-filter-btn"
              :class="{ active: activeTab === 'reach' }"
              @click="activeTab = 'reach'"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              Reach
            </button>
          </div>

          <div class="content-grid">
            <section v-if="activeTab === 'values'" class="editor-panel" aria-labelledby="values-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Section 1</p>
                  <h2 id="values-heading">Core Values — Values That Guide The Work</h2>
                </div>
                <span v-if="savedAt" class="saved-pill">Saved</span>
              </div>

              <div class="panel-body">
                <div class="form-grid">
                  <label class="field">
                    <span>Section label</span>
                    <input v-model="draft.values.label" type="text" placeholder="e.g. Core values" />
                  </label>
                  <label class="field">
                    <span>Section heading</span>
                    <input v-model="draft.values.heading" type="text" placeholder="e.g. Values That Guide The Work" />
                  </label>
                </div>

                <label class="field field-block">
                  <span>Section description</span>
                  <textarea v-model="draft.values.body" rows="2" placeholder="Short description of the values section"></textarea>
                </label>

                <div class="sub-section-header">
                  <h3>Core Values (4 items)</h3>
                  <p class="sub-section-hint">Use <code>Title | Description</code> format.</p>
                </div>

                <div class="items-editor">
                  <div
                    v-for="(val, index) in draft.values.items"
                    :key="'value-' + index"
                    class="item-row"
                  >
                    <span class="item-index">{{ index + 1 }}</span>
                    <label class="field item-field">
                      <span>Title</span>
                      <input v-model="val.title" type="text" :placeholder="'Value ' + (index + 1) + ' title'" />
                    </label>
                    <label class="field item-field item-field-wide">
                      <span>Description</span>
                      <input v-model="val.text" type="text" :placeholder="'Value ' + (index + 1) + ' description'" />
                    </label>
                    <button
                      v-if="draft.values.items.length > 1"
                      type="button"
                      class="btn-icon danger"
                      @click="removeValueItem(index)"
                      title="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary add-item-btn" @click="addValueItem">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add core value
                </button>
              </div>
            </section>

            <section v-if="activeTab === 'team'" class="editor-panel" aria-labelledby="team-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Section 2</p>
                  <h2 id="team-heading">Team — A team of monks, managers and master practitioners.</h2>
                </div>
              </div>

              <div class="panel-body">
                <div class="form-grid">
                  <label class="field">
                    <span>Section label</span>
                    <input v-model="draft.team.label" type="text" placeholder="e.g. Team" />
                  </label>
                  <label class="field">
                    <span>Section heading</span>
                    <input v-model="draft.team.heading" type="text" placeholder="e.g. A team of monks, managers and master practitioners." />
                  </label>
                </div>

                <label class="field field-block">
                  <span>Section description</span>
                  <textarea v-model="draft.team.body" rows="2" placeholder="Short description of the team section"></textarea>
                </label>

                <div class="sub-section-header">
                  <h3>Team Members (5 items)</h3>
                  <p class="sub-section-hint">Use <code>Title | Description</code> format.</p>
                </div>

                <div class="items-editor">
                  <div
                    v-for="(member, index) in draft.team.items"
                    :key="'team-' + index"
                    class="item-row"
                  >
                    <span class="item-index">{{ index + 1 }}</span>
                    <label class="field item-field">
                      <span>Title</span>
                      <input v-model="member.title" type="text" :placeholder="'Member ' + (index + 1) + ' title'" />
                    </label>
                    <label class="field item-field item-field-wide">
                      <span>Description</span>
                      <input v-model="member.text" type="text" :placeholder="'Member ' + (index + 1) + ' description'" />
                    </label>
                    <button
                      v-if="draft.team.items.length > 1"
                      type="button"
                      class="btn-icon danger"
                      @click="removeTeamItem(index)"
                      title="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary add-item-btn" @click="addTeamItem">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add team member
                </button>
              </div>
            </section>

            <section v-if="activeTab === 'reach'" class="editor-panel" aria-labelledby="reach-heading">
              <div class="panel-header">
                <div>
                  <p class="panel-kicker">Section 3</p>
                  <h2 id="reach-heading">Geographical Reach — Three provinces. Forty-three communes. Two hundred and ninety-three villages.</h2>
                </div>
              </div>

              <div class="panel-body">
                <div class="form-grid">
                  <label class="field">
                    <span>Section label</span>
                    <input v-model="draft.reach.label" type="text" placeholder="e.g. Geographical reach" />
                  </label>
                  <label class="field">
                    <span>Section heading</span>
                    <input v-model="draft.reach.heading" type="text" placeholder="e.g. Three provinces. Forty-three communes. Two hundred and ninety-three villages." />
                  </label>
                </div>

                <label class="field field-block">
                  <span>Section description</span>
                  <textarea v-model="draft.reach.body" rows="2" placeholder="Short description of the reach section"></textarea>
                </label>

                <div class="sub-section-header">
                  <h3>Provinces (3 items)</h3>
                  <p class="sub-section-hint">One province per line.</p>
                </div>

                <div class="items-editor">
                  <div
                    v-for="(province, index) in draft.reach.items"
                    :key="'reach-' + index"
                    class="item-row"
                  >
                    <span class="item-index">{{ index + 1 }}</span>
                    <label class="field item-field item-field-wide">
                      <span>Province {{ index + 1 }}</span>
                      <input v-model="province.title" type="text" :placeholder="'Province ' + (index + 1)" />
                    </label>
                    <button
                      v-if="draft.reach.items.length > 1"
                      type="button"
                      class="btn-icon danger"
                      @click="removeReachItem(index)"
                      title="Remove item"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
                <button type="button" class="btn btn-secondary add-item-btn" @click="addReachItem">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Add province
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const PAGE_SLUG = 'about'
const contentKind = 'santi-sena-page-content'

interface ValueCard {
  title: string
  text: string
}

interface TeamCard {
  title: string
  text: string
}

interface ReachItem {
  title: string
  text: string
}

interface AboutContent {
  kind: string
  version: number
  sections: Array<{
    id: string
    label: string
    heading: string
    body: string
    items: string
  }>
}

interface DraftType {
  values: {
    label: string
    heading: string
    body: string
    items: ValueCard[]
  }
  team: {
    label: string
    heading: string
    body: string
    items: TeamCard[]
  }
  reach: {
    label: string
    heading: string
    body: string
    items: ReachItem[]
  }
}

const defaultValues: ValueCard[] = [
  { title: 'Honesty', text: 'Clear communication and transparent relationships with donors, communities, partners and staff.' },
  { title: 'Non-discrimination', text: 'Respect for people across disability, religion, background, race, community status and political belief.' },
  { title: 'Collective Benefit', text: 'Organizational resources and knowledge are used for shared benefit, not private advantage.' },
  { title: 'Flexibility', text: 'Plans adapt to community feedback, partner advice, available resources and real field needs.' },
]

const defaultTeam: TeamCard[] = [
  { title: 'Board of Directors', text: 'Policy and oversight, including senior Buddhist leadership.' },
  { title: 'Executive Director', text: 'Daily operations and strategic execution.' },
  { title: 'Management Committee', text: 'Coordinates programs across provinces.' },
  { title: 'Technical Coordination', text: 'Provides inputs across thematic areas.' },
  { title: 'Professional Staff', text: 'Full-time and project-based experts in agriculture, education and rural development.' },
]

const defaultReach: ReachItem[] = [
  { title: 'Svay Rieng', text: '' },
  { title: 'Prey Veng', text: '' },
  { title: 'Kratie', text: '' },
]

function createDefaultDraft(): DraftType {
  return {
    values: {
      label: 'Core values',
      heading: 'Values That Guide The Work',
      body: 'These values shape how Santi Sena works with communities, donors and partners.',
      items: defaultValues.map(c => ({ ...c })),
    },
    team: {
      label: 'Team',
      heading: 'A team of monks, managers and master practitioners.',
      body: 'From the Board of Directors to field staff in Kratie, every level is accountable to the villagers served and donors who trust Santi Sena.',
      items: defaultTeam.map(c => ({ ...c })),
    },
    reach: {
      label: 'Geographical reach',
      heading: 'Three provinces. Forty-three communes. Two hundred and ninety-three villages.',
      body: 'Santi Sena works across Svay Rieng, Prey Veng and Kratie.',
      items: defaultReach.map(c => ({ ...c })),
    },
  }
}

const ui = useUiStore()
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const savedAt = ref<string | null>(null)
const activeTab = ref<'values' | 'team' | 'reach'>('values')
const draft = reactive<DraftType>(createDefaultDraft())

async function loadPage() {
  loading.value = true
  loadError.value = ''
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('slug, body, locale, updated_at')
      .eq('slug', PAGE_SLUG)
      .eq('locale', 'en')
      .single()

    if (error) throw error
    if (!data?.body) throw new Error('Missing stored content.')

    const parsed = JSON.parse(data.body) as AboutContent
    const sections = parsed.sections || []

    const valuesSection = sections.find((s) => s.id === 'about-values')
    if (valuesSection) {
      if (valuesSection.label) draft.values.label = valuesSection.label
      if (valuesSection.heading) draft.values.heading = valuesSection.heading
      if (valuesSection.body) draft.values.body = valuesSection.body
      if (valuesSection.items) {
        const lines = valuesSection.items.split('\n').filter((line: string) => line.trim())
        if (lines.length) {
          draft.values.items = lines.map((line: string) => {
            const trimmed = line.trim()
            if (trimmed.includes('|')) {
              const [title, ...rest] = trimmed.split('|').map((part: string) => part.trim())
              return { title: title || trimmed, text: rest.join(' | ') }
            }
            return { title: trimmed, text: '' }
          })
        }
      }
    }

    const teamSection = sections.find((s) => s.id === 'about-team')
    if (teamSection) {
      if (teamSection.label) draft.team.label = teamSection.label
      if (teamSection.heading) draft.team.heading = teamSection.heading
      if (teamSection.body) draft.team.body = teamSection.body
      if (teamSection.items) {
        const lines = teamSection.items.split('\n').filter((line: string) => line.trim())
        if (lines.length) {
          draft.team.items = lines.map((line: string) => {
            const trimmed = line.trim()
            if (trimmed.includes('|')) {
              const [title, ...rest] = trimmed.split('|').map((part: string) => part.trim())
              return { title: title || trimmed, text: rest.join(' | ') }
            }
            return { title: trimmed, text: '' }
          })
        }
      }
    }

    const reachSection = sections.find((s) => s.id === 'about-reach')
    if (reachSection) {
      if (reachSection.label) draft.reach.label = reachSection.label
      if (reachSection.heading) draft.reach.heading = reachSection.heading
      if (reachSection.body) draft.reach.body = reachSection.body
      if (reachSection.items) {
        const lines = reachSection.items.split('\n').filter((line: string) => line.trim())
        if (lines.length) {
          draft.reach.items = lines.map((line: string) => {
            const trimmed = line.trim()
            return { title: trimmed, text: '' }
          })
        }
      }
    }

    savedAt.value = data.updated_at ? new Date(data.updated_at).toLocaleString() : null
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load About page content.'
  } finally {
    loading.value = false
  }
}

function valuesItems(): string {
  return draft.values.items
    .map((item) => `${item.title} | ${item.text}`)
    .join('\n')
}

function teamItems(): string {
  return draft.team.items
    .map((item) => `${item.title} | ${item.text}`)
    .join('\n')
}

function reachItems(): string {
  return draft.reach.items
    .map((item) => item.title)
    .join('\n')
}

function buildPageBody(): string {
  const sections = [
    {
      id: 'about-values',
      label: draft.values.label,
      heading: draft.values.heading,
      body: draft.values.body,
      items: valuesItems(),
    },
    {
      id: 'about-team',
      label: draft.team.label,
      heading: draft.team.heading,
      body: draft.team.body,
      items: teamItems(),
    },
    {
      id: 'about-reach',
      label: draft.reach.label,
      heading: draft.reach.heading,
      body: draft.reach.body,
      items: reachItems(),
    },
  ]

  return JSON.stringify({
    kind: contentKind,
    version: 1,
    sections,
  }, null, 2)
}

async function savePage() {
  saving.value = true
  try {
    const body = buildPageBody()

    const { error } = await supabase
      .from('pages')
      .upsert(
        [
          {
            slug: PAGE_SLUG,
            locale: 'en',
            title: 'About Santi Sena',
            body,
            route_path: '/about',
          },
        ],
        { onConflict: 'slug,locale' }
      )

    if (error) throw error

    savedAt.value = new Date().toLocaleString()
    ui.addToast('About page content saved.', 'success')
    await loadPage()
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save About page content.', 'error')
  } finally {
    saving.value = false
  }
}

function resetToDefaults() {
  const defaults = createDefaultDraft()
  draft.values.label = defaults.values.label
  draft.values.heading = defaults.values.heading
  draft.values.body = defaults.values.body
  draft.values.items = defaults.values.items.map((c) => ({ ...c }))
  draft.team.label = defaults.team.label
  draft.team.heading = defaults.team.heading
  draft.team.body = defaults.team.body
  draft.team.items = defaults.team.items.map((c) => ({ ...c }))
  draft.reach.label = defaults.reach.label
  draft.reach.heading = defaults.reach.heading
  draft.reach.body = defaults.reach.body
  draft.reach.items = defaults.reach.items.map((c) => ({ ...c }))
  savedAt.value = null
  ui.addToast('Default About page draft restored.', 'info')
}

function addValueItem() {
  draft.values.items.push({ title: 'New value', text: 'Describe this core value.' })
}

function removeValueItem(index: number) {
  if (draft.values.items.length > 1) {
    draft.values.items.splice(index, 1)
  }
}

function addTeamItem() {
  draft.team.items.push({ title: 'New team member', text: 'Describe this team member role.' })
}

function removeTeamItem(index: number) {
  if (draft.team.items.length > 1) {
    draft.team.items.splice(index, 1)
  }
}

function addReachItem() {
  draft.reach.items.push({ title: 'New province', text: '' })
}

function removeReachItem(index: number) {
  if (draft.reach.items.length > 1) {
    draft.reach.items.splice(index, 1)
  }
}

onMounted(() => {
  void loadPage()
})
</script>

<style scoped>
.about-admin {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-primary: var(--admin-theme-primary);
  --admin-primary-deep: var(--admin-theme-primary-deep);
  --admin-danger: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

.about-admin.sidebar-open {
  padding-left: 260px;
}

.admin-layout {
  min-height: 100vh;
}

.manager-main {
  min-height: 100vh;
  padding: 1.25rem;
  padding-top: 1.25rem;
}

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-shadow);
  padding: 1rem 1.1rem;
}

.manager-hero h1,
.manager-hero p,
.editor-panel h2,
.editor-panel p {
  margin: 0;
}

.manager-hero h1 {
  color: var(--admin-theme-contrast);
  font-size: 1.32rem;
  line-height: 1.2;
}

.manager-title {
  display: grid;
  gap: 0.32rem;
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.manager-meta span {
  border: 1px solid var(--admin-theme-border);
  border-radius: 999px;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  padding: 0.18rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.eyebrow,
.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 6px;
  padding: 0.55rem 0.8rem;
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  text-decoration: none;
  cursor: pointer;
  transition:
    background 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease,
    transform 0.18s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.55;
  transform: none;
}

.btn-primary {
  border-color: var(--admin-theme-primary-deep);
  background: linear-gradient(180deg, var(--admin-theme-primary), var(--admin-theme-primary-deep));
  color: #ffffff;
  box-shadow: 0 10px 20px color-mix(in srgb, var(--admin-theme-primary) 22%, transparent);
}

.btn-secondary,
.btn-ghost {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
}

.btn-ghost {
  background: var(--admin-theme-surface);
}

.btn-secondary:hover,
.btn-ghost:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.state-card {
  margin-top: 1rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 1rem;
}

.state-card-error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: var(--admin-theme-danger);
}

.tab-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.25rem;
  margin-bottom: 1.25rem;
}

.tab-filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 36px;
  border: 1px solid var(--admin-theme-border);
  border-radius: 7px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-muted);
  padding: 0.45rem 0.85rem;
  font: inherit;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;
  white-space: nowrap;
}

.tab-filter-btn:hover {
  border-color: color-mix(in srgb, var(--admin-theme-primary) 24%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.tab-filter-btn.active {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 14%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
}

.content-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.editor-panel {
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  border-bottom: 1px solid var(--admin-theme-border);
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 44%, var(--admin-theme-surface));
  padding: 0.85rem 1rem;
}

.panel-header h2 {
  color: var(--admin-theme-contrast);
  font-size: 1rem;
  font-weight: 800;
}

.panel-kicker {
  color: var(--admin-theme-primary-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin: 0 0 0.15rem;
}

.saved-pill {
  border: 1px solid color-mix(in srgb, var(--admin-theme-primary) 28%, transparent);
  border-radius: 999px;
  background: color-mix(in srgb, var(--admin-theme-primary) 11%, transparent);
  color: var(--admin-theme-primary-deep);
  padding: 0.22rem 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
}

.panel-body {
  padding: 1rem 1.1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.field span {
  font-size: 0.78rem;
  font-weight: 700;
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid var(--admin-theme-border-strong);
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.field-block {
  margin-top: 0.5rem;
}

.sub-section-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin: 1rem 0 0.5rem;
}

.sub-section-header h3 {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--admin-theme-contrast);
}

.sub-section-hint {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--admin-theme-muted);
}

.items-editor {
  display: grid;
  gap: 0.6rem;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.item-index {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-muted);
  font-size: 0.72rem;
  font-weight: 900;
  flex-shrink: 0;
}

.item-field {
  flex: 1;
  min-width: 0;
}

.item-field-wide {
  flex: 2;
}

.add-item-btn {
  margin-top: 0.75rem;
}

.btn-icon {
  display: inline-grid;
  min-height: 32px;
  min-width: 32px;
  place-items: center;
  border-radius: 6px;
  padding: 0;
  cursor: pointer;
  border: 1px solid transparent;
  background: transparent;
  color: var(--admin-theme-muted);
  transition: all 0.15s ease;
}

.btn-icon:hover {
  border-color: var(--admin-theme-border-strong);
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-contrast);
}

.btn-icon.danger {
  color: var(--admin-theme-danger);
}

.btn-icon.danger:hover {
  border-color: var(--admin-theme-danger);
  background: color-mix(in srgb, var(--admin-theme-danger) 12%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

:global(.admin-dark) .about-admin {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-primary: var(--admin-theme-primary);
  --admin-primary-deep: var(--admin-theme-primary-deep);
  --admin-danger: var(--admin-theme-danger);
  --admin-shadow: var(--admin-theme-shadow);
}

:global(.admin-dark) .btn-primary {
  color: #071311;
}

@media (min-width: 900px) {
  .about-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: 1rem;
  }
}
</style>
