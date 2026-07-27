<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminEditorPanel from '@/components/admin/AdminEditorPanel.vue'
import AdminSectionNav from '@/components/admin/AdminSectionNav.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useSectionEditor } from '@/composables/useSectionEditor'
import { useScrollSpyNav } from '@/composables/useScrollSpyNav'
import { useUnsavedChangesGuard } from '@/composables/useUnsavedChangesGuard'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
import { useUiStore } from '@/stores/ui.store'
import { useContentStore } from '@/stores/content.store'
import { supabase } from '@/lib/supabase'
import { explainPageSaveError, savePageByLocale, type PageLocalePayload } from '@/lib/pagePersistence'

const ui = useUiStore()
const contentStore = useContentStore()
const { locale } = useI18n()

useAdminTheme()

const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

const activeLocale = computed(() => (locale.value === 'kh' ? 'kh' : 'en'))
const publicPageUrl = computed(() => `${window.location.origin}/programs`)

/* ─── Types ─────────────────────────────────────── */
interface GoalForm {
  tag: string
  title: string
  intro: string
  whatWeDo: string
  whyItMatters: string
  quote: string
  image: string
  color: 'emerald' | 'blue' | 'amber' | 'violet'
}

/* ─── State ─────────────────────────────────────── */
const loading = ref(true)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const draftBanner = reactive({
  eyebrow: 'Our Programs',
  headline: 'Four roots. One tree of peace.',
  intro: "Santi Sena's work follows four interwoven strategic goals: environment, education, livelihoods and child protection.",
  primaryAction: 'Explore programs',
})

const goals = reactive<GoalForm[]>([
  { tag: 'GOAL 01', title: 'Environment', intro: 'Community forestry, biogas digesters, rainwater harvesting and WASH.', whatWeDo: 'Facilitate community forest agreements, install biogas systems, dig wells and support smallholder tree nurseries.', whyItMatters: 'Southeastern Cambodia is one of the most climate-vulnerable regions.', quote: 'The forest belongs to the pagoda and the pagoda belongs to the village.', image: '', color: 'emerald' },
  { tag: 'GOAL 02', title: 'Education', intro: 'Pre-schools in remote hamlets, community libraries, and youth scholarships.', whatWeDo: 'Set up village pre-schools, train local teachers, stock small libraries.', whyItMatters: 'In the districts we work in, many hamlets are more than an hour\'s walk from the nearest school.', quote: 'Our library used to be a bag of ten books under the pagoda.', image: '', color: 'blue' },
  { tag: 'GOAL 03', title: 'Livelihood', intro: 'Saving-for-Change groups, women-led cooperatives, and rural enterprises.', whatWeDo: 'Train Saving-for-Change facilitators, seed household enterprises.', whyItMatters: 'Cash predictability is what lets a family send their child to school.', quote: 'Before the savings group, I borrowed at 10% a month. Now I lend at zero.', image: '', color: 'amber' },
  { tag: 'GOAL 04', title: 'Child Protection', intro: 'Village-level Child Protection Networks, anti-trafficking outreach.', whatWeDo: 'Set up Child Protection Networks, train monks and elders as safeguarding leads.', whyItMatters: 'The border with Vietnam brings both opportunity and risk.', quote: 'The safest village is one where every adult knows every child\'s name.', image: '', color: 'violet' },
])

const priorities = reactive<string[]>([
  'Strengthened governance and accountability',
  'Staff and volunteer development',
  'Income and funding diversification',
  'Research and knowledge management',
  'Public advocacy',
])

const originalSnapshot = ref('')

const hasChanges = computed(() => {
  const current = JSON.stringify({ banner: { ...draftBanner }, goals: goals.map((g) => ({ ...g })), priorities: [...priorities] })
  return current !== originalSnapshot.value
})

function updateSnapshot() {
  originalSnapshot.value = JSON.stringify({ banner: { ...draftBanner }, goals: goals.map((g) => ({ ...g })), priorities: [...priorities] })
}

