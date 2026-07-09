<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
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
  { image: '/images/programs/hero-3.jpg', caption: '' },
  { image: '/images/programs/hero-4.jpg', caption: '' },
]

const volunteerPathways = [
  {
    tag: 'Environment',
    title: 'Community forestry and climate action',
    image: communityForestryImage,
    alt: 'Volunteers and villagers planting tree seedlings in rural Cambodia',
    stat: '27,810 seedlings',
    summary: 'Support tree nurseries, planting days and community forest learning.',
    detail:
      'The report describes community forests, tree nurseries, National Tree Day and ecological child-right campaigns. Volunteers can help with field documentation, planting activities, learning materials and practical climate awareness.',
  },
  {
    tag: 'Livelihoods',
    title: 'Home gardens and farmer groups',
    image: livelihoodImage,
    alt: 'Volunteer and farmers reviewing a Cambodian home garden',
    stat: '114 self-help groups',
    summary: 'Work beside savings groups, agriculture cooperatives and home-garden families.',
    detail:
      'Santi Sena worked with Saving for Change groups, agriculture cooperatives and 1,200 farmers trained in vegetable, animal, rice and fish production. Volunteers can support training notes, market stories and simple monitoring.',
  },
  {
    tag: 'WASH',
    title: 'Safe water and hygiene in schools',
    image: washSchoolImage,
    alt: 'Children washing hands at a rural Cambodian school',
    stat: '75 school sessions',
    summary: 'Help school committees make safe water and handwashing practical.',
    detail:
      'School WASH committees promoted safe water, handwashing and hygiene behavior with children. Volunteers can assist awareness sessions, visual materials, activity facilitation and clean-water follow-up.',
  },
  {
    tag: 'Education',
    title: 'Pre-schools and mobile libraries',
    image: mobileLibraryImage,
    alt: 'Volunteer reading with children in a Cambodian school setting',
    stat: '3,400 readers',
    summary: 'Support reading, storytelling, classroom materials and attendance encouragement.',
    detail:
      'The report names community pre-schools, parenting groups, scholarships and 120 mobile library sessions. Volunteers can help children practice reading, prepare story activities and document learning progress.',
  },
  {
    tag: 'Protection',
    title: 'Child rights and safe migration',
    image: childProtectionImage,
    alt: 'Children and youth peer educators meeting in a Cambodian village',
    stat: '150 sessions',
    summary: 'Strengthen child-friendly awareness with peer educators and CCWCs.',
    detail:
      'Child protection networks worked on trafficking, labor exploitation, migration risk and abuse prevention. Volunteers can support safe facilitation, campaign materials, referral mapping and youth participation.',
  },
  {
    tag: 'Buddhist education',
    title: 'Learning through pagodas and values',
    image: buddhistEducationImage,
    alt: 'Young monks and volunteers organizing books in a Cambodian monastery classroom',
    stat: '20 schools',
    summary: 'Contribute to Buddhist primary school support, books and community values.',
    detail:
      'Santi Sena supported Buddhist primary schools in 20 monasteries, Dharma conversation and learning resources. Volunteers can help organize materials, document stories and support respectful education activities.',
  },
]

const skillCards = [
  {
    title: 'Facilitation',
    image: childProtectionImage,
    alt: 'Youth and children in a community learning circle',
    detail:
      'Help prepare participatory sessions with children, youth, parents, farmers and commune groups.',
  },
  {
    title: 'Education support',
    image: mobileLibraryImage,
    alt: 'Children reading with a volunteer',
    detail:
      'Bring reading, storytelling, classroom organization or early-learning skills to rural schools.',
  },
  {
    title: 'Agriculture and environment',
    image: livelihoodImage,
    alt: 'Farmers and volunteer looking at vegetable beds',
    detail:
      'Support home gardens, tree planting, climate adaptation learning and farmer group documentation.',
  },
  {
    title: 'Monitoring and communication',
    image: communityForestryImage,
    alt: 'Community members planting seedlings',
    detail:
      'Help collect field notes, photos, case stories and simple evidence for reflection and reporting.',
  },
]

