<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

import planLogo from '@/assets/image.png'
import globalSanitationLogo from '@/assets/image copy.png'
import khyentseLogo from '@/assets/image copy 2.png'
import tdhNetherlandsLogo from '@/assets/image copy 3.png'
import cambodiaActsLogo from '@/assets/image copy 4.png'
import tdhGermanyLogo from '@/assets/image copy 5.png'
import germanCoopLogo from '@/assets/image copy 6.png'
import riversLifeLogo from '@/assets/image copy 7.png'
import educoLogo from '@/assets/image copy 8.png'
import heiferLogo from '@/assets/image copy 9.png'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/hero-4.jpg', caption: '' },
  { image: '/images/programs/hero-1.jpg', caption: '' },
]

const partnershipSteps = [
  {
    step: '01',
    label: 'Listen locally',
    title: 'Start with community needs',
    body: 'Santi Sena works with vulnerable and marginalized people, local authorities and stakeholders to identify practical community priorities.',
  },
  {
    step: '02',
    label: 'Coordinate technically',
    title: 'Bring the right institutions together',
    body: 'The report names cooperation with provincial departments, school leaders, commune committees, forest authorities and child protection bodies.',
  },
  {
    step: '03',
    label: 'Build capacity',
    title: 'Strengthen people, not only projects',
    body: 'Funding partners supported training in monitoring and evaluation, strategic planning, proposal writing and financial management.',
  },
  {
    step: '04',
    label: 'Reflect and improve',
    title: 'Use learning to guide the next cycle',
    body: 'Annual staff reflection gathered achievements, challenges, solutions and action plans for the following year.',
  },
]

const engagementAreas = [
  {
    title: 'Environment and forestry',
    body: 'Community forests, tree nurseries, National Tree Day activities and biodiversity conservation with local stakeholders.',
  },
  {
    title: 'Livelihoods and agriculture',
    body: 'Saving for Change groups, agriculture cooperatives, home gardens and biogas work with technical departments.',
  },
  {
    title: 'WASH',
    body: 'Safe water, school WASH committees, CLTS follow-up and practical hygiene behavior change.',
  },
  {
    title: 'Education',
    body: 'Community pre-schools, parenting groups, scholarships and mobile libraries for rural children.',
  },
  {
    title: 'Buddhist preservation',
    body: 'Dharma conversation, Buddhist primary schools and learning support for young monks.',
  },
  {
    title: 'Child protection',
    body: 'Commune and district networks that protect children from trafficking, exploitation, migration risks and abuse.',
  },
]

const partnerLogos = [
  {
    name: 'terre des hommes',
    tagline: 'Help for Children in Need',
    logo: tdhGermanyLogo,
    variant: 'tdh-germany',
  },
  {
    name: 'german cooperation',
    tagline: 'DEUTSCHE ZUSAMMENARBEIT',
    logo: germanCoopLogo,
    variant: 'german-coop',
  },
  {
    name: 'rivers our life',
    tagline: 'Community partnership',
    logo: riversLifeLogo,
    variant: 'rivers-life',
  },
  {
    name: 'educo',
    tagline: 'Member of ChildFund Alliance',
    logo: educoLogo,
    variant: 'educo',
  },
  {
    name: 'HEIFER',
    tagline: 'INTERNATIONAL CAMBODIA',
    logo: heiferLogo,
    variant: 'heifer',
  },
  {
    name: 'Cambodia ACTs',
    tagline: 'Child protection network',
    logo: cambodiaActsLogo,
    variant: 'cambodia-acts',
  },
  {
    name: 'terre des hommes',
    tagline: 'stops child exploitation',
    logo: tdhNetherlandsLogo,
    variant: 'tdh-netherlands',
  },
  {
    name: 'Plan',
    tagline: 'International Cambodia',
    logo: planLogo,
    variant: 'plan',
  },
  {
    name: 'Global Sanitation Fund',
    tagline: 'Water, sanitation and hygiene',
    logo: globalSanitationLogo,
    variant: 'global-sanitation',
  },
  {
    name: 'Khyentse Foundation',
    tagline: 'Education and Buddhist preservation',
    logo: khyentseLogo,
    variant: 'khyentse',
  },
]

const partnerLogoLoop = [...partnerLogos, ...partnerLogos]

const commitments = [
  'Honesty with donors, target groups, operational partners and working groups',
  'Non-discrimination across disability, religion, color, race and political affiliation',
  'Collective benefit and careful use of organizational property',
  'Flexibility in responding to target groups, development partners and available resources',
  'Transparency, accountability and consistency through finance, child protection, anti-corruption and grievance policies',
]

