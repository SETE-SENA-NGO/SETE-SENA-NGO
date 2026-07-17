<script setup lang="ts">
import { nextTick, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

import buddhistEducationImage from '@/assets/volunteer/buddhist-education.png'
import childProtectionImage from '@/assets/volunteer/child-protection.png'
import communityForestryImage from '@/assets/volunteer/community-forestry.png'
import livelihoodImage from '@/assets/volunteer/livelihood-home-garden.png'
import mobileLibraryImage from '@/assets/volunteer/mobile-library.png'
import volunteerHeroImage from '@/assets/volunteer/volunteer-hero.png'
import washSchoolImage from '@/assets/volunteer/wash-school.png'

defineOptions({ name: 'GetInvolvedVolunteerView' })

const serviceCards = [
  {
    label: 'Education',
    title: 'Child education',
    body: 'Support reading, Buddhist primary education and practical learning materials for children.',
    image: mobileLibraryImage,
    alt: 'Children reading with a volunteer in a Cambodian school setting',
    to: '/programs/education',
  },
  {
    label: 'Livelihoods',
    title: 'Livelihoods',
    body: 'Help families strengthen home gardens, savings groups and local food security.',
    image: livelihoodImage,
    alt: 'A volunteer and farmers reviewing a Cambodian home garden',
    to: '/programs/livelihood',
  },
  {
    label: 'Community care',
    title: 'Environment & WASH',
    body: 'Join field activities around tree planting, hygiene awareness and safer school environments.',
    image: communityForestryImage,
    alt: 'Volunteers and villagers planting tree seedlings in rural Cambodia',
    to: '/programs/environment',
  },
]

const helpCards = [
  {
    title: 'Donate',
    body: 'Support learning materials, community activities and field work for vulnerable villages.',
    to: '/qr-donate',
  },
  {
    title: 'Volunteer',
    body: 'Bring your time, skills and care to practical work with children and communities.',
    to: '/contact',
  },
  {
    title: 'Partner',
    body: 'Collaborate with Santi Sena through shared values, technical skill or grant support.',
    to: '/get-involved/partner',
  },
]

const galleryImages = [
  {
    title: 'Youth learning',
    caption: 'Child protection and peer education activities.',
    image: childProtectionImage,
    alt: 'Children and youth peer educators meeting in a Cambodian village',
  },
  {
    title: 'Healthy schools',
    caption: 'WASH practice with students and teachers.',
    image: washSchoolImage,
    alt: 'Children practicing handwashing at a rural Cambodian school',
  },
  {
    title: 'Pagoda learning',
    caption: 'Books and materials for Buddhist education.',
    image: buddhistEducationImage,
    alt: 'Young monks and volunteers organizing learning materials',
  },
  {
    title: 'Field visits',
    caption: 'Community work carried with local teams.',
    image: volunteerHeroImage,
    alt: 'Volunteer team walking on a rural Cambodian road',
  },
]

const supportDetails = [
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

function setupRevealAnimations() {
  const elements = Array.from(document.querySelectorAll<HTMLElement>('.pop-reveal'))
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let lastScrollY = window.scrollY

  if (!('IntersectionObserver' in window) || prefersReducedMotion) {
    elements.forEach((element) => element.classList.add('is-visible'))
    return
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      const currentScrollY = window.scrollY
      const isScrollingDown = currentScrollY >= lastScrollY
      lastScrollY = currentScrollY

      entries.forEach((entry) => {
        const element = entry.target as HTMLElement

        if (!entry.isIntersecting) {
          element.classList.remove('is-visible')
          return
        }

        element.classList.remove('is-visible', 'reveal-from-top', 'reveal-from-bottom')
        element.classList.add(isScrollingDown ? 'reveal-from-bottom' : 'reveal-from-top')

        window.requestAnimationFrame(() => {
          element.classList.add('is-visible')
        })
      })
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.16 },
  )

  elements.forEach((element, index) => {
    element.style.setProperty('--reveal-delay', `${Math.min(index * 45, 360)}ms`)
    element.classList.add('reveal-from-bottom')
    revealObserver?.observe(element)
  })
}
</script>

<template>
  <main class="volunteer-page">
    <section class="program-section" aria-labelledby="program-heading">
      <div class="section-shell">
        <div class="section-heading section-heading--center pop-reveal">
          <h2 id="program-heading">Three ways to serve</h2>
          <p>
            Volunteers can support long-term community development through practical, compassionate
            programs already moving in the field.
          </p>
        </div>

        <div class="program-grid">
          <article v-for="card in serviceCards" :key="card.title" class="program-card pop-reveal">
            <img :src="card.image" :alt="card.alt" loading="lazy" />
            <div class="program-card__body">
              <span>{{ card.label }}</span>
              <h3>{{ card.title }}</h3>
              <p>{{ card.body }}</p>
              <RouterLink :to="card.to" class="card-link">Read more</RouterLink>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section class="story-section" aria-labelledby="story-heading">
      <div class="section-shell story-grid">
        <img
          :src="childProtectionImage"
          alt="Children and youth holding learning materials after a field activity"
          class="story-image pop-reveal"
          loading="lazy"
        />

        <div class="story-copy pop-reveal">
          <p class="section-kicker">Impact story</p>
          <h2 id="story-heading">Small support changes lives</h2>
          <p>
            Through patient support, local partnership and compassionate action, volunteers help
            communities move toward stability, dignity and hope.
          </p>
          <RouterLink to="/programs" class="primary-button">View programs</RouterLink>
        </div>
      </div>
    </section>

    <section class="help-section" aria-labelledby="help-heading">
      <div class="section-shell">
        <div class="section-heading section-heading--center pop-reveal">
          <p class="section-kicker">How you can help</p>
          <h2 id="help-heading">Make change with us</h2>
        </div>

        <div class="help-grid">
          <RouterLink
            v-for="card in helpCards"
            :key="card.title"
            :to="card.to"
            class="help-card pop-reveal"
          >
            <h3>{{ card.title }}</h3>
            <p>{{ card.body }}</p>
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="campaign-section" aria-labelledby="campaign-heading">
      <div class="section-shell">
        <div class="campaign-card pop-reveal">
          <RouterLink to="/qr-donate" class="campaign-button">Support this mission</RouterLink>
          <div>
            <p class="section-kicker">Featured campaign</p>
            <h2 id="campaign-heading">Support children’s learning</h2>
            <p>
              Your contribution can help provide learning materials, safe activities and community
              care for children who need it most.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="gallery-section" aria-labelledby="gallery-heading">
      <div class="section-shell">
        <div class="section-heading section-heading--center pop-reveal">
          <p class="section-kicker">Gallery</p>
          <h2 id="gallery-heading">Field moments</h2>
        </div>

        <div class="gallery-grid">
          <figure
            v-for="item in galleryImages"
            :key="item.alt"
            class="gallery-tile pop-reveal"
            tabindex="0"
          >
            <img :src="item.image" :alt="item.alt" loading="lazy" />
            <figcaption>
              <strong>{{ item.title }}</strong>
              <span>{{ item.caption }}</span>
            </figcaption>
          </figure>
        </div>

        <RouterLink to="/news" class="gallery-link">View stories</RouterLink>
      </div>
    </section>

    <section class="support-section" aria-labelledby="support-heading">
      <div class="section-shell support-grid">
        <div class="support-copy pop-reveal">
          <p class="section-kicker">Volunteer contact</p>
          <h2 id="support-heading">Strengthen local work</h2>
          <p>
            Share your skills, available dates, language ability and the program area you care
            about. The team will help match your interest with practical needs.
          </p>
        </div>

        <div class="support-card pop-reveal">
          <h3>Start here</h3>
          <p>
            Contact the team to discuss a volunteer placement, field visit or practical support.
          </p>
          <ul>
            <li v-for="item in supportDetails" :key="item">{{ item }}</li>
          </ul>
          <RouterLink to="/contact" class="primary-button">Contact the volunteer team</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.volunteer-page {
  min-height: 100vh;
  overflow: hidden;
  background: #ffffff;
  color: var(--color-ink);
  font-family: var(--font-family-base);
}

.volunteer-page :where(a, button, input, textarea, select) {
  font: inherit;
}

.section-shell {
  width: min(100% - 3rem, 1080px);
  margin: 0 auto;
}

.story-section,
.campaign-section,
.gallery-section,
.support-section {
  padding: clamp(4.5rem, 7vw, 6rem) 0;
}

.program-section,
.help-section {
  padding: clamp(4.5rem, 7vw, 6rem) 0;
  background:
    radial-gradient(
      circle at 50% 0,
      color-mix(in srgb, var(--primary-color) 7%, transparent),
      transparent 28rem
    ),
    #f3faf6;
}

.section-kicker {
  margin: 0;
  color: var(--primary-color);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1.2;
  text-transform: uppercase;
}

.section-heading h2,
.story-copy h2,
.campaign-card h2,
.support-copy h2 {
  margin: 0.6rem 0 0;
  color: #182923;
  font-size: clamp(1.45rem, 2.5vw, 2.05rem);
  font-weight: 850;
  line-height: 1.12;
  letter-spacing: 0;
  text-wrap: balance;
}

.section-heading p,
.story-copy p,
.campaign-card p:not(.section-kicker),
.support-copy p,
.support-card p {
  margin: 0;
  color: #607269;
  font-size: 0.98rem;
  font-weight: 600;
  line-height: 1.75;
}

.card-link,
.gallery-link {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  margin-top: 1.05rem;
  color: var(--primary-dark);
  font-size: 0.82rem;
  font-weight: 900;
  text-decoration: none;
}

.card-link:hover,
.gallery-link:hover {
  color: var(--primary-color);
}

.section-heading {
  max-width: 760px;
}

.section-heading--center {
  margin: 0 auto;
  text-align: center;
}

.section-heading p {
  max-width: 620px;
  margin: 0.85rem auto 0;
  font-size: 0.92rem;
}

.program-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.2vw, 1.35rem);
  margin-top: clamp(2.5rem, 5vw, 3.5rem);
}

