<script setup lang="ts">
import { RouterLink } from 'vue-router'

const stats = [
  { value: '293', label: 'Villages Reached' },
  { value: '43', label: 'Communes Served' },
  { value: '30+', label: 'Years of Service' },
  { value: '10+', label: 'International Partners' },
]
</script>

<template>
  <div class="home-view">
    <section class="hero">
      <div class="hero-inner">
        <p class="eyebrow eyebrow--light">Buddhist NGO · Cambodia · Since 1994</p>
        <h1 class="hero-title">
          Walking with villages toward peace, sustainability and dignity.
        </h1>
        <p class="hero-subtitle">
          Santi Sena, the Peace Army, works alongside rural Cambodian communities in Svay
          Rieng, Prey Veng and Kratie — protecting forests, teaching children, growing
          livelihoods and safeguarding families.
        </p>
        <div class="hero-actions">
          <RouterLink to="/contact" class="btn btn--primary">Support Us</RouterLink>
          <RouterLink to="/about" class="btn btn--outline">Stand with us</RouterLink>
        </div>
      </div>
    </section>

    <section class="stats">
      <div class="stats-inner">
        <div v-for="stat in stats" :key="stat.label" class="stat">
          <div class="stat-number">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </section>

    <section class="mission">
      <div class="eyebrow-rule">
        <span class="rule" />
        <span class="eyebrow">Our Mission</span>
        <span class="rule" />
      </div>
      <h2 class="mission-title">Peace is planted, not declared.</h2>
      <p class="mission-text">
        Santi Sena — the <em>Peace Army</em> — was founded by Cambodian Buddhist monks in
        1994 to alleviate poverty and rebuild moral, environmental and economic life after
        decades of conflict. Today our 30+ staff serve 293 villages with programs that
        combine the wisdom of the Dharma with rigorous community-led development.
      </p>
    </section>

    <section class="pillars">
      <div class="pillars-header">
        <div>
          <p class="eyebrow">Four Pillars</p>
          <h2 class="pillars-title">Strategic goals</h2>
        </div>
        <RouterLink to="/services" class="pillars-link">Explore all programs →</RouterLink>
      </div>

      <div class="pillars-grid">
        <article class="pillar-card">
          <div class="pillar-image pillar-image--forest">
            <svg viewBox="0 0 24 24" class="pillar-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M12 22V13M12 13C12 13 5 12 5 6C5 6 12 4 12 10C12 4 19 6 19 6C19 12 12 13 12 13Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 01</p>
            <h3 class="pillar-title">Natural Resource &amp; Environment</h3>
            <p class="pillar-desc">
              Community forestry, tree nurseries, WASH and sanitation, climate adaptation
              and biogas — protecting the land that sustains every village.
            </p>
          </div>
        </article>

        <article class="pillar-card">
          <div class="pillar-image pillar-image--education">
            <svg viewBox="0 0 24 24" class="pillar-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M4 6.5C4 5.67157 4.67157 5 5.5 5H10C11.1046 5 12 5.89543 12 7V19C12 18.1716 11.3284 17.5 10.5 17.5H4V6.5Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M20 6.5C20 5.67157 19.3284 5 18.5 5H14C12.8954 5 12 5.89543 12 7V19C12 18.1716 12.6716 17.5 13.5 17.5H20V6.5Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 02</p>
            <h3 class="pillar-title">Access to Education</h3>
            <p class="pillar-desc">
              Community pre-schools, mobile libraries, scholarships for poor children and
              the preservation of Buddhist education.
            </p>
          </div>
        </article>

        <article class="pillar-card">
          <div class="pillar-image pillar-image--livelihood">
            <svg viewBox="0 0 24 24" class="pillar-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M3 12L7 8M7 8L11 12M7 8V19M21 12L17 16M17 16L13 12M17 16V5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 03</p>
            <h3 class="pillar-title">Livelihood &amp; Economic Improvement</h3>
            <p class="pillar-desc">
              Integrated farming, Saving-for-Change groups, agricultural cooperatives and
              rural enterprises such as melaleuca oil.
            </p>
          </div>
        </article>

        <article class="pillar-card">
          <div class="pillar-image pillar-image--protection">
            <svg viewBox="0 0 24 24" class="pillar-icon" fill="none" stroke="currentColor" stroke-width="1.5">
              <path
                d="M12 3L19 6V11C19 15.4183 16.0523 19.4183 12 21C7.94772 19.4183 5 15.4183 5 11V6L12 3Z"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          <div class="pillar-body">
            <p class="pillar-goal">Goal 04</p>
            <h3 class="pillar-title">Child Protection</h3>
            <p class="pillar-desc">
              Anti-trafficking campaigns, Child Protection Networks, peer educator groups
              and child rights advocacy.
            </p>
          </div>
        </article>
      </div>
    </section>

    <section class="quote">
      <p class="quote-text">
        &ldquo;When we plant a tree, we plant peace. When we teach a child, we end a war that has
        not yet begun.&rdquo;
      </p>
      <p class="quote-attrib">— Founding Spirit of Santi Sena</p>
    </section>

    <section class="cta">
      <div class="cta-card">
        <div class="cta-text">
          <h2 class="cta-title">Join the Peace Army.</h2>
          <p class="cta-desc">Donate, partner, volunteer — every act seeds another village with hope.</p>
        </div>
        <div class="cta-actions">
          <RouterLink to="/contact" class="btn btn--primary">Support Us</RouterLink>
          <RouterLink to="/about" class="btn btn--outline">Partner with us</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-view {
  --cream: #faf3e6;
  --cream-soft: #fdf8ef;
  --green: #16302a;
  --green-muted: #3f5f52;
  --orange: #dd7a2b;
  --ink: #2b2b28;
  --ink-soft: #5b564c;
  --font-serif: 'Playfair Display', Georgia, 'Times New Roman', serif;

  font-family: inherit;
  color: var(--ink);
  background: var(--cream);
}

.eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--orange);
}

.eyebrow--light {
  color: #f0a95f;
}

.eyebrow-rule {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

.eyebrow-rule .rule {
  width: 2.5rem;
  height: 1px;
  background: var(--orange);
}

/* Hero */
.hero {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-height: 640px;
  padding: 4rem 1.5rem;
  background:
    linear-gradient(115deg, rgba(8, 22, 16, 0.93) 0%, rgba(8, 22, 16, 0.6) 45%, rgba(8, 22, 16, 0.2) 78%),
    radial-gradient(circle at 82% 25%, #4d6f56 0%, transparent 55%),
    linear-gradient(180deg, #3a5847 0%, #1e3327 60%, #12201a 100%);
}

.hero-inner {
  max-width: 760px;
  margin: 0 auto 2rem 0;
  width: 100%;
}

.hero-title {
  margin: 0.75rem 0 1.25rem;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 1.15;
  color: #fdf8ef;
}

.hero-subtitle {
  max-width: 620px;
  margin: 0 0 2rem;
  color: rgba(253, 248, 239, 0.85);
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition: background 0.2s ease, border-color 0.2s ease, opacity 0.2s ease;
}

.btn--primary {
  background: var(--orange);
  color: #211a12;
}

.btn--primary:hover {
  opacity: 0.9;
}

.btn--outline {
  border-color: rgba(253, 248, 239, 0.6);
  color: #fdf8ef;
}

.btn--outline:hover {
  background: rgba(253, 248, 239, 0.1);
}

/* Stats */
.stats {
  background: var(--cream);
  border-bottom: 1px solid rgba(22, 48, 42, 0.1);
}

.stats-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  text-align: center;
}

.stat-number {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  color: #b0522c;
}

.stat-label {
  margin-top: 0.35rem;
  font-size: 0.8rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

@media (min-width: 720px) {
  .stats-inner {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Mission */
.mission {
  max-width: 780px;
  margin: 0 auto;
  padding: 5rem 1.5rem;
  text-align: center;
}

.mission-title {
  margin: 0 0 1.5rem;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(2rem, 4vw, 2.75rem);
  color: var(--green);
}

.mission-text {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--ink-soft);
}

.mission-text em {
  font-style: italic;
  color: var(--green);
}

/* Pillars */
.pillars {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 5rem;
}

.pillars-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.pillars-title {
  margin: 0.5rem 0 0;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  color: var(--green);
}

.pillars-link {
  color: var(--green);
  font-weight: 600;
  text-decoration: none;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s ease;
}

.pillars-link:hover {
  border-color: currentColor;
}

.pillars-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 820px) {
  .pillars-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pillar-card {
  background: var(--cream-soft);
  border-radius: 1rem;
  overflow: hidden;
  border: 1px solid rgba(22, 48, 42, 0.08);
  transition:
    transform 0.35s ease,
    box-shadow 0.35s ease,
    border-color 0.35s ease;
}

.pillar-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(22, 48, 42, 0.14);
  border-color: rgba(221, 122, 43, 0.35);
}

.pillar-image {
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pillar-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(255, 255, 255, 0.92);
  transition: transform 0.35s ease;
}

.pillar-card:hover .pillar-icon {
  transform: scale(1.12);
}

.pillar-image--forest {
  background: linear-gradient(135deg, #4a7a5c, #1e3d2c);
}

.pillar-image--education {
  background: linear-gradient(135deg, #c98a4a, #7a4a22);
}

.pillar-image--livelihood {
  background: linear-gradient(135deg, #b0522c, #6b2f18);
}

.pillar-image--protection {
  background: linear-gradient(135deg, #3a6b7a, #1c3540);
}

.pillar-body {
  padding: 1.5rem;
}

.pillar-goal {
  margin: 0 0 0.4rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--orange);
}

.pillar-title {
  margin: 0 0 0.6rem;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--green);
  transition: color 0.25s ease;
}

.pillar-card:hover .pillar-title {
  color: var(--orange);
}

.pillar-desc {
  margin: 0;
  color: var(--ink-soft);
  line-height: 1.6;
  font-size: 0.95rem;
}

/* Quote */
.quote {
  max-width: 780px;
  margin: 0 auto;
  padding: 1rem 1.5rem 3rem;
  text-align: center;
}

.quote-text {
  margin: 0 0 1rem;
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 500;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  line-height: 1.4;
  color: var(--green);
}

.quote-attrib {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ink-soft);
}

/* CTA */
.cta {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem 5rem;
}

.cta-card {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: clamp(2rem, 4vw, 3rem);
  border-radius: 1.5rem;
  background: linear-gradient(135deg, #1e3d2c 0%, var(--green) 60%, #0f231a 100%);
  box-shadow: 0 24px 48px rgba(15, 35, 26, 0.28);
}

.cta-title {
  margin: 0 0 0.75rem;
  font-family: var(--font-serif);
  font-weight: 600;
  font-size: clamp(1.9rem, 4vw, 2.5rem);
  color: #fdf8ef;
}

.cta-desc {
  margin: 0;
  color: rgba(253, 248, 239, 0.8);
  font-size: 1rem;
  line-height: 1.6;
}

.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (min-width: 820px) {
  .cta-card {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  .cta-text {
    max-width: 560px;
  }
}
</style>
