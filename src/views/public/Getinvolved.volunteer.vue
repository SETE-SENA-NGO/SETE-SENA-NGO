<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

import buddhistEducationImage from '@/assets/volunteer/buddhist-education.png'
import childProtectionImage from '@/assets/volunteer/child-protection.png'
import communityForestryImage from '@/assets/volunteer/community-forestry.png'
import livelihoodImage from '@/assets/volunteer/livelihood-home-garden.png'
import mobileLibraryImage from '@/assets/volunteer/mobile-library.png'
import volunteerHeroImage from '@/assets/volunteer/volunteer-hero.png'
import washSchoolImage from '@/assets/volunteer/wash-school.png'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: volunteerHeroImage, caption: '' },
  { image: communityForestryImage, caption: '' },
  { image: mobileLibraryImage, caption: '' },
]

const volunteerPathways = [
  {
    tag: 'Environment',
    title: 'Community forestry',
    image: communityForestryImage,
    alt: 'Volunteers and villagers planting tree seedlings in rural Cambodia',
    stat: '27,810 seedlings',
    summary: 'Support planting, nurseries and climate learning.',
    detail: 'Useful tasks include field notes, activity support and learning materials.',
  },
  {
    tag: 'Livelihoods',
    title: 'Home gardens',
    image: livelihoodImage,
    alt: 'Volunteer and farmers reviewing a Cambodian home garden',
    stat: '114 groups',
    summary: 'Work with savings groups, cooperatives and farmers.',
    detail: 'Help with training notes, market stories and simple monitoring.',
  },
  {
    tag: 'WASH',
    title: 'Safe water in schools',
    image: washSchoolImage,
    alt: 'Children washing hands at a rural Cambodian school',
    stat: '75 sessions',
    summary: 'Support clean water, handwashing and hygiene practice.',
    detail: 'Assist awareness sessions, visual materials and follow-up activities.',
  },
  {
    tag: 'Education',
    title: 'Mobile libraries',
    image: mobileLibraryImage,
    alt: 'Volunteer reading with children in a Cambodian school setting',
    stat: '3,400 readers',
    summary: 'Help children read, tell stories and enjoy books.',
    detail: 'Support story activities, classroom materials and attendance encouragement.',
  },
  {
    tag: 'Protection',
    title: 'Child rights',
    image: childProtectionImage,
    alt: 'Children and youth peer educators meeting in a Cambodian village',
    stat: '150 sessions',
    summary: 'Strengthen safe, child-friendly awareness.',
    detail: 'Support campaigns, referral mapping and youth participation.',
  },
  {
    tag: 'Buddhist education',
    title: 'Pagoda learning',
    image: buddhistEducationImage,
    alt: 'Young monks and volunteers organizing books in a Cambodian monastery classroom',
    stat: '20 schools',
    summary: 'Support Buddhist primary schools and learning resources.',
    detail: 'Help organize materials, document stories and support respectful activities.',
  },
]

const defaultPathway = volunteerPathways[0]!
const activePathwayIndex = ref(0)
const activePathway = computed(() => volunteerPathways[activePathwayIndex.value] ?? defaultPathway)

const skillCards = [
  {
    title: 'Facilitation',
    image: childProtectionImage,
    alt: 'Youth and children in a community learning circle',
    detail: 'Prepare simple participatory sessions with children, youth and parents.',
  },
  {
    title: 'Education support',
    image: mobileLibraryImage,
    alt: 'Children reading with a volunteer',
    detail: 'Bring reading, storytelling or classroom organization skills.',
  },
  {
    title: 'Agriculture and environment',
    image: livelihoodImage,
    alt: 'Farmers and volunteer looking at vegetable beds',
    detail: 'Support home gardens, tree planting and field documentation.',
  },
  {
    title: 'Monitoring and communication',
    image: communityForestryImage,
    alt: 'Community members planting seedlings',
    detail: 'Collect field notes, photos, case stories and simple evidence.',
  },
]

const fieldSteps = [
  {
    number: '01',
    title: 'Prepare with staff',
    image: volunteerHeroImage,
    alt: 'Volunteer team walking on a rural Cambodian road',
    detail: 'Align on safeguarding, policies and the field role before joining activities.',
  },
  {
    number: '02',
    title: 'Listen locally',
    image: washSchoolImage,
    alt: 'Teacher and children practicing handwashing',
    detail: 'Start with communities, schools, pagodas and local authorities.',
  },
  {
    number: '03',
    title: 'Work practically',
    image: buddhistEducationImage,
    alt: 'Young monks and volunteers in a classroom',
    detail: 'Focus on learning activities, documentation, campaigns and logistics.',
  },
  {
    number: '04',
    title: 'Reflect and improve',
    image: childProtectionImage,
    alt: 'Community child-right learning circle',
    detail: 'Turn field learning into better plans with the Santi Sena team.',
  },
]

