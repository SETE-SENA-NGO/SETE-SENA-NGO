<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { imageUrls } from '@/lib/imageUrls'
import { supabase } from '@/lib/supabase'

const childIntroImage = imageUrls.education.intro
const childReadingImage = imageUrls.education.reading
const childStudyImage = imageUrls.education.study
const childTeacherImage = imageUrls.education.teacher

/* ─── Static fallback data ──────────────────────── */
const FALLBACK_STATS = [
  {
    number: '120+',
    label: 'PRE-SCHOOL CHILDREN',
    description: 'Enrolled each year across remote villages in Svay Rieng and Prey Veng.',
    icon: 'book',
  },
  {
    number: '8',
    label: 'MOBILE LIBRARIES',
    description: 'Reaching villages with no school library or bookshop within 20 km.',
    icon: 'library',
  },
  {
    number: '60+',
    label: 'ANNUAL SCHOLARSHIPS',
    description: 'For the poorest students at every level — especially girls.',
    icon: 'star',
  },
]

const FALLBACK_WHAT_WE_DO: string[] = [
  'Community pre-schools led by trained local teachers in remote villages',
  'Mobile library service bringing books, audio and learning kits to children',
  'Scholarships covering uniforms, supplies and transport for the poorest students',
  'Buddhist moral education and life-skills classes in pagoda settings',
  'Youth peer-educator groups on health, environment and child rights',
  'Teacher training and parent engagement to keep children in school',
]

const FALLBACK_TEAM_CARDS = [
  {
    role: 'Program Director',
    desc: 'Oversees education initiatives, partnerships, and donor reporting across all provinces.',
    icon: 'compass',
  },
  {
    role: 'Field Coordinators',
    desc: 'Manage pre-school, library and scholarship programs in each province.',
    icon: 'map',
  },
  {
    role: 'Teachers & Facilitators',
    desc: 'Deliver early learning, literacy sessions and youth clubs in village settings.',
    icon: 'heart',
  },
  {
    role: 'Monitoring & Evaluation',
    desc: 'Tracks learning progress, attendance and community outcomes.',
    icon: 'chart',
  },
]

const FALLBACK_WHY_ITEMS: string[] = [
  'Children who attend pre-school are far more likely to complete primary and secondary school',
  'Scholarships keep the poorest girls in class through the most vulnerable years',
  'Mobile libraries reach children a bus route never will',
  'Pagoda-based ethics classes preserve Khmer language and moral tradition',
]

/* ─── Dynamic data from DB (replaces hardcoded) ── */
const heroTitle = ref('Access to Education')
const heroDesc = ref(
  'Community pre-schools, mobile libraries, scholarships for poor children and the preservation of Buddhist education in pagoda settings across rural Cambodia.'
)
const dynamicStats = ref<Array<{ number: string; label: string; description: string; icon: string }>>(FALLBACK_STATS)
const whatWeDoItems = ref<string[]>(FALLBACK_WHAT_WE_DO)
const approachText = ref(
  'We hire teachers from the villages we serve, train them in early-childhood pedagogy, and pair every classroom with a parent committee. Curriculum blends the national standard with Buddhist ethics, Khmer culture and hands-on environmental learning — so a child grows up rooted in both the national curriculum and the wisdom of the pagoda.'
)
const whyItems = ref<string[]>(FALLBACK_WHY_ITEMS)
const teamCards = ref(FALLBACK_TEAM_CARDS)

/* ─── Map stat label to icon name ──────────────── */
function iconForLabel(label: string): string {
  const lower = label.toLowerCase()
  if (lower.includes('pre-school') || lower.includes('child')) return 'book'
  if (lower.includes('library')) return 'library'
  if (lower.includes('scholarship') || lower.includes('student')) return 'star'
  return 'star'
}

