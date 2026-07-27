<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { imageUrls } from '@/lib/imageUrls'
import { supabase } from '@/lib/supabase'

/* ─── Fallback data ────────────────────────────── */
const FALLBACK_STATS = [
  {
    number: '180+',
    label: 'SAVINGS GROUPS',
    description: 'Women-led Saving-for-Change circles active across three provinces.',
    icon: 'wallet',
  },
  {
    number: '2,400+',
    label: 'MEMBERS',
    description: 'Saving, lending and investing together.',
    icon: 'users',
  },
  {
    number: '12',
    label: 'COOPERATIVES',
    description: 'Rice, vegetables, melaleuca oil and handicrafts.',
    icon: 'building',
  },
]

// Inline SVG paths for the stat icons — no external icon library needed.
// Keyed by the same strings used in `stats[i].icon`.
const statIcons: Record<string, string> = {
  wallet: `<path d="M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1h-3.5a3.5 3.5 0 0 0 0 7H19v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z"/><circle cx="15.5" cy="12" r="1.3" fill="currentColor" stroke="none"/>`,
  users: `<circle cx="9" cy="8" r="3"/><path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5"/><circle cx="17" cy="9" r="2.2"/><path d="M15 14.3c2.2.4 4 2.3 4 5.2"/>`,
  building: `<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/><path d="M10 21v-4h4v4"/>`,
}

const heroImageValue = ref(imageUrls.programs.livelihoodHero3)
const quoteBackground = computed(() => `url(${heroImageValue.value})`)

interface WorkItem {
  title: string
  text: string
  image: string
}

const FALLBACK_WHAT_WE_DO: WorkItem[] = [
  {
    title: 'Integrated Farming',
    text: 'Rice, fish, vegetables and livestock combined on one plot for year-round food and income.',
    image: '/images/programs/livelihood-hero1.jpg',
  },
  {
    title: 'Saving-for-Change',
    text: 'Self-help savings groups, primarily women-led, meeting weekly to pool and lend.',
    image: '/images/programs/livelihood-hero2.jpg',
  },
  {
    title: 'Cooperatives',
    text: 'Agricultural cooperatives for collective bargaining and shared equipment.',
    image: '/images/programs/livelihood-hero3.jpg',
  },
  {
    title: 'Rural Enterprise',
    text: 'Small enterprise development — melaleuca oil, honey and handicrafts.',
    image: '/images/programs/livelihood-hero3.jpg',
  },
  {
    title: 'Financial Literacy',
    text: 'Bookkeeping and micro-enterprise training for household budgeting.',
    image: '/images/programs/livelihood-hero2.jpg',
  },
  {
    title: 'Market Linkages',
    text: 'Connecting producers with provincial buyers and social enterprises.',
    image: '/images/programs/livelihood-hero3.jpg',
  },
]

const FALLBACK_WHY_IT_MATTERS = [
  {
    text: 'Household income diversification reduces the risk of debt bondage and trafficking',
    icon: 'shield-halved',
    image: '/images/programs/livelihood-hero1.jpg',
  },
  {
    text: 'Women-led savings shift decision-making power inside the household',
    icon: 'key',
    image: '/images/programs/livelihood-hero2.jpg',
  },
  {
    text: 'Cooperatives break the isolation of the smallholder in the marketplace',
    icon: 'users',
    image: '/images/programs/livelihood-hero3.jpg',
  },
  {
    text: 'Local enterprise keeps young adults in the village, near their children',
    icon: 'house',
    image: '/images/programs/livelihood-hero1.jpg',
  },
]

const FALLBACK_TEAM_CARDS = [
  {
    role: 'Program Director',
    desc: 'Oversees livelihood programs, savings groups, and enterprise partnerships across provinces.',
    icon: 'compass',
  },
  {
    role: 'Field Coordinators',
    desc: 'Manage Saving-for-Change groups and cooperative development in target villages.',
    icon: 'map',
  },
  {
    role: 'Agricultural Trainers',
    desc: 'Deliver farmer field schools and climate-smart agriculture training.',
    icon: 'heart',
  },
  {
    role: 'Enterprise Officers',
    desc: 'Support small business development, market linkages and financial literacy.',
    icon: 'chart',
  },
]

/* ─── Dynamic data from DB ─────────────────────── */
const dynamicStats = ref<Array<{ number: string; label: string; description: string; icon: string }>>(FALLBACK_STATS)
const whatWeDoItems = ref<WorkItem[]>(FALLBACK_WHAT_WE_DO)
const whyMattersItems = ref<Array<{ text: string; icon: string; image: string }>>(FALLBACK_WHY_IT_MATTERS)
const teamCards = ref(FALLBACK_TEAM_CARDS)
const approachText = ref(
  'We do not distribute cash. We build the systems — saving groups, cooperatives, farmer schools — that let a household earn, save, invest and repeat. Every group is coached for 18–24 months, then graduates to independence with our field team on call.'
)
const introText = ref(
  'Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena answers with income at home — soil restored, savings pooled, cooperatives negotiating fair prices, and small enterprises rooted in local resources.'
)
const pageEyebrow = ref('Livelihood')
const pageTitle = ref('Growing practical income and food security.')

