<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/child-protection.jpg', caption: '' },
  { image: '/images/programs/child-protection1.jpg', caption: '' },
  { image: '/images/programs/child-protection2.jpg', caption: '' },
  { image: '/images/programs/child-protection3.jpg', caption: '' },
]

const stats = [
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.', icon: 'pin', image: '/images/programs/child-protection.jpg' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.', icon: 'users', image: '/images/programs/child-protection1.jpg' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.', icon: 'phone', image: '/images/programs/child-protection2.jpg' },
]

// "What we do" — six focus areas, each with a photo, title and description.
const whatWeDo = [
  {
    title: 'Anti-Trafficking Campaigns',
    text: 'Anti-child-trafficking campaigns at borders, markets and schools',
    image: '/images/programs/child-protection.jpg',
    color: '#0a7d5c',
  },
  {
    title: 'Child Protection Networks',
    text: 'Village Child Protection Networks (CPN) trained in identification and referral',
    image: '/images/programs/child-protection1.jpg',
    color: '#2c7be5',
  },
  {
    title: 'Child Rights Advocacy',
    text: 'Child rights advocacy with commune councils and provincial authorities',
    image: '/images/programs/child-protection2.jpg',
    color: '#e8871e',
  },
  {
    title: 'Peer Educators',
    text: 'Peer-educator youth groups on safe migration, health and rights',
    image: '/images/programs/child-protection3.jpg',
    color: '#8b5cf6',
  },
  {
    title: 'Family Reintegration',
    text: 'Family reintegration support for children returning from unsafe labour',
    image: '/images/programs/child-protection.jpg',
    color: '#e0475a',
  },
  {
    title: 'Safeguarding Training',
    text: 'Safeguarding training for every teacher, monk and volunteer we work with',
    image: '/images/programs/child-protection1.jpg',
    color: '#c9a227',
  },
]

// A referral case moves through three real stages described in "Our approach" below —
// this list just breaks that same sentence into steps for the pathway diagram.
const pathway = [
  {
    step: 'Village, at dawn',
    text: 'A trusted community member — mother, monk, teacher or commune council member — identifies a case early.',
    icon: 'village',
  },
  {
    step: 'Trained & connected',
    text: 'That network is trained, coached and connected by Santi Sena to formal referral pathways.',
    icon: 'link',
  },
  {
    step: 'Province, by dusk',
    text: 'The case reaches the provincial social affairs office the same day it was identified.',
    icon: 'office',
  },
]

// Generic scroll-reveal: every ref below gets an `in-view` class added the
// first time it enters the viewport, then is unobserved. One shared observer
// drives all of them so each section (and, via CSS nth-child delays, each
// item inside a section) fades/slides in as the user scrolls down the page.
const trustBarEl = ref<HTMLElement | null>(null)
const introEl = ref<HTMLElement | null>(null)
const doGridEl = ref<HTMLElement | null>(null)
const pathwayEl = ref<HTMLElement | null>(null)
const storyEl = ref<HTMLElement | null>(null)
const ctaEl = ref<HTMLElement | null>(null)
const collageEl = ref<HTMLElement | null>(null)

let revealObserver: IntersectionObserver | undefined
let parallaxRaf = 0
let parallaxTicking = false

onMounted(() => {
  const revealTargets = [
    trustBarEl.value,
    introEl.value,
    doGridEl.value,
    pathwayEl.value,
    storyEl.value,
    ctaEl.value,
  ].filter((el): el is HTMLElement => el !== null)

  // Toggling (not unobserving) means every section fades/slides in as it
  // enters the viewport scrolling down, AND fades/slides back out and
  // replays when scrolled back up past it — dynamic both directions.
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('in-view', entry.isIntersecting)
      })
    },
    { threshold: 0.18, rootMargin: '-8% 0px -8% 0px' }
  )

  revealTargets.forEach((el) => revealObserver?.observe(el))

  // Subtle parallax: the story collage drifts slightly slower than scroll
  // speed, adding depth without being distracting, in both scroll directions.
  const updateParallax = () => {
    parallaxTicking = false
    const el = collageEl.value
    if (!el) return
    const rect = el.getBoundingClientRect()
    const viewportCenter = window.innerHeight / 2
    const elCenter = rect.top + rect.height / 2
    const offset = (viewportCenter - elCenter) * 0.06
    el.style.transform = `translateY(${offset}px)`
  }

  const onScroll = () => {
    if (!parallaxTicking) {
      parallaxTicking = true
      parallaxRaf = requestAnimationFrame(updateParallax)
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true })
  updateParallax()

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', onScroll)
    cancelAnimationFrame(parallaxRaf)
  })
})