/* ─── Parse metadata into reactive refs ────────── */
function applyMetadata(meta: Record<string, unknown>) {
  // Hero title & intro
  if (typeof meta.headline === 'string' && meta.headline.trim()) {
    heroTitle.value = meta.headline.trim()
  }
  if (typeof meta.intro === 'string' && meta.intro.trim()) {
    heroDesc.value = meta.intro.trim()
  }

  // Stats band
  if (Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
    dynamicStats.value = meta.statsBand.map((s: Record<string, unknown>) => ({
      number: String(s.number ?? ''),
      label: String(s.label ?? ''),
      description: String(s.description ?? ''),
      icon: iconForLabel(String(s.label ?? '')),
    }))
  }

  // Sections
  if (Array.isArray(meta.sections)) {
    const sections = meta.sections as Array<Record<string, unknown>>

    // What we do — from 'education-work' section items
    const workSection = sections.find((s) => s.id === 'education-work')
    if (workSection && typeof workSection.items === 'string' && workSection.items.trim()) {
      const parsed = workSection.items
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
      if (parsed.length > 0) {
        whatWeDoItems.value = parsed
      }
    }

    // Approach — from 'education-approach' section body
    const approachSection = sections.find((s) => s.id === 'education-approach')
    if (approachSection && typeof approachSection.body === 'string' && approachSection.body.trim()) {
      approachText.value = approachSection.body.trim()
    }

    // Why it matters — from 'education-why' section items
    const whySection = sections.find((s) => s.id === 'education-why')
    if (whySection && typeof whySection.items === 'string' && whySection.items.trim()) {
      const parsed = whySection.items
        .split('\n')
        .map((l: string) => l.trim())
        .filter(Boolean)
      if (parsed.length > 0) {
        whyItems.value = parsed
      }
    }
  }
}

/* ─── Load from programs table ─────────────────── */
async function loadFromDb() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('title, summary, metadata')
      .eq('slug', 'programs-education')
      .maybeSingle()

    if (error) {
      console.warn('[EducationView] DB load failed:', error.message)
      return
    }

    if (!data || !data.metadata) {
      console.warn('[EducationView] No program data found, using fallbacks')
      return
    }

    applyMetadata(data.metadata as Record<string, unknown>)
  } catch (e) {
    console.warn('[EducationView] DB load crashed:', e)
  }
}

/* ─── Real-time subscription ───────────────────── */
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

function setupRealtime() {
  realtimeChannel = supabase
    .channel('education-page-realtime')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'programs',
        filter: 'slug=eq.programs-education',
      },
      (payload) => {
        // On INSERT or UPDATE — apply new metadata
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const row = payload.new as Record<string, unknown>
          if (row.metadata) {
            applyMetadata(row.metadata as Record<string, unknown>)
          }
        }
      },
    )
    .subscribe()
}

// Scroll reveal
const revealElements = ref<HTMLElement[]>([])
let observer: IntersectionObserver | null = null

function setRevealRef(el: unknown, index: number) {
  if (el && el instanceof Element) {
    revealElements.value[index] = el as HTMLElement
  }
}

onMounted(async () => {
  document.title = 'Education Program — Santi Sena'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta(
    'description',
    'Community pre-schools, mobile libraries, scholarships and Buddhist moral education across rural Cambodian villages.',
  )

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setOgMeta('og:title', 'Education — Santi Sena')
  setOgMeta('og:description', 'Learning that starts at three years old and never stops.')

  // Load dynamic data from programs table
  await loadFromDb()

  // Subscribe to real-time changes so updates appear without refresh
  setupRealtime()

  // Set up scroll observer
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
  )

  revealElements.value.forEach((el) => el && observer?.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
    realtimeChannel = null
  }
})
</script>

