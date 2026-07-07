<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const bulletsWhatWeDo: string[] = [
  'Community pre-schools led by trained local teachers in remote villages',
  'Mobile library service bringing books, audio and learning kits to children',
  'Scholarships covering uniforms, supplies and transport for the poorest students',
  'Buddhist moral education and life-skills classes in pagoda settings',
  'Youth peer-educator groups on health, environment and child rights',
  'Teacher training and parent engagement to keep children in school',
]

const bulletsWhyMatters: string[] = [
  'Children who attend pre-school are far more likely to complete primary and secondary school',
  'Scholarships keep the poorest girls in class through the most vulnerable years',
  'Mobile libraries reach children a bus route never will',
  'Pagoda-based ethics classes preserve Khmer language and moral tradition',
]

// ── Slideshow ──

const imageUrls: string[] = [
  'https://images.pexels.com/photos/5905470/pexels-photo-5905470.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/3769149/pexels-photo-3769149.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/5212344/pexels-photo-5212344.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
]

const currentSlide = ref(0)
let slideTimer: number | undefined

const startSlideshow = () => {
  stopSlideshow()
  slideTimer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % imageUrls.length
  }, 3000)
}

const stopSlideshow = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = undefined
  }
}

onMounted(() => {
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

  setMeta('description', 'Community pre-schools, mobile libraries, scholarships and Buddhist moral education across rural Cambodian villages.')

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

  startSlideshow()
})

onUnmounted(() => {
  stopSlideshow()
})
</script>

<template>
  <div class="edu-page">
    <!-- ── Hero Background Slideshow (fully automatic) ── -->
    <section class="hero-section" @mouseenter="stopSlideshow" @mouseleave="startSlideshow">
      <div class="hero-overlay" />

      <div class="slides" aria-live="polite">
        <div
          v-for="(url, i) in imageUrls"
          :key="i"
          class="slide"
          :class="{ 'is-active': currentSlide === i }"
          :style="{ backgroundImage: `url(${url})` }"
        />
      </div>

      <div class="hero-content">
        <span class="section-label">Programs &middot; Goal 02 Education</span>
        <h1 class="hero-title">A teacher in every village. A book in every hand.</h1>
        <p class="hero-subtitle">
          From community pre-schools to mobile libraries and pagoda-based ethics classes,
          Santi Sena builds the kind of learning that lasts a lifetime — and lifts a household out of poverty.
        </p>
        <div class="hero-actions">
          <RouterLink to="/contact" class="btn btn-primary">Sponsor a child</RouterLink>
          <RouterLink to="/services" class="btn btn-ghost">&larr; All programs</RouterLink>
        </div>
      </div>
    </section>

    <!-- ── Introduction ── -->
    <section class="intro-section">
      <div class="section-container">
        <p class="intro-paragraph">
          Most rural Cambodian children miss the critical years before primary school. Santi Sena
          fills that gap with low-cost community pre-schools, then keeps walking with families
          through scholarships, libraries and youth groups.
        </p>
      </div>
    </section>

    <!-- ── Key Facts ── -->
    <section class="facts-section">
      <div class="facts-grid">
        <div class="fact-card">
          <span class="fact-value">120+</span>
          <span class="fact-label">Pre-school children</span>
          <p class="fact-desc">Enrolled each year across remote villages.</p>
        </div>
        <div class="fact-card">
          <span class="fact-value">8</span>
          <span class="fact-label">Mobile libraries</span>
          <p class="fact-desc">Reaching villages with no school library.</p>
        </div>
        <div class="fact-card">
          <span class="fact-value">60+</span>
          <span class="fact-label">Annual scholarships</span>
          <p class="fact-desc">For the poorest students at every level.</p>
        </div>
      </div>
    </section>

    <!-- ── What We Do ── -->
    <section class="program-section">
      <div class="section-container">
        <span class="section-label">Programs</span>
        <h2 class="section-title">What we do</h2>
        <ul class="bullets-list">
          <li v-for="item in bulletsWhatWeDo" :key="item" class="bullet-item">
            <span class="bullet-icon">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="4" fill="currentColor" />
              </svg>
            </span>
            <span class="bullet-text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── Our Approach ── -->
    <section class="approach-section">
      <div class="section-container">
        <span class="section-label">Methodology</span>
        <h2 class="section-title">Our approach</h2>
        <p class="approach-text">
          We hire teachers from the villages we serve, train them in early-childhood pedagogy, and
          pair every classroom with a parent committee. Curriculum blends the national standard with
          Buddhist ethics, Khmer culture and hands-on environmental learning.
        </p>

        <!-- ── Testimonial Blockquote ── -->
        <blockquote class="testimonial">
          <svg class="testimonial-quote-icon" width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 11H6a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4c0 2.5-1.5 4.5-4 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M18 11h-4a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4c0 2.5-1.5 4.5-4 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="testimonial-body">
            <p class="testimonial-quote">
              "Before the pre-school, my daughter had never held a pencil. Now she reads to her
              grandmother every night."
            </p>
            <cite class="testimonial-cite">&mdash; Sopheak, mother of two, Prey Veng</cite>
          </div>
        </blockquote>
      </div>
    </section>

    <!-- ── Why It Matters ── -->
    <section class="impact-section">
      <div class="section-container">
        <span class="section-label">Impact</span>
        <h2 class="section-title">Why it matters</h2>
        <ul class="bullets-list">
          <li v-for="item in bulletsWhyMatters" :key="item" class="bullet-item">
            <span class="bullet-icon bullet-icon-impact">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="M13.5 4.5L6.5 11.5L3 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </span>
            <span class="bullet-text">{{ item }}</span>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── Color Tokens ───
 * Matching the warm, earthy palette used across the site.
 * Deep forest greens, saffron gold accents, warm neutral text.
 */
