<template>
  <div class="vision-page">
    <!-- Vision Section -->
    <section class="section vision-section">
      <div class="container">
        <div class="section-header reveal-header">
          <span class="section-label">{{ visionLabel }}</span>
          <h2>{{ visionHeading }}</h2>
        </div>
        <div class="vision-grid">
          <div
            v-for="(card, i) in visionCards"
            :key="card.title"
            class="vision-card"
            :class="{ 'card-visible': visibleCards.vision[i] }"
            :style="{ '--delay': `${i * 120}ms` }"
            :ref="(el) => setRef(el, 'vision', i)"
          >
            <div class="icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="card.svgPaths"
              ></svg>
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
            <span class="card-shine"></span>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section mission-section alt-bg">
      <div class="container">
        <div class="mission-layout">
          <div class="mission-content reveal-left" :class="{ visible: missionVisible }">
            <span class="section-label">{{ missionLabel }}</span>
            <h2>{{ missionHeading }}</h2>
            <p class="mission-text">{{ missionBody }}</p>
            <ul class="mission-list">
              <li
                v-for="(item, i) in missionItems"
                :key="i"
                :style="{ '--delay': `${i * 100}ms` }"
                :class="{ visible: missionVisible }"
                class="mission-item-animate"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14813E"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {{ item }}
              </li>
            </ul>
          </div>
          <div class="mission-visual" ref="missionVisualRef">
            <div class="stats-grid">
              <div
                v-for="(stat, i) in stats"
                :key="stat.label"
                class="stat-card"
                :class="{ 'stat-visible': statsVisible }"
                :style="{ '--delay': `${i * 100}ms` }"
              >
                <span class="stat-number">{{ stat.displayed }}</span>
                <span class="stat-label">{{ stat.label }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="section values-section">
      <div class="container">
        <div class="section-header reveal-header">
          <span class="section-label">{{ valueSectionLabel }}</span>
          <h2>{{ valueSectionHeading }}</h2>
          <p class="section-desc" v-if="valueSectionDesc">{{ valueSectionDesc }}</p>
        </div>
        <div class="values-grid">
          <div
            v-for="(val, i) in displayValues"
            :key="val.title"
            class="value-item"
            :class="{ 'value-visible': visibleCards.values[i] }"
            :style="{ '--delay': `${i * 100}ms` }"
            :ref="(el) => setRef(el, 'values', i)"
          >
            <div class="value-number">{{ val.number }}</div>
            <h3>{{ val.title }}</h3>
            <p>{{ val.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container">
        <blockquote class="quote-animate" :class="{ visible: quoteVisible }" ref="quoteRef">
          <svg
            class="quote-icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
            ></path>
            <path
              d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
            ></path>
          </svg>
          <p class="quote-text">
            "Santi Sena means a group of persons working together for peace, livelihood improvement,
            social justice and environmental preservation."
          </p>
          <cite class="quote-source">Santi Sena profile</cite>
          <p v-if="false" class="quote-text">
            "The future belongs to those who believe in the beauty of their dreams. Our vision is
            not just a destination — it is a promise to every community we serve that we will walk
            alongside them until that future becomes reality."
          </p>
          <cite>— SETE SENA Leadership</cite>
        </blockquote>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content cta-animate" :class="{ visible: ctaVisible }" ref="ctaRef">
          <h2>Carry This Vision Into Practical Work</h2>
          <p>
            Partnership, volunteering and support all matter when they strengthen local systems that
            communities can carry forward.
          </p>
          <div class="cta-actions">
            <router-link to="/get-involved" class="btn btn-primary">Get Involved</router-link>
            <router-link to="/about" class="btn btn-outline">Learn About Us</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { supabase } from '@/lib/supabase'

const PAGE_SLUG = 'about-vision'

const defaultVisionCards = [
  {
    title: 'Peace With Justice',
    text: 'A Cambodia where peace, justice and harmony are lived in daily village life, not only written in plans.',
    svgPaths: '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
  },
  {
    title: 'Community Ownership',
    text: 'Villagers, monks, local authorities, schools and community organizations lead the work together.',
    svgPaths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  },
  {
    title: 'Sustainable Livelihoods',
    text: 'Families build better lives through education, child protection, rural income and care for natural resources.',
    svgPaths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  },
]

const visionLabel = ref('Vision')
const visionHeading = ref('What Santi Sena Strives For')
const visionCards = ref([...defaultVisionCards])

const valueSectionLabel = ref('Core Values')
const valueSectionHeading = ref('Values That Guide The Work')
const valueSectionDesc = ref(
  'These values shape how Santi Sena works with communities, donors and partners.',
)

const missionLabel = ref('Mission')
const missionHeading = ref('How The Mission Becomes Practical')
const missionBody = ref(
  'Santi Sena alleviates poverty through community-led development rooted in Buddhist ethics. Its work connects moral leadership with practical programs in education, livelihoods, environment and child protection.',
)
const missionItems = ref([
  'Work with monks, villagers, local government and schools',
  'Strengthen education, savings groups and rural livelihoods',
  'Protect children from trafficking, unsafe migration and exploitation',
  'Preserve community forests, water resources and local resilience',
])

function applyCmsContent(body: string) {
  try {
    const parsed = JSON.parse(body)
    if (parsed?.kind === 'santi-sena-page-content') {
      const striveSection = parsed.sections?.find((s: any) => s.id === 'vision-strive')
      if (striveSection) {
        if (striveSection.label) visionLabel.value = striveSection.label
        if (striveSection.heading) visionHeading.value = striveSection.heading
        if (striveSection.items) {
          const lines = typeof striveSection.items === 'string'
            ? striveSection.items.split('\n').filter((l: string) => l.trim())
            : striveSection.items
          if (lines.length > 0) {
            visionCards.value = lines.map((line: string, i: number) => {
              const [title, ...rest] = line.split('|').map((p: string) => p.trim())
              return {
                title: title || line,
                text: rest.join(' | ') || title || line,
                svgPaths: defaultVisionCards[i]?.svgPaths || defaultVisionCards[0].svgPaths,
              }
            })
          }
        }
      }

      const missionSection = parsed.sections?.find((s: any) => s.id === 'mission-content')
      if (missionSection) {
        if (missionSection.label) missionLabel.value = missionSection.label
        if (missionSection.heading) missionHeading.value = missionSection.heading
        if (missionSection.body) missionBody.value = missionSection.body
        if (missionSection.items) {
          const lines = typeof missionSection.items === 'string'
            ? missionSection.items.split('\n').filter((l: string) => l.trim())
            : missionSection.items
          if (lines.length) missionItems.value = lines.map((l: string) => l.trim())
        }
      }

      const guidesSection = parsed.sections?.find((s: any) => s.id === 'vision-guides')
      if (guidesSection) {
        if (guidesSection.label) valueSectionLabel.value = guidesSection.label
        if (guidesSection.heading) valueSectionHeading.value = guidesSection.heading
        if (guidesSection.items) {
          const lines = typeof guidesSection.items === 'string'
            ? guidesSection.items.split('\n').filter((l: string) => l.trim())
            : guidesSection.items
          if (lines.length) {
            displayValues.value = lines.map((line: string, i: number) => {
              const trimmed = line.trim()
              if (trimmed.includes('|')) {
                const [title, ...rest] = trimmed.split('|').map((p: string) => p.trim())
                return {
                  number: String(i + 1).padStart(2, '0'),
                  title: title || trimmed,
                  text: rest.join(' | '),
                }
              }
              const commaIdx = trimmed.indexOf(',')
              if (commaIdx > 0 && commaIdx < 30) {
                return {
                  number: String(i + 1).padStart(2, '0'),
                  title: trimmed.slice(0, commaIdx).trim(),
                  text: trimmed.slice(commaIdx + 1).trim(),
                }
              }
              return {
                number: String(i + 1).padStart(2, '0'),
                title: trimmed,
                text: '',
              }
            })
            visibleCards.values = Array(lines.length).fill(false)
          }
        }
      }
    }
  } catch {
    // keep fallback
  }
}

async function loadPageContentFromCms() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body')
      .eq('slug', PAGE_SLUG)
      .maybeSingle()

    if (error) throw error
    if (data?.body) applyCmsContent(data.body)
  } catch {
    // keep fallback
  }
}

const statsRaw = [
  { label: 'Founded', end: 1994, suffix: '' },
  { label: 'Villages', end: 293, suffix: '' },
  { label: 'Communes', end: 43, suffix: '' },
  { label: 'Staff', end: 30, suffix: '+' },
]

const stats = reactive(
  statsRaw.map((s) => ({ ...s, displayed: s.end + s.suffix })),
)

const defaultValues = [
  { number: '01', title: 'Honesty', text: 'Clear communication and transparent relationships with donors, communities, partners and staff.' },
  { number: '02', title: 'Non-discrimination', text: 'Respect for people across disability, religion, background, race, community status and political belief.' },
  { number: '03', title: 'Collective Benefit', text: 'Organizational resources and knowledge are used for shared benefit, not private advantage.' },
  { number: '04', title: 'Flexibility', text: 'Plans adapt to community feedback, partner advice, available resources and real field needs.' },
]

const displayValues = ref([...defaultValues])

/* Visibility state */
const visibleCards = reactive({
  vision: Array(defaultVisionCards.length).fill(false),
  values: Array(defaultValues.length).fill(false),
})
const missionVisible = ref(false)
const statsVisible = ref(false)
const quoteVisible = ref(false)
const ctaVisible = ref(false)

/* Refs */
const cardRefs = reactive({ vision: [] as any[], values: [] as any[] })
const missionVisualRef = ref(null)
const quoteRef = ref(null)
const ctaRef = ref(null)

function setRef(el: any, group: string, idx: number) {
  if (el) (cardRefs as any)[group][idx] = el
}

/* Intersection Observer */
const observers: any[] = []

function observe(el: any, callback: () => void, options = {}) {
  if (!el) return
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          callback()
          io.disconnect()
        }
      })
    },
    { threshold: 0.18, ...options },
  )
  io.observe(el)
  observers.push(io)
}