.program-card,
.help-card,
.support-card {
  border: 1px solid color-mix(in srgb, var(--primary-color) 13%, var(--color-border));
  border-radius: 8px;
  background: #ffffff;
  box-shadow: 0 18px 40px color-mix(in srgb, var(--primary-dark) 8%, transparent);
}

.program-card {
  overflow: hidden;
}

.program-card img {
  width: 100%;
  aspect-ratio: 16 / 10;
  display: block;
  object-fit: cover;
}

.program-card__body {
  padding: 1.2rem 1.15rem 1.3rem;
}

.program-card__body span {
  display: inline-flex;
  color: var(--primary-color);
  font-size: 0.68rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.program-card h3,
.help-card h3,
.support-card h3 {
  margin: 0.45rem 0 0;
  color: var(--primary-dark);
  font-size: clamp(0.96rem, 1.15vw, 1.08rem);
  font-weight: 850;
  line-height: 1.25;
}

.program-card p,
.help-card p {
  margin: 0.72rem 0 0;
  color: #64766e;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.65;
}

.story-grid {
  display: grid;
  grid-template-columns: minmax(320px, 0.92fr) minmax(0, 1fr);
  gap: clamp(2.5rem, 6vw, 5rem);
  align-items: center;
}

.story-image {
  width: 100%;
  aspect-ratio: 16 / 10.6;
  border: 1px solid transparent;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 20px 48px color-mix(in srgb, var(--primary-dark) 11%, transparent);
}

.story-copy h2 {
  max-width: 560px;
}

.story-copy p {
  max-width: 620px;
  margin-top: 1rem;
}

.primary-button,
.campaign-button {
  display: inline-flex;
  min-height: 3rem;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--primary-color);
  color: #ffffff;
  padding: 0.8rem 1.1rem;
  font-size: 0.86rem;
  font-weight: 900;
  line-height: 1.1;
  text-decoration: none;
  box-shadow: 0 16px 30px color-mix(in srgb, var(--primary-color) 24%, transparent);
  transition:
    background 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.primary-button:hover,
.campaign-button:hover {
  background: var(--primary-dark);
  box-shadow: 0 20px 40px color-mix(in srgb, var(--primary-dark) 26%, transparent);
  transform: translateY(-2px);
}

.story-copy .primary-button {
  margin-top: 1.35rem;
}

.help-section {
  background:
    radial-gradient(
      circle at 50% 0,
      color-mix(in srgb, var(--primary-color) 8%, transparent),
      transparent 30rem
    ),
    #eef6f2;
}

.help-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(1rem, 2.2vw, 1.35rem);
  margin-top: 2.1rem;
}