const description =
  'Partner with Santi Sena through community-rooted programs in natural resources, livelihoods, WASH, education, Buddhist preservation and child protection.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(() => {
  previousTitle = document.title
  document.title = 'Partner with Santi Sena'

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
  <main class="partner-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="partner-hero__content">
        <p class="eyebrow">Get involved - Partner</p>
        <h1>Partner with Santi Sena</h1>
        <p class="lead">
          Build practical village-level programs with a Cambodian organization rooted in local
          authorities, schools, commune committees, technical departments and community groups.
        </p>
        <div class="hero-actions" aria-label="Partnership actions">
          <RouterLink to="/contact" class="primary-button">Start a conversation</RouterLink>
          <a href="#partnership-practice" class="secondary-link">See how partnership works</a>
        </div>
      </div>
    </Slideshow>

    <section class="partner-content" aria-labelledby="intro-heading">
      <div class="intro-section">
        <div class="intro-copy">
          <div class="section-kicker">Partnership in practice</div>
          <h2 id="intro-heading">Long-term cooperation, organized around village priorities.</h2>
          <p>
            The report describes Santi Sena's work as a field system: local leaders identify
            priorities, technical departments strengthen the response, and partners help sustain the
            training, monitoring and resources needed to keep projects moving.
          </p>
        </div>
        <figure class="intro-image">
          <img
            src="https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1200&q=82"
            alt="People placing their hands together in cooperation"
          />
          <figcaption>
            Partnerships connect resources with people already leading change locally.
          </figcaption>
        </figure>
      </div>

      <section
        id="partnership-practice"
        class="practice-section"
        aria-labelledby="practice-heading"
      >
        <div class="section-heading">
          <div>
            <div class="section-kicker">Working rhythm</div>
            <h2 id="practice-heading">How collaboration becomes action</h2>
          </div>
          <p>
            A good partnership with Santi Sena starts close to community reality and stays
            accountable through technical coordination, staff capacity and annual reflection.
          </p>
        </div>

        <div class="practice-layout">
          <ol class="step-list">
            <li v-for="item in partnershipSteps" :key="item.step">
              <span class="step-number">{{ item.step }}</span>
              <div>
                <span class="step-label">{{ item.label }}</span>
                <h3>{{ item.title }}</h3>
                <p>{{ item.body }}</p>
              </div>
            </li>
          </ol>
          <div class="practice-media">
            <img
              src="https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=82"
              alt="Community volunteers organizing supplies together"
            />
            <div class="media-note">
              <strong>Field-led delivery</strong>
              <span>Programs are shaped with local authorities, schools and community groups.</span>
            </div>
          </div>
        </div>
      </section>

      <section class="areas-section" aria-labelledby="areas-heading">
        <div class="areas-media" aria-hidden="true">
          <img
            src="https://images.unsplash.com/photo-1492496913980-501348b61469?auto=format&fit=crop&w=1200&q=82"
            alt=""
          />
        </div>
        <div class="areas-copy">
          <div class="section-kicker">Where partners engage</div>
          <h2 id="areas-heading">Program systems named in the report</h2>
          <ul class="area-list">
            <li v-for="area in engagementAreas" :key="area.title">
              <h3>{{ area.title }}</h3>
              <p>{{ area.body }}</p>
            </li>
          </ul>
        </div>
      </section>

      <section class="logo-section" aria-labelledby="partner-logos-heading">
        <div class="logo-section__header">
          <div>
            <div class="section-kicker">Our partners</div>
            <h2 id="partner-logos-heading">Organizations supporting Santi Sena's work</h2>
          </div>
          <p>
            A rotating view of funding, technical, learning and program partners connected with
            Santi Sena's community work.
          </p>
        </div>

        <div class="logo-marquee" aria-label="Partner logo slideshow">
          <div class="logo-track">
            <article
              v-for="(partner, index) in partnerLogoLoop"
              :key="`${partner.name}-${partner.variant}-${index}`"
              class="logo-slide"
              :aria-hidden="index >= partnerLogos.length ? 'true' : undefined"
            >
              <img
                :src="partner.logo"
                :alt="`${partner.name} - ${partner.tagline}`"
                class="partner-logo"
                loading="lazy"
              />
            </article>
          </div>
        </div>
      </section>

      <section class="commitments-section" aria-labelledby="commitments-heading">
        <div class="commitment-copy">
          <div class="section-kicker">Working values</div>
          <h2 id="commitments-heading">What Santi Sena commits to partners</h2>
        </div>
        <ul class="commitment-list">
          <li v-for="item in commitments" :key="item">{{ item }}</li>
        </ul>
      </section>
    </section>

    <section class="cta-band" aria-label="Contact partnerships team">
      <div class="cta-band__media" aria-hidden="true"></div>
      <div class="cta-band__inner">
        <p class="eyebrow">Build with us</p>
        <h2>Ready to create a practical partnership?</h2>
        <RouterLink to="/contact" class="primary-button">Contact our partnerships team</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.partner-page {
  --blue: #2f6f8f;

  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(6, 18, 13, 0.82) 0%, rgba(6, 18, 13, 0.5) 42%, rgba(6, 18, 13, 0.18) 72%, transparent 100%);
}

