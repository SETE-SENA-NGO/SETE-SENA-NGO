<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { useMediaStore } from '@/stores/media.store'
import { supabase } from '@/lib/supabase'
import {
  explainPageSaveError,
  savePageByLocale,
  type PageLocalePayload,
} from '@/lib/pagePersistence'

const ui = useUiStore()
const media = useMediaStore()
const { locale } = useI18n()

const activeLocale = computed(() => (locale.value === 'kh' ? 'kh' : 'en'))

const loading = ref(false)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// ── Image upload — reuses the same Google Drive upload flow as the
// Media Library page (media.store.ts → uploadToGoogleDrive → Netlify
// function /api/google-drive-upload). No separate storage bucket needed.
const uploadingIndex = ref<number | null>(null)
const dragIndex = ref<number | null>(null)
const uploadError = ref<string | null>(null)

async function uploadGoalImage(file: File, index: number) {
  if (!file.type.startsWith('image/')) {
    uploadError.value = 'Please choose an image file.'
    return
  }
  uploadingIndex.value = index
  uploadError.value = null
  try {
    const goal = goals[index]
    if (!goal) return
    const displayName = `${goal.title || 'Program goal'} image`
    const item = await media.uploadToGoogleDrive(file, displayName)
    goal.image = item.url
    notice.value = {
      type: 'success',
      message: 'Image uploaded to Google Drive. Click "Save & view page" to publish it.',
    }
  } catch (e: unknown) {
    console.error('uploadGoalImage error:', e)
    uploadError.value = e instanceof Error ? e.message : 'Image upload failed.'
  } finally {
    uploadingIndex.value = null
  }
}

function onFileInputChange(e: Event, index: number) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) uploadGoalImage(file, index)
  input.value = ''
}

function onImageDrop(e: DragEvent, index: number) {
  dragIndex.value = null
  const file = e.dataTransfer?.files?.[0]
  if (file) uploadGoalImage(file, index)
}

function onImageDragOver(index: number) {
  dragIndex.value = index
}

function onImageDragLeave(index: number) {
  if (dragIndex.value === index) dragIndex.value = null
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

const quickLinks = [
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'amber', external: false },
  { title: 'Open Live Page', desc: 'View the published Programs page', to: '', color: 'blue', external: true },
]

// ── Editing state — only one box editable at a time ─────────
const bannerEditing = ref(false)
const goalsEditing = ref(false)
const prioritiesEditing = ref(false)

function toggleBanner() {
  bannerEditing.value = !bannerEditing.value
  goalsEditing.value = false
  prioritiesEditing.value = false
}

function toggleGoals() {
  goalsEditing.value = !goalsEditing.value
  bannerEditing.value = false
  prioritiesEditing.value = false
}

function togglePriorities() {
  prioritiesEditing.value = !prioritiesEditing.value
  bannerEditing.value = false
  goalsEditing.value = false
}

function closeEditors() {
  bannerEditing.value = false
  goalsEditing.value = false
  prioritiesEditing.value = false
}

