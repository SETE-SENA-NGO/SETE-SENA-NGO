<script setup lang="ts">
const stats = [
  { number: '120+', label: 'PRE-SCHOOL CHILDREN', description: 'Enrolled each year across remote villages.' },
  { number: '8', label: 'MOBILE LIBRARIES', description: 'Reaching villages with no school library.' },
  { number: '60+', label: 'ANNUAL SCHOLARSHIPS', description: 'For the poorest students at every level.' },
]

const whatWeDo = [
  'Community pre-schools led by trained local teachers in remote villages',
  'Mobile library service bringing books, audio and learning kits to children',
  'Scholarships covering uniforms, supplies and transport for the poorest students',
  'Buddhist moral education and life-skills classes in pagoda settings',
  'Youth peer-educator groups on health, environment and child rights',
  'Teacher training and parent engagement to keep children in school',
]

const whyItMatters = [
  'Children who attend pre-school are far more likely to complete primary and secondary school',
  'Scholarships keep the poorest girls in class through the most vulnerable years',
  'Mobile libraries reach children a bus route never will',
  'Pagoda-based ethics classes preserve Khmer language and moral tradition',
]
</script>

<template>
  <div class="education-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">PROGRAMS · GOAL 02 EDUCATION</p>
        <h1>A teacher in every village.<br />A book in every hand.</h1>
        <p class="hero-desc">
          From community pre-schools to mobile libraries and pagoda-based ethics
          classes, Santi Sena builds the kind of learning that lasts a lifetime —
          and lifts a household out of poverty.
        </p>
      </div>
    </section>

    <!-- Intro + Stats -->
    <section class="section-cream">
      <div class="container">
        <p class="intro-text">
          Most rural Cambodian children miss the critical years before primary school.
          Santi Sena fills that gap with low-cost community pre-schools, then keeps
          walking with families through scholarships, libraries and youth groups.
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
          We hire teachers from the villages we serve, train them in early-childhood
          pedagogy, and pair every classroom with a parent committee. Curriculum blends
          the national standard with Buddhist ethics, Khmer culture and hands-on
          environmental learning.
        </p>

        <blockquote class="quote-block">
          "Before the pre-school, my daughter had never held a pencil. Now she reads
          to her grandmother every night."
          <footer>— Sopheak, mother of two, Prey Veng</footer>
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
        <router-link to="/get-involved" class="btn-primary">Sponsor a child →</router-link>
        </div>
    </section>
  </div>
</template>

<style scoped>

.education-page {
  --cream: #fdf6e9;
  --dark-green: #16342a;
  --orange: #d97a34;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', -apple-system, sans-serif;
  font-family: var(--font-body);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Hero */
.hero {
  position: relative;
  min-height: 480px;
  display: flex;
  align-items: center;
  background: url('/images/programs/education-hero.jpg') center/cover no-repeat;
  padding: 0 2rem;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(22,52,42,0.75) 0%, rgba(22,52,42,0.3) 60%, transparent 100%);
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 600px;
  color: white;
  padding-left: 3rem;
}
.eyebrow {
  color: var(--orange);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  margin-bottom: 1rem;
  font-family: var(--font-body);
}
.hero-content h1 {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 3.2rem;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
}
.hero-desc {
  font-size: 1.05rem;
  line-height: 1.6;
  opacity: 0.95;
}

/* Cream sections */
.section-cream {
  background: var(--cream);
  padding: 3.5rem 0;
}
.intro-text {
  font-size: 1.15rem;
  line-height: 1.7;
  color: var(--dark-green);
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
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 2.5rem;
  color: var(--orange);
  margin-bottom: 0.5rem;
}
.stat-label {
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.05em;
  color: var(--dark-green);
  margin-bottom: 0.4rem;
}
.stat-desc {
  color: #5c5c5c;
  font-size: 0.95rem;
}

/* Section titles + lists */
.section-title {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--dark-green);
  font-size: 1.8rem;
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
  color: var(--orange);
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
  border-left: 4px solid var(--orange);
  background: #f5ead2;
  padding: 1.5rem 2rem;
  font-style: italic;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  color: var(--dark-green);
  border-radius: 0 12px 12px 0;
}
.quote-block footer {
  margin-top: 0.75rem;
  font-style: normal;
  font-family: var(--font-body);
  font-size: 0.9rem;
  color: #666;
}

/* CTA */
.edu-cta {
  background-color: var(--cream); /* #fdf6e9 */
  padding: 2.5rem 0;
}
.cta-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cta-text {
  color: var(--dark-green);
  font-family: var(--font-heading);
  font-size: 1.3rem;
}
.btn-primary {
  background: var(--orange);
  color: white;
  padding: 0.75rem 1.75rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .hero-content h1 { font-size: 2rem; }
  .cta-inner { flex-direction: column; gap: 1rem; text-align: center; }
}
</style>