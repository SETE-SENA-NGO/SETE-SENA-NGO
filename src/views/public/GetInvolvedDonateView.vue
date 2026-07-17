<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { imageUrls } from '@/lib/imageUrls'

defineOptions({
  name: 'GetInvolvedDonateView',
})

const donationStoryImage = imageUrls.programs.hero2
const donationLivelihoodImage = imageUrls.programs.livelihoodHero3

const giftUses = [
  {
    label: 'Education',
    title: 'School essentials',
    image: imageUrls.programs.educationHero,
    summary: 'Bikes, uniforms, bags and notebooks.',
    detail: 'The report names scholarships with bikes, uniforms, bags, shoes, notebooks and pens.',
  },
  {
    label: 'WASH',
    title: 'Clean water points',
    image: imageUrls.programs.hero1,
    summary: 'Filters and handwashing spaces.',
    detail: 'Support can help schools keep safe water and handwashing practical for children.',
  },
  {
    label: 'Learning',
    title: 'Books for monastery schools',
    image: imageUrls.programs.hero4,
    summary: 'Dharma and secular textbooks.',
    detail: 'The report records Dharma, Buddhist and secular books for Buddhist primary schools.',
  },
  {
    label: 'Livelihoods',
    title: 'Home garden inputs',
    image: imageUrls.programs.livelihoodHero3,
    summary: 'Seeds, farming practice and family food.',
    detail:
      'Agriculture inputs help families apply vegetable, animal, rice and fish production training.',
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

useScrollReveal()

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
    <section id="gift-use" class="gift-section" aria-labelledby="gift-heading">
      <div class="section-heading reveal">
        <p class="eyebrow">Gift use</p>
        <h2 id="gift-heading">Small items. Real field value.</h2>
      </div>

      <div class="gift-grid">
        <article
          v-for="(item, index) in giftUses"
          :key="item.title"
          class="gift-card reveal"
          :class="{ 'gift-card--featured': index === 0 }"
          :style="{ animationDelay: `${index * 0.1}s` }"
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
      <div class="trust-copy reveal">
        <p class="eyebrow">Stewardship</p>
        <h2 id="trust-heading">Clear handling matters.</h2>
        <p>
          Practical giving needs careful records, written guidance and clear reporting back to the
          work it supports.
        </p>
      </div>
      <div class="trust-grid">
        <article
          v-for="(note, index) in trustNotes"
          :key="note.title"
          class="trust-card reveal"
          :style="{ animationDelay: `${index * 0.11}s` }"
        >
          <h3>{{ note.title }}</h3>
          <p>{{ note.body }}</p>
        </article>
      </div>
    </section>

    <section class="cta-band" aria-labelledby="cta-heading">
      <div class="cta-band__inner">
        <div class="cta-band__visual reveal" aria-hidden="true">
          <figure class="cta-photo cta-photo--small reveal" style="animation-delay: 0.08s">
            <img :src="donationStoryImage" alt="" loading="lazy" />
          </figure>
          <figure class="cta-photo cta-photo--large reveal" style="animation-delay: 0.18s">
            <img :src="donationLivelihoodImage" alt="" loading="lazy" />
          </figure>
        </div>

        <div class="cta-band__copy reveal" style="animation-delay: 0.12s">
          <p class="eyebrow">Ready to give</p>
          <h2 id="cta-heading">Support the next practical need.</h2>
          <div class="cta-quote reveal" style="animation-delay: 0.24s">
            <p>
              The strongest giving is simple, specific and steady. Your donation helps Santi Sena
              turn urgent local needs into practical materials communities can use.
            </p>
          </div>
          <div class="cta-actions reveal" style="animation-delay: 0.34s">
            <RouterLink to="/qr-donate" class="button button-primary">Donate by QR</RouterLink>
            <RouterLink to="/contact" class="button button-secondary">Contact team</RouterLink>
          </div>
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

.reveal {
  opacity: 0;
}

.reveal--visible {
  opacity: 1;
  animation: revealPop 0.78s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes revealPop {
  0% {
    opacity: 0;
    transform: translateY(34px) scale(0.97);
  }

  70% {
    opacity: 1;
    transform: translateY(-5px) scale(1.01);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
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

.section-heading h2,
.trust-copy h2,
.cta-band h2 {
  margin: 0;
  font-weight: 600;
  line-height: 1.2;
  text-wrap: balance;
}

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
  transform: translateY(-3px);
}

.button:active {
  transform: translateY(0);
}

.button:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--green-light) 80%, var(--color-white));
  outline-offset: 3px;
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
  transform-origin: center bottom;
  transition:
    box-shadow 0.28s ease,
    transform 0.28s ease;
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
  filter: none;
  transform: scale(1.06);
}

.gift-card:hover,
.gift-card:focus-within,
.gift-card:focus {
  box-shadow: 0 24px 48px rgba(22, 35, 29, 0.16);
  transform: translateY(-8px);
}

.gift-card:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--green) 36%, var(--green-light));
  outline-offset: 4px;
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
  padding-block: 5.25rem 6.25rem;
  text-align: center;
}

