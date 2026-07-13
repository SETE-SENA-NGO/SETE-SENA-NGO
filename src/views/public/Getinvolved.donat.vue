<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/hero-2.jpg', caption: '' },
  { image: '/images/programs/education-hero.jpg', caption: '' },
  { image: '/images/programs/livelihood-hero1.jpg', caption: '' },
]

const giftUses = [
  {
    label: 'Education',
    title: 'School essentials',
    image: '/images/programs/education-hero.jpg',
    summary: 'Bikes, uniforms, bags and notebooks.',
    detail: 'The report names scholarships with bikes, uniforms, bags, shoes, notebooks and pens.',
  },
  {
    label: 'WASH',
    title: 'Clean water points',
    image: '/images/programs/hero-1.jpg',
    summary: 'Filters and handwashing spaces.',
    detail: 'Support can help schools keep safe water and handwashing practical for children.',
  },
  {
    label: 'Learning',
    title: 'Books for monastery schools',
    image: '/images/programs/hero-4.jpg',
    summary: 'Dharma and secular textbooks.',
    detail: 'The report records Dharma, Buddhist and secular books for Buddhist primary schools.',
  },
  {
    label: 'Livelihoods',
    title: 'Home garden inputs',
    image: '/images/programs/livelihood-hero3.jpg',
    summary: 'Seeds, farming practice and family food.',
    detail: 'Agriculture inputs help families apply vegetable, animal, rice and fish production training.',
  },
]

const trustNotes = [
  {
    title: 'Finance team',
    body: 'Santi Sena keeps financial information prepared, maintained and available for reporting.',
  },
  {
    title: 'Written policies',
    body: 'Finance, anti-corruption, conflict of interest and grievance policies guide the work.',
  },
  {
    title: 'Field use',
    body: 'Giving is directed into practical materials, learning support and community follow-up.',
  },
]

const description =
  'Donate to Santi Sena through practical support for school materials, safe water, learning books and rural livelihood inputs.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(() => {
  previousTitle = document.title
  document.title = 'Donate to Santi Sena'

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
  <main class="donate-page">
    <Slideshow :slides="slideItems" :interval-ms="5600">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <p class="eyebrow">Get involved - Support us</p>
        <h1>Give practical support.</h1>
        <p class="lead">Your gift can become school items, clean water, books or farming inputs.</p>
        <div class="hero-actions" aria-label="Donation actions">
          <RouterLink to="/qr-donate" class="button button-primary">Donate by QR</RouterLink>
          <a href="#gift-use" class="button button-secondary">See gift use</a>
        </div>
      </div>
    </Slideshow>

    <section id="gift-use" class="gift-section" aria-labelledby="gift-heading">
      <div class="section-heading">
        <p class="eyebrow">Gift use</p>
        <h2 id="gift-heading">Small items. Real field value.</h2>
      </div>

      <div class="gift-grid">
        <article
          v-for="(item, index) in giftUses"
          :key="item.title"
          class="gift-card"
          :class="{ 'gift-card--featured': index === 0 }"
          tabindex="0"
        >
          <img :src="item.image" :alt="item.title" loading="lazy" />
          <div class="gift-card__copy">
            <span>{{ item.label }}</span>
            <h3>{{ item.title }}</h3>
            <p>{{ item.summary }}</p>
          </div>
          <div class="gift-card__hover">
            <strong>{{ item.label }}</strong>
            <p>{{ item.detail }}</p>
          </div>
        </article>
      </div>
    </section>

    <section class="trust-section" aria-labelledby="trust-heading">
      <div class="trust-copy">
        <p class="eyebrow">Stewardship</p>
        <h2 id="trust-heading">Clear handling matters.</h2>
      </div>
      <div class="trust-grid">
        <article v-for="note in trustNotes" :key="note.title" class="trust-card">
          <h3>{{ note.title }}</h3>
          <p>{{ note.body }}</p>
        </article>
      </div>
    </section>

    <section class="cta-band" aria-label="Donate now">
      <div class="cta-band__inner">
        <div>
          <p class="eyebrow">Ready to give</p>
          <h2>Support the next practical need.</h2>
        </div>
        <div class="cta-actions">
          <RouterLink to="/qr-donate" class="button button-primary">Donate by QR</RouterLink>
          <RouterLink to="/contact" class="button button-secondary">Contact team</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.donate-page {
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
    linear-gradient(90deg, rgba(6, 18, 13, 0.86) 0%, rgba(6, 18, 13, 0.58) 44%, rgba(6, 18, 13, 0.18) 74%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.32), transparent 44%);
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
.cta-band .eyebrow {
  color: var(--primary-light);
}

.hero-content h1,
.section-heading h2,
.trust-copy h2,
.cta-band h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

