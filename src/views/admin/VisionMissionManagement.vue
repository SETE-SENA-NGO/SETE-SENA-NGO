<template>
  <div :class="['vision-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />

      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <p class="eyebrow">Vision & Mission</p>
            <h1>Manage Vision, Mission & Core Values</h1>
            <div class="manager-meta">
              <span>Vision cards</span>
              <span>Mission content</span>
              <span>Core values</span>
            </div>
          </div>
          <div class="hero-actions">
            <RouterLink class="btn btn-secondary" to="/about/vision">View page</RouterLink>
            <button type="button" class="btn btn-ghost" @click="resetToDefaults">
              Reset draft
            </button>
            <button type="button" class="btn btn-primary" :disabled="saving" @click="savePage">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </div>
        </header>

        <div v-if="loading" class="state-card">Loading Vision & Mission content...</div>
        <div v-else-if="loadError" class="state-card state-card-error">
          {{ loadError }}
          <button type="button" class="btn btn-secondary" @click="loadPage">Try again</button>
        </div>

        <div v-else class="content-grid">
          <!-- Vision Section -->
          <section class="editor-panel" aria-labelledby="vision-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Section 1</p>
                <h2 id="vision-heading">Vision — What We Strive For</h2>
              </div>
              <span v-if="savedAt" class="saved-pill">Saved</span>
            </div>

            <div class="panel-body">
              <div class="form-grid">
                <label class="field">
                  <span>Section label</span>
                  <input v-model="draft.vision.label" type="text" placeholder="e.g. Vision" />
                </label>
                <label class="field">
                  <span>Section heading</span>
                  <input v-model="draft.vision.heading" type="text" placeholder="e.g. What Santi Sena Strives For" />
                </label>
              </div>

              <label class="field field-block">
                <span>Description body</span>
                <textarea v-model="draft.vision.body" rows="2" placeholder="Short description of the vision section"></textarea>
              </label>

              <div class="sub-section-header">
                <h3>Vision Cards (3 items)</h3>
                <p class="sub-section-hint">Use <code>Title | Description</code> format for each card.</p>
              </div>

              <div class="items-editor">
                <div
                  v-for="(card, index) in draft.vision.cards"
                  :key="'vision-' + index"
                  class="item-row"
                >
                  <span class="item-index">{{ index + 1 }}</span>
                  <label class="field item-field">
                    <span>Title</span>
                    <input v-model="card.title" type="text" :placeholder="'Card ' + (index + 1) + ' title'" />
                  </label>
                  <label class="field item-field item-field-wide">
                    <span>Description</span>
                    <input v-model="card.text" type="text" :placeholder="'Card ' + (index + 1) + ' description'" />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <!-- Mission Section -->
          <section class="editor-panel" aria-labelledby="mission-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Section 2</p>
                <h2 id="mission-heading">Mission — How The Mission Becomes Practical</h2>
              </div>
            </div>

            <div class="panel-body">
              <div class="form-grid">
                <label class="field">
                  <span>Section label</span>
                  <input v-model="draft.mission.label" type="text" placeholder="e.g. Mission" />
                </label>
                <label class="field">
                  <span>Section heading</span>
                  <input v-model="draft.mission.heading" type="text" placeholder="e.g. How The Mission Becomes Practical" />
                </label>
              </div>

              <label class="field field-block">
                <span>Mission body text</span>
                <textarea v-model="draft.mission.body" rows="3" placeholder="Main mission description text"></textarea>
              </label>

              <div class="sub-section-header">
                <h3>Mission Items</h3>
                <p class="sub-section-hint">Each line is one mission item. Edit freely below.</p>
              </div>

              <div class="items-editor">
                <div
                  v-for="(item, index) in draft.mission.items"
                  :key="'mission-' + index"
                  class="item-row"
                >
                  <span class="item-index">{{ index + 1 }}</span>
                  <label class="field item-field item-field-wide">
                    <span>Item {{ index + 1 }}</span>
                    <input v-model="draft.mission.items[index]" type="text" :placeholder="'Mission item ' + (index + 1)" />
                  </label>
                  <button
                    v-if="draft.mission.items.length > 1"
                    type="button"
                    class="btn-icon danger"
                    @click="removeMissionItem(index)"
                    title="Remove item"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  </button>
                </div>
              </div>
              <button type="button" class="btn btn-secondary add-item-btn" @click="addMissionItem">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add mission item
              </button>
            </div>
          </section>

          <!-- Core Values Section -->
          <section class="editor-panel" aria-labelledby="values-heading">
            <div class="panel-header">
              <div>
                <p class="panel-kicker">Section 3</p>
                <h2 id="values-heading">Core Values — Values That Guide The Work</h2>
              </div>
            </div>

            <div class="panel-body">
              <div class="form-grid">
                <label class="field">
                  <span>Section label</span>
                  <input v-model="draft.values.label" type="text" placeholder="e.g. Core Values" />
                </label>
                <label class="field">
                  <span>Section heading</span>
                  <input v-model="draft.values.heading" type="text" placeholder="e.g. Values That Guide The Work" />
                </label>
              </div>

              <label class="field field-block">
                <span>Section description</span>
                <textarea v-model="draft.values.desc" rows="2" placeholder="Short description of values section"></textarea>
              </label>

              <div class="sub-section-header">
                <h3>Core Values (4 items)</h3>
                <p class="sub-section-hint">Use <code>Title | Description</code> format.</p>
              </div>

              <div class="items-editor">
                <div
                  v-for="(val, index) in draft.values.cards"
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
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { supabase } from '@/lib/supabase'
import { useUiStore } from '@/stores/ui.store'

