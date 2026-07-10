<template>
  <div class="partners-page">
    <!-- Hero Section with Slideshow -->
    <section class="hero">
      <!-- Slideshow backgrounds -->
      <div class="slideshow-container">
        <div
          v-for="(src, index) in slides"
          :key="index"
          class="slide"
          :class="{
            active: index === currentSlide,
            prev: index === (currentSlide - 1 + slides.length) % slides.length,
          }"
          :style="{ backgroundImage: `url(${src})` }"
        ></div>
        <div class="hero-overlay"></div>
      </div>

      <!-- Slide indicators -->
      <div class="slide-indicators">
        <button
          v-for="(_, index) in slides"
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentSlide }"
          @click="currentSlide = index"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>

      <div class="hero-content">
        <span class="badge">Impact · Partners</span>
        <h1>Trusted by ten+ international donors and every government line ministry we touch.</h1>
        <p class="hero-subtitle">
          Multi-year grants, audited books and thirty years of unbroken village presence — that's
          why partners return.
        </p>
      </div>
    </section>

    <!-- Partners Carousel Section -->
    <section class="section partners-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Our Network</span>
          <h2 class="section-title">Partners & Supporters</h2>
          <p class="section-intro">
            These organizations and institutions make our work possible through funding, technical
            expertise, and shared commitment to sustainable development.
          </p>
        </div>

        <!-- Logo Carousel -->
        <div class="logo-carousel-container">
          <div ref="trackRef" class="logo-carousel-track" :class="{ paused: isPaused }">
            <div
              v-for="(partner, index) in duplicatedPartners"
              :key="index"
              class="partner-logo-card"
              @mouseenter="isPaused = true"
              @mouseleave="isPaused = false"
              tabindex="0"
              role="img"
              :aria-label="partner.name + ' logo'"
            >
              <img :src="partner.image" :alt="partner.name + ' logo'" class="partner-logo-img" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Government Coordination Section -->
    <section class="section government-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Government Relations</span>
          <h2 class="section-title">Government Coordination</h2>
          <p class="section-intro">
            We work hand-in-hand with national and provincial government bodies to align our
            programs with Cambodia's development priorities.
          </p>
        </div>
        <div class="government-grid">
          <div v-for="item in governmentItems" :key="item.title" class="gov-card">
            <div class="gov-icon">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <!-- Building / Capitol -->
                <path
                  v-if="item.icon === 'building'"
                  d="M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                />
                <!-- Tree / Leaf -->
                <path
                  v-if="item.icon === 'tree'"
                  d="M12 22V12M12 12a6 6 0 0 0-6 6M12 12a6 6 0 0 1 6 6M12 2v4"
                />
                <path v-if="item.icon === 'tree'" d="M8 8a4 4 0 0 1 8 0" />
                <!-- Women / People -->
                <path v-if="item.icon === 'users'" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle v-if="item.icon === 'users'" cx="9" cy="7" r="4" />
                <path v-if="item.icon === 'users'" d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path v-if="item.icon === 'users'" d="M16 3.13a4 4 0 0 1 0 7.75" />
                <!-- Book / Education -->
                <path v-if="item.icon === 'book'" d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path
                  v-if="item.icon === 'book'"
                  d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"
                />
                <path v-if="item.icon === 'book'" d="M8 7h8M8 11h6" />
                <!-- Map Pin -->
                <path
                  v-if="item.icon === 'map-pin'"
                  d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                />
                <circle v-if="item.icon === 'map-pin'" cx="12" cy="10" r="3" />
              </svg>
            </div>
            <h3 class="gov-title">{{ item.title }}</h3>
            <p class="gov-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Local Partners Section -->
    <section class="section local-partners-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Community Roots</span>
          <h2 class="section-title">Local Partners</h2>
          <p class="section-intro">
            Sustainable change is built from the ground up. These local institutions and networks
            are the backbone of every program we run.
          </p>
        </div>
        <div class="local-grid">
          <div v-for="item in localItems" :key="item.title" class="local-card">
            <div class="local-number">{{ item.number }}</div>
            <h3 class="local-title">{{ item.title }}</h3>
            <p class="local-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Partners Stay Section -->
    <section class="section why-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Why Partners Trust Us</span>
          <h2 class="section-title">Why Partners Stay</h2>
          <p class="section-intro">
            Long-term partnerships don't happen by chance. Here's what keeps our partners committed
            year after year.
          </p>
        </div>
        <div class="why-grid">
          <div v-for="item in whyItems" :key="item.title" class="why-card">
            <div class="why-icon">
              <svg
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <!-- Building / History -->
                <path
                  v-if="item.icon === 'building'"
                  d="M3 21h18M3 10h18M5 6l7-4 7 4M4 10v11M20 10v11M8 14v3M12 14v3M16 14v3"
                />
                <!-- Bar Chart / Audit -->
                <path v-if="item.icon === 'bar-chart'" d="M18 20V10M12 20V4M6 20v-6" />
                <!-- Handshake / Trust -->
                <path
                  v-if="item.icon === 'handshake'"
                  d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"
                />
                <!-- Rocket / Scale -->
                <path
                  v-if="item.icon === 'rocket'"
                  d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
                />
                <path
                  v-if="item.icon === 'rocket'"
                  d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
                />
                <path v-if="item.icon === 'rocket'" d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
                <path v-if="item.icon === 'rocket'" d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
              </svg>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Become a Partner Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-text">
            <h2 class="cta-title">Ready to take the next step?</h2>
            <p class="cta-desc">
              Join our network of international donors, government partners, and local organizations
              working together for sustainable impact in Cambodia.
            </p>
          </div>
          <div class="cta-actions">
            <router-link to="/get-involved/partner" class="btn btn--primary">
              Partner with us <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// Slideshow background images (Unsplash - free to use)