onBeforeUnmount(() => {
  revealObserver?.disconnect()
})
</script>

<template>
  <div class="child-protection-page">
    <!-- Trust bar -->
    <section class="trust-bar">
      <div class="container trust-bar-inner" ref="trustBarEl">
        <div v-for="stat in stats" :key="stat.label" class="trust-card">
          <img :src="stat.image" :alt="stat.label" class="trust-card-img" />
          <div class="trust-card-overlay" aria-hidden="true"></div>
          <span class="trust-card-icon">
            <svg v-if="stat.icon === 'pin'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.6"/>
            </svg>
            <svg v-else-if="stat.icon === 'users'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/>
              <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              <circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.6"/>
              <path d="M15 20c0-2.6 2-4.6 5-4.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
            </svg>
          </span>
          <div class="trust-card-copy">
            <p class="trust-card-number">{{ stat.number }}</p>
            <p class="trust-card-label">{{ stat.label }}</p>
            <p class="trust-card-desc">{{ stat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Intro -->
    <section class="section-cream intro-section">
      <div class="container" ref="introEl">
        <div class="intro-rule" aria-hidden="true"></div>
        <p class="intro-text text-center">
          Cross-border migration, poverty and family separation put rural Cambodian
          children at risk of unsafe labour and trafficking. Santi Sena works with
          villages, schools and pagodas to build the safety net closest to the child
          — before anything goes wrong.
        </p>
      </div>
    </section>

    <!-- What we do — icon/title/description grid -->
    <section class="section-light">
      <div class="container">
        <div class="do-section">
          <p class="section-eyebrow text-center">Our work</p>
          <h2 class="section-title text-center">What we do</h2>

          <div class="do-grid" ref="doGridEl">
            <div v-for="item in whatWeDo" :key="item.title" class="do-card">
              <div class="do-image">
                <img :src="item.image" :alt="item.title" />
              </div>
              <p class="do-title" :style="{ color: item.color }">{{ item.title }}</p>
              <p class="do-text">{{ item.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our approach — referral pathway -->
    <section class="section-cream">
      <div class="container">
        <p class="section-eyebrow text-center">Our method</p>
        <h2 class="section-title text-center">Our approach</h2>
        <p class="approach-text text-center">
          Every network is anchored by the people children already trust — mothers,
          monks, teachers, commune council members. We train, coach and connect them
          to formal referral pathways so a case identified in a village at dawn
          reaches the provincial social affairs office by dusk.
        </p>

        <ol class="pathway" ref="pathwayEl">
          <svg class="pathway-wave" viewBox="0 0 100 220" preserveAspectRatio="none">
            <path class="pathway-curve" d="M16.6,132 C33,132 33,62 50,62 C67,62 67,132 83.3,132" />
          </svg>

          <li v-for="(node, i) in pathway" :key="node.step" class="pathway-node" :class="{ 'pathway-node-raised': i === 1 }">
            <span class="pathway-bignum">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="pathway-marker">
              <svg v-if="node.icon === 'village'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.5L12 5l8 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 10v8.5a1 1 0 001 1h10a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M10 19.5v-5h4v5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="node.icon === 'link'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 14.5l5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                <path d="M8 16.5l-1.8 1.8a3 3 0 01-4.3-4.3L4 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 7.5l1.8-1.8a3 3 0 014.3 4.3L20 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 21V6a1 1 0 011-1h6a1 1 0 011 1v15" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M13 11h5a1 1 0 011 1v9" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M8 9h0M8 12h0M8 15h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M16 15h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="pathway-step">{{ node.step }}</p>
            <p class="pathway-text">{{ node.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Story + CTA -->
    <section class="section-light">
      <div class="container">
        <div class="two-col-grid reverse" ref="storyEl">
          <div class="col-image">
            <div class="story-collage" ref="collageEl">
              <div class="story-collage-main">
                <img src="/images/programs/child-protection3.jpg" alt="Child Protection Network volunteer speaking with a family" />
                <span class="story-collage-heart">
                  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 20.5s-7.6-4.8-10.2-9.4C.4 8.2 1.7 4.8 5 3.9c2-.5 3.9.3 5 2 .1-.1.1-.2.2-.3 1.1-1.6 3-2.5 5-2 3.3.9 4.6 4.3 3.2 7.2C19.6 15.7 12 20.5 12 20.5z"/>
                  </svg>
                </span>
              </div>

              <!-- Two square photos, crossing/staggered, overlapping the bottom of the circle -->
              <div class="story-collage-sub story-collage-sub--left">
                <img src="/images/programs/child-protection.jpg" alt="" />
              </div>
              <div class="story-collage-sub story-collage-sub--right">
                <img src="/images/programs/child-protection1.jpg" alt="" />
              </div>
            </div>
          </div>
          <div class="col-text">
            <p class="section-eyebrow">A network at work</p>
            <div class="story-card">
              <span class="story-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <p class="story-text">
                "The network spotted my nephew before the broker took him. He is
                back in school this term."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="cta-split">
      <div class="container cta-split-inner" ref="ctaEl">
        <div class="cta-split-text">
          <p class="cta-split-eyebrow">Get involved</p>
          <h2 class="cta-split-title">Ready to take the next step?</h2>
        </div>
        <router-link to="/get-involved" class="btn-primary btn-large">
          Support a network
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

/* ===== Trust bar — small photo stat cards ===== */
.trust-bar {
  background: transparent;
  padding: 2.5rem 0;
}
.trust-bar-inner {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  max-width: 780px;
  margin: 0 auto;
}
.trust-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 3 / 3.6;
  isolation: isolate;
  opacity: 0;
  transform: translateY(18px);
  transition: opacity 0.6s ease, transform 0.6s ease, box-shadow 0.3s ease;
  box-shadow: 0 10px 22px -12px rgba(0, 0, 0, 0.5);
}
.trust-bar-inner.in-view .trust-card {
  opacity: 1;
  transform: translateY(0);
}
.trust-bar-inner.in-view .trust-card:nth-child(1) { transition-delay: 0s; }
.trust-bar-inner.in-view .trust-card:nth-child(2) { transition-delay: 0.15s; }
.trust-bar-inner.in-view .trust-card:nth-child(3) { transition-delay: 0.3s; }
.trust-card:hover {
  box-shadow: 0 14px 28px -12px rgba(0, 0, 0, 0.6);
}
.trust-card-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  transition: transform 0.6s ease;
}
.trust-card:hover .trust-card-img {
  transform: scale(1.08);
}
.trust-card-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(
    180deg,
    rgba(11, 31, 25, 0.1) 0%,
    rgba(11, 31, 25, 0.2) 35%,
    rgba(11, 31, 25, 0.92) 100%
  );
}
.trust-card-icon {
  position: absolute;
  top: 0.7rem;
  left: 0.7rem;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(4px);
  color: #ffffff;
}
.trust-card-icon svg { width: 14px; height: 14px; }
.trust-card-copy {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 2;
  padding: 0 0.8rem 0.9rem;
}
.trust-card-number {
  font-weight: 800;
  color: #ffffff;
  font-size: 1.3rem;
  line-height: 1.1;
  letter-spacing: -0.01em;
  margin-bottom: 0.15rem;
}
.trust-card-label {
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--primary-light);
  font-size: 0.62rem;
  margin-bottom: 0.25rem;
}
.trust-card-desc {
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.74rem;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
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
.intro-section { text-align: center; }
.intro-section .container {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.intro-section .container.in-view {
  opacity: 1;
  transform: translateY(0);
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
.section-title {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}
.text-center { text-align: center; }

/* ===== Two-column layout: photo collage + quote ===== */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}
.two-col-grid.reverse .col-image { order: 1; }
.two-col-grid.reverse .col-text { order: 2; }
.two-col-grid .col-image,
.two-col-grid .col-text {
  opacity: 0;
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.two-col-grid .col-image { transform: translateX(-24px); }
.two-col-grid .col-text { transform: translateX(24px); }
.two-col-grid.in-view .col-image,
.two-col-grid.in-view .col-text {
  opacity: 1;
  transform: translateX(0);
}
.two-col-grid.in-view .col-text { transition-delay: 0.15s; }

/* Photo collage — one large circular photo, with two smaller photos
   overlapping its lower corners at a slight rotation for a more dynamic,
   hand-placed feel, plus a small heart accent badge. */
.story-collage {
  position: relative;
  width: min(370px, 82%);
  margin: 0 auto;
  padding: 0 4% 18%;
}
.story-collage::before {
  content: '';
  position: absolute;
  inset: -8% -6% 4%;
  z-index: -1;
  background: radial-gradient(
    circle at 40% 35%,
    rgba(74, 155, 110, 0.35) 0%,
    rgba(74, 155, 110, 0.18) 45%,
    rgba(74, 155, 110, 0) 75%
  );
  filter: blur(18px);
  border-radius: 50%;
}
.story-collage-main {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  border: 6px solid #ffffff;
  box-shadow: 0 20px 42px -18px rgba(74, 155, 110, 0.45), 0 6px 16px -10px rgba(22, 52, 42, 0.2);
  z-index: 1;
}
.story-collage-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}
.story-collage:hover .story-collage-main img {
  transform: scale(1.06);
}
.story-collage-heart {
  position: absolute;
  top: -4px;
  right: 10%;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 22px -6px rgba(0, 0, 0, 0.4);
  z-index: 4;
  animation: heart-pulse 2.8s ease-in-out infinite;
}
.story-collage-heart svg { width: 21px; height: 21px; }
@keyframes heart-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

/* Two photos overlapping the circle's lower corners, each tilted slightly
   in opposite directions so they read as playfully "dropped" into place
   rather than mechanically aligned. Deep, soft shadows lift them off the
   circle; a subtle rotate-and-lift on hover adds polish. */
.story-collage-sub {
  position: absolute;
  width: 46%;
  aspect-ratio: 4 / 5;
  border-radius: 14px;
  overflow: hidden;
  border: 5px solid #ffffff;
  box-shadow: 0 16px 30px -12px rgba(74, 155, 110, 0.4), 0 4px 10px -4px rgba(22, 52, 42, 0.2);
  transition: transform 0.35s ease, box-shadow 0.35s ease;
}
.story-collage-sub img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.story-collage-sub--left {
  left: -2%;
  bottom: 0;
  transform: rotate(-6deg);
  z-index: 3;
}
.story-collage-sub--right {
  right: -2%;
  bottom: 12%;
  transform: rotate(5deg);
  z-index: 2;
}
.story-collage-sub--left:hover {
  transform: rotate(-6deg) translateY(-6px) scale(1.03);
  box-shadow: 0 24px 40px -12px rgba(22, 52, 42, 0.5), 0 6px 14px -4px rgba(22, 52, 42, 0.25);
  z-index: 5;
}
.story-collage-sub--right:hover {
  transform: rotate(5deg) translateY(-6px) scale(1.03);
  box-shadow: 0 24px 40px -12px rgba(22, 52, 42, 0.5), 0 6px 14px -4px rgba(22, 52, 42, 0.25);
  z-index: 5;
}

/* ===== Story card ===== */
.story-card {
  background: var(--primary-light);
  border-radius: 18px;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
}
.story-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--primary-color);
  margin-bottom: 0.9rem;
  box-shadow: 0 4px 10px rgba(22, 52, 42, 0.12);
}
.story-badge svg { width: 17px; height: 17px; }
.story-text {
  font-family: var(--font-family-base);
  font-style: italic;
  font-size: 1.15rem;
  color: var(--primary-dark);
  line-height: 1.6;
  margin: 0;
}

/* ===== What we do — icon/title/description grid ===== */
.do-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
}
.do-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem 1.75rem;
  max-width: 980px;
  margin: 3rem auto 0;
}
.do-card {
  text-align: center;
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.do-grid.in-view .do-card {
  opacity: 1;
  transform: translateY(0);
}
.do-grid.in-view .do-card:nth-child(1) { transition-delay: 0.05s; }
.do-grid.in-view .do-card:nth-child(2) { transition-delay: 0.15s; }
.do-grid.in-view .do-card:nth-child(3) { transition-delay: 0.25s; }
.do-grid.in-view .do-card:nth-child(4) { transition-delay: 0.35s; }
.do-grid.in-view .do-card:nth-child(5) { transition-delay: 0.45s; }
.do-grid.in-view .do-card:nth-child(6) { transition-delay: 0.55s; }
.do-image {
  width: 100%;
  height: 170px;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 1rem;
  box-shadow: 0 8px 18px -8px rgba(0, 0, 0, 0.3);
}
.do-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.do-title {
  font-weight: 700;
  font-size: 1.05rem;
  margin: 0 0 0.5rem;
}
.do-text {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 700px) {
  .do-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
    max-width: 420px;
  }
}

