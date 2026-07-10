<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/hero-1.jpg', caption: '' },
  { image: '/images/programs/environment-hero.jpg', caption: '' },
  { image: '/images/programs/education-hero.jpg', caption: '' },
]

const involvementPaths = [
  {
    label: 'Give',
    title: 'Support village work',
    body: 'Fund practical community programs.',
    to: '/get-involved/donate',
    cta: 'Support us',
  },
  {
    label: 'Partner',
    title: 'Build with us',
    body: 'Create programs with local teams.',
    to: '/get-involved/partner',
    cta: 'Explore partnership',
  },
  {
    label: 'Volunteer',
    title: 'Share your skills',
    body: 'Bring useful time and knowledge.',
    to: '/get-involved/volunteer',
    cta: 'Volunteer with us',
  },
]

const fieldCards = [
  {
    theme: 'Natural resources',
    title: 'Protect community forests',
    image: '/images/programs/environment-hero1.jpg',
    summary: 'Forests, seedlings and climate action.',
    detail: 'Community forestry, nurseries and school eco campaigns.',
  },
  {
    theme: 'Livelihoods',
    title: 'Strengthen family income',
    image: '/images/programs/livelihood-hero2.jpg',
    summary: 'Savings groups and home gardens.',
    detail: 'Self-help groups, cooperatives and small rural enterprise.',
  },
  {
    theme: 'Children',
    title: 'Keep learning close to home',
    image: '/images/programs/education-hero.jpg',
    summary: 'Pre-schools, books and scholarships.',
    detail: 'Parent groups, teachers and school leaders work together.',
  },
  {
    theme: 'Protection',
    title: 'Make villages safer for children',
    image: '/images/programs/child-protection2.jpg',
    summary: 'Local networks for child safety.',
    detail: 'Awareness, referral and peer support against abuse and trafficking.',
  },
]

const description =
  'Get involved with Santi Sena through giving, partnership or volunteering in community-led work for peace, livelihoods, education, child protection and environmental preservation.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(() => {
  previousTitle = document.title
  document.title = 'Get Involved with Santi Sena'

  descriptionMeta = document.querySelector('meta[name="description"]')
  previousDescription = descriptionMeta?.getAttribute('content') ?? null

  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    document.head.appendChild(descriptionMeta)
    createdDescriptionMeta = true
  }

  descriptionMeta.setAttribute('content', description)
})

onUnmounted(() => {
  document.title = previousTitle

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }
})
</script>

<template>
  <main class="get-involved-page">
    <Slideshow :slides="slideItems" :interval-ms="5600">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">Get involved</p>
        <h1>Stand with rural communities.</h1>
        <p class="lead">Give, partner or volunteer with Santi Sena's village-led work.</p>
        <div class="hero-actions" aria-label="Get involved actions">
          <RouterLink to="/get-involved/donate" class="button button-primary">
            Support the work
          </RouterLink>
          <a href="#choose-path" class="button button-secondary">Compare options</a>
        </div>
      </div>
    </Slideshow>

    <section id="choose-path" class="path-section" aria-labelledby="path-heading">
      <div class="section-heading">
        <p class="eyebrow">Choose your role</p>
        <h2 id="path-heading">Three simple ways to help.</h2>
      </div>

      <div class="path-grid">
        <article v-for="path in involvementPaths" :key="path.title" class="path-card">
          <span class="path-label">{{ path.label }}</span>
          <h3>{{ path.title }}</h3>
          <p>{{ path.body }}</p>
          <RouterLink :to="path.to" class="text-link">{{ path.cta }} -&gt;</RouterLink>
        </article>
      </div>
    </section>

    <section class="field-section" aria-labelledby="field-heading">
      <div class="field-intro">
        <p class="eyebrow">What support strengthens</p>
        <h2 id="field-heading">Where your action can go.</h2>
      </div>

      <div class="field-grid">
        <article v-for="card in fieldCards" :key="card.title" class="field-card" tabindex="0">
          <img :src="card.image" :alt="card.title" loading="lazy" />
          <div class="field-card-copy">
            <span>{{ card.theme }}</span>
            <h3>{{ card.title }}</h3>
            <p>{{ card.summary }}</p>
          </div>
          <div class="field-card-hover">
            <strong>Field detail</strong>
            <p>{{ card.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="cta-section" aria-label="Get involved next step">
      <div class="cta-media" aria-hidden="true"></div>
      <div class="cta-content">
        <p class="eyebrow">Next step</p>
        <h2>Choose your path.</h2>
        <div class="cta-actions">
          <RouterLink to="/get-involved/donate" class="button button-primary">Donate</RouterLink>
          <RouterLink to="/get-involved/partner" class="button button-secondary">
            Partner
          </RouterLink>
          <RouterLink to="/get-involved/volunteer" class="button button-secondary">
            Volunteer
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.get-involved-page {
  --panel: var(--color-white);
  --ink: var(--color-ink);
  --muted: var(--color-ink-soft);
  --line: var(--color-border);
  --green: var(--primary-color);
  --green-dark: var(--primary-dark);
  --green-light: var(--primary-light);

  min-height: 100vh;
  background: var(--color-cream);
  color: var(--ink);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(6, 18, 13, 0.85) 0%, rgba(6, 18, 13, 0.55) 42%, rgba(6, 18, 13, 0.22) 70%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.34) 0%, transparent 42%);
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 700px;
  margin: 0;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  text-align: left;
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

.eyebrow {
  margin: 0 0 0.75rem;
  color: var(--green);
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.15em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero-content .eyebrow,
.cta-section .eyebrow {
  color: var(--primary-light);
}

.hero-content h1,
.section-heading h2,
.field-intro h2,
.cta-content h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

.hero-content h1 {
  max-width: 48rem;
  margin: 0 0 1rem;
  color: var(--color-white);
}

.hero-content .lead {
  max-width: 42rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions,
.cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 2rem;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.2rem;
  border: 1px solid transparent;
  border-radius: 999px;
  padding: 0.85rem 1.45rem;
  color: inherit;
  font-weight: 850;
  line-height: 1.1;
  text-decoration: none;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease,
    border-color 0.18s ease;
}

.button:hover {
  transform: translateY(-1px);
}

.button-primary {
  background: var(--green);
  color: var(--color-white);
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.2);
}

.button-primary:hover {
  background: var(--green-dark);
  box-shadow: 0 20px 38px rgba(20, 129, 62, 0.28);
}

.button-secondary {
  border-color: rgba(255, 255, 255, 0.58);
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
}

.button-secondary:hover {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.8);
}

