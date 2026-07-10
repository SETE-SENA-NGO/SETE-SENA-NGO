<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'

const slideItems = [
  { image: heroImpactVillage, caption: '' },
  { image: '/images/programs/hero-1.jpg', caption: '' },
  { image: '/images/programs/hero-2.jpg', caption: '' },
]

interface TeamMember {
  role: string
  desc: string
}

const team: TeamMember[] = [
  { role: 'Board of Directors', desc: 'Policy and oversight, including senior Buddhist leadership and respected community elders. Meets quarterly to approve strategy, budgets and audits.' },
  { role: 'Executive Director', desc: 'Leads daily operations and strategic execution, accountable to the Board and to the communities Santi Sena serves.' },
  { role: 'Management Committee', desc: 'Senior managers coordinating programs across the three provinces, finance, HR and external partnerships.' },
  { role: 'Technical Coordination Unit', desc: 'Cross-cutting expertise — monitoring & evaluation, gender, environment, child safeguarding — supporting every field team.' },
  { role: 'Professional Staff', desc: '30+ full-time and project-based staff: agronomists, teachers, social workers, accountants and community organizers.' },
  { role: 'Field Facilitators & Volunteers', desc: 'Trained villagers and youth who carry programs the last mile, from biogas installation to mobile library visits.' },
]

const priorities: string[] = [
  'Strengthened governance and accountability at every level',
  'Continuous staff and volunteer development, including safeguarding training',
  'Diversified income and funding to reduce single-donor dependency',
  'Research and knowledge management to learn from every project',
  'Public advocacy on environment, child rights and rural livelihoods',
]

onMounted(() => {
  document.title = 'Organization — Santi Sena'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta('description', 'Board, executive team and field staff structure of Santi Sena across Svay Rieng, Prey Veng and Kratie provinces.')

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setOgMeta('og:title', 'Organization — Santi Sena')
  setOgMeta('og:description', 'How the Peace Army is organized — from the Board of Directors to village field staff.')
})
</script>

<template>
  <div class="org-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="section-label saffron">About &middot; Organizational Structure</span>
        <h1 class="hero-title">A team of monks, managers and master practitioners.</h1>
        <p class="hero-subtitle">
          From the Board of Directors to the field staff in Kratie, every level of Santi Sena is
          accountable to the villagers we serve and the donors who trust us.
        </p>
        <div class="hero-actions">
          <RouterLink to="/programs" class="btn btn-primary">See our programs</RouterLink>
          <RouterLink to="/about" class="btn btn-ghost">&larr; Back to About</RouterLink>
        </div>
      </div>
    </Slideshow>

    <!-- ── Key Facts ── -->
    <section class="facts-section">
      <div class="facts-grid">
        <div class="fact-card">
          <span class="fact-value">30+</span>
          <span class="fact-label">Full-time staff</span>
          <p class="fact-desc">Advanced degrees in management, agriculture, education and rural development.</p>
        </div>
        <div class="fact-card">
          <span class="fact-value">3</span>
          <span class="fact-label">Provinces</span>
          <p class="fact-desc">Svay Rieng &middot; Prey Veng &middot; Kratie.</p>
        </div>
        <div class="fact-card">
          <span class="fact-value">10+</span>
          <span class="fact-label">Donor partners</span>
          <p class="fact-desc">UNDP, ADB, Oxfam and eight more managed grants.</p>
        </div>
      </div>
    </section>

    <!-- ── How We Are Organized ── -->
    <section class="team-section">
      <div class="section-container team-container">
        <div class="team-heading">
          <div class="team-heading-main">
            <span class="section-label saffron">Structure</span>
            <h2 class="section-title">How we are organized</h2>
          </div>
          <p class="team-lead">
            Leadership, technical support and field teams connected from strategy to village action.
          </p>
        </div>

        <ol class="team-list">
          <li v-for="(t, i) in team" :key="t.role" class="team-card">
            <div class="team-card-top">
              <span class="team-step">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="team-line" aria-hidden="true" />
            </div>
            <div class="team-card-body">
              <h3 class="team-role">{{ t.role }}</h3>
              <p class="team-desc">{{ t.desc }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── Operational Priorities ── -->
    <section class="priorities-section">
      <div class="section-container priorities-container">
        <div class="priorities-intro">
          <span class="section-label saffron">Focus Areas</span>
          <h2 class="section-title">Operational priorities</h2>
          <p class="priorities-lead">
            The organization works through clear internal priorities so each program can stay
            accountable, resilient and useful to the communities it serves.
          </p>
        </div>

        <ol class="priorities-list">
          <li v-for="(p, i) in priorities" :key="p" class="priority-item">
            <span class="priority-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="priority-text">{{ p }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- ── Accountability ── -->
    <section class="accountability-section">
      <div class="section-container">
        <h2 class="section-title">Accountability</h2>
        <div class="accountability-card">
          <div class="accountability-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor"
                stroke-width="2" />
            </svg>
          </div>
          <p class="accountability-text">
            Santi Sena is registered with Cambodia's Ministry of Interior and produces annual audited
            financial statements. Every project is monitored quarterly against pre-agreed indicators,
            with village-level feedback sessions built into each program cycle.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── Color Tokens ───
 * Aliased to the shared global design tokens (see src/assets/base.css).
 */
.org-page {
  --green-deep: var(--primary-dark);
  --green: var(--primary-color);
  --green-mid: var(--primary-color);
  --green-soft: var(--primary-light);

  --gold: var(--primary-color);
  --gold-light: var(--primary-light);
  --gold-soft: var(--primary-light);

  --warm-bg: var(--color-cream-soft);
  --warm-card: var(--color-white);
  --warm-card-alt: var(--color-cream);
  --warm-border: var(--color-border);

  /* Text — warm neutral tones with personality */
  --text-heading: var(--color-ink);
  --text-body: var(--color-ink);
  --text-secondary: var(--color-ink-soft);
  --text-on-hero: rgba(255, 255, 255, 0.88);
  --text-on-green: rgba(255, 255, 255, 0.92);
}

/* ─── Shared ─── */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  /* font-size: 0.65rem; */
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
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.section-title {
  font-weight: 700;
  margin: 0 0 3rem;
  color: var(--text-heading);
  line-height: 1.2;
  letter-spacing: -0.01em;
}

/* ─── Hero ─── */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(6, 18, 13, 0.85) 0%, rgba(6, 18, 13, 0.55) 42%, rgba(6, 18, 13, 0.22) 70%, transparent 100%);
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