/* ===== Approach + referral pathway ===== */
.approach-text {
  line-height: 1.75;
  color: #333;
  max-width: 780px;
  margin: 0 auto 3rem;
  font-size: 1.02rem;
}
.pathway {
  list-style: none;
  padding: 100px 0 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: start;
  gap: 0;
  position: relative;
  max-width: 920px;
  margin: 0 auto;
}
.pathway-node {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 1.5rem;
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.pathway.in-view .pathway-node {
  opacity: 1;
  transform: translateY(0);
}
.pathway.in-view .pathway-node:nth-of-type(1) { transition-delay: 0s; }
.pathway.in-view .pathway-node:nth-of-type(2) { transition-delay: 0.2s; }
.pathway.in-view .pathway-node:nth-of-type(3) { transition-delay: 0.4s; }
.pathway-node-raised {
  margin-top: -70px;
}

.pathway-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 220px;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease 0.55s;
}
.pathway.in-view .pathway-wave {
  opacity: 1;
}
.pathway-curve {
  fill: none;
  stroke: var(--primary-color);
  stroke-opacity: 0.35;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.pathway-bignum {
  position: absolute;
  top: -46px;
  left: 50%;
  transform: translateX(-58%);
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary-color);
  opacity: 0.15;
  line-height: 1;
  z-index: -1;
  pointer-events: none;
}

