<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const ui = useUiStore()

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
  <div :class="['home-dash', { 'sidebar-open': ui.sidebarOpen }]">
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
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 12l2-2m0 0l7-7 7 7m-9-9v18h6"/><path d="M9 21V12h6v9"/></svg>
                  <span>Home</span>
                </div>
                <h1 class="banner-title">Home page</h1>
                <p class="banner-desc">
                  Edit the stats, mission statement, four pillars, quote and closing call-to-action
                  shown on the public homepage. The hero slideshow is managed separately.
                </p>
              </div>

              <div class="banner-actions">
                <button v-if="anyEditing" class="btn btn-ghost" type="button" @click="closeEditors">Cancel</button>
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
          <!-- ══════════ KEY STATS ══════════ -->
          <section v-if="!anyEditing || activeSection === 'stats'" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">By the numbers</span>
                <h2 class="card-title">Key stats</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleSection('stats')">Edit section</button>
              <button v-if="activeSection === 'stats'" class="card-hdr-link" type="button" @click="toggleSection('stats')">Done</button>
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
                      <input v-model="stat.value" type="text" placeholder="e.g. 293" />
                    </label>
                    <label class="field">
                      <span class="field-label">Label</span>
                      <input v-model="stat.label" type="text" placeholder="e.g. Villages Reached" />
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
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleSection('mission')">Edit section</button>
              <button v-if="activeSection === 'mission'" class="card-hdr-link" type="button" @click="toggleSection('mission')">Done</button>
            </div>
            <div class="card-body">
              <p v-if="activeSection !== 'mission'" class="plain-text">{{ mission.text }}</p>

              <div v-else class="editor-fields">
                <label class="field">
                  <span class="field-label">Eyebrow</span>
                  <input v-model="mission.eyebrow" type="text" placeholder="e.g. Our Mission" />
                </label>
                <label class="field">
                  <span class="field-label">Title</span>
                  <input v-model="mission.title" type="text" placeholder="e.g. Peace is planted, not declared." />
                </label>
                <label class="field">
                  <span class="field-label">Mission text</span>
                  <textarea v-model="mission.text" rows="4"></textarea>
                </label>
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
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleSection('pillars')">Edit section</button>
              <button v-if="activeSection === 'pillars'" class="card-hdr-link" type="button" @click="toggleSection('pillars')">Done</button>
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
                  <label class="field">
                    <span class="field-label">Section eyebrow</span>
                    <input v-model="pillarsSection.eyebrow" type="text" placeholder="e.g. Four Pillars" />
                  </label>
                  <label class="field">
                    <span class="field-label">Section title</span>
                    <input v-model="pillarsSection.title" type="text" placeholder="e.g. Strategic goals" />
                  </label>
                  <label class="field">
                    <span class="field-label">"Explore all programs" link label</span>
                    <input v-model="pillarsSection.linkLabel" type="text" placeholder="e.g. Explore all programs" />
                  </label>
                </div>

                <div v-for="(pillar, index) in pillars" :key="index" class="goal-edit-block">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">{{ pillar.goal || 'Goal ' + String(index + 1).padStart(2, '0') }}</span>
                  </div>
                  <div class="editor-fields">
                    <label class="field">
                      <span class="field-label">Goal tag</span>
                      <input v-model="pillar.goal" type="text" placeholder="e.g. Goal 01" />
                    </label>
                    <label class="field">
                      <span class="field-label">Title</span>
                      <input v-model="pillar.title" type="text" placeholder="e.g. Natural Resource & Environment" />
                    </label>
                    <label class="field">
                      <span class="field-label">Description</span>
                      <textarea v-model="pillar.description" rows="3"></textarea>
                    </label>
                    <label class="field">
                      <span class="field-label">Image (optional — leave blank to keep the current photo)</span>
                      <div class="image-field-row">
                        <img v-if="pillar.image" :src="pillar.image" alt="" class="image-field-thumb" />
                        <input v-model="pillar.image" type="text" placeholder="/images/programs/example.jpg" />
                        <button type="button" class="edit-image-btn" @click="toggleImageEditor('pillar-' + index)">
                          {{ imageEditorsOpen['pillar-' + index] ? 'Close' : 'Upload / Edit image' }}
                        </button>
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
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleSection('quote')">Edit section</button>
              <button v-if="activeSection === 'quote'" class="card-hdr-link" type="button" @click="toggleSection('quote')">Done</button>
            </div>
            <div class="card-body">
              <div v-if="activeSection !== 'quote'">
                <blockquote class="quote-preview">"{{ quote.text }}"</blockquote>
                <p class="plain-text" style="margin-top: 0.4rem;">— {{ quote.attrib }}</p>
              </div>

              <div v-else class="editor-fields">
                <label class="field">
                  <span class="field-label">Quote</span>
                  <textarea v-model="quote.text" rows="3"></textarea>
                </label>
                <label class="field">
                  <span class="field-label">Attribution</span>
                  <input v-model="quote.attrib" type="text" placeholder="e.g. Founding Spirit of Santi Sena" />
                </label>
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
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleSection('cta')">Edit CTA</button>
              <button v-if="activeSection === 'cta'" class="card-hdr-link" type="button" @click="toggleSection('cta')">Done</button>
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
                <label class="field">
                  <span class="field-label">Title</span>
                  <input v-model="cta.title" type="text" placeholder="e.g. Join the Peace Army." />
                </label>
                <label class="field">
                  <span class="field-label">Description</span>
                  <textarea v-model="cta.desc" rows="2"></textarea>
                </label>
                <label class="field">
                  <span class="field-label">Primary button label</span>
                  <input v-model="cta.primaryLabel" type="text" placeholder="e.g. Support Us" />
                </label>
                <label class="field">
                  <span class="field-label">Secondary button label</span>
                  <input v-model="cta.secondaryLabel" type="text" placeholder="e.g. Partner with us" />
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
  --btn-primary-bg: #10b981;
  --btn-primary-text: #ffffff;
}