const fieldSteps = [
  {
    number: '01',
    title: 'Prepare with staff',
    image: volunteerHeroImage,
    alt: 'Volunteer team walking on a rural Cambodian road',
    detail:
      'Volunteers align with Santi Sena staff, child protection policy, gender and minority policy, anti-corruption policy and grievance procedures before joining field work.',
  },
  {
    number: '02',
    title: 'Listen locally',
    image: washSchoolImage,
    alt: 'Teacher and children practicing handwashing',
    detail:
      'Field work starts with communities, schools, pagodas, local authorities and technical departments already cooperating with Santi Sena.',
  },
  {
    number: '03',
    title: 'Work practically',
    image: buddhistEducationImage,
    alt: 'Young monks and volunteers in a classroom',
    detail:
      'Volunteer time is best used in concrete tasks: learning activities, field documentation, campaign support, training logistics and follow-up visits.',
  },
  {
    number: '04',
    title: 'Reflect and improve',
    image: childProtectionImage,
    alt: 'Community child-right learning circle',
    detail:
      'Santi Sena uses staff reflection, monitoring and partner-supported capacity building to turn field learning into the next action plan.',
  },
]

const contactDetails = [
  'Address: Prey Chlak pagoda, Svay Rieng City, Svay Rieng province',
  'Telephone: +855 77 65 54 64, +855 87 67 57 57, +855 71 877 55 33',
  'Email: santisenamonk@gmail.com, santisena@santisenacambodia.org',
]