.partner-content,
.cta-band__inner {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.partner-hero__content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 720px;
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

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  line-height: 1.2;
  text-transform: uppercase;
}

.partner-hero__content h1 {
  max-width: 760px;
  margin: 1.2rem 0 0;
  color: #fffaf0;
  font-weight: 600;
  line-height: 0.94;
  text-wrap: balance;
}

.lead {
  max-width: 720px;
  margin: 1.8rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  font-weight: 500;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem 1.35rem;
  margin-top: 2.3rem;
}

.primary-button,
.secondary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  font-weight: 800;
  text-decoration: none;
}

.primary-button {
  border-radius: 999px;
  background: var(--primary-color);
  color: #fffaf0;
  padding: 0.85rem 1.55rem;
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.25);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.primary-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(20, 129, 62, 0.32);
}

.secondary-link {
  color: #fffaf0;
  opacity: 0.86;
}

.secondary-link:hover {
  opacity: 1;
}

.partner-content {
  padding: 5.5rem 0;
}

.partner-content h2,
.cta-band h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.08;
  text-wrap: balance;
}

.intro-section,
.practice-layout,
.areas-section,
.logo-section,
.commitments-section {
  display: grid;
  gap: clamp(2rem, 5vw, 4.5rem);
}

.intro-section {
  grid-template-columns: minmax(0, 0.82fr) minmax(320px, 1fr);
  align-items: center;
}

.intro-copy p,
.section-heading p,
.logo-section__header p {
  margin: 1.25rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.65;
}

.intro-copy h2,
.section-heading h2,
.areas-copy h2,
.logo-section__header h2,
.commitment-copy h2 {
  margin-top: 0.85rem;
}

.intro-image {
  margin: 0;
}

.intro-image img,
.practice-media img,
.areas-media img {
  display: block;
  width: 100%;
  object-fit: cover;
  border-radius: 8px;
}

.intro-image img {
  aspect-ratio: 4 / 3;
}

.intro-image figcaption {
  max-width: 520px;
  margin-top: 0.85rem;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

.practice-section,
.areas-section,
.logo-section,
.commitments-section {
  margin-top: 6rem;
}

.section-heading {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(260px, 0.75fr);
  gap: 2rem;
  align-items: end;
}

.practice-layout {
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.78fr);
  align-items: start;
  margin-top: 2.6rem;
}

.step-list {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border);
}

.step-list li {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 1.6rem;
  padding: 1.7rem 0;
  border-bottom: 1px solid var(--color-border);
}

.step-number {
  color: var(--blue);
  font-size: 2.4rem;
  line-height: 1;
}

.step-label {
  display: block;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step-list h3,
.area-list h3 {
  margin: 0.45rem 0 0;
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.15;
}

.step-list p,
.area-list p {
  margin: 0.65rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.55;
}

.practice-media {
  position: sticky;
  top: 2rem;
}

.practice-media img {
  aspect-ratio: 5 / 6;
}

.media-note {
  margin-top: 1rem;
  border-left: 4px solid var(--primary-color);
  padding-left: 1rem;
  color: var(--color-ink-soft);
}

.media-note strong,
.media-note span {
  display: block;
}

.media-note strong {
  color: var(--color-ink);
  font-weight: 600;
}

.media-note span {
  margin-top: 0.3rem;
  line-height: 1.5;
}

.areas-section {
  grid-template-columns: minmax(300px, 0.74fr) minmax(0, 1fr);
  align-items: start;
}

.areas-media img {
  aspect-ratio: 4 / 5;
}

.area-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 2rem;
  margin: 2rem 0 0;
  padding: 0;
  list-style: none;
  border-top: 1px solid var(--color-border);
}

.area-list li {
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--color-border);
}

.logo-section {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding-top: 5rem;
  overflow: hidden;
}

