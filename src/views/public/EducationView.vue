<script setup lang="ts">
import { onMounted } from 'vue'
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

const teamStructure = [
  {
    role: 'Program Director',
    desc: 'Oversees education initiatives, partnerships, and donor reporting.',
  },
  {
    role: 'Field Coordinators',
    desc: 'Manage pre-school, library and scholarship programs in each province.',
  },
  {
    role: 'Teachers & Facilitators',
    desc: 'Deliver early learning, literacy sessions and youth clubs.',
  },
  {
    role: 'Monitoring & Evaluation',
    desc: 'Tracks learning progress, attendance and community outcomes.',
  },
]

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
})
</script>

<template>
  <div class="edu-page">
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
      <div class="section-container facts-header">
        <span class="section-label">Key Facts</span>
        <h2 class="section-title facts-title">Our reach in numbers</h2>
        <p class="facts-intro">
          Every figure represents a child in school, a village with books, a future made possible.
        </p>
      </div>
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
          <svg
            class="testimonial-quote-icon"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M10 11H6a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4c0 2.5-1.5 4.5-4 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M18 11h-4a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 011 1v4c0 2.5-1.5 4.5-4 5"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
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

    <!-- ── Organizational Structure ── -->
    <section class="org-section">
      <div class="section-container">
        <span class="section-label">Organizational Structure</span>
        <h2 class="section-title">Who delivers education programming on the ground</h2>
        <ul class="org-team-list">
          <li v-for="t in teamStructure" :key="t.role" class="org-team-card">
            <div class="org-role">{{ t.role }}</div>
            <p class="org-desc">{{ t.desc }}</p>
          </li>
        </ul>
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
                <path
                  d="M13.5 4.5L6.5 11.5L3 8"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
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
 * Neutral warm tones stay local; brand accent colors come from the
 * global design tokens (--primary-color / --primary-dark / --primary-light).
 */
.edu-page {
  --warm-white: #fdfcf9;
  --warm-bg: #f8f6f1;
  --warm-card: #ffffff;
  --warm-card-alt: #fcfaf5;
  --warm-border: #ebe5da;

  /* Text — warm neutral tones */
  --text-heading: #0f1f17;
  --text-body: #2c3e35;
  --text-secondary: #5c6b62;
  --text-muted: #8b9a91;
  --text-on-hero: rgba(255, 255, 255, 0.88);
  --text-on-green: rgba(255, 255, 255, 0.92);
}

/* ─── Shared ─── */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.4em;
  margin-bottom: 1rem;
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  background: var(--primary-light);
  color: var(--primary-dark);
}

.section-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 4rem 1.5rem;
}

.section-title {
  margin: 0 0 3rem;
  color: var(--text-heading);
  letter-spacing: -0.01em;
}

/* ─── Hero ─── */
/* ── Hero Overlay ── */
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      to right,
      rgba(0, 0, 0, 0.78) 0%,
      rgba(0, 0, 0, 0.5) 38%,
      rgba(0, 0, 0, 0.2) 65%,
      transparent 100%
    ),
    linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 40%, rgba(0, 0, 0, 0.15) 100%);
}

/* Hero content sits above overlay */
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

.hero-content .section-label {
  background: color-mix(in srgb, var(--primary-color) 18%, transparent);
  color: #ffffff;
}

.hero-title {
  margin: 1.5rem 0 0;
  max-width: 48rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: #ffffff;
}

.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 42rem;
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
  background: var(--primary-color);
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(27, 163, 79, 0.3);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(20, 129, 62, 0.35);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #ffffff;
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.4);
}

/* ─── Introduction ─── */
.intro-section {
  background: var(--warm-bg);
}

.intro-paragraph {
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

.facts-header {
  padding-bottom: 0;
}

.facts-header .section-title {
  margin-bottom: 0.5rem;
}

.facts-intro {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-secondary);
  max-width: 560px;
  margin-bottom: 2.5rem;
}

.facts-grid {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 1.5rem 4rem;
  display: grid;
  gap: 1.25rem;
}

.fact-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: var(--warm-card);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--warm-border);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.fact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 14px 36px rgba(0, 0, 0, 0.07);
  border-color: var(--primary-color);
}

.fact-value {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.fact-label {
  display: block;
  margin-top: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--primary-dark);
}

.fact-desc {
  margin: 0.75rem 0 0;
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
  color: var(--primary-color);
}

.bullet-icon-impact {
  color: var(--primary-dark);
}

.bullet-text {
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
  border-left: 4px solid var(--primary-color);
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.testimonial-quote-icon {
  flex-shrink: 0;
  color: var(--primary-color);
  opacity: 0.5;
  margin-top: 0.15rem;
}

.testimonial-body {
  flex: 1;
  min-width: 0;
}

.testimonial-quote {
  margin: 0;
  font-weight: 600;
  line-height: 1.6;
  color: var(--text-heading);
  font-style: italic;
}

.testimonial-cite {
  display: block;
  margin-top: 0.75rem;
  font-style: normal;
  color: var(--text-secondary);
}

/* ─── Organizational Structure ─── */
.org-section {
  background: var(--warm-bg);
}

.org-team-list {
  display: grid;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.org-team-card {
  padding: 1.75rem;
  border-radius: 1rem;
  background: var(--warm-card);
  border: 1px solid var(--warm-border);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.org-team-card:hover {
  transform: translateY(-3px);
  border-color: var(--primary-color);
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.08);
}

.org-role {
  font-size: 1.1rem;
  color: var(--text-heading);
  margin-bottom: 0.75rem;
}

.org-desc {
  margin: 0;
  color: var(--text-body);
  line-height: 1.75;
}

/* ─── Impact Section ─── */
.impact-section {
  background: var(--primary-light);
}

/* ─── Responsive ─── */
@media (min-width: 640px) {
  .facts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .fact-card {
    padding: 2.5rem 2rem;
  }

  .testimonial {
    padding: 3rem;
  }
}

@media (min-width: 1024px) {
  .section-container {
    padding: 6rem 2rem;
  }
}
</style>
