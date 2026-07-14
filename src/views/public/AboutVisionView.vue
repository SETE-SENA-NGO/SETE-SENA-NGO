<script setup lang="ts">
import Slideshow from '@/components/shared/Slideshow.vue'
import heroImpactForest from '@/assets/hero-impact-forest.jpg'

const slideItems = [
  { image: heroImpactForest, caption: '' },
  { image: '/images/programs/hero-3.jpg', caption: '' },
  { image: '/images/programs/hero-4.jpg', caption: '' },
]
</script>

<template>
  <div class="vision-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="badge">Our Vision</span>
        <h1>Peace, justice and harmony across every village.</h1>
        <p class="hero-subtitle">
          Santi Sena works so vulnerable rural families can live with dignity, stronger livelihoods
          and a safer environment for the next generation.
        </p>
      </div>
    </Slideshow>

    <!-- Vision Section -->
    <section class="section vision-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Vision</span>
          <h2>What Santi Sena Strives For</h2>
        </div>
        <div class="vision-grid">
          <div class="vision-card">
            <div class="icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3>Peace With Justice</h3>
            <p>
              A Cambodia where peace, justice and harmony are lived in daily village life, not only
              written in plans.
            </p>
          </div>
          <div class="vision-card">
            <div class="icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Community Ownership</h3>
            <p>
              Villagers, monks, local authorities, schools and community organizations lead the work
              together.
            </p>
          </div>
          <div class="vision-card">
            <div class="icon-wrapper">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Sustainable Livelihoods</h3>
            <p>
              Families build better lives through education, child protection, rural income and care
              for natural resources.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Mission Section -->
    <section class="section mission-section alt-bg">
      <div class="container">
        <div class="mission-layout">
          <div class="mission-content">
            <span class="section-label">Mission</span>
            <h2>How The Mission Becomes Practical</h2>
            <p class="mission-text">
              Santi Sena alleviates poverty through community-led development rooted in Buddhist
              ethics. Its work connects moral leadership with practical programs in education,
              livelihoods, environment and child protection.
            </p>
            <ul class="mission-list">
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14813E"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Work with monks, villagers, local government and schools
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14813E"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Strengthen education, savings groups and rural livelihoods
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14813E"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Protect children from trafficking, unsafe migration and exploitation
              </li>
              <li>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#14813E"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Preserve community forests, water resources and local resilience
              </li>
            </ul>
          </div>
          <div class="mission-visual">
            <div class="stats-grid">
              <div class="stat-card">
                <span class="stat-number">1994</span>
                <span class="stat-label">Founded</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">293</span>
                <span class="stat-label">Villages</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">43</span>
                <span class="stat-label">Communes</span>
              </div>
              <div class="stat-card">
                <span class="stat-number">30+</span>
                <span class="stat-label">Staff</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values Section -->
    <section class="section values-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Core Values</span>
          <h2>Values That Guide The Work</h2>
          <p class="section-desc">
            These values shape how Santi Sena works with communities, donors and partners.
          </p>
        </div>
        <div class="values-grid">
          <div class="value-item">
            <div class="value-number">01</div>
            <h3>Honesty</h3>
            <p>
              Clear communication and transparent relationships with donors, communities, partners
              and staff.
            </p>
          </div>
          <div class="value-item">
            <div class="value-number">02</div>
            <h3>Non-discrimination</h3>
            <p>
              Respect for people across disability, religion, background, race, community status and
              political belief.
            </p>
          </div>
          <div class="value-item">
            <div class="value-number">03</div>
            <h3>Collective Benefit</h3>
            <p>
              Organizational resources and knowledge are used for shared benefit, not private
              advantage.
            </p>
          </div>
          <div class="value-item">
            <div class="value-number">04</div>
            <h3>Flexibility</h3>
            <p>
              Plans adapt to community feedback, partner advice, available resources and real field
              needs.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container">
        <blockquote>
          <svg
            class="quote-icon"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"
            />
            <path
              d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"
            />
          </svg>
          <p class="quote-text">
            "Santi Sena means a group of persons working together for peace, livelihood
            improvement, social justice and environmental preservation."
          </p>
          <cite class="quote-source">Santi Sena profile</cite>
          <p v-if="false" class="quote-text">
            "The future belongs to those who believe in the beauty of their dreams. Our vision is
            not just a destination — it is a promise to every community we serve that we will walk
            alongside them until that future becomes reality."
          </p>
          <cite>— SETE SENA Leadership</cite>
        </blockquote>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Carry This Vision Into Practical Work</h2>
          <p>
            Partnership, volunteering and support all matter when they strengthen local systems that
            communities can carry forward.
          </p>
          <div class="cta-actions">
            <router-link to="/get-involved" class="btn btn-primary">Get Involved</router-link>
            <router-link to="/about" class="btn btn-outline">Learn About Us</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.vision-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
  font-family: var(--font-family-base);
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