const description =
  'Volunteer with Santi Sena in Cambodia through community forestry, livelihoods, WASH, education, Buddhist education and child protection programs.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(() => {
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
  <main class="volunteer-page">
    <Slideshow :slides="slideItems">
      <div class="hero-shade"></div>
      <div class="hero-content">
        <p class="eyebrow">Get involved - Volunteer</p>
        <h1>Bring your skills to community-led work in Cambodia.</h1>
        <p>
          Santi Sena works through village groups, schools, pagodas, commune committees and
          technical departments. Volunteers strengthen the patient work already happening in Svay
          Rieng and Prey Veng.
        </p>
        <RouterLink to="/contact" class="primary-link">Apply to volunteer</RouterLink>
      </div>
    </Slideshow>

    <section class="stats-band" aria-label="Volunteer context from the Santi Sena report">
      <div>
        <span class="stat-icon stat-icon--village" aria-hidden="true"></span>
        <strong>293</strong>
        <span>Villages reached in 2016</span>
      </div>
      <div>
        <span class="stat-icon stat-icon--commune" aria-hidden="true"></span>
        <strong>43</strong>
        <span>Communes across two provinces</span>
      </div>
      <div>
        <span class="stat-icon stat-icon--staff" aria-hidden="true"></span>
        <strong>34</strong>
        <span>Staff with project-specific skills</span>
      </div>
      <div>
        <span class="stat-icon stat-icon--pathways" aria-hidden="true"></span>
        <strong>6</strong>
        <span>Practical volunteer pathways</span>
      </div>
    </section>

    <section class="content-section" aria-labelledby="pathways-heading">
      <div class="section-heading">
        <p class="section-kicker">Where volunteers can help</p>
        <h2 id="pathways-heading">Choose a field area connected to the report.</h2>
      </div>

      <div class="card-grid card-grid--large">
        <article
          v-for="pathway in volunteerPathways"
          :key="pathway.title"
          class="image-card image-card--large"
          tabindex="0"
        >
          <img :src="pathway.image" :alt="pathway.alt" />
          <div class="image-card__base">
            <span>{{ pathway.tag }}</span>
            <h3>{{ pathway.title }}</h3>
            <strong>{{ pathway.stat }}</strong>
          </div>
          <div class="image-card__detail">
            <p>{{ pathway.summary }}</p>
            <small>{{ pathway.detail }}</small>
          </div>
        </article>
      </div>
    </section>

    <section class="content-section skill-section" aria-labelledby="skills-heading">
      <div class="section-heading">
        <p class="section-kicker">Useful skills</p>
        <h2 id="skills-heading">Volunteer work is practical, local and team-based.</h2>
      </div>

      <div class="card-grid card-grid--small">
        <article v-for="skill in skillCards" :key="skill.title" class="image-card" tabindex="0">
          <img :src="skill.image" :alt="skill.alt" />
          <div class="image-card__base">
            <span>Skill</span>
            <h3>{{ skill.title }}</h3>
          </div>
          <div class="image-card__detail">
            <p>{{ skill.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="content-section" aria-labelledby="steps-heading">
      <div class="section-heading">
        <p class="section-kicker">How it works</p>
        <h2 id="steps-heading">
          A volunteer placement should protect dignity and strengthen local capacity.
        </h2>
      </div>

      <div class="step-grid">
        <article v-for="step in fieldSteps" :key="step.number" class="step-card" tabindex="0">
          <img :src="step.image" :alt="step.alt" />
          <div class="step-card__content">
            <span>{{ step.number }}</span>
            <h3>{{ step.title }}</h3>
          </div>
          <p>{{ step.detail }}</p>
        </article>
      </div>
    </section>

    <section class="contact-band" aria-label="Volunteer contact details">
      <div class="contact-band__image">
        <img :src="volunteerHeroImage" alt="Volunteer team in rural Cambodia" />
      </div>
      <div class="contact-band__content">
        <p class="section-kicker">Start with a conversation</p>
        <h2>Tell Santi Sena what you can bring.</h2>
        <p>
          Share your skills, available dates, language ability and the program area you care about.
          The team can match your support to work that communities already prioritize.
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
  --blue: #2f6f8f;

  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.hero-shade {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(4, 42, 38, 0.88) 0%, rgba(4, 42, 38, 0.58) 42%, rgba(4, 42, 38, 0.22) 70%, transparent 100%),
    linear-gradient(0deg, rgba(4, 42, 38, 0.3), transparent 45%);
}

.content-section,
.stats-band,
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
  text-align: left;
  max-width: 720px;
  padding: 3rem clamp(1.5rem, 5vw, 4rem);
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
  font-weight: 900;
  letter-spacing: 0.22em;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero-content h1 {
  max-width: 760px;
  margin: 1.25rem 0 0;
  color: #fffaf0;
  font-weight: 600;
  line-height: 1;
  text-wrap: balance;
}

.hero-content p:not(.eyebrow) {
  max-width: 760px;
  margin: 1.75rem 0 0;
  color: rgba(255, 250, 240, 0.9);
  line-height: 1.6;
}

.primary-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.25rem;
  margin-top: 2rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fffaf0;
  font-weight: 850;
  padding: 0.85rem 1.55rem;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.22);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.primary-link:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(20, 129, 62, 0.3);
}

.stats-band {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;
  padding: 1.15rem 0;
}

.stats-band div {
  min-height: 128px;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  grid-template-areas:
    'icon value'
    'icon label';
  column-gap: 1rem;
  align-items: center;
  border: 1px solid rgba(221, 209, 192, 0.86);
  border-radius: 8px;
  background: rgba(255, 253, 248, 0.74);
  padding: 1.35rem;
  box-shadow: 0 1px 2px rgba(54, 38, 17, 0.06);
}

.stats-band div:first-child {
  padding-left: 1.35rem;
}

.stats-band strong {
  grid-area: value;
  display: block;
  color: var(--blue);
  font-size: clamp(2.45rem, 4vw, 3.85rem);
  font-weight: 500;
  line-height: 0.9;
}

.stats-band div > span:not(.stat-icon) {
  grid-area: label;
  display: block;
  max-width: 220px;
  margin-top: 0.55rem;
  color: var(--color-ink-soft);
  line-height: 1.35;
}