.help-card {
  display: block;
  min-height: 150px;
  padding: 1.35rem;
  color: inherit;
  text-decoration: none;
}

.campaign-card {
  display: grid;
  grid-template-columns: minmax(180px, 0.28fr) minmax(0, 1fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
  border: 1px solid transparent;
  border-radius: 8px;
  background:
    radial-gradient(circle at 0% 50%, rgba(255, 255, 255, 0.16), transparent 22rem),
    linear-gradient(135deg, #2e7f8c 0%, var(--primary-color) 52%, var(--primary-dark) 100%);
  padding: clamp(1.6rem, 4vw, 2.8rem);
  color: #ffffff;
  box-shadow: 0 22px 52px color-mix(in srgb, var(--primary-dark) 18%, transparent);
}

.campaign-card .section-kicker,
.campaign-card h2,
.campaign-card p {
  color: #ffffff;
}

.campaign-card h2 {
  max-width: 720px;
  font-size: clamp(1.35rem, 2.35vw, 1.9rem);
}

.campaign-card p:not(.section-kicker) {
  max-width: 760px;
  margin-top: 0.9rem;
  color: rgba(255, 255, 255, 0.86);
}

.campaign-button {
  justify-self: start;
  background: #ffffff;
  color: var(--primary-dark);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.12);
}

.campaign-button:hover {
  background: var(--primary-light);
  color: var(--primary-dark);
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.85rem;
  margin-top: 2rem;
}

.gallery-tile {
  position: relative;
  overflow: hidden;
  width: 100%;
  aspect-ratio: 4 / 3;
  border: 1px solid transparent;
  border-radius: 8px;
  background: var(--primary-dark);
  box-shadow: 0 14px 30px color-mix(in srgb, var(--primary-dark) 8%, transparent);
  outline: none;
}

.gallery-tile img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transition:
    filter 0.24s ease,
    transform 0.24s ease;
}

