<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'

// ─── Milestones data ──────────────────────────────────────────────
const allMilestones = [
  {
    year: '2024',
    title: '30-Year Strategic Plan',
    description:
      'New five-year strategy to deepen quality, diversify funding and invest in youth leadership.',
    detail:
      'The plan prioritises three pillars: (1) expanding community-led education programmes, (2) strengthening child protection systems, and (3) launching a dedicated youth innovation fund. Over 50 community dialogues were held to co‑design the strategy.',
    image: new URL('@/assets/maps/2024.png', import.meta.url).href,
  },
  {
    year: '2022',
    title: 'Melaleuca Oil Enterprise',
    description:
      'Village forest guardians launch a rural enterprise from non-timber forest products.',
    detail:
      'With technical support from Santi Sena, 12 village cooperatives now sustainably harvest melaleuca leaves, producing essential oils sold locally and exported. The enterprise provides income for 200 families while preserving the forest.',
    image: new URL('@/assets/maps/2022.png', import.meta.url).href,
  },
  {
    year: '2020',
    title: 'COVID-19 Response',
    description: 'Emergency food, hygiene and remote-learning kits reach more than 200 villages.',
    detail:
      'In partnership with local authorities, we distributed 3,500 food packs, 5,000 hygiene kits, and 2,000 radio‑based learning materials to keep children learning despite school closures.',
    image: new URL('@/assets/maps/2019.png', import.meta.url).href,
  },
  {
    year: '2018',
    title: 'Child Protection Networks',
    description: 'CPNs become active across 43 communes with 24/7 referral pathways.',
    detail:
      'Each network includes trained volunteers, social workers, and local police. They have handled over 1,200 cases, ensuring vulnerable children receive immediate care and legal support.',
    image: new URL('@/assets/maps/2018.png', import.meta.url).href,
  },
  {
    year: '2014',
    title: '20th Anniversary',
    description:
      'Kratie office opens. Programs extend to a third province and staff grows past 30 full-time.',
    detail:
      'The expansion to Kratie brought our integrated approach to another province, reaching an additional 80 villages. We also launched our first youth leadership camp that year.',
    image: new URL('@/assets/maps/2014.png', import.meta.url).href,
  },
  {
    year: '2011',
    title: 'Biogas program launched',
    description: 'Household biogas units begin replacing firewood in remote kitchens.',
    detail:
      'By 2015, we had installed over 400 biogas units, reducing deforestation and improving indoor air quality. The program also trains local technicians to maintain the systems.',
    image: new URL('@/assets/maps/2011.png', import.meta.url).href,
  },
  {
    year: '2007',
    title: 'Expansion to Prey Veng',
    description: 'Education and child protection programming reaches a second province.',
    detail:
      'We partnered with the provincial government to replicate the Svay Rieng model, focusing on school enrolment and community‑based child protection committees.',
    image: new URL('@/assets/maps/2007.png', import.meta.url).href,
  },
  {
    year: '2003',
    title: 'Saving-for-Change begins',
    description:
      'First women-led savings circles launched in Svay Rieng; the model becomes a program backbone.',
    detail:
      'Today, over 500 savings groups exist, with more than 12,000 members. The groups provide micro‑loans and financial literacy training, empowering women to start small businesses.',
    image: new URL('@/assets/maps/2003.png', import.meta.url).href,
  },
  {
    year: '1998',
    title: 'First community forestry site',
    description: 'Village committees take legal stewardship of 120 hectares of degraded forest.',
    detail:
      'The site has since become a model for community‑led reforestation, with over 50,000 trees planted and a thriving biodiversity corridor. It now serves as a learning hub for other villages.',
    image: new URL('@/assets/maps/1998.png', import.meta.url).href,
  },
  {
    year: '1994',
    title: 'Founded in Svay Rieng',
    description:
      'Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery.',
    detail:
      'The founding team began with just five monks and a handful of volunteers. Their first project was rebuilding a primary school destroyed during the conflict, which became the spark for decades of community development.',
    image: new URL('@/assets/maps/1994.png', import.meta.url).href,
  },
]