const anyEditing = computed(() => bannerEditing.value || goalsEditing.value || prioritiesEditing.value)

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
            <div class="banner-breadcrumb">
              <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-label">Modules</span>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Programs</span>
            </div>

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

            <div v-if="!anyEditing" class="banner-stats">
              <div v-for="goal in goals" :key="goal.title" class="bstat" :class="'bstat-' + goal.color">
                <div class="bstat-icon">
                  <svg v-if="goal.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                  <svg v-else-if="goal.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="goal.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ goal.title }}</strong>
                  <small>{{ goal.tag }}</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTENT GRID -->
        <div class="content-grid">
            <!-- Quick Links -->
            <section v-if="!anyEditing" class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Quick access</span>
                  <h2 class="card-title">Frequent actions</h2>
                </div>
              </div>
              <div class="card-body">
                <div class="links-grid">
                  <template v-for="link in quickLinks" :key="link.title">
                    <a v-if="link.external" :href="publicPageUrl" target="_blank" rel="noopener noreferrer" class="link-card" :class="'link-' + link.color">
                      <span class="link-icon">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </span>
                      <div class="link-text">
                        <strong>{{ link.title }}</strong>
                        <small>{{ link.desc }}</small>
                      </div>
                      <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </a>
                    <RouterLink v-else :to="link.to" class="link-card" :class="'link-' + link.color">
                      <span class="link-icon">
                        <svg v-if="link.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        <svg v-else-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                        <svg v-else-if="link.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                      </span>
                      <div class="link-text">
                        <strong>{{ link.title }}</strong>
                        <small>{{ link.desc }}</small>
                      </div>
                      <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </RouterLink>
                  </template>
                </div>
              </div>
            </section>

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
                <!-- compact view — mirrors the public page: image, intro, what we do,
                     why it matters, and quote all show at a glance -->
                <div v-if="!goalsEditing" class="highlights-grid">
                  <div v-for="goal in goals" :key="goal.title" class="hcard" :class="'hcard-' + goal.color">
                    <div class="hcard-top">
                      <span class="hcard-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                      </span>
                      <span class="hcard-count">{{ goal.tag }}</span>
                    </div>
                    <div class="hcard-body">
                      <img v-if="goal.image" :src="goal.image" class="hcard-thumb" alt="" />
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
                  </div>
                </div>

                <!-- full editable form: title, intro, what we do, why it matters, quote, image -->
                <div v-else class="goal-edit-list">
                  <div v-for="(goal, index) in goals" :key="goal.title" class="goal-edit-block" :class="'hcard-' + goal.color">
                    <div class="goal-edit-hdr">
                      <span class="hcard-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                      </span>
                      <span class="hcard-count">{{ goal.tag }}</span>
                    </div>

                    <div class="editor-fields">
                      <label class="field">
                        <span class="field-label">Title</span>
                        <input v-model="goal.title" type="text" placeholder="Goal title" />
                      </label>

                      <label class="field">
                        <span class="field-label">Image</span>
                        <div
                          class="image-upload-box"
                          :class="{ 'has-image': goal.image, 'is-dragging': dragIndex === index }"
                          @dragover.prevent="onImageDragOver(index)"
                          @dragleave.prevent="onImageDragLeave(index)"
                          @drop.prevent="onImageDrop($event, index)"
                        >
                          <img v-if="goal.image" :src="goal.image" class="image-upload-preview" alt="" />

                          <div class="image-upload-inner">
                            <svg v-if="!goal.image" class="image-upload-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <strong>{{ goal.image ? 'Replace Image' : 'Edit Image' }}</strong>
                            <small>{{ uploadingIndex === index ? 'Uploading…' : 'Choose a file or drag & drop' }}</small>

                            <input
                              :id="'goal-image-input-' + index"
                              type="file"
                              accept="image/*"
                              class="image-upload-input"
                              :disabled="uploadingIndex === index"
                              @change="onFileInputChange($event, index)"
                            />
                            <label :for="'goal-image-input-' + index" class="image-upload-btn" :class="{ disabled: uploadingIndex === index }">
                              <svg v-if="uploadingIndex !== index" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/><path d="M5 21h14"/></svg>
                              <svg v-else class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
                              {{ uploadingIndex === index ? 'Uploading' : 'Upload' }}
                            </label>
                          </div>
                        </div>
                        <p v-if="uploadError && uploadingIndex === null" class="image-upload-error">{{ uploadError }}</p>
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
            <section v-if="!bannerEditing && !goalsEditing" class="card-section">
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
  --text: #1e2a4a;
  --contrast: #0a142d;
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
  --btn-primary-bg: #0a142d;
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

/* ── FIX: entire selector must be inside :global() together,
   otherwise Vue's scoped-CSS compiler appends the component's
   data-v-xxxx attribute to ".admin-dark" too, and since that
   class lives on <html> (which never gets the attribute) the
   rule can never match. Wrapping both sides in one :global()
   call keeps the whole selector unscoped, exactly like the
   Education page does.

   GREEN ACCENT: --blue / --blue-soft / --blue-glow are set to
   green here (not blue) so every element that uses the blue
   accent — badges, breadcrumb link, "Quick access"/"Initiatives"
   labels, "Edit cards" link, icons — turns green in dark mode,
   matching the Education dashboard. Light mode keeps its
   original blue further up in this file. ── */
:global(.admin-dark .edu-dash) {
  --bg: #080c1a;
  --surface: #0d1f17;
  --border: #1c3327;
  --border-s: #274434;
  --text: #c8d2e6;
  --contrast: #eaf0f8;
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

/* ─── BANNER ─── */
.dash-banner {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.banner-breadcrumb {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.76rem; font-weight: 700;
}
.bcrumb-link { color: var(--blue); text-decoration: none; }
.bcrumb-link:hover { text-decoration: underline; }
.bcrumb-sep { color: var(--muted); width: 10px; }
.bcrumb-label { color: var(--muted); }
.bcrumb-current { color: var(--contrast); }

.banner-content {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
  padding: 1.25rem;
}
.banner-text { display: grid; gap: 0.4rem; max-width: 460px; flex: 1; }
.banner-text-editing { max-width: 520px; gap: 0.6rem; }
.banner-badge {
  display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--blue); background: var(--blue-soft);
  padding: 0.2rem 0.7rem; border-radius: 999px;
}
.banner-title {
  margin: 0; color: var(--contrast);
  font-size: clamp(1.3rem,2.6vw,1.7rem); font-weight: 800;
  letter-spacing: -0.02em; line-height: 1.15;
}
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.55; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }

.banner-stats {
  display: grid; grid-template-columns: repeat(4,1fr);
  border-top: 1px solid var(--border);
}
.bstat {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.9rem 1.1rem;
  border-right: 1px solid var(--border);
}
.bstat:last-child { border-right: none; }
.bstat-icon {
  width: 36px; height: 36px; display: grid; place-items: center;
  border-radius: var(--radius-sm); flex-shrink: 0;
}
.bstat-blue .bstat-icon { background: var(--blue-soft); color: var(--blue); }
.bstat-emerald .bstat-icon { background: var(--emerald-soft); color: var(--emerald); }
.bstat-amber .bstat-icon { background: var(--amber-soft); color: var(--amber); }
.bstat-violet .bstat-icon { background: var(--violet-soft); color: var(--violet); }
.bstat-info strong { display: block; color: var(--contrast); font-size: 0.9rem; font-weight: 800; line-height: 1.2; }
.bstat-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }

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
  color: var(--blue);
}
.card-title { margin: 0; color: var(--contrast); font-size: 0.95rem; font-weight: 800; }
.card-hdr-link {
  font-size: 0.82rem; font-weight: 700; color: var(--blue); text-decoration: none;
  background: none; border: none; cursor: pointer;
  padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);
}
.card-hdr-link:hover { background: var(--blue-soft); }
.card-body { padding: 1rem 1.2rem 1.2rem; }

/* ─── LINKS GRID ─── */
.links-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.9rem; }
.link-card {
  display: flex; align-items: center; gap: 0.9rem;
  padding: 1rem 1.1rem; border-radius: var(--radius-md);
  border: 1px solid var(--border); background: var(--surface);
  text-decoration: none;
  transition: border-color 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
}
.link-card:hover {
  border-color: var(--border-s);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px -12px rgba(10,20,45,0.18);
}
.link-icon {
  width: 44px; height: 44px; display: grid; place-items: center;
  border-radius: var(--radius-md); flex-shrink: 0;
}
.link-blue .link-icon { background: var(--blue-soft); color: var(--blue); }
.link-emerald .link-icon { background: var(--emerald-soft); color: var(--emerald); }
.link-amber .link-icon { background: var(--amber-soft); color: var(--amber); }
.link-violet .link-icon { background: var(--violet-soft); color: var(--violet); }
.link-text { flex: 1; min-width: 0; }
.link-text strong { display: block; color: var(--contrast); font-size: 0.9rem; font-weight: 800; margin-bottom: 2px; }
.link-text small { display: block; color: var(--muted); font-size: 0.76rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { flex-shrink: 0; color: var(--muted); transition: transform 0.15s ease; }
.link-card:hover .link-arrow { transform: translateX(2px); color: var(--contrast); }

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
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid var(--border);
}
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
.hcard-body strong { color: var(--contrast); font-size: 0.8rem; font-weight: 800; }
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
  color: var(--hc, var(--blue));
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
  border-left: 2px solid var(--hc, var(--blue));
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

/* ─── IMAGE UPLOAD BOX (goal editor) ─── */
.image-upload-box {
  position: relative;
  border: 1.5px dashed var(--border-s);
  border-radius: var(--radius-lg);
  background: var(--slate-soft);
  padding: 1.5rem 1rem;
  display: grid;
  gap: 0.75rem;
  justify-items: center;
  text-align: center;
  transition: border-color 0.15s ease, background 0.15s ease;
}
.image-upload-box.is-dragging {
  border-color: var(--emerald);
  background: var(--emerald-soft);
}
.image-upload-box.has-image {
  padding: 0.75rem;
  justify-items: stretch;
}
.image-upload-preview {
  width: 100%;
  height: 150px;
  object-fit: cover;
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.image-upload-inner {
  display: grid;
  gap: 0.3rem;
  justify-items: center;
}
.image-upload-icon {
  width: 40px; height: 40px;
  padding: 9px;
  border-radius: var(--radius-md);
  background: var(--emerald-soft);
  color: var(--emerald);
}
.image-upload-inner strong { font-size: 0.85rem; font-weight: 800; color: var(--contrast); }
.image-upload-inner small { font-size: 0.76rem; color: var(--muted); font-weight: 600; margin-bottom: 0.15rem; }
.image-upload-input {
  position: absolute;
  width: 1px; height: 1px;
  padding: 0; margin: -1px;
  overflow: hidden; clip: rect(0,0,0,0);
  white-space: nowrap; border: 0;
}
.image-upload-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: var(--emerald);
  color: #fff;
  font-size: 0.8rem; font-weight: 700;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
.image-upload-btn:hover { opacity: 0.9; }
.image-upload-btn.disabled { opacity: 0.6; cursor: not-allowed; pointer-events: none; }
.image-upload-error {
  margin: 0.35rem 0 0;
  font-size: 0.76rem;
  font-weight: 600;
  color: #dc2626;
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
  background: var(--blue-soft); color: var(--blue);
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
  .links-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 560px) {
  .links-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
  .banner-stats { grid-template-columns: 1fr; }
  .bstat { border-right: none; border-bottom: 1px solid var(--border); }
  .bstat:last-child { border-bottom: none; }
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
</style>