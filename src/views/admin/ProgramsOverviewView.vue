<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import {
  explainPageSaveError,
  savePageByLocale,
  type PageLocalePayload,
} from '@/lib/pagePersistence'

const ui = useUiStore()
const { locale } = useI18n()
const route = useRoute()

const activeLocale = computed(() => (locale.value === 'kh' ? 'kh' : 'en'))

const loading = ref(false)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// ── Image upload — reuses the same ImageUploader.vue component as the
// Donate admin page (Supabase storage via media.store.ts → upload()).
// Toggle map: which goal's uploader panel is currently open.
const imageEditorsOpen = reactive<Record<string, boolean>>({})
function toggleImageEditor(key: string) {
  imageEditorsOpen[key] = !imageEditorsOpen[key]
}

// Public route this admin page edits.
const publicPageUrl = computed(() => `${window.location.origin}/programs`)

// ── Banner text ──────────────────────────────────────────────
const form = reactive({
  eyebrow: 'Our Programs',
  headline: 'Four roots. One tree of peace.',
  intro:
    "Santi Sena's work follows four interwoven strategic goals: environment, education, livelihoods and child protection, each delivered with and by the communities themselves.",
  primaryAction: 'Explore programs',
})

// ── Goal cards — mirrors the fields ProgramView.vue renders on the
// public site: tag, title, intro, whatWeDo, whyItMatters, quote, image ──
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

const goals = reactive<GoalForm[]>([
  {
    tag: 'GOAL 01',
    title: 'Environment',
    intro:
      'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
    whatWeDo:
      'Facilitate community forest agreements, install biogas systems, dig wells and support smallholder tree nurseries.',
    whyItMatters:
      'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
    quote: 'The forest belongs to the pagoda and the pagoda belongs to the village.',
    image: '',
    color: 'emerald',
  },
  {
    tag: 'GOAL 02',
    title: 'Education',
    intro:
      'Pre-schools in remote hamlets, community libraries, and youth scholarships that keep children learning past grade six.',
    whatWeDo:
      'Set up village pre-schools, train local teachers, stock small libraries, and support scholarships for at-risk children — especially girls.',
    whyItMatters:
      "In the districts we work in, many hamlets are more than an hour's walk from the nearest school. Early learning centres change that.",
    quote: 'Our library used to be a bag of ten books under the pagoda. Now the children come every afternoon.',
    image: '',
    color: 'blue',
  },
  {
    tag: 'GOAL 03',
    title: 'Livelihood',
    intro:
      'Saving-for-Change groups, women-led cooperatives, and rural enterprises that keep families out of debt.',
    whatWeDo:
      'Train Saving-for-Change facilitators, seed household enterprises and link cooperatives to fair-price buyers.',
    whyItMatters:
      'Cash predictability is what lets a family send their child to school this term instead of to a garment factory.',
    quote: 'Before the savings group, I borrowed at 10% a month. Now I lend to my neighbours at zero.',
    image: '',
    color: 'amber',
  },
  {
    tag: 'GOAL 04',
    title: 'Child Protection',
    intro:
      'Village-level Child Protection Networks, anti-trafficking outreach, and safe-migration training for youth.',
    whatWeDo:
      'Set up Child Protection Networks, train monks and elders as safeguarding leads, and run safe-migration workshops for young people.',
    whyItMatters:
      'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
    quote: "The safest village is one where every adult knows every child's name.",
    image: '',
    color: 'violet',
  },
])

// ── Operational priorities — "How we keep the tree alive" ───
const form2 = reactive({
  priorities: [
    'Strengthened governance and accountability',
    'Staff and volunteer development',
    'Income and funding diversification',
    'Research and knowledge management',
    'Public advocacy',
  ],
})

// ── Editing state — only one box editable at a time ─────────
const bannerEditing = ref(false)
const goalsEditing = ref(false)
// Per-card editing: lets a single goal card (Goal 01, Goal 02, ...) be
// opened for editing on its own, without switching all four into edit mode.
const goalEditOpen = reactive<Record<number, boolean>>({})
function toggleGoalEdit(index: number) {
  goalEditOpen[index] = !goalEditOpen[index]
}
const anyGoalEditing = computed(() => goalsEditing.value || Object.values(goalEditOpen).some(Boolean))
const prioritiesEditing = ref(false)

function clearGoalEditOpen() {
  Object.keys(goalEditOpen).forEach((key) => {
    goalEditOpen[Number(key)] = false
  })
}