const sections = [
  { id: 'progs-banner', label: 'Banner', icon: 'mdi-creation' },
  { id: 'progs-goals', label: 'Program Goals', icon: 'mdi-folder-heart' },
  { id: 'progs-priorities', label: 'Priorities', icon: 'mdi-format-list-checks' },
] as const

const { activeSection, scrollToSection, updateActiveSectionFromScroll } = useScrollSpyNav(sections)
useUnsavedChangesGuard(hasChanges)

/* ─── Business logic ───────────────────────────── */
function addPriority() { priorities.push('') }
function removePriority(index: number) { priorities.splice(index, 1) }

async function loadPage() {
  resetEditingState()
  loading.value = true
  notice.value = null
  try {
    const localeToLoad = activeLocale.value
    const locales = localeToLoad === 'en' ? ['en'] : [localeToLoad, 'en']
    const { data, error } = await supabase.from('pages').select('body, locale, updated_at').eq('slug', 'programs').in('locale', locales)
    if (error) throw error
    const rows = (data ?? []) as { body: string; locale: string; updated_at: string | null }[]
    const row = rows.find((r) => r.locale === localeToLoad) ?? rows.find((r) => r.locale === 'en')
    if (row?.body) {
      try {
        const parsed = JSON.parse(row.body)
        if (parsed?.kind === 'santi-sena-page-content') {
          draftBanner.eyebrow = parsed.eyebrow || draftBanner.eyebrow
          draftBanner.headline = parsed.headline || draftBanner.headline
          draftBanner.intro = parsed.intro || draftBanner.intro
          draftBanner.primaryAction = parsed.primaryAction || draftBanner.primaryAction
          const goalsSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-goals')
          if (goalsSection?.items) {
            try {
              const loaded = JSON.parse(goalsSection.items)
              if (Array.isArray(loaded)) { loaded.forEach((g: Partial<GoalForm>, i: number) => { if (goals[i]) Object.assign(goals[i], g) }) }
            } catch { /* keep defaults */ }
          }
          const priSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-priorities')
          if (priSection?.items) { priorities.length = 0; priorities.push(...priSection.items.split('\n').filter((l: string) => l.trim())) }
        }
      } catch { /* keep defaults */ }
    }
    updateSnapshot()
  } catch (e: unknown) {
    console.error('loadPage error:', e)
    notice.value = { type: 'error', message: e instanceof Error ? e.message : 'Could not load page content.' }
  } finally { loading.value = false; setupSectionWatch() }
}

async function savePage() {
  saving.value = true
  notice.value = null
  try {
    const goalsItems = JSON.stringify(goals)
    const prioritiesItems = priorities.filter((l) => l.trim()).join('\n')
    const body = JSON.stringify({
      kind: 'santi-sena-page-content', version: 2, route: '/programs', group: 'Programs',
      eyebrow: draftBanner.eyebrow, headline: draftBanner.headline, intro: draftBanner.intro,
      heroImageUrl: '', primaryAction: draftBanner.primaryAction, secondaryAction: '',
      sections: [
        { id: 'programs-goals', label: 'Program goals', heading: 'Four strategic goals', body: 'Full goal cards', items: goalsItems },
        { id: 'programs-priorities', label: 'Operational priorities', heading: 'How we keep the tree alive', body: 'Internal priorities', items: prioritiesItems },
      ],
    })
    const payload: PageLocalePayload = {
      slug: 'programs', title: draftBanner.headline.trim() || 'Programs', body, route_path: '/programs',
      nav_group: 'Programs', locale: activeLocale.value, template: 'standard', status: 'published',
      hero_eyebrow: draftBanner.eyebrow.trim() || null, hero_headline: draftBanner.headline.trim() || null,
      hero_intro: draftBanner.intro.trim() || null, primary_cta_label: draftBanner.primaryAction.trim() || null,
      primary_cta_url: '/programs', secondary_cta_label: null, secondary_cta_url: null,
      seo_title: draftBanner.headline.trim() || 'Programs', seo_description: draftBanner.intro.trim() || null,
      sort_order: 4, published_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }
    const { error } = await savePageByLocale(payload, 'body')
    if (error) throw explainPageSaveError(error)
    notice.value = { type: 'success', message: `Programs page (${activeLocale.value === 'kh' ? 'Khmer' : 'English'}) saved successfully.` }
    ui.addToast('Programs page saved.', 'success')
    resetEditingState()
    updateSnapshot()
  } catch (e: unknown) {
    console.error('savePage error:', e)
    notice.value = { type: 'error', message: e instanceof Error ? e.message : 'Could not save page.' }
    ui.addToast(notice.value.message, 'error')
  } finally { saving.value = false }
}