.stat-icon {
  position: relative;
  grid-area: icon;
  width: 3.35rem;
  height: 3.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: start;
  border: 1px solid rgba(47, 111, 143, 0.22);
  border-radius: 8px;
  background: rgba(47, 111, 143, 0.08);
  color: var(--blue);
}

.stat-icon::before,
.stat-icon::after {
  content: '';
  position: absolute;
}

.stat-icon--village::before {
  bottom: 0.82rem;
  width: 1.62rem;
  height: 1rem;
  border-radius: 0.12rem;
  background: currentColor;
}

.stat-icon--village::after {
  top: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  background: currentColor;
  transform: rotate(45deg);
}

.stat-icon--commune::before {
  inset: 0.72rem;
  border: 3px solid currentColor;
  border-radius: 50%;
}

.stat-icon--commune::after {
  width: 0.52rem;
  height: 0.52rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    -0.88rem 0 currentColor,
    0.88rem 0 currentColor,
    0 -0.88rem currentColor,
    0 0.88rem currentColor;
}

.stat-icon--staff::before {
  top: 0.66rem;
  width: 0.82rem;
  height: 0.82rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    -0.78rem 0.34rem 0 -0.08rem currentColor,
    0.78rem 0.34rem 0 -0.08rem currentColor;
}

.stat-icon--staff::after {
  bottom: 0.68rem;
  width: 1.84rem;
  height: 0.82rem;
  border-radius: 999px 999px 0 0;
  background: currentColor;
  box-shadow:
    -0.82rem 0.18rem 0 -0.18rem currentColor,
    0.82rem 0.18rem 0 -0.18rem currentColor;
}

.stat-icon--pathways::before {
  width: 1.62rem;
  height: 1.62rem;
  border: 3px solid currentColor;
  border-radius: 0.28rem;
  transform: rotate(45deg);
}

.stat-icon--pathways::after {
  width: 0.44rem;
  height: 0.44rem;
  border-radius: 50%;
  background: currentColor;
  box-shadow:
    -0.6rem -0.6rem currentColor,
    0.6rem -0.6rem currentColor,
    -0.6rem 0.6rem currentColor,
    0.6rem 0.6rem currentColor;
}

.content-section {
  padding: 5.5rem 0 0;
}

.section-heading {
  max-width: 820px;
}

.section-heading h2,
.contact-band h2 {
  margin: 0.85rem 0 0;
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.12;
  text-wrap: balance;
}

.section-heading p:not(.section-kicker),
.contact-band__content p {
  margin: 1.1rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.65;
}

.card-grid {
  display: grid;
  gap: 1.25rem;
  margin-top: 2.5rem;
}

.card-grid--large {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.card-grid--small,
.step-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.image-card {
  position: relative;
  min-height: 330px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
  border-radius: 8px;
  background: var(--primary-dark);
  color: #fffaf0;
  isolation: isolate;
  outline: 0;
}

.image-card--large {
  min-height: 410px;
}

.image-card img,
.step-card img,
.contact-band__image img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-card img {
  position: absolute;
  inset: 0;
  z-index: -2;
  transition:
    transform 0.45s ease,
    filter 0.45s ease;
}

.image-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    linear-gradient(180deg, transparent 12%, rgba(4, 42, 38, 0.26) 42%, rgba(4, 42, 38, 0.92)),
    linear-gradient(90deg, rgba(4, 42, 38, 0.26), transparent);
  transition: background 0.35s ease;
}

.image-card__base,
.image-card__detail {
  width: 100%;
  padding: 1.4rem;
}