const quoteText = ref(
  'Our group has lent to twelve families for chickens and school fees. Nobody has left for Thailand this year.'
)

// modal state for "Why it matters" cards — clicking a card opens its image + text large in a popup
const activeImpactItem = ref<{ text: string; icon: string; image: string } | null>(null)

function openImpactModal(item: (typeof FALLBACK_WHY_IT_MATTERS)[number]) {
  activeImpactItem.value = item
}
function closeImpactModal() {
  activeImpactItem.value = null
}

const radialWrap = ref<HTMLElement | null>(null)
const statsBandEl = ref<HTMLElement | null>(null)
const introEl = ref<HTMLElement | null>(null)
const quoteInnerEl = ref<HTMLElement | null>(null)
const impactWrapEl = ref<HTMLElement | null>(null)

let radialObserver: IntersectionObserver | null = null
let revealObserver: IntersectionObserver | null = null
let countObserver: IntersectionObserver | null = null

// Splits a stat string like "2,400+" into a numeric target (2400) and the
// trailing suffix ("+") so the number can be counted up and re-assembled.
function parseStatNumber(raw: string) {
  const suffix = raw.match(/[^0-9,]+$/)?.[0] ?? ''
  const numeric = Number(raw.replace(/[^0-9]/g, ''))
  return { numeric, suffix }
}

// Eases a number from 0 up to its target over ~1.1s using requestAnimationFrame.
function animateCount(el: HTMLElement, target: number, suffix: string) {
  const duration = 1100
  const startTime = performance.now()
  const step = (now: number) => {
    const progress = Math.min((now - startTime) / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.round(target * eased)
    el.textContent = current.toLocaleString('en-US') + suffix
    if (progress < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

/* ─── Parse page body JSON into reactive refs ─── */
function applyPageBody(body: string) {
  try {
    const parsed = JSON.parse(body) as Record<string, unknown>
    if (parsed.kind !== 'santi-sena-page-content') return

    const sections = parsed.sections as Array<Record<string, unknown>> | undefined
    if (!Array.isArray(sections)) return

    // Stats — from 'livelihood-stats' section items
    const statsSection = sections.find((s) => s.id === 'livelihood-stats')
    if (statsSection && typeof statsSection.items === 'string' && statsSection.items.trim()) {
      const lines = statsSection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        dynamicStats.value = lines.map((line: string) => {
          const label = line.toUpperCase()
          const icon = label.includes('GROUP') || label.includes('SAVING') ? 'wallet'
            : label.includes('MEMBER') || label.includes('FAMILY') ? 'users'
            : 'building'
          return {
            number: line.match(/^[\d,+]+\.?/)?.[0] || '',
            label: line.replace(/^[\d,+]+\s*/, '').toUpperCase() || label,
            description: line,
            icon,
          }
        })
      }
    }

    // What we do — from 'livelihood-work' section items
    const workSection = sections.find((s) => s.id === 'livelihood-work')
    if (workSection && typeof workSection.items === 'string' && workSection.items.trim()) {
      const lines = workSection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        const defaultText = (typeof workSection.body === 'string' && workSection.body.trim()) ? workSection.body : ''
        whatWeDoItems.value = lines.map((title: string, i: number) => ({
          title,
          text: defaultText || FALLBACK_WHAT_WE_DO[i]?.text || '',
          image: FALLBACK_WHAT_WE_DO[i % FALLBACK_WHAT_WE_DO.length]?.image || imageUrls.programs.livelihoodHero1,
        }))
      }
    }

    // Why it matters — from 'livelihood-why' section items
    const whySection = sections.find((s) => s.id === 'livelihood-why')
    if (whySection && typeof whySection.items === 'string' && whySection.items.trim()) {
      const lines = whySection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        whyMattersItems.value = lines.map((text: string, i: number) => ({
          text,
          icon: FALLBACK_WHY_IT_MATTERS[i]?.icon || 'shield-halved',
          image: FALLBACK_WHY_IT_MATTERS[i % FALLBACK_WHY_IT_MATTERS.length]?.image || imageUrls.programs.livelihoodHero1,
        }))
      }
    }

    // Approach — from 'livelihood-approach' section body
    const approachSection = sections.find((s) => s.id === 'livelihood-approach')
    if (approachSection && typeof approachSection.body === 'string' && approachSection.body.trim()) {
      approachText.value = approachSection.body.trim()
    }

    // Team / Organizational Structure — from 'livelihood-team' section items
    const teamSection = sections.find((s) => s.id === 'livelihood-team')
    if (teamSection && typeof teamSection.items === 'string' && teamSection.items.trim()) {
      const lines = teamSection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        teamCards.value = lines.map(line => {
          const parts = line.split('|').map((p: string) => p.trim())
          return {
            role: parts[0] || '',
            icon: parts[1] || 'chart',
            desc: parts[2] || parts[0] || '',
          }
        })
      }
    }

    // Quote — from metadata quoteContent (only in applyProgramMetadata)
    // (applyPageBody doesn't have quoteContent in pages table schema)
  } catch {
    // Invalid JSON — keep fallbacks
  }
}

