<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

const ui = useUiStore()

const loading = ref(true)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const publicPageUrl = computed(() => `${window.location.origin}/get-involved/donate`)

// ── Banner text ──────────────────────────────────────────────
const form = reactive({
  eyebrow: 'Donate',
  headline: 'Support peace, livelihoods and environmental protection.',
  intro:
    'Donations strengthen community forests, education, livelihoods, WASH, Buddhist preservation and child protection.',
  primaryAction: 'Ready to support the work?',
})

// ── Support cards — mirrors the "donate-support" section items
// (stored as "stat | detail" pairs, same format PageEditorView already uses) ──
interface SupportCard {
  stat: string
  detail: string
}

const supportCards = reactive<SupportCard[]>([
  { stat: '293 villages', detail: 'Development programs reached Svay Rieng and Prey Veng communities.' },
  { stat: '571.601 ha', detail: 'Community forests supported across 18 villages and 2,372 households.' },
  { stat: '27,810 seedlings', detail: 'Tree nurseries produced seedlings for schools, communities and farms.' },
  { stat: '114 groups', detail: 'Saving for Change groups supported 4,555 families.' },
  { stat: '363 children', detail: 'Seventeen community pre-schools helped young children.' },
  { stat: '3,400 children', detail: 'Mobile library sessions promoted reading.' },
])

// ── Program areas — "donate-areas" section, one per line ──
const programAreas = reactive<string[]>([
  'Environment',
  'Education',
  'Livelihoods',
  'WASH',
  'Buddhist preservation',
  'Child protection',
])

// ── Contact — "donate-contact" section, kept as 3 lines (email, phone, address) ──
const contact = reactive({
  email: 'info@santisena.org',
  phone: '+855 (0) 12 345 678',
  address: 'Svay Rieng Province, Cambodia',
})

const quickLinks = [
  { title: 'Donation QR & Banks', desc: 'Manage bank accounts & QR codes', to: '/admin/donate', color: 'emerald', external: false },
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'amber', external: false },
  { title: 'Open Live Page', desc: 'View the published Donate page', to: '', color: 'blue', external: true },
]

// ── Editing state — only one box editable at a time ─────────
const bannerEditing = ref(false)
const cardsEditing = ref(false)
const areasEditing = ref(false)
const contactEditing = ref(false)

function toggleBanner() {
  bannerEditing.value = !bannerEditing.value
  cardsEditing.value = false
  areasEditing.value = false
  contactEditing.value = false
}
function toggleCards() {
  cardsEditing.value = !cardsEditing.value
  bannerEditing.value = false
  areasEditing.value = false
  contactEditing.value = false
}
function toggleAreas() {
  areasEditing.value = !areasEditing.value
  bannerEditing.value = false
  cardsEditing.value = false
  contactEditing.value = false
}
function toggleContact() {
  contactEditing.value = !contactEditing.value
  bannerEditing.value = false
  cardsEditing.value = false
  areasEditing.value = false
}
function closeEditors() {
  bannerEditing.value = false
  cardsEditing.value = false
  areasEditing.value = false
  contactEditing.value = false
}
const anyEditing = computed(
  () => bannerEditing.value || cardsEditing.value || areasEditing.value || contactEditing.value,
)

function addSupportCard() {
  supportCards.push({ stat: '', detail: '' })
}
function removeSupportCard(index: number) {
  supportCards.splice(index, 1)
}
function addArea() {
  programAreas.push('')
}
function removeArea(index: number) {
  programAreas.splice(index, 1)
}