/* Counter animation */
function animateCounter(statObj: any) {
  const duration = 1400
  const start = statObj.end < 100 ? 0 : Math.round(statObj.end * 0.6)
  const step = (statObj.end - start) / (duration / 16)
  let current = start
  const tick = () => {
    current = Math.min(current + step, statObj.end)
    statObj.displayed = Math.round(current) + statObj.suffix
    if (current < statObj.end) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/* Real-time subscription */
let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

function setupRealtimeSubscription() {
  realtimeChannel = supabase
    .channel('about-vision-changes')
    .on(
      'postgres_changes' as any,
      {
        event: '*',
        schema: 'public',
        table: 'pages',
        filter: `slug=eq.${PAGE_SLUG}`,
      },
      (payload: any) => {
        if (payload.new?.body) {
          const body = payload.new.body as string
          visibleCards.vision = []
          visibleCards.values = []
          applyCmsContent(body)
        }
      },
    )
    .subscribe()
}

async function reloadContent() {
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body')
      .eq('slug', PAGE_SLUG)
      .maybeSingle()

    if (error) throw error
    if (data?.body) {
      applyCmsContent(data.body)
    }
  } catch {
    // silent fallback
  }
}

function onVisibilityChange() {
  if (document.visibilityState === 'visible') {
    reloadContent()
  }
}

/* Mount */
onMounted(async () => {
  await loadPageContentFromCms()
  setupRealtimeSubscription()
  document.addEventListener('visibilitychange', onVisibilityChange)

  cardRefs.vision.forEach((el: any, i: number) => {
    observe(el, () => {
      setTimeout(() => {
        visibleCards.vision[i] = true
      }, i * 120)
    })
  })

  observe(document.querySelector('.mission-content'), () => {
    missionVisible.value = true
  })

  observe(missionVisualRef.value, () => {
    statsVisible.value = true
    statsRaw.forEach((raw, i) => {
      setTimeout(() => animateCounter(stats[i]), i * 120)
    })
  })

  cardRefs.values.forEach((el: any, i: number) => {
    observe(el, () => {
      setTimeout(() => {
        visibleCards.values[i] = true
      }, i * 100)
    })
  })

  observe(quoteRef.value, () => {
    quoteVisible.value = true
  })

  observe(ctaRef.value, () => {
    ctaVisible.value = true
  })
})

onBeforeUnmount(() => {
  observers.forEach((io) => io.disconnect())
  document.removeEventListener('visibilitychange', onVisibilityChange)
  if (realtimeChannel) {
    supabase.removeChannel(realtimeChannel)
  }
})
</script>

<style scoped>
/* Layout Helpers */
.vision-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-family-base);
}