.image-card__base {
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.image-card__base span {
  display: block;
  color: var(--primary-color);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.image-card__base h3 {
  margin: 0.55rem 0 0;
  color: #fffaf0;
  font-weight: 600;
  line-height: 1.15;
}

.image-card__base strong {
  display: block;
  margin-top: 0.8rem;
  color: var(--primary-color);
  font-size: 0.86rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.image-card__detail {
  position: absolute;
  left: 0;
  bottom: 0;
  opacity: 0;
  transform: translateY(1rem);
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.image-card__detail p,
.image-card__detail small {
  display: block;
  margin: 0;
  color: #fffaf0;
  line-height: 1.5;
}

.image-card__detail p {
  font-weight: 600;
  line-height: 1.25;
}

.image-card__detail small {
  margin-top: 0.8rem;
  color: rgba(255, 250, 240, 0.84);
}

.image-card:hover img,
.image-card:focus-visible img,
.image-card:focus-within img {
  transform: scale(1.06);
  filter: saturate(0.95) brightness(0.78);
}

.image-card:hover::after,
.image-card:focus-visible::after,
.image-card:focus-within::after {
  background: rgba(4, 42, 38, 0.82);
}

.image-card:hover .image-card__base,
.image-card:focus-visible .image-card__base,
.image-card:focus-within .image-card__base {
  opacity: 0;
  transform: translateY(-0.8rem);
}

.image-card:hover .image-card__detail,
.image-card:focus-visible .image-card__detail,
.image-card:focus-within .image-card__detail {
  opacity: 1;
  transform: translateY(0);
}

.skill-section {
  padding-top: 6rem;
}

.step-grid {
  display: grid;
  gap: 1rem;
  margin-top: 2.4rem;
}

.step-card {
  position: relative;
  min-height: 340px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--color-white);
  outline: 0;
}

.step-card img {
  position: absolute;
  inset: 0;
  z-index: 0;
  filter: saturate(0.92);
  transition:
    transform 0.45s ease,
    filter 0.45s ease;
}

.step-card::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, transparent 18%, rgba(4, 42, 38, 0.9));
}

.step-card__content,
.step-card p {
  position: absolute;
  left: 1.2rem;
  right: 1.2rem;
  z-index: 2;
}

.step-card__content {
  bottom: 1.2rem;
  color: #fffaf0;
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.step-card__content span {
  color: var(--primary-color);
  font-size: 1.55rem;
  line-height: 1;
}

.step-card__content h3 {
  margin: 0.4rem 0 0;
  color: #fffaf0;
  font-weight: 600;
  line-height: 1.15;
}

.step-card p {
  bottom: 1.2rem;
  margin: 0;
  color: rgba(255, 250, 240, 0.9);
  line-height: 1.5;
  opacity: 0;
  transform: translateY(1rem);
  transition:
    opacity 0.28s ease,
    transform 0.28s ease;
}

.step-card:hover img,
.step-card:focus-visible img {
  transform: scale(1.06);
  filter: saturate(0.9) brightness(0.72);
}

.step-card:hover .step-card__content,
.step-card:focus-visible .step-card__content {
  opacity: 0;
  transform: translateY(-0.8rem);
}

.step-card:hover p,
.step-card:focus-visible p {
  opacity: 1;
  transform: translateY(0);
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

.contact-band ul {
  display: grid;
  gap: 0.75rem;
  margin: 1.5rem 0 0;
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
  .card-grid--large,
  .card-grid--small,
  .step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-band {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .stats-band div {
    min-height: 118px;
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
  .stats-band,
  .contact-band {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .hero-content {
    padding: 2rem 1.5rem;
  }

  .stats-band,
  .card-grid--large,
  .card-grid--small,
  .step-grid {
    grid-template-columns: 1fr;
  }

  .stats-band div,
  .stats-band div:first-child,
  .stats-band div:nth-child(odd) {
    min-height: auto;
    padding: 1.15rem;
  }

  .stats-band div:first-child {
    padding-left: 1.15rem;
  }

  .stat-icon {
    width: 3rem;
    height: 3rem;
  }

  .content-section {
    padding-top: 4.2rem;
  }

  .image-card,
  .image-card--large,
  .step-card {
    min-height: 360px;
  }

  .contact-band {
    padding: 4.5rem 0;
  }
}

@media (hover: none) {
  .image-card::after,
  .step-card::after {
    background: rgba(4, 42, 38, 0.76);
  }

  .image-card__base,
  .step-card__content {
    opacity: 0;
  }

  .image-card__detail,
  .step-card p {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
