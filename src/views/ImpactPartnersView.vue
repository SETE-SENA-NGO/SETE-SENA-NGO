<template>
  <div class="partners-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="badge">Impact · Partners</span>
        <h1>Trusted by ten+ international donors and every government line ministry we touch.</h1>
        <p class="hero-subtitle">
          Multi-year grants, audited books and thirty years of unbroken village presence — that's why partners return.
        </p>
      </div>
    </section>

    <!-- Partners Carousel Section -->
    <section class="section partners-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Our Network</span>
          <h2 class="section-title">Partners & Supporters</h2>
          <p class="section-intro">
            These organizations and institutions make our work possible through funding,
            technical expertise, and shared commitment to sustainable development.
          </p>
        </div>

        <!-- Logo Carousel -->
        <div class="logo-carousel-container">
          <div class="logo-carousel-track" :class="{ paused: isPaused }">
            <div
              v-for="(partner, index) in duplicatedPartners"
              :key="`${partner.name}-${index}`"
              class="partner-logo-card"
              @mouseenter="isPaused = true"
              @mouseleave="isPaused = false"
              :tabindex="0"
              role="img"
              :aria-label="`${partner.name} logo`"
            >
              <div class="logo-placeholder">{{ partner.logo }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- International Donors Section -->
    <section class="section donors-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Funding Partners</span>
          <h2 class="section-title">International Donors</h2>
          <p class="section-intro">
            Our international partners provide the resources and technical expertise that power
            community-led development across southeastern Cambodia.
          </p>
        </div>
        <div class="donors-grid">
          <div v-for="donor in partners" :key="donor.name" class="donor-card">
            <div class="donor-logo">{{ donor.logo }}</div>
            <h3 class="donor-name">{{ donor.name }}</h3>
          </div>
        </div>
      </div>
    </section>

    <!-- Government Coordination Section -->
    <section class="section government-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Government Relations</span>
          <h2 class="section-title">Government Coordination</h2>
          <p class="section-intro">
            We work hand-in-hand with national and provincial government bodies to align our
            programs with Cambodia's development priorities.
          </p>
        </div>
        <div class="government-grid">
          <div v-for="item in governmentItems" :key="item.title" class="gov-card">
            <div class="gov-icon">{{ item.icon }}</div>
            <h3 class="gov-title">{{ item.title }}</h3>
            <p class="gov-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Local Partners Section -->
    <section class="section local-partners-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Community Roots</span>
          <h2 class="section-title">Local Partners</h2>
          <p class="section-intro">
            Sustainable change is built from the ground up. These local institutions and
            networks are the backbone of every program we run.
          </p>
        </div>
        <div class="local-grid">
          <div v-for="item in localItems" :key="item.title" class="local-card">
            <div class="local-number">{{ item.number }}</div>
            <h3 class="local-title">{{ item.title }}</h3>
            <p class="local-desc">{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Partners Stay Section -->
    <section class="section why-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Why Partners Trust Us</span>
          <h2 class="section-title">Why Partners Stay</h2>
          <p class="section-intro">
            Long-term partnerships don't happen by chance. Here's what keeps our partners
            committed year after year.
          </p>
        </div>
        <div class="why-grid">
          <div v-for="item in whyItems" :key="item.title" class="why-card">
            <div class="why-icon">{{ item.icon }}</div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Become a Partner Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-card">
          <div class="cta-text">
            <h2 class="cta-title">Ready to take the next step?</h2>
            <p class="cta-desc">
              Join our network of international donors, government partners, and local organizations
              working together for sustainable impact in Cambodia.
            </p>
          </div>
          <div class="cta-actions">
            <router-link to="/get-involved/partner" class="btn btn--primary">
              Partner with us <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

// Partner data
const partners = [
  { name: 'UNDP', logo: 'UNDP' },
  { name: 'Asian Development Bank', logo: 'ADB' },
  { name: 'Oxfam', logo: 'OXFAM' },
  { name: 'Bread for the World', logo: 'BFW' },
  { name: 'Misereor', logo: 'MIS' },
  { name: 'European Union', logo: 'EU' },
  { name: 'USAID / Winrock', logo: 'USAID' },
  { name: 'Diakonia', logo: 'DIA' },
  { name: 'Heinrich Böll Stiftung', logo: 'HBS' },
  { name: 'Caritas', logo: 'CAR' },
];

const governmentItems = [
  {
    icon: '🏛️',
    title: 'Ministry of Interior',
    desc: 'Registration and coordination across all program areas.',
  },
  {
    icon: '🌳',
    title: 'Ministry of Environment',
    desc: 'Community forestry and natural resource management.',
  },
  {
    icon: '👩‍👧‍👧',
    title: 'Ministry of Women\'s Affairs',
    desc: 'Gender equality initiatives and child protection programs.',
  },
  {
    icon: '📚',
    title: 'Ministry of Education, Youth & Sport',
    desc: 'Pre-school certification and non-formal education.',
  },
  {
    icon: '📍',
    title: 'Provincial Departments',
    desc: 'Svay Rieng, Prey Veng and Kratie — our three focal provinces.',
  },
];

const localItems = [
  {
    number: '01',
    title: 'Pagoda & Monastic Networks',
    desc: 'Village pagodas and monastic networks across three provinces serve as trusted community hubs.',
  },
  {
    number: '02',
    title: 'Commune Councils & Child Protection',
    desc: 'Commune councils and Child Protection Networks ensure local governance and safeguarding.',
  },
  {
    number: '03',
    title: 'NGO Forum & Working Groups',
    desc: 'Cambodian NGO Forum and thematic working groups on environment, child rights, and more.',
  },
  {
    number: '04',
    title: 'Academic Partnerships',
    desc: 'Provincial and national universities collaborating on applied research and monitoring.',
  },
  {
    number: '05',
    title: 'Social Enterprises',
    desc: 'Local social enterprises buying cooperative produce at fair prices, creating sustainable markets.',
  },
];

const whyItems = [
  {
    icon: '🏛️',
    title: '30 years of unbroken presence',
    desc: 'in southeastern Cambodia — trust built over generations.',
  },
  {
    icon: '📊',
    title: 'Audited financial systems',
    desc: 'and clean grant reporting with full transparency.',
  },
  {
    icon: '🤝',
    title: 'Deep community trust',
    desc: 'rooted in Buddhist moral leadership and village relationships.',
  },
  {
    icon: '🚀',
    title: 'Proven ability to scale',
    desc: 'pilots into province-wide programs with measurable outcomes.',
  },
];

// Carousel state
const isPaused = ref(false);

// Duplicate partners for seamless infinite loop
const duplicatedPartners = computed(() => {
  return [...partners, ...partners, ...partners];
});
</script>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.partners-page {
  --green: #16302a;
  --green-muted: #3f5f52;
  --orange: #dd7a2b;
  --ink: #2b2b28;
  --ink-soft: #5b564c;
  --cream: #faf3e6;
  --cream-soft: #fdf8ef;
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  font-family: inherit;
  color: var(--ink);
  background: var(--cream);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--orange);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(221, 122, 43, 0.2);
  border-radius: 9999px;
  background: rgba(221, 122, 43, 0.06);
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--green);
  margin-bottom: 1rem;
  font-family: var(--font-serif);
  line-height: 1.2;
}