/* Dark mode override */
html.dark .vision-page,
:root.dark .vision-page,
.admin-dark .vision-page {
  --color-cream: #0f1a16;
  --color-cream-soft: #13211b;
  --color-white: #1a2c24;
  --color-ink: #e6f0eb;
  --color-ink-soft: #a0bcb0;
  --color-border: #244033;
  --primary-color: #4ade80;
  --primary-dark: #74e0ae;
  --primary-light: #1a3d2e;
  background: var(--color-cream);
  color: var(--color-ink);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.reveal-header {
  opacity: 0;
  transform: translateY(-18px);
  animation: fadeInDown 0.7s ease forwards 0.1s;
}

@keyframes fadeInDown {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.vision-section,
.values-section {
  background: var(--color-cream-soft);
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  border: 0px solid color-mix(in srgb, var(--primary-dark) 25%, transparent);
  border-radius: 9999px;
  background: color-mix(in srgb, 8%, transparent);
}

.section-header h2 {
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
}

.section-desc {
  color: var(--color-ink-soft);
  font-size: 1rem;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

.alt-bg {
  background: var(--color-cream-soft);
}

/* Hero */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.82) 0%,
    rgba(6, 18, 13, 0.5) 42%,
    rgba(6, 18, 13, 0.18) 72%,
    transparent 100%
  );
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 720px;
  margin: 0;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: none;
}

