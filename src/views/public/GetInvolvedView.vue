<script setup lang="ts">
import { RouterLink } from 'vue-router'

const ways = [
  {
    title: 'Donate',
    body: 'Support community forests, livelihoods, education, WASH, Buddhist preservation and child protection work in rural Cambodia.',
    cta: 'Support Santi Sena',
    to: '/get-involved/donate',
  },
  {
    title: 'Partner',
    body: 'Cooperate with Santi Sena through community-rooted programs, local authorities, provincial departments and field teams.',
    cta: 'Explore partnership',
    to: '/get-involved/partner',
  },
  {
    title: 'Volunteer',
    body: 'Bring your skills - agronomy, education, communications, evaluation - to a community-led project in the field.',
    cta: 'Apply to volunteer',
    to: '/get-involved/volunteer',
  },
]

const tiers = [
  { amount: '$25', impact: 'One month of pre-school for a rural child.' },
  { amount: '$80', impact: 'Twenty tree saplings planted in a community forest.' },
  { amount: '$250', impact: 'A household biogas unit replacing firewood.' },
  { amount: '$1,000', impact: 'A Saving-for-Change group seeded for one year.' },
]
</script>

<template>
  <main class="get-involved-page">
    <section class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-inner">
        <span class="eyebrow">Get involved</span>
        <h1>Stand beside a village. Plant a generation.</h1>
        <p>
          Every gift, partnership and pair of hands becomes another root in the tree we have been
          tending for thirty years.
        </p>
      </div>
    </section>

    <section class="ways-section" aria-label="Ways to get involved">
      <div class="ways-grid">
        <article v-for="way in ways" :key="way.title" class="way-card">
          <h2>{{ way.title }}</h2>
          <p>{{ way.body }}</p>
          <RouterLink :to="way.to" class="action-link">{{ way.cta }} -&gt;</RouterLink>
        </article>
      </div>
    </section>

    <section class="donation-section">
      <div class="donation-inner">
        <span class="eyebrow">Your gift, in villages</span>
        <h2>What a donation actually does.</h2>
        <div class="tier-grid">
          <article v-for="tier in tiers" :key="tier.amount" class="tier-card">
            <strong>{{ tier.amount }}</strong>
            <p>{{ tier.impact }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="monthly-section">
      <h2>Become a monthly companion.</h2>
      <p>
        Recurring donors give Santi Sena the steady ground we need to plan multi-year programs with
        communities. Even a small monthly gift sustains the slow, patient work of development.
      </p>
      <RouterLink to="/contact" class="primary-link">Start monthly giving</RouterLink>
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
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 8rem 1.5rem;
  text-align: left;
}

.eyebrow {
  color: #ff7a1a;
  font-family: var(--font-body);
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
}

.hero h1 {
  max-width: 896px;
  margin: 1rem 0 0;
  color: #fff7e9;
  font-family: var(--font-display);
  font-size: 3rem;
  line-height: 1;
  font-weight: 600;
  text-wrap: balance;
}

.hero p {
  max-width: 672px;
  margin: 1.5rem 0 0;
  color: rgba(255, 247, 233, 0.85);
  font-size: 1.125rem;
  line-height: 1.55;
}

.ways-section {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
  background: #fbf4e6;
}

.monthly-section {
  width: 100%;
  max-width: 896px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.ways-grid {
  display: grid;
  gap: 2rem;
}

.way-card {
  display: flex;
  flex-direction: column;
  border: 1px solid #e2d4bd;
  border-radius: 1.5rem;
  background: rgba(255, 251, 243, 0.78);
  padding: 2.5rem;
  box-shadow: 0 1px 2px rgba(54, 38, 17, 0.08);
}

.way-card h2 {
  margin: 0;
  color: #073f3a;
  font-family: var(--font-display);
  font-size: 1.875rem;
  font-weight: 600;
  line-height: 2.25rem;
}

.way-card p {
  flex: 1;
  margin: 1rem 0 0;
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
  margin-top: 2rem;
  border: 0;
  border-radius: 999px;
  background: #ff7a1a;
  color: #fffaf0;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.625rem 1.25rem;
  box-shadow: 0 18px 34px rgba(255, 122, 26, 0.2);
}

.donation-section {
  background: #094239;
  color: #fff7e9;
  padding: 6rem 0;
}

.donation-inner {
  width: 100%;
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.donation-inner h2 {
  margin: 1rem 0 0;
  font-family: var(--font-display);
  font-size: 2.25rem;
  line-height: 2.5rem;
  font-weight: 600;
}

.monthly-section h2 {
  margin: 0;
  color: #073f3a;
  font-family: var(--font-display);
  font-size: 2.25rem;
  line-height: 1.1;
  font-weight: 600;
}

.tier-grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 3rem;
}

.tier-card {
  border: 1px solid rgba(255, 247, 233, 0.16);
  border-radius: 1rem;
  padding: 2rem;
}

.tier-card strong {
  display: block;
  color: #ff7a1a;
  font-family: var(--font-display);
  font-size: 2.25rem;
  font-weight: 500;
  line-height: 2.5rem;
}

.tier-card p {
  margin: 0.75rem 0 0;
  color: rgba(255, 247, 233, 0.8);
  font-size: 0.875rem;
  line-height: 1.25rem;
}

.monthly-section {
  text-align: center;
}

.monthly-section p {
  margin: 1rem auto 0;
  color: #234b45;
  font-size: 1rem;
  line-height: 1.5;
}

.monthly-section .primary-link {
  align-self: center;
  margin-top: 2rem;
  padding: 0.875rem 1.75rem;
}

@media (min-width: 768px) {
  .ways-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 3.75rem;
  }

  .donation-inner h2 {
    font-size: 3rem;
    line-height: 1;
  }

  .tier-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 699px) {
  .hero-inner {
    padding: 8rem 1.5rem;
  }

  .ways-section {
    padding: 4rem 1rem;
  }

  .way-card {
    padding: 2rem;
  }

  .get-involved-page {
    font-size: 16px;
  }
}

@media (min-width: 1024px) {
  .tier-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
