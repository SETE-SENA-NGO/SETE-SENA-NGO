<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=1800&q=82',
    alt: 'Community partners meeting outside',
  },
  {
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1800&q=82',
    alt: 'Children learning together in a rural community',
  },
  {
    image:
      'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1800&q=82',
    alt: 'Volunteers working together in a village setting',
  },
]

const proofPoints = [
  {
    value: '293',
    label: 'Villages',
    detail: 'reached across Svay Rieng and Prey Veng in 2016',
  },
  {
    value: '43',
    label: 'Communes',
    detail: 'connected through local development programs',
  },
  {
    value: '34',
    label: 'Staff',
    detail: 'with project-specific skills and continuing training',
  },
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
    mark: 'drop',
    variant: 'tdh-germany',
  },
  {
    name: 'german cooperation',
    tagline: 'DEUTSCHE ZUSAMMENARBEIT',
    mark: 'flag',
    variant: 'german-coop',
  },
  {
    name: 'rivers our life',
    tagline: 'Community partnership',
    mark: 'globe',
    variant: 'rivers-life',
  },
  {
    name: 'educo',
    tagline: 'Member of ChildFund Alliance',
    mark: 'person',
    variant: 'educo',
  },
  {
    name: 'HEIFER',
    tagline: 'INTERNATIONAL CAMBODIA',
    mark: 'goat',
    variant: 'heifer',
  },
  {
    name: 'Cambodia ACTs',
    tagline: 'Child protection network',
    mark: 'acts',
    variant: 'cambodia-acts',
  },
  {
    name: 'terre des hommes',
    tagline: 'stops child exploitation',
    mark: 'drop',
    variant: 'tdh-netherlands',
  },
  {
    name: 'Plan',
    tagline: 'International Cambodia',
    mark: 'child',
    variant: 'plan',
  },
  {
    name: 'Global Sanitation Fund',
    tagline: 'Water, sanitation and hygiene',
    mark: 'wave',
    variant: 'global-sanitation',
  },
  {
    name: 'Khyentse Foundation',
    tagline: 'Education and Buddhist preservation',
    mark: 'seal',
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

const activeSlide = ref(0)

const description =
  'Partner with Santi Sena through community-rooted programs in natural resources, livelihoods, WASH, education, Buddhist preservation and child protection.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let slideTimer: number | undefined

const setSlide = (index: number) => {
  activeSlide.value = index
}

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

  slideTimer = window.setInterval(() => {
    activeSlide.value = (activeSlide.value + 1) % heroSlides.length
  }, 5200)
})

onUnmounted(() => {
  document.title = previousTitle

  if (slideTimer !== undefined) {
    window.clearInterval(slideTimer)
  }

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }
})
</script>

<template>
  <main class="partner-page">
    <section class="partner-hero" aria-label="Partner with Santi Sena">
      <div class="partner-hero__slides" aria-hidden="true">
        <img
          v-for="(slide, index) in heroSlides"
          :key="slide.image"
          :src="slide.image"
          :alt="slide.alt"
          class="partner-hero__slide"
          :class="{ 'is-active': activeSlide === index }"
        />
      </div>
      <div class="partner-hero__shade"></div>

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

      <div class="hero-dots" aria-label="Choose hero image">
        <button
          v-for="(_, index) in heroSlides"
          :key="index"
          type="button"
          class="hero-dot"
          :class="{ 'is-active': activeSlide === index }"
          :aria-label="`Show partnership image ${index + 1}`"
          :aria-current="activeSlide === index ? 'true' : undefined"
          @click="setSlide(index)"
        ></button>
      </div>
    </section>

    <section class="proof-band" aria-label="Partnership reach">
      <div class="proof-band__inner">
        <div v-for="point in proofPoints" :key="point.label" class="proof-item">
          <strong>{{ point.value }}</strong>
          <span>{{ point.label }}</span>
          <p>{{ point.detail }}</p>
        </div>
      </div>
    </section>

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
              :class="`logo-slide--${partner.variant}`"
              :aria-hidden="index >= partnerLogos.length ? 'true' : undefined"
            >
              <span class="logo-symbol" :class="`logo-symbol--${partner.mark}`"></span>
              <span class="logo-wordmark">
                <strong>{{ partner.name }}</strong>
                <span>{{ partner.tagline }}</span>
              </span>
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
  --page: #f7f3ea;
  --paper: #fffdf8;
  --ink: #073f3a;
  --muted: #315a55;
  --line: #ddd1c0;
  --orange: #e86f1d;
  --blue: #2f6f8f;
  --green: #0a463d;
  --font-display: Cambria, Georgia, 'Times New Roman', serif;
  --font-body: Aptos, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  min-height: 100vh;
  background: var(--page);
  color: var(--ink);
  font-family: var(--font-body);
}