.hero-content h1 {
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  max-width: 600px;
  margin: 0;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}

/* Vision Grid */
.vision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.vision-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  cursor: default;
  opacity: 0;
  transform: translateY(36px) scale(0.97);
  transition:
    opacity 0.55s ease var(--delay, 0ms),
    transform 0.55s cubic-bezier(0.34, 1.36, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.35s;
}

.vision-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.vision-card:hover {
  border-color: color-mix(in srgb, var(--primary-dark) 35%, transparent);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.07),
    0 0 0 3px color-mix(in srgb, var(--primary-dark) 8%, transparent);
  transform: translateY(-6px) scale(1.015);
}

.card-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 40%, rgba(255, 255, 255, 0.45) 50%, transparent 60%);
  background-size: 200% 100%;
  background-position: 200% 0;
  transition: background-position 0.6s ease;
  pointer-events: none;
  border-radius: inherit;
}

.vision-card:hover .card-shine {
  background-position: -200% 0;
}

.icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--primary-light);
  color: var(--primary-dark);
  margin-bottom: 1.25rem;
  transition: transform 0.35s cubic-bezier(0.34, 1.6, 0.64, 1), background 0.3s;
}

.vision-card:hover .icon-wrapper {
  transform: scale(1.15) rotate(-4deg);
  background: color-mix(in srgb, var(--primary-dark) 14%, transparent);
}

.vision-card h3 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-ink);
  transition: color 0.25s;
}

.vision-card:hover h3 {
  color: var(--primary-dark);
}

.vision-card p {
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  line-height: 1.65;
}

/* Mission */
.mission-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.reveal-left {
  opacity: 0;
  transform: translateX(-40px);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
}

.reveal-left.visible {
  opacity: 1;
  transform: translateX(0);
}

.mission-content h2 {
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-ink);
  margin-bottom: 1rem;
}

.mission-text {
  color: var(--color-ink-soft);
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.mission-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mission-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-ink);
}

.mission-item-animate {
  opacity: 0;
  transform: translateX(-18px);
  transition:
    opacity 0.45s ease calc(var(--delay, 0ms) + 200ms),
    transform 0.45s ease calc(var(--delay, 0ms) + 200ms);
}

.mission-item-animate.visible {
  opacity: 1;
  transform: translateX(0);
}

