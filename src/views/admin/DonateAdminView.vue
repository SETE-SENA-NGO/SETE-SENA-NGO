<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'

const ui = useUiStore()
const route = useRoute()

const loading = ref(true)
const saving = ref(false)
const notice = ref<{ type: 'success' | 'error'; message: string } | null>(null)

const publicPageUrl = computed(() => `${window.location.origin}/get-involved/donate`)

interface GiftUse {
  label: string
  title: string
  image: string
  summary: string
  detail: string
}

const giftSection = reactive({
  eyebrow: 'Gift use',
  heading: 'Small items. Real field value.',
})

const giftUses = reactive<GiftUse[]>([
  {
    label: 'Education',
    title: 'School essentials',
    image: '/images/programs/education-hero.jpg',
    summary: 'Bikes, uniforms, bags and notebooks.',
    detail: 'The report names scholarships with bikes, uniforms, bags, shoes, notebooks and pens.',
  },
  {
    label: 'WASH',
    title: 'Clean water points',
    image: '/images/programs/hero-1.jpg',
    summary: 'Filters and handwashing spaces.',
    detail: 'Support can help schools keep safe water and handwashing practical for children.',
  },
  {
    label: 'Learning',
    title: 'Books for monastery schools',
    image: '/images/programs/hero-4.jpg',
    summary: 'Dharma and secular textbooks.',
    detail: 'The report records Dharma, Buddhist and secular books for Buddhist primary schools.',
  },
  {
    label: 'Livelihoods',
    title: 'Home garden inputs',
    image: '/images/programs/livelihood-hero3.jpg',
    summary: 'Seeds, farming practice and family food.',
    detail:
      'Agriculture inputs help families apply vegetable, animal, rice and fish production training.',
  },
])

interface TrustNote {
  title: string
  body: string
}

const trustSection = reactive({
  eyebrow: 'Stewardship',
  heading: 'Clear handling matters.',
  intro:
    'Practical giving needs careful records, written guidance and clear reporting back to the work it supports.',
})

const trustNotes = reactive<TrustNote[]>([
  {
    title: 'Finance team',
    body: 'Santi Sena keeps financial information prepared, maintained and available for reporting.',
  },
  {
    title: 'Written policies',
    body: 'Finance, anti-corruption, conflict of interest and grievance policies guide the work.',
  },
  {
    title: 'Field use',
    body: 'Giving is directed into practical materials, learning support and community follow-up.',
  },
])

const cta = reactive({
  eyebrow: 'Ready to give',
  heading: 'Support the next practical need.',
  quote:
    'The strongest giving is simple, specific and steady. Your donation helps Santi Sena turn urgent local needs into practical materials communities can use.',
  primaryLabel: 'Donate by QR',
  primaryLink: '/qr-donate',
  secondaryLabel: 'Contact team',
  secondaryLink: '/contact',
  imageSmall: '/images/programs/hero-2.jpg',
  imageLarge: '/images/programs/livelihood-hero3.jpg',
})

const giftEditing = ref(false)
const trustEditing = ref(false)
const ctaEditing = ref(false)

const imageEditorsOpen = reactive<Record<string, boolean>>({})
function toggleImageEditor(key: string) {
  imageEditorsOpen[key] = !imageEditorsOpen[key]
}

function toggleGift() {
  giftEditing.value = !giftEditing.value
  trustEditing.value = false
  ctaEditing.value = false
}
function toggleTrust() {
  trustEditing.value = !trustEditing.value
  giftEditing.value = false
  ctaEditing.value = false
}
function toggleCta() {
  ctaEditing.value = !ctaEditing.value
  giftEditing.value = false
  trustEditing.value = false
}
function closeEditors() {
  giftEditing.value = false
  trustEditing.value = false
  ctaEditing.value = false
}
const anyEditing = computed(() => giftEditing.value || trustEditing.value || ctaEditing.value)