.partner-hero {
  position: relative;
  isolation: isolate;
  min-height: min(650px, 82vh);
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #0b332f;
}

.partner-hero__slides,
.partner-hero__shade,
.partner-hero__slide {
  position: absolute;
  inset: 0;
}

.partner-hero__slides {
  z-index: -2;
}

.partner-hero__slide {
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transform: scale(1.04);
  transition:
    opacity 900ms ease,
    transform 6500ms ease;
}

.partner-hero__slide.is-active {
  opacity: 1;
  transform: scale(1);
}

.partner-hero__shade {
  z-index: -1;
  background:
    linear-gradient(90deg, rgba(4, 42, 38, 0.92), rgba(4, 42, 38, 0.62), rgba(4, 42, 38, 0.16)),
    linear-gradient(0deg, rgba(4, 42, 38, 0.32), transparent 46%);
}

.partner-hero__content,
.partner-content,
.proof-band__inner,
.cta-band__inner {
  width: min(100% - 3rem, 1220px);
  margin: 0 auto;
}

.partner-hero__content {
  padding: 6.25rem 0;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--orange);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.22em;
  line-height: 1.2;
  text-transform: uppercase;
}

.partner-hero h1 {
  max-width: 760px;
  margin: 1.2rem 0 0;
  color: #fffaf0;
  font-family: var(--font-display);
  font-size: clamp(3.1rem, 7vw, 6.6rem);
  font-weight: 600;
  line-height: 0.94;
  text-wrap: balance;
}

.lead {
  max-width: 720px;
  margin: 1.8rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  font-size: clamp(1.05rem, 1.55vw, 1.35rem);
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
  background: var(--orange);
  color: #fffaf0;
  padding: 0.85rem 1.55rem;
  box-shadow: 0 18px 34px rgba(232, 111, 29, 0.25);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.primary-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(232, 111, 29, 0.32);
}

.secondary-link {
  color: #fffaf0;
  opacity: 0.86;
}

.secondary-link:hover {
  opacity: 1;
}

.hero-dots {
  position: absolute;
  left: 50%;
  bottom: 2rem;
  display: flex;
  gap: 0.65rem;
  transform: translateX(-50%);
}

.hero-dot {
  width: 0.72rem;
  height: 0.72rem;
  border: 1px solid rgba(255, 250, 240, 0.7);
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transition:
    background 0.2s ease,
    transform 0.2s ease,
    width 0.2s ease;
}

.hero-dot.is-active {
  width: 2rem;
  background: #fffaf0;
}

.proof-band {
  border-bottom: 1px solid var(--line);
  background: var(--paper);
}