function toggleBanner() {
  bannerEditing.value = !bannerEditing.value
  goalsEditing.value = false
  prioritiesEditing.value = false
  clearGoalEditOpen()
}

function toggleGoals() {
  goalsEditing.value = !goalsEditing.value
  bannerEditing.value = false
  prioritiesEditing.value = false
  clearGoalEditOpen()
}

function togglePriorities() {
  prioritiesEditing.value = !prioritiesEditing.value
  bannerEditing.value = false
  goalsEditing.value = false
  clearGoalEditOpen()
}

function closeEditors() {
  bannerEditing.value = false
  goalsEditing.value = false
  prioritiesEditing.value = false
  clearGoalEditOpen()
}

const anyEditing = computed(() => bannerEditing.value || anyGoalEditing.value || prioritiesEditing.value)

function addPriority() {
  form2.priorities.push('')
}

function removePriority(index: number) {
  form2.priorities.splice(index, 1)
}

// ── Load from Supabase (locale-aware, falls back to English) ────
async function loadPage() {
  loading.value = true
  notice.value = null
  try {
    const localeToLoad = activeLocale.value
    const locales = localeToLoad === 'en' ? ['en'] : [localeToLoad, 'en']

    const { data, error } = await supabase
      .from('pages')
      .select('body, locale, updated_at')
      .eq('slug', 'programs')
      .in('locale', locales)

    if (error) throw error

    const rows = (data ?? []) as { body: string; locale: string; updated_at: string | null }[]
    const row = rows.find((r) => r.locale === localeToLoad) ?? rows.find((r) => r.locale === 'en')

    if (row?.body) {
      try {
        const parsed = JSON.parse(row.body)
        if (parsed?.kind === 'santi-sena-page-content') {
          form.eyebrow = parsed.eyebrow || form.eyebrow
          form.headline = parsed.headline || form.headline
          form.intro = parsed.intro || form.intro
          form.primaryAction = parsed.primaryAction || form.primaryAction

          const goalsSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-goals')
          if (goalsSection?.items) {
            try {
              const loadedGoals = JSON.parse(goalsSection.items)
              if (Array.isArray(loadedGoals)) {
                loadedGoals.forEach((g: Partial<GoalForm>, i: number) => {
                  if (goals[i]) Object.assign(goals[i], g)
                })
              }
            } catch {
              // old format or malformed — keep defaults
            }
          }

          const prioritiesSection = parsed.sections?.find((s: { id: string }) => s.id === 'programs-priorities')
          if (prioritiesSection?.items) {
            form2.priorities = prioritiesSection.items.split('\n').filter((line: string) => line.trim())
          }
        }
      } catch {
        // keep defaults
      }
    }
  } catch (e: unknown) {
    console.error('loadPage error:', e)
    notice.value = { type: 'error', message: e instanceof Error ? e.message : 'Could not load page content.' }
  } finally {
    loading.value = false
  }
}

// ── Save to Supabase (locale-aware, matches PageEditorView.vue) ──
async function savePage() {
  saving.value = true
  notice.value = null

  try {
    const goalsItems = JSON.stringify(goals)
    const prioritiesItems = form2.priorities.filter((line) => line.trim()).join('\n')

    const body = JSON.stringify({
      kind: 'santi-sena-page-content',
      version: 2,
      route: '/programs',
      group: 'Programs',
      eyebrow: form.eyebrow,
      headline: form.headline,
      intro: form.intro,
      heroImageUrl: '',
      primaryAction: form.primaryAction,
      secondaryAction: '',
      sections: [
        {
          id: 'programs-goals',
          label: 'Program goals',
          heading: 'Four strategic goals',
          body: 'Full goal cards shown on the public Programs page — title, intro, what we do, why it matters, quote, image.',
          items: goalsItems,
        },
        {
          id: 'programs-priorities',
          label: 'Operational priorities',
          heading: 'How we keep the tree alive',
          body: 'Internal priorities that support every program.',
          items: prioritiesItems,
        },
      ],
    })

    const savedAt = new Date().toISOString()
    const payload: PageLocalePayload = {
      slug: 'programs',
      title: form.headline.trim() || 'Programs',
      body,
      route_path: '/programs',
      nav_group: 'Programs',
      locale: activeLocale.value,
      template: 'standard',
      status: 'published',
      hero_eyebrow: form.eyebrow.trim() || null,
      hero_headline: form.headline.trim() || null,
      hero_intro: form.intro.trim() || null,
      primary_cta_label: form.primaryAction.trim() || null,
      primary_cta_url: '/programs',
      secondary_cta_label: null,
      secondary_cta_url: null,
      seo_title: form.headline.trim() || 'Programs',
      seo_description: form.intro.trim() || null,
      sort_order: 4,
      published_at: savedAt,
      updated_at: savedAt,
    }

    const { error } = await savePageByLocale(payload, 'body')
    if (error) throw explainPageSaveError(error)

    notice.value = {
      type: 'success',
      message: `Programs page (${activeLocale.value === 'kh' ? 'Khmer' : 'English'}) saved successfully.`,
    }
    ui.addToast('Programs page saved.', 'success')
    closeEditors()
  } catch (e: unknown) {
    console.error('savePage error:', e)
    notice.value = { type: 'error', message: e instanceof Error ? e.message : 'Could not save page.' }
    ui.addToast(notice.value.message, 'error')
  } finally {
    saving.value = false
  }
}