<template>
  <div class="edu-page">
    <!-- ════════════════════ PAGE HEADER ════════════════════ -->
    <div class="page-header">
      <div class="container">
        <h1 class="page-header-title">{{ heroTitle }}</h1>
        <p class="page-header-desc">{{ heroDesc }}</p>
      </div>
    </div>

    <!-- ════════════════════ STATS BAND ════════════════════ -->
    <div class="stats-band-wrap">
      <div class="container">
        <div class="stats-band">
          <template v-for="(stat, i) in dynamicStats" :key="i + '-' + stat.label">
            <div class="stat-item">
              <span class="stat-icon">
                <svg v-if="stat.icon === 'book'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" />
                  <path d="M4 4.5A2.5 2.5 0 016.5 2H20v18H6.5A2.5 2.5 0 014 17.5v-13z" stroke="currentColor"
                    stroke-width="1.6" stroke-linejoin="round" />
                </svg>
                <svg v-else-if="stat.icon === 'library'" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.6" />
                  <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l2.4 7.2h7.6l-6 4.8 2.4 7.2-6-4.8-6 4.8 2.4-7.2-6-4.8h7.6L12 2z" stroke="currentColor"
                    stroke-width="1.6" stroke-linejoin="round" />
                </svg>
              </span>
              <div class="stat-copy">
                <h3 class="stat-number">{{ stat.number }}</h3>
                <p class="stat-label">{{ stat.label }}</p>
                <p class="stat-desc">{{ stat.description }}</p>
              </div>
            </div>
            <div v-if="i < dynamicStats.length - 1" class="stat-divider" aria-hidden="true"></div>
          </template>
        </div>
      </div>
    </div>

    <!-- ════════════════════ INTRO ════════════════════ -->
    <section class="section intro-section">
      <div class="container">
        <div class="intro-grid">
          <div :ref="(el) => setRevealRef(el, 0)" class="reveal intro-content">
            <p class="section-eyebrow">Our Mission</p>
            <h2 class="section-title">Learning that starts at three years old</h2>
            <p class="intro-text">
              Most rural Cambodian children miss the critical years before primary school. Santi Sena
              fills that gap with low-cost community pre-schools, then keeps walking with families
              through scholarships, libraries and youth groups that sustain a child's journey from
              early learning through adolescence.
            </p>
          </div>
          <div :ref="(el) => setRevealRef(el, 1)" class="reveal intro-image-wrap">
            <div class="intro-image-frame">
              <img :src="childIntroImage" alt="Young children learning in a Cambodian pre-school classroom"
                loading="lazy" decoding="async" />
            </div>
            <div class="intro-image-accent">
              <span class="accent-number">30+</span>
              <span class="accent-label">Years serving rural communities</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════ WHAT WE DO ════════════════════ -->
    <section class="section programs-section">
      <div class="container">
        <div class="two-col-grid">
          <div :ref="(el) => setRevealRef(el, 2)" class="reveal col-text">
            <p class="section-eyebrow">Our Work</p>
            <h2 class="section-title">What we do</h2>
            <ul class="check-grid">
              <li v-for="item in whatWeDoItems" :key="item">
                <span class="check-icon">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div :ref="(el) => setRevealRef(el, 3)" class="reveal col-image">
            <div class="photo-duo">
              <div class="col-image-frame photo-back">
                <img :src="childReadingImage" alt="Children reading books at a community school" loading="lazy"
                  decoding="async" />
              </div>
              <div class="col-image-frame photo-front">
                <img :src="childTeacherImage" alt="Teacher helping child with learning activity" loading="lazy"
                  decoding="async" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════ OUR APPROACH ════════════════════ -->
    <section class="approach-section">
      <div class="container approach-inner">
        <div :ref="(el) => setRevealRef(el, 4)" class="reveal">
          <p class="section-eyebrow section-eyebrow--light text-center">Methodology</p>
          <h2 class="section-title section-title--light text-center">Our approach</h2>
          <p class="approach-text">{{ approachText }}</p>
        </div>

        <div :ref="(el) => setRevealRef(el, 5)" class="reveal testimonial-block">
          <svg class="quote-mark" viewBox="0 0 48 36" fill="currentColor" aria-hidden="true">
            <path
              d="M0 36V20.8C0 8.6 6.9 1.4 18.4 0l2 5.4c-7 1.9-10.5 6.2-10.5 12.9h9.1V36H0zm27.6 0V20.8c0-12.2 6.9-19.4 18.4-20.8l2 5.4c-7 1.9-10.5 6.2-10.5 12.9h9.1V36H27.6z" />
          </svg>
          <blockquote>
            <p class="quote-text">
              "Before the pre-school, my daughter had never held a pencil. Now she reads to her
              grandmother every night."
            </p>
            <cite class="quote-cite">&mdash; Sopheak, mother of two, Prey Veng</cite>
          </blockquote>
        </div>
      </div>
    </section>

    <!-- ════════════════════ TEAM ════════════════════ -->
    <section class="section team-section">
      <div class="container">
        <div :ref="(el) => setRevealRef(el, 6)" class="reveal text-center">
          <p class="section-eyebrow">Organizational Structure</p>
          <h2 class="section-title">Who delivers education on the ground</h2>
        </div>

        <div class="team-grid">
          <div v-for="(member, index) in teamCards" :key="member.role" :ref="(el) => setRevealRef(el, 7 + index)"
            class="reveal team-card" :style="{ transitionDelay: `${index * 0.08}s` }">
            <div class="team-icon-wrap">
              <svg v-if="member.icon === 'compass'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                <path d="M16 8l-3 5-5 3 3-5 5-3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="member.icon === 'map'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z" stroke="currentColor"
                  stroke-width="1.6" stroke-linejoin="round" />
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <svg v-else-if="member.icon === 'heart'" viewBox="0 0 24 24" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 21l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1A5.7 5.7 0 0116.5 3C19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.1L12 21z"
                  stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.6"
                  stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.6" />
                <path d="M18 8l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="team-role">{{ member.role }}</h3>
            <p class="team-desc">{{ member.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════ WHY IT MATTERS ════════════════════ -->
    <section class="section impact-section">
      <div class="container">
        <div class="impact-layout">
          <div :ref="(el) => setRevealRef(el, 11)" class="reveal impact-image-wrap">
            <div class="impact-image-frame">
              <img :src="childStudyImage" alt="Children studying together in a rural school" loading="lazy"
                decoding="async" />
            </div>
            <div class="impact-image-badge">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" stroke-width="1.8"
                  stroke-linejoin="round" />
              </svg>
              <span>Every child deserves an education</span>
            </div>
          </div>
          <div class="impact-text-wrap">
            <div :ref="(el) => setRevealRef(el, 12)" class="reveal">
              <p class="section-eyebrow">Impact</p>
              <h2 class="section-title">Why it matters</h2>
            </div>
            <div class="impact-card-grid">
              <div v-for="(item, index) in whyItems" :key="item" :ref="(el) => setRevealRef(el, 13 + index)"
                class="reveal impact-card" :style="{ transitionDelay: `${index * 0.1}s` }">
                <div class="impact-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.6" />
                    <path d="M8 12.5l2.5 2.5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </div>
                <p class="impact-text">{{ item }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ════════════════════ CTA ════════════════════ -->
    <section class="cta-section">
      <div class="container cta-inner">
        <div :ref="(el) => setRevealRef(el, 17)" class="reveal text-center">
          <p class="cta-eyebrow">Get Involved</p>
          <h2 class="cta-title">Invest in a child's future today.</h2>
          <p class="cta-desc">
            Every dollar you give puts a book in a child's hands, a trained teacher in a
            classroom, or a scholarship on a desk where there was none.
          </p>
          <div class="cta-actions">
            <RouterLink to="/get-involved/donate" class="btn btn--primary btn--large">
              Support education
              <span class="btn-arrow">→</span>
            </RouterLink>
            <RouterLink to="/get-involved/volunteer" class="btn btn--outline">
              Volunteer your time
            </RouterLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   EDUCATION PAGE — Modern Redesign
   ═══════════════════════════════════════════════ */

.edu-page {
  background: var(--color-cream);
  color: var(--color-ink);
  overflow-x: hidden;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: 5rem 0;
}

.text-center {
  text-align: center;
}

.reveal {
  opacity: 0;
  transform: translateY(32px);
  transition:
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}

.section-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.6rem;
}

.section-eyebrow--light {
  color: var(--primary-color);
}

.section-title {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}

.section-title--light {
  color: var(--primary-dark);
}

.page-header {
  background: var(--color-cream-soft);
  padding: 3.5rem 0 2.5rem;
  text-align: center;
  border-bottom: 1px solid var(--color-border);
}

.page-header-title {
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
}

.page-header-desc {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--color-ink-soft);
  max-width: 620px;
  margin: 0 auto;
}

.stats-band-wrap {
  padding-top: 2rem;
  padding-bottom: 0;
}

.stats-band {
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 24px 60px -20px rgba(22, 52, 42, 0.28);
  padding: 2.5rem 2rem;
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
}

.stat-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 0 0.5rem;
}