.gallery-tile figcaption {
  position: absolute;
  right: 0.75rem;
  bottom: 0.75rem;
  left: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 8px;
  background: rgba(11, 95, 73, 0.9);
  color: #ffffff;
  padding: 0.72rem 0.8rem;
  opacity: 0;
  transform: translateY(18px) scale(0.96);
  transition:
    opacity 0.24s ease,
    transform 0.24s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.gallery-tile strong,
.gallery-tile span {
  display: block;
}

.gallery-tile strong {
  font-size: 0.9rem;
  font-weight: 900;
  line-height: 1.2;
}

.gallery-tile span {
  margin-top: 0.28rem;
  color: rgba(255, 255, 255, 0.82);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.35;
}

.gallery-tile:hover img,
.gallery-tile:focus-visible img {
  filter: brightness(0.72) saturate(1.05);
  transform: scale(1.06);
}

.gallery-tile:hover figcaption,
.gallery-tile:focus-visible figcaption {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.gallery-link {
  margin: 1.4rem auto 0;
}

.support-section {
  background: #f3faf6;
}

.support-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(320px, 0.84fr);
  gap: clamp(2.5rem, 7vw, 6rem);
  align-items: start;
}

.support-copy h2 {
  max-width: 560px;
}

.support-copy p {
  max-width: 560px;
  margin-top: 1rem;
}

.support-card {
  padding: clamp(1.35rem, 3vw, 2rem);
}

.support-card h3 {
  margin-top: 0;
}

.support-card p {
  margin-top: 0.8rem;
}

.support-card ul {
  display: grid;
  gap: 0.75rem;
  margin: 1.3rem 0 0;
  padding: 0;
  list-style: none;
}

.support-card li {
  position: relative;
  padding-left: 1.15rem;
  color: #607269;
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.5;
}

.support-card li::before {
  position: absolute;
  top: 0.58em;
  left: 0;
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 999px;
  background: var(--primary-color);
  content: '';
}

.support-card .primary-button {
  margin-top: 1.5rem;
}

.pop-reveal {
  opacity: 0;
  transform: translateY(36px) scale(0.985);
  transition:
    opacity 0.62s ease,
    transform 0.62s cubic-bezier(0.2, 0.8, 0.2, 1);
  transition-delay: var(--reveal-delay, 0ms);
  will-change: opacity, transform;
}

.pop-reveal.reveal-from-top {
  transform: translateY(-36px) scale(0.985);
}

.pop-reveal.reveal-from-bottom {
  transform: translateY(36px) scale(0.985);
}

.pop-reveal.is-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.program-card,
.help-card,
.story-image,
.campaign-card,
.gallery-tile,
.support-card {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.program-card:hover,
.help-card:hover,
.story-image:hover,
.campaign-card:hover,
.gallery-tile:hover,
.gallery-tile:focus-visible,
.support-card:hover {
  border-color: color-mix(in srgb, var(--primary-color) 32%, var(--color-border));
  box-shadow: 0 24px 52px color-mix(in srgb, var(--primary-dark) 13%, transparent);
  transform: translateY(-10px) scale(1.01);
}

@media (max-width: 980px) {
  .story-grid,
  .support-grid,
  .campaign-card {
    grid-template-columns: 1fr;
  }

  .program-grid,
  .help-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .section-shell {
    width: min(100% - 2rem, 1080px);
  }

  .program-grid,
  .help-grid,
  .gallery-grid {
    grid-template-columns: 1fr;
  }

  .campaign-card {
    padding: 1.35rem;
  }

  .primary-button,
  .campaign-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pop-reveal,
  .program-card,
  .help-card,
  .story-image,
  .campaign-card,
  .gallery-tile,
  .support-card,
  .primary-button,
  .campaign-button {
    transition: none;
  }

  .pop-reveal {
    opacity: 1;
    transform: none;
  }

  .program-card:hover,
  .help-card:hover,
  .story-image:hover,
  .campaign-card:hover,
  .gallery-tile:hover,
  .gallery-tile:focus-visible,
  .support-card:hover,
  .primary-button:hover,
  .campaign-button:hover {
    transform: none;
  }
}
</style>