// ─── State ──────────────────────────────────────────────────────────
const itemsToShow = ref(6)
const showAll = ref(false)

const visibleMilestones = computed(() => {
  return showAll.value ? allMilestones : allMilestones.slice(0, itemsToShow.value)
})

const expanded = ref<boolean[]>(Array.from({ length: allMilestones.length }, () => false))
const cardRefs: (HTMLElement | null)[] = []

function toggleExpand(index: number) {
  expanded.value[index] = !expanded.value[index]
}

function seeMore() {
  showAll.value = true
  nextTick(() => {
    setupObservers()
    updateLineHeight()
  })
}

// ─── Update line height based on visible items ────────────────────
function updateLineHeight() {
  const line = document.querySelector('.timeline-line-animated') as HTMLElement
  const items = document.querySelectorAll('.timeline-item')
  if (line && items.length > 0) {
    const firstItem = items[0] as HTMLElement
    const lastItem = items[items.length - 1] as HTMLElement
    const wrapper = line.parentElement as HTMLElement
    if (firstItem && lastItem && wrapper) {
      const firstRect = firstItem.getBoundingClientRect()
      const lastRect = lastItem.getBoundingClientRect()
      const wrapperRect = wrapper.getBoundingClientRect()
      const topOffset = firstRect.top - wrapperRect.top + firstItem.offsetHeight / 2
      const height = lastRect.bottom - firstRect.top + 20
      line.style.top = `${topOffset}px`
      line.style.height = `${height}px`
    }
  }
}

// ─── Intersection Observer for pop‑up ────────────────────────────
let observers: IntersectionObserver[] = []

function setupObservers() {
  observers.forEach((obs) => obs.disconnect())
  observers = []

  const selectors = ['.timeline-card', '.intro-paragraph', '.intro-image-wrapper', '.cta-box']

  const elements = document.querySelectorAll(selectors.join(','))
  elements.forEach((el) => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('card-visible')
          } else {
            el.classList.remove('card-visible')
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -20px 0px' },
    )
    observer.observe(el)
    observers.push(observer)
  })
}

// ─── Lifecycle ──────────────────────────────────────────────────────
onMounted(() => {
  document.title = 'Our Timeline — Santi Sena'
  nextTick(() => {
    setupObservers()
    updateLineHeight()
  })
})

onBeforeUnmount(() => {
  observers.forEach((obs) => obs.disconnect())
})
</script>