const PAGE_SLUG = 'about-vision'
const contentKind = 'santi-sena-page-content'

interface VisionCard {
  title: string
  text: string
}

interface ValueCard {
  title: string
  text: string
}

interface VisionMissionContent {
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
  vision: {
    label: string
    heading: string
    body: string
    cards: VisionCard[]
  }
  mission: {
    label: string
    heading: string
    body: string
    items: string[]
  }
  values: {
    label: string
    heading: string
    desc: string
    cards: ValueCard[]
  }
}

const defaultVisionCards: VisionCard[] = [
  { title: 'Peace With Justice', text: 'A Cambodia where peace, justice and harmony are lived in daily village life, not only written in plans.' },
  { title: 'Community Ownership', text: 'Villagers, monks, local authorities, schools and community organizations lead the work together.' },
  { title: 'Sustainable Livelihoods', text: 'Families build better lives through education, child protection, rural income and care for natural resources.' },
]

const defaultMissionItems: string[] = [
  'Work with monks, villagers, local government and schools',
  'Strengthen education, savings groups and rural livelihoods',
  'Protect children from trafficking, unsafe migration and exploitation',
  'Preserve community forests, water resources and local resilience',
]

const defaultValues: ValueCard[] = [
  { title: 'Honesty', text: 'Clear communication and transparent relationships with donors, communities, partners and staff.' },
  { title: 'Non-discrimination', text: 'Respect for people across disability, religion, background, race, community status and political belief.' },
  { title: 'Collective Benefit', text: 'Organizational resources and knowledge are used for shared benefit, not private advantage.' },
  { title: 'Flexibility', text: 'Plans adapt to community feedback, partner advice, available resources and real field needs.' },
]

function createDefaultDraft(): DraftType {
  return {
    vision: {
      label: 'Vision',
      heading: 'What Santi Sena Strives For',
      body: 'Peace With Justice, Community Ownership and Sustainable Livelihoods.',
      cards: defaultVisionCards.map(c => ({ ...c })),
    },
    mission: {
      label: 'Mission',
      heading: 'How The Mission Becomes Practical',
      body: 'Santi Sena alleviates poverty through community-led development rooted in Buddhist ethics. Its work connects moral leadership with practical programs in education, livelihoods, environment and child protection.',
      items: [...defaultMissionItems],
    },
    values: {
      label: 'Core Values',
      heading: 'Values That Guide The Work',
      desc: 'These values shape how Santi Sena works with communities, donors and partners.',
      cards: defaultValues.map(v => ({ ...v })),
    },
  }
}

const ui = useUiStore()

const pageRow = ref<{ id: string; body: string; updated_at: string } | null>(null)
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const savedAt = ref('')

const draft = reactive<DraftType>(createDefaultDraft())

onMounted(() => {
  void loadPage()
})

async function loadPage() {
  loading.value = true
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('pages')
      .select('id, body, updated_at')
      .eq('slug', PAGE_SLUG)
      .maybeSingle()

    if (error) throw error

    if (data) {
      pageRow.value = data as { id: string; body: string; updated_at: string }
      applyCmsContent(data.body ?? '')
      savedAt.value = data.updated_at ?? ''
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'Could not load Vision & Mission content.'
    ui.addToast(loadError.value, 'error')
  } finally {
    loading.value = false
  }
}