/* ─── Load from programs table metadata ───────── */
function applyProgramMetadata(meta: Record<string, unknown>) {
  // Hero image — from meta.heroImageUrl (saved by admin dashboard)
  if (typeof meta.heroImageUrl === 'string' && meta.heroImageUrl.trim()) {
    heroImageValue.value = meta.heroImageUrl.trim()
  }

  // Page title / eyebrow / intro
  if (typeof meta.eyebrow === 'string' && meta.eyebrow.trim()) pageEyebrow.value = meta.eyebrow.trim()
  if (typeof meta.headline === 'string' && meta.headline.trim()) pageTitle.value = meta.headline.trim()
  if (typeof meta.intro === 'string' && meta.intro.trim()) introText.value = meta.intro.trim()

  // Gallery images — from meta.gallery (array of {label, url} like Education)
  let galleryUrls: string[] = []
  if (Array.isArray(meta.gallery) && meta.gallery.length > 0) {
    galleryUrls = meta.gallery
      .map((g: Record<string, unknown>) => typeof g.url === 'string' ? g.url.trim() : '')
      .filter(Boolean)
  }

  // Quote — from meta.quoteContent.text
  if (meta.quoteContent && typeof meta.quoteContent === 'object') {
    const qc = meta.quoteContent as Record<string, unknown>
    if (typeof qc.text === 'string' && qc.text.trim()) {
      quoteText.value = qc.text.trim()
    }
  }

  // Stats band
  if (Array.isArray(meta.statsBand) && meta.statsBand.length > 0) {
    dynamicStats.value = meta.statsBand.map((s: Record<string, unknown>) => {
      const label = String(s.label ?? '')
      const icon = label.includes('GROUP') || label.includes('SAVING') ? 'wallet'
        : label.includes('MEMBER') || label.includes('FAMILY') ? 'users'
        : 'building'
      return {
        number: String(s.number ?? ''),
        label,
        description: String(s.description ?? ''),
        icon,
      }
    })
  }

  // Sections
  if (Array.isArray(meta.sections)) {
    const sections = meta.sections as Array<Record<string, unknown>>

    // What we do — from 'livelihood-work' section items
    const workSection = sections.find((s) => s.id === 'livelihood-work')
    if (workSection && typeof workSection.items === 'string' && workSection.items.trim()) {
      const lines = workSection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        const defaultText = (typeof workSection.body === 'string' && workSection.body.trim()) ? workSection.body : ''
        whatWeDoItems.value = lines.map((title: string, i: number) => ({
          title,
          text: defaultText || FALLBACK_WHAT_WE_DO[i]?.text || '',
          image: galleryUrls[i] || FALLBACK_WHAT_WE_DO[i % FALLBACK_WHAT_WE_DO.length]?.image || imageUrls.programs.livelihoodHero1,
        }))
      }
    }

    // Why it matters — from 'livelihood-why' section items
    const whySection = sections.find((s) => s.id === 'livelihood-why')
    if (whySection && typeof whySection.items === 'string' && whySection.items.trim()) {
      const lines = whySection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        whyMattersItems.value = lines.map((text: string, i: number) => ({
          text,
          icon: FALLBACK_WHY_IT_MATTERS[i]?.icon || 'shield-halved',
          image: galleryUrls[(FALLBACK_WHAT_WE_DO.length) + i] || FALLBACK_WHY_IT_MATTERS[i % FALLBACK_WHY_IT_MATTERS.length]?.image || imageUrls.programs.livelihoodHero1,
        }))
      }
    }

    // Approach — from 'livelihood-approach' section body
    const approachSection = sections.find((s) => s.id === 'livelihood-approach')
    if (approachSection && typeof approachSection.body === 'string' && approachSection.body.trim()) {
      approachText.value = approachSection.body.trim()
    }

    // Team / Organizational Structure — from 'livelihood-team' section items
    const teamSection = sections.find((s) => s.id === 'livelihood-team')
    if (teamSection && typeof teamSection.items === 'string' && teamSection.items.trim()) {
      const lines = teamSection.items.split('\n').map((l: string) => l.trim()).filter(Boolean)
      if (lines.length > 0) {
        teamCards.value = lines.map(line => {
          const parts = line.split('|').map((p: string) => p.trim())
          return {
            role: parts[0] || '',
            icon: parts[1] || 'chart',
            desc: parts[2] || parts[0] || '',
          }
        })
      }
    }
  }
}

async function loadFromProgramsTable() {
  try {
    const { data, error } = await supabase
      .from('programs')
      .select('metadata')
      .eq('slug', 'programs-livelihood')
      .maybeSingle()

    if (error) {
      console.warn('[LivelihoodView] Programs load failed:', error.message)
      return
    }

    if (data && data.metadata) {
      applyProgramMetadata(data.metadata as Record<string, unknown>)
    }
  } catch (e) {
    console.warn('[LivelihoodView] Programs load crashed:', e)
  }
}

