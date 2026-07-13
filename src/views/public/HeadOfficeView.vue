<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const contactBlocks = [
  {
    title: 'Address',
    lines: ['Santi Sena Organization', 'Svay Rieng Town', 'Svay Rieng Province', 'Kingdom of Cambodia'],
  },
  {
    title: 'Email',
    lines: ['info@santisena.org', 'partnerships@santisena.org', 'media@santisena.org'],
  },
  {
    title: 'Phone',
    lines: ['+855 (0) 12 345 678', '+855 (0) 44 987 654 (landline)'],
  },
  {
    title: 'Office hours',
    lines: ['Monday - Friday', '8:00 - 17:00 (Cambodia time, ICT / UTC+7)', 'Saturday by appointment'],
  },
] as const

const travelNotes = [
  'From Phnom Penh: ~2.5 hours by road via National Road 1',
  'From Ho Chi Minh City: ~4 hours via the Bavet-Moc Bai border',
  'Nearest airport: Phnom Penh International (PNH)',
  'Tuk-tuks available from Svay Rieng town centre',
] as const

onMounted(() => {
  document.title = 'Head Office | Santi Sena'
})
</script>

<template>
  <main class="head-office-page">
    <section class="office-hero" aria-labelledby="office-heading">
      <div class="office-hero__content">
        <p class="office-eyebrow">Contact - Head Office</p>
        <h1 id="office-heading">Visit us in Svay Rieng.</h1>
        <p>
          Our headquarters sits in Svay Rieng town, walking distance from the provincial
          pagoda where Santi Sena was founded thirty years ago.
        </p>
      </div>
    </section>

    <section class="office-details" aria-label="Head office contact details">
      <div class="office-details__inner">
        <div class="office-info-grid">
          <section v-for="block in contactBlocks" :key="block.title" class="office-info">
            <h2>{{ block.title }}</h2>
            <p>
              <template v-for="line in block.lines" :key="line">
                {{ line }}<br />
              </template>
            </p>
          </section>
        </div>

        <section class="travel-section" aria-labelledby="travel-heading">
          <h2 id="travel-heading">Getting here</h2>
          <ul>
            <li v-for="note in travelNotes" :key="note">{{ note }}</li>
          </ul>
        </section>

        <section class="visitor-section" aria-labelledby="visitor-heading">
          <h2 id="visitor-heading">Visitor guidance</h2>
          <p>
            We welcome donors, partners and researchers. Please email us at least two weeks
            ahead so we can arrange staff availability and, if you wish, a village field visit.
            Modest dress is appreciated - many meetings begin at the pagoda.
          </p>
        </section>
      </div>
    </section>

    <section class="office-cta" aria-label="Next step">
      <div class="office-cta__inner">
        <h2>Ready to take the next step?</h2>
        <RouterLink to="/contact#write" class="office-cta__button">Send a message <span>-&gt;</span></RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.head-office-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.office-hero {
  min-height: 510px;
  display: flex;
  align-items: center;
  background:
    linear-gradient(90deg, rgba(3, 43, 35, 0.96) 0%, rgba(4, 62, 50, 0.74) 48%, rgba(4, 62, 50, 0.42) 100%),
    linear-gradient(180deg, rgba(1, 29, 25, 0.08), rgba(1, 29, 25, 0.28)),
    url('https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?auto=format&fit=crop&w=1920&q=82')
      center 48% / cover;
}

.office-hero__content,
.office-details__inner,
.office-cta__inner {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--container-padding);
}

.office-hero__content {
  padding-block: 4.8rem;
}

.office-eyebrow {
  margin: 0 0 1rem;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.office-hero h1 {
  max-width: 760px;
  margin: 0;
  color: var(--color-white);
  font-weight: 700;
  line-height: 1.05;
}

.office-hero p:last-child {
  max-width: 780px;
  margin: 1.45rem 0 0;
  color: var(--color-white);
  font-size: 1.18rem;
  line-height: 1.45;
}

.office-details {
  background: var(--color-cream);
  border-top: 1px solid rgba(250, 243, 230, 0.82);
}

.office-details__inner {
  padding: 5.7rem 0 5.9rem;
}

.office-info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  column-gap: clamp(4rem, 12vw, 15rem);
  row-gap: 3.25rem;
  max-width: 1000px;
}

.office-info h2,
.travel-section h2,
.visitor-section h2,
.office-cta h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 700;
  line-height: 1.15;
}

.office-info p {
  margin: 0.8rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.94rem;
  line-height: 1.38;
}

.travel-section {
  margin-top: 3.35rem;
}

.travel-section ul {
  display: grid;
  gap: 0.8rem;
  margin: 1.15rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--color-ink);
  font-size: 0.94rem;
  line-height: 1.45;
}

.travel-section li {
  position: relative;
  padding-left: 1.2rem;
}

.travel-section li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 0.34rem;
  height: 0.34rem;
  border-radius: 50%;
  background: var(--primary-color);
}

.visitor-section {
  margin-top: 3.3rem;
  max-width: 980px;
}

.visitor-section p {
  margin: 0.9rem 0 0;
  color: var(--color-ink);
  font-size: 0.94rem;
  line-height: 1.45;
}

.office-cta {
  border-top: 1px solid var(--color-border);
  background: rgba(255, 248, 237, 0.55);
}

.office-cta__inner {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 3rem 0;
}

.office-cta__button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fff8ed;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 18px 42px rgba(27, 163, 79, 0.22);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.office-cta__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 48px rgba(20, 129, 62, 0.28);
}

@media (max-width: 760px) {
  .office-hero {
    min-height: 430px;
    background-position: center;
  }

  .office-hero__content {
    padding-block: 3.5rem;
  }

  .office-details__inner {
    padding: 3.6rem 0 4rem;
  }

  .office-info-grid {
    grid-template-columns: 1fr;
    row-gap: 2.35rem;
  }

  .office-info p,
  .travel-section ul,
  .visitor-section p {
    font-size: 0.98rem;
  }

  .travel-section,
  .visitor-section {
    margin-top: 3rem;
  }

  .office-cta__inner {
    min-height: 190px;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
  }

  .office-cta__button {
    width: 100%;
  }
}
</style>