.hero-content .section-label {
  background: color-mix(in srgb, var(--gold) 18%, transparent);
  color: var(--gold-light);
}

.hero-title {
  margin: 1.5rem 0 0;
  max-width: 48rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.015em;
  color: var(--color-white);
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
  color: var(--color-white);
  box-shadow: 0 4px 14px color-mix(in srgb, var(--gold) 30%, transparent);
}

.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--gold) 35%, transparent);
}

.btn-ghost {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: var(--color-white);
}

.btn-ghost:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.40);
}

/* ─── Key Facts ─── */
.facts-section {
  background: var(--warm-bg);
}

.facts-grid {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 3rem 1.5rem 4.5rem;
  display: grid;
  gap: 1.5rem;
  margin-top: 0.5rem
}

.fact-card {
  text-align: center;
  padding: 2.5rem 1.75rem;
  padding: 3rem 2rem;
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

/* ─── Team Structure ─── */
.team-section {
  background:
    linear-gradient(180deg, var(--warm-card) 0%, color-mix(in srgb, var(--green-soft) 45%, white) 100%);
}

.team-container {
  position: relative;
}

.team-heading {
  position: relative;
  display: grid;
  gap: 1rem;
  align-items: end;
  margin-bottom: 2rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid color-mix(in srgb, var(--green) 18%, var(--warm-border));
}

.team-heading::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -1px;
  width: 6rem;
  height: 3px;
  border-radius: 999px;
  background: var(--green);
}

.team-heading-main {
  position: relative;
  z-index: 1;
}

.team-heading .section-title {
  margin-bottom: 0;
}

.team-lead {
  position: relative;
  z-index: 1;
  max-width: 34rem;
  margin: 0;
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.7;
}

.team-list {
  counter-reset: team;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1.25rem;
}

.team-card {
  counter-increment: team;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 230px;
  padding: 1.5rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--green) 16%, var(--warm-border));
  border-radius: 1rem;
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.9)),
    var(--warm-card);
  box-shadow: 0 14px 34px rgba(31, 61, 46, 0.07);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.team-card::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 0.3rem;
  background: linear-gradient(90deg, var(--green), var(--green-deep));
}

.team-card:hover {
  transform: translateY(-5px);
  border-color: color-mix(in srgb, var(--green) 38%, var(--warm-border));
  box-shadow: 0 22px 48px rgba(31, 61, 46, 0.12);
}

.team-card-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.45rem;
}

.team-step {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.85rem;
  background: var(--green-soft);
  color: var(--green);
  font-size: 0.9rem;
  font-weight: 800;
}

.team-line {
  height: 1px;
  flex: 1;
  background: color-mix(in srgb, var(--green) 20%, transparent);
}

.team-card-body {
  position: relative;
  z-index: 1;
  flex: 1;
  min-width: 0;
}

.team-role {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--green);
}

