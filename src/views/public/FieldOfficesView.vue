<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import heroImpactVillage from '@/assets/hero-impact-village.jpg'

const fieldOffices = [
  {
    name: 'Prey Veng Field Office',
    summary:
      'Coordinating environment, livelihood and education programs across Prey Veng communes.',
    details: [
      { label: 'Address', value: 'Prey Veng Town, Prey Veng Province, Cambodia', href: undefined },
      { label: 'Email', value: 'preyveng@santisena.org', href: 'mailto:preyveng@santisena.org' },
      { label: 'Phone', value: '+855 (0) 12 111 222', href: undefined },
      { label: 'Contact', value: 'Provincial Coordinator, Prey Veng', href: undefined },
    ],
  },
  {
    name: 'Kratie Field Office',
    summary: 'Community forestry, mobile libraries and child protection networks across Kratie.',
    details: [
      { label: 'Address', value: 'Kratie Town, Kratie Province, Cambodia', href: undefined },
      { label: 'Email', value: 'kratie@santisena.org', href: 'mailto:kratie@santisena.org' },
      { label: 'Phone', value: '+855 (0) 12 333 444', href: undefined },
      { label: 'Contact', value: 'Provincial Coordinator, Kratie', href: undefined },
    ],
  },
] as const

const officeHours = [
  'Monday - Friday: 8:00 - 17:00 Cambodia time (ICT / UTC+7)',
  'Field staff are often in the villages - email response may take 24-48 hours',
  'Provincial coordinators available by phone during office hours',
] as const

onMounted(() => {
  document.title = 'Field Offices | Santi Sena'
})
</script>

<template>
  <main class="field-offices-page">
    <section class="field-details" aria-label="Field office contact details">
      <div class="field-details__inner">
        <div class="field-card-grid">
          <article v-for="office in fieldOffices" :key="office.name" class="field-card">
            <h2>{{ office.name }}</h2>
            <p class="field-card__summary">{{ office.summary }}</p>

            <dl>
              <div v-for="detail in office.details" :key="detail.label">
                <dt>{{ detail.label }}</dt>
                <dd>
                  <a v-if="detail.href" :href="detail.href">{{ detail.value }}</a>
                  <span v-else>{{ detail.value }}</span>
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <section class="field-copy" aria-labelledby="visits-heading">
          <h2 id="visits-heading">Field visits</h2>
          <p>
            Donors, partners and researchers are welcome to visit a project site. Please arrange
            visits through our head office at least two weeks in advance so we can coordinate
            travel, translation and appropriate safeguarding.
          </p>
        </section>

        <section class="field-copy field-copy--hours" aria-labelledby="hours-heading">
          <h2 id="hours-heading">Office hours</h2>
          <ul>
            <li v-for="item in officeHours" :key="item">{{ item }}</li>
          </ul>
        </section>
      </div>
    </section>

    <section class="field-cta" aria-label="Next step">
      <div class="field-cta__inner">
        <h2>Ready to take the next step?</h2>
        <RouterLink to="/contact/head-office" class="field-cta__button">
          Visit head office <span>-&gt;</span>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.field-offices-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.field-hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(3, 43, 35, 0.9) 0%,
    rgba(4, 62, 50, 0.6) 42%,
    rgba(4, 62, 50, 0.22) 72%,
    transparent 100%
  );
}

.field-details__inner,
.field-cta__inner {
  width: 100%;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding-inline: var(--container-padding);
}

.field-hero__content {
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

.field-eyebrow {
  margin: 0 0 1rem;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.field-hero__content h1 {
  max-width: 760px;
  margin: 0;
  color: var(--color-white);
  font-weight: 700;
  line-height: 1.05;
}

.field-hero__content p:last-child {
  max-width: 740px;
  margin: 1.45rem 0 0;
  color: var(--color-white);
  font-size: 1.12rem;
  line-height: 1.45;
}

.field-details {
  background: var(--color-cream);
  border-top: 1px solid rgba(250, 243, 230, 0.82);
}

.field-details__inner {
  padding: 5.2rem 0 5.4rem;
}

.field-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(280px, 1fr));
  gap: 1.8rem;
  max-width: 980px;
  margin: 0 auto;
}

.field-card {
  padding: 2.05rem 2.15rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.84);
  box-shadow: 0 12px 30px rgba(43, 43, 40, 0.14);
}

.field-card h2,
.field-copy h2,
.field-cta h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 700;
  line-height: 1.15;
}

.field-card__summary {
  min-height: 3rem;
  margin: 1.05rem 0 1.55rem;
  color: var(--color-ink-soft);
  font-size: 1rem;
  line-height: 1.42;
}

.field-card dl {
  display: grid;
  gap: 0.82rem;
  margin: 0;
}

.field-card dt {
  color: var(--color-ink);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-card dd {
  margin: 0.16rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.93rem;
  line-height: 1.35;
}

.field-card a {
  color: var(--primary-color);
  text-decoration: none;
}

.field-card a:hover {
  text-decoration: underline;
}

.field-copy {
  max-width: 980px;
  margin: 4.2rem auto 0;
}

.field-copy p,
.field-copy ul {
  margin: 1.05rem 0 0;
  color: var(--color-ink);
  font-size: 0.98rem;
  line-height: 1.45;
}

.field-copy ul {
  display: grid;
  gap: 0.82rem;
  padding: 0;
  list-style: none;
}

.field-copy li {
  position: relative;
  padding-left: 1.2rem;
}

.field-copy li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.68em;
  width: 0.34rem;
  height: 0.34rem;
  border-radius: 50%;
  background: var(--primary-color);
}

.field-cta {
  border-top: 1px solid var(--color-border);
  background: rgba(255, 248, 237, 0.55);
}

.field-cta__inner {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  padding: 3rem 0;
}

.field-cta__button {
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

.field-cta__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 48px rgba(20, 129, 62, 0.28);
}

@media (max-width: 760px) {
  .field-hero__content {
    padding-block: 2rem;
  }

  .field-hero__content p:last-child {
    font-size: 1rem;
  }

  .field-details__inner {
    padding: 3.6rem 0 4rem;
  }

  .field-card-grid {
    grid-template-columns: 1fr;
    gap: 1.2rem;
  }

  .field-card {
    padding: 1.35rem;
  }

  .field-card__summary {
    min-height: 0;
    font-size: 0.94rem;
  }

  .field-copy {
    margin-top: 3rem;
  }

  .field-copy p,
  .field-copy ul {
    font-size: 0.94rem;
  }

  .field-cta__inner {
    min-height: 190px;
    align-items: flex-start;
    flex-direction: column;
    justify-content: center;
  }

  .field-cta__button {
    width: 100%;
  }
}
</style>