.proof-band__inner {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.proof-item {
  min-height: 168px;
  padding: 2.2rem 2rem;
  border-left: 1px solid var(--line);
}

.proof-item:first-child {
  border-left: 0;
  padding-left: 0;
}

.proof-item strong {
  display: block;
  color: var(--blue);
  font-family: var(--font-display);
  font-size: clamp(3rem, 5vw, 4.5rem);
  font-weight: 500;
  line-height: 0.95;
}

.proof-item span {
  display: block;
  margin-top: 0.7rem;
  color: var(--ink);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.proof-item p {
  max-width: 260px;
  margin: 0.65rem 0 0;
  color: var(--muted);
  font-size: 0.98rem;
  line-height: 1.5;
}

.partner-content {
  padding: 5.5rem 0;
}

.partner-content h2,
.cta-band h2 {
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(2rem, 3.2vw, 3.1rem);
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
  color: var(--muted);
  font-size: 1.08rem;
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
  color: var(--muted);
  font-size: 0.95rem;
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
  border-top: 1px solid var(--line);
}

.step-list li {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 1.6rem;
  padding: 1.7rem 0;
  border-bottom: 1px solid var(--line);
}

.step-number {
  color: var(--blue);
  font-family: var(--font-display);
  font-size: 2.4rem;
  line-height: 1;
}

.step-label {
  display: block;
  color: var(--orange);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step-list h3,
.area-list h3 {
  margin: 0.45rem 0 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.15;
}

.step-list p,
.area-list p {
  margin: 0.65rem 0 0;
  color: var(--muted);
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
  border-left: 4px solid var(--orange);
  padding-left: 1rem;
  color: var(--muted);
}

.media-note strong,
.media-note span {
  display: block;
}

.media-note strong {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 1.35rem;
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
  border-top: 1px solid var(--line);
}

.area-list li {
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--line);
}

.logo-section {
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding-top: 5rem;
  overflow: hidden;
}

.logo-section__header {
  width: min(100% - 3rem, 1220px);
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
  flex: 0 0 clamp(132px, 14vw, 185px);
  min-height: 58px;
  display: flex;
  align-items: center;
  gap: 0.52rem;
  overflow: visible;
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  color: var(--muted);
  box-shadow: none;
}

.logo-symbol {
  position: relative;
  flex: 0 0 auto;
  width: 1.75rem;
  height: 1.75rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: transparent;
  color: currentColor;
}

.logo-symbol::before,
.logo-symbol::after {
  content: '';
  position: absolute;
}

.logo-symbol--drop {
  width: 1.35rem;
  height: 1.35rem;
  border-radius: 56% 56% 56% 0;
  background: currentColor;
  transform: rotate(-45deg);
}

.logo-symbol--drop::after {
  inset: 0.35rem;
  border-radius: 50%;
  background: inherit;
  filter: brightness(1.6);
  opacity: 0.45;
}

.logo-symbol--flag {
  width: 2.35rem;
  height: 1.15rem;
  border-radius: 58% 42% 56% 44%;
  background: linear-gradient(180deg, #282828 0 33%, #d91d28 33% 66%, #ffc934 66% 100%);
  transform: skewX(-14deg) rotate(7deg);
}

.logo-symbol--globe {
  background:
    radial-gradient(circle at 34% 38%, #fff 0 20%, transparent 21%),
    radial-gradient(circle at 60% 62%, #fff 0 14%, transparent 15%), #45a647;
}

.logo-symbol--globe::after,
.logo-symbol--wave::after {
  inset: 1rem 0.65rem;
  border-top: 3px solid #2f6f8f;
  border-radius: 50%;
  transform: rotate(58deg);
}

.logo-symbol--person {
  border-radius: 48% 48% 48% 12%;
  background: #69be59;
}

.logo-symbol--person::before {
  top: 0.38rem;
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 50%;
  background: #fff;
}

.logo-symbol--person::after {
  top: 0.78rem;
  width: 0.9rem;
  height: 0.58rem;
  border-radius: 999px 999px 0 0;
  background: #fff;
}

.logo-symbol--goat::before,
.logo-symbol--acts::before,
.logo-symbol--child::before,
.logo-symbol--seal::before {
  position: static;
  font-weight: 900;
  line-height: 1;
}

.logo-symbol--goat::before {
  content: 'HI';
  color: #8a6a45;
}

.logo-symbol--acts::before {
  content: 'ACTs';
  color: #b3323d;
  font-size: 0.75rem;
}

.logo-symbol--child::before {
  content: 'P';
  color: #1f61c7;
  font-size: 1.7rem;
}

.logo-symbol--wave {
  background: radial-gradient(circle at 60% 44%, #fff 0 26%, transparent 27%), #8ed5ec;
}

.logo-symbol--seal::before {
  content: 'KF';
  color: #2f2f2f;
}

.logo-wordmark {
  min-width: 0;
  display: grid;
  gap: 0.25rem;
}

.logo-wordmark strong {
  color: var(--ink);
  font-family: var(--font-display);
  font-size: clamp(0.86rem, 1vw, 1.12rem);
  font-weight: 700;
  line-height: 1;
  text-transform: none;
}

.logo-wordmark span {
  color: inherit;
  font-size: 0.58rem;
  font-weight: 800;
  line-height: 1.2;
  text-transform: none;
}

.logo-slide--tdh-germany {
  color: #b43d49;
}

.logo-slide--tdh-germany .logo-wordmark strong,
.logo-slide--tdh-germany .logo-wordmark span,
.logo-slide--tdh-netherlands .logo-wordmark strong,
.logo-slide--tdh-netherlands .logo-wordmark span {
  color: currentColor;
}

.logo-slide--tdh-germany .logo-symbol {
  color: #b43d49;
}

.logo-slide--german-coop .logo-wordmark strong {
  color: #3a3a3a;
  font-family: var(--font-body);
  font-weight: 900;
}

.logo-slide--german-coop .logo-wordmark span {
  color: #d9242f;
}

.logo-slide--rivers-life .logo-wordmark strong {
  color: #35a342;
  font-family: var(--font-body);
  font-weight: 900;
}

.logo-slide--rivers-life .logo-wordmark span {
  color: #2f6f8f;
}

.logo-slide--educo .logo-wordmark strong {
  color: #00aeb8;
  font-family: var(--font-body);
  font-size: clamp(1.28rem, 1.55vw, 1.72rem);
  font-weight: 800;
}

.logo-slide--educo .logo-wordmark span {
  color: #1f2d2d;
  font-weight: 600;
}

.logo-slide--heifer .logo-wordmark strong {
  color: #7a5a36;
  font-size: clamp(1.12rem, 1.45vw, 1.55rem);
}

.logo-slide--heifer .logo-wordmark span {
  color: #7a5a36;
}

.logo-slide--cambodia-acts .logo-wordmark strong {
  color: #b3323d;
}

.logo-slide--tdh-netherlands {
  color: #111;
}

.logo-slide--tdh-netherlands .logo-symbol {
  color: #d54b3d;
}

.logo-slide--tdh-netherlands .logo-wordmark strong {
  font-family: var(--font-body);
  font-weight: 900;
}

.logo-slide--plan .logo-wordmark strong {
  color: #1f61c7;
  font-family: var(--font-body);
  font-size: clamp(1.32rem, 1.65vw, 1.85rem);
  font-weight: 900;
}

.logo-slide--global-sanitation .logo-wordmark strong {
  color: #377f95;
}

.logo-slide--khyentse .logo-wordmark strong {
  color: #2f2f2f;
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
  color: var(--muted);
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
  background: linear-gradient(135deg, rgba(47, 111, 143, 0.2), transparent 42%), var(--green);
  padding: clamp(2rem, 5vw, 3.5rem);
}

.commitments-section h2,
.commitments-section .section-kicker,
.commitment-list li {
  color: #fffaf0;
}

.commitments-section .section-kicker {
  color: #ffb06e;
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
  color: #ffb06e;
  font-family: var(--font-display);
  font-size: 1.55rem;
  line-height: 1;
}

.cta-band {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: #0b332f;
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
  margin-left: max(1.5rem, calc((100vw - 1220px) / 2));
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
  .partner-hero {
    min-height: min(570px, 86vh);
  }

  .partner-hero__content,
  .partner-content,
  .proof-band__inner,
  .cta-band__inner {
    width: min(100% - 2rem, 1220px);
  }

  .partner-hero__content {
    padding: 5.2rem 0 5.8rem;
  }

  .hero-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-dots {
    bottom: 1.35rem;
  }

  .proof-band__inner,
  .area-list {
    grid-template-columns: 1fr;
  }

  .proof-item,
  .proof-item:first-child {
    min-height: auto;
    border-left: 0;
    border-top: 1px solid var(--line);
    padding: 1.7rem 0;
  }

  .proof-item:first-child {
    border-top: 0;
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
    flex-basis: 150px;
    min-height: 54px;
    padding: 0;
  }

  .logo-symbol {
    width: 1.5rem;
    height: 1.5rem;
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
