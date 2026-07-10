<script setup lang="ts">
import { onMounted } from 'vue'
import Slideshow from '@/components/shared/Slideshow.vue'
import heroImpact from '@/assets/hero-impact.jpg'
import logoUrl from '@/assets/logo.png'

const slideItems = [
  { image: heroImpact, caption: '' },
  { image: '/images/programs/hero-1.jpg', caption: '' },
  { image: '/images/programs/hero-2.jpg', caption: '' },
]

const values = [
  { name: 'Honesty', body: 'we have honesty with our donors, target group, operational partners and working group.' },
  { name: 'Non-discrimination', body: 'we do not have any discrimination for the disabled, religions, colors, races, respect to target group, and political factions. ' },
  { name: 'Collective Benefits', body: 'we do not utilize property of organization for any private benefit, working tirelessly, sharing information and knowledge. ' },
  { name: 'Flexibility', body: 'we respect and accept good comments from target groups, development partners which response to goal and resources existed.' },
  // { name: 'Empowerment', body: 'We do not deliver development; we hand it back to the community.' },
]

const team = [
  { role: 'Board of Directors', desc: 'Policy and oversight, including senior Buddhist leadership.' },
  { role: 'Executive Director', desc: 'Daily operations and strategic execution.' },
  { role: 'Management Committee', desc: 'Coordinates programs across provinces.' },
  { role: 'Technical Coordination', desc: 'Provides inputs across thematic areas.' },
  { role: 'Professional Staff', desc: '30+ full-time and project-based experts in agriculture, education and rural development.' },
]

const provinces = ['Svay Rieng', 'Prey Veng', 'Kratie']

onMounted(() => {
  document.title = 'About Santi Sena — Buddhist NGO in Cambodia'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta('description', "Santi Sena ('Peace Army') was founded in 1994 to alleviate poverty and rebuild moral, environmental and economic life across rural Cambodia.")

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setOgMeta('og:title', 'About Santi Sena')
  setOgMeta('og:description', 'Our story, vision, values and the team carrying the Peace Army forward.')
})
</script>

<template>
  <div class="about-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />

      <div class="hero-content">
        <span class="badge">About Santi Sena</span>
        <h1 class="hero-title">
          A peace army born from the Dharma, raised by villages.
        </h1>
        <p class="hero-subtitle">
          Founded in 1994 by Cambodian Buddhist monks, Santi Sena emerged from the ashes of conflict
          with a quiet conviction: that lasting peace is grown in soil, schools and dignified work,
          not signed in distant offices.
        </p>
      </div>
    </Slideshow>

    <!-- Vision / Mission / Goal -->
    <section class="vmg-section">
      <div class="vmg-card">
        <h2 class="vmg-heading">Vision</h2>
        <p class="vmg-body">
          A Cambodia where peace, justice and harmony flourish across every village and generation.
        </p>
      </div>
      <div class="vmg-card">
        <h2 class="vmg-heading">Mission</h2>
        <p class="vmg-body">
          To alleviate poverty through community-led development rooted in Buddhist ethics —
          empowering farmers, women, youth and children to build better lives.
        </p>
      </div>
      <div class="vmg-card">
        <h2 class="vmg-heading">Goal</h2>
        <p class="vmg-body">
          Better work and living situations for the most vulnerable rural households of southeastern
          Cambodia.
        </p>
      </div>
    </section>

    <!-- Core Values -->
    <section class="values-section">
      <div class="values-container">
        <span class="section-label saffron">Core Values</span>
        <h2 class="values-title">Five values that shape every program</h2>
        <div class="values-grid">
          <div v-for="v in values" :key="v.name" class="value-card">
            <h2 class="value-name">{{ v.name }}</h2>
            <p class="value-body">{{ v.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Organizational Structure -->
    <section class="org-section">
      <div class="org-grid">
        <div class="org-text">
          <span class="section-label saffron">Organizational Structure</span>
          <h2 class="org-heading">A team of monks, managers and master practitioners.</h2>
          <p class="org-body">
            From the Board of Directors to the field staff in Kratie, every level of Santi Sena is
            accountable to the villagers we serve and the donors who trust us.
          </p>
          <figure class="org-visual" aria-label="Santi Sena organization seal">
            <img class="org-logo" :src="logoUrl" alt="Santi Sena seal" loading="lazy" />
          </figure>
        </div>
        <ul class="team-list">
          <li v-for="t in team" :key="t.role" class="team-card">
            <h3 class="team-role">{{ t.role }}</h3>
            <p class="team-desc">{{ t.desc }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Geographical Reach -->
    <section class="geo-section">
      <div class="geo-container">
        <span class="section-label saffron">Geographical reach</span>
        <h2 class="geo-heading">Three provinces. Forty-three communes. Two hundred and ninety-three villages.</h2>
        <div class="geo-grid">
          <div v-for="p in provinces" :key="p" class="geo-card">
            <div class="geo-name">{{ p }}</div>
            <div class="geo-label">Province</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── About page color tokens ───
 * Aliased to the shared global design tokens (see src/assets/base.css).
 */
.about-page {
  --about-primary: var(--primary-color);
  --about-primary-foreground: var(--color-white);
  --about-saffron: var(--primary-dark);
  --about-white: var(--color-white);
  --about-muted: var(--color-ink-soft);
  --about-border: var(--color-border);
  --about-panel: var(--color-white);
  --about-bg-alt: var(--primary-light);
  --about-surface: color-mix(in srgb, var(--about-primary) 90%, white);
  --about-surface-strong: color-mix(in srgb, var(--about-primary) 82%, white);
}

/* ─── Shared ─── */
.section-label {
  display: block;
  font-size: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
}

.section-label.saffron {
  color: var(--about-saffron);
  font-weight: 900;
  letter-spacing: 0.4em;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  background: color-mix(in srgb, var(--about-saffron) 15%, transparent);
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

/* ─── Hero (overlaid on the slideshow via its default slot) ─── */
.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.78) 0%, rgba(0, 0, 0, 0.5) 38%, rgba(0, 0, 0, 0.2) 65%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.4) 0%, transparent 40%, rgba(0, 0, 0, 0.15) 100%);
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 760px;
  padding: 3rem var(--container-padding);
  max-width: 720px;
  margin: 0;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
  color: var(--about-white);
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

.hero-title {
  margin-top: 1.25rem;
  max-width: 48rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-white);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 42rem;
  font-size: 1.1rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}

