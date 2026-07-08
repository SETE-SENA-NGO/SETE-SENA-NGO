<script setup lang="ts">
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/livelihood-hero1.jpg', caption: 'Integrated farming systems that combine rice, fish, vegetables and livestock on one plot.' },
  { image: '/images/programs/livelihood-hero2.jpg', caption: 'Saving-for-Change groups, primarily led by women, building household resilience.' },
  { image: '/images/programs/livelihood-hero3.jpg', caption: 'Agricultural cooperatives negotiating fair prices for smallholder farmers.' },
  { image: '/images/programs/livelihood-hero4.jpg', caption: 'Rural enterprise development keeping young adults in the village, near their children.' },
]

const stats = [
  { number: '180+', label: 'SAVINGS GROUPS', description: 'Women-led Saving-for-Change circles active across three provinces.' },
  { number: '2,400+', label: 'MEMBERS', description: 'Saving, lending and investing together.' },
  { number: '12', label: 'COOPERATIVES', description: 'Rice, vegetables, melaleuca oil and handicrafts.' },
]

const whatWeDo = [
  'Integrated farming systems (rice + fish + vegetables + livestock on one plot)',
  'Saving-for-Change (SfC) self-help groups, primarily women-led',
  'Agricultural cooperatives for collective bargaining and shared equipment',
  'Rural enterprise development — melaleuca oil, honey, handicrafts',
  'Financial literacy, bookkeeping and micro-enterprise training',
  'Market linkages with provincial buyers and social enterprises',
]

const whyItMatters = [
  'Household income diversification reduces the risk of debt bondage and trafficking',
  'Women-led savings shift decision-making power inside the household',
  'Cooperatives break the isolation of the smallholder in the marketplace',
  'Local enterprise keeps young adults in the village, near their children',
]
</script>

<template>
  <div class="education-page">
    <Slideshow :slides="slideItems" />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="eyebrow">PROGRAMS · GOAL 03 LIVELIHOODS</p>
        <h1>Dignified work rooted in the village.</h1>
        <p class="hero-desc">
          Integrated farming, Saving-for-Change groups, agricultural cooperatives and
          rural enterprise — livelihoods that keep families together instead of sending
          parents abroad for wages.
        </p>
      </div>
    </section>

    <!-- Intro + Stats -->
    <section class="section-cream">
      <div class="container">
        <p class="intro-text">
          Poverty pushes rural Cambodians into unsafe migration and predatory debt.
          Santi Sena answers with income at home — soil restored, savings pooled,
          cooperatives negotiating fair prices, and small enterprises rooted in local
          resources.
        </p>

        <div class="stats-grid">
          <div v-for="stat in stats" :key="stat.label" class="stat-card">
            <h2 class="stat-number">{{ stat.number }}</h2>
            <p class="stat-label">{{ stat.label }}</p>
            <p class="stat-desc">{{ stat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What we do -->
    <section class="section-cream">
      <div class="container">
        <h2 class="section-title">What we do</h2>
        <ul class="bullet-list">
          <li v-for="item in whatWeDo" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <!-- Our approach -->
    <section class="section-cream">
      <div class="container">
        <h2 class="section-title">Our approach</h2>
        <p class="approach-text">
          We do not distribute cash. We build the systems — saving groups,
          cooperatives, farmer schools — that let a household earn, save, invest
          and repeat. Every group is coached for 18–24 months, then graduates to
          independence with our field team on call.
        </p>

        <blockquote class="quote-block">
          "Our group has lent to twelve families for chickens and school fees.
          Nobody has left for Thailand this year."
          <footer>— Chenda, SfC treasurer, Svay Rieng</footer>
        </blockquote>
      </div>
    </section>

    <!-- Why it matters -->
    <section class="section-cream">
      <div class="container">
        <h2 class="section-title">Why it matters</h2>
        <ul class="bullet-list">
          <li v-for="item in whyItMatters" :key="item">{{ item }}</li>
        </ul>
      </div>
    </section>

    <!-- CTA -->
    <section class="edu-cta">
      <div class="container cta-inner">
        <p class="cta-text">Ready to take the next step?</p>
        <router-link to="/get-involved" class="btn-primary">Seed a savings group →</router-link>
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

/* Hero */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0 2rem;
  background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-color) 100%);
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(20,129,62,0.75) 0%, rgba(20,129,62,0.3) 60%, transparent 100%);
  z-index: 1;
}
.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
  color: white;
  padding-left: 3rem;
}
.eyebrow {
  color: var(--primary-light);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.hero-content h1 {
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
}
.hero-desc {
  line-height: 1.6;
  opacity: 0.95;
}

/* Cream sections */
.section-cream {
  background: var(--color-cream);
  padding: 3.5rem 0;
}
.intro-text {
  line-height: 1.7;
  color: var(--primary-dark);
  max-width: 800px;
  margin-bottom: 2.5rem;
}

/* Stats */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}
.stat-card {
  background: #fffaf0;
  border-radius: 16px;
  padding: 1.75rem;
}
.stat-number {
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
.stat-label {
  font-weight: 700;
  letter-spacing: 0.05em;
  color: var(--primary-dark);
  margin-bottom: 0.4rem;
}
.stat-desc {
  color: #5c5c5c;
}

/* Section titles + lists */
.section-title {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
}
.bullet-list {
  list-style: none;
  padding: 0;
}
.bullet-list li {
  position: relative;
  padding-left: 1.5rem;
  margin-bottom: 0.9rem;
  color: #333;
  line-height: 1.6;
}
.bullet-list li::before {
  content: '•';
  color: var(--primary-color);
  position: absolute;
  left: 0;
  font-size: 1.2rem;
}

/* Approach + Quote */
.approach-text {
  line-height: 1.7;
  color: #333;
  max-width: 850px;
  margin-bottom: 2rem;
}
.quote-block {
  border-left: 4px solid var(--primary-color);
  background: var(--primary-light);
  padding: 1.5rem 2rem;
  font-style: italic;
  color: var(--primary-dark);
  border-radius: 0 12px 12px 0;
}
.quote-block footer {
  margin-top: 0.75rem;
  font-style: normal;
  color: #666;
}

/* CTA */
.edu-cta {
  background-color: var(--color-cream);
  padding: 2.5rem 0;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}
.cta-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cta-text {
  color: var(--primary-dark);
}
.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .cta-inner { flex-direction: column; gap: 1rem; text-align: center; }
}
</style>