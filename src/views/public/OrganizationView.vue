<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'

const slideItems = [
  { image: heroImpactVillage, caption: 'A team of monks, managers and master practitioners, accountable to the villagers we serve.' },
  { image: '/images/programs/hero-1.jpg', caption: 'From the Board of Directors to field staff in Kratie, every level of Santi Sena answers to the communities and donors who trust us.' },
  { image: '/images/programs/hero-2.jpg', caption: '30+ full-time and project-based staff working across Svay Rieng, Prey Veng and Kratie provinces.' },
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
    <Slideshow :slides="slideItems" />

    <!-- ── Hero ── -->
    <section class="hero-section">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="section-label saffron">About &middot; Organizational Structure</span>
        <h1 class="hero-title">A team of monks, managers and master practitioners.</h1>
        <p class="hero-subtitle">
          From the Board of Directors to the field staff in Kratie, every level of Santi Sena is
          accountable to the villagers we serve and the donors who trust us.
        </p>
        <div class="hero-actions">
          <RouterLink to="/services" class="btn btn-primary">See our services</RouterLink>
          <RouterLink to="/about" class="btn btn-ghost">&larr; Back to About</RouterLink>
        </div>
      </div>
    </section>

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
      <div class="section-container">
        <span class="section-label saffron">Structure</span>
        <h2 class="section-title">How we are organized</h2>
        <ul class="team-list">
          <li v-for="t in team" :key="t.role" class="team-card">
            <div class="team-icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="1.5" />
                <path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <div class="team-card-body">
              <div class="team-role">{{ t.role }}</div>
              <p class="team-desc">{{ t.desc }}</p>
            </div>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── Operational Priorities ── -->
    <section class="priorities-section">
      <div class="section-container">
        <span class="section-label saffron">Focus Areas</span>
        <h2 class="section-title">Operational priorities</h2>
        <ul class="priorities-list">
          <li v-for="(p, i) in priorities" :key="p" class="priority-item">
            <span class="priority-num">{{ String(i + 1).padStart(2, '0') }}</span>
            <span class="priority-text">{{ p }}</span>
          </li>
        </ul>
      </div>
    </section>

    <!-- ── Accountability ── -->
    <section class="accountability-section">
      <div class="section-container">
        <span class="section-label saffron">Accountability</span>
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
  --green-deep:      var(--primary-dark);
  --green:           var(--primary-color);
  --green-mid:       var(--primary-color);
  --green-soft:      var(--primary-light);

  --gold:            var(--primary-color);
  --gold-light:      var(--primary-light);
  --gold-soft:       var(--primary-light);

  --warm-bg:         var(--color-cream-soft);
  --warm-card:       var(--color-white);
  --warm-card-alt:   var(--color-cream);
  --warm-border:     var(--color-border);

  /* Text — warm neutral tones with personality */
  --text-heading:    var(--color-ink);
  --text-body:       var(--color-ink);
  --text-secondary:  var(--color-ink-soft);
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
.hero-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(160deg, var(--green-deep) 0%, var(--green) 50%, var(--green-mid) 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -10;
  background:
    radial-gradient(ellipse 70% 50% at 10% 40%, color-mix(in srgb, var(--gold) 10%, transparent) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 0%, rgba(255, 255, 255, 0.04) 0%, transparent 60%);
}

.hero-content {
  max-width: var(--container-max-width);
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
  margin-top: 2rem;
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
  background: var(--warm-card);
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-card {
  display: flex;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  border-radius: 0.85rem;
  background: var(--warm-card-alt);
  border: 1px solid var(--warm-border);
  border-left: 4px solid var(--gold);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.team-card:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border-color: var(--gold);
}

.team-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--gold);
  color: var(--warm-card);
  margin-top: 0.15rem;
}

.team-card-body {
  flex: 1;
  min-width: 0;
}

.team-role {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--green);
  letter-spacing: -0.01em;
}

.team-desc {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-body);
  max-width: 50rem;
}

/* ─── Operational Priorities ─── */
.priorities-section {
  background: var(--warm-bg);
}

.priorities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.priority-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.5rem 1.75rem;
  border-radius: 0.75rem;
  background: var(--warm-card);
  border: 1px solid var(--warm-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.priority-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  border-color: var(--green-mid);
}

.priority-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  font-size: 0.85rem;
  font-weight: 700;
  background: var(--green-soft);
  color: var(--green);
  margin-top: 0.05rem;
}

.priority-text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text-body);
  padding-top: 0.35rem;
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

@media (min-width: 1024px) {
  .section-container {
    padding: 6rem 2rem;
  }
}
</style>