async function viewPage() {
  try {
    await savePage()
    if (notice.value?.type !== 'error') {
      localStorage.setItem('admin_return_path', route.path)
      window.open(publicPageUrl.value, '_blank', 'noopener,noreferrer')
    }
  } catch (e) {
    console.error('View page failed:', e)
  }
}

onMounted(() => {
  void loadPage()
})

// Reload the correct-language draft whenever the admin switches EN/KH.
watch(activeLocale, () => {
  void loadPage()
})
</script>

<template>
  <div :class="['edu-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <Transition name="notice-slide">
          <div v-if="notice" class="notice" :class="`notice-${notice.type}`" role="status">
            <div class="notice-inner">
              <svg v-if="notice.type === 'success'" class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else class="notice-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{{ notice.message }}</span>
            </div>
            <button class="notice-dismiss" type="button" @click="notice = null" aria-label="Dismiss notice">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </Transition>

        <!-- BANNER -->
        <header class="dash-banner">
          <div class="banner-inner">
            <div class="banner-content">
              <div class="banner-text" :class="{ 'banner-text-editing': bannerEditing }">
                <div v-if="!bannerEditing" class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                  <span>{{ form.eyebrow || 'Our Programs' }}</span>
                </div>
                <input v-else v-model="form.eyebrow" class="inline-input eyebrow" placeholder="Eyebrow text" />

                <h1 v-if="!bannerEditing" class="banner-title">{{ form.headline || 'Programs' }}</h1>
                <input v-else v-model="form.headline" class="inline-input headline" placeholder="Headline" />

                <p v-if="!bannerEditing" class="banner-desc">{{ form.intro || '' }}</p>
                <textarea v-else v-model="form.intro" rows="3" class="inline-textarea" placeholder="Intro text"></textarea>
              </div>

              <div class="banner-actions">
                <button v-if="!anyEditing" class="btn btn-ghost" type="button" @click="toggleBanner">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit content
                </button>
                <button v-if="bannerEditing" class="btn btn-ghost" type="button" @click="closeEditors">Cancel</button>
                <button class="btn btn-primary" type="button" :disabled="saving" @click="viewPage">
                  <svg v-if="saving" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  {{ saving ? 'Saving...' : 'Save & view page' }}
                </button>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTENT GRID -->
        <div class="content-grid">
            <!-- ══════════ BOX 1: PROGRAM GOALS ══════════ -->
            <section v-if="!bannerEditing && !prioritiesEditing" class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Initiatives</span>
                  <h2 class="card-title">Program goals</h2>
                </div>
                <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleGoals">Edit cards</button>
                <button v-if="goalsEditing" class="card-hdr-link" type="button" @click="toggleGoals">Done</button>
              </div>
              <div class="card-body">
                <!-- Each goal card now carries its own Edit/Done control, so
                     Goal 01, Goal 02, Goal 03 and Goal 04 can each be opened
                     for editing independently — the header "Edit cards"
                     button still opens all four at once if that's faster. -->
                <div class="highlights-grid">
                  <div v-for="(goal, index) in goals" :key="goal.title" class="hcard" :class="'hcard-' + goal.color">
                    <div class="hcard-top">
                      <span class="hcard-count">{{ goal.tag }}</span>
                      <button type="button" class="hcard-edit-link" @click="toggleGoalEdit(index)">
                        {{ (goalsEditing || goalEditOpen[index]) ? 'Done' : 'Edit' }}
                      </button>
                    </div>

                    <!-- compact view — mirrors the public page: image, intro, what we do,
                         why it matters, and quote all show at a glance -->
                    <div v-if="!goalsEditing && !goalEditOpen[index]" class="hcard-body">
                      <strong>{{ goal.title }}</strong>
                      <small>{{ goal.intro }}</small>

                      <div v-if="goal.whatWeDo" class="hcard-detail">
                        <span class="hcard-detail-label">What we do</span>
                        <p>{{ goal.whatWeDo }}</p>
                      </div>

                      <div v-if="goal.whyItMatters" class="hcard-detail">
                        <span class="hcard-detail-label">Why it matters</span>
                        <p>{{ goal.whyItMatters }}</p>
                      </div>

                      <blockquote v-if="goal.quote" class="hcard-quote">"{{ goal.quote }}"</blockquote>
                    </div>

                    <!-- full editable form for just this card: title, intro, what we do, why it matters, quote, image -->
                    <div v-else class="editor-fields hcard-edit-fields">
                      <label class="field">
                        <span class="field-label">Title</span>
                        <input v-model="goal.title" type="text" placeholder="Goal title" />
                      </label>

                      <label class="field">
                        <span class="field-label">Image</span>
                        <div class="image-field-row">
                          <img v-if="goal.image" :src="goal.image" alt="" class="image-field-thumb" />
                          <input v-model="goal.image" type="text" placeholder="/images/programs/example.jpg" />
                          <button type="button" class="edit-image-btn" @click="toggleImageEditor('goal-' + index)">
                            {{ imageEditorsOpen['goal-' + index] ? 'Close' : 'Upload / Edit image' }}
                          </button>
                        </div>
                        <ImageUploader
                          v-if="imageEditorsOpen['goal-' + index]"
                          :model-value="goal.image"
                          @update:model-value="(url) => (goal.image = url)"
                        />
                      </label>

                      <label class="field">
                        <span class="field-label">Intro (shown on the card)</span>
                        <textarea v-model="goal.intro" rows="2" placeholder="Short summary shown on the compact card."></textarea>
                      </label>
                      <label class="field">
                        <span class="field-label">What we do</span>
                        <textarea v-model="goal.whatWeDo" rows="2" placeholder="What the program actually does."></textarea>
                      </label>
                      <label class="field">
                        <span class="field-label">Why it matters</span>
                        <textarea v-model="goal.whyItMatters" rows="2" placeholder="Why this work matters."></textarea>
                      </label>
                      <label class="field">
                        <span class="field-label">Quote</span>
                        <textarea v-model="goal.quote" rows="2" placeholder="A quote from the community."></textarea>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <!-- ══════════ BOX 2: HOW WE KEEP THE TREE ALIVE ══════════ -->
            <section v-if="!bannerEditing && !anyGoalEditing" class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Operational priorities</span>
                  <h2 class="card-title">How we keep the tree alive</h2>
                </div>
                <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="togglePriorities">Edit list</button>
                <button v-if="prioritiesEditing" class="card-hdr-link" type="button" @click="togglePriorities">Done</button>
              </div>
              <div class="card-body">
                <!-- compact view -->
                <div v-if="!prioritiesEditing" class="priority-view-list">
                  <div v-for="(item, idx) in form2.priorities" :key="idx" class="priority-view-row">
                    <span class="priority-view-number">{{ String(idx + 1).padStart(2, '0') }}</span>
                    <span>{{ item }}</span>
                  </div>
                </div>

                <!-- edit list -->
                <div v-else class="priority-list">
                  <div v-for="(item, index) in form2.priorities" :key="index" class="priority-row">
                    <input v-model="form2.priorities[index]" type="text" placeholder="Priority text" />
                    <button type="button" class="priority-remove" @click="removePriority(index)" aria-label="Remove priority">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <button type="button" class="add-priority-btn" @click="addPriority">Add priority</button>
                </div>
              </div>
            </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.edu-dash {
  --bg: #f5f7fb;
  --surface: #ffffff;
  --border: #e8edf6;
  --border-s: #d4dcee;
  --text: #1a1a1a;
  --contrast: #1a1a1a;
  --label-accent: #1a1a1a;
  --muted: #6a7fa0;
  --blue: #2563eb;
  --blue-glow: rgba(37,99,235,0.18);
  --blue-soft: #ecf2ff;
  --emerald: #059669;
  --emerald-soft: #eafaf5;
  --amber: #d97706;
  --amber-soft: #fef8ee;
  --violet: #7c3aed;
  --violet-soft: #f3efff;
  --slate: #64748b;
  --slate-soft: #f0f3f8;
  --btn-primary-bg: #0d9656;
  --btn-primary-text: #ffffff;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 16px;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}

:global(.admin-dark .edu-dash) {
  --bg: #080c1a;
  --surface: #0d1f17;
  --border: #1c3327;
  --border-s: #274434;
  --text: #c8d2e6;
  --contrast: #eaf0f8;
  --label-accent: #10b981;
  --muted: #7a8aaa;
  --blue: #10b981;
  --blue-glow: rgba(16,185,129,0.2);
  --blue-soft: #142a22;
  --emerald: #10b981;
  --emerald-soft: #142a22;
  --amber: #f59e0b;
  --amber-soft: #241e14;
  --violet: #a78bfa;
  --violet-soft: #1c1640;
  --slate: #8896b0;
  --slate-soft: #121a2e;
  --btn-primary-bg: #10b981;
  --btn-primary-text: #ffffff;
}

.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; }

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
  cursor: pointer; text-decoration: none;
  transition: all 0.15s ease;
  border: 1px solid transparent; font-family: inherit;
}
.btn-primary { background: var(--btn-primary-bg); color: var(--btn-primary-text); border-color: transparent; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: var(--surface); color: var(--contrast); border-color: var(--border-s); }
.btn-ghost:hover { background: var(--bg); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── BANNER ─── */
.dash-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.banner-content {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
  padding: 1.25rem;
}
.banner-text { display: grid; gap: 0.4rem; max-width: 460px; flex: 1; }
.banner-text-editing { max-width: 520px; gap: 0.6rem; }
.banner-badge {
  display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--emerald); background: var(--emerald-soft);
  padding: 0.2rem 0.7rem; border-radius: 999px;
}
.banner-title {
  margin: 0; color: var(--contrast);
  font-size: clamp(1.3rem,2.6vw,1.7rem); font-weight: 800;
  letter-spacing: -0.02em; line-height: 1.15;
}
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.55; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }

/* ─── CONTENT GRID ─── */
.content-grid {
  display: grid; gap: 1.25rem; margin-top: 1.25rem;
}

/* ─── CARD ─── */
.card-section {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); overflow: hidden;
}
.card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid var(--border);
}
.card-hdr-left { display: grid; gap: 0.15rem; }
.card-badge {
  font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--emerald);
}
.card-title { margin: 0; color: var(--contrast); font-size: 0.95rem; font-weight: 800; }
.card-hdr-link {
  font-size: 0.82rem; font-weight: 700; color: var(--emerald); text-decoration: none;
  background: none; border: none; cursor: pointer;
  padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);
}
.card-hdr-link:hover { background: var(--emerald-soft); }
.card-body { padding: 1rem 1.2rem 1.2rem; }

/* ─── HIGHLIGHTS GRID (compact view of Our programs) ─── */
.highlights-grid {
  display: grid; grid-template-columns: repeat(2,1fr); gap: 0.75rem;
}
.hcard {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--surface); overflow: hidden;
}
.hcard-blue { --hc: var(--blue); }
.hcard-emerald { --hc: var(--emerald); }
.hcard-amber { --hc: var(--amber); }
.hcard-violet { --hc: var(--violet); }
.hcard-slate { --hc: var(--slate); }
.hcard-top {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid var(--border);
}
.hcard-top .hcard-count { margin-right: auto; }
.hcard-edit-link {
  font-size: 0.8rem; font-weight: 800; color: var(--emerald);
  background: none; border: none; cursor: pointer; font-family: inherit;
  padding: 0.15rem 0.45rem; border-radius: 6px; white-space: nowrap;
}
.hcard-edit-link:hover { background: var(--emerald-soft); }
.hcard-icon {
  width: 26px; height: 26px; display: grid; place-items: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--hc) 14%, var(--surface));
  color: var(--hc);
}
.hcard-count {
  font-size: 0.72rem; font-weight: 800; color: var(--muted);
  padding: 0.1rem 0.4rem; border-radius: 999px;
  background: var(--surface); border: 1px solid var(--border);
}
.hcard-body { padding: 0.5rem 0.7rem 0.7rem; display: grid; gap: 0.15rem; }
.hcard-body strong { color: #0d9656; font-size: 0.8rem; font-weight: 800; }
.hcard-body small { color: var(--muted); font-size: 0.7rem; font-weight: 600; line-height: 1.4; }

/* thumbnail shown above the title in the compact goal card */
.hcard-thumb {
  width: 100%;
  height: 110px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 0.4rem;
  border: 1px solid var(--border);
}

/* ─── expanded detail blocks inside the compact goal card
       (what we do / why it matters / quote) — mirrors the public
       Programs page content so admins can preview it at a glance ─── */
.hcard-detail {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--border);
}
.hcard-detail-label {
  display: block;
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--label-accent);
  margin-bottom: 0.15rem;
}
.hcard-detail p {
  margin: 0;
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 500;
  line-height: 1.5;
}
.hcard-quote {
  margin: 0.55rem 0 0;
  padding-left: 0.6rem;
  border-left: 2px solid var(--label-accent);
  font-size: 0.72rem;
  font-style: italic;
  color: var(--text);
  line-height: 1.5;
}