.trust-copy {
  margin: 0 auto;
  text-align: center;
}

.trust-copy p:not(.eyebrow) {
  max-width: 650px;
  margin: 1rem auto 0;
  color: var(--muted);
  line-height: 1.7;
}

.trust-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 1.4rem;
  margin-top: 2.6rem;
}

.trust-card {
  position: relative;
  min-height: 260px;
  display: grid;
  align-content: start;
  gap: 1.4rem;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--green) 12%, var(--line));
  border-radius: 8px;
  background: var(--panel);
  padding: 2rem 1.75rem 1.8rem;
  box-shadow: 0 16px 32px rgba(43, 43, 40, 0.08);
  text-align: left;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.trust-card::before {
  content: '\201C';
  display: block;
  margin-bottom: -0.9rem;
  color: color-mix(in srgb, var(--green) 24%, var(--green-light));
  font-family: Georgia, serif;
  font-size: 5.4rem;
  font-weight: 900;
  line-height: 0.7;
}

.trust-card::after {
  position: absolute;
  inset: auto 1.2rem 1.1rem auto;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--green-light) 72%, var(--panel));
  content: '';
  opacity: 0.7;
}

.trust-card:hover {
  border-color: color-mix(in srgb, var(--green) 24%, var(--line));
  box-shadow: 0 24px 46px rgba(43, 43, 40, 0.14);
  transform: translateY(-8px);
}

.trust-card h3 {
  margin: 0;
  color: var(--ink);
  font-size: 1.08rem;
  font-weight: 700;
  line-height: 1.2;
}

.trust-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.96rem;
  font-style: italic;
  line-height: 1.75;
}

.cta-band {
  position: relative;
  overflow: hidden;
  background: var(--panel);
  padding: clamp(5rem, 8vw, 7rem) 0;
}

.cta-band::before {
  position: absolute;
  top: 39%;
  left: 0;
  width: min(62vw, 760px);
  height: clamp(9rem, 20vw, 13.5rem);
  background: color-mix(in srgb, var(--green) 52%, #d1c870);
  content: '';
  transform: translateY(-50%);
}

.cta-band__inner {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(390px, 0.95fr) minmax(320px, 0.85fr);
  align-items: center;
  gap: clamp(3rem, 7vw, 6rem);
}

.cta-band__visual {
  position: relative;
  min-height: clamp(440px, 48vw, 560px);
}

.cta-band__visual::before,
.cta-band__visual::after {
  position: absolute;
  border-radius: 999px;
  content: '';
  pointer-events: none;
}

.cta-band__visual::before {
  inset: 13% 12% 8% 8%;
  background: radial-gradient(circle, rgba(15, 143, 105, 0.18), transparent 68%);
  filter: blur(18px);
}

.cta-band__visual::after {
  right: 14%;
  bottom: 8%;
  width: min(40vw, 250px);
  height: min(40vw, 250px);
  background: color-mix(in srgb, var(--green-light) 82%, var(--color-white));
  opacity: 0.68;
}

.cta-photo {
  position: absolute;
  z-index: 1;
  margin: 0;
  overflow: hidden;
  border: 10px solid var(--panel);
  border-radius: 1.6rem;
  background:
    linear-gradient(var(--panel), var(--panel)) padding-box,
    linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(15, 143, 105, 0.34)) border-box;
  box-shadow:
    0 26px 60px rgba(22, 35, 29, 0.18),
    0 8px 22px rgba(15, 143, 105, 0.12);
  transition:
    box-shadow 0.28s ease,
    transform 0.28s ease;
}