.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; }

.notice {
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  margin-bottom: 1.25rem; padding: 0.75rem 1rem; border-radius: 12px; border: 1px solid;
  font-weight: 600; font-size: 0.88rem;
}
.notice-inner { display: flex; align-items: center; gap: 0.6rem; }
.notice-success { background: rgba(22,163,74,0.08); border-color: rgba(22,163,74,0.25); color: var(--emerald); }
.notice-error { background: rgba(225,29,72,0.06); border-color: rgba(225,29,72,0.25); color: #be123c; }
.notice-icon { flex-shrink: 0; }
.notice-dismiss { display: grid; place-items: center; width: 26px; height: 26px; border: none; border-radius: 8px; background: transparent; color: inherit; cursor: pointer; }
.notice-dismiss:hover { background: rgba(0,0,0,0.06); }
.notice-slide-enter-active, .notice-slide-leave-active { transition: all 0.22s ease; }
.notice-slide-enter-from, .notice-slide-leave-to { opacity: 0; transform: translateY(-8px); }

.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
  cursor: pointer; text-decoration: none; transition: all 0.15s ease;
  border: 1px solid transparent; font-family: inherit;
}
.btn-primary { background: var(--btn-primary-bg); color: var(--btn-primary-text); border-color: transparent; }
.btn-primary:hover:not(:disabled) { opacity: 0.9; }
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-ghost { background: var(--surface); color: var(--contrast); border-color: var(--border-s); }
.btn-ghost:hover { background: var(--bg); }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

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
.card-hdr-link { font-size: 0.82rem; font-weight: 700; color: var(--emerald); text-decoration: none; background: none; border: none; cursor: pointer; padding: 0.3rem 0.6rem; border-radius: var(--radius-sm); }
.card-hdr-link:hover { background: var(--emerald-soft); }
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
  .banner-actions .btn { flex: 1; justify-content: center; }
}

.editor-fields { display: grid; gap: 0.7rem; }
.editor-fields-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.editor-fields .field { display: grid; gap: 0.25rem; }
.editor-fields .field-label { font-size: 0.78rem; font-weight: 800; color: var(--text); }
.editor-fields .field input,
.editor-fields .field textarea {
  width: 100%; padding: 0.5rem 0.7rem; border: 1px solid var(--emerald); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--text); font-family: inherit; font-size: 0.86rem; resize: vertical; outline: none;
}
.editor-fields .field input:focus,
.editor-fields .field textarea:focus { box-shadow: 0 0 0 3px var(--blue-glow); }

.image-field-row { display: flex; align-items: center; gap: 0.5rem; }
.image-field-row input { flex: 1; }
.image-field-thumb {
  width: 40px; height: 40px; object-fit: cover; border-radius: var(--radius-sm);
  border: 1px solid var(--border); flex-shrink: 0; background: var(--bg);
}
.edit-image-btn {
  flex-shrink: 0; padding: 0.5rem 0.7rem; border: 1px solid var(--border-s); border-radius: var(--radius-sm);
  background: var(--surface); color: var(--emerald); font-size: 0.8rem; font-weight: 700; cursor: pointer; font-family: inherit;
  white-space: nowrap;
}
.edit-image-btn:hover { background: var(--emerald-soft); }
</style>