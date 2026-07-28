<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const ui = useUiStore()
useAdminTheme()

const loading = ref(true)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// Public route this admin page edits.
const publicPageUrl = computed(() => `${window.location.origin}/`)

// ── Data shapes — mirror what HomeView.vue renders on the public site ──
interface StatItem {
  value: string
  label: string
}

interface PillarItem {
  goal: string
  title: string
  description: string
  image: string
}

const stats = reactive<StatItem[]>([
  { value: '293', label: 'Villages Reached' },
  { value: '43', label: 'Communes Served' },
  { value: '30+', label: 'Years of Service' },
  { value: '10+', label: 'International Partners' },
])

const mission = reactive({
  eyebrow: 'Our Mission',
  title: 'Peace is planted, not declared.',
  text:
    "Santi Sena — the Peace Army — was founded by Cambodian Buddhist monks in 1994 to alleviate poverty and rebuild moral, environmental and economic life after decades of conflict. Today our 30+ staff serve 293 villages with programs that combine the wisdom of the Dharma with rigorous community-led development.",
})

const pillarsSection = reactive({
  eyebrow: 'Four Pillars',
  title: 'Strategic goals',
  linkLabel: 'Explore all programs',
})

// image is optional — leave blank to keep the built-in photo already used
// on the public site for that card.
const pillars = reactive<PillarItem[]>([
  {
    goal: 'Goal 01',
    title: 'Natural Resource & Environment',
    description:
      'Community forestry, tree nurseries, WASH and sanitation, climate adaptation and biogas — protecting the land that sustains every village.',
    image: '',
  },
  {
    goal: 'Goal 02',
    title: 'Access to Education',
    description:
      'Community pre-schools, mobile libraries, scholarships for poor children and the preservation of Buddhist education.',
    image: '',
  },
  {
    goal: 'Goal 03',
    title: 'Livelihood & Economic Improvement',
    description:
      'Integrated farming, Saving-for-Change groups, agricultural cooperatives and rural enterprises such as melaleuca oil.',
    image: '',
  },
  {
    goal: 'Goal 04',
    title: 'Child Protection',
    description:
      'Anti-trafficking campaigns, Child Protection Networks, peer educator groups and child rights advocacy.',
    image: '',
  },
])

const quote = reactive({
  text: 'When we plant a tree, we plant peace. When we teach a child, we end a war that has not yet begun.',
  attrib: 'Founding Spirit of Santi Sena',
})

const cta = reactive({
  title: 'Join the Peace Army.',
  desc: 'Donate, partner, volunteer — every act seeds another village with hope.',
  primaryLabel: 'Support Us',
  primaryLink: '/qr-donate',
  secondaryLabel: 'Partner with us',
  secondaryLink: '/about',
})

// ── Editing state — only one section editable at a time ─────────
type SectionKey = 'stats' | 'mission' | 'pillars' | 'quote' | 'cta' | null
const activeSection = ref<SectionKey>(null)
function toggleSection(key: Exclude<SectionKey, null>) {
  activeSection.value = activeSection.value === key ? null : key
}
function closeEditors() {
  activeSection.value = null
}
const anyEditing = computed(() => activeSection.value !== null)

const imageEditorsOpen = reactive<Record<string, boolean>>({})
function toggleImageEditor(key: string) {
  imageEditorsOpen[key] = !imageEditorsOpen[key]
}