const slides = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1600&q=80', // community
  'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=80', // hands together
  'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1600&q=80', // children education
  'https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=1600&q=80', // nature/sustainability
]

const currentSlide = ref(0)
const isTransitioning = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value + 1) % slides.length
  setTimeout(() => {
    isTransitioning.value = false
  }, 1200)
}

function startSlideshow() {
  intervalId = setInterval(nextSlide, 5000)
}

function stopSlideshow() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  startSlideshow()
})

onUnmounted(() => {
  stopSlideshow()
})

// Partner data
const partners = [
  { name: 'UNDP', logo: 'UNDP', image: new URL('@/assets/image.png', import.meta.url).href },
  {
    name: 'Asian Development Bank',
    logo: 'ADB',
    image: new URL('@/assets/image copy.png', import.meta.url).href,
  },
  {
    name: 'Oxfam',
    logo: 'OXFAM',
    image: new URL('@/assets/image copy 2.png', import.meta.url).href,
  },
  {
    name: 'Bread for the World',
    logo: 'BFW',
    image: new URL('@/assets/image copy 3.png', import.meta.url).href,
  },
  {
    name: 'Misereor',
    logo: 'MIS',
    image: new URL('@/assets/image copy 4.png', import.meta.url).href,
  },
  {
    name: 'European Union',
    logo: 'EU',
    image: new URL('@/assets/image copy 5.png', import.meta.url).href,
  },
  {
    name: 'USAID / Winrock',
    logo: 'USAID',
    image: new URL('@/assets/image copy 6.png', import.meta.url).href,
  },
  {
    name: 'Diakonia',
    logo: 'DIA',
    image: new URL('@/assets/image copy 7.png', import.meta.url).href,
  },
  {
    name: 'Heinrich Böll Stiftung',
    logo: 'HBS',
    image: new URL('@/assets/image copy 8.png', import.meta.url).href,
  },
  {
    name: 'Caritas',
    logo: 'CAR',
    image: new URL('@/assets/image copy 9.png', import.meta.url).href,
  },
]

const governmentItems = [
  {
    icon: 'building',
    title: 'Ministry of Interior',
    desc: 'Registration and coordination across all program areas.',
  },
  {
    icon: 'tree',
    title: 'Ministry of Environment',
    desc: 'Community forestry and natural resource management.',
  },
  {
    icon: 'users',
    title: 'Ministry of Women and Affairs',
    desc: 'Gender equality initiatives and child protection programs.',
  },
  {
    icon: 'book',
    title: 'Ministry of Education, Youth and Sport',
    desc: 'Pre-school certification and non-formal education.',
  },
  {
    icon: 'map-pin',
    title: 'Provincial Departments',
    desc: 'Svay Rieng, Prey Veng and Kratie — our three focal provinces.',
  },
]