/* ─── Load from pages table ───────────────────── */
async function loadFromDb() {
  // Optional legacy `pages` body applies first as a base layer.
  try {
    const { data, error } = await supabase
      .from('pages')
      .select('body')
      .eq('slug', 'programs-livelihood')
      .maybeSingle()

    if (error) {
      console.warn('[LivelihoodView] DB load failed:', error.message)
    } else if (data && data.body) {
      applyPageBody(data.body as string)
    }
  } catch (e) {
    console.warn('[LivelihoodView] DB load crashed:', e)
  }

  // The programs table metadata (edited from the admin Livelihood dashboard)
  // is always applied last, so admin edits are the source of truth for this
  // page — matching the Education program flow.
  await loadFromProgramsTable()
}

/* ─── Real-time subscription ───────────────────── */
let realtimeChannelLivelihood: ReturnType<typeof supabase.channel> | null = null
let realtimeProgramsChannel: ReturnType<typeof supabase.channel> | null = null

function setupRealtime() {
  realtimeChannelLivelihood = supabase
    .channel('livelihood-page-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'pages',
        filter: 'slug=eq.programs-livelihood',
      },
      (payload) => {
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const row = payload.new as Record<string, unknown>
          if (typeof row.body === 'string') {
            applyPageBody(row.body)
          }
        }
      },
    )
    .subscribe()

  // Also subscribe to programs table changes
  realtimeProgramsChannel = supabase
    .channel('livelihood-programs-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'programs',
        filter: 'slug=eq.programs-livelihood',
      },
      (payload) => {
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && payload.new) {
          const row = payload.new as Record<string, unknown>
          if (row.metadata) {
            applyProgramMetadata(row.metadata as Record<string, unknown>)
          }
        }
      },
    )
    .subscribe()
}

onMounted(() => {
  void loadFromDb()
  setupRealtime()

  // "What we do" satellite gallery: toggling the class (rather than
  // unobserving) means each photo/orbit item fades in scrolling down AND
  // fades back out + replays scrolling back up past the section.
  const radialItems = radialWrap.value?.querySelectorAll('.radial-center, .radial-item')
  if (radialItems) {
    radialObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('is-visible', entry.isIntersecting)
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -60px 0px' },
    )
    radialItems.forEach((el) => radialObserver?.observe(el))
  }

  // Stats band, intro, quote and impact-grid sections all reveal the same
  // bidirectional way — fade/slide in on the way down, fade/slide back out
  // and replay on the way back up.
  const revealTargets = [
    statsBandEl.value,
    introEl.value,
    quoteInnerEl.value,
    impactWrapEl.value,
  ].filter((el): el is HTMLElement => el !== null)

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting)
      })
    },
    { threshold: 0.2, rootMargin: '-6% 0px -6% 0px' },
  )
  revealTargets.forEach((el) => revealObserver?.observe(el))

  // Stat numbers count up from 0 the first time the band scrolls into view.
  if (statsBandEl.value) {
    const numberEls = statsBandEl.value.querySelectorAll<HTMLElement>('.stat-number')
    countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            numberEls.forEach((el, i) => {
              const { numeric, suffix } = parseStatNumber(dynamicStats.value[i]?.number ?? '0')
              animateCount(el, numeric, suffix)
            })
            countObserver?.disconnect()
          }
        })
      },
      { threshold: 0.4 },
    )
    countObserver.observe(statsBandEl.value)
  }
})

onBeforeUnmount(() => {
  radialObserver?.disconnect()
  revealObserver?.disconnect()
  countObserver?.disconnect()
  if (realtimeChannelLivelihood) {
    supabase.removeChannel(realtimeChannelLivelihood)
    realtimeChannelLivelihood = null
  }
  if (realtimeProgramsChannel) {
    supabase.removeChannel(realtimeProgramsChannel)
    realtimeProgramsChannel = null
  }
})
</script>