.section-intro {
  font-size: 1.1rem;
  color: var(--ink-soft);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

/* =====================
   Hero
   ===================== */
.hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 6rem 1.5rem;
  background: linear-gradient(135deg, #1e3d2c 0%, #16302a 50%, #0f231a 100%);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(221, 122, 43, 0.12) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(22, 48, 42, 0.4) 0%, transparent 50%);
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--orange);
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(221, 122, 43, 0.35);
  border-radius: 9999px;
  background: rgba(221, 122, 43, 0.1);
}

.hero-content h1 {
  font-size: clamp(2.25rem, 4.5vw, 3.25rem);
  font-weight: 700;
  line-height: 1.2;
  color: #fdf8ef;
  margin-bottom: 1.25rem;
  font-family: var(--font-serif);
}

.hero-subtitle {
  font-size: 1.15rem;
  color: rgba(253, 248, 239, 0.85);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

/* =====================
   Partners Section
   ===================== */
.partners-section {
  background: #ffffff;
}

/* =====================
   Logo Carousel
   ===================== */
.logo-carousel-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 2rem 0;
  mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 4%,
    black 96%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to right,
    transparent 0%,
    black 4%,
    black 96%,
    transparent 100%
  );
}

.logo-carousel-track {
  display: flex;
  gap: 2rem;
  animation: scroll 35s linear infinite;
  will-change: transform;
}

.logo-carousel-track.paused {
  animation-play-state: paused;
}

@keyframes scroll {
  0% {
    transform: translateX(0);
  }
  100% {
    transform: translateX(-33.33%);
  }
}

.partner-logo-card {
  flex-shrink: 0;
  width: 220px;
  height: 110px;
  background: #ffffff;
  border: 1px solid #e8e4df;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.partner-logo-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(221, 122, 43, 0.3);
}

.partner-logo-card:focus {
  outline: 2px solid var(--orange);
  outline-offset: 2px;
}

.logo-placeholder {
  max-height: 55px;
  max-width: 160px;
  object-fit: contain;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green);
  text-align: center;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

/* Respect prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .logo-carousel-track {
    animation: none;
  }

  .partner-logo-card {
    transition: none;
  }
}

/* =====================
   Donors Section
   ===================== */