.pathway-marker {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8px 20px -8px rgba(22, 52, 42, 0.35);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.pathway-marker svg {
  width: 26px;
  height: 26px;
}
.pathway-step {
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  font-size: 0.98rem;
}
.pathway-text {
  color: #555;
  line-height: 1.55;
  font-size: 0.9rem;
  max-width: 240px;
  margin: 0 auto;
}

.cta-row { display: flex; }

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
  transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
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

/* ===== Closing split CTA ===== */
.cta-split {
  background: var(--primary-light);
}
.cta-split-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 3rem;
  padding-bottom: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.7s ease, transform 0.7s ease;
}
.cta-split-inner.in-view {
  opacity: 1;
  transform: translateY(0);
}
.cta-split-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.cta-split-title {
  color: var(--primary-dark);
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .pathway { grid-template-columns: 1fr; gap: 2.5rem; padding-top: 2.5rem; }
  .pathway-wave { display: none; }
  .pathway-node-raised { margin-top: 0; }
  .pathway-bignum { position: static; display: block; transform: none; margin-bottom: 0.5rem; }
  .pathway-text { max-width: none; }
}

@media (max-width: 768px) {
  .trust-bar-inner { grid-template-columns: repeat(3, 1fr); gap: 0.6rem; max-width: 420px; }

  .two-col-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .two-col-grid.reverse .col-image { order: 0; }
  .two-col-grid.reverse .col-text { order: 1; }
  .story-collage { width: min(280px, 74vw); padding: 0 4% 24%; }

  .cta-split-inner { flex-direction: column; align-items: flex-start; text-align: left; }
}
</style>