.hero-content h1 {
  max-width: 48rem;
  margin-bottom: 1rem;
  color: var(--color-white);
}

.lead {
  max-width: 40rem;
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
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.22);
}

.button-primary:hover {
  background: var(--green-dark);
  box-shadow: 0 20px 38px rgba(20, 129, 62, 0.3);
}

.button-secondary {
  border-color: rgba(255, 255, 255, 0.58);
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
}

.button-secondary:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.18);
}

.gift-section,
.trust-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--container-padding);
}

.gift-section {
  padding-block: 6rem;
}

.section-heading,
.trust-copy {
  max-width: 760px;
}

.section-heading h2,
.trust-copy h2 {
  margin-top: 0.75rem;
  color: var(--ink);
}

.gift-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.12fr) minmax(0, 0.88fr);
  grid-auto-rows: minmax(154px, auto);
  gap: 1rem;
  margin-top: 2.5rem;
}

.gift-card {
  position: relative;
  min-height: 172px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--green-dark);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  isolation: isolate;
}

.gift-card--featured {
  grid-row: span 3;
  min-height: 520px;
}

.gift-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition:
    filter 0.28s ease,
    transform 0.35s ease;
}

.gift-card::after {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: linear-gradient(180deg, rgba(6, 18, 13, 0.02), rgba(6, 18, 13, 0.82));
  content: '';
}

.gift-card__copy,
.gift-card__hover {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  padding: 1.35rem;
}

.gift-card__copy {
  bottom: 0;
  color: var(--color-white);
  transition:
    opacity 0.18s ease,
    transform 0.24s ease;
}

.gift-card__copy span {
  display: inline-flex;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.16);
  padding: 0.3rem 0.65rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.gift-card h3 {
  margin: 0.75rem 0 0;
  color: var(--color-white);
  font-size: 1.35rem;
  line-height: 1.16;
}

.gift-card--featured h3 {
  font-size: 1.8rem;
}

.gift-card__copy p {
  margin: 0.65rem 0 0;
  color: rgba(255, 255, 255, 0.86);
  line-height: 1.45;
}

.gift-card__hover {
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 0.7rem;
  background: linear-gradient(
    180deg,
    rgba(6, 18, 13, 0.04) 0%,
    rgba(6, 18, 13, 0.24) 48%,
    rgba(6, 18, 13, 0.6) 100%
  );
  color: var(--color-white);
  transform: translateY(100%);
  transition: transform 0.28s ease;
}

.gift-card__hover strong {
  color: var(--primary-light);
  font-size: 0.85rem;
  text-transform: uppercase;
}

.gift-card__hover p {
  max-width: 34rem;
  margin: 0;
  line-height: 1.5;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.45);
}

.gift-card:hover img,
.gift-card:focus-within img,
.gift-card:focus img {
  filter: blur(1.6px);
  transform: scale(1.06);
}

.gift-card:hover .gift-card__hover,
.gift-card:focus-within .gift-card__hover,
.gift-card:focus .gift-card__hover {
  transform: translateY(0);
}

.gift-card:hover .gift-card__copy,
.gift-card:focus-within .gift-card__copy,
.gift-card:focus .gift-card__copy {
  opacity: 0;
  transform: translateY(-0.75rem);
}

.trust-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1fr);
  gap: 3rem;
  padding-block: 0 6rem;
}

.trust-grid {
  display: grid;
  gap: 0.9rem;
}

.trust-card {
  border-left: 4px solid var(--green);
  border-radius: 8px;
  background: var(--panel);
  padding: 1.2rem 1.35rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.trust-card h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.1rem;
}

.trust-card p {
  margin: 0.45rem 0 0;
  color: var(--muted);
  line-height: 1.55;
}

.cta-band {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  background: var(--green-dark);
  padding: 5rem 0;
}

.cta-band::before {
  position: absolute;
  inset: 0;
  z-index: -2;
  background: url('/images/programs/hero-3.jpg') center / cover;
  content: '';
}

.cta-band::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  background: linear-gradient(90deg, rgba(6, 18, 13, 0.9), rgba(6, 18, 13, 0.58));
  content: '';
}

.cta-band__inner {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cta-band h2 {
  color: var(--color-white);
}

.cta-band .button-secondary {
  background: rgba(255, 255, 255, 0.08);
}

@media (max-width: 980px) {
  .gift-grid,
  .trust-section {
    grid-template-columns: 1fr;
  }

  .gift-card--featured,
  .gift-card {
    min-height: 360px;
  }

  .cta-band__inner {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .hero-content {
    padding: 2rem 1.5rem;
  }

  .lead {
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

  .gift-section,
  .trust-section {
    padding-inline: var(--container-padding);
  }

  .gift-section {
    padding-block: 4rem;
  }

  .trust-section {
    padding-bottom: 4rem;
  }
}
</style>