async function viewPage() {
  try {
    await savePage()
    if (notice.value?.type !== 'error') { window.open(publicPageUrl.value, '_blank', 'noopener,noreferrer') }
  } catch (e) { console.error('View page failed:', e) }
}

const { editingSections, collapsedSections, toggleCollapse, toggleEdit, cancelEdit, setupSectionWatch, stopSectionWatch, resetEditingState } = useSectionEditor([
  { key: 'banner', getSnapshot: () => ({ ...draftBanner }), applySnapshot: (v) => { Object.assign(draftBanner, v) } },
  { key: 'goals', getSnapshot: () => goals.map((g) => ({ ...g })), applySnapshot: (v) => { goals.length = 0; v.forEach((g: GoalForm) => goals.push(g)) } },
  { key: 'priorities', getSnapshot: () => [...priorities], applySnapshot: (v) => { priorities.length = 0; priorities.push(...v) } },
])

onMounted(() => { contentStore.useLocalFallback(); void loadPage() })
onUnmounted(() => { stopSectionWatch() })
</script>

<template>
  <v-app :class="['progs-overview', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <header class="manager-hero">
          <div class="manager-title">
            <h1>Programs Overview</h1>
            <div class="manager-meta">
              <v-chip size="small" variant="tonal" color="primary">{{ activeLocale === 'kh' ? 'Khmer' : 'English' }} content</v-chip>
            </div>
          </div>
          <div class="hero-actions">
            <v-btn variant="tonal" to="/programs" target="_blank"><v-icon start>mdi-open-in-new</v-icon>View page</v-btn>
          </div>
        </header>

        <!-- Notice -->
        <v-slide-y-reverse-transition>
          <v-alert v-if="notice" :type="notice.type" variant="tonal" closable class="mt-3" @click:close="notice = null">{{ notice.message }}</v-alert>
        </v-slide-y-reverse-transition>

        <v-fade-transition mode="out-in" @after-enter="updateActiveSectionFromScroll">
          <div v-if="loading" key="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading Programs content...</span>
          </div>

          <div v-else key="content" class="content-grid">
            <AdminSectionNav :sections="sections" :active-section="activeSection" :has-changes="hasChanges" :saving="saving" save-label="Save & view page" @navigate="scrollToSection" @save="viewPage" />

            <!-- ── BANNER ── -->
            <AdminEditorPanel :id="sections[0].id" kicker="Banner" heading="Eyebrow, headline & intro" :editing="!!editingSections.banner" :collapsed="collapsedSections.banner" @toggle-edit="toggleEdit('banner')" @cancel="cancelEdit('banner')" @toggle-collapse="toggleCollapse('banner')">
              <div class="pa-4">
                <div class="form-grid">
                  <v-text-field v-model="draftBanner.eyebrow" label="Eyebrow" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="draftBanner.headline" label="Headline" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" class="field-wide" />
                  <v-textarea v-model="draftBanner.intro" label="Intro" rows="3" :disabled="!editingSections.banner" hide-details density="comfortable" variant="outlined" class="field-wide" />
                </div>
              </div>
            </AdminEditorPanel>

            <!-- ── PROGRAM GOALS ── -->
            <AdminEditorPanel :id="sections[1].id" kicker="Program Goals" heading="Four strategic goal cards" :editing="!!editingSections.goals" :collapsed="collapsedSections.goals" @toggle-edit="toggleEdit('goals')" @cancel="cancelEdit('goals')" @toggle-collapse="toggleCollapse('goals')">
              <div class="pa-4">
                <v-slide-y-transition group tag="div" class="goal-grid">
                  <v-card v-for="(goal, index) in goals" :key="index" variant="outlined" class="goal-card">
                    <v-card-title class="d-flex align-center justify-space-between pa-3 text-body-2 font-weight-bold">
                      <span>{{ goal.tag }} — {{ goal.title }}</span>
                      <v-btn v-if="editingSections.goals" icon variant="text" size="x-small" color="error" @click="goals.splice(index, 1)"><v-icon size="small">mdi-delete</v-icon></v-btn>
                    </v-card-title>
                    <v-card-text class="pa-3 pt-0">
                      <div class="form-grid">
                        <v-text-field v-model="goal.tag" label="Tag" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" />
                        <v-text-field v-model="goal.title" label="Title" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" />
                        <v-textarea v-model="goal.intro" label="Intro" rows="2" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" class="field-wide" />
                        <v-textarea v-model="goal.whatWeDo" label="What we do" rows="2" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" class="field-wide" />
                        <v-textarea v-model="goal.whyItMatters" label="Why it matters" rows="2" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" class="field-wide" />
                        <v-textarea v-model="goal.quote" label="Quote" rows="2" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" class="field-wide" />
                        <v-text-field v-model="goal.image" label="Image URL" :disabled="!editingSections.goals" hide-details density="compact" variant="outlined" class="field-wide" />
                      </div>
                    </v-card-text>
                  </v-card>
                </v-slide-y-transition>
              </div>
            </AdminEditorPanel>

            <!-- ── PRIORITIES ── -->
            <AdminEditorPanel :id="sections[2].id" kicker="Priorities" heading="Operational priorities" :editing="!!editingSections.priorities" :collapsed="collapsedSections.priorities" @toggle-edit="toggleEdit('priorities')" @cancel="cancelEdit('priorities')" @toggle-collapse="toggleCollapse('priorities')">
              <div class="pa-4">
                <div class="priority-grid">
                  <div v-for="(item, index) in priorities" :key="index" class="priority-row">
                    <v-text-field v-model="priorities[index]" label="Priority" :disabled="!editingSections.priorities" hide-details density="comfortable" variant="outlined" />
                    <v-btn v-if="editingSections.priorities" icon variant="tonal" size="small" color="error" @click="removePriority(index)"><v-icon size="small">mdi-delete</v-icon></v-btn>
                  </div>
                </div>
                <v-btn v-if="editingSections.priorities" color="accent" variant="tonal" size="small" class="mt-2" @click="addPriority"><v-icon start>mdi-plus</v-icon>Add Priority</v-btn>
              </div>
            </AdminEditorPanel>
          </div>
        </v-fade-transition>
      </main>
    </div>
    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>
</template>

<style scoped>
.progs-overview { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
.admin-layout { min-height: 100vh; }
.manager-main { min-height: 100vh; padding: 1.5rem 2rem 2.5rem; }
.manager-hero { display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; padding: 1rem 1.5rem; border: 1px solid var(--admin-theme-border); border-radius: 8px; background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow); }
.manager-hero h1 { margin: 0; color: var(--admin-theme-contrast); font-size: 1.32rem; line-height: 1.2; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-meta { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.hero-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem; }
.content-grid { display: grid; gap: 1.1rem; margin-top: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.85rem; }
.form-grid .field-wide { grid-column: 1 / -1; }
.goal-grid { display: grid; gap: 0.85rem; }
.priority-grid { display: grid; gap: 0.5rem; }
.priority-row { display: flex; align-items: center; gap: 0.5rem; }
@media (min-width: 900px) { .progs-overview.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .manager-main { padding: 1rem; padding-top: calc(60px + 1rem); }
  .manager-hero { flex-direction: column; align-items: stretch; }
  .hero-actions { width: 100%; }
}
</style>