.stat-divider {
  width: 1px;
  align-self: stretch;
  background: rgba(22, 52, 42, 0.1);
  margin: 0 0.25rem;
}

.stat-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--primary-light);
  color: var(--primary-color);
}

.stat-icon svg {
  width: 24px;
  height: 24px;
}

.stat-copy {
  min-width: 0;
}

.stat-number {
  font-weight: 700;
  color: var(--primary-color);
  margin: 0 0 0.15rem;
  letter-spacing: -0.01em;
  line-height: 1.1;
}

.stat-label {
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--primary-dark);
  margin: 0 0 0.35rem;
  font-size: 0.76rem;
}

.stat-desc {
  color: #666;
  line-height: 1.5;
  font-size: 0.85rem;
  margin: 0;
}

.intro-section {
  background: var(--color-cream);
  padding-top: 3.5rem;
}

.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}

.intro-content {
  order: 1;
}

.intro-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-ink-soft);
  margin: 0;
}

.intro-image-wrap {
  order: 2;
  position: relative;
}

.intro-image-frame {
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 20px 44px -16px rgba(22, 52, 42, 0.3);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.intro-image-frame:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 28px 56px -18px rgba(22, 52, 42, 0.4);
}

.intro-image-frame img {
  width: 100%;
  height: 380px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.intro-image-frame:hover img {
  transform: scale(1.06);
}

.intro-image-accent {
  position: absolute;
  bottom: -1.25rem;
  left: -1.25rem;
  background: var(--primary-color);
  color: #ffffff;
  padding: 1.25rem 1.5rem;
  border-radius: 16px;
  box-shadow: 0 12px 28px -8px rgba(22, 52, 42, 0.35);
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  z-index: 2;
}

.accent-number {
  font-size: 1.6rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
}

.accent-label {
  font-size: 0.78rem;
  font-weight: 600;
  opacity: 0.9;
}

.programs-section {
  background: var(--color-cream-soft);
}

.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}