// ── Load from Supabase ───────────────────────────────────────────
async function loadPage() {
  loading.value = true
  notice.value = null
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body, updated_at')
      .eq('slug', 'home')
      .maybeSingle()

    if (error) throw error

    if (data?.body) {
      try {
        const parsed = JSON.parse(data.body)
        if (parsed?.kind === 'santi-sena-home-content') {
          if (Array.isArray(parsed.stats)) {
            parsed.stats.forEach((s: Partial<StatItem>, i: number) => {
              if (stats[i]) Object.assign(stats[i], s)
            })
          }
          if (parsed.mission) Object.assign(mission, parsed.mission)
          if (parsed.pillarsSection) Object.assign(pillarsSection, parsed.pillarsSection)
          if (Array.isArray(parsed.pillars)) {
            parsed.pillars.forEach((p: Partial<PillarItem>, i: number) => {
              if (pillars[i]) Object.assign(pillars[i], p)
            })
          }
          if (parsed.quote) Object.assign(quote, parsed.quote)
          if (parsed.cta) Object.assign(cta, parsed.cta)
        }
      } catch {
        // old format or malformed — keep defaults
      }
    }
  } catch (e: unknown) {
    console.error('loadPage error:', e)
    notice.value = { type: 'error', message: e instanceof Error ? e.message : 'Could not load page content.' }
  } finally {
    loading.value = false
  }
}

