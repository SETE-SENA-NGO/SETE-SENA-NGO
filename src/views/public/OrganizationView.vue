<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

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
                <path d="M7 10l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
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
              <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" stroke="currentColor" stroke-width="2" />
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
 *   Green: brand anchor, used for headings and hero backgrounds.
 *   Gold:  warm accent for highlights, stats, and decorative elements.
 *   Text:  clean neutral grays (not green-tinted) for maximum readability.
 */
.org-page {
  --org-primary:       #1B4332;
  --org-primary-light: #2D6A4F;
  --org-primary-deep:  #143A25;
  --org-saffron:       #C9950E;
  --org-saffron-bg:    #FDF6E3;

  --org-text-heading:  #111827;
  --org-text-body:     #374151;
  --org-text-muted:    #6B7280;
  --org-text-soft:     #9CA3AF;

  --org-white:         #FFFFFF;
  --org-bg:            #F9FAFB;
  --org-bg-alt:        #F3F6F3;
  --org-card-bg:       #FFFFFF;
  --org-card-alt:      #F8FAF8;
  --org-border:        #E5E7EB;
}

/* ─── Shared ─── */
.section-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  margin-bottom: 1rem;
  padding: 0.35rem 0.75rem;
  border-radius: 2rem;
  background: var(--org-saffron-bg);
  color: var(--org-saffron);
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 5rem 1.5rem;
}

.section-title {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 3rem;
  color: var(--org-text-heading);
  line-height: 1.25;
}

/* ─── Hero ─── */
.hero-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: linear-gradient(135deg, var(--org-primary-deep) 0%, var(--org-primary) 60%, var(--org-primary-light) 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -10;
  background:
    radial-gradient(ellipse 80% 60% at 0% 50%, rgba(212, 160, 23, 0.10) 0%, transparent 60%),
    radial-gradient(ellipse 60% 50% at 100% 0%, rgba(255, 255, 255, 0.04) 0%, transparent 60%);
}

.hero-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 7rem 1.5rem 5rem;
  color: var(--org-white);
}

.hero-content .section-label {
  background: color-mix(in srgb, var(--org-saffron) 18%, transparent);
  color: var(--org-saffron);
}

.hero-title {
  margin: 1.5rem 0 0;
  max-width: 48rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2.75rem;
  font-weight: 700;
  line-height: 1.1;
  color: var(--org-white);
}

.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.75;
  color: color-mix(in srgb, var(--org-white) 78%, transparent);
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
  transition: all 0.2s;
}

.btn-primary {
  background: var(--org-saffron);
  color: var(--org-primary-deep);
}

.btn-primary:hover {
  background: color-mix(in srgb, var(--org-saffron) 82%, black);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.btn-ghost {
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--org-white) 25%, transparent);
  color: var(--org-white);
}

.btn-ghost:hover {
  background: color-mix(in srgb, var(--org-white) 8%, transparent);
  border-color: color-mix(in srgb, var(--org-white) 45%, transparent);
}

/* ─── Key Facts ─── */
.facts-section {
  background: var(--org-bg);
}

.facts-grid {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem 3rem;
  display: grid;
  gap: 1.5rem;
  margin-top: -2rem;
}

.fact-card {
  text-align: center;
  padding: 2rem 1.5rem;
  border-radius: 1rem;
  background: var(--org-card-bg);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid var(--org-border);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.fact-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  border-color: var(--org-saffron);
}

.fact-value {
  display: block;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 3rem;
  font-weight: 700;
  color: var(--org-saffron);
  line-height: 1;
}

.fact-label {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--org-primary);
}

.fact-desc {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--org-text-muted);
}

/* ─── Team Structure ─── */
.team-section {
  background: var(--org-card-bg);
  border-top: 1px solid var(--org-border);
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.team-card {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 1rem;
  border-left: 4px solid var(--org-saffron);
  background: var(--org-card-alt);
  border: 1px solid var(--org-border);
  border-left-width: 4px;
  border-left-color: var(--org-saffron);
  transition: transform 0.2s, box-shadow 0.2s;
}

.team-card:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: color-mix(in srgb, var(--org-saffron) 40%, var(--org-border));
  border-left-color: color-mix(in srgb, var(--org-saffron) 110%, black);
}

.team-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--org-saffron);
  color: var(--org-white);
  margin-top: 0.15rem;
}

.team-card-body {
  flex: 1;
  min-width: 0;
}

.team-role {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--org-text-heading);
}

.team-desc {
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--org-text-body);
  max-width: 50rem;
}

/* ─── Operational Priorities ─── */
.priorities-section {
  background: var(--org-bg);
}

.priorities-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.priority-item {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
  padding: 1.25rem 1.5rem;
  border-radius: 0.75rem;
  background: var(--org-card-bg);
  border: 1px solid var(--org-border);
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

.priority-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
  border-color: var(--org-primary-light);
}

.priority-num {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 0.8rem;
  font-weight: 700;
  background: var(--org-saffron-bg);
  color: var(--org-saffron);
  margin-top: 0.1rem;
}

.priority-text {
  flex: 1;
  font-size: 0.925rem;
  line-height: 1.65;
  color: var(--org-text-body);
  padding-top: 0.25rem;
}

/* ─── Accountability ─── */
.accountability-section {
  background: var(--org-bg-alt);
  border-top: 1px solid var(--org-border);
  border-bottom: 1px solid var(--org-border);
}

.accountability-card {
  display: flex;
  gap: 1.5rem;
  padding: 2.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--org-primary-deep) 0%, var(--org-primary) 100%);
  color: var(--org-white);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
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
  background: color-mix(in srgb, var(--org-saffron) 20%, transparent);
  color: var(--org-saffron);
}

.accountability-text {
  margin: 0;
  font-size: 1rem;
  line-height: 1.8;
  color: color-mix(in srgb, var(--org-white) 82%, transparent);
  max-width: 50rem;
}

/* ─── Responsive ─── */
@media (min-width: 640px) {
  .facts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .hero-title {
    font-size: 3.75rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .fact-card {
    padding: 2.5rem 2rem;
  }

  .team-card {
    padding: 1.75rem 2rem;
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
