<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'

const stats = [
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

interface WorkItem {
  title: string
  text: string
  image: string
}

const whatWeDo: [WorkItem, WorkItem, WorkItem, WorkItem, WorkItem, WorkItem] = [
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
    image: '/images/programs/livelihood-hero4.jpg',
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

// icon key per bullet, used only to pick which badge icon renders next to each "Why it matters" line
const whyItMatters = [
  {
    text: 'Household income diversification reduces the risk of debt bondage and trafficking',
    icon: 'shield',
  },
  { text: 'Women-led savings shift decision-making power inside the household', icon: 'key' },
  { text: 'Cooperatives break the isolation of the smallholder in the marketplace', icon: 'users' },
  { text: 'Local enterprise keeps young adults in the village, near their children', icon: 'home' },
]

const radialWrap = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const items = radialWrap.value?.querySelectorAll('.radial-center, .radial-item')
  if (!items) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -60px 0px' },
  )

  items.forEach((el) => observer?.observe(el))
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="education-page">
    <!-- Hero -->
    <div class="hero-wrap">

      <div class="scroll-cue" aria-hidden="true"><span></span></div>
    </div>

    <!-- Stats band — bridges hero into content -->
    <div class="container stats-band-wrap">
      <div class="stats-band">
        <template v-for="(stat, i) in stats" :key="stat.label">
          <div class="stat-item">
            <span class="stat-icon">
              <svg
                v-if="stat.icon === 'wallet'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="2.5"
                  y="6.5"
                  width="19"
                  height="13"
                  rx="2.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M16.5 6.5V5a2 2 0 00-2-2H7a2 2 0 00-2 2v1.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <circle cx="16.5" cy="13" r="1.6" fill="currentColor" />
              </svg>
              <svg
                v-else-if="stat.icon === 'users'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M15 20c0-2.6 2-4.6 5-4.6"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="4"
                  y="3"
                  width="16"
                  height="18"
                  rx="1.5"
                  stroke="currentColor"
                  stroke-width="1.6"
                />
                <path
                  d="M9 21v-4.5h6V21"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <path
                  d="M8 7.5h1.2M8 11.5h1.2M14.8 7.5H16M14.8 11.5H16"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
            </span>
            <div class="stat-copy">
              <h2 class="stat-number">{{ stat.number }}</h2>
              <p class="stat-label">{{ stat.label }}</p>
              <p class="stat-desc">{{ stat.description }}</p>
            </div>
          </div>
          <div v-if="i < stats.length - 1" class="stat-divider" aria-hidden="true"></div>
        </template>
      </div>
    </div>

    <!-- Intro -->
    <section class="section-cream intro-section">
      <div class="container">
        <div class="intro-rule" aria-hidden="true"></div>
        <p class="intro-text text-center">
          Poverty pushes rural Cambodians into unsafe migration and predatory debt. Santi Sena
          answers with income at home — soil restored, savings pooled, cooperatives negotiating fair
          prices, and small enterprises rooted in local resources.
        </p>
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
<img :src="whatWeDo[0]?.image" alt="" />
{{ whatWeDo[0]?.text }}
            </div>

            <div class="radial-item radial-item--1">
<div class="radial-thumb"><img :src="whatWeDo[1]?.image" alt="" /></div>
              <div class="radial-copy">
{{ whatWeDo[1]?.title }}
{{ whatWeDo[1]?.text }}
              </div>
            </div>

            <div class="radial-item radial-item--2">
<div class="radial-thumb"><img :src="whatWeDo[2]?.image" alt="" /></div>
              <div class="radial-copy">
{{ whatWeDo[2]?.title }}
{{ whatWeDo[2]?.text }}
              </div>
            </div>

            <div class="radial-item radial-item--3">
<div class="radial-thumb"><img :src="whatWeDo[3]?.image" alt="" /></div>
              <div class="radial-copy">
{{ whatWeDo[3]?.title }}
{{ whatWeDo[3]?.text }}
              </div>
            </div>

            <div class="radial-item radial-item--4">
<div class="radial-thumb"><img :src="whatWeDo[4]?.image" alt="" /></div>
              <div class="radial-copy">
{{ whatWeDo[4]?.title }}
{{ whatWeDo[4]?.text }}
              </div>
            </div>

            <div class="radial-item radial-item--5">
<div class="radial-thumb"><img :src="whatWeDo[5]?.image" alt="" /></div>
              <div class="radial-copy">
{{ whatWeDo[5]?.title }}
{{ whatWeDo[5]?.text }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our approach — full-bleed photo statement -->
    <section class="quote-section">
      <div class="quote-overlay"></div>
      <div class="container quote-inner">
        <p class="section-eyebrow section-eyebrow--light text-center">Our method</p>
        <h2 class="section-title section-title--light text-center">Our approach</h2>
        <p class="approach-text approach-text--light text-center">
          We do not distribute cash. We build the systems — saving groups, cooperatives, farmer
          schools — that let a household earn, save, invest and repeat. Every group is coached for
          18–24 months, then graduates to independence with our field team on call.
        </p>

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
            "Our group has lent to twelve families for chickens and school fees. Nobody has left for
            Thailand this year."
          </p>
        </div>
      </div>
    </section>

    <!-- Why it matters — image + impact card grid -->
    <section class="section-cream">
      <div class="container">
        <div class="two-col-grid reverse">
          <div class="col-image">
            <div class="col-image-frame">
              <img
                src="/images/programs/livelihood-hero2.jpg"
                alt="Savings group members meeting together"
              />
            </div>
          </div>
          <div class="col-text">
            <p class="section-eyebrow">Our impact</p>
            <h2 class="section-title">Why it matters</h2>
            <div class="impact-grid">
              <div v-for="item in whyItMatters" :key="item.text" class="impact-card">
                <span class="icon-badge">
                  <svg
                    v-if="item.icon === 'shield'"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <svg
                    v-else-if="item.icon === 'key'"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="8" cy="15" r="4" stroke="currentColor" stroke-width="1.8" />
                    <path
                      d="M11 12l8-8M16 4l3 3M19 6l2 2"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg
                    v-else-if="item.icon === 'users'"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8" />
                    <path
                      d="M3 20c0-3 3-5 6-5s6 2 6 5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                    <circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8" />
                    <path
                      d="M15 20c0-2.5 2-4.5 5-4.5"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                    />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M4 11l8-7 8 7"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9"
                      stroke="currentColor"
                      stroke-width="1.8"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
                <p>{{ item.text }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA banner -->
    <section class="cta-banner">
      <div class="cta-banner-glow" aria-hidden="true"></div>
      <div class="container cta-banner-inner">
        <p class="cta-banner-eyebrow">Get involved</p>
        <h2 class="cta-banner-title">Ready to take the next step?</h2>
        <router-link to="/get-involved" class="btn-primary btn-large">
          Seed a savings group
          <span class="btn-arrow">→</span>
        </router-link>
      </div>
    </section>
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
  margin-top: -64px;
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
.stat-icon svg {
  width: 22px;
  height: 22px;
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

/* ===== "What we do" — grid gallery (center image + 5 items, no overlap possible) ===== */
.do-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.radial-wrap {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(340px, 420px) minmax(220px, 1fr);
  grid-template-rows: repeat(3, minmax(150px, auto));
  grid-template-areas:
    '.     center item1'
    'item5 center item2'
    'item4 center item3';
  column-gap: 2.5rem;
  row-gap: 2.25rem;
  align-items: center;
  margin-top: 1.5rem;
}

.radial-center {
  grid-area: center;
  align-self: center;
  justify-self: center;
  width: 100%;
  text-align: center;
}
.radial-center img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  display: block;
  border-radius: 4px;
}
.radial-center-text {
  margin: 1.75rem 0 0;
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.4;
}

.radial-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.radial-item--1 {
  grid-area: item1;
}
.radial-item--2 {
  grid-area: item2;
}
.radial-item--3 {
  grid-area: item3;
}
.radial-item--4 {
  grid-area: item4;
}
.radial-item--5 {
  grid-area: item5;
}

.radial-thumb {
  flex-shrink: 0;
  width: 132px;
  height: 132px;
  padding: 6px;
  background: var(--color-cream, #f2f5ee);
  border: 1px solid rgba(22, 52, 42, 0.12);
  box-shadow: 0 6px 16px -8px rgba(22, 52, 42, 0.25);
}
.radial-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.radial-copy {
  min-width: 0;
}
.radial-title {
  color: var(--primary-color);
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

/* Scroll-in reveal */
.radial-center,
.radial-item {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity 0.7s ease,
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
}
.radial-center.is-visible,
.radial-item.is-visible {
  opacity: 1;
  transform: translateY(0);
}
.radial-item--1.is-visible {
  transition-delay: 0.05s;
}
.radial-item--2.is-visible {
  transition-delay: 0.15s;
}
.radial-item--3.is-visible {
  transition-delay: 0.25s;
}
.radial-item--4.is-visible {
  transition-delay: 0.1s;
}
.radial-item--5.is-visible {
  transition-delay: 0.2s;
}

/* Mobile: single column stack, center first */
@media (max-width: 900px) {
  .radial-wrap {
    grid-template-columns: 1fr;
    grid-template-areas:
      'center'
      'item1'
      'item2'
      'item3'
      'item4'
      'item5';
    row-gap: 1.75rem;
  }
  .radial-center img {
    height: 260px;
  }
}

/* ===== Our approach — full-bleed photo quote ===== */
.quote-section {
  position: relative;
  padding: 6.5rem 0;
  background-image: url('/images/programs/livelihood-hero4.jpg');
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
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.55rem;
  color: #ffffff;
  line-height: 1.6;
}

/* ===== Why it matters — impact card grid ===== */
.impact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.impact-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 1.4rem;
  box-shadow: 0 10px 24px -14px rgba(22, 52, 42, 0.18);
  border: 1px solid rgba(22, 52, 42, 0.06);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
.impact-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 36px -16px rgba(22, 52, 42, 0.28);
  border-color: rgba(22, 52, 42, 0.12);
}
.impact-card p {
  color: #333;
  line-height: 1.55;
  font-size: 0.94rem;
  margin: 0;
}
.icon-badge {
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--primary-light);
  color: var(--primary-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.85rem;
}
.icon-badge svg {
  width: 16px;
  height: 16px;
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

  .two-col-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .two-col-grid.reverse .col-image {
    order: 0;
  }
  .two-col-grid.reverse .col-text {
    order: 1;
  }

  .impact-grid {
    grid-template-columns: 1fr;
  }

  .quote-section {
    padding: 4.5rem 0;
    background-attachment: scroll;
  }
  .quote-text {
    font-size: 1.25rem;
  }

  .cta-banner {
    padding: 3.5rem 0;
  }
}
</style>