const contactDetails = [
  'Prey Chlak pagoda, Svay Rieng City, Svay Rieng province',
  '+855 77 65 54 64, +855 87 67 57 57, +855 71 877 55 33',
  'santisenamonk@gmail.com, santisena@santisenacambodia.org',
]

const description =
  'Volunteer with Santi Sena through community forestry, livelihoods, WASH, education, Buddhist education and child protection programs.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false
let revealObserver: IntersectionObserver | null = null

onMounted(async () => {
  previousTitle = document.title
  document.title = 'Volunteer with Santi Sena'

  descriptionMeta = document.querySelector('meta[name="description"]')
  previousDescription = descriptionMeta?.getAttribute('content') ?? null

  if (!descriptionMeta) {
    descriptionMeta = document.createElement('meta')
    descriptionMeta.setAttribute('name', 'description')
    document.head.appendChild(descriptionMeta)
    createdDescriptionMeta = true
  }

  descriptionMeta.setAttribute('content', description)

  await nextTick()
  setupRevealAnimations()
})

onUnmounted(() => {
  document.title = previousTitle

  if (descriptionMeta && createdDescriptionMeta) {
    descriptionMeta.remove()
  } else if (descriptionMeta && previousDescription !== null) {
    descriptionMeta.setAttribute('content', previousDescription)
  }

  revealObserver?.disconnect()
  revealObserver = null
})

function setActivePathway(index: number) {
  activePathwayIndex.value = index
}

function setupRevealAnimations() {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.pop-reveal'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return

        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.16 },
  )

  elements.forEach((element) => revealObserver?.observe(element))
}
</script>

