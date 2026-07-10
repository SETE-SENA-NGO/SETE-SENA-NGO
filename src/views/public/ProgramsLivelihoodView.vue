<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const images = [
  '/images/programs/livelihood-hero1.jpg',
  '/images/programs/livelihood-hero2.jpg',
  '/images/programs/livelihood-hero3.jpg',
  '/images/programs/livelihood-hero4.jpg',
]

const currentIndex = ref(0)
let intervalId: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  currentIndex.value = (currentIndex.value + 1) % images.length
}
function prevSlide() {
  currentIndex.value = (currentIndex.value - 1 + images.length) % images.length
}
function goToSlide(index: number) {
  currentIndex.value = index
}
function startAutoPlay() {
  if (images.length > 1) intervalId = setInterval(nextSlide, 5000)
}
function stopAutoPlay() {
  if (intervalId) clearInterval(intervalId)
}

onMounted(() => startAutoPlay())
onUnmounted(() => stopAutoPlay())

const stats = [
  { number: '180+', label: 'SAVINGS GROUPS', description: 'Women-led Saving-for-Change circles active across three provinces.' },
  { number: '2,400+', label: 'MEMBERS', description: 'Saving, lending and investing together.' },
  { number: '12', label: 'COOPERATIVES', description: 'Rice, vegetables, melaleuca oil and handicrafts.' },
]

const whatWeDo = [
  'Integrated farming systems (rice + fish + vegetables + livestock on one plot)',
  'Saving-for-Change (SfC) self-help groups, primarily women-led',
  'Agricultural cooperatives for collective bargaining and shared equipment',
  'Rural enterprise development — melaleuca oil, honey, handicrafts',
  'Financial literacy, bookkeeping and micro-enterprise training',
  'Market linkages with provincial buyers and social enterprises',
]

// icon key per bullet, used only to pick which badge icon renders next to each "Why it matters" line
const whyItMatters = [
  { text: 'Household income diversification reduces the risk of debt bondage and trafficking', icon: 'shield' },
  { text: 'Women-led savings shift decision-making power inside the household', icon: 'key' },
  { text: 'Cooperatives break the isolation of the smallholder in the marketplace', icon: 'users' },
  { text: 'Local enterprise keeps young adults in the village, near their children', icon: 'home' },
]
</script>

<template>
  <div class="education-page">
    <!-- Hero Section (Slideshow) -->
    <section
      class="hero"
      @mouseenter="stopAutoPlay"
      @mouseleave="startAutoPlay"
    >
      <div class="hero-slides">
        <div
          v-for="(img, index) in images"
          :key="img"
          class="hero-slide"
          :class="{ active: index === currentIndex }"
          :style="{ backgroundImage: `url(${img})` }"
        ></div>
      </div>

      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="eyebrow">PROGRAMS · GOAL 03 LIVELIHOODS</p>
        <h1>Dignified work rooted in the village.</h1>
        <p class="hero-desc">
          Integrated farming, Saving-for-Change groups, agricultural cooperatives and
          rural enterprise — livelihoods that keep families together instead of sending
          parents abroad for wages.
        </p>
      </div>

      <button v-if="images.length > 1" class="hero-arrow hero-arrow-left" @click="prevSlide">‹</button>
      <button v-if="images.length > 1" class="hero-arrow hero-arrow-right" @click="nextSlide">›</button>

      <div v-if="images.length > 1" class="hero-dots">
        <button
          v-for="(img, index) in images"
          :key="'dot-' + index"
          class="hero-dot"
          :class="{ active: index === currentIndex }"
          @click="goToSlide(index)"
        ></button>
      </div>
    </section>

    <!-- Intro + Stats -->
    <section class="section-cream">
      <div class="container">
        <p class="intro-text">
          Poverty pushes rural Cambodians into unsafe migration and predatory debt.
          Santi Sena answers with income at home — soil restored, savings pooled,
          cooperatives negotiating fair prices, and small enterprises rooted in local
          resources.
        </p>

        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <h2 class="stat-number">{{ stat.number }}</h2>
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-desc">{{ stat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What we do -->
    <section class="section-light">
      <div class="container">
        <div class="two-col-grid">
          <div class="col-text">
            <h2 class="section-title">What we do</h2>
            <ul class="check-list">
              <li v-for="item in whatWeDo" :key="item">
                <span class="check-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="col-image">
            <img src="/images/programs/livelihood-hero1.jpg" alt="Farmer tending an integrated farming plot" />
          </div>
        </div>
      </div>
    </section>

    <!-- Our approach -->
    <section class="section-cream">
      <div class="container">
        <h2 class="section-title text-center">Our approach</h2>
        <p class="approach-text text-center">
          We do not distribute cash. We build the systems — saving groups,
          cooperatives, farmer schools — that let a household earn, save, invest
          and repeat. Every group is coached for 18–24 months, then graduates to
          independence with our field team on call.
        </p>

        <div class="quote-card">
          <span class="quote-mark">”</span>
          <p class="quote-text">
            "Our group has lent to twelve families for chickens and school fees.
            Nobody has left for Thailand this year."
          </p>
          <div class="quote-author">
            <div class="author-avatar">C</div>
            <div class="author-info">
              <p class="author-name">— Chenda</p>
              <p class="author-role">SfC treasurer, Svay Rieng</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why it matters -->
    <section class="section-light">
      <div class="container">
        <div class="two-col-grid reverse">
          <div class="col-image">
            <img src="/images/programs/livelihood-hero2.jpg" alt="Savings group members meeting together" />
          </div>
          <div class="col-text">
            <h2 class="section-title">Why it matters</h2>
            <ul class="icon-list">
              <li v-for="item in whyItMatters" :key="item.text">
                <span class="icon-badge">
                  <svg v-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <svg v-else-if="item.icon === 'key'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="8" cy="15" r="4" stroke="currentColor" stroke-width="2"/>
                    <path d="M11 12l8-8M16 4l3 3M19 6l2 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <svg v-else-if="item.icon === 'users'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 20c0-3 3-5 6-5s6 2 6 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    <circle cx="17" cy="9" r="2.5" stroke="currentColor" stroke-width="2"/>
                    <path d="M15 20c0-2.5 2-4.5 5-4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 11l8-7 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6 10v9a1 1 0 001 1h10a1 1 0 001-1v-9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>{{ item.text }}</span>
              </li>
            </ul>

            <div class="cta-inline">
              <p class="cta-inline-text">Ready to take the next step?</p>
              <router-link to="/get-involved" class="btn-primary">Seed a savings group →</router-link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.education-page {
  --cream: #fdf6e9;
  --dark-green: #16342a;
  --orange: #d97a34;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  font-family: var(--font-body);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0 2rem;
}
.hero-slides {
  position: absolute;
  inset: 0;
}
.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.hero-slide.active {
  opacity: 1;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(22,52,42,0.75) 0%, rgba(22,52,42,0.3) 60%, transparent 100%);
  z-index: 1;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  color: white;
  padding-left: 3rem;
}
.eyebrow {
  color: var(--orange);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  font-family: var(--font-body);
}
.hero-content h1 {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 3rem;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
}
.hero-desc {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.95;
}