function applyCmsContent(body: string) {
  if (!body.trim()) return

  try {
    const parsed = JSON.parse(body) as any
    if (parsed?.kind !== contentKind) return

    // Vision section
    const striveSection = parsed.sections?.find((s: any) => s.id === 'vision-strive')
    if (striveSection) {
      if (striveSection.label) draft.vision.label = striveSection.label
      if (striveSection.heading) draft.vision.heading = striveSection.heading
      if (striveSection.body) draft.vision.body = striveSection.body
      if (striveSection.items) {
        const lines = striveSection.items.split('\n').filter((l: string) => l.trim())
        if (lines.length > 0) {
          draft.vision.cards = lines.map((line: string) => {
            const [title, ...rest] = line.split('|').map((p: string) => p.trim())
            return { title: title || line, text: rest.join(' | ') || '' }
          })
        }
      }
    }

    // Mission section
    const missionSection = parsed.sections?.find((s: any) => s.id === 'mission-content')
    if (missionSection) {
      if (missionSection.label) draft.mission.label = missionSection.label
      if (missionSection.heading) draft.mission.heading = missionSection.heading
      if (missionSection.body) draft.mission.body = missionSection.body
      if (missionSection.items) {
        const lines = missionSection.items.split('\n').filter((l: string) => l.trim())
        if (lines.length) draft.mission.items = lines.map((l: string) => l.trim())
      }
    }

    // Values section
    const guidesSection = parsed.sections?.find((s: any) => s.id === 'vision-guides')
    if (guidesSection) {
      if (guidesSection.label) draft.values.label = guidesSection.label
      if (guidesSection.heading) draft.values.heading = guidesSection.heading
      if (guidesSection.items) {
        const lines = guidesSection.items.split('\n').filter((l: string) => l.trim())
        if (lines.length) {
          draft.values.cards = lines.map((line: string) => {
            const trimmed = line.trim()
            if (trimmed.includes('|')) {
              const [title, ...rest] = trimmed.split('|').map((p: string) => p.trim())
              return { title: title || trimmed, text: rest.join(' | ') }
            }
            const commaIdx = trimmed.indexOf(',')
            if (commaIdx > 0 && commaIdx < 30) {
              return { title: trimmed.slice(0, commaIdx).trim(), text: trimmed.slice(commaIdx + 1).trim() }
            }
            return { title: trimmed, text: '' }
          })
        }
      }
    }
  } catch {
    // keep fallback
  }
}

function buildPageBody(): string {
  const sections = [
    {
      id: 'vision-strive',
      label: draft.vision.label,
      heading: draft.vision.heading,
      body: draft.vision.body,
      items: draft.vision.cards.map(c => `${c.title} | ${c.text}`).join('\n'),
    },
    {
      id: 'vision-guides',
      label: draft.values.label,
      heading: draft.values.heading,
      body: draft.values.desc,
      items: draft.values.cards.map(v => `${v.title} | ${v.text}`).join('\n'),
    },
    {
      id: 'mission-content',
      label: draft.mission.label,
      heading: draft.mission.heading,
      body: draft.mission.body,
      items: draft.mission.items.join('\n'),
    },
  ]

  const body: VisionMissionContent = {
    kind: contentKind,
    version: 1,
    sections,
  }

  return JSON.stringify(body, null, 2)
}

