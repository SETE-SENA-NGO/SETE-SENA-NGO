<script setup lang="ts">
import heroImage1 from '@/assets/hero-impact.jpg'
import heroImage2 from '@/assets/hero-impact-village.jpg'
import heroImage3 from '@/assets/hero-impact-forest.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: heroImage1, caption: '' },
  { image: heroImage2, caption: '' },
  { image: heroImage3, caption: '' },
]

const events = [
  {
    year: '2024',
    title: '30-year strategic plan',
    description: 'A new five-year strategy: deepen quality, diversify funding, invest in youth leadership.',
  },
  {
    year: '2022',
    title: 'Melaleuca oil enterprise',
    description: 'Village forest guardians launch a rural enterprise from non-timber forest products.',
  },
  {
    year: '2020',
    title: 'COVID-19 response',
    description: 'Emergency food, hygiene and remote-learning kits reach 200+ villages.',
  },
  {
    year: '2018',
    title: 'Child Protection Networks scaled',
    description: 'CPNs active across 43 communes with 24/7 referral pathways.',
  },
  {
    year: '2014',
    title: '20th anniversary — Kratie office opens',
    description: 'Programs extend to a third province; staff grows past 30 full-time.',
  },
  {
    year: '2011',
    title: 'Biogas program launched',
    description: 'Household biogas units begin replacing firewood in remote kitchens.',
  },
  {
    year: '2007',
    title: 'Expansion to Prey Veng',
    description: 'Education and child protection programming reaches a second province.',
  },
  {
    year: '2003',
    title: 'Saving-for-Change begins',
    description: 'First women-led savings circles launched in Svay Rieng; the model becomes a program backbone.',
  },
  {
    year: '1998',
    title: 'First community forestry site',
    description: 'Village committees take legal stewardship of 120 hectares of degraded forest.',
  },
  {
    year: '1994',
    title: 'Founded in Svay Rieng',
    description:
      'Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery.',
  },
]
</script>

<template>
  <div class="timeline-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Impact · Timeline</span>
        <h1>Thirty years of walking with villages.</h1>
        <p>
          From a small pagoda in Svay Rieng to 293 villages across three provinces — the milestones that shaped
          Santi Sena.
        </p>
      </div>
    </Slideshow>

    <section class="timeline-section">
      <div class="timeline-shell">
        <div class="intro-row">
          <div class="intro-block">
            <span class="eyebrow">Milestones</span>
            <h2>Progress built through patient partnership.</h2>
            <p>
              Each step reflects a commitment to long-term, community-led change grounded in trust, dignity and
              local stewardship.
            </p>
          </div>


        </div>

        <ol class="timeline-list">
          <li v-for="event in events" :key="event.year" class="timeline-item">
            <span class="timeline-dot" />
            <div class="timeline-content">
              <div class="timeline-year">{{ event.year }}</div>
              <h3>{{ event.title }}</h3>
              <p>{{ event.description }}</p>
            </div>
          </li>
        </ol>

       <section class="cta-block">
    <div class="cta-content">
      <h3>Ready to take the next step?</h3>
      <RouterLink to="/impact" class="hero-link primary">
        Back to impact
        <span>→</span>
      </RouterLink>

    </div>
  </section>
      </div>
    </section>
  </div>
</template>

<style scoped>
.timeline-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);

}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.85) 0%,
    rgba(6, 18, 13, 0.55) 40%,
    rgba(6, 18, 13, 0.22) 68%,
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
  max-width: 720px;
  margin: 0;
  padding: 3rem clamp(1.5rem, 5vw, 4rem);
  animation: fadeInUp 0.8s ease-out;
  color: #fffdf8;
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
  display: inline-block;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--primary-color);
}

h1,
h2,
h3 {
  margin: 0;
}

h1 {
  max-width: 720px;
  line-height: 1.1;
  color: #fffdf8;
}

.hero-content p {
  max-width: 640px;
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.88);
}

.hero-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 1.1rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-link:hover {
  transform: translateY(-1px);
}

.hero-link.primary {
  background: var(--primary-color);
  color: #fcfcfc;
  box-shadow: 0 10px 25px color-mix(in srgb, var(--primary-color) 25%, transparent);
}

.hero-link.secondary {
  background: rgba(255, 253, 248, 0.16);
  color: #fffdf8;
  border: 1px solid rgba(255, 253, 248, 0.28);
}

.intro-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  margin-top: 1.75rem;
}

.intro-block {
  flex: 1;
}

.cta-block {
  width: 100%;
  padding: 1.25rem 0 0;
  background: transparent;
  border-top: 1px solid var(--color-border);
}

.cta-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.cta-content h3 {
  margin: 0;
  color: var(--primary-dark);
  font-weight: 500;
  line-height: 1.2;
}




.timeline-section {
  padding: 4.5rem 1.5rem 5rem;
}

.timeline-shell {
  max-width: 960px;
  margin: 0 auto;
}

.intro-block {
  max-width: 720px;
}

.intro-block h2 {
  color: var(--primary-dark);
}

.intro-block p {
  margin-top: 0.85rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-ink) 80%, transparent);
}

.timeline-list {
  position: relative;
  margin: 2.25rem 0 0;
  padding-left: 1.75rem;
  list-style: none;
  border-left: 2px solid color-mix(in srgb, var(--primary-color) 55%, transparent);
}

.timeline-item {
  position: relative;
  padding-bottom: 1.75rem;
}

.timeline-dot {
  position: absolute;
  left: -1.58rem;
  top: 0.2rem;
  width: 0.95rem;
  height: 0.95rem;
  border-radius: 999px;
  background: var(--primary-color);
  box-shadow: 0 0 0 4px var(--color-cream);
}

.timeline-content {
  padding-left: 1.25rem;
}

.timeline-year {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary-dark);
}

.timeline-content h3 {
  margin-top: 0.35rem;
  color: var(--primary-dark);
}

.timeline-content p {
  margin-top: 0.5rem;
  line-height: 1.7;
  color: color-mix(in srgb, var(--color-ink) 80%, transparent);
}

@media (max-width: 640px) {
  .hero-content {
    padding: 3.5rem 1.25rem;
  }

  .timeline-section {
    padding: 3.5rem 1.25rem 4rem;
  }

  .intro-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .cta-block {
    align-items: flex-start;
  }
}
</style>
