<template>
  <div class="environment-page">
    <!-- Scroll Progress Bar -->
    <div class="scroll-progress" ref="scrollProgressRef" aria-hidden="true"></div>

    <!-- Section Navigation -->
    <nav class="section-nav" aria-label="Section navigation">
      <button
        v-for="(item, i) in sectionNavItems"
        :key="item.id"
        class="section-dot"
        :class="{ active: activeSection === i }"
        :aria-label="`Go to ${item.label}`"
        @click="scrollToSection(i)"
      >
        <span class="dot-inner"></span>
        <span class="dot-label">{{ item.label }}</span>
      </button>
    </nav>

    <!-- ===================== OVERVIEW ===================== -->
    <section class="section overview-section" id="overview">
      <div class="container">
        <div class="section-header" ref="overviewHeaderRef">
          <span class="section-label">Our Approach</span>
          <h2>Environmental Stewardship in Action</h2>
          <p class="section-desc">
            Our environment program takes a holistic approach to conservation, combining
            immediate action with long-term community education and sustainable development.
          </p>
        </div>
        <div class="overview-grid">
          <div
            v-for="(card, i) in overviewCards"
            :key="card.title"
            class="overview-card"
            :class="{ 'card-visible': visibleCards.overview[i] }"
            :style="{ '--delay': `${i * 120}ms` }"
            :ref="el => setRef(el, 'overview', i)"
          >
            <div class="oc-icon-wrap">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" v-html="card.svgPaths" />
            </div>
            <h3>{{ card.title }}</h3>
            <p>{{ card.text }}</p>
            <div class="oc-shimmer" aria-hidden="true"></div>
            <div class="oc-corner" aria-hidden="true"></div>
          </div>
        </div>

        <!-- DB Sections content (when available from Supabase) -->
        <div v-if="dbSectionsContent.length > 0" class="db-sections">
          <div v-for="section in dbSectionsContent" :key="section.id" class="db-section-card">
            <div class="db-section-inner">
              <span class="db-section-label">{{ section.label }}</span>
              <h3 v-if="section.heading">{{ section.heading }}</h3>
              <p v-if="section.body">{{ section.body }}</p>
              <div v-if="section.items.length > 0" class="db-section-items">
                <div v-for="item in section.items" :key="item.id" class="db-section-item">
                  <strong>{{ item.title }}</strong>
                  <span v-if="item.subtitle">{{ item.subtitle }}</span>
                  <p v-if="item.body">{{ item.body }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== INITIATIVES ===================== -->
    <section class="section initiatives-section alt-bg" id="initiatives">
      <div class="container">
        <div class="section-header" ref="initHeaderRef">
          <span class="section-label">Key Initiatives</span>
          <h2>What We're Doing</h2>
          <p class="section-desc">
            From reforesting degraded lands to empowering communities with renewable energy,
            our initiatives create lasting environmental impact.
          </p>
        </div>
        <div class="initiatives-list">
          <div
            v-for="(item, i) in initiatives"
            :key="item.title"
            class="initiative-item"
            :class="{ 'initiative-visible': visibleCards.initiatives[i] }"
            :style="{ '--delay': `${i * 100}ms` }"
            :ref="el => setRef(el, 'initiatives', i)"
          >
            <div class="initiative-image">
              <img :src="item.img" :alt="item.title" loading="lazy" />
              <div class="initiative-overlay" />
            </div>
            <div class="initiative-tag">{{ item.tag }}</div>
            <div class="initiative-content">
              <h3>{{ item.title }}</h3>
              <p>{{ item.text }}</p>
              <span class="initiative-link">
                Learn more
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </span>
            </div>
          </div>
        </div>
        <div class="initiatives-cta" ref="initCtaRef">
          <p>Want to support these initiatives?</p>
          <router-link to="/get-involved/volunteer" class="btn-outline-small">Become a volunteer</router-link>
        </div>
      </div>
    </section>

    <!-- ===================== IMPACT STATS ===================== -->
    <section class="section impact-section" id="impact" ref="impactSectionRef">
      <div class="container">
        <div class="section-header light-header" ref="impactHeaderRef">
          <span class="section-label light-label">Our Impact</span>
          <h2>Making a Difference</h2>
        </div>
        <div class="impact-grid">
          <div
            v-for="(stat, i) in displayMetrics"
            :key="stat.label"
            class="impact-card"
            :class="{ 'impact-visible': statsVisible }"
            :style="{ '--delay': `${i * 110}ms` }"
          >
            <div class="impact-icon-wrap">
              <svg v-if="stat.icon === 'tree'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 22v-8"/><path d="M12 2C8 2 4 6 4 10c0 3 2 5.5 4 7l4-3 4 3c2-1.5 4-4 4-7 0-4-4-8-8-8z"/></svg>
              <svg v-else-if="stat.icon === 'community'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <svg v-else-if="stat.icon === 'globe'" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
            <span class="impact-number">{{ stat.displayed }}</span>
            <span class="impact-label">{{ stat.label }}</span>
          </div>
        </div>
      </div>
      <div class="impact-bg-shape" aria-hidden="true"></div>
    </section>

    <!-- ===================== PROCESS ===================== -->
    <section class="section process-section" id="process">
      <div class="container">
        <div class="section-header" ref="processHeaderRef">
          <span class="section-label">Our Process</span>
          <h2>How We Work</h2>
          <p class="section-desc">
            Our approach combines scientific expertise with community participation to create
            lasting environmental change.
          </p>
        </div>
        <div class="process-steps">
          <div
            v-for="(step, i) in processSteps"
            :key="step.number"
            class="process-step"
            :class="{ 'step-visible': visibleCards.process[i] }"
            :style="{ '--delay': `${i * 120}ms` }"
            :ref="el => setRef(el, 'process', i)"
          >
            <div class="step-number-wrap">
              <span class="step-number">{{ step.number }}</span>
              <svg v-if="i < processSteps.length - 1" class="step-connector" width="40" height="2" viewBox="0 0 40 2" fill="none" aria-hidden="true">
                <line x1="0" y1="1" x2="40" y2="1" stroke="currentColor" stroke-width="1.5" stroke-dasharray="4 3"/>
              </svg>
            </div>
            <div class="step-icon">
              <svg v-if="step.icon === 'search'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <svg v-else-if="step.icon === 'map'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
              <svg v-else-if="step.icon === 'play'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3>{{ step.title }}</h3>
            <p>{{ step.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== GALLERY ===================== -->
    <section class="section gallery-section alt-bg" id="gallery" ref="galleryRef">
      <div class="container">
        <div class="section-header" ref="galleryHeaderRef">
          <span class="section-label">Field Gallery</span>
          <h2>Our Work in Pictures</h2>
          <p class="section-desc">A glimpse into our environmental projects across Cambodia.</p>
        </div>
        <div class="gallery-grid">
          <div v-for="(img, i) in galleryImages" :key="i" class="gallery-item" :class="{ 'gallery-visible': galleryVisible }" :style="{ '--g-delay': `${i * 80}ms`, '--g-span': img.span || '1' }">
            <img :src="img.src" :alt="img.caption" loading="lazy" />
            <div class="gallery-overlay"><span class="gallery-caption">{{ img.caption }}</span></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== QUOTE ===================== -->
    <section class="quote-section">
      <div class="container">
        <blockquote class="quote-animate" :class="{ visible: quoteVisible }" ref="quoteRef">
          <div class="quote-deco" aria-hidden="true">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="0.8"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
          </div>
          <p class="quote-text">"We do not inherit the earth from our ancestors; we borrow it from our children. Our environmental program is a pledge to protect that inheritance and ensure future generations inherit a planet that is healthy, vibrant, and full of possibility."</p>
          <cite>— SETE SENA Environmental Team</cite>
          <div class="quote-deco-bottom" aria-hidden="true"><span></span><span></span><span></span></div>
        </blockquote>
      </div>
    </section>

    <!-- ===================== PARTNERS ===================== -->
    <section class="section partners-section" id="partners">
      <div class="container">
        <div class="section-header" ref="partnersHeaderRef">
          <span class="section-label">Our Supporters</span>
          <h2>Partners in Conservation</h2>
          <p class="section-desc">We work alongside organizations to amplify our environmental impact.</p>
        </div>
        <div class="partners-grid" ref="partnersGridRef">
          <div v-for="(partner, i) in displayPartners" :key="partner.name" class="partner-logo" :class="{ 'partner-visible': partnersVisible }" :style="{ '--p-delay': `${i * 80}ms` }">
            <div class="partner-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2" v-html="partner.icon" />
            </div>
            <strong>{{ partner.name }}</strong>
            <small>{{ partner.type }}</small>
          </div>
        </div>
      </div>
    </section>

    <!-- ===================== CTA ===================== -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content cta-animate" :class="{ visible: ctaVisible }" ref="ctaRef">
          <div class="cta-bg-shapes" aria-hidden="true"><span></span><span></span><span></span></div>
          <div class="cta-inner">
            <span class="cta-label">Take Action</span>
            <h2>Join the Environmental Movement</h2>
            <p>Whether you want to volunteer, partner with us, or support our conservation efforts, your contribution helps create a sustainable future for all.</p>
            <div class="cta-actions">
              <router-link to="/get-involved" class="btn-cta btn-cta-primary">Get Involved<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></router-link>
              <router-link to="/get-involved/donate" class="btn-cta btn-cta-secondary"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>Support Us</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import { useEnvironmentProgram } from '@/composables/useEnvironmentProgram'

const {
  program: dbProgram,
  metrics: dbMetrics,
  sections: dbSections,
  partners: dbPartners,
  load: loadDbData,
} = useEnvironmentProgram()

/* Page sections from DB — shown below overview cards when available */
const dbSectionsContent = computed(() => {
  return dbSections.value.map(s => ({
    id: s.id,
    label: s.label,
    heading: s.heading || '',
    body: s.body || '',
    items: s.items.map(it => ({
      id: it.id,
      title: it.title,
      subtitle: it.subtitle || '',
      body: it.body || '',
    })),
  }))
})

/* ─── Static data (fallback defaults) ──────────── */
const sectionNavItems = [
  { id: 'overview', label: 'Approach' },
  { id: 'initiatives', label: 'Initiatives' },
  { id: 'impact', label: 'Impact' },
  { id: 'process', label: 'Process' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'partners', label: 'Partners' },
]

const overviewCards = [
  { title: 'Conservation', text: 'Protecting and restoring natural habitats, wildlife corridors, and biodiversity hotspots through community-led initiatives and scientific research.', svgPaths: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { title: 'Sustainability', text: 'Promoting renewable energy, sustainable agriculture, and circular economy practices that reduce environmental impact while supporting livelihoods.', svgPaths: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>' },
  { title: 'Community Engagement', text: 'Empowering local communities with knowledge, resources, and tools to actively participate in environmental protection and climate action.', svgPaths: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
]

const initiatives = [
  { title: 'Reforestation Projects', text: 'Planting native tree species to restore degraded forests. We\'ve planted over 500,000 trees across 12 communities.', img: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80', tag: 'Conservation' },
  { title: 'Environmental Education', text: 'Developing curriculum and training programs for schools to build environmental literacy from an early age.', img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80', tag: 'Education' },
  { title: 'Renewable Energy Access', text: 'Installing solar panels and clean energy solutions in rural communities, reducing dependence on fossil fuels.', img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80', tag: 'Energy' },
  { title: 'Water Conservation', text: 'Implementing rainwater harvesting, watershed management, and water purification systems.', img: 'https://images.unsplash.com/photo-1548685913-fe6678b0d5c9?w=800&q=80', tag: 'Water' },
  { title: 'Sustainable Agriculture', text: 'Training farmers in organic farming, crop rotation, and agroforestry techniques.', img: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80', tag: 'Agriculture' },
  { title: 'Climate Research & Advocacy', text: 'Conducting climate impact assessments and advocating for policy changes.', img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', tag: 'Research' },
]

const impactStatsRaw = [
  { label: 'Trees Planted', end: 500, suffix: 'K+', icon: 'tree' },
  { label: 'Communities Served', end: 12, suffix: '', icon: 'community' },
  { label: 'Ecosystems Protected', end: 50, suffix: '+', icon: 'globe' },
  { label: 'People Trained', end: 10, suffix: 'K+', icon: 'people' },
]

const impactStats = reactive<Array<{ label: string; end: number; suffix: string; icon: string; displayed: string }>>(
  impactStatsRaw.map(s => ({ ...s, displayed: s.end + s.suffix }))
)

/* Metrics from DB or static fallback */
const displayMetrics = computed(() => {
  if (dbMetrics.value.length > 0) {
    return dbMetrics.value.map(m => ({
      label: m.label,
      displayed: m.value_text + (m.unit || ''),
      icon: m.icon || 'globe',
      end: 0,
      suffix: '',
    }))
  }
  return impactStats as unknown as Array<{ label: string; displayed: string; icon: string; end: number; suffix: string }>
})

const processSteps = [
  { number: '01', title: 'Assessment', icon: 'search', text: 'We conduct comprehensive environmental assessments to understand local ecosystems and identify priorities.' },
  { number: '02', title: 'Planning', icon: 'map', text: 'Working with community leaders, we develop tailored action plans that balance conservation with needs.' },
  { number: '03', title: 'Implementation', icon: 'play', text: 'We execute projects with active community participation, ensuring local ownership.' },
  { number: '04', title: 'Monitoring', icon: 'check', text: 'Continuous monitoring helps us measure impact and adapt strategies for greater effectiveness.' },
]

const galleryImages = [
  { src: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=75', caption: 'Reforestation in rural Cambodia', span: '2' },
  { src: 'https://images.unsplash.com/photo-1470071459604-4b118ecb0e7e?w=400&q=75', caption: 'Forest canopy restoration', span: '1' },
  { src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&q=75', caption: 'Community tree nursery', span: '1' },
  { src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=75', caption: 'Eco-tourism initiatives', span: '1' },
  { src: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=75', caption: 'Nature conservation areas', span: '2' },
]

/* Partners from DB or static fallback */
const PARTNER_ICON = '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'

const STATIC_PARTNERS = [
  { name: 'UN Environment', type: 'International Partner', icon: PARTNER_ICON },
  { name: 'Green Cambodia', type: 'Local NGO', icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  { name: 'Eco Foundation', type: 'Funding Partner', icon: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>' },
  { name: 'Wildlife Alliance', type: 'Conservation Partner', icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>' },
  { name: 'Solar Future', type: 'Technology Partner', icon: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M4.93 4.93l1.41 1.41"/><path d="M17.66 17.66l1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="M4.93 19.07l1.41-1.41"/><path d="M17.66 6.34l1.41-1.41"/>' },
  { name: 'Rainforest Trust', type: 'Global Supporter', icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>' },
]

const displayPartners = computed(() => {
  if (dbPartners.value.length > 0) {
    return dbPartners.value.map(p => ({ name: p.name, type: p.partner_type, description: p.description || '', icon: PARTNER_ICON }))
  }
  return STATIC_PARTNERS
})

/* ─── Visibility state ─────────────────────────── */
const visibleCards = reactive<Record<string, boolean[]>>({
  overview: Array(overviewCards.length).fill(false),
  initiatives: Array(initiatives.length).fill(false),
  process: Array(processSteps.length).fill(false),
})
const statsVisible = ref(false)
const quoteVisible = ref(false)
const ctaVisible = ref(false)
const galleryVisible = ref(false)
const partnersVisible = ref(false)
const activeSection = ref(0)

/* ─── Template refs ────────────────────────────── */
const cardRefs = reactive<Record<string, (HTMLElement | null)[]>>({ overview: [], initiatives: [], process: [] })
const scrollProgressRef = ref<HTMLElement | null>(null)
const overviewHeaderRef = ref<HTMLElement | null>(null)
const initHeaderRef = ref<HTMLElement | null>(null)
const initCtaRef = ref<HTMLElement | null>(null)
const impactSectionRef = ref<HTMLElement | null>(null)
const impactHeaderRef = ref<HTMLElement | null>(null)
const processHeaderRef = ref<HTMLElement | null>(null)
const galleryRef = ref<HTMLElement | null>(null)
const galleryHeaderRef = ref<HTMLElement | null>(null)
const quoteRef = ref<HTMLElement | null>(null)
const partnersHeaderRef = ref<HTMLElement | null>(null)
const partnersGridRef = ref<HTMLElement | null>(null)
const ctaRef = ref<HTMLElement | null>(null)

function setRef(el: HTMLElement | null, group: string, idx: number) {
  if (el && cardRefs[group]) cardRefs[group][idx] = el
}

/* ─── IntersectionObserver helper ──────────────── */
const observers: IntersectionObserver[] = []

function observe(el: HTMLElement | null, callback: () => void, options: IntersectionObserverInit = {}) {
  if (!el) return
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { callback(); io.disconnect() } })
  }, { threshold: 0.15, ...options })
  io.observe(el)
  observers.push(io)
}

/* ─── Counter animation ────────────────────────── */
function animateCounter(target: { displayed: string; end: number; suffix: string } | null, source: Record<string, unknown>) {
  if (!target) return
  if ('value_text' in source) {
    target.displayed = String(source.value_text) + (source.unit ? String(source.unit) : '')
    return
  }
  const duration = 1600
  const range = target.end
  const step = range / (duration / 16)
  let current = 0
  const tick = () => {
    current = Math.min(current + step, target.end)
    target.displayed = Math.round(current) + target.suffix
    if (current < target.end) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/* ─── Scroll progress ──────────────────────────── */
function handleScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
  if (scrollProgressRef.value) scrollProgressRef.value.style.width = `${Math.min(progress, 100)}%`

  const sections = sectionNavItems.map(item => document.getElementById(item.id)).filter(Boolean) as HTMLElement[]
  for (let i = sections.length - 1; i >= 0; i--) {
    if (sections[i].getBoundingClientRect().top <= window.innerHeight * 0.3) { activeSection.value = i; break }
  }
}

function scrollToSection(index: number) {
  const el = document.getElementById(sectionNavItems[index].id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

/* ─── Mount ─────────────────────────────────────── */
onMounted(() => {
  void loadDbData()

  let ticking = false
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(() => { handleScroll(); ticking = false }); ticking = true }
  }, { passive: true })

  cardRefs.overview.forEach((el, i) => observe(el, () => setTimeout(() => { visibleCards.overview[i] = true }, i * 120)))
  observe(overviewHeaderRef.value, () => overviewHeaderRef.value?.classList.add('entered'))
  observe(initHeaderRef.value, () => initHeaderRef.value?.classList.add('entered'))
  cardRefs.initiatives.forEach((el, i) => observe(el, () => setTimeout(() => { visibleCards.initiatives[i] = true }, i * 100)))
  observe(initCtaRef.value, () => initCtaRef.value?.classList.add('entered'))
  observe(impactHeaderRef.value, () => impactHeaderRef.value?.classList.add('entered'))
  observe(impactSectionRef.value, () => {
    statsVisible.value = true
    const stats = dbMetrics.value.length > 0 ? dbMetrics.value : impactStatsRaw
    stats.forEach((_, i) => setTimeout(() => animateCounter(i < impactStats.length ? impactStats[i] : null, stats[i] as unknown as Record<string, unknown>), i * 110))
  })
  observe(processHeaderRef.value, () => processHeaderRef.value?.classList.add('entered'))
  cardRefs.process.forEach((el, i) => observe(el, () => setTimeout(() => { visibleCards.process[i] = true }, i * 120)))
  observe(galleryHeaderRef.value, () => galleryHeaderRef.value?.classList.add('entered'))
  observe(galleryRef.value, () => { galleryVisible.value = true })
  observe(quoteRef.value, () => { quoteVisible.value = true })
  observe(partnersHeaderRef.value, () => partnersHeaderRef.value?.classList.add('entered'))
  observe(partnersGridRef.value, () => { partnersVisible.value = true })
  observe(ctaRef.value, () => { ctaVisible.value = true })
})

onBeforeUnmount(() => {
  observers.forEach(io => io.disconnect())
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.environment-page {
  --env-primary: #0f8f69; --env-primary-dark: #0b5f49; --env-primary-light: #e3f5ef;
  --env-glow: rgba(15, 143, 105, 0.15); --env-gold: #d4a017;
  min-height: 100vh; background: var(--color-cream, #f7fbf8); color: var(--color-ink, #16231d);
  position: relative;
}

.scroll-progress {
  position: fixed; top: 0; left: 0; height: 3px; width: 0%;
  background: linear-gradient(90deg, var(--env-primary), var(--env-gold));
  z-index: 1000; transition: width 0.1s linear; pointer-events: none;
}

.section-nav {
  position: fixed; right: 1.25rem; top: 50%; transform: translateY(-50%);
  display: flex; flex-direction: column; gap: 0.85rem; z-index: 100;
}
.section-dot {
  display: flex; align-items: center; gap: 0.5rem; background: none; border: none;
  cursor: pointer; padding: 0; flex-direction: row-reverse;
}
.dot-inner {
  width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--env-primary);
  background: transparent; transition: all 0.3s cubic-bezier(0.34,1.4,0.64,1); flex-shrink: 0;
}
.section-dot.active .dot-inner { background: var(--env-primary); box-shadow: 0 0 0 4px var(--env-glow); transform: scale(1.2); }
.dot-label {
  font-size: 0.7rem; font-weight: 700; color: var(--color-ink-soft, #53645b);
  opacity: 0; transform: translateX(6px); transition: all 0.2s ease;
  white-space: nowrap; text-transform: uppercase; letter-spacing: 0.04em;
}
.section-dot:hover .dot-label, .section-dot.active .dot-label { opacity: 1; transform: translateX(0); }
@media (max-width: 900px) { .section-nav { display: none; } }

/* ─── SECTIONS SHARED ─── */
.section { padding: 5rem 0; }
.container { max-width: var(--container-max-width, 1200px); margin: 0 auto; padding: 0 var(--container-padding, 1.5rem); }
.section-header { text-align: center; margin-bottom: 3rem; opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1); }
.section-header.entered { opacity: 1; transform: translateY(0); }
.section-label { display: inline-block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--env-primary); margin-bottom: 0.75rem; padding: 0.35rem 1rem; border: 1px solid rgba(15,143,105,0.15); border-radius: 999px; background: var(--env-primary-light); }
.section-header h2 { font-weight: 850; color: var(--color-ink, #16231d); margin-bottom: 0.75rem; font-size: clamp(1.8rem,4vw,2.8rem); letter-spacing: -0.02em; line-height: 1.1; }
.section-desc { color: var(--color-ink-soft, #53645b); max-width: 560px; margin: 0 auto; line-height: 1.7; }
.alt-bg { background: var(--color-cream-soft, #edf6f1); }
.light-header h2 { color: #ffffff; }
.light-label { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.08); color: var(--env-gold); }

/* ─── OVERVIEW ─── */
.overview-section { background: var(--color-cream, #f7fbf8); position: relative; }
.overview-section::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, rgba(15,143,105,0.1), transparent); }
.overview-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.overview-card { background: #ffffff; border: 1px solid rgba(15,143,105,0.08); border-radius: 1.25rem; padding: 2.25rem 2rem; position: relative; overflow: hidden; cursor: default; box-shadow: 0 2px 12px rgba(0,0,0,0.04); opacity: 0; transform: translateY(36px) scale(0.96); transition: opacity 0.55s ease var(--delay,0ms), transform 0.55s cubic-bezier(0.34,1.36,0.64,1) var(--delay,0ms), border-color 0.3s ease, box-shadow 0.35s ease; }
.overview-card.card-visible { opacity: 1; transform: translateY(0) scale(1); }
.overview-card:hover { border-color: rgba(15,143,105,0.25); box-shadow: 0 12px 40px rgba(15,143,105,0.08), 0 0 0 3px rgba(15,143,105,0.05); transform: translateY(-6px) scale(1.01); }
.oc-icon-wrap { width: 3.25rem; height: 3.25rem; display: flex; align-items: center; justify-content: center; border-radius: 0.85rem; background: var(--env-primary-light); color: var(--env-primary); margin-bottom: 1.25rem; transition: transform 0.35s cubic-bezier(0.34,1.6,0.64,1), background 0.3s, color 0.3s; }
.overview-card:hover .oc-icon-wrap { transform: scale(1.15) rotate(-6deg); background: var(--env-primary); color: #ffffff; }
.overview-card h3 { font-weight: 700; margin-bottom: 0.75rem; color: var(--color-ink, #16231d); font-size: 1.1rem; }
.overview-card p { color: var(--color-ink-soft, #53645b); line-height: 1.7; font-size: 0.92rem; }
.oc-shimmer { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%); background-size: 200% 100%; background-position: 200% 0; transition: background-position 0.65s ease; pointer-events: none; border-radius: inherit; }
.overview-card:hover .oc-shimmer { background-position: -200% 0; }
.oc-corner { position: absolute; top: 0; right: 0; width: 60px; height: 60px; background: radial-gradient(circle at 100% 0%, rgba(15,143,105,0.04), transparent 70%); pointer-events: none; border-radius: 0 1.25rem 0 0; }

/* DB Sections */
.db-sections { display: grid; gap: 1rem; margin-top: 2rem; }
.db-section-card { background: #ffffff; border: 1px solid rgba(15,143,105,0.08); border-radius: 1rem; padding: 1.5rem; box-shadow: 0 2px 8px rgba(0,0,0,0.03); }
.db-section-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em; color: var(--env-primary); margin-bottom: 0.35rem; display: block; }
.db-section-inner h3 { font-size: 1.05rem; font-weight: 700; color: var(--color-ink, #16231d); margin-bottom: 0.5rem; }
.db-section-inner > p { color: var(--color-ink-soft, #53645b); line-height: 1.7; font-size: 0.9rem; }
.db-section-items { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem; margin-top: 1rem; }
.db-section-item { border-left: 3px solid var(--env-gold); padding: 0.75rem 1rem; background: var(--color-cream-soft, #edf6f1); border-radius: 0 0.5rem 0.5rem 0; }
.db-section-item strong { display: block; color: var(--color-ink, #16231d); font-weight: 800; font-size: 0.9rem; }
.db-section-item span { display: block; color: var(--color-ink-soft, #53645b); font-size: 0.8rem; font-weight: 600; margin-top: 2px; }
.db-section-item p { color: var(--color-ink-soft, #53645b); font-size: 0.85rem; line-height: 1.5; margin-top: 4px; }

/* ─── INITIATIVES ─── */
.initiatives-list { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.initiative-item { position: relative; border-radius: 1.25rem; overflow: hidden; height: 420px; cursor: pointer; opacity: 0; transform: translateY(32px) scale(0.95); transition: opacity 0.6s ease var(--delay,0ms), transform 0.6s cubic-bezier(0.34,1.3,0.64,1) var(--delay,0ms), box-shadow 0.4s ease; box-shadow: 0 4px 20px rgba(0,0,0,0.08); }
.initiative-item.initiative-visible { opacity: 1; transform: translateY(0) scale(1); }
.initiative-item:hover { transform: translateY(-8px) scale(1.01); box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
.initiative-image { position: absolute; inset: 0; }
.initiative-image img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s cubic-bezier(0.25,1,0.5,1); }
@media (hover: hover) { .initiative-item:hover .initiative-image img { transform: scale(1.08); } }
.initiative-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(10,31,24,0.1) 0%, rgba(10,31,24,0.45) 40%, rgba(10,31,24,0.88) 100%); transition: background 0.4s ease; }
@media (hover: hover) { .initiative-item:hover .initiative-overlay { background: linear-gradient(to bottom, rgba(10,31,24,0.15) 0%, rgba(10,31,24,0.55) 40%, rgba(10,31,24,0.92) 100%); } }
.initiative-tag { position: absolute; top: 1rem; left: 1rem; z-index: 3; padding: 0.3rem 0.75rem; border-radius: 999px; background: rgba(255,255,255,0.12); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; transition: background 0.3s; }
.initiative-item:hover .initiative-tag { background: var(--env-primary); border-color: var(--env-primary); }
.initiative-content { position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem; z-index: 2; color: #ffffff; transition: transform 0.4s cubic-bezier(0.25,1,0.5,1); }
.initiative-item:hover .initiative-content { transform: translateY(-6px); }
.initiative-content h3 { font-weight: 800; margin-bottom: 0.5rem; color: #ffffff; letter-spacing: -0.01em; text-shadow: 0 2px 12px rgba(0,0,0,0.3); font-size: 1.15rem; }
.initiative-content p { color: rgba(255,255,255,0.85); line-height: 1.6; font-size: 0.88rem; text-shadow: 0 1px 8px rgba(0,0,0,0.2); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.initiative-link { display: inline-flex; align-items: center; gap: 0.35rem; margin-top: 0.75rem; font-size: 0.78rem; font-weight: 700; color: var(--env-gold); opacity: 0; transform: translateX(-8px); transition: all 0.3s ease; }
.initiative-item:hover .initiative-link { opacity: 1; transform: translateX(0); }
.initiatives-cta { text-align: center; margin-top: 2.5rem; display: flex; align-items: center; justify-content: center; gap: 1rem; flex-wrap: wrap; opacity: 0; transform: translateY(16px); transition: opacity 0.5s ease, transform 0.5s ease; }
.initiatives-cta.entered { opacity: 1; transform: translateY(0); }
.initiatives-cta p { color: var(--color-ink-soft, #53645b); font-weight: 600; }
.btn-outline-small { display: inline-flex; align-items: center; padding: 0.55rem 1.25rem; border-radius: 999px; border: 1px solid var(--env-primary); color: var(--env-primary); font-size: 0.82rem; font-weight: 700; text-decoration: none; transition: all 0.25s ease; }
.btn-outline-small:hover { background: var(--env-primary); color: #ffffff; transform: translateY(-2px); box-shadow: 0 4px 16px rgba(15,143,105,0.2); }

/* ─── IMPACT ─── */
.impact-section { background: linear-gradient(135deg, #0a1f18 0%, #0d3328 50%, #0f3d2e 100%); position: relative; overflow: hidden; }
.impact-bg-shape { position: absolute; top: -200px; right: -200px; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(15,143,105,0.06), transparent 70%); pointer-events: none; }
.impact-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; position: relative; z-index: 1; }
.impact-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1.25rem; padding: 2.25rem 1.5rem; text-align: center; position: relative; overflow: hidden; backdrop-filter: blur(4px); opacity: 0; transform: translateY(24px) scale(0.95); transition: opacity 0.5s ease var(--delay,0ms), transform 0.5s cubic-bezier(0.34,1.4,0.64,1) var(--delay,0ms), border-color 0.3s, box-shadow 0.3s, background 0.3s; }
.impact-card.impact-visible { opacity: 1; transform: translateY(0) scale(1); }
.impact-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, var(--env-primary), var(--env-gold)); transform: scaleX(0); transform-origin: left; transition: transform 0.35s ease; }
.impact-card:hover::before { transform: scaleX(1); }
.impact-card:hover { border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.07); box-shadow: 0 8px 32px rgba(0,0,0,0.15); transform: translateY(-5px) scale(1.02); }
.impact-icon-wrap { width: 3rem; height: 3rem; display: flex; align-items: center; justify-content: center; border-radius: 0.75rem; background: rgba(255,255,255,0.06); color: var(--env-gold); margin: 0 auto 1rem; transition: transform 0.3s ease, background 0.3s; }
.impact-card:hover .impact-icon-wrap { transform: scale(1.1); background: rgba(212,160,23,0.12); }
.impact-number { display: block; font-size: 2.75rem; font-weight: 900; color: #ffffff; margin-bottom: 0.4rem; letter-spacing: -0.02em; transition: transform 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.impact-card:hover .impact-number { transform: scale(1.08); }
.impact-label { color: rgba(255,255,255,0.6); font-weight: 600; font-size: 0.88rem; }

/* ─── PROCESS ─── */
.process-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1.5rem; }
.process-step { text-align: center; padding: 2.5rem 1.75rem; background: #ffffff; border: 1px solid rgba(15,143,105,0.08); border-radius: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.04); position: relative; overflow: hidden; opacity: 0; transform: translateY(28px); transition: opacity 0.5s ease var(--delay,0ms), transform 0.5s cubic-bezier(0.34,1.3,0.64,1) var(--delay,0ms), border-color 0.3s, box-shadow 0.3s; }
.process-step.step-visible { opacity: 1; transform: translateY(0); }
.process-step:hover { transform: translateY(-6px); border-color: rgba(15,143,105,0.18); box-shadow: 0 12px 36px rgba(0,0,0,0.06); }
.step-number-wrap { display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 1rem; }
.step-number { font-size: 2.5rem; font-weight: 900; color: var(--env-primary); opacity: 0.15; line-height: 1; transition: opacity 0.3s, transform 0.3s cubic-bezier(0.34,1.5,0.64,1); }
.process-step:hover .step-number { opacity: 0.3; transform: scale(1.08); }
.step-connector { color: var(--env-primary); opacity: 0.2; flex-shrink: 0; }
.step-icon { width: 2.5rem; height: 2.5rem; display: flex; align-items: center; justify-content: center; border-radius: 0.75rem; background: var(--env-primary-light); color: var(--env-primary); margin: 0 auto 1rem; transition: all 0.3s ease; }
.process-step:hover .step-icon { background: var(--env-primary); color: #ffffff; transform: scale(1.1); }
.process-step h3 { font-weight: 700; margin-bottom: 0.75rem; color: var(--color-ink, #16231d); font-size: 1rem; }
.process-step p { color: var(--color-ink-soft, #53645b); line-height: 1.7; font-size: 0.88rem; }

/* ─── GALLERY ─── */
.gallery-grid { display: grid; grid-template-columns: repeat(4, 1fr); grid-auto-rows: 200px; gap: 0.85rem; }
.gallery-item { position: relative; border-radius: 1rem; overflow: hidden; cursor: pointer; grid-column: span var(--g-span, 1); opacity: 0; transform: scale(0.92); transition: opacity 0.5s ease var(--g-delay,0ms), transform 0.5s cubic-bezier(0.34,1.3,0.64,1) var(--g-delay,0ms), box-shadow 0.3s; }
.gallery-item.gallery-visible { opacity: 1; transform: scale(1); }
.gallery-item:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12); z-index: 2; }
.gallery-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s cubic-bezier(0.25,1,0.5,1); }
@media (hover: hover) { .gallery-item:hover img { transform: scale(1.06); } }
.gallery-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(10,31,24,0.7) 0%, transparent 50%); opacity: 0; transition: opacity 0.35s ease; display: flex; align-items: flex-end; padding: 1.25rem; }
.gallery-item:hover .gallery-overlay { opacity: 1; }
.gallery-caption { color: #ffffff; font-size: 0.82rem; font-weight: 700; text-shadow: 0 1px 8px rgba(0,0,0,0.3); }

/* ─── QUOTE ─── */
.quote-section { padding: 5rem 0; background: linear-gradient(180deg, var(--color-cream-soft, #edf6f1) 0%, #e8f0ea 100%); position: relative; overflow: hidden; }
.quote-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 50%, rgba(15,143,105,0.04), transparent 50%), radial-gradient(circle at 80% 50%, rgba(212,160,23,0.03), transparent 50%); pointer-events: none; }
.quote-animate { text-align: center; max-width: 760px; margin: 0 auto; padding: 2.5rem 2rem; position: relative; opacity: 0; transform: scale(0.95) translateY(20px); transition: opacity 0.65s ease, transform 0.65s cubic-bezier(0.25,1,0.5,1); }
.quote-animate.visible { opacity: 1; transform: scale(1) translateY(0); }
.quote-deco { color: var(--env-primary); opacity: 0.08; margin-bottom: 1.5rem; animation: floatIcon 5s ease-in-out infinite; }
@keyframes floatIcon { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-8px) rotate(-3deg); } }
.quote-text { font-style: italic; color: var(--color-ink, #16231d); line-height: 1.9; margin-bottom: 1.5rem; font-size: 1.08rem; }
.quote-section cite { font-style: normal; color: var(--color-ink-soft, #53645b); font-weight: 700; font-size: 0.92rem; }
.quote-deco-bottom { display: flex; justify-content: center; gap: 0.5rem; margin-top: 1.5rem; }
.quote-deco-bottom span { width: 6px; height: 6px; border-radius: 50%; background: var(--env-primary); opacity: 0.12; }

/* ─── PARTNERS ─── */
.partners-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem; max-width: 800px; margin: 0 auto; }
.partner-logo { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem 1.5rem; border-radius: 1rem; border: 1px solid rgba(15,143,105,0.06); background: var(--color-cream-soft, #edf6f1); text-align: center; opacity: 0; transform: translateY(20px); transition: opacity 0.4s ease var(--p-delay,0ms), transform 0.4s cubic-bezier(0.34,1.3,0.64,1) var(--p-delay,0ms), border-color 0.3s, box-shadow 0.3s, background 0.3s; }
.partner-logo.partner-visible { opacity: 1; transform: translateY(0); }
.partner-logo:hover { border-color: rgba(15,143,105,0.2); background: #ffffff; box-shadow: 0 8px 24px rgba(15,143,105,0.06); transform: translateY(-4px); }
.partner-icon { width: 3.5rem; height: 3.5rem; display: flex; align-items: center; justify-content: center; border-radius: 0.85rem; background: var(--env-primary-light); color: var(--env-primary); transition: all 0.3s ease; }
.partner-logo:hover .partner-icon { background: var(--env-primary); color: #ffffff; transform: scale(1.08); }
.partner-logo strong { color: var(--color-ink, #16231d); font-size: 0.9rem; font-weight: 800; }
.partner-logo small { color: var(--color-ink-soft, #53645b); font-size: 0.75rem; font-weight: 600; }

/* ─── CTA ─── */
.cta-section { padding: 5rem 0; background: linear-gradient(135deg, #0a1f18 0%, #0d3328 50%, #0f3d2e 100%); position: relative; overflow: hidden; }
.cta-section::before { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 20% 30%, rgba(15,143,105,0.12), transparent 50%), radial-gradient(circle at 80% 70%, rgba(212,160,23,0.06), transparent 50%); pointer-events: none; }
.cta-bg-shapes { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.cta-bg-shapes span { position: absolute; border-radius: 50%; border: 1px solid rgba(255,255,255,0.03); }
.cta-bg-shapes span:nth-child(1) { width: 300px; height: 300px; top: -80px; right: -80px; animation: ctaFloat 12s ease-in-out infinite; }
.cta-bg-shapes span:nth-child(2) { width: 200px; height: 200px; bottom: -60px; left: -40px; animation: ctaFloat 10s ease-in-out infinite reverse; }
.cta-bg-shapes span:nth-child(3) { width: 120px; height: 120px; top: 40%; left: 10%; animation: ctaFloat 8s ease-in-out infinite 2s; }
@keyframes ctaFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-15px) rotate(5deg); } }
.cta-animate { position: relative; z-index: 1; opacity: 0; transform: translateY(24px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.25,1,0.5,1); }
.cta-animate.visible { opacity: 1; transform: translateY(0); }
.cta-inner { text-align: center; max-width: 600px; margin: 0 auto; padding: 0 1.5rem; }
.cta-label { display: inline-block; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--env-gold); margin-bottom: 1rem; padding: 0.35rem 1rem; border: 1px solid rgba(212,160,23,0.25); border-radius: 999px; background: rgba(212,160,23,0.08); }
.cta-inner h2 { font-weight: 900; color: #ffffff; margin-bottom: 0.75rem; font-size: clamp(1.8rem,4vw,2.8rem); letter-spacing: -0.02em; line-height: 1.1; }
.cta-inner p { color: rgba(255,255,255,0.7); line-height: 1.7; margin-bottom: 2rem; font-size: 1rem; }
.cta-actions { display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; }
.btn-cta { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.85rem 1.75rem; border-radius: 999px; font-size: 0.9rem; font-weight: 700; text-decoration: none; transition: all 0.3s cubic-bezier(0.34,1.4,0.64,1); cursor: pointer; }
.btn-cta-primary { background: linear-gradient(135deg, var(--env-primary), var(--env-primary-dark)); color: #ffffff; box-shadow: 0 4px 20px rgba(15,143,105,0.3); }
.btn-cta-primary:hover { transform: translateY(-3px) scale(1.03); box-shadow: 0 8px 32px rgba(15,143,105,0.4); }
.btn-cta-primary:active { transform: translateY(0) scale(0.98); }
.btn-cta-secondary { background: rgba(255,255,255,0.08); color: #ffffff; border: 1px solid rgba(255,255,255,0.2); backdrop-filter: blur(8px); }
.btn-cta-secondary:hover { background: rgba(255,255,255,0.15); border-color: rgba(255,255,255,0.35); transform: translateY(-3px); }

/* ─── RESPONSIVE ─── */
@media (max-width: 1024px) {
  .overview-grid, .initiatives-list { grid-template-columns: repeat(2, 1fr); }
  .impact-grid, .process-steps { grid-template-columns: repeat(2, 1fr); }
  .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 180px; }
  .partners-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 900px) { .hero-scroll-indicator { display: none; } .hero-content { padding: 3rem 0; } .hero { min-height: auto; padding: 6rem 0 4rem; } .hero-line { font-size: clamp(2.2rem,7vw,3.5rem); } }
@media (max-width: 768px) {
  .section { padding: 3.5rem 0; }
  .overview-grid, .initiatives-list { grid-template-columns: 1fr; }
  .initiative-item { height: 350px; }
  .impact-grid { grid-template-columns: 1fr 1fr; }
  .process-steps { grid-template-columns: 1fr; }
  .step-connector { display: none; }
  .gallery-grid { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; }
  .gallery-item { grid-column: span 1 !important; }
  .partners-grid { grid-template-columns: repeat(2, 1fr); }
  .hero-line { font-size: clamp(1.8rem,6vw,2.8rem); }
}
@media (max-width: 480px) {
  .impact-grid { gap: 0.75rem; }
  .impact-card { padding: 1.5rem 1rem; }
  .impact-number { font-size: 2rem; }
  .initiative-item { height: 300px; }
  .initiative-content { padding: 1.5rem; }
  .gallery-grid { grid-template-columns: 1fr; grid-auto-rows: 200px; }
  .partners-grid { grid-template-columns: 1fr; }
  .quote-animate { padding: 1.5rem 1rem; }
}
</style>