.donors-section {
  background: var(--cream);
}

.donors-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.donor-card {
  background: #ffffff;
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem 1.25rem;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
}

.donor-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: rgba(221, 122, 43, 0.25);
}

.donor-logo {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--green);
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
  font-family: var(--font-serif);
}

.donor-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink-soft);
  margin: 0;
  line-height: 1.4;
}

/* =====================
   Government Section
   ===================== */
.government-section {
  background: #ffffff;
}

.government-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.gov-card {
  background: var(--cream);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  border-left: 4px solid var(--green);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.gov-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.gov-card:nth-child(4),
.gov-card:nth-child(5) {
  grid-column: span 1;
}

.gov-card:nth-child(4) {
  grid-column: 2;
}

.gov-icon {
  font-size: 2rem;
  margin-bottom: 0.75rem;
}

.gov-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--green);
  margin: 0 0 0.5rem;
  font-family: var(--font-serif);
}

.gov-desc {
  font-size: 0.95rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   Local Partners Section
   ===================== */
.local-partners-section {
  background: var(--cream);
}

.local-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.local-card {
  background: #ffffff;
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.local-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.06);
}

.local-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--orange);
  margin-bottom: 1rem;
  letter-spacing: 0.08em;
}

.local-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--green);
  margin: 0 0 0.5rem;
  font-family: var(--font-serif);
}

.local-desc {
  font-size: 0.9rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   Why Partners Stay Section
   ===================== */
.why-section {
  background: #ffffff;
}

.why-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

.why-card {
  background: var(--cream);
  border-radius: 1rem;
  padding: 2.5rem 1.5rem;
  text-align: center;
  border: 1px solid rgba(22, 48, 42, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.why-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}

.why-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.why-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--green);
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.why-card p {
  font-size: 0.95rem;
  color: var(--ink-soft);
  line-height: 1.6;
  margin: 0;
}

/* =====================
   CTA Section
   ===================== */
.cta-section {
  padding: 5rem 0;
  background: var(--cream);
}

.cta-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: clamp(2rem, 4vw, 3.5rem);
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #1e3d2c 0%, #16302a 60%, #0f231a 100%);
  box-shadow: 0 24px 48px rgba(15, 35, 26, 0.28);
  align-items: center;
  text-align: center;
}

.cta-title {
  margin: 0 0 0.75rem;
  font-family: var(--font-serif);
  font-weight: 700;
  font-size: clamp(1.8rem, 3.5vw, 2.25rem);
  color: #fdf8ef;
}

.cta-desc {
  margin: 0;
  color: rgba(253, 248, 239, 0.8);
  font-size: 1.05rem;
  line-height: 1.7;
  max-width: 600px;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.85rem 2rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease, transform 0.2s ease;
}

.btn--primary {
  background: var(--orange);
  color: #211a12;
}

.btn--primary:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .logo-carousel-track {
    gap: 1.5rem;
  }

  .partner-logo-card {
    width: 200px;
    height: 100px;
    padding: 20px;
  }

  .donors-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .government-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .gov-card:nth-child(4),
  .gov-card:nth-child(5) {
    grid-column: auto;
  }

  .local-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .why-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    padding: 4rem 1.5rem;
  }

  .hero-content h1 {
    font-size: 2.25rem;
  }

  .hero-subtitle {
    font-size: 1.05rem;
  }

  .section-title {
    font-size: 2rem;
  }

  .section {
    padding: 3rem 0;
  }

  .section-header {
    margin-bottom: 2.5rem;
  }

  .logo-carousel-track {
    gap: 1rem;
  }

  .partner-logo-card {
    width: 180px;
    height: 90px;
    padding: 16px;
  }

  .logo-placeholder {
    max-height: 45px;
    max-width: 140px;
    font-size: 1.3rem;
  }

  .donors-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .government-grid {
    grid-template-columns: 1fr;
  }

  .local-grid {
    grid-template-columns: 1fr;
  }

  .why-grid {
    grid-template-columns: 1fr;
  }

  .cta-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 300px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.85rem;
  }

  .logo-carousel-track {
    gap: 0.75rem;
  }

  .partner-logo-card {
    width: 160px;
    height: 80px;
    padding: 12px;
  }

  .logo-placeholder {
    max-height: 40px;
    max-width: 120px;
    font-size: 1.1rem;
  }

  .donors-grid {
    grid-template-columns: 1fr 1fr;
  }
}

/* Ensure government cards center properly at 5 items */
@media (min-width: 1025px) {
  .government-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .gov-card:nth-child(4) {
    grid-column: 1;
    justify-self: end;
    max-width: calc(100% - 0.75rem);
  }

  .gov-card:nth-child(5) {
    grid-column: 3;
    justify-self: start;
    max-width: calc(100% - 0.75rem);
  }
}
</style>