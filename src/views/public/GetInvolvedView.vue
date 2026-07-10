<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/hero-1.jpg', caption: 'Community work with rural families' },
  { image: '/images/programs/environment-hero.jpg', caption: 'Local action for forests and climate resilience' },
  { image: '/images/programs/education-hero.jpg', caption: 'Learning support for children and families' },
]

const involvementPaths = [
  {
    label: 'Give',
    title: 'Fund practical village work',
    body: 'Support locally managed activities in forests, education, WASH, livelihoods, Buddhist learning and child protection.',
    to: '/get-involved/donate',
    cta: 'Support us',
  },
  {
    label: 'Partner',
    title: 'Build a program together',
    body: 'Coordinate with a Cambodian NGO rooted in local authorities, schools, commune committees and technical departments.',
    to: '/get-involved/partner',
    cta: 'Explore partnership',
  },
  {
    label: 'Volunteer',
    title: 'Contribute useful skills',
    body: 'Share skills in learning, agriculture, communications, safeguarding, data, training or community facilitation.',
    to: '/get-involved/volunteer',
    cta: 'Volunteer with us',
  },
]

const fieldCards = [
  {
    theme: 'Natural resources',
    title: 'Protect community forests',
    image: '/images/programs/environment-hero1.jpg',
    summary: 'Help communities conserve forests, plant trees and respond to climate pressure.',
    detail:
      'The report names community forestry, tree nurseries and ecological child-right campaigns as core environmental work.',
  },
  {
    theme: 'Livelihoods',
    title: 'Strengthen family income',
    image: '/images/programs/livelihood-hero2.jpg',
    summary: 'Back savings groups, agriculture cooperatives, home gardens and small rural enterprise.',
    detail:
      'Santi Sena supports self-help groups, integrated farming and cooperative learning so families can plan with more security.',
  },
  {
    theme: 'Children',
    title: 'Keep learning close to home',
    image: '/images/programs/education-hero.jpg',
    summary: 'Support community pre-schools, scholarships, mobile libraries and child-friendly learning spaces.',
    detail:
      'Education work is organized with parents, teachers, school leaders and education departments.',
  },
  {
    theme: 'Protection',
    title: 'Make villages safer for children',
    image: '/images/programs/child-protection2.jpg',
    summary: 'Help commune and district networks prevent trafficking, exploitation, migration risk and abuse.',
    detail:
      'Child protection networks and peer educators help children understand rights and know where to seek help.',
  },
]

const workflow = [
  {
    number: '01',
    title: 'Start with local priorities',
    body: 'Field staff listen with vulnerable families, monks, teachers, commune leaders and community groups before shaping activities.',
  },
  {
    number: '02',
    title: 'Connect the right partners',
    body: 'Projects are coordinated with provincial departments, local authorities, school committees and community networks.',
  },
  {
    number: '03',
    title: 'Build capacity in the field',
    body: 'Support becomes training, materials, facilitation, monitoring and practical follow-up close to the people involved.',
  },
  {
    number: '04',
    title: 'Reflect and improve',
    body: 'Staff reflection, reporting and community feedback help the next cycle of work become more useful and accountable.',
  },
]

const values = [
  'Honesty with donors, target groups, operational partners and working groups',
  'Non-discrimination across disability, religion, color, race and political affiliation',
  'Collective benefit instead of private use of organizational property',
  'Flexibility when communities and development partners give useful feedback',
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
      <div class="hero-shade"></div>
      <div class="hero-content">
        <p class="eyebrow">Get involved</p>
        <h1>Choose a practical way to stand with rural communities.</h1>
        <p>
          Santi Sena began at Prey Chhlak monastery in 1994. Today, involvement means helping
          village systems grow stronger through peace, livelihood improvement, social justice and
          environmental protection.
        </p>
        <div class="hero-actions" aria-label="Get involved actions">
          <RouterLink to="/get-involved/donate" class="button button-primary">Support the work</RouterLink>
          <a href="#choose-path" class="button button-secondary">Compare options</a>
        </div>
      </div>
    </Slideshow>

    <section id="choose-path" class="path-section" aria-labelledby="path-heading">
      <div class="section-heading">
        <p class="eyebrow">Choose your role</p>
        <h2 id="path-heading">One mission, three useful ways to take part.</h2>
        <p>
          This overview helps visitors choose the right doorway. The deeper donation, partnership
          and volunteer pages hold the detailed next steps.
        </p>
      </div>

      <div class="path-grid">
        <article v-for="path in involvementPaths" :key="path.title" class="path-card">
          <span class="path-label">{{ path.label }}</span>
          <h3>{{ path.title }}</h3>
          <p>{{ path.body }}</p>
          <RouterLink :to="path.to" class="text-link">{{ path.cta }} -></RouterLink>
        </article>
      </div>
    </section>

    <section class="field-section" aria-labelledby="field-heading">
      <div class="field-intro">
        <p class="eyebrow">What involvement strengthens</p>
        <h2 id="field-heading">Support that reaches real community systems.</h2>
        <p>
          The report describes Santi Sena as a Buddhist NGO working with vulnerable and marginalized
          people through local initiatives. These are the kinds of systems your involvement can help
          keep moving.
        </p>
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

    <section class="workflow-section" aria-labelledby="workflow-heading">
      <div class="workflow-heading">
        <p class="eyebrow">How help moves</p>
        <h2 id="workflow-heading">From interest to accountable field action.</h2>
      </div>

      <ol class="workflow-list">
        <li v-for="item in workflow" :key="item.number">
          <span class="workflow-number">{{ item.number }}</span>
          <div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.body }}</p>
          </div>
        </li>
      </ol>
    </section>

    <section class="values-section" aria-labelledby="values-heading">
      <div class="values-copy">
        <p class="eyebrow">Before you join</p>
        <h2 id="values-heading">The partnership promise is grounded in values.</h2>
        <p>
          Santi Sena's report names honesty, non-discrimination, collective benefit and flexibility
          as working values. Those values shape how the team receives support and works with people.
        </p>
      </div>
      <ul class="values-list">
        <li v-for="value in values" :key="value">{{ value }}</li>
      </ul>
    </section>

    <section class="cta-section" aria-label="Get involved next step">
      <div class="cta-media" aria-hidden="true"></div>
      <div class="cta-content">
        <p class="eyebrow">Ready when you are</p>
        <h2>Start with the path that matches your role.</h2>
        <div class="cta-actions">
          <RouterLink to="/get-involved/donate" class="button button-primary">Donate</RouterLink>
          <RouterLink to="/get-involved/partner" class="button button-secondary">Partner</RouterLink>
          <RouterLink to="/get-involved/volunteer" class="button button-secondary">Volunteer</RouterLink>
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