/* Arrows */
.hero-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 2rem;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}
.hero-arrow:hover {
  background: rgba(255, 255, 255, 0.4);
}
.hero-arrow-left { left: 1.5rem; }
.hero-arrow-right { right: 1.5rem; }

/* Dots */
.hero-dots {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  gap: 0.5rem;
}
.hero-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.hero-dot.active {
  background: white;
}

/* Cream / light sections */
.section-cream {
  background: var(--cream);
  padding: 3.5rem 0;
}
.section-light {
  background: #f2f5ee;
  padding: 3.5rem 0;
}
.intro-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--dark-green);
  max-width: 800px;
  margin-bottom: 2.5rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.stat-card {
  background: #fffaf0;
  border-radius: 16px;
  padding: 1.75rem;
}
.stat-number {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 2.5rem;
  color: var(--orange);
  margin-bottom: 0.5rem;
}
.stat-label {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: var(--dark-green);
  margin-bottom: 0.4rem;
}
.stat-desc {
  color: #5c5c5c;
  font-size: 0.95rem;
}

/* Section titles */
.section-title {
  font-family: var(--font-body);
  font-weight: 700;
  color: var(--dark-green);
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
}
.text-center {
  text-align: center;
}

/* Two-column layout (What we do / Why it matters) */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}
.two-col-grid.reverse .col-image {
  order: 1;
}
.two-col-grid.reverse .col-text {
  order: 2;
}
.col-image img {
  width: 100%;
  height: 100%;
  min-height: 320px;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

/* Check list (What we do) */
.check-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.check-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.55;
}
.check-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e3efe0;
  color: var(--dark-green);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.check-icon svg {
  width: 13px;
  height: 13px;
}

/* Approach + Quote card */
.approach-text {
  line-height: 1.7;
  color: #333;
  max-width: 850px;
  margin: 0 auto 2.5rem;
}
.quote-card {
  position: relative;
  background: #e3f2e6;
  border-radius: 20px;
  padding: 2.5rem 3rem;
  max-width: 750px;
  margin: 0 auto;
  overflow: hidden;
}
.quote-mark {
  position: absolute;
  top: 0.5rem;
  left: 1.5rem;
  font-family: var(--font-heading);
  font-size: 5rem;
  color: rgba(22, 52, 42, 0.15);
  line-height: 1;
}
.quote-text {
  position: relative;
  font-style: italic;
  font-family: var(--font-heading);
  font-size: 1.2rem;
  color: var(--dark-green);
  line-height: 1.6;
  margin-bottom: 1.5rem;
}
.quote-author {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.author-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--dark-green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-weight: 600;
  flex-shrink: 0;
}
.author-name {
  font-weight: 700;
  color: var(--dark-green);
  font-size: 0.95rem;
}
.author-role {
  color: #667;
  font-size: 0.85rem;
}

/* Icon list (Why it matters) */
.icon-list {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}
.icon-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 1rem;
  color: #333;
  line-height: 1.55;
}
.icon-badge {
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 7px;
  background: var(--dark-green);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
}
.icon-badge svg {
  width: 15px;
  height: 15px;
}

/* Inline CTA within Why it matters */
.cta-inline {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}
.cta-inline-text {
  color: var(--dark-green);
  font-family: var(--font-heading);
  font-size: 1.15rem;
}
.btn-primary {
  background: var(--orange);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .hero-content h1 { font-size: 2rem; }
  .hero-arrow { width: 36px; height: 36px; font-size: 1.5rem; }
  .two-col-grid { grid-template-columns: 1fr; gap: 2rem; }
  .two-col-grid.reverse .col-image { order: 0; }
  .two-col-grid.reverse .col-text { order: 1; }
  .quote-card { padding: 2rem 1.5rem; }
  .cta-inline { flex-direction: column; align-items: flex-start; }
}
</style>