function addGiftUse() {
  giftUses.push({ label: '', title: '', image: '', summary: '', detail: '' })
}
function removeGiftUse(index: number) {
  giftUses.splice(index, 1)
}
function addTrustNote() {
  trustNotes.push({ title: '', body: '' })
}
function removeTrustNote(index: number) {
  trustNotes.splice(index, 1)
}

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
        if (parsed?.kind === 'santi-sena-donate-content') {
          giftSection.eyebrow = parsed.giftSection?.eyebrow || giftSection.eyebrow
          giftSection.heading = parsed.giftSection?.heading || giftSection.heading
          if (Array.isArray(parsed.giftUses) && parsed.giftUses.length) {
            giftUses.splice(0, giftUses.length, ...parsed.giftUses)
          }

          trustSection.eyebrow = parsed.trustSection?.eyebrow || trustSection.eyebrow
          trustSection.heading = parsed.trustSection?.heading || trustSection.heading
          trustSection.intro = parsed.trustSection?.intro || trustSection.intro
          if (Array.isArray(parsed.trustNotes) && parsed.trustNotes.length) {
            trustNotes.splice(0, trustNotes.length, ...parsed.trustNotes)
          }

          if (parsed.cta) {
            Object.assign(cta, parsed.cta)
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

async function savePage() {
  saving.value = true
  notice.value = null
  try {
    const body = JSON.stringify({
      kind: 'santi-sena-donate-content',
      version: 1,
      route: '/get-involved/donate',
      group: 'Get Involved',
      giftSection: { ...giftSection },
      giftUses: giftUses.filter((g) => g.label.trim() || g.title.trim()),
      trustSection: { ...trustSection },
      trustNotes: trustNotes.filter((t) => t.title.trim() || t.body.trim()),
      cta: { ...cta },
    })

    const payload = {
      slug: 'get-involved-donate',
      title: cta.heading.trim() || 'Donate',
      body,
      route_path: '/get-involved/donate',
      nav_group: 'Get Involved',
      locale: 'en',
      template: 'standard',
      status: 'published',
      hero_eyebrow: giftSection.eyebrow.trim() || null,
      hero_headline: giftSection.heading.trim() || null,
      hero_intro: trustSection.intro.trim() || null,
      primary_cta_label: cta.primaryLabel.trim() || null,
      primary_cta_url: cta.primaryLink.trim() || '/qr-donate',
      secondary_cta_label: cta.secondaryLabel.trim() || null,
      secondary_cta_url: cta.secondaryLink.trim() || '/contact',
      seo_title: cta.heading.trim() || 'Donate',
      seo_description: trustSection.intro.trim() || null,
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
      localStorage.setItem('admin_return_path', route.path)
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

        <header class="dash-banner">
          <div class="banner-inner">
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  <span>Donate</span>
                </div>
                <h1 class="banner-title">Get Involved / Donate page</h1>
                <p class="banner-desc">
                  Edit the gift-use cards, stewardship notes and closing call-to-action shown on the
                  public Donate page.
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

        <div class="content-grid">
          <section v-if="!trustEditing && !ctaEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Gift use</span>
                <h2 class="card-title">{{ giftSection.heading }}</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleGift">Edit section</button>
              <button v-if="giftEditing" class="card-hdr-link" type="button" @click="toggleGift">Done</button>
            </div>
            <div class="card-body">
              <div v-if="!giftEditing" class="highlights-grid">
                <div v-for="(item, index) in giftUses" :key="index" class="hcard hcard-emerald">
                  <div class="hcard-body">
                    <strong>{{ item.title }}</strong>
                    <small>{{ item.label }} — {{ item.summary }}</small>
                  </div>
                </div>
              </div>

              <div v-else class="goal-edit-list">
                <div class="editor-fields" style="margin-bottom: 1rem;">
                  <label class="field">
                    <span class="field-label">Section eyebrow</span>
                    <input v-model="giftSection.eyebrow" type="text" placeholder="e.g. Gift use" />
                  </label>
                  <label class="field">
                    <span class="field-label">Section heading</span>
                    <input v-model="giftSection.heading" type="text" placeholder="e.g. Small items. Real field value." />
                  </label>
                </div>
                <div v-for="(item, index) in giftUses" :key="index" class="goal-edit-block hcard-emerald">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">Card {{ index + 1 }}</span>
                    <button type="button" class="priority-remove" @click="removeGiftUse(index)" aria-label="Remove card">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="editor-fields">
                    <label class="field">
                      <span class="field-label">Label</span>
                      <input v-model="item.label" type="text" placeholder="e.g. Education" />
                    </label>
                    <label class="field">
                      <span class="field-label">Title</span>
                      <input v-model="item.title" type="text" placeholder="e.g. School essentials" />
                    </label>
                    <label class="field">
                      <span class="field-label">Image path</span>
                      <div class="image-field-row">
                        <img v-if="item.image" :src="item.image" alt="" class="image-field-thumb" />
                        <input v-model="item.image" type="text" placeholder="/images/programs/example.jpg" />
                        <button type="button" class="edit-image-btn" @click="toggleImageEditor('gift-' + index)">
                          {{ imageEditorsOpen['gift-' + index] ? 'Close' : 'Upload / Edit image' }}
                        </button>
                      </div>
                      <ImageUploader
                        v-if="imageEditorsOpen['gift-' + index]"
                        :model-value="item.image"
                        @update:model-value="(url) => (item.image = url)"
                      />
                    </label>
                    <label class="field">
                      <span class="field-label">Summary (shown on card)</span>
                      <textarea v-model="item.summary" rows="2" placeholder="Short summary line."></textarea>
                    </label>
                    <label class="field">
                      <span class="field-label">Detail (shown on hover)</span>
                      <textarea v-model="item.detail" rows="2" placeholder="Longer detail line."></textarea>
                    </label>
                  </div>
                </div>
                <button type="button" class="add-priority-btn" @click="addGiftUse">Add gift-use card</button>
              </div>
            </div>
          </section>

          <section v-if="!giftEditing && !ctaEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Stewardship</span>
                <h2 class="card-title">{{ trustSection.heading }}</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleTrust">Edit section</button>
              <button v-if="trustEditing" class="card-hdr-link" type="button" @click="toggleTrust">Done</button>
            </div>
            <div class="card-body">
              <div v-if="!trustEditing" class="priority-view-list">
                <p style="margin: 0 0 0.75rem; color: var(--muted); font-size: 0.86rem; line-height: 1.55;">{{ trustSection.intro }}</p>
                <div v-for="(note, idx) in trustNotes" :key="idx" class="priority-view-row">
                  <span class="priority-view-number">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <span><strong>{{ note.title }}</strong> — {{ note.body }}</span>
                </div>
              </div>

              <div v-else class="goal-edit-list">
                <div class="editor-fields" style="margin-bottom: 1rem;">
                  <label class="field">
                    <span class="field-label">Section eyebrow</span>
                    <input v-model="trustSection.eyebrow" type="text" placeholder="e.g. Stewardship" />
                  </label>
                  <label class="field">
                    <span class="field-label">Section heading</span>
                    <input v-model="trustSection.heading" type="text" placeholder="e.g. Clear handling matters." />
                  </label>
                  <label class="field">
                    <span class="field-label">Intro paragraph</span>
                    <textarea v-model="trustSection.intro" rows="2"></textarea>
                  </label>
                </div>
                <div v-for="(note, index) in trustNotes" :key="index" class="goal-edit-block hcard-emerald">
                  <div class="goal-edit-hdr">
                    <span class="hcard-count">Note {{ index + 1 }}</span>
                    <button type="button" class="priority-remove" @click="removeTrustNote(index)" aria-label="Remove note">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                  <div class="editor-fields">
                    <label class="field">
                      <span class="field-label">Title</span>
                      <input v-model="note.title" type="text" placeholder="e.g. Finance team" />
                    </label>
                    <label class="field">
                      <span class="field-label">Body</span>
                      <textarea v-model="note.body" rows="2"></textarea>
                    </label>
                  </div>
                </div>
                <button type="button" class="add-priority-btn" @click="addTrustNote">Add stewardship note</button>
              </div>
            </div>
          </section>

          <section v-if="!giftEditing && !trustEditing" class="card-section">
            <div class="card-hdr">
              <div class="card-hdr-left">
                <span class="card-badge">Ready to give</span>
                <h2 class="card-title">{{ cta.heading }}</h2>
              </div>
              <button v-if="!anyEditing" class="card-hdr-link" type="button" @click="toggleCta">Edit CTA</button>
              <button v-if="ctaEditing" class="card-hdr-link" type="button" @click="toggleCta">Done</button>
            </div>
            <div class="card-body">
              <div v-if="!ctaEditing" class="priority-view-list">
                <p style="margin: 0 0 0.75rem; color: var(--muted); font-size: 0.86rem; line-height: 1.55;">{{ cta.quote }}</p>
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
                  <span class="field-label">Eyebrow</span>
                  <input v-model="cta.eyebrow" type="text" placeholder="e.g. Ready to give" />
                </label>
                <label class="field">
                  <span class="field-label">Heading</span>
                  <input v-model="cta.heading" type="text" placeholder="e.g. Support the next practical need." />
                </label>
                <label class="field">
                  <span class="field-label">Quote paragraph</span>
                  <textarea v-model="cta.quote" rows="3"></textarea>
                </label>
                <label class="field">
                  <span class="field-label">Small image path</span>
                  <div class="image-field-row">
                    <img v-if="cta.imageSmall" :src="cta.imageSmall" alt="" class="image-field-thumb" />
                    <input v-model="cta.imageSmall" type="text" placeholder="/images/programs/example.jpg" />
                    <button type="button" class="edit-image-btn" @click="toggleImageEditor('cta-small')">
                      {{ imageEditorsOpen['cta-small'] ? 'Close' : 'Upload / Edit image' }}
                    </button>
                  </div>
                  <ImageUploader
                    v-if="imageEditorsOpen['cta-small']"
                    :model-value="cta.imageSmall"
                    @update:model-value="(url) => (cta.imageSmall = url)"
                  />
                </label>
                <label class="field">
                  <span class="field-label">Large image path</span>
                  <div class="image-field-row">
                    <img v-if="cta.imageLarge" :src="cta.imageLarge" alt="" class="image-field-thumb" />
                    <input v-model="cta.imageLarge" type="text" placeholder="/images/programs/example.jpg" />
                    <button type="button" class="edit-image-btn" @click="toggleImageEditor('cta-large')">
                      {{ imageEditorsOpen['cta-large'] ? 'Close' : 'Upload / Edit image' }}
                    </button>
                  </div>
                  <ImageUploader
                    v-if="imageEditorsOpen['cta-large']"
                    :model-value="cta.imageLarge"
                    @update:model-value="(url) => (cta.imageLarge = url)"
                  />
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

.highlights-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.75rem; }
.hcard { border: 1px solid var(--border); border-radius: var(--radius-md); background: var(--surface); overflow: hidden; }
.hcard-body { padding: 0.9rem 0.9rem 1rem; display: grid; gap: 0.25rem; }
.hcard-body strong { color: var(--contrast); font-size: 1rem; font-weight: 800; }
.hcard-body small { color: var(--muted); font-size: 0.76rem; font-weight: 600; line-height: 1.5; }

.goal-edit-list { display: grid; gap: 1rem; }
.goal-edit-block { border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 0.9rem 1rem 1.1rem; }
.goal-edit-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem; }
.hcard-count { font-size: 0.72rem; font-weight: 800; color: var(--muted); padding: 0.1rem 0.4rem; border-radius: 999px; background: var(--surface); border: 1px solid var(--border); }

.priority-view-list { display: grid; gap: 0.5rem; }
.priority-view-row { display: flex; align-items: center; gap: 0.65rem; padding: 0.55rem 0.7rem; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 0.85rem; color: var(--text); }
.priority-view-number { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: var(--emerald-soft); color: var(--emerald); font-size: 0.68rem; font-weight: 800; flex-shrink: 0; }

.priority-remove { background: transparent; border: 1px solid var(--border); color: var(--muted); cursor: pointer; padding: 0.4rem; border-radius: var(--radius-sm); display: grid; place-items: center; }
.priority-remove:hover { background: #fef2f2; color: #dc2626; border-color: #fecaca; }
.add-priority-btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.35rem; padding: 0.5rem 0.7rem; border: 1px dashed var(--border-s); border-radius: var(--radius-sm); background: transparent; color: var(--emerald); font-size: 0.82rem; font-weight: 700; cursor: pointer; font-family: inherit; }
.add-priority-btn:hover { background: var(--emerald-soft); border-color: var(--emerald); }

@media (min-width: 900px) { .donate-dash.sidebar-open { padding-left: 260px; } }
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