// ── Save to Supabase ──────────────────────────────────────────────
async function savePage() {
  saving.value = true
  notice.value = null

  try {
    const body = JSON.stringify({
      kind: 'santi-sena-home-content',
      version: 1,
      route: '/',
      stats: stats.map((s) => ({ ...s })),
      mission: { ...mission },
      pillarsSection: { ...pillarsSection },
      pillars: pillars.map((p) => ({ ...p })),
      quote: { ...quote },
      cta: { ...cta },
    })

    const savedAt = new Date().toISOString()
    const payload = {
      slug: 'home',
      title: 'Home',
      body,
      route_path: '/',
      nav_group: 'Home',
      locale: 'en',
      template: 'standard',
      status: 'published',
      hero_eyebrow: mission.eyebrow.trim() || null,
      hero_headline: mission.title.trim() || null,
      hero_intro: mission.text.trim() || null,
      primary_cta_label: cta.primaryLabel.trim() || null,
      primary_cta_url: cta.primaryLink.trim() || '/qr-donate',
      secondary_cta_label: cta.secondaryLabel.trim() || null,
      secondary_cta_url: cta.secondaryLink.trim() || '/about',
      seo_title: 'Santi Sena — Home',
      seo_description: mission.text.trim() || null,
      sort_order: 0,
      published_at: savedAt,
      updated_at: savedAt,
    }

    const { error } = await supabase.from('pages').upsert(payload, { onConflict: 'slug' })
    if (error) throw error

    notice.value = { type: 'success', message: 'Home page saved successfully.' }
    ui.addToast('Home page saved.', 'success')
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
      // Remember this admin page so the public site's "Back to Dashboard"
      // button (in App.vue) returns here instead of the main dashboard.
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
</script>

<template>
  <v-app :class="['home-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <v-alert v-if="notice" :type="notice.type" variant="tonal" density="comfortable" closable @click:close="notice = null" class="mb-3">
          {{ notice.message }}
        </v-alert>

        <!-- BANNER -->
        <header class="dash-banner">
          <div class="banner-inner">
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <v-icon size="12">mdi-home</v-icon>
                  <span>Home</span>
                </div>
                <h1 class="banner-title">Home page</h1>
                <p class="banner-desc">
                  Edit the stats, mission statement, four pillars, quote and closing call-to-action
                  shown on the public homepage. The hero slideshow is managed separately.
                </p>
              </div>

              <div class="banner-actions">
                <v-btn v-if="anyEditing" variant="tonal" @click="closeEditors" size="small">Cancel</v-btn>
                <v-btn color="primary" variant="tonal" :loading="saving" :disabled="saving" @click="viewPage" size="small">
                  <v-icon start size="16">mdi-content-save</v-icon>
                  {{ saving ? 'Saving...' : 'Save & view page' }}
                </v-btn>
              </div>
            </div>
          </div>
        </header>

        <!-- CONTENT GRID -->
        <div class="content-grid">
          <!-- ══════════ KEY STATS ══════════ -->
          <section v-if="!anyEditing || activeSection === 'stats'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">By the numbers</span>
                <h2 class="card-title">Key stats</h2>
              </div>
              <v-btn v-if="!anyEditing" variant="tonal" size="x-small" @click="toggleSection('stats')">Edit section</v-btn>
              <v-btn v-if="activeSection === 'stats'" variant="tonal" size="x-small" @click="toggleSection('stats')">Done</v-btn>
            </div>
            <div class="card-body">
              <div v-if="activeSection !== 'stats'" class="priority-view-list">
                <div v-for="(stat, idx) in stats" :key="idx" class="priority-view-row">
                  <span class="priority-view-number">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span><strong>{{ stat.value }}</strong> — {{ stat.label }}</span>
                </div>
              </div>

              <div v-else class="goal-edit-list">
                <div v-for="(stat, index) in stats" :key="index" class="goal-edit-block">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">Stat {{ index + 1 }}</span>
                  </div>
                  <div class="editor-fields editor-fields-row">
                    <label class="field">
                      <span class="field-label">Value</span>
                      <v-text-field v-model="stat.value" label="Value" placeholder="e.g. 293" hide-details density="compact" variant="outlined" />
                    </label>
                    <label class="field">
                      <span class="field-label">Label</span>
                      <v-text-field v-model="stat.label" label="Label" placeholder="e.g. Villages Reached" hide-details density="compact" variant="outlined" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ══════════ MISSION ══════════ -->
          <section v-if="!anyEditing || activeSection === 'mission'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">{{ mission.eyebrow }}</span>
                <h2 class="card-title">{{ mission.title }}</h2>
              </div>
              <v-btn v-if="!anyEditing" variant="tonal" size="x-small" @click="toggleSection('mission')">Edit section</v-btn>
              <v-btn v-if="activeSection === 'mission'" variant="tonal" size="x-small" @click="toggleSection('mission')">Done</v-btn>
            </div>
            <div class="card-body">
              <p v-if="activeSection !== 'mission'" class="plain-text">{{ mission.text }}</p>

              <div v-else class="editor-fields">
                <v-text-field v-model="mission.eyebrow" label="Eyebrow" placeholder="e.g. Our Mission" hide-details density="compact" variant="outlined" />
                <v-text-field v-model="mission.title" label="Title" placeholder="e.g. Peace is planted, not declared." hide-details density="compact" variant="outlined" />
                <v-textarea v-model="mission.text" label="Mission text" rows="4" hide-details density="compact" variant="outlined" />
              </div>
            </div>
          </section>

          <!-- ══════════ FOUR PILLARS ══════════ -->
          <section v-if="!anyEditing || activeSection === 'pillars'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">{{ pillarsSection.eyebrow }}</span>
                <h2 class="card-title">{{ pillarsSection.title }}</h2>
              </div>
              <v-btn v-if="!anyEditing" variant="tonal" size="x-small" @click="toggleSection('pillars')">Edit section</v-btn>
              <v-btn v-if="activeSection === 'pillars'" variant="tonal" size="x-small" @click="toggleSection('pillars')">Done</v-btn>
            </div>
            <div class="card-body">
              <div v-if="activeSection !== 'pillars'" class="highlights-grid">
                <div v-for="(pillar, index) in pillars" :key="index" class="hcard">
                  <div class="hcard-body">
                    <span class="hcard-tag">{{ pillar.goal }}</span>
                    <strong>{{ pillar.title }}</strong>
                    <small>{{ pillar.description }}</small>
                  </div>
                </div>
              </div>

              <div v-else class="goal-edit-list">
                <div class="editor-fields" style="margin-bottom: 1rem;">
                  <v-text-field v-model="pillarsSection.eyebrow" label="Section eyebrow" placeholder="e.g. Four Pillars" hide-details density="compact" variant="outlined" />
                  <v-text-field v-model="pillarsSection.title" label="Section title" placeholder="e.g. Strategic goals" hide-details density="compact" variant="outlined" />
                  <v-text-field v-model="pillarsSection.linkLabel" label="Link label" placeholder="e.g. Explore all programs" hide-details density="compact" variant="outlined" />
                </div>

                <div v-for="(pillar, index) in pillars" :key="index" class="goal-edit-block">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">{{ pillar.goal || 'Goal ' + String(index + 1).padStart(2, '0') }}</span>
                  </div>
                  <div class="editor-fields">
                    <v-text-field v-model="pillar.goal" label="Goal tag" placeholder="e.g. Goal 01" hide-details density="compact" variant="outlined" />
                    <v-text-field v-model="pillar.title" label="Title" placeholder="e.g. Natural Resource & Environment" hide-details density="compact" variant="outlined" />
                    <v-textarea v-model="pillar.description" label="Description" rows="3" hide-details density="compact" variant="outlined" />
                    <label class="field">
                      <span class="field-label">Image (optional — leave blank to keep the current photo)</span>
                      <div class="image-field-row">
                        <img v-if="pillar.image" :src="pillar.image" alt="" class="image-field-thumb" />
                        <v-text-field v-model="pillar.image" placeholder="/images/programs/example.jpg" hide-details density="compact" variant="outlined" />
                        <v-btn size="x-small" variant="tonal" @click="toggleImageEditor('pillar-' + index)">
                          {{ imageEditorsOpen['pillar-' + index] ? 'Close' : 'Upload / Edit image' }}
                        </v-btn>
                      </div>
                      <ImageUploader
                        v-if="imageEditorsOpen['pillar-' + index]"
                        :model-value="pillar.image"
                        @update:model-value="(url) => (pillar.image = url)"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- ══════════ QUOTE ══════════ -->
          <section v-if="!anyEditing || activeSection === 'quote'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Quote</span>
                <h2 class="card-title">Closing quote</h2>
              </div>
              <v-btn v-if="!anyEditing" variant="tonal" size="x-small" @click="toggleSection('quote')">Edit section</v-btn>
              <v-btn v-if="activeSection === 'quote'" variant="tonal" size="x-small" @click="toggleSection('quote')">Done</v-btn>
            </div>
            <div class="card-body">
              <div v-if="activeSection !== 'quote'">
                <blockquote class="quote-preview">"{{ quote.text }}"</blockquote>
                <p class="plain-text" style="margin-top: 0.4rem;">— {{ quote.attrib }}</p>
              </div>

              <div v-else class="editor-fields">
                <v-textarea v-model="quote.text" label="Quote" rows="3" hide-details density="compact" variant="outlined" />
                <v-text-field v-model="quote.attrib" label="Attribution" placeholder="e.g. Founding Spirit of Santi Sena" hide-details density="compact" variant="outlined" />
              </div>
            </div>
          </section>

          <!-- ══════════ CALL TO ACTION ══════════ -->
          <section v-if="!anyEditing || activeSection === 'cta'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Ready to give</span>
                <h2 class="card-title">{{ cta.title }}</h2>
              </div>
              <v-btn v-if="!anyEditing" variant="tonal" size="x-small" @click="toggleSection('cta')">Edit CTA</v-btn>
              <v-btn v-if="activeSection === 'cta'" variant="tonal" size="x-small" @click="toggleSection('cta')">Done</v-btn>
            </div>
            <div class="card-body">
              <div v-if="activeSection !== 'cta'" class="priority-view-list">
                <p class="plain-text" style="margin: 0 0 0.75rem;">{{ cta.desc }}</p>
                <div class="priority-view-row">
                  <span class="priority-view-number">01</span>
                  <span>{{ cta.primaryLabel }}</span>
                </div>
                <div class="priority-view-row">
                  <span class="priority-view-number">02</span>
                  <span>{{ cta.secondaryLabel }}</span>
                </div>
              </div>

              <div v-else class="editor-fields">
                <v-text-field v-model="cta.title" label="Title" placeholder="e.g. Join the Peace Army." hide-details density="compact" variant="outlined" />
                <v-textarea v-model="cta.desc" label="Description" rows="2" hide-details density="compact" variant="outlined" />
                <v-text-field v-model="cta.primaryLabel" label="Primary button label" placeholder="e.g. Support Us" hide-details density="compact" variant="outlined" />
                <v-text-field v-model="cta.secondaryLabel" label="Secondary button label" placeholder="e.g. Partner with us" hide-details density="compact" variant="outlined" />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  </v-app>
</template>

<style scoped>
.home-dash {
  --bg: #f5f7fb;
  --surface: #ffffff;
  --border: #e8edf6;
  --border-s: #d4dcee;
  --text: #1a1a1a;
  --contrast: #1a1a1a;
  --muted: #6a7fa0;
  --blue: #2563eb;
  --blue-glow: rgba(37,99,235,0.18);
  --emerald: #059669;
  --emerald-soft: #eafaf5;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 16px;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}

:global(.admin-dark .home-dash) {
  --bg: #080c1a;
  --surface: #0d1f17;
  --border: #1c3327;
  --border-s: #274434;
  --text: #c8d2e6;
  --contrast: #eaf0f8;
  --muted: #7a8aaa;
  --blue: #10b981;
  --blue-glow: rgba(16,185,129,0.2);
  --emerald: #10b981;
  --emerald-soft: #142a22;

}

.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; }



.dash-banner { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.banner-content { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; padding: 1.25rem; }
.banner-text { display: grid; gap: 0.4rem; max-width: 460px; flex: 1; }
.banner-badge {
  display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content;
  font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--emerald); background: var(--emerald-soft); padding: 0.2rem 0.7rem; border-radius: 999px;
}
.banner-title { margin: 0; color: var(--contrast); font-size: clamp(1.3rem,2.6vw,1.7rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.55; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }

.content-grid { display: grid; gap: 1.25rem; margin-top: 1.25rem; }

.card-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); overflow: hidden; }
.card-hdr { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; padding: 0.85rem 1.2rem; border-bottom: 1px solid var(--border); }
.card-hdr-left { display: grid; gap: 0.15rem; }
.card-badge { font-size: 0.68rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--emerald); }
.card-title { margin: 0; color: var(--contrast); font-size: 0.95rem; font-weight: 800; }