<template>
  <div class="timeline-page">
    <!-- ─── HEADER – now matching the image style ───────────────────── -->
    <header class="hero-header">
      <div class="hero-container">
        <!-- Left column: text -->
        <div class="hero-text-col">
          <!-- Badge -->
          <div class="hero-badge">
            <span class="badge-dot"></span>
            IMPACT · TIMELINE
          </div>

          <!-- Main heading -->
          <h1 class="hero-title">
            Thirty years of<br />
            <span class="highlight">walking with villages.</span>
          </h1>

          <!-- Subtext -->
          <p class="hero-subtext">
            From a small pagoda in Svay Rieng to 293 villages across three provinces — the
            milestones that shaped Santi Sena.
          </p>

          <!-- Stats -->
          <div class="hero-stats">
            <div class="stat-item">
              <span class="stat-number">293</span>
              <span class="stat-label">Villages</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">43</span>
              <span class="stat-label">Communes</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-number">3</span>
              <span class="stat-label">Provinces</span>
            </div>
          </div>
        </div>

        <!-- Right column: image -->
        <div class="hero-image-col">
          <div class="image-frame">
            <img
              src="https://scontent.fpnh19-1.fna.fbcdn.net/v/t1.6435-9/35900553_1047076135445733_7189013137327128576_n.jpg?stp=dst-jpg_tt6&cstp=mx707x707&ctp=s707x707&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=lvEwaw1VE28Q7kNvwF0oeBX&_nc_oc=AdoM-LuhRR9j2YGIxqYi2OJiGUP-ZSRIwiF5h86kvDtDqSOWZHzFau8Sp9m75Ckbn80&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=a1JVpq_FPUd9S2mq43fsuQ&_nc_ss=7b289&oh=00_AQDNWYKPBBXGQ50NyyHleSxn6D2Z25OJKoc40CtgNI3mFw&oe=6A7D5DD8"
              alt="Santi Sena project"
              class="hero-image"
            />
            <!-- Optional caption overlay -->
            <div class="image-caption">
              <span class="caption-line">A Small Beginning</span>
              <span class="caption-line">in Svay Rieng</span>
            </div>
          </div>
          <!-- Decorative ring -->
          <div class="deco-ring"></div>
        </div>
      </div>
    </header>

    <!-- ─── TIMELINE SECTION ────────────────────────────────────────── -->
    <section class="history-section">
      <div class="container">
        <div class="section-heading">
          <span class="label">Timeline</span>
          <h2>Progress built through patient partnership.</h2>
          <p>
            Each step reflects a commitment to long-term, community-led change grounded in trust,
            dignity and local stewardship.
          </p>
        </div>

        <div class="timeline-wrapper">
          <!-- CENTER LINE – properly connecting year to year -->
          <div class="timeline-line-animated"></div>

          <div class="timeline">
            <div
              v-for="(item, index) in visibleMilestones"
              :key="item.year"
              class="timeline-item"
              :class="{ 'timeline-item--reverse': index % 2 }"
            >
              <div
                class="timeline-card"
                @click="toggleExpand(index)"
                :ref="
                  (el: any) => {
                    if (el) cardRefs[index] = el
                  }
                "
              >
                <div class="card-content">
                  <div class="card-text">
                    <h3>{{ item.title }}</h3>
                    <p class="card-summary">{{ item.description }}</p>
                    <div v-if="expanded[index]" class="card-detail">
                      <p>{{ item.detail }}</p>
                      <span class="read-less">— click to collapse</span>
                    </div>
                    <span v-else class="read-more wave-link">Read more</span>
                  </div>
                  <div class="card-image">
                    <img :src="item.image" :alt="item.title" />
                  </div>
                </div>
              </div>

              <div class="timeline-node">
                <div class="node-line"></div>
                <div class="node-dot">
                  <span class="dot-inner"></span>
                </div>
                <!-- Year now displayed directly from data, not animated -->
                <div class="node-year">{{ item.year }}</div>
              </div>
            </div>
          </div>

          <div v-if="!showAll" class="see-more-wrapper">
            <button class="see-more-btn" @click="seeMore">
              See more <span class="arrow-down">↓</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── INTRO SECTION ────────────────────────────────────────────── -->
    <section class="intro-section">
      <div class="container">
        <div class="intro-grid">
          <div class="intro-content">
            <h2 class="typewriter-title">Santi Sena Cambodia</h2>

            <p class="intro-paragraph">
              For more than <strong>30 years</strong>, Santi Sena Cambodia has partnered with rural
              communities to build peaceful, resilient and sustainable livelihoods through
              community-led development.
            </p>

            <p class="intro-paragraph">
              Working across
              <span class="highlight">293 villages</span>,
              <span class="highlight">43 communes</span>, and
              <span class="highlight">3 provinces</span>, we empower children, youth and families
              through education, child protection, environmental conservation, sustainable
              livelihoods and local leadership.
            </p>

            <p class="intro-paragraph">
              Our approach is rooted in dignity, trust and long-term partnership, ensuring
              communities have the opportunities and capacity to create lasting change for future
              generations.
            </p>
          </div>

          <div class="intro-image-wrapper">
            <img
              class="intro-image"
              src="https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/518369856_1064716752452895_8342529662744533325_n.jpg?stp=dst-jpg_tt6&cstp=mx1280x960&ctp=s1280x960&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=qyirV5WPo14Q7kNvwFLDk7z&_nc_oc=Adq2ZOKi6URgK9Zmzn4mRejk5lGoTt_PdbfzuoR5zZ8hhipOHjNaWowvVak5yxtQZr4&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=8ResXVthMO7ESrszlzqP1Q&_nc_ss=7b289&oh=00_AQDFOfRP_EizcGUb5Fi_BaCZCecWRUmmAZLHhpdKey1cZg&oe=6A63350B"
              alt="Santi Sena Cambodia"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- ─── CTA SECTION ──────────────────────────────────────────────── -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <div class="cta-text">
            <span class="cta-label">Partnership</span>
            <h3>Ready to take the next step?</h3>
          </div>
          <RouterLink to="/impact" class="cta-button">
            Back to impact
            <span class="arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Global ── */
