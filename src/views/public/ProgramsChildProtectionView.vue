<script setup lang="ts">
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/child-protection.jpg', caption: 'Every child safe. Every child in school.' },
  { image: '/images/programs/child-protection1.jpg', caption: 'Village Child Protection Networks trained in identification and referral.' },
  { image: '/images/programs/child-protection2.jpg', caption: 'Anti-trafficking campaigns at borders, markets and schools.' },
  { image: '/images/programs/child-protection3.jpg', caption: 'Peer-educator youth groups building a safety net for the next generation.' },
]

const stats = [
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.' },
]

const whatWeDo = [
  'Anti-child-trafficking campaigns at borders, markets and schools',
  'Village Child Protection Networks (CPN) trained in identification and referral',
  'Child rights advocacy with commune councils and provincial authorities',
  'Peer-educator youth groups on safe migration, health and rights',
  'Family reintegration support for children returning from unsafe labour',
  'Safeguarding training for every teacher, monk and volunteer we work with',
]
</script>

<template>
  <div class="education-page">
    <Slideshow :slides="slideItems" />

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>

      <div class="hero-content">
        <p class="eyebrow">PROGRAMS · GOAL 04 CHILD PROTECTION</p>
        <h1>Every child safe. Every child in school.</h1>
        <p class="hero-desc">
          Anti-trafficking campaigns, village Child Protection Networks, child rights
          advocacy and youth peer educators — because peace begins with a safe
          childhood.
        </p>
      </div>
    </section>

    <!-- Intro + Stats -->
    <section class="section-cream">
      <div class="container">
        <p class="intro-text">
          Cross-border migration, poverty and family separation put rural Cambodian
          children at risk of unsafe labour and trafficking. Santi Sena works with
          villages, schools and pagodas to build the safety net closest to the child
          — before anything goes wrong.
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
          Every network is anchored by the people children already trust — mothers,
          monks, teachers, commune council members. We train, coach and connect them
          to formal referral pathways so a case identified in a village at dawn
          reaches the provincial social affairs office by dusk.
        </p>

        <blockquote class="quote-block">
          "The network spotted my nephew before the broker took him. He is back
          in school this term."
          <footer>— Village CPN member, Svay Rieng</footer>
        </blockquote>
      </div>
    </section>

    <!-- CTA -->
    <section class="edu-cta">
      <div class="container cta-inner">
        <p class="cta-text">Ready to take the next step?</p>
        <router-link to="/get-involved" class="btn-primary">Support a network →</router-link>
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
  min-height: 560px;
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