.hero-shade {
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
  max-width: 720px;
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
  margin: 0;
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
.workflow-heading h2,
.values-copy h2,
.cta-content h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

.hero-content h1 {
  max-width: 48rem;
  margin-top: 1rem;
  color: var(--color-white);
}

.hero-content p:not(.eyebrow) {
  max-width: 42rem;
  margin: 1.5rem 0 0;
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.05rem;
  line-height: 1.75;
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
.field-section,
.workflow-section,
.values-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--container-padding);
}

.path-section {
  padding-block: 6rem 5rem;
}

.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(300px, 0.7fr);
  gap: 2rem;
  align-items: end;
}

.section-heading h2,
.field-intro h2,
.workflow-heading h2,
.values-copy h2,
.cta-content h2 {
  margin-top: 0.75rem;
  color: var(--ink);
}

.section-heading > p:last-child,
.field-intro p:last-child,
.values-copy p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

.path-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.2rem;
  margin-top: 2.5rem;
}

.path-card {
  display: flex;
  min-height: 280px;
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

.field-intro {
  max-width: 820px;
}

.field-intro p:last-child {
  margin-top: 1rem;
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
  transition: transform 0.35s ease;
}

.field-card::after {
  position: absolute;
  inset: 0;
  content: '';
  background: linear-gradient(180deg, rgba(6, 18, 13, 0.05) 0%, rgba(6, 18, 13, 0.88) 100%);
  z-index: 1;
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
  transition: transform 0.24s ease;
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
  bottom: 0;
  display: grid;
  align-content: start;
  gap: 0.65rem;
  background: color-mix(in srgb, var(--primary-dark) 92%, black);
  color: var(--color-white);
  transform: translateY(102%);
  transition: transform 0.24s ease;
}

.field-card-hover strong {
  color: var(--primary-light);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.field-card-hover p {
  margin: 0;
  line-height: 1.5;
}

.field-card:hover img,
.field-card:focus-within img,
.field-card:focus img {
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
  transform: translateY(-5.8rem);
}

.workflow-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.65fr) minmax(0, 1fr);
  gap: 3rem;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  padding-block: 5rem;
}

.workflow-list {
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
  list-style: none;
}

.workflow-list li {
  display: grid;
  grid-template-columns: 4.6rem minmax(0, 1fr);
  gap: 1.3rem;
  padding: 1.35rem 0;
  border-top: 1px solid var(--line);
}

.workflow-list li:first-child {
  padding-top: 0;
  border-top: 0;
}

.workflow-number {
  color: var(--primary-color);
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.workflow-list h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.18rem;
  line-height: 1.22;
}

.workflow-list p {
  margin: 0.55rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.values-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.75fr) minmax(0, 1fr);
  gap: 3rem;
  padding-block: 6rem;
}

.values-copy p {
  margin-top: 1rem;
}

.values-list {
  display: grid;
  gap: 0.8rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.values-list li {
  border-left: 4px solid var(--green);
  border-radius: 8px;
  background: var(--panel);
  color: var(--muted);
  padding: 1.1rem 1.25rem;
  line-height: 1.5;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
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
  content: '';
  background: linear-gradient(90deg, rgba(6, 18, 13, 0.9), rgba(6, 18, 13, 0.6));
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
  .section-heading,
  .workflow-section,
  .values-section {
    grid-template-columns: 1fr;
  }

  .section-heading > p:last-child {
    margin-top: 0;
  }

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

  .hero-content p:not(.eyebrow) {
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
  .field-section,
  .workflow-section,
  .values-section {
    padding-inline: var(--container-padding);
  }

  .field-grid {
    grid-template-columns: 1fr;
  }

  .field-card {
    min-height: 380px;
  }

  .workflow-list li {
    grid-template-columns: 3.4rem minmax(0, 1fr);
    gap: 1rem;
  }

  .workflow-number {
    font-size: 1.55rem;
  }
}
</style>