.timeline-page {
  min-height: 100vh;
  background: #faf8f5;
  color: #1e1a16;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* ════════════════════════════════════════════
   HEADER – Clean, light, two‑column layout
   ════════════════════════════════════════════ */
.hero-header {
  width: 100%;
  padding: 4rem 0 3rem;
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.04);
}

.hero-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 4rem;
  gap: 4rem;
}

/* Left column */
.hero-text-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.org-header {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.org-name {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  color: #1a3d2e;
}

.org-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: #6a7a72;
  font-weight: 500;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: #11cf80;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.2rem 1rem 0.2rem 0.6rem;
  border-radius: 999px;
  border: 1px solid rgba(45, 122, 90, 0.1);
  width: fit-content;
  margin-left: 60px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef6a0b;
  display: inline-block;
}

.hero-title {
  font-size: clamp(1.6rem, 3.5vw, 4.2rem);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  color: #1a3d2e;
  margin-left: 60px;
}

.hero-title .highlight {
  color: #17712c;
  position: relative;
}

.hero-title .highlight::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0.1em;
  width: 100%;
  height: 0.12em;
  background: #aad6c7;
  opacity: 0.4;
  border-radius: 2px;
}

.hero-subtext {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #5a524a;
  max-width: 520px;
  margin: 0;
  margin-left: 60px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 2.5rem;
  padding-top: 0.3rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60px;
}

.stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: #092064;
  letter-spacing: -0.02em;
  line-height: 1;
}

.stat-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #014078;
  margin-top: 0.2rem;
}

.stat-divider {
  width: 1px;
  height: 2.8rem;
  background: #57c47f;
}