.path-section,
.field-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--container-padding);
}

.path-section {
  padding-block: 6rem 5rem;
}

.section-heading,
.field-intro {
  max-width: 760px;
}

.section-heading h2,
.field-intro h2,
.cta-content h2 {
  margin-top: 0.75rem;
  color: var(--ink);
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 2.5rem;
}

.path-card {
  display: flex;
  min-height: 240px;
  flex-direction: column;
  border: 1px solid var(--line);
  border-radius: 8px;
  background: var(--panel);
  padding: 1.7rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.path-label {
  width: fit-content;
  border-radius: 999px;
  background: var(--green-light);
  color: var(--green-dark);
  padding: 0.35rem 0.7rem;
  font-size: 0.78rem;
  font-weight: 700;
}

.path-card h3 {
  margin: 1.2rem 0 0;
  color: var(--ink);
  font-size: 1.45rem;
  line-height: 1.15;
}

.path-card p {
  flex: 1;
  margin: 0.9rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.text-link {
  width: fit-content;
  margin-top: 1.4rem;
  color: var(--green-dark);
  font-weight: 900;
  text-decoration: none;
}

.text-link:hover {
  color: var(--green);
}

.field-section {
  padding-block: 5rem 6rem;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.4rem;
}

.field-card {
  position: relative;
  min-height: 460px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--primary-dark);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  isolation: isolate;
}

.field-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    filter 0.28s ease,
    transform 0.35s ease;
}

.field-card::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(6, 18, 13, 0.05) 0%, rgba(6, 18, 13, 0.88) 100%);
  content: '';
}

.field-card-copy,
.field-card-hover {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 1.35rem;
}

.field-card-copy {
  bottom: 0;
  color: var(--color-white);
  transition:
    opacity 0.18s ease,
    transform 0.24s ease;
}

.field-card-copy span {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.14);
  padding: 0.3rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.field-card h3 {
  margin: 0.9rem 0 0;
  color: var(--color-white);
  font-size: 1.45rem;
  line-height: 1.14;
}

.field-card-copy p {
  margin: 0.75rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.5;
}

.field-card-hover {
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.7rem;
  background: linear-gradient(
    180deg,
    rgba(6, 18, 13, 0.04) 0%,
    rgba(6, 18, 13, 0.26) 48%,
    rgba(6, 18, 13, 0.58) 100%
  );
  color: var(--color-white);
  transform: translateY(100%);
  transition: transform 0.28s ease;
}

.field-card-hover strong {
  color: var(--primary-light);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.field-card-hover p {
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.field-card:hover img,
.field-card:focus-within img,
.field-card:focus img {
  filter: blur(1.6px);
  transform: scale(1.06);
}

.field-card:hover .field-card-hover,
.field-card:focus-within .field-card-hover,
.field-card:focus .field-card-hover {
  transform: translateY(0);
}

.field-card:hover .field-card-copy,
.field-card:focus-within .field-card-copy,
.field-card:focus .field-card-copy {
  opacity: 0;
  transform: translateY(-0.75rem);
}

.cta-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--green-dark);
  padding: 5rem 0;
}

.cta-media {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url('/images/programs/hero-4.jpg') center / cover;
}

.cta-section::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(6, 18, 13, 0.9), rgba(6, 18, 13, 0.6));
  content: '';
}

.cta-content {
  width: min(100% - 3rem, 900px);
  margin: 0 auto;
  padding-inline: var(--container-padding);
  text-align: center;
}

.cta-content h2 {
  margin-right: auto;
  margin-left: auto;
  color: var(--color-white);
}

.cta-actions {
  justify-content: center;
}

.cta-actions .button-secondary {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 1120px) {
  .field-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .field-card {
    min-height: 390px;
  }
}

@media (max-width: 900px) {
  .path-grid {
    grid-template-columns: 1fr;
  }

  .path-card {
    min-height: auto;
  }
}

@media (max-width: 680px) {
  .hero-content {
    padding: 2rem 1.5rem;
  }

  .hero-content .lead {
    font-size: 1rem;
  }

  .hero-actions,
  .cta-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .button {
    width: 100%;
  }

  .path-section,
  .field-section {
    padding-inline: var(--container-padding);
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-card {
    min-height: 380px;
  }
}
</style>