.cta-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: calc(1.6rem - 10px);
  transition: transform 0.35s ease;
}

.cta-photo:hover {
  box-shadow:
    0 34px 70px rgba(22, 35, 29, 0.22),
    0 12px 30px rgba(15, 143, 105, 0.16);
  transform: translateY(-6px);
}

.cta-photo:hover img {
  transform: scale(1.04);
}

.cta-photo--small {
  bottom: 0;
  left: 0;
  width: min(47%, 320px);
  aspect-ratio: 4 / 5;
  border-radius: 1.4rem 2.2rem 1.4rem 2.2rem;
}

.cta-photo--large {
  top: 0;
  left: 39%;
  width: min(47%, 340px);
  aspect-ratio: 4 / 5;
  border-radius: 2.4rem 1.4rem 2.2rem 1.4rem;
}

.cta-band__copy {
  position: relative;
  z-index: 1;
}

.cta-band .eyebrow {
  color: var(--green);
}

.cta-band h2 {
  max-width: 28rem;
  color: var(--ink);
  font-size: clamp(2.1rem, 4vw, 3.5rem);
  font-weight: 700;
}

.cta-quote {
  display: grid;
  grid-template-columns: 5rem minmax(0, 1fr);
  gap: 1.5rem;
  align-items: start;
  margin-top: 2.4rem;
}

.cta-quote::before {
  color: color-mix(in srgb, var(--green) 62%, #d1c870);
  content: '\201C';
  font-family: Georgia, serif;
  font-size: clamp(6rem, 11vw, 8rem);
  font-weight: 900;
  line-height: 0.8;
}

.cta-quote p {
  max-width: 23rem;
  margin: 0.8rem 0 0;
  color: var(--muted);
  line-height: 1.75;
}

.cta-band .button-primary {
  background: var(--green);
  color: var(--color-white);
}

.cta-band .button-secondary {
  border-color: color-mix(in srgb, var(--green) 36%, var(--line));
  background: transparent;
  color: var(--green-dark);
}

.cta-band .button-secondary:hover {
  background: var(--green-light);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal--visible {
    opacity: 1;
    animation: none;
  }

  .button,
  .gift-card,
  .gift-card img,
  .gift-card__copy,
  .gift-card__hover,
  .trust-card,
  .cta-photo,
  .cta-photo img {
    transition: none;
  }
}

@media (max-width: 980px) {
  .gift-grid,
  .trust-section {
    grid-template-columns: 1fr;
  }

  .trust-grid {
    grid-template-columns: 1fr;
  }

  .gift-card--featured,
  .gift-card {
    min-height: 360px;
  }

  .cta-band::before {
    top: 30%;
    width: 78vw;
  }

  .cta-band__inner {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .cta-band__visual {
    width: min(100%, 620px);
    min-height: 430px;
  }

  .cta-band__copy {
    max-width: 640px;
  }
}

@media (max-width: 640px) {
  .cta-band {
    padding: 4rem 0;
  }

  .cta-band::before {
    top: 22%;
    width: 92vw;
    height: 8.5rem;
  }

  .cta-band__inner {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .cta-band__visual {
    min-height: 360px;
  }

  .cta-photo {
    border-width: 7px;
    border-radius: 1.15rem;
  }

  .cta-photo img {
    border-radius: calc(1.15rem - 7px);
  }

  .cta-photo--small {
    width: 56%;
    border-radius: 1rem 1.7rem 1rem 1.7rem;
  }

  .cta-photo--large {
    left: 41%;
    width: 55%;
    border-radius: 1.8rem 1rem 1.7rem 1rem;
  }

  .cta-quote {
    grid-template-columns: 1fr;
    gap: 0.2rem;
    margin-top: 1.7rem;
  }

  .cta-quote::before {
    font-size: 5.4rem;
  }

  .cta-quote p {
    margin-top: 0;
  }

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
