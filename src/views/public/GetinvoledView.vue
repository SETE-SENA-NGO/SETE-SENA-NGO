<script setup lang="ts">
import { RouterLink } from 'vue-router'

const ways = [
  {
    title: 'Donate',
    body: 'Support community forestry, clean water, sanitation, education, child protection and livelihood activities for vulnerable families.',
    cta: 'Support our work',
  },
  {
    title: 'Partner',
    body: 'Work with Santi Sena to encourage local initiatives, strengthen communities and protect natural resources in rural Cambodia.',
    cta: 'Explore partnership',
  },
  {
    title: 'Volunteer',
    body: 'Share skills in agriculture, education, WASH, communications, child rights, monitoring or community development.',
    cta: 'Apply to volunteer',
  },
]

const impacts = [
  { value: '293', label: 'villages reached across Svay Rieng and Prey Veng provinces.' },
  { value: '571.601 ha', label: 'of community forest supported and protected.' },
  { value: '4,555', label: 'families joined Saving for Change self-help groups.' },
  { value: '3,400', label: 'children participated in mobile library sessions.' },
]
</script>

<template>
  <main class="get-involved-page">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-inner">
        <span class="eyebrow">Get involved</span>
        <h1>Join Santi Sena in working for peace and community development.</h1>
        <p>
          Santi Sena works with vulnerable and marginalized people to reduce poverty, support local
          initiatives, protect natural resources and promote education, rights and social justice.
        </p>
      </div>
    </section>

    <section class="ways-section" aria-label="Ways to get involved">
      <div class="ways-grid">
        <article v-for="way in ways" :key="way.title" class="way-card">
          <h2>{{ way.title }}</h2>
          <p>{{ way.body }}</p>
          <RouterLink to="/contact" class="action-link">{{ way.cta }} -&gt;</RouterLink>
        </article>
      </div>
    </section>

    <section class="donation-section">
      <div class="donation-inner">
        <span class="eyebrow">Our work in communities</span>
        <h2>Support that reaches real villages.</h2>
        <div class="tier-grid">
          <article v-for="impact in impacts" :key="impact.value" class="tier-card">
            <strong>{{ impact.value }}</strong>
            <p>{{ impact.label }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="monthly-section">
      <h2>Stand with vulnerable families.</h2>
      <p>
        Your support helps Santi Sena continue community-based work in natural resource management,
        sustainable livelihoods, water and sanitation, education, Buddhist preservation and child
        protection.
      </p>
      <RouterLink to="/contact" class="primary-link">Contact Santi Sena</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.get-involved-page {
  --font-display: Cambria, Georgia, 'Times New Roman', serif;
  --font-body: Aptos, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  min-height: 100vh;
  background: #fbf4e6;
  color: #073f3a;
  font-family: var(--font-body);
  font-size: 16px;
}

.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  min-height: 500px;
  background:
    linear-gradient(90deg, rgba(4, 59, 56, 0.82), rgba(4, 59, 56, 0.5)),
    url('https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1800&q=80')
      center 42% / cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(3, 47, 48, 0.85), rgba(3, 47, 48, 0.18));
}

.hero-inner {
  width: min(100% - 2rem, 1540px);
  margin: 0 auto;
  padding: 2.9rem 0 7rem;
}

.eyebrow {
  color: #ff7a1a;
  font-family: var(--font-body);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 920px;
  margin: 1rem 0 0;
  color: #fff7e9;
  font-family: var(--font-display);
  font-size: clamp(2.35rem, 4.2vw, 4.2rem);
  line-height: 1.05;
  font-weight: 600;
}

.hero p {
  max-width: 830px;
  margin: 1.6rem 0 0;
  color: #fff7e9;
  font-size: clamp(1rem, 1.25vw, 1.2rem);
  line-height: 1.45;
}

.ways-section {
  width: 100%;
  margin: 0 auto;
  padding: 7.4rem min(8vw, 10.5rem) 7.5rem;
  background: #fbf4e6;
}

.monthly-section {
  width: min(100% - 2rem, 1120px);
  margin: 0 auto;
  padding: 7rem 0 8rem;
}

.ways-grid {
  display: grid;
  gap: 2.5rem;
}

.way-card {
  display: flex;
  min-height: 375px;
  flex-direction: column;
  border: 1px solid #e2d4bd;
  border-radius: 1.5rem;
  background: rgba(255, 251, 243, 0.78);
  padding: 3.2rem;
  box-shadow: 0 4px 14px rgba(54, 38, 17, 0.13);
}

.way-card h2 {
  margin: 0;
  color: #073f3a;
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 2vw, 2.1rem);
  font-weight: 600;
  line-height: 1.08;
}

.way-card p {
  flex: 1;
  margin: 1.45rem 0 0;
  color: #234b45;
  font-size: 1rem;
  line-height: 1.5;
}

.action-link,
.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  margin-top: 2.25rem;
  border: 0;
  border-radius: 999px;
  background: #ff7a1a;
  color: #fffaf0;
  font-size: 0.86rem;
  font-weight: 700;
  padding: 0.95rem 1.5rem;
  box-shadow: 0 18px 34px rgba(255, 122, 26, 0.2);
}

.donation-section {
  background: #094239;
  color: #fff7e9;
  padding: 8.2rem 0 7.6rem;
}

.donation-inner {
  width: min(100% - 2rem, 1380px);
  margin: 0 auto;
}

.donation-inner h2,
.monthly-section h2 {
  margin: 1rem 0 0;
  font-family: var(--font-display);
  font-size: clamp(1.9rem, 3.3vw, 3rem);
  line-height: 1.1;
  font-weight: 600;
}

.tier-grid {
  display: grid;
  gap: 1.9rem;
  margin-top: 4.2rem;
}

.tier-card {
  min-height: 197px;
  border: 1px solid rgba(255, 247, 233, 0.16);
  border-radius: 1.15rem;
  padding: 2.8rem 2.55rem;
}

.tier-card strong {
  display: block;
  color: #ff7a1a;
  font-family: var(--font-display);
  font-size: clamp(2rem, 2.6vw, 2.45rem);
  font-weight: 500;
  line-height: 1;
}

.tier-card p {
  margin: 1.25rem 0 0;
  color: #fff7e9;
  font-size: 0.95rem;
  line-height: 1.45;
}

.monthly-section {
  max-width: 1120px;
  text-align: center;
}

.monthly-section p {
  max-width: 1080px;
  margin: 1.35rem auto 0;
  color: #234b45;
  font-size: 1rem;
  line-height: 1.55;
}

.monthly-section .primary-link {
  align-self: center;
  margin-top: 3rem;
}

@media (min-width: 700px) {
  .ways-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .tier-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 699px) {
  .hero {
    min-height: 520px;
  }

  .hero-inner {
    padding: 3rem 0 5rem;
  }

  .ways-section {
    padding: 4rem 1rem;
  }

  .way-card {
    min-height: auto;
    padding: 2rem;
  }

  .way-card p,
  .monthly-section p,
  .tier-card p {
    font-size: 0.92rem;
  }

  .get-involved-page {
    font-size: 15px;
  }
}

@media (min-width: 960px) {
  .tier-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