.card-body { padding: 1rem 1.2rem 1.2rem; }

.plain-text { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.6; }

.highlights-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
.hcard { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; }
.hcard-body { padding: 0.9rem 0.9rem 1rem; display: grid; gap: 0.3rem; }
.hcard-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: var(--emerald); }
.hcard-body strong { color: var(--contrast); font-size: 0.92rem; font-weight: 800; }
.hcard-body small { color: var(--muted); font-size: 0.78rem; font-weight: 500; line-height: 1.5; }

.goal-edit-list { display: grid; gap: 1rem; }
.goal-edit-block { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0.9rem 1rem 1.1rem; }
.goal-edit-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.hcard-count { font-size: 0.72rem; font-weight: 800; color: var(--muted); padding: 0.1rem 0.4rem; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); }

.quote-preview {
  margin: 0; padding-left: 0.75rem; border-left: 2px solid var(--emerald);
  font-size: 0.92rem; font-style: italic; color: var(--text); line-height: 1.6;
}

.priority-view-list { display: grid; gap: 0.5rem; }
.priority-view-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.7rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text); }
.priority-view-number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--emerald-soft); color: var(--emerald); font-size: 0.68rem; font-weight: 800; flex-shrink: 0; }

@media (min-width: 900px) { .home-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 560px) {
  .highlights-grid { grid-template-columns: 1fr; }
}
@media (max-width: 720px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
}
@media (max-width: 600px) {
  .banner-actions { width: 100%; }
  .banner-actions .v-btn { flex: 1; }
}

.editor-fields { display: grid; gap: 0.7rem; }
.editor-fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.editor-fields .field { display: grid; gap: 0.25rem; }
.editor-fields .field-label { font-size: 0.78rem; font-weight: 800; color: var(--text); }
.image-field-row { display: flex; align-items: center; gap: 0.5rem; }
.image-field-thumb {
  width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);
  border: 1px solid var(--border); flex-shrink: 0; background: var(--bg);
}
</style>