async function savePage() {
  if (saving.value) return

  saving.value = true

  try {
    const body = buildPageBody()
    const now = new Date().toISOString()

    const payload = {
      slug: PAGE_SLUG,
      title: 'Vision & Mission',
      body,
      route_path: '/about/vision',
      nav_group: 'About',
      locale: 'en',
      template: 'standard',
      status: 'published',
      published_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('pages')
      .upsert(payload, { onConflict: 'slug' })
      .select('id, body, updated_at')
      .single()

    if (error) throw error

    if (data) {
      pageRow.value = data as { id: string; body: string; updated_at: string }
      savedAt.value = data.updated_at ?? now
    }
    ui.addToast('Vision & Mission content saved.', 'success')
  } catch (error) {
    ui.addToast(error instanceof Error ? error.message : 'Could not save Vision & Mission content.', 'error')
  } finally {
    saving.value = false
  }
}

function addMissionItem() {
  draft.mission.items.push('')
}

function removeMissionItem(index: number) {
  if (draft.mission.items.length <= 1) return
  draft.mission.items.splice(index, 1)
}

function resetToDefaults() {
  ui.openModal(
    'Reset Vision & Mission content?',
    'Restore default vision cards, mission content and core values?',
    () => {
      Object.assign(draft, createDefaultDraft())
      ui.addToast('Default Vision & Mission draft restored.', 'info')
    },
  )
}
</script>

<style scoped>
.vision-admin {
  min-height: 100vh;
  background: var(--admin-theme-bg);
  color: var(--admin-theme-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  min-height: 100vh;
}

.manager-main {
  min-height: 100vh;
  padding: 1.25rem;
  padding-top: calc(60px + 1.25rem);
}

.manager-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 8px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
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

.btn,
.btn-icon {
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
  transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease, transform 0.18s ease;
}

.btn:hover,
.btn-icon:hover {
  transform: translateY(-1px);
}

.btn:disabled,
.btn-icon:disabled {
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
.btn-ghost,
.btn-icon {
  border-color: color-mix(in srgb, var(--admin-theme-contrast-soft) 42%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-surface) 86%, var(--admin-theme-contrast) 14%);
  color: var(--admin-theme-contrast);
}

.btn-ghost {
  background: var(--admin-theme-surface);
}

.btn-icon {
  min-height: 32px;
  padding: 0.35rem 0.55rem;
  font-size: 0.74rem;
}

.btn-icon.danger {
  border-color: color-mix(in srgb, var(--admin-theme-danger) 64%, var(--admin-theme-border));
  background: color-mix(in srgb, var(--admin-theme-danger) 9%, var(--admin-theme-surface));
  color: var(--admin-theme-danger);
}

.btn-secondary:hover,
.btn-ghost:hover,
.btn-icon:hover {
  border-color: var(--admin-theme-primary);
  background: color-mix(in srgb, var(--admin-theme-primary) 10%, var(--admin-theme-surface));
  color: var(--admin-theme-primary-deep);
}

.btn-icon.danger:hover {
  border-color: var(--admin-theme-danger);
  background: var(--admin-theme-danger);
  color: #ffffff;
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
  padding: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.85rem;
}

.field {
  display: grid;
  gap: 0.35rem;
  color: var(--admin-theme-muted);
  font-size: 0.8rem;
  font-weight: 800;
}

.field span {
  color: var(--admin-theme-contrast-soft);
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface);
  color: var(--admin-theme-text);
  font: inherit;
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.65rem 0.75rem;
  box-sizing: border-box;
}

.field textarea {
  resize: vertical;
  line-height: 1.5;
  min-height: 60px;
}

.field input:focus,
.field textarea:focus {
  border-color: var(--admin-theme-primary);
  outline: 3px solid color-mix(in srgb, var(--admin-theme-primary) 15%, transparent);
}

.field-block {
  margin-top: 0.85rem;
}

/* Sub section header */
.sub-section-header {
  margin-top: 1.5rem;
  padding: 0.6rem 0 0.4rem;
  border-top: 1px solid var(--admin-theme-border);
}

.sub-section-header h3 {
  margin: 0 0 0.25rem;
  font-size: 0.88rem;
  font-weight: 800;
  color: var(--admin-theme-contrast);
}

.sub-section-hint {
  margin: 0;
  font-size: 0.74rem;
  color: var(--admin-theme-muted);
  font-weight: 600;
}

.sub-section-hint code {
  background: var(--admin-theme-bg);
  padding: 0.08rem 0.3rem;
  border-radius: 3px;
  font-size: 0.72rem;
}

/* Items editor */
.items-editor {
  display: grid;
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.item-row {
  display: flex;
  align-items: flex-end;
  gap: 0.65rem;
}

.item-index {
  display: grid;
  place-items: center;
  width: 1.75rem;
  height: 1.75rem;
  border: 1px solid var(--admin-theme-border-strong);
  border-radius: 6px;
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  font-size: 0.7rem;
  font-weight: 900;
  flex-shrink: 0;
  margin-bottom: 1px;
}

.item-field {
  flex: 1;
  min-width: 0;
}

.item-field-wide {
  flex: 2;
}

.add-item-btn {
  margin-top: 0.5rem;
  align-self: flex-start;
  min-height: 32px;
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
}

@media (min-width: 900px) {
  .vision-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 900px) {
  .manager-main {
    padding: 1rem;
    padding-top: calc(60px + 1rem);
  }

  .manager-hero,
  .panel-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .item-row {
    flex-wrap: wrap;
  }

  .hero-actions .btn {
    width: 100%;
  }
}
</style>