const localItems = [
  {
    number: '01',
    title: 'Pagoda and Monastic Networks',
    desc: 'Village pagodas and monastic networks across three provinces serve as trusted community hubs.',
  },
  {
    number: '02',
    title: 'Commune Councils and Child Protection',
    desc: 'Commune councils and Child Protection Networks ensure local governance and safeguarding.',
  },
  {
    number: '03',
    title: 'NGO Forum and Working Groups',
    desc: 'Cambodian NGO Forum and thematic working groups on environment, child rights, and more.',
  },
  {
    number: '04',
    title: 'Academic Partnerships',
    desc: 'Provincial and national universities collaborating on applied research and monitoring.',
  },
  {
    number: '05',
    title: 'Social Enterprises',
    desc: 'Local social enterprises buying cooperative produce at fair prices, creating sustainable markets.',
  },
]

const whyItems = [
  {
    icon: 'building',
    title: '30 years of unbroken presence',
    desc: 'in southeastern Cambodia — trust built over generations.',
  },
  {
    icon: 'bar-chart',
    title: 'Audited financial systems',
    desc: 'and clean grant reporting with full transparency.',
  },
  {
    icon: 'handshake',
    title: 'Deep community trust',
    desc: 'rooted in Buddhist moral leadership and village relationships.',
  },
  {
    icon: 'rocket',
    title: 'Proven ability to scale',
    desc: 'pilots into province-wide programs with measurable outcomes.',
  },
]

// Carousel state
const isPaused = ref(false)
const trackRef = ref<HTMLElement | null>(null)
let animationFrameId = 0
let scrollPos = 0
const speed = 0.9 // pixels per frame (~30px/sec at 60fps)

// Duplicate partners 4x for more buffer (avoids ever reaching the end)
const duplicatedPartners = computed(() => {
  return [...partners, ...partners, ...partners, ...partners]
})

function startSmoothScroll() {
  const track = trackRef.value
  if (!track) return
  const scrollTrack = track

  function step() {
    if (!isPaused.value) {
      scrollPos -= speed
      // When we've scrolled past one full set of partners, reset position
      // without visual jump by moving back by one set width
      const singleSetWidth = scrollTrack.scrollWidth / 4
      if (Math.abs(scrollPos) >= singleSetWidth) {
        scrollPos += singleSetWidth
      }
      scrollTrack.style.transform = `translate3d(${scrollPos}px, 0, 0)`
    }
    animationFrameId = requestAnimationFrame(step)
  }
  animationFrameId = requestAnimationFrame(step)
}

function stopSmoothScroll() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
    animationFrameId = 0
  }
}

onMounted(() => {
  startSlideshow()
  // Wait for DOM, then start smooth scroll
  nextTick(() => {
    startSmoothScroll()
  })
})

onUnmounted(() => {
  stopSlideshow()
  stopSmoothScroll()
})
</script>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.partners-page {
  --green: #16302a;
  --green-muted: #3f5f52;
  --orange: #dd7a2b;
  --ink: #2b2b28;
  --ink-soft: #5b564c;
  --cream: #faf3e6;
  --cream-soft: #fdf8ef;
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  font-family: inherit;
  color: var(--ink);
  background: var(--cream);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--orange);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(221, 122, 43, 0.2);
  border-radius: 9999px;
  background: rgba(221, 122, 43, 0.06);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--green);
  margin-bottom: 1rem;
  font-family: var(--font-serif);
  line-height: 1.2;
}

.section-intro {
  font-size: 1.1rem;
  color: var(--ink-soft);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

/* =====================
   Hero
   ===================== */
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 6rem 1.5rem;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slideshow-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  will-change: opacity;
}

.slide.active {
  opacity: 1;
}

.slide.prev {
  opacity: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 35, 26, 0.55);
  z-index: 1;
}

.slide-indicators {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.75rem;
  z-index: 10;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(253, 248, 239, 0.6);
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}

.indicator-dot.active {
  background: var(--orange);
  border-color: var(--orange);
}

.indicator-dot:hover {
  border-color: var(--orange);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 5;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--orange);
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(221, 122, 43, 0.35);
  border-radius: 9999px;
  background: rgba(221, 122, 43, 0.1);
}

.hero-content h1 {
  font-size: clamp(2.25rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.2;
  color: #fdf8ef;
  margin-bottom: 1.25rem;
  font-family: var(--font-serif);
}

.hero-subtitle {
  font-size: 1.15rem;
  color: rgba(253, 248, 239, 0.85);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

/* =====================
   Partners Section
   ===================== */
.partners-section {
  background: #f5ebe0;
}

.partners-section .container {
  max-width: 1600px;
}

/* =====================
   Logo Carousel
   ===================== */
.logo-carousel-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 2rem 0;
  mask-image: linear-gradient(to right, transparent 0%, black 4%, black 96%, transparent 100%);
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 4%,
    black 96%,
    transparent 100%
  );
}