/* Right column – image */
.hero-image-col {
  flex: 0 0 44%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-frame {
  position: relative;
  width: 100%;
  max-width: 540px;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(26, 61, 46, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.04);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.image-frame:hover {
  transform: scale(1.01);
  box-shadow: 0 30px 80px rgba(26, 61, 46, 0.12);
}

.hero-image {
  width: 100%;
  height: auto;
  display: block;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.image-frame:hover .hero-image {
  transform: scale(1.03);
}

.image-caption {
  position: absolute;
  bottom: 1.5rem;
  left: 1.5rem;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #72290f;
  letter-spacing: 0.02em;
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.caption-line:first-child {
  font-weight: 400;
  color: #6a7a72;
  font-size: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.deco-ring {
  position: absolute;
  top: -10%;
  right: -8%;
  width: 60%;
  height: 80%;
  border-radius: 50%;
  border: 1px solid rgba(45, 122, 90, 0.06);
  pointer-events: none;
  z-index: 0;
  animation: ringFloat 12s ease-in-out infinite;
}

@keyframes ringFloat {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.5;
  }
  50% {
    transform: translate(-4%, 4%) scale(1.04);
    opacity: 0.8;
  }
}

/* ── Responsive header ── */
@media (max-width: 1024px) {
  .hero-container {
    flex-direction: column;
    padding: 0 2rem;
    gap: 2.5rem;
  }
  .hero-text-col {
    align-items: center;
    text-align: center;
  }
  .hero-badge {
    align-self: center;
    margin-left: 0 !important;
  }
  .hero-title {
    margin-left: 0 !important;
  }
  .hero-subtext {
    margin-left: 0 !important;
    max-width: 100%;
  }
  .hero-stats {
    justify-content: center;
  }
  .stat-item {
    margin-left: 0 !important;
  }
  .hero-image-col {
    flex: none;
    width: 100%;
    max-width: 500px;
  }
  .deco-ring {
    display: none;
  }
}

@media (max-width: 640px) {
  .hero-header {
    padding: 2rem 0;
  }
  .hero-container {
    padding: 0 1rem;
  }
  .hero-title {
    font-size: 2rem;
  }
  .hero-subtext {
    font-size: 0.95rem;
  }
  .hero-stats {
    gap: 1.5rem;
    flex-wrap: wrap;
  }
  .stat-number {
    font-size: 1.6rem;
  }
  .stat-divider {
    height: 2rem;
  }
  .org-tagline {
    font-size: 0.65rem;
  }
  .image-caption {
    bottom: 1rem;
    left: 1rem;
    padding: 0.4rem 1rem;
    font-size: 0.65rem;
  }
}

/* ── The rest of the styles (timeline, intro, CTA) remain unchanged ── */
/* ── Section Heading ── */
.history-section {
  padding: 80px 0 60px;
  background: #93f6cd39;
  position: relative;
}

.section-heading {
  text-align: center;
  margin-bottom: 70px;
}

.section-heading .label {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2d7a5a;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.3rem 1.4rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.section-heading h2 {
  font-size: clamp(1.8rem, 2.8vw, 3.2rem);
  font-weight: 700;
  color: #15793b;
  margin: 0.5rem 0 1rem;
  letter-spacing: -0.02em;
}

.section-heading p {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.05rem;
  line-height: 1.8;
  color: #5a524a;
}

/* ── Timeline ── */
.timeline-wrapper {
  position: relative;
}

.timeline-line-animated {
  position: absolute;
  left: 50%;
  top: 0;
  width: 3px;
  transform: translateX(-50%);
  background: linear-gradient(
    to bottom,
    rgba(45, 122, 90, 0.15) 0%,
    #2d7a5a 15%,
    #5aad8a 40%,
    #2d7a5a 70%,
    rgba(45, 122, 90, 0.15) 100%
  );
  border-radius: 4px;
  z-index: 0;
  pointer-events: none;
  box-shadow: 0 0 20px rgba(45, 122, 90, 0.06);
  transition:
    height 0.3s ease,
    top 0.3s ease;
}

.timeline-line-animated::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 4px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(90, 173, 138, 0.3) 30%,
    rgba(45, 122, 90, 0.4) 50%,
    rgba(90, 173, 138, 0.3) 70%,
    transparent 100%
  );
  animation: lineGlow 4s ease-in-out infinite;
}

@keyframes lineGlow {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

.timeline {
  position: relative;
  z-index: 1;
}

.timeline-item {
  display: flex;
  margin-bottom: 40px;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.timeline-item--reverse {
  flex-direction: row-reverse;
}

.timeline-card {
  width: 45%;
  background: #ffffff;
  border-radius: 1.25rem;
  box-shadow: 0 8px 30px rgba(47, 36, 29, 0.06);
  border: 1px solid rgba(47, 36, 29, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    opacity 0.6s ease,
    border-color 0.3s ease;
  overflow: hidden;
  cursor: pointer;
  opacity: 0;
  transform: translateY(30px) scale(0.96);
}

.timeline-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.timeline-card:hover {
  transform: translateY(-4px) scale(1.01);
  box-shadow: 0 16px 48px rgba(47, 36, 29, 0.1);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1rem 1.25rem;
}

.timeline-item--reverse .card-content {
  flex-direction: row-reverse;
}

.card-text {
  flex: 1;
}

.card-text h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #15793b;
  margin: 0 0 0.3rem;
}

.card-summary {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #5a524a;
  margin: 0;
}

.card-detail {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(47, 36, 29, 0.08);
  animation: fadeDetail 0.25s ease;
}

@keyframes fadeDetail {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-detail p {
  font-size: 0.9rem;
  line-height: 1.7;
  color: #4a423a;
  margin: 0 0 0.5rem 0;
}

.read-more,
.read-less {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ee8700;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
  transition: all 0.25s ease;
}
.read-more {
  color: #0682ef;
}
.read-less {
  color: #8a7a6a;
  font-weight: 400;
}

.wave-link {
  display: inline-block;
  animation: wavePulse 2.2s ease-in-out infinite;
  transform-origin: center;
}

@keyframes wavePulse {
  0%,
  100% {
    transform: translateX(0) scale(1);
    color: #2d7a5a;
  }
  25% {
    transform: translateX(4px) scale(1.04);
    color: #1a6a4a;
  }
  50% {
    transform: translateX(-2px) scale(0.98);
    color: #2d7a5a;
  }
  75% {
    transform: translateX(3px) scale(1.02);
    color: #1a6a4a;
  }
}

.card-image {
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 50%;
  border: 4px solid #e8e3dc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.card-image img {
  display: block;
  width: 100px;
  height: 100px;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.timeline-card:hover .card-image img {
  transform: scale(1.15);
}

/* ── Timeline Node ── */
.timeline-node {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
}

.node-dot {
  width: 24px;
  height: 24px;
  background: #faf8f5;
  border: 3px solid #2d7a5a;
  border-radius: 50%;
  box-shadow:
    0 0 0 2px #faf8f5,
    0 0 20px rgba(45, 122, 90, 0.15);
  flex-shrink: 0;
  z-index: 2;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dot-inner {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #2d7a5a;
  transition: all 0.3s ease;
}

.node-year {
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(0.92);
  white-space: nowrap;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;

  background: transparent;
  border: none;
  box-shadow: none;
  border-radius: 0;
  padding: 0;

  opacity: 1;

  transition:
    opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.9s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease,
    color 0.3s ease;
}

/* when card is visible on scroll, show year at the same time */
.timeline-card.card-visible ~ .timeline-node .node-year {
  transform: translateY(-50%) scale(1);
}

/* hover bump */
.timeline-card:hover ~ .timeline-node .node-year {
  transform: translateY(-50%) scale(1.05);
  border-color: rgba(29, 138, 79, 0.35);
  box-shadow: 0 14px 34px rgba(29, 138, 79, 0.2);
}

.timeline-item:not(.timeline-item--reverse) .node-year {
  left: 100%;
  margin-left: 18px;
}

.timeline-item--reverse .node-year {
  right: 100%;
  margin-right: 18px;
}

.node-line {
  position: absolute;
  width: 2px;
  background: #c8d6ce;
  height: 100%;
  top: -50%;
  z-index: 0;
  transform-origin: center;
  transition: background 0.3s ease;
}

.timeline-item:hover .node-dot {
  border-color: #1d8a4f;
  box-shadow:
    0 0 0 2px #faf8f5,
    0 0 30px rgba(45, 122, 90, 0.3);
}

.timeline-item:hover .dot-inner {
  background: #1d8a4f;
  box-shadow: 0 0 20px rgba(45, 122, 90, 0.5);
}

.timeline-item:hover .node-line {
  background: linear-gradient(to bottom, #2d7a5a, #5aad8a);
}

.timeline-item:hover .node-year {
  color: #1d8a4f;
}

.timeline-item:hover .timeline-card {
  border-color: #2d7a5a;
  box-shadow: 0 0 30px rgba(45, 122, 90, 0.12);
}

/* ── See More ── */
.see-more-wrapper {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0 0.5rem;
  position: relative;
  z-index: 2;
  background: transparent;
}

.see-more-btn {
  padding: 0.8rem 2.5rem;
  border: 2px solid #2d7a5a;
  background: #faf8f5;
  color: #2d7a5a;
  font-size: 1rem;
  font-weight: 700;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
  letter-spacing: 0.04em;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 3;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.see-more-btn:hover {
  background: #2d7a5a;
  color: #fff;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 122, 90, 0.25);
}

.arrow-down {
  display: inline-block;
  transition: transform 0.3s ease;
}

.see-more-btn:hover .arrow-down {
  transform: translateY(3px);
}

/* ── Intro Section ── */
.intro-section {
  padding: 90px 0;
  background: #fff;
}

.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}

.intro-content h2 {
  font-size: 42px;
  font-weight: 700;
  color: #15793b;
  margin-bottom: 30px;
}

.typewriter-title {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  border-right: 3px solid #2d7a5a;
  animation:
    typewriter 2s steps(20) 0.5s forwards,
    blinkCursor 0.7s step-end infinite alternate;
  width: 0;
  max-width: fit-content;
}

@keyframes typewriter {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

@keyframes blinkCursor {
  0%,
  100% {
    border-color: transparent;
  }
  50% {
    border-color: #2d7a5a;
  }
}

.intro-paragraph {
  font-size: 18px;
  line-height: 1.8;
  color: #444;
  margin-bottom: 22px;
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.intro-paragraph.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.highlight {
  color: #ff7207;
  font-weight: 700;
}

.intro-image-wrapper {
  overflow: hidden;
  border-radius: 16px;
  opacity: 0;
  transform: translateX(30px) scale(0.95);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}

.intro-image-wrapper.card-visible {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.intro-image {
  display: block;
  width: 100%;
  border-radius: 16px;
  transition:
    transform 0.4s ease,
    box-shadow 0.4s ease;
}

.intro-image-wrapper:hover .intro-image {
  transform: scale(1.04) rotate(-1deg);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

/* ── CTA ── */
.cta-section {
  padding: 40px 0 60px;
  background: #f6faf5;
}

.cta-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: #c0f1e23b;
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(30, 80, 60, 0.06);
  box-shadow: 0 4px 20px rgba(47, 36, 29, 0.04);
  opacity: 0;
  transform: translateY(30px) scale(0.95);
  transition:
    opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.cta-box.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.cta-text .cta-label {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.6rem;
  font-weight: 700;
  color: #2d7a5a;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.15rem 1rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}

.cta-text h3 {
  font-weight: 600;
  font-size: 1.3rem;
  color: #15793b;
  margin: 0;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: #078632;
  color: #fff;
  box-shadow: 0 8px 20px rgba(45, 122, 90, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(45, 122, 90, 0.3);
}

.arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.cta-button:hover .arrow {
  transform: translateX(3px);
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .timeline-line-animated {
    display: none;
  }

  .timeline-item,
  .timeline-item--reverse {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 40px;
  }

  .timeline-card {
    width: 100%;
  }

  .card-content {
    flex-direction: row !important;
    padding: 1rem;
  }

  .timeline-item--reverse .card-content {
    flex-direction: row !important;
  }

  .timeline-node {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-top: 16px;
    pointer-events: auto;
  }

  .node-line {
    display: none;
  }

  .node-year {
    position: static;
    transform: none;
    font-size: 1.8rem;
    margin: 0;
  }

  .node-dot {
    width: 20px;
    height: 20px;
  }

  .dot-inner {
    width: 6px;
    height: 6px;
  }

  .timeline-item:not(.timeline-item--reverse) .node-year,
  .timeline-item--reverse .node-year {
    left: auto;
    right: auto;
    margin-left: 0;
    margin-right: 0;
  }

  .intro-grid {
    grid-template-columns: 1fr;
  }

  .intro-content h2 {
    font-size: 40px;
  }

  .intro-image-wrapper {
    order: -1;
  }
}

@media (max-width: 640px) {
  .section-heading {
    margin-bottom: 40px;
  }

  .section-heading h2 {
    font-size: 1.8rem;
  }

  .section-heading p {
    font-size: 0.95rem;
  }

  .card-content {
    flex-direction: column !important;
    text-align: center;
    padding: 1rem;
  }

  .timeline-item--reverse .card-content {
    flex-direction: column !important;
  }

  .card-image img {
    width: 80px;
    height: 80px;
  }

  .card-text h3 {
    font-size: 1.1rem;
  }

  .card-text p {
    font-size: 0.85rem;
  }

  .cta-box {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }

  .cta-text h3 {
    font-size: 1.1rem;
  }

  .typewriter-title {
    font-size: 1.8rem;
    white-space: normal;
    border-right: none;
    animation: none;
    width: 100%;
  }

  .see-more-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