<template>
  <div class="education-page">

    <!-- Page header -->
    <div class="page-header">
      <div class="container">
        <p class="page-header-eyebrow">{{ pageEyebrow }}</p>
        <h1 class="page-header-title">{{ pageTitle }}</h1>
      </div>
    </div>

    <!-- Stats band — bridges hero into content -->
    <div class="container stats-band-wrap">
      <div class="stats-band" ref="statsBandEl">
        <template v-for="(stat, i) in dynamicStats" :key="i + '-' + stat.label">
          <div class="stat-item">
            <span class="stat-icon">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                v-html="statIcons[stat.icon]"
              ></svg>
            </span>
            <div class="stat-copy">
              <h2 class="stat-number">{{ stat.number }}</h2>
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-desc">{{ stat.description }}</p>
            </div>
          </div>
          <div v-if="i < dynamicStats.length - 1" class="stat-divider" aria-hidden="true"></div>
        </template>
      </div>
    </div>

    <!-- Intro -->
    <section class="section-cream intro-section">
      <div class="container" ref="introEl">
        <div class="intro-rule" aria-hidden="true"></div>
        <p class="intro-text text-center">{{ introText }}</p>
      </div>
    </section>

    <!-- What we do — scattered gallery: central photo + items positioned around it -->
    <section class="section-light">
      <div class="container">
        <div class="do-section">
          <p class="section-eyebrow">Our work</p>
          <h2 class="section-title">What we do</h2>

          <div class="radial-wrap" ref="radialWrap">
            <div class="radial-center">
              <img :src="whatWeDoItems[0]?.image" alt="" />
              <p class="radial-center-text">{{ whatWeDoItems[0]?.text }}</p>
            </div>

            <div class="radial-item radial-item--1">
              <div class="radial-thumb"><img :src="whatWeDoItems[1]?.image" alt="" /></div>
              <div class="radial-copy">
                <p class="radial-title">{{ whatWeDoItems[1]?.title }}</p>
                <p class="radial-text">{{ whatWeDoItems[1]?.text }}</p>
              </div>
            </div>

            <div class="radial-item radial-item--2">
              <div class="radial-thumb"><img :src="whatWeDoItems[2]?.image" alt="" /></div>
              <div class="radial-copy">
                <p class="radial-title">{{ whatWeDoItems[2]?.title }}</p>
                <p class="radial-text">{{ whatWeDoItems[2]?.text }}</p>
              </div>
            </div>

            <div class="radial-item radial-item--3">
              <div class="radial-thumb"><img :src="whatWeDoItems[3]?.image" alt="" /></div>
              <div class="radial-copy">
                <p class="radial-title">{{ whatWeDoItems[3]?.title }}</p>
                <p class="radial-text">{{ whatWeDoItems[3]?.text }}</p>
              </div>
            </div>

            <div class="radial-item radial-item--4">
              <div class="radial-thumb"><img :src="whatWeDoItems[4]?.image" alt="" /></div>
              <div class="radial-copy">
                <p class="radial-title">{{ whatWeDoItems[4]?.title }}</p>
                <p class="radial-text">{{ whatWeDoItems[4]?.text }}</p>
              </div>
            </div>

            <div class="radial-item radial-item--5">
              <div class="radial-thumb"><img :src="whatWeDoItems[5]?.image" alt="" /></div>
              <div class="radial-copy">
                <p class="radial-title">{{ whatWeDoItems[5]?.title }}</p>
                <p class="radial-text">{{ whatWeDoItems[5]?.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our approach — full-bleed photo statement -->
    <section class="quote-section" :style="{ backgroundImage: quoteBackground }">
      <div class="quote-overlay"></div>
      <div class="container quote-inner" ref="quoteInnerEl">
        <p class="section-eyebrow section-eyebrow--light text-center">Our method</p>
        <h2 class="section-title section-title--light text-center">Our approach</h2>
        <p class="approach-text approach-text--light text-center">{{ approachText }}</p>

        <div class="quote-block">
          <svg
            class="quote-mark-svg"
            viewBox="0 0 48 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M0 36V20.8C0 8.6 6.9 1.4 18.4 0l2 5.4c-7 1.9-10.5 6.2-10.5 12.9h9.1V36H0zm27.6 0V20.8c0-12.2 6.9-19.4 18.4-20.8l2 5.4c-7 1.9-10.5 6.2-10.5 12.9h9.1V36H27.6z"
              fill="currentColor"
            />
          </svg>
          <p class="quote-text">
            "{{ quoteText }}"
          </p>
        </div>
      </div>
    </section>

    <!-- Team / Organizational Structure -->
    <section class="section-cream">
      <div class="container">
        <div class="text-center">
          <p class="section-eyebrow">Organizational Structure</p>
          <h2 class="section-title">Who delivers livelihood programs on the ground</h2>
        </div>

        <div class="team-grid">
          <div v-for="(member, index) in teamCards" :key="member.role" class="team-card" :style="{ transitionDelay: `${index * 0.08}s` }">
            <div class="team-icon-wrap">
              <svg v-if="member.icon === 'compass'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.6" />
                <path d="M16 8l-3 5-5 3 3-5 5-3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
              <svg v-else-if="member.icon === 'map'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
                <circle cx="12" cy="9" r="2.5" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <svg v-else-if="member.icon === 'heart'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21l-1.5-1.4C5.4 15.4 2 12.3 2 8.5 2 5.4 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1A5.7 5.7 0 0116.5 3C19.6 3 22 5.4 22 8.5c0 3.8-3.4 6.9-8.5 11.1L12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 20v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
                <circle cx="10" cy="7" r="4" stroke="currentColor" stroke-width="1.6" />
                <path d="M18 8l3 3 3-3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3 class="team-role">{{ member.role }}</h3>
            <p class="team-desc">{{ member.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why it matters — image + impact card grid (text overlaid on image, like the reference design) -->
    <section class="section-cream">
      <div class="container">
        <div class="col-text col-text--full" ref="impactWrapEl">
          <p class="section-eyebrow">Our impact</p>
          <h2 class="section-title">Why it matters</h2>
          <div class="impact-grid">
            <div
              v-for="item in whyMattersItems"
              :key="'why-' + item.text"
              class="impact-card"
              role="button"
              tabindex="0"
              @click="openImpactModal(item)"
              @keydown.enter="openImpactModal(item)"
            >
              <img :src="item.image" alt="" class="impact-card-img" />
              <div class="impact-card-overlay">
                <p class="impact-card-text">{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <!-- Popup: shows the clicked card's image with its text large and clear -->
    <Teleport to="body">            <div v-if="activeImpactItem"
        class="impact-modal-overlay"
        @click.self="closeImpactModal"
      >
        <div class="impact-modal">
          <button
            class="impact-modal-close"
            type="button"
            aria-label="Close"
            @click="closeImpactModal"
          >
            ✕
          </button>
          <div class="impact-modal-media">
            <img :src="activeImpactItem.image" alt="" />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* ===== Hero ===== */
.hero-wrap {
  position: relative;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.85) 0%,
    rgba(6, 18, 13, 0.55) 42%,
    rgba(6, 18, 13, 0.22) 70%,
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
  max-width: 600px;
  color: white;
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
.eyebrow {
  color: var(--primary-light);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.hero-content h1 {
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
  color: white;
}
.hero-desc {
  line-height: 1.6;
  opacity: 0.95;
}

/* Scroll cue */
.scroll-cue {
  position: absolute;
  bottom: 1.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  width: 26px;
  height: 42px;
  border: 2px solid rgba(255, 255, 255, 0.55);
  border-radius: 999px;
  display: flex;
  justify-content: center;
  padding-top: 7px;
}
.scroll-cue span {
  width: 4px;
  height: 8px;
  border-radius: 999px;
  background: #ffffff;
  animation: scrollDrop 1.8s ease-in-out infinite;
}
@keyframes scrollDrop {
  0% {
    opacity: 0;
    transform: translateY(0);
  }
  30% {
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(12px);
  }
}

/* ===== Stats band ===== */
.stats-band-wrap {
  position: relative;
  z-index: 4;
  margin-top: 1rem;
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
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: var(--primary-light);
  color: var(--primary-color);
}
.stat-icon :deep(.svg-inline--fa) {
  width: 20px;
  height: 20px;
}
.stat-icon svg {
  width: 20px;
  height: 20px;
}
.stat-copy {
  min-width: 0;
}
.stat-number {
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  font-weight: 700;
  letter-spacing: 0.06em;
  color: var(--primary-dark);
  margin-bottom: 0.4rem;
  font-size: 0.78rem;
}
.stat-desc {
  color: #666;
  line-height: 1.5;
  font-size: 0.88rem;
}

.page-header {
  background: var(--color-cream-soft, var(--color-cream));
  padding: 3.5rem 0 2.5rem;
  text-align: center;
  border-bottom: 1px solid rgba(22, 52, 42, 0.08);
}

.page-header-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.6rem;
}

.page-header-title {
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--primary-dark);
  max-width: 720px;
  margin: 0 auto;
}

/* ===== Cream / light sections ===== */
.section-cream {
  background: var(--color-cream);
  padding: 4.5rem 0;
}
.section-light {
  background: #f2f5ee;
  padding: 4.5rem 0;
}
.intro-section {
  padding-top: 3.25rem;
  text-align: center;
}
.intro-rule {
  width: 56px;
  height: 3px;
  border-radius: 999px;
  background: var(--primary-color);
  margin: 0 auto 1.75rem;
}
.intro-text {
  line-height: 1.75;
  color: var(--primary-dark);
  max-width: 760px;
  margin: 0 auto;
  font-size: 1.05rem;
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
  color: var(--primary-light);
}
.section-title {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}
.section-title--light {
  color: #ffffff;
}
.text-center {
  text-align: center;
}

/* ===== Two-column layout (Why it matters) ===== */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}
.two-col-grid.reverse .col-image {
  order: 1;
}
.two-col-grid.reverse .col-text {
  order: 2;
}
.col-text--full {
  max-width: var(--container-max-width);
}
.col-text--full .impact-grid {
  grid-template-columns: repeat(4, 1fr);
}
.col-image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 16px 36px -18px rgba(22, 52, 42, 0.3);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}
.col-image-frame:hover,
.col-image-frame:active {
  transform: translateY(-8px);
  border-color: var(--primary-color);
  box-shadow: 0 28px 56px -18px rgba(22, 52, 42, 0.35);
}
.col-image-frame::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 20px;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.15);
  pointer-events: none;
}
.col-image img {
  width: 100%;
  height: 100%;
  min-height: 340px;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.col-image-frame:hover img,
.col-image-frame:active img {
  transform: scale(1.06);
}

/* ===== "What we do" — satellite images orbiting around the center image ===== */
.do-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.radial-wrap {
  position: relative;
  max-width: 860px;
  height: 820px;
  margin: 3rem auto 0;
}

.radial-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 260px;
  text-align: center;
}
.radial-center img {
  width: 260px;
  height: 260px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  border-radius: 50%;
  border: 2px solid var(--primary-light);
  padding: 6px;
  background: #ffffff;
  box-shadow: 0 10px 24px -12px rgba(22, 52, 42, 0.35);
}
.radial-center-text {
  margin: 1.75rem 0 0;
  color: #6b7280;
  font-weight: 400;
  font-size: 0.95rem;
  line-height: 1.4;
}