/* ─── Vision / Mission / Goal ─── */
.vmg-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
  display: grid;
  gap: 3rem;
  padding: 6rem 1.5rem;
}

.vmg-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--about-surface);
  color: var(--about-primary-foreground);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.vmg-heading {
  color: var(--about-primary-foreground);
  margin: 0 0 0.5rem;
}

.vmg-body {
  color: var(--about-primary-foreground);
  line-height: 1.75;
  margin: 0;
  font-size: 1rem;
}

/* ─── Core Values ─── */
.values-section {
  background: var(--about-bg-alt);
  padding: 6rem 0;
}

.values-container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
  /* text-align: center; */
}

.values-title {
  margin-top: 1.5rem;
  color: var(--about-primary);
}

.values-grid {
  margin-top: 3.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.value-card {
  border-radius: 1rem;
  border: 1px solid var(--about-border);
  background: var(--about-panel);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.value-card:hover {
  transform: translateY(-2px);
  border-color: var(--about-saffron);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  background: var(--about-panel);
}

.value-name {
  font-size: 1.125rem;
  color: var(--about-saffron);
  margin-bottom: 0.5rem;

}

.value-body {
  font-size: 0.9rem;
  color: var(--about-muted);
  line-height: 1.65;
  margin: 0;
}

/* ─── Organizational Structure ─── */
.org-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.org-grid {
  display: grid;
  gap: 3rem;
  align-items: center;
}

.org-text {
  min-width: 0;
}

.org-heading {
  margin-top: 1rem;
  color: var(--about-primary);
}

.org-body {
  margin-top: 1.5rem;
  color: var(--about-muted);
  line-height: 1.75;
  font-size: 1rem;
}

.org-visual {
  /* position: relative; */
  display: grid;
  place-items: center;
  margin-top: 2rem;
  /* padding: clamp(1.25rem, 4vw, 2.5rem); */
  /* overflow: hidden; */
  /* border: 1px solid color-mix(in srgb, var(--about-primary) 18%, transparent); */
  /* border-radius: 0.75rem; */

  /* box-shadow: 0 16px 40px rgba(31, 61, 46, 0.1); */
}

/* .org-visual::before {
  content: '';
  position: absolute;
  inset: 1rem;
  border: 1px solid color-mix(in srgb, var(--about-saffron) 20%, transparent);
  border-radius: 0.55rem;
  pointer-events: none;
} */

.org-logo {
  position: relative;
  z-index: 1;
  width: min(100%, 300px);
  max-height: clamp(180px, 30vw, 320px);
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(31, 61, 46, 0.16));
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
  border-radius: 0.75rem;
  border-left: 4px solid var(--about-saffron);
  background: var(--about-panel);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.team-card:hover {
  transform: translateX(4px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  background: var(--about-panel);
  border-color: var(--about-saffron);
}

.team-role {
  font-size: 1.125rem;
  color: var(--about-primary);
}

.team-desc {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--about-muted);
  line-height: 1.65;
}

/* ─── Geographical Reach ─── */
.geo-section {
  background: var(--about-bg-alt);
  padding: 6rem 0;
  color: var(--color-ink);
}

.geo-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1.5rem;
  /* text-align: center; */
}

.geo-heading {
  margin-top: 1rem;
  line-height: 1.2;
  color: var(--about-primary);
}

.geo-grid {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.5rem;
  text-align: center;
}


.geo-card {
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--about-primary) 25%, transparent);
  background: var(--about-panel);
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.geo-card:hover {
  color: var(--about-primary);
  transform: translateY(-2px);
  border-color: var(--about-saffron);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  background: var(--about-panel);
}

.geo-name {
  font-size: 1.5rem;
  color: var(--about-saffron);
}


.geo-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--about-muted);
}

/* ─── Responsive ─── */
@media (min-width: 768px) {
  .vmg-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .values-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .org-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .org-visual {
    margin-top: 2.5rem;
  }

  .geo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .values-grid {
    grid-template-columns: repeat(4, 1fr);
  }

  .org-visual {
    margin-left: auto;
  }
}

@media (max-width: 767px) {
  .hero-content {
    padding-block: 2.5rem;
  }

  .hero-title {
    font-size: clamp(2rem, 11vw, 2.6rem);
  }

  .hero-subtitle {
    font-size: 1rem;
    line-height: 1.65;
  }

  .org-section,
  .values-section,
  .geo-section {
    padding-block: 4rem;
  }

  .org-visual {
    margin-inline: auto;
  }
}

@media (max-width: 480px) {
  .section-label.saffron {
    max-width: 100%;
    font-size: 0.72rem;
    letter-spacing: 0.22em;
  }

  .org-visual {
    padding: 1rem;
  }

  .org-logo {
    width: min(100%, 230px);
    max-height: 220px;
  }
}
</style>
