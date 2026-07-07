<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'

const fieldOffices = [
  {
    name: 'Prey Veng Field Office',
    summary: 'Coordinating environment, livelihood and education programs across Prey Veng communes.',
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
    <section class="field-hero" aria-labelledby="field-heading">
      <div class="field-hero__content">
        <p class="field-eyebrow">Contact - Field Offices</p>
        <h1 id="field-heading">Where the work actually happens.</h1>
        <p>
          Our two provincial field offices are the daily home of the staff who walk into
          villages - and the easiest way to reach a program directly.
        </p>
      </div>
    </section>

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
            Donors, partners and researchers are welcome to visit a project site. Please
            arrange visits through our head office at least two weeks in advance so we can
            coordinate travel, translation and appropriate safeguarding.
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
  --cream: #faf3e6;
  --cream-soft: #fffaf2;
  --green: #023f37;
  --green-deep: #042f29;
  --green-soft: #315b52;
  --orange: #f47d24;
  --border: rgba(4, 63, 55, 0.16);
  --shadow: rgba(31, 61, 46, 0.14);
  --serif: 'Playfair Display', Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  background: var(--cream);
  color: var(--green);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.field-hero {
  min-height: 510px;
  display: flex;
  align-items: center;
  background:
    linear-gradient(90deg, rgba(3, 43, 35, 0.96) 0%, rgba(4, 62, 50, 0.76) 48%, rgba(4, 62, 50, 0.4) 100%),
    linear-gradient(180deg, rgba(1, 29, 25, 0.06), rgba(1, 29, 25, 0.3)),
    url('https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?auto=format&fit=crop&w=1920&q=82')
      center 43% / cover;
}

.field-hero__content,
.field-details__inner,
.field-cta__inner {
  width: min(100% - 3rem, 1238px);
  margin: 0 auto;
}

.field-hero__content {
  padding: 4.8rem 0;
}

.field-eyebrow {
  margin: 0 0 1rem;
  color: var(--orange);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.field-hero h1 {
  max-width: 760px;
  margin: 0;
  color: #fff8ed;
  font-family: var(--serif);
  font-size: clamp(3rem, 5.5vw, 4.55rem);
  font-weight: 700;
  line-height: 1.05;
}

.field-hero p:last-child {
  max-width: 740px;
  margin: 1.45rem 0 0;
  color: #fff8ed;
  font-size: 1.12rem;
  line-height: 1.45;
}

.field-details {
  background: var(--cream);
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
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.84);
  box-shadow: 0 12px 30px var(--shadow);
}

.field-card h2,
.field-copy h2,
.field-cta h2 {
  margin: 0;
  color: var(--green-deep);
  font-family: var(--serif);
  font-weight: 700;
  line-height: 1.15;
}

.field-card h2 {
  font-size: 1.55rem;
}

.field-card__summary {
  min-height: 3rem;
  margin: 1.05rem 0 1.55rem;
  color: var(--green-soft);
  font-size: 1rem;
  line-height: 1.42;
}

.field-card dl {
  display: grid;
  gap: 0.82rem;
  margin: 0;
}

.field-card dt {
  color: var(--green);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-card dd {
  margin: 0.16rem 0 0;
  color: var(--green-soft);
  font-size: 0.93rem;
  line-height: 1.35;
}

.field-card a {
  color: var(--orange);
  text-decoration: none;
}

.field-card a:hover {
  text-decoration: underline;
}

.field-copy {
  max-width: 980px;
  margin: 4.2rem auto 0;
}

.field-copy h2 {
  font-size: clamp(1.55rem, 2.4vw, 1.95rem);
}

.field-copy p,
.field-copy ul {
  margin: 1.05rem 0 0;
  color: var(--green);
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
  background: var(--orange);
}

.field-cta {
  border-top: 1px solid var(--border);
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

.field-cta h2 {
  font-size: clamp(1.35rem, 2.2vw, 1.75rem);
}

.field-cta__button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.5rem;
  border-radius: 999px;
  background: var(--orange);
  color: #fff8ed;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  box-shadow: 0 18px 42px rgba(244, 125, 36, 0.22);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.field-cta__button:hover {
  transform: translateY(-1px);
  box-shadow: 0 22px 48px rgba(244, 125, 36, 0.28);
}

@media (max-width: 760px) {
  .field-hero {
    min-height: 430px;
    background-position: center;
  }

  .field-hero__content,
  .field-details__inner,
  .field-cta__inner {
    width: min(100% - 2rem, 1238px);
  }

  .field-hero__content {
    padding: 3.5rem 0;
  }

  .field-hero h1 {
    font-size: 2.6rem;
  }

  .field-hero p:last-child {
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

  .field-card h2 {
    font-size: 1.35rem;
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