.logo-carousel-track {
  display: flex;
  gap: 2rem;
  will-change: transform;
  backface-visibility: hidden;
  perspective: 1000px;
}

.logo-carousel-track.paused {
  animation-play-state: paused;
}

.partner-logo-card {
  flex-shrink: 0;
  width: 220px;
  height: 110px;
  background: #ffffff;
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.partner-logo-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(22, 48, 42, 0.1);
  border-color: rgba(221, 122, 43, 0.3);
}

.partner-logo-card:focus {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}

.partner-logo-img {
  max-height: 55px;
  max-width: 170px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .logo-carousel-track {
    animation: none;
  }

  .partner-logo-card {
    transition: none;
  }
}

/* =====================
   Government Section
   ===================== */
.government-section {
  background: #f5ebe0;
}

.government-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.gov-card {
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.gov-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(22, 48, 42, 0.08);
  border-color: rgba(221, 122, 43, 0.25);
}

.gov-icon {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 48, 42, 0.08);
  border-radius: 12px;
  margin-bottom: 0.75rem;
  color: var(--green);
  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.gov-card:hover .gov-icon {
  transform: scale(1.1);
  background: rgba(22, 48, 42, 0.12);
}

.gov-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--green);
  margin: 0 0 0.5rem;
  font-family: var(--font-serif);
}

.gov-desc {
  font-size: 0.95rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   Local Partners Section
   ===================== */
.local-partners-section {
  background: #f5ebe0;
}

.local-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.local-card {
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.local-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(22, 48, 42, 0.08);
  border-color: rgba(221, 122, 43, 0.25);
}

.local-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--orange);
  margin-bottom: 1rem;
  letter-spacing: 0.08em;
}

.local-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--green);
  margin: 0 0 0.5rem;
  font-family: var(--font-serif);
}

.local-desc {
  font-size: 0.9rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   Why Partners Stay Section
   ===================== */
.why-section {
  background: #f5ebe0;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.why-card {
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2.5rem 2rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.why-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(22, 48, 42, 0.08);
  border-color: rgba(221, 122, 43, 0.25);
}

.why-icon {
  width: 3.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(22, 48, 42, 0.08);
  border-radius: 50%;
  margin: 0 auto 1rem;
  color: var(--green);
  transition:
    transform 0.3s ease,
    background 0.3s ease;
}

.why-card:hover .why-icon {
  transform: scale(1.12);
  background: rgba(221, 122, 43, 0.12);
  color: var(--orange);
}

.why-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--green);
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.why-card p {
  font-size: 0.95rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   CTA Section
   ===================== */
.cta-section {
  padding: 5rem 0;
  background: #f5ebe0;
}

.cta-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: clamp(2rem, 4vw, 3.5rem);
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #1e3d2c 0%, #16302a 60%, #0f231a 100%);
  box-shadow: 0 24px 48px rgba(15, 35, 26, 0.28);
  align-items: center;
  text-align: center;
}

.cta-title {
  margin: 0 0 0.75rem;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(1.8rem, 3.5vw, 2.25rem);
  color: #fdf8ef;
}

.cta-desc {
  margin: 0;
  color: rgba(253, 248, 239, 0.8);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 600px;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.85rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease,
    transform 0.2s ease;
}

.btn--primary {
  background: var(--orange);
  color: #211a12;
}

.btn--primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .logo-carousel-track {
    gap: 1.5rem;
  }

  .partner-logo-card {
    width: 200px;
    height: 100px;
    padding: 20px;
  }

  .government-grid {
    grid-template-columns: 1fr;
  }

  .local-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 4rem 1.5rem;
    min-height: 50vh;
  }

  .hero-content h1 {
    font-size: 2.25rem;
  }

  .hero-subtitle {
    font-size: 1.05rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .logo-carousel-track {
    gap: 1rem;
  }

  .partner-logo-card {
    width: 180px;
    height: 90px;
    padding: 16px;
  }

  .partner-logo-img {
    max-height: 45px;
    max-width: 140px;
  }

  .government-grid {
    grid-template-columns: 1fr;
  }

  .local-grid {
    grid-template-columns: 1fr;
  }

  .why-grid {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.85rem;
  }

  .logo-carousel-track {
    gap: 0.75rem;
  }

  .partner-logo-card {
    width: 160px;
    height: 80px;
    padding: 12px;
  }

  .partner-logo-img {
    max-height: 40px;
    max-width: 120px;
  }
}
</style>