.edu-page {
  --green-deep:      #a3cab9;
  --green:           #a6c5b7;
  --green-mid:       #d1ebdf;
  --green-soft:      #E8F0EB;

  --gold:            #C9950E;
  --gold-light:      #F5E8B8;
  --gold-soft:       #FFFBEB;

  --warm-white:      #FDFCF9;
  --warm-bg:         #F8F6F1;
  --warm-card:       #FFFFFF;
  --warm-card-alt:   #FCFAF5;
  --warm-border:     #EBE5DA;

  /* Text — warm neutral tones */
  --text-heading:    #0F1F17;
  --text-body:       #2C3E35;
  --text-secondary:  #5C6B62;
  --text-muted:      #8B9A91;
  --text-on-hero:    rgba(255, 255, 255, 0.88);
  --text-on-green:   rgba(255, 255, 255, 0.92);
}

/* ─── Shared ─── */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  margin-bottom: 1rem;
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  background: var(--gold-light);
  color: var(--gold);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.section-title {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 3rem;
  color: var(--text-heading);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ─── Hero ─── */
.hero-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(160deg, var(--green-deep) 0%, var(--green) 50%, var(--green-mid) 100%);
  outline: none;
}

/* ── Slides ── */
.slides {
  position: absolute;
  inset: 0;
}

.slide {
  position: absolute;
  inset: -10px; /* extend beyond edges to hide blur border */
  opacity: 0;
  transition: opacity 2000ms ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #8baa9a;
  filter: blur(4px);
  transform: scale(1.05);
}

.slide.is-active {
  opacity: 1;
}

/* ── Hero Overlay ── */
.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.20) 45%, rgba(0, 0, 0, 0.05) 70%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(0, 0, 0, 0.10) 100%);
}

/* Hero content sits above overlay */
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 8rem 1.5rem 7rem;
}

.hero-content .section-label {
  background: color-mix(in srgb, var(--gold) 18%, transparent);
  color: var(--gold-light);
}

.hero-title {
  margin: 1.5rem 0 0;
  max-width: 48rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: #FFFFFF;
}

.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-on-hero);
}

.hero-actions {
  margin-top: 2.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.75rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
}

.btn-primary {
  background: var(--gold);
  color: var(--green-deep);
  box-shadow: 0 4px 14px rgba(201, 149, 14, 0.30);
}

.btn-primary:hover {
  background: #B8860B;
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(201, 149, 14, 0.35);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #FFFFFF;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.40);
}

/* ─── Introduction ─── */
.intro-section {
  background: var(--warm-bg);
}

.intro-paragraph {
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--text-body);
  max-width: 56rem;
  margin: 0;
}

/* ─── Key Facts ─── */
.facts-section {
  background: var(--warm-bg);
  padding-bottom: 0;
}

.facts-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 4.5rem;
  display: grid;
  gap: 1.5rem;
}

.fact-card {
  text-align: center;
  padding: 2.5rem 1.75rem;
  border-radius: 1rem;
  background: var(--warm-card);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--warm-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.fact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.07);
  border-color: var(--gold);
}

.fact-value {
  display: block;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--gold);
  line-height: 1;
}

.fact-label {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--green);
}

.fact-desc {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--text-secondary);
}

/* ─── Programs Section ─── */
.program-section {
  background: var(--warm-card);
}

.approach-section {
  background: var(--warm-bg);
}

.approach-text {
  font-size: 1rem;
  line-height: 1.85;
  color: var(--text-body);
  max-width: 56rem;
  margin: 0;
}

/* ─── Bullet Lists ─── */
.bullets-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.bullet-item {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.bullet-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.15rem;
  color: var(--gold);
}

.bullet-icon-impact {
  color: var(--green-mid);
}

.bullet-text {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-body);
  padding-top: 0.1rem;
}

/* ─── Testimonial ─── */
.testimonial {
  margin: 3rem 0 0;
  padding: 2.5rem;
  border-radius: 1rem;
  background: var(--warm-card);
  border: 1px solid var(--warm-border);
  border-left: 4px solid var(--gold);
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.testimonial-quote-icon {
  flex-shrink: 0;
  color: var(--gold);
  opacity: 0.5;
  margin-top: 0.15rem;
}

.testimonial-body {
  flex: 1;
  min-width: 0;
}

.testimonial-quote {
  margin: 0;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--text-heading);
  font-style: italic;
}

.testimonial-cite {
  display: block;
  margin-top: 0.75rem;
  font-size: 0.85rem;
  font-style: normal;
  color: var(--text-secondary);
}

/* ─── Impact Section ─── */
.impact-section {
  background: var(--green-soft);
}

/* ─── Responsive ─── */
@media (min-width: 640px) {
  .facts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.5rem;
  }

  .section-title {
    font-size: 2.25rem;
  }

  .fact-card {
    padding: 2.5rem 2rem;
  }

  .testimonial {
    padding: 3rem;
  }
}

@media (min-width: 1024px) {
  .hero-title {
    font-size: 4rem;
  }

  .section-title {
    font-size: 2.75rem;
  }

  .section-container {
    padding: 6rem 2rem;
  }
}


</style>