.team-desc {
  margin: 0.75rem 0 0;
  font-size: 0.9rem;
  line-height: 1.75;
  color: var(--text-secondary);
}

/* ─── Operational Priorities ─── */
.priorities-section {
  position: relative;
  overflow: hidden;
  background: var(--warm-bg);
}

.priorities-container {
  position: relative;
  display: grid;
  gap: 2rem;
  align-items: start;
}

.priorities-intro {
  position: sticky;
  top: 7rem;
  padding: 2rem;
  border: 1px solid color-mix(in srgb, var(--green) 18%, transparent);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 20px 48px rgba(31, 61, 46, 0.08);
  backdrop-filter: blur(10px);
}

.priorities-intro .section-title {
  margin-bottom: 1rem;
}

.priorities-lead {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.98rem;
  line-height: 1.8;
}

.priorities-list {
  counter-reset: priority;
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 1rem;
}

.priority-item {
  counter-increment: priority;
  position: relative;
  display: flex;
  align-items: center;
  min-height: 112px;
  gap: 1.1rem;
  padding: 1.4rem 1.5rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--green) 14%, var(--warm-border));
  border-radius: 0.85rem;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.86)),
    var(--warm-card);
  box-shadow: 0 10px 28px rgba(31, 61, 46, 0.06);
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease,
    border-color 0.25s ease;
}

.priority-item::before {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: 0.35rem;
  background: linear-gradient(180deg, var(--green), var(--green-deep));
}

.priority-item:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--green) 38%, var(--warm-border));
  box-shadow: 0 18px 44px rgba(31, 61, 46, 0.11);
}

.priority-num {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  font-size: 0.85rem;
  font-weight: 800;
  background: linear-gradient(145deg, var(--green), var(--green-deep));
  color: var(--color-white);
  box-shadow: 0 10px 20px color-mix(in srgb, var(--green) 26%, transparent);
}

.priority-text {
  position: relative;
  z-index: 1;
  flex: 1;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--text-body);
}

/* ─── Accountability ─── */
.accountability-section {
  background: var(--green-soft);
}

.accountability-card {
  display: flex;
  gap: 1.5rem;
  padding: 3rem;
  border-radius: 1rem;
  background: linear-gradient(145deg, var(--green-deep) 0%, var(--green) 60%, var(--green-mid) 100%);
  box-shadow: 0 14px 36px color-mix(in srgb, var(--green-deep) 20%, transparent);
  align-items: flex-start;
}

.accountability-icon {
  flex-shrink: 0;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--gold) 20%, transparent);
  color: var(--gold-light);
}

.accountability-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.85;
  color: var(--text-on-green);
  max-width: 50rem;
}

/* ─── Responsive ─── */
@media (min-width: 640px) {
  .facts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .fact-card {
    padding: 3.5rem 2.5rem;
  }

  .team-heading {
    grid-template-columns: minmax(0, 0.85fr) minmax(300px, 0.75fr);
  }

  .team-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .team-card {
    padding: 1.5rem 2rem;
  }

  .priority-item {
    padding: 1.5rem 2rem;
  }

  .accountability-card {
    padding: 3rem;
  }
}

@media (min-width: 900px) {
  .priorities-container {
    grid-template-columns: minmax(260px, 0.42fr) minmax(0, 1fr);
    gap: 2.5rem;
  }
}

@media (min-width: 1024px) {
  .section-container {
    padding: 6rem 2rem;
  }

  .team-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1.5rem;
  }
}

@media (max-width: 767px) {
  .section-container {
    padding: 4rem 1rem;
  }

  .team-heading {
    margin-bottom: 1.75rem;
    padding-bottom: 1rem;
  }

  .team-lead {
    font-size: 0.94rem;
    line-height: 1.7;
  }

  .team-card {
    min-height: auto;
    padding: 1.35rem;
  }

  .team-card-top {
    margin-bottom: 1.1rem;
  }

  .team-step {
    width: 2.65rem;
    height: 2.65rem;
    border-radius: 0.7rem;
  }

  .priorities-intro {
    position: relative;
    top: auto;
    padding: 1.5rem;
  }

  .priority-item {
    min-height: auto;
    align-items: flex-start;
    gap: 0.9rem;
    padding: 1.25rem 1.15rem 1.25rem 1.3rem;
  }

  .priority-num {
    width: 2.55rem;
    height: 2.55rem;
    border-radius: 0.65rem;
    font-size: 0.78rem;
  }

  .priority-text {
    font-size: 0.94rem;
  }
}

@media (max-width: 480px) {
  .priorities-intro {
    padding: 1.25rem;
  }

  .priority-item {
    flex-direction: column;
  }
}
</style>