.section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.vision-section,
.values-section {
  background: var(--color-cream-soft);
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-dark);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  border: 1px solid color-mix(in srgb, var(--primary-dark) 25%, transparent);
  border-radius: 9999px;
  background: color-mix(in srgb, var(--primary-dark) 8%, transparent);
}

.section-header h2 {
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
}

.section-desc {
  color: var(--color-ink-soft);
  font-size: 1rem;
  max-width: 540px;
  margin: 0 auto;
  line-height: 1.7;
}

.alt-bg {
  background: var(--color-cream-soft);
}

/* =====================
   Hero
   ===================== */
/* Hero (overlaid on the slideshow via its default slot) */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.82) 0%,
    rgba(6, 18, 13, 0.5) 42%,
    rgba(6, 18, 13, 0.18) 72%,
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
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
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
  backdrop-filter: none;
}

.hero-content h1 {
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.7;
  max-width: 600px;
  margin: 0;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}

/* =====================
   Vision Grid
   ===================== */
.vision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.vision-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem;
  transition:
    border-color 0.3s,
    box-shadow 0.3s,
    transform 0.2s;
}

.vision-card:hover {
  border-color: color-mix(in srgb, var(--primary-dark) 30%, transparent);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: var(--primary-light);
  color: var(--primary-dark);
  margin-bottom: 1.25rem;
}

.vision-card h3 {
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--color-ink);
}

.vision-card p {
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  line-height: 1.65;
}

/* =====================
   Mission
   ===================== */
.mission-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: center;
}

.mission-content h2 {
  font-weight: 700;
  line-height: 1.25;
  color: var(--color-ink);
  margin-bottom: 1rem;
}

.mission-text {
  color: var(--color-ink-soft);
  line-height: 1.7;
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.mission-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.mission-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  font-size: 0.95rem;
  color: var(--color-ink);
}

.mission-list li svg {
  flex-shrink: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.stat-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 1.75rem 1.5rem;
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

/* =====================
   Values
   ===================== */
.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
}

.value-item {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 2rem 1.5rem;
  transition: border-color 0.3s;
}

.value-item:hover {
  border-color: color-mix(in srgb, var(--primary-dark) 25%, transparent);
}

.value-number {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.value-item h3 {
  font-weight: 600;
  margin-bottom: 0.6rem;
  color: var(--color-ink);
}

.value-item p {
  font-size: 0.88rem;
  color: var(--color-ink-soft);
  line-height: 1.6;
}

/* =====================
   Quote
   ===================== */
.quote-section {
  padding: 5rem 0;
  background: var(--color-cream-soft);
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.quote-section blockquote {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.quote-icon {
  color: var(--primary-dark);
  opacity: 0.2;
  margin-bottom: 1rem;
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--color-ink);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.quote-section cite {
  font-style: normal;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.quote-section cite:not(.quote-source) {
  display: none;
}

/* =====================
   CTA
   ===================== */
.cta-section {
  padding: 5rem 0;
  background: var(--color-cream-soft);
}

.cta-content {
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cta-content h2 {
  font-weight: 700;
  color: var(--color-ink);
  margin-bottom: 0.75rem;
}

.cta-content p {
  color: var(--color-ink);
  line-height: 1.7;
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: #ffffff;
  color: #000000;
  border: 1px solid #c7c7c8;
}

.btn-primary:hover {
  background: #dedede;
  border-color: #b2b2b2;
}

.btn-outline {
  background: var(--primary-color);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  border-color: #ffffff;
  background: var(--primary-dark);
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .vision-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-subtitle {
    font-size: 1.05rem;
  }
  .mission-layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  .section {
    padding: 3rem 0;
  }
  .vision-grid {
    grid-template-columns: 1fr;
  }
  .values-grid {
    grid-template-columns: 1fr;
  }
  .btn-outline {
    color: #334155;
    border: 1px solid #cbd5e1;
  }
  .btn-outline:hover {
    border-color: #94a3b8;
    background: rgba(0, 0, 0, 0.02);
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 55vh;
    padding: 3rem 1.25rem;
  }
  .stats-grid {
    gap: 0.75rem;
  }
  .stat-card {
    padding: 1.25rem 1rem;
  }
  .stat-number {
    font-size: 1.5rem;
  }
}
</style>