.logo-section__header {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(280px, 0.72fr);
  gap: 2rem;
  align-items: end;
}

.logo-marquee {
  width: 100%;
  margin-top: 2.2rem;
  overflow: hidden;
  padding: 0.45rem 0;
  mask-image: linear-gradient(90deg, transparent, #000 7%, #000 93%, transparent);
}

.logo-track {
  display: flex;
  width: max-content;
  gap: clamp(2.4rem, 5vw, 5rem);
  animation: logo-scroll 38s linear infinite;
}

.logo-marquee:hover .logo-track {
  animation-play-state: paused;
}

.logo-slide {
  position: relative;
  flex: 0 0 clamp(160px, 16vw, 230px);
  min-height: 98px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border: 1px solid rgba(221, 209, 192, 0.72);
  border-radius: 8px;
  background: #fff;
  padding: 1rem;
  box-shadow: 0 1px 2px rgba(54, 38, 17, 0.06);
}

.partner-logo {
  display: block;
  width: 100%;
  height: 76px;
  object-fit: contain;
}

.commitment-list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.commitment-list li {
  position: relative;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

@keyframes logo-scroll {
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(calc(-50% - clamp(1.2rem, 2.5vw, 2.5rem)));
  }
}

.commitments-section {
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  align-items: start;
  border-radius: 8px;
  background: linear-gradient(135deg, rgba(47, 111, 143, 0.2), transparent 42%), var(--primary-dark);
  padding: clamp(2rem, 5vw, 3.5rem);
}

.commitments-section h2,
.commitments-section .section-kicker,
.commitment-list li {
  color: #fffaf0;
}

.commitments-section .section-kicker {
  color: var(--primary-light);
}

.commitment-list {
  counter-reset: commitments;
}

.commitment-list li {
  counter-increment: commitments;
  display: grid;
  grid-template-columns: 2.5rem minmax(0, 1fr);
  gap: 1rem;
  align-items: start;
  padding: 1rem 0;
  border-bottom: 1px solid rgba(255, 250, 240, 0.18);
}

.commitment-list li:first-child {
  padding-top: 0;
}

.commitment-list li::before {
  content: counter(commitments, decimal-leading-zero);
  color: var(--primary-light);
  font-size: 1.55rem;
  line-height: 1;
}

.cta-band {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--primary-dark);
  padding: 5rem 0;
}

.cta-band__media {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url('https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?auto=format&fit=crop&w=1800&q=82')
    center / cover;
}

.cta-band::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(4, 42, 38, 0.92), rgba(4, 42, 38, 0.62));
}

.cta-band__inner {
  max-width: min(100% - 3rem, 920px);
  margin-left: max(1.5rem, calc((100vw - var(--container-max-width)) / 2));
}

.cta-band h2 {
  max-width: 780px;
  margin-top: 0.8rem;
  color: #fffaf0;
}

.cta-band .primary-button {
  margin-top: 2rem;
}

@media (max-width: 1060px) {
  .intro-section,
  .practice-layout,
  .areas-section,
  .logo-section,
  .commitments-section,
  .section-heading,
  .logo-section__header {
    grid-template-columns: 1fr;
  }

  .practice-media {
    position: static;
  }

  .practice-media img,
  .areas-media img {
    aspect-ratio: 16 / 10;
  }

  .logo-slide {
    flex-basis: 170px;
  }
}

@media (max-width: 760px) {
  .partner-content,
  .cta-band__inner {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .partner-hero__content {
    padding: 2rem 1.5rem;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .area-list {
    grid-template-columns: 1fr;
  }

  .partner-content {
    padding: 4rem 0;
  }

  .practice-section,
  .areas-section,
  .logo-section,
  .commitments-section {
    margin-top: 4.5rem;
  }

  .step-list li {
    grid-template-columns: 3.5rem minmax(0, 1fr);
    gap: 1rem;
  }

  .step-number {
    font-size: 2rem;
  }

  .logo-section {
    padding-top: 3.5rem;
  }

  .logo-marquee {
    mask-image: none;
  }

  .logo-slide {
    flex-basis: 154px;
    min-height: 86px;
    padding: 0.8rem;
  }

  .partner-logo {
    height: 62px;
  }

  .commitments-section {
    padding: 2rem;
  }

  .cta-band {
    padding: 4rem 0;
  }

  .cta-band__inner {
    margin-left: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .logo-track {
    width: 100%;
    flex-wrap: wrap;
    animation: none;
  }

  .logo-slide {
    flex: 1 1 190px;
  }
}
</style>