.radial-item {
  position: absolute;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
}
/* 5 satellites placed evenly around the center circle, clockwise from the top */
.radial-item--1 {
  top: calc(50% - 300px);
  left: 50%;
  transform: translate(-50%, calc(-50% + 24px)) scale(0.9);
}
.radial-item--2 {
  top: calc(50% - 93px);
  left: calc(50% + 285px);
  transform: translate(-50%, calc(-50% + 24px)) scale(0.9);
}
.radial-item--3 {
  top: calc(50% + 243px);
  left: calc(50% + 176px);
  transform: translate(-50%, calc(-50% + 24px)) scale(0.9);
}
.radial-item--4 {
  top: calc(50% + 243px);
  left: calc(50% - 176px);
  transform: translate(-50%, calc(-50% + 24px)) scale(0.9);
}
.radial-item--5 {
  top: calc(50% - 93px);
  left: calc(50% - 285px);
  transform: translate(-50%, calc(-50% + 24px)) scale(0.9);
}

.radial-thumb {
  flex-shrink: 0;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
}
.radial-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}
.radial-item--1 .radial-thumb,
.radial-item--2 .radial-thumb,
.radial-item--3 .radial-thumb,
.radial-item--4 .radial-thumb,
.radial-item--5 .radial-thumb {
  border: 2px solid var(--primary-light);
}
.radial-copy {
  min-width: 0;
}
.radial-title {
  color: #6b7280;
  font-weight: 700;
  font-size: 0.92rem;
  margin: 0 0 0.35rem;
}
.radial-text {
  color: #767676;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

/* Scroll-in reveal — replays both directions via the toggled class */
.radial-center,
.radial-item {
  opacity: 0;
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.radial-center {
  transform: translate(-50%, calc(-50% + 28px));
}
.radial-center.is-visible {
  opacity: 1;
  transform: translate(-50%, -50%);
}
.radial-item {
  opacity: 0;
  transition:
    opacity 0.6s ease,
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.radial-item.is-visible {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.radial-item--1.is-visible {
  transition-delay: 0.15s;
}
.radial-item--2.is-visible {
  transition-delay: 0.3s;
}
.radial-item--3.is-visible {
  transition-delay: 0.45s;
}
.radial-item--4.is-visible {
  transition-delay: 0.6s;
}
.radial-item--5.is-visible {
  transition-delay: 0.75s;
}

/* Mobile: orbit doesn't fit — stack vertically, center first */
@media (max-width: 900px) {
  .radial-wrap {
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.75rem;
  }
  .radial-center,
  .radial-item {
    position: static;
    transform: none !important;
    width: 100%;
  }
  .radial-center img {
    width: 200px;
    height: 200px;
  }
}

/* ===== Scroll reveal — stats band, intro, quote and impact sections =====
   Each replays both scrolling down (fade/slide in) and scrolling back up
   (fade/slide out, then re-plays), matching the radial gallery above but
   using its own visual language: a growing rule and count-up numbers
   rather than parallax drift. */
.stats-band,
.intro-section .container,
.quote-inner,
.col-text--full {
  opacity: 0;
  transform: translateY(26px);
  transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.stats-band.in-view,
.intro-section .container.in-view,
.quote-inner.in-view,
.col-text--full.in-view {
  opacity: 1;
  transform: translateY(0);
}

/* The intro's accent rule grows from 0 to full width just after it fades in */
.intro-rule {
  width: 0;
  transition: width 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.2s;
}
.intro-section .container.in-view .intro-rule {
  width: 56px;
}

/* Stat items fade in slightly staggered, just after the band itself settles */
.stat-item {
  opacity: 0;
  transition: opacity 0.5s ease 0.15s;
}
.stats-band.in-view .stat-item {
  opacity: 1;
}
.stats-band.in-view .stat-item:nth-child(1) {
  transition-delay: 0.15s;
}
.stats-band.in-view .stat-item:nth-child(3) {
  transition-delay: 0.3s;
}
.stats-band.in-view .stat-item:nth-child(5) {
  transition-delay: 0.45s;
}

/* Impact cards fade in with a stagger; opacity only, so the existing hover
   lift/scale transform keeps working untouched. */
.impact-card {
  opacity: 0;
  transition:
    opacity 0.5s ease,
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease;
}
.col-text--full.in-view .impact-card {
  opacity: 1;
}
.col-text--full.in-view .impact-card:nth-child(1) {
  transition-delay: 0.05s;
}
.col-text--full.in-view .impact-card:nth-child(2) {
  transition-delay: 0.15s;
}
.col-text--full.in-view .impact-card:nth-child(3) {
  transition-delay: 0.25s;
}
.col-text--full.in-view .impact-card:nth-child(4) {
  transition-delay: 0.35s;
}

/* ===== Our approach — full-bleed photo quote ===== */
.quote-section {
  position: relative;
  padding: 6.5rem 0;
  background-image: url('/images/programs/livelihood-hero3.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}
.quote-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(6, 18, 13, 0.82) 0%,
    rgba(6, 18, 13, 0.72) 55%,
    rgba(6, 18, 13, 0.88) 100%
  );
}
.quote-inner {
  position: relative;
  z-index: 1;
}
.approach-text {
  line-height: 1.75;
  color: #333;
  max-width: 780px;
  margin: 0 auto 2.75rem;
  font-size: 1.02rem;
}
.approach-text--light {
  color: rgba(255, 255, 255, 0.88);
}
.quote-block {
  max-width: 720px;
  margin: 0 auto;
  text-align: center;
}
.quote-mark-svg {
  width: 46px;
  height: auto;
  color: var(--primary-light);
  margin-bottom: 1rem;
}
.quote-text {
  font-family: var(--font-family-base);
  font-style: italic;
  font-size: 1.55rem;
  color: #ffffff;
  line-height: 1.6;
}

/* ===== Why it matters — image cards with text overlaid directly on the photo ===== */
.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.impact-card {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  aspect-ratio: 4 / 5;
  cursor: pointer;
  box-shadow: 0 10px 24px -14px rgba(22, 52, 42, 0.28);
  border: 1px solid rgba(22, 52, 42, 0.06);
}
.impact-card:focus-visible {
  outline: 2px solid var(--primary-color);
  outline-offset: 2px;
}
.impact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 36px -16px rgba(22, 52, 42, 0.36);
}
.impact-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.impact-card:hover .impact-card-img {
  transform: scale(1.08);
}
.impact-card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 1.1rem;
  background: linear-gradient(
    to top,
    rgba(6, 18, 13, 0.9) 0%,
    rgba(6, 18, 13, 0.45) 55%,
    rgba(6, 18, 13, 0) 100%
  );
}
.icon-badge {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.7rem;
  box-shadow: 0 6px 14px -6px rgba(0, 0, 0, 0.5);
}
.icon-badge :deep(.svg-inline--fa) {
  width: 16px;
  height: 16px;
}
.impact-card-text {
  color: #ffffff;
  font-weight: 400;
  font-size: 0.94rem;
  line-height: 1.4;
  margin: 0;
}

/* ===== Popup shown when a "Why it matters" card is clicked ===== */
.impact-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(6, 18, 13, 0.72);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  animation: fadeInModal 0.25s ease;
}
@keyframes fadeInModal {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.impact-modal {
  position: relative;
  width: 100%;
  max-width: 560px;
  background: #ffffff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 30px 70px -20px rgba(0, 0, 0, 0.45);
  animation: popIn 0.25s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes popIn {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
.impact-modal-close {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background: rgba(6, 18, 13, 0.55);
  color: #ffffff;
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}
.impact-modal-close:hover {
  background: rgba(6, 18, 13, 0.8);
}
.impact-modal-media {
  width: 100%;
  height: 420px;
}
.impact-modal-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 600px) {
  .impact-modal-media {
    height: 280px;
  }
}

/* ===== Team / Organizational Structure ===== */
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

/* ===== Buttons ===== */
.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 0.8rem 1.85rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition:
    background 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
}
.btn-large {
  padding: 1rem 2.4rem;
  font-size: 1.02rem;
}
.btn-arrow {
  display: inline-block;
  transition: transform 0.25s ease;
}
.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -8px rgba(22, 52, 42, 0.35);
}
.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

/* ===== Closing CTA banner ===== */
.cta-banner {
  position: relative;
  background: var(--color-cream);
  padding: 4.5rem 0;
  overflow: hidden;
  border-top: 1px solid rgba(22, 52, 42, 0.08);
}
.cta-banner-glow {
  position: absolute;
  top: -40%;
  right: -10%;
  width: 480px;
  height: 480px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(22, 52, 42, 0.05) 0%, rgba(22, 52, 42, 0) 70%);
  pointer-events: none;
}
.cta-banner-inner {
  position: relative;
  text-align: center;
  max-width: 640px;
}
.cta-banner-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.9rem;
}
.cta-banner-title {
  color: var(--primary-dark);
  font-weight: 600;
  letter-spacing: -0.01em;
  margin-bottom: 1.75rem;
}

/* ===== Responsive ===== */

@media (max-width: 1024px) {
  .col-text--full .impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 2rem 1.5rem;
  }
  .scroll-cue {
    display: none;
  }

  .stats-band-wrap {
    margin-top: -40px;
  }
  .stats-band {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    padding: 2rem 1.5rem;
  }
  .stat-divider {
    display: none;
  }

  .col-text--full .impact-grid {
    grid-template-columns: 1fr;
  }

  .team-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .quote-section {
    padding: 4.5rem 0;
    background-attachment: scroll;
  }
  .quote-text {
    font-size: 1.25rem;
  }

  .team-grid {
    grid-template-columns: 1fr;
  }

  .cta-banner {
    padding: 3.5rem 0;
  }
}
</style>