.check-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.check-grid li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(22, 52, 42, 0.07);
  color: var(--color-ink-soft);
  line-height: 1.5;
  font-size: 0.92rem;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.check-grid li:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -14px rgba(22, 52, 42, 0.25);
  border-color: rgba(22, 52, 42, 0.14);
}

.check-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.check-icon svg {
  width: 11px;
  height: 11px;
}

.photo-duo {
  position: relative;
  min-height: 420px;
}

.col-image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 16px 36px -18px rgba(22, 52, 42, 0.3);
  transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease;
}

.col-image-frame:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 56px -18px rgba(22, 52, 42, 0.35);
}

.col-image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.col-image-frame:hover img {
  transform: scale(1.06);
}

.photo-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 62%;
  height: 320px;
  z-index: 1;
}

.photo-front {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 55%;
  height: 240px;
  z-index: 2;
  box-shadow: 0 20px 44px -16px rgba(22, 52, 42, 0.4);
}

.approach-section {
  padding: 6rem 0;
  background: var(--color-cream-soft);
}

.approach-inner {
  text-align: center;
  max-width: 780px;
}

.approach-text {
  line-height: 1.8;
  color: var(--color-ink-soft);
  font-size: 1.02rem;
  margin: 0 auto 3rem;
}

.testimonial-block {
  max-width: 680px;
  margin: 0 auto;
  padding: 1.75rem 2rem;
  background: #ffffff;
  border-radius: 20px;
  border: 1px solid rgba(22, 52, 42, 0.06);
  box-shadow: 0 10px 24px -14px rgba(22, 52, 42, 0.16);
}

.quote-mark {
  width: 44px;
  height: auto;
  color: var(--primary-color);
  opacity: 0.45;
  margin-bottom: 1rem;
}

.testimonial-block blockquote {
  margin: 0;
}

.quote-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.5rem;
  font-style: italic;
  line-height: 1.6;
  color: var(--primary-dark);
  margin: 0 0 1rem;
}

.quote-cite {
  font-style: normal;
  color: var(--color-ink-soft);
  font-size: 0.92rem;
}

.team-section {
  background: var(--color-cream-soft);
}

.team-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-top: 2rem;
}

.team-card {
  background: #ffffff;
  border-radius: 18px;
  padding: 2rem 1.5rem;
  border: 1px solid rgba(22, 52, 42, 0.06);
  box-shadow: 0 8px 24px -12px rgba(22, 52, 42, 0.12);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
  text-align: center;
}

.team-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 24px 40px -16px rgba(22, 52, 42, 0.22);
  border-color: var(--primary-color);
}

.team-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
  transition:
    background 0.3s ease,
    transform 0.3s ease;
}

.team-card:hover .team-icon-wrap {
  background: var(--primary-color);
  color: #ffffff;
  transform: scale(1.1) rotate(-4deg);
}

.team-icon-wrap svg {
  width: 24px;
  height: 24px;
}

.team-role {
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0 0 0.6rem;
  line-height: 1.3;
}

.team-desc {
  color: var(--color-ink-soft);
  line-height: 1.6;
  font-size: 0.9rem;
  margin: 0;
}