/* ─── GOAL EDIT LIST (full editable form: title, image, intro, what we do, why it matters, quote) ─── */
.goal-edit-list { display: grid; gap: 1rem; }
.goal-edit-block {
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 0.9rem 1rem 1.1rem;
}
.goal-edit-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem;
}

/* ─── PRIORITY VIEW LIST (compact, "How we keep the tree alive") ─── */
.priority-view-list { display: grid; gap: 0.5rem; }
.priority-view-row {
  display: flex; align-items: center; gap: 0.65rem;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border); border-radius: var(--radius-sm);
  font-size: 0.85rem; color: var(--text);
}
.priority-view-number {
  display: inline-flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--emerald-soft); color: var(--emerald);
  font-size: 0.68rem; font-weight: 800; flex-shrink: 0;
}

/* ─── PRIORITY EDIT LIST ─── */
.priority-list { display: grid; gap: 0.5rem; }
.priority-row { display: flex; align-items: center; gap: 0.5rem; }
.priority-row input {
  flex: 1;
  padding: 0.5rem 0.65rem;
  border: 1px solid var(--blue);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 0.86rem;
  outline: none;
}
.priority-row input:focus { box-shadow: 0 0 0 3px var(--blue-glow); }
.priority-remove {
  background: transparent; border: 1px solid var(--border);
  color: var(--muted); cursor: pointer;
  padding: 0.4rem; border-radius: var(--radius-sm);
  display: grid; place-items: center;
}
.priority-remove:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.add-priority-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem;
  padding: 0.5rem 0.7rem;
  border: 1px dashed var(--border-s); border-radius: var(--radius-sm);
  background: transparent; color: var(--blue);
  font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit;
}
.add-priority-btn:hover { background: var(--blue-soft); border-color: var(--blue); }

