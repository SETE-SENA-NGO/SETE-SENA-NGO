<script setup lang="ts">
import heroImage from '@/assets/hero-impact.jpg'
// import CallToAction from '@/components/CallToAction.vue'

const events = [
  {
    year: '1994',
    title: 'Founded in Svay Rieng',
    description:
      'Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery.',
  },
  {
    year: '1998',
    title: 'First community forestry site',
    description: 'Village committees take legal stewardship of 120 hectares of degraded forest.',
  },
  {
    year: '2003',
    title: 'Saving-for-Change begins',
    description: 'First women-led savings circles launched in Svay Rieng; the model becomes a program backbone.',
  },
  {
    year: '2007',
    title: 'Expansion to Prey Veng',
    description: 'Education and child protection programming reaches a second province.',
  },
  {
    year: '2011',
    title: 'Biogas program launched',
    description: 'Household biogas units begin replacing firewood in remote kitchens.',
  },
  {
    year: '2014',
    title: '20th anniversary — Kratie office opens',
    description: 'Programs extend to a third province; staff grows past 30 full-time.',
  },
  {
    year: '2018',
    title: 'Child Protection Networks scaled',
    description: 'CPNs active across 43 communes with 24/7 referral pathways.',
  },
  {
    year: '2020',
    title: 'COVID-19 response',
    description: 'Emergency food, hygiene and remote-learning kits reach 200+ villages.',
  },
  {
    year: '2022',
    title: 'Melaleuca oil enterprise',
    description: 'Village forest guardians launch a rural enterprise from non-timber forest products.',
  },
  {
    year: '2024',
    title: '30-year strategic plan',
    description: 'A new five-year strategy: deepen quality, diversify funding, invest in youth leadership.',
  },
]
</script>

<template>
  <div class="timeline-page">
    <section class="hero-section">
      <img :src="heroImage" alt="Rural Cambodian landscape at dawn" class="hero-image" />
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Impact · Timeline</span>
        <h1>Thirty years of walking with villages.</h1>
        <p>
          From a small pagoda in Svay Rieng to 293 villages across three provinces — the milestones that shaped
          Santi Sena.
        </p>
        <div class="hero-actions">
          <!-- <router-link to="/impact" class="hero-link secondary">Explore impact overview</router-link> -->

        </div>
      </div>
    </section>

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
      <RouterLink to="/impact/partners" class="hero-link primary">
        Meet our partners
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
  background: #fdf8ee;
  color: #2f241d;

}

.hero-section {
  position: relative;
  overflow: hidden;
  min-height: 380px;
  display: flex;
  align-items: center;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(120deg, rgba(32, 54, 53, 0.92), rgba(111, 82, 45, 0.74));
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1120px;
  margin: 0 auto;
  padding: 8rem 1.5rem;
  color: #fffdf8;
}

.eyebrow {
  display: inline-block;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.8rem;
  font-weight: 700;
  color: #e86c20;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: Georgia, 'Times New Roman', serif;
}

h1 {
  max-width: 720px;
  font-size: clamp(2.1rem, 4.2vw, 3.3rem);
  line-height: 1.1;
  margin-right: 400px;
}

.hero-content p {
  max-width: 640px;
  margin-top: 1rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.88);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 1.5rem;
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
  background: #ee762c;
  color: #fcfcfc;
  box-shadow: 0 10px 25px rgba(243, 198, 109, 0.25);
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
  border-top: 1px solid #e5d8c6;
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
  color: #0b411e;
  font-size: 1.5rem;
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
  font-size: clamp(1.7rem, 3vw, 2.3rem);
  color: #214438;
}

.intro-block p {
  margin-top: 0.85rem;
  line-height: 1.7;
  color: rgba(47, 36, 29, 0.8);
}

.timeline-list {
  position: relative;
  margin: 2.25rem 0 0;
  padding-left: 1.75rem;
  list-style: none;
  border-left: 2px solid rgba(243, 198, 109, 0.55);
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
  background: #f3c66d;
  box-shadow: 0 0 0 4px #fdf8ee;
}

.timeline-content {
  padding-left: 1.25rem;
}

.timeline-year {
  font-size: 1.15rem;
  font-weight: 700;
  color: #9a5b2d;
}

.timeline-content h3 {
  margin-top: 0.35rem;
  font-size: 1.3rem;
  color: #214438;
}

.timeline-content p {
  margin-top: 0.5rem;
  line-height: 1.7;
  color: rgba(47, 36, 29, 0.8);
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