// ── Load from Supabase ────────────────────────────────────────
async function loadPage() {
  loading.value = true
  notice.value = null
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body, updated_at')
      .eq('slug', 'get-involved-donate')
      .maybeSingle()

    if (error) throw error

    if (data?.body) {
      try {
        const parsed = JSON.parse(data.body)
        if (parsed?.kind === 'santi-sena-page-content') {
          form.eyebrow = parsed.eyebrow || form.eyebrow
          form.headline = parsed.headline || form.headline
          form.intro = parsed.intro || form.intro
          form.primaryAction = parsed.primaryAction || form.primaryAction

          const supportSection = parsed.sections?.find((s: { id: string }) => s.id === 'donate-support')
          if (supportSection?.items) {
            const lines: string[] = supportSection.items.split('\n').filter((l: string) => l.trim())
            const parsedCards = lines.map((line: string) => {
              const [stat, detail] = line.split('|').map((p: string) => p.trim())
              return { stat: stat || '', detail: detail || '' }
            })
            if (parsedCards.length) {
              supportCards.splice(0, supportCards.length, ...parsedCards)
            }
          }

          const areasSection = parsed.sections?.find((s: { id: string }) => s.id === 'donate-areas')
          if (areasSection?.items) {
            const lines: string[] = areasSection.items.split('\n').filter((l: string) => l.trim())
            if (lines.length) {
              programAreas.splice(0, programAreas.length, ...lines)
            }
          }

          const contactSection = parsed.sections?.find((s: { id: string }) => s.id === 'donate-contact')
          if (contactSection?.items) {
            const lines: string[] = contactSection.items.split('\n').filter((l: string) => l.trim())
            contact.email = lines[0] || contact.email
            contact.phone = lines[1] || contact.phone
            contact.address = lines[2] || contact.address
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

// ── Save to Supabase ──────────────────────────────────────────
async function savePage() {
  saving.value = true
  notice.value = null
  try {
    const supportItems = supportCards
      .filter((c) => c.stat.trim() || c.detail.trim())
      .map((c) => `${c.stat.trim()} | ${c.detail.trim()}`)
      .join('\n')

    const areaItems = programAreas.filter((a) => a.trim()).join('\n')

    const contactItems = [contact.email.trim(), contact.phone.trim(), contact.address.trim()].join('\n')

    const body = JSON.stringify({
      kind: 'santi-sena-page-content',
      version: 1,
      route: '/get-involved/donate',
      group: 'Get Involved',
      eyebrow: form.eyebrow,
      headline: form.headline,
      intro: form.intro,
      heroImageUrl: '',
      primaryAction: form.primaryAction,
      secondaryAction: '',
      sections: [
        {
          id: 'donate-support',
          label: 'Support cards',
          heading: 'What your support strengthens',
          body: 'Impact cards shown on the donate page.',
          items: supportItems,
        },
        {
          id: 'donate-areas',
          label: 'Program areas',
          heading: 'Program areas',
          body: 'Program areas donors can support.',
          items: areaItems,
        },
        {
          id: 'donate-contact',
          label: 'Contact',
          heading: 'How to contact Santi Sena',
          body: 'Donation contact details and stewardship copy.',
          items: contactItems,
        },
      ],
    })

    const payload = {
      slug: 'get-involved-donate',
      title: form.headline.trim() || 'Donate',
      body,
      route_path: '/get-involved/donate',
      nav_group: 'Get Involved',
      locale: 'en',
      template: 'standard',
      status: 'published',
      hero_eyebrow: form.eyebrow.trim() || null,
      hero_headline: form.headline.trim() || null,
      hero_intro: form.intro.trim() || null,
      primary_cta_label: form.primaryAction.trim() || null,
      primary_cta_url: '/get-involved/donate',
      secondary_cta_label: null,
      secondary_cta_url: null,
      seo_title: form.headline.trim() || 'Donate',
      seo_description: form.intro.trim() || null,
      sort_order: 20,
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('pages').upsert(payload, { onConflict: 'slug' })

    if (error) throw error

    notice.value = { type: 'success', message: 'Donate page saved successfully.' }
    ui.addToast('Donate page saved.', 'success')
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
  loadPage()
})
</script>

<template>
  <div :class="['donate-dash', { 'sidebar-open': ui.sidebarOpen }]">
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
              <span class="bcrumb-label">Get Involved</span>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Donate</span>
            </div>

            <div class="banner-content">
              <div class="banner-text" :class="{ 'banner-text-editing': bannerEditing }">
                <div v-if="!bannerEditing" class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>{{ form.eyebrow || 'Donate' }}</span>
                </div>
                <input v-else v-model="form.eyebrow" class="inline-input eyebrow" placeholder="Eyebrow text" />

                <h1 v-if="!bannerEditing" class="banner-title">{{ form.headline || 'Donate' }}</h1>
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
              <div class="bstat bstat-emerald">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ supportCards.length }}</strong>
                  <small>Support cards</small>
                </div>
              </div>
              <div class="bstat bstat-blue">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ programAreas.length }}</strong>
                  <small>Program areas</small>
                </div>
              </div>
              <div class="bstat bstat-amber">
                <div class="bstat-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ contact.phone ? '1' : '0' }}</strong>
                  <small>Contact set</small>
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
                <h2 class="card-title">Donate management</h2>
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
                      <svg v-else-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
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

          <!-- ══════════ BOX 1: SUPPORT CARDS ══════════ -->
          <section v-if="!bannerEditing && !areasEditing && !contactEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Impact stats</span>
                <h2 class="card-title">What your support strengthens</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleCards">Edit cards</button>
              <button v-if="cardsEditing" class="card-hdr-link" type="button" @click="toggleCards">Done</button>
            </div>
            <div class="card-body">
              <!-- compact view -->
              <div v-if="!cardsEditing" class="highlights-grid">
                <div v-for="(card, index) in supportCards" :key="index" class="hcard hcard-emerald">
                  <div class="hcard-body">
                    <strong>{{ card.stat }}</strong>
                    <small>{{ card.detail }}</small>
                  </div>
                </div>
              </div>

              <!-- edit list -->
              <div v-else class="goal-edit-list">
                <div v-for="(card, index) in supportCards" :key="index" class="goal-edit-block hcard-emerald">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">Card {{ index + 1 }}</span>
                    <button type="button" class="priority-remove" @click="removeSupportCard(index)" aria-label="Remove card">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="editor-fields">
                    <label class="field">
                      <span class="field-label">Stat / number</span>
                      <input v-model="card.stat" type="text" placeholder="e.g. 293 villages" />
                    </label>
                    <label class="field">
                      <span class="field-label">Description</span>
                      <textarea v-model="card.detail" rows="2" placeholder="What this stat means."></textarea>
                    </label>
                  </div>
                </div>
                <button type="button" class="add-priority-btn" @click="addSupportCard">Add support card</button>
              </div>
            </div>
          </section>

          <!-- ══════════ BOX 2: PROGRAM AREAS ══════════ -->
          <section v-if="!bannerEditing && !cardsEditing && !contactEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Donor choices</span>
                <h2 class="card-title">Program areas</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleAreas">Edit list</button>
              <button v-if="areasEditing" class="card-hdr-link" type="button" @click="toggleAreas">Done</button>
            </div>
            <div class="card-body">
              <!-- compact view -->
              <div v-if="!areasEditing" class="priority-view-list">
                <div v-for="(item, idx) in programAreas" :key="idx" class="priority-view-row">
                  <span class="priority-view-number">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span>{{ item }}</span>
                </div>
              </div>

              <!-- edit list -->
              <div v-else class="priority-list">
                <div v-for="(item, index) in programAreas" :key="index" class="priority-row">
                  <input v-model="programAreas[index]" type="text" placeholder="Area name" />
                  <button type="button" class="priority-remove" @click="removeArea(index)" aria-label="Remove area">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
                <button type="button" class="add-priority-btn" @click="addArea">Add program area</button>
              </div>
            </div>
          </section>

          <!-- ══════════ BOX 3: CONTACT ══════════ -->
          <section v-if="!bannerEditing && !cardsEditing && !areasEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Stewardship</span>
                <h2 class="card-title">How to contact Santi Sena</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleContact">Edit contact</button>
              <button v-if="contactEditing" class="card-hdr-link" type="button" @click="toggleContact">Done</button>
            </div>
            <div class="card-body">
              <!-- compact view -->
              <div v-if="!contactEditing" class="priority-view-list">
                <div class="priority-view-row">
                  <span class="priority-view-number">01</span>
                  <span>{{ contact.email }}</span>
                </div>
                <div class="priority-view-row">
                  <span class="priority-view-number">02</span>
                  <span>{{ contact.phone }}</span>
                </div>
                <div class="priority-view-row">
                  <span class="priority-view-number">03</span>
                  <span>{{ contact.address }}</span>
                </div>
              </div>

              <!-- edit fields -->
              <div v-else class="editor-fields">
                <label class="field">
                  <span class="field-label">Email</span>
                  <input v-model="contact.email" type="text" placeholder="info@santisena.org" />
                </label>
                <label class="field">
                  <span class="field-label">Phone</span>
                  <input v-model="contact.phone" type="text" placeholder="+855 (0) 12 345 678" />
                </label>
                <label class="field">
                  <span class="field-label">Address</span>
                  <input v-model="contact.address" type="text" placeholder="Svay Rieng Province, Cambodia" />
                </label>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.donate-dash {
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

:global(.admin-dark .donate-dash) {
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

/* ─── NOTICE ─── */
.notice {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-bottom: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: 12px;
  border: 1px solid;
  font-weight: 600; font-size: 0.88rem;
}
.notice-inner { display: flex; align-items: center; gap: 0.6rem; }
.notice-success { background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.25); color: var(--emerald); }
.notice-error { background: rgba(225,29,72,0.06); border-color: rgba(225,29,72,0.25); color: #be123c; }
.notice-icon { flex-shrink: 0; }
.notice-dismiss {
  display: grid; place-items: center;
  width: 26px; height: 26px;
  border: none; border-radius: 8px;
  background: transparent; color: inherit;
  cursor: pointer;
}
.notice-dismiss:hover { background: rgba(0,0,0,0.06); }
.notice-slide-enter-active, .notice-slide-leave-active { transition: all 0.22s ease; }
.notice-slide-enter-from, .notice-slide-leave-to { opacity: 0; transform: translateY(-8px); }

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

.banner-stats {
  display: grid; grid-template-columns: repeat(3,1fr);
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
.links-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 0.9rem; }
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
.link-text { flex: 1; min-width: 0; }
.link-text strong { display: block; color: var(--contrast); font-size: 0.9rem; font-weight: 800; margin-bottom: 2px; }
.link-text small { display: block; color: var(--muted); font-size: 0.76rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { flex-shrink: 0; color: var(--muted); transition: transform 0.15s ease; }
.link-card:hover .link-arrow { transform: translateX(2px); color: var(--contrast); }

/* ─── HIGHLIGHTS GRID (compact support cards) ─── */
.highlights-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem;
}
.hcard {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--surface); overflow: hidden;
}
.hcard-emerald { --hc: var(--emerald); }
.hcard-body { padding: 0.9rem 0.9rem 1rem; display: grid; gap: 0.25rem; }
.hcard-body strong { color: var(--contrast); font-size: 1.05rem; font-weight: 800; }
.hcard-body small { color: var(--muted); font-size: 0.76rem; font-weight: 600; line-height: 1.5; }

/* ─── GOAL EDIT LIST (support card editor) ─── */
.goal-edit-list { display: grid; gap: 1rem; }
.goal-edit-block {
  border: 1px solid var(--border); border-radius: var(--radius-lg);
  padding: 0.9rem 1rem 1.1rem;
}
.goal-edit-hdr {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 0.75rem;
}
.hcard-count {
  font-size: 0.72rem; font-weight: 800; color: var(--muted);
  padding: 0.1rem 0.4rem; border-radius: 999px;
  background: var(--surface); border: 1px solid var(--border);
}

/* ─── PRIORITY VIEW LIST (compact areas / contact) ─── */
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
@media (min-width: 900px) { .donate-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 900px) {
  .banner-stats { grid-template-columns: repeat(3,1fr); }
  .links-grid { grid-template-columns: repeat(2,1fr); }
  .highlights-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 560px) {
  .links-grid { grid-template-columns: 1fr; }
  .highlights-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
  .banner-stats { grid-template-columns: 1fr; }
  .bstat { border-right: none; border-bottom: 1px solid var(--border); }
  .bstat:last-child { border-bottom: none; }
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

/* ─── SHARED FIELD STYLES (support card / contact editors) ─── */
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