/* ─── RESPONSIVE ─── */
@media (min-width: 900px) { .edu-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .banner-stats { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 720px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
  .highlights-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .banner-actions { width: 100%; }
  .banner-actions .btn { flex: 1; justify-content: center; }
}

/* ─── INLINE EDITING (banner) ─── */
.inline-input {
  width: 100%;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--blue);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--contrast);
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  outline: none;
}
.inline-input:focus { box-shadow: 0 0 0 3px var(--blue-glow); }
.inline-input.eyebrow {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  width: fit-content;
  min-width: 160px;
}
.inline-input.headline {
  font-size: clamp(1.15rem, 2.4rem, 1.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
}
.inline-textarea {
  width: 100%;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--blue);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 0.86rem;
  line-height: 1.55;
  outline: none;
  resize: vertical;
}
.inline-textarea:focus { box-shadow: 0 0 0 3px var(--blue-glow); }

/* ─── SHARED FIELD STYLES (goal editor + others) ─── */
.editor-fields { display: grid; gap: 0.7rem; }
.editor-fields .field { display: grid; gap: 0.25rem; }
.editor-fields .field-label { font-size: 0.78rem; font-weight: 800; color: var(--text); }
.editor-fields .field input,
.editor-fields .field textarea {
  width: 100%;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--blue);
  border-radius: var(--radius-sm);
  background: var(--surface);
  color: var(--text);
  font-family: inherit;
  font-size: 0.86rem;
  resize: vertical;
  outline: none;
}
.editor-fields .field input:focus,
.editor-fields .field textarea:focus { box-shadow: 0 0 0 3px var(--blue-glow); }

/* ─── IMAGE FIELD ROW (matches Donate admin page) ─── */
.image-field-row { display: flex; align-items: center; gap: 0.5rem; }
.image-field-row input { flex: 1; }
.image-field-thumb {
  width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);
  border: 1px solid var(--border); flex-shrink: 0; background: var(--bg);
}
.edit-image-btn {
  flex-shrink: 0; padding: 0.5rem 0.7rem; border: 1px solid var(--border-s); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--blue); font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
.edit-image-btn:hover { background: var(--blue-soft); }
</style>