.mission-list li svg {
  flex-shrink: 0;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 1.75rem 1.5rem;
  text-align: center;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px) scale(0.96);
  transition:
    opacity 0.5s ease var(--delay, 0ms),
    transform 0.5s cubic-bezier(0.34, 1.4, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.3s;
}

.stat-card.stat-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.stat-card:hover {
  border-color: color-mix(in srgb, var(--primary-dark) 30%, transparent);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.07);
  transform: translateY(-4px) scale(1.02);
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
  transition: transform 0.3s;
}

.stat-card:hover .stat-number {
  transform: scale(1.08);
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

/* Values */
.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.value-item {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 2rem 1.5rem;
  position: relative;
  overflow: hidden;
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.5s ease var(--delay, 0ms),
    transform 0.5s cubic-bezier(0.34, 1.3, 0.64, 1) var(--delay, 0ms),
    border-color 0.3s,
    box-shadow 0.3s;
}

.value-item.value-visible {
  opacity: 1;
  transform: translateY(0);
}

.value-item:hover {
  border-color: color-mix(in srgb, var(--primary-dark) 28%, transparent);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.06);
  transform: translateY(-5px);
}

.value-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary-dark);
  transform: scaleY(0);
  transform-origin: bottom;
  transition: transform 0.35s ease;
  border-radius: 0 2px 2px 0;
}

.value-item:hover::before {
  transform: scaleY(1);
}

.value-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.value-item h3 {
  font-weight: 600;
  margin-bottom: 0.6rem;
  color: var(--color-ink);
  transition: color 0.25s;
}

.value-item:hover h3 {
  color: var(--primary-dark);
}

.value-item p {
  font-size: 0.88rem;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

/* Quote */
.quote-section {
  padding: 4rem 0;
  background: var(--color-cream-soft);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.quote-animate {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
  opacity: 0;
  transform: scale(0.96) translateY(20px);
  transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.25, 1, 0.5, 1);
}

.quote-animate.visible {
  opacity: 1;
  transform: scale(1) translateY(0);
}

.quote-icon {
  color: var(--primary-dark);
  opacity: 0.2;
  margin-bottom: 1rem;
  animation: floatIcon 4s ease-in-out infinite;
}

@keyframes floatIcon {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--color-ink);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.quote-section cite {
  font-style: normal;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.quote-section cite:not(.quote-source) {
  display: none;
}

/* CTA */
.cta-section {
  padding: 4rem 0;
  background: var(--color-cream-soft);
}

.cta-animate {
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1.5rem;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
}

.cta-animate.visible {
  opacity: 1;
  transform: translateY(0);
}

.cta-content h2 {
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
}

.cta-content p {
  color: var(--color-ink);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.25s cubic-bezier(0.34, 1.4, 0.64, 1);
  cursor: pointer;
  text-decoration: none;
}

.btn:hover {
  transform: translateY(-2px) scale(1.04);
}

.btn:active {
  transform: translateY(0) scale(0.98);
}

.btn-primary {
  background: var(--primary-color);
  color: #ffffff;
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-primary:hover {
  background: var(--primary-dark);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.14);
}

.btn-outline {
  background: transparent;
  color: var(--color-ink);
  border: 1px solid var(--color-border);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.btn-outline:hover {
  border-color: var(--color-ink-soft);
  background: color-mix(in srgb, var(--color-ink) 6%, transparent);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* Responsive */
@media (max-width: 1024px) {
  .vision-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 1.05rem;
  }
  .mission-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .section {
    padding: 3rem 0;
  }
  .vision-grid {
    grid-template-columns: 1fr;
  }
  .values-grid {
    grid-template-columns: 1fr;
  }
  .btn-outline {
    border-color: var(--color-border);
    color: var(--color-ink-soft);
  }
  .btn-outline:hover {
    border-color: var(--color-ink-soft);
    background: color-mix(in srgb, var(--color-ink) 6%, transparent);
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 55vh;
    padding: 3rem 1.25rem;
  }
  .stats-grid {
    gap: 0.75rem;
  }
  .stat-card {
    padding: 1.25rem 1rem;
  }
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