.impact-section {
  background: var(--color-cream);
}

.impact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}

.impact-image-wrap {
  position: relative;
}

.impact-image-frame {
  border-radius: 20px;
  overflow: hidden;
  border: 4px solid #ffffff;
  box-shadow: 0 20px 44px -16px rgba(22, 52, 42, 0.3);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.impact-image-frame:hover {
  transform: translateY(-6px);
  box-shadow: 0 28px 56px -18px rgba(22, 52, 42, 0.4);
}

.impact-image-frame img {
  width: 100%;
  height: 480px;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

.impact-image-frame:hover img {
  transform: scale(1.06);
}

.impact-image-badge {
  position: absolute;
  top: 1.25rem;
  right: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  padding: 0.6rem 1rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--primary-dark);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.impact-image-badge svg {
  width: 18px;
  height: 18px;
  color: var(--primary-color);
  flex-shrink: 0;
}

.impact-text-wrap {
  order: 1;
}

.impact-card-grid {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.impact-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid rgba(22, 52, 42, 0.06);
  box-shadow: 0 8px 20px -12px rgba(22, 52, 42, 0.1);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}

.impact-card:hover {
  transform: translateX(6px);
  box-shadow: 0 16px 32px -14px rgba(22, 52, 42, 0.2);
  border-color: var(--primary-color);
}

.impact-icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}

.impact-icon svg {
  width: 18px;
  height: 18px;
}

.impact-text {
  color: var(--color-ink-soft);
  line-height: 1.55;
  font-size: 0.94rem;
  margin: 0;
}

.cta-section {
  padding: 5rem 0;
  background: var(--color-cream);
}

.cta-inner {
  max-width: 640px;
}

.cta-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.75rem;
}

.cta-title {
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
}

.cta-desc {
  color: var(--color-ink-soft);
  line-height: 1.7;
  margin-bottom: 2rem;
  max-width: 520px;
  margin-left: auto;
  margin-right: auto;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.cta-section .btn--outline {
  background: #ffffff;
  border-color: rgba(22, 52, 42, 0.14);
  color: var(--primary-dark);
}

.cta-section .btn--outline:hover {
  background: var(--primary-light);
  border-color: var(--primary-color);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 1.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  transition:
    background 0.25s ease,
    border-color 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
  white-space: nowrap;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn--primary {
  background: var(--primary-color);
  color: #ffffff;
}

.btn--primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -8px rgba(22, 52, 42, 0.35);
}

.btn--outline {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.25);
  color: #ffffff;
}

.btn--outline:hover {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
}

.btn--large {
  padding: 1rem 2.4rem;
  font-size: 1.02rem;
}

.btn-arrow {
  display: inline-block;
  transition: transform 0.25s ease;
}

.btn:hover .btn-arrow {
  transform: translateX(4px);
}

@media (max-width: 1024px) {
  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .intro-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .intro-content {
    order: 2;
  }

  .intro-image-wrap {
    order: 1;
  }

  .intro-image-frame img {
    height: 300px;
  }

  .intro-image-accent {
    bottom: -1rem;
    left: -1rem;
    padding: 1rem 1.25rem;
  }

  .two-col-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .photo-duo {
    min-height: 340px;
  }

  .photo-back {
    width: 68%;
    height: 260px;
  }

  .photo-front {
    width: 58%;
    height: 190px;
  }

  .impact-layout {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .impact-image-frame img {
    height: 360px;
  }
}

@media (max-width: 768px) {
  .page-header {
    padding: 2.5rem 0 1.5rem;
  }

  .stats-band-wrap {
    padding-top: 1.25rem;
  }

  .stats-band {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 1.5rem;
  }

  .stat-divider {
    display: none;
  }

  .section {
    padding: 3.5rem 0;
  }

  .team-grid {
    grid-template-columns: 1fr 1fr;
  }

  .approach-section {
    padding: 4rem 0;
  }

  .quote-text {
    font-size: 1.25rem;
  }

  .cta-section {
    padding: 3.5rem 0;
  }
}

@media (max-width: 520px) {
  .page-header-title {
    font-size: 1.6rem;
  }

  .page-header-desc {
    font-size: 0.95rem;
  }

  .intro-image-frame img {
    height: 260px;
  }

  .impact-image-frame img {
    height: 280px;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
  }

  .cta-actions .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