<template>
  <main class="volunteer-page">
    <Slideshow :slides="slideItems" :interval-ms="5600">
      <div class="hero-shade"></div>
      <div class="hero-content pop-reveal pop-content is-visible">
        <p class="eyebrow">Get involved - Volunteer</p>
        <h1>Volunteer with community-led work.</h1>
        <p>
          Share useful skills with village groups, schools, pagodas and local teams in Svay Rieng
          and Prey Veng.
        </p>
        <RouterLink to="/contact" class="primary-link">Apply to volunteer</RouterLink>
      </div>
    </Slideshow>

    <section class="content-section pathway-section" aria-labelledby="pathways-heading">
      <div class="pathway-layout">
        <div class="pathway-copy">
          <div class="section-heading pop-reveal pop-content">
            <p class="section-kicker">Where volunteers can help</p>
            <h2 id="pathways-heading">Choose a practical field area.</h2>
          </div>

          <div class="pathway-list" aria-label="Volunteer field areas">
            <article
              v-for="(pathway, index) in volunteerPathways"
              :key="pathway.title"
              class="pathway-row pop-reveal pop-card"
              :class="{ 'is-active': activePathway.title === pathway.title }"
              tabindex="0"
              @click="setActivePathway(index)"
              @focusin="setActivePathway(index)"
              @mouseenter="setActivePathway(index)"
            >
              <div class="card-meta">
                <span>{{ pathway.tag }}</span>
                <strong>{{ pathway.stat }}</strong>
              </div>
              <h3>{{ pathway.title }}</h3>
              <p>{{ pathway.summary }}</p>
              <small>{{ pathway.detail }}</small>
            </article>
          </div>
        </div>

        <figure class="pathway-preview pop-reveal pop-card">
          <img
            :key="activePathway.title"
            :src="activePathway.image"
            :alt="activePathway.alt"
            class="pop-reveal pop-image is-visible"
            loading="lazy"
          />
          <figcaption class="pop-reveal pop-content is-visible">
            <div class="card-meta">
              <span>{{ activePathway.tag }}</span>
              <strong>{{ activePathway.stat }}</strong>
            </div>
            <h3>{{ activePathway.title }}</h3>
            <p>{{ activePathway.summary }}</p>
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="content-section skill-section" aria-labelledby="skills-heading">
      <div class="section-heading pop-reveal pop-content">
        <p class="section-kicker">Useful skills</p>
        <h2 id="skills-heading">Volunteer work is practical, local and team-based.</h2>
      </div>

      <div class="skill-grid">
        <article
          v-for="skill in skillCards"
          :key="skill.title"
          class="skill-card pop-reveal pop-card"
        >
          <img :src="skill.image" :alt="skill.alt" class="pop-reveal pop-image" loading="lazy" />
          <div class="pop-reveal pop-content">
            <h3>{{ skill.title }}</h3>
            <p>{{ skill.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="content-section" aria-labelledby="steps-heading">
      <div class="section-heading pop-reveal pop-content">
        <p class="section-kicker">How it works</p>
        <h2 id="steps-heading">A simple, respectful placement process.</h2>
      </div>

      <div class="step-grid">
        <article
          v-for="step in fieldSteps"
          :key="step.number"
          class="step-card pop-reveal pop-card"
        >
          <img :src="step.image" :alt="step.alt" class="pop-reveal pop-image" loading="lazy" />
          <div class="step-card__body pop-reveal pop-content">
            <span>{{ step.number }}</span>
            <h3>{{ step.title }}</h3>
            <p>{{ step.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="contact-band" aria-label="Volunteer contact details">
      <div class="contact-band__image pop-reveal pop-card">
        <img
          :src="volunteerHeroImage"
          alt="Volunteer team in rural Cambodia"
          class="pop-reveal pop-image"
          loading="lazy"
        />
      </div>
      <div class="contact-band__content pop-reveal pop-content">
        <p class="section-kicker">Start with a conversation</p>
        <h2>Tell Santi Sena what you can bring.</h2>
        <p>
          Share your skills, available dates, language ability and the program area you care about.
        </p>
        <ul>
          <li v-for="item in contactDetails" :key="item">{{ item }}</li>
        </ul>
        <RouterLink to="/contact" class="primary-link">Contact the volunteer team</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.volunteer-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.86) 0%,
      rgba(6, 18, 13, 0.58) 44%,
      rgba(6, 18, 13, 0.18) 76%
    ),
    linear-gradient(0deg, rgba(6, 18, 13, 0.28), transparent 45%);
}

.content-section,
.contact-band {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 680px;
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

.pop-reveal {
  opacity: 0;
  transform: translateY(28px) scale(0.98);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease,
    filter 0.5s ease;
  will-change: opacity, transform;
}

.pop-card {
  transform: translateY(34px) scale(0.96);
}

.pop-image {
  filter: saturate(0.9);
  transform: translateY(22px) scale(1.035);
}

.pop-content {
  transform: translateY(20px);
}

.pop-reveal.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.pop-image.is-visible {
  filter: saturate(1);
}

.skill-card .pop-image,
.step-card .pop-image,
.contact-band__image .pop-image {
  transition-delay: 0.08s;
}

.skill-card .pop-content,
.step-card .pop-content {
  transition-delay: 0.14s;
}

.pathway-row:nth-child(2),
.skill-card:nth-child(2),
.step-card:nth-child(2) {
  transition-delay: 0.05s;
}

.pathway-row:nth-child(3),
.skill-card:nth-child(3),
.step-card:nth-child(3) {
  transition-delay: 0.1s;
}

.pathway-row:nth-child(4),
.skill-card:nth-child(4),
.step-card:nth-child(4) {
  transition-delay: 0.15s;
}

.pathway-row:nth-child(5),
.pathway-row:nth-child(6) {
  transition-delay: 0.2s;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero-content .eyebrow {
  color: var(--primary-light);
}

.hero-content h1,
.section-heading h2,
.contact-band h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.15;
  text-wrap: balance;
}

.hero-content h1 {
  max-width: 680px;
  margin-top: 1rem;
  color: #fffaf0;
}

.hero-content p:not(.eyebrow) {
  max-width: 640px;
  margin: 1.25rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  line-height: 1.6;
}

.primary-link {
  display: inline-flex;
  min-height: 3.15rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.8rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: var(--color-white);
  font-weight: 850;
  padding: 0.8rem 1.45rem;
  text-decoration: none;
  box-shadow: 0 16px 32px rgba(27, 163, 79, 0.2);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.primary-link:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 18px 36px rgba(20, 129, 62, 0.28);
}

.content-section {
  padding: 5rem 0 0;
}

.section-heading {
  max-width: 760px;
}

.section-heading h2,
.contact-band h2 {
  margin-top: 0.8rem;
  color: var(--color-ink);
}

.section-heading p:not(.section-kicker),
.contact-band__content p {
  margin: 1rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.65;
}

.pathway-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 0.82fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: start;
}

.pathway-list {
  display: grid;
  gap: 0.85rem;
  margin-top: 2rem;
}

.pathway-row {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  padding: 1rem;
  box-shadow: 0 4px 14px rgba(20, 129, 62, 0.05);
  outline: none;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
}

.pathway-row:hover,
.pathway-row:focus-visible,
.pathway-row.is-active {
  border-color: color-mix(in srgb, var(--primary-color) 32%, var(--color-border));
  background: var(--color-white);
  box-shadow: 0 14px 30px rgba(20, 129, 62, 0.1);
  transform: translateY(-2px);
}

.pathway-preview {
  position: sticky;
  top: 6rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: 0 18px 42px rgba(43, 43, 40, 0.1);
}

.pathway-preview img {
  width: 100%;
  height: clamp(430px, 50vw, 620px);
  object-fit: cover;
  animation: imagePop 0.24s ease;
}

@keyframes imagePop {
  from {
    opacity: 0.72;
    transform: scale(1.015);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

.pathway-preview figcaption {
  padding: 1.15rem;
  border-top: 1px solid var(--color-border);
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 0.75rem;
  align-items: center;
}

.card-meta span,
.card-meta strong {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  line-height: 1.1;
}

.card-meta span {
  border: 1px solid color-mix(in srgb, var(--primary-color) 22%, transparent);
  color: var(--primary-dark);
  padding: 0.3rem 0.6rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.card-meta strong {
  color: var(--color-ink-soft);
}

.pathway-row h3,
.pathway-preview h3,
.skill-card h3,
.step-card h3 {
  margin: 0.75rem 0 0;
  color: var(--color-ink);
  font-size: 1.12rem;
  line-height: 1.28;
}

.pathway-row p,
.pathway-preview p,
.skill-card p,
.step-card p {
  margin: 0.5rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.92rem;
  line-height: 1.55;
}

.pathway-row small {
  display: block;
  margin-top: 0.7rem;
  color: var(--color-ink-soft);
  font-size: 0.86rem;
  line-height: 1.5;
}

.skill-section {
  padding-top: 5rem;
}

.skill-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.skill-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: 0 4px 14px rgba(20, 129, 62, 0.05);
}

.skill-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
}

.skill-card div {
  padding: 1rem;
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2rem;
}

.step-card {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: 0 4px 14px rgba(20, 129, 62, 0.05);
}

.step-card img {
  width: 100%;
  height: 160px;
  object-fit: cover;
}

.step-card__body {
  padding: 1rem;
}

.step-card__body span {
  display: inline-flex;
  color: var(--primary-dark);
  font-size: 0.84rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.contact-band {
  display: grid;
  grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1fr);
  gap: clamp(2rem, 5vw, 4.5rem);
  align-items: center;
  padding: 6rem 0;
}

.contact-band__image {
  aspect-ratio: 4 / 5;
  overflow: hidden;
  border-radius: 8px;
}

.contact-band__image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-band ul {
  display: grid;
  gap: 0.75rem;
  margin: 1.4rem 0 0;
  padding: 0;
  list-style: none;
}

.contact-band li {
  position: relative;
  padding-left: 1.25rem;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

.contact-band li::before {
  content: '';
  position: absolute;
  top: 0.65em;
  left: 0;
  width: 0.38rem;
  height: 0.38rem;
  border-radius: 50%;
  background: var(--primary-color);
}

@media (max-width: 1060px) {
  .skill-grid,
  .step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pathway-layout {
    grid-template-columns: 1fr;
  }

  .pathway-preview {
    position: static;
  }

  .pathway-preview img {
    height: 420px;
  }

  .contact-band {
    grid-template-columns: 1fr;
  }

  .contact-band__image {
    aspect-ratio: 16 / 10;
  }
}

@media (max-width: 700px) {
  .content-section,
  .contact-band {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-content {
    padding: 2rem 1.5rem;
  }

  .skill-grid,
  .step-grid {
    grid-template-columns: 1fr;
  }

  .pathway-preview img {
    height: 260px;
  }

  .content-section {
    padding-top: 4rem;
  }

  .contact-band {
    padding: 4.5rem 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-content {
    animation: none;
  }

  .pop-reveal,
  .pathway-preview img {
    opacity: 1;
    transform: none;
    animation: none;
    transition: none;
  }
}
</style>
