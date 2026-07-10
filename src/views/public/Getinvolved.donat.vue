<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

const supportCards = [
  { stat: '293 villages', impact: 'Development programs reached Svay Rieng and Prey Veng communities in 2016.' },
  { stat: '571.601 ha', impact: 'Three community forests were supported across 18 villages and 2,372 households.' },
  { stat: '27,810 seedlings', impact: 'Tree nurseries produced multi-purpose and fruit seedlings for schools, communities and farms.' },
  { stat: '114 groups', impact: 'Saving for Change self-help groups supported 4,555 families with revolving loans.' },
  { stat: '363 children', impact: 'Seventeen community pre-schools helped young children access early education.' },
  { stat: '3,400 children', impact: 'Mobile library sessions promoted reading in 14 primary schools and 28 villages.' },
]

const programAreas = [
  'Community based natural resources management',
  'Sustainable livelihoods through self-help groups, agriculture cooperatives and home gardens',
  'Water, sanitation and hygiene through safe water, latrine use and hand washing',
  'Access to education through pre-schools, scholarships and mobile libraries',
  'Buddhist preservation through Dharma conversation, radio learning and Buddhist primary schools',
  'Child rights and child protection networks against trafficking, exploitation and abuse',
]

const contactDetails = [
  'Address: Prey Chlak pagoda, Svay Rieng City, Svay Rieng province',
  'Telephone: +855 77 65 54 64, +855 87 67 57 57, +855 71 877 55 33',
  'Email: santisenamonk@gmail.com, santisena@santisenacambodia.org',
  'Website: www.santisenacambodia.org',
]

const description =
  'Support Santi Sena, a Buddhist non-profit organization working for peace, livelihoods, social justice and environmental protection in rural Cambodia.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

onMounted(() => {
  previousTitle = document.title
  document.title = 'Support Santi Sena - Donate'

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
    <section class="donate-hero" aria-label="Support Santi Sena">
      <div class="donate-hero__content">
        <p class="eyebrow">Get Involved - Support Us</p>
        <h1>Support peace, livelihoods and environmental protection.</h1>
        <p class="lead">
          Santi Sena is a Buddhist non-profit, non-governmental and non-political organization
          founded in 1994 at Prey Chhlak monastery in Svay Rieng province.
        </p>
      </div>
    </section>

    <section class="donate-content" aria-labelledby="support-heading">
      <h2 id="support-heading">What your support strengthens</h2>
      <div class="tier-grid">
        <article v-for="card in supportCards" :key="card.stat" class="tier-card">
          <strong>{{ card.stat }}</strong>
          <p>{{ card.impact }}</p>
        </article>
      </div>

      <section class="text-section" aria-labelledby="mission-heading">
        <h2 id="mission-heading">Why support matters</h2>
        <p>
          The Santi Sena report describes a mission to reduce poverty, support local initiatives,
          work with vulnerable and marginalized people, reduce violence, promote human rights and
          democracy, empower women and contribute to the conservation of natural resources.
        </p>
      </section>

      <section class="text-section" aria-labelledby="program-heading">
        <h2 id="program-heading">Program areas</h2>
        <ul class="bullet-list">
          <li v-for="item in programAreas" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="text-section" aria-labelledby="contact-heading">
        <h2 id="contact-heading">How to contact Santi Sena</h2>
        <ul class="bullet-list">
          <li v-for="item in contactDetails" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="text-section" aria-labelledby="stewardship-heading">
        <h2 id="stewardship-heading">Financial stewardship</h2>
        <p>
          The report states that Santi Sena has detailed financial systems and policies to maintain
          high accounting standards, with a Financial Team responsible for preparing, maintaining and
          providing timely financial information.
        </p>
      </section>
    </section>

    <section class="cta-band" aria-label="Contact our team">
      <div class="cta-band__inner">
        <h2>Ready to support the work?</h2>
        <RouterLink to="/contact" class="cta-button">Contact our team -&gt;</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.donate-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.donate-hero {
  position: relative;
  min-height: 620px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(2, 50, 47, 0.9), rgba(2, 50, 47, 0.58), rgba(2, 50, 47, 0.22)),
    url('https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1800&q=80')
      center / cover;
}

.donate-hero__content {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  padding: 7rem 0;
}

.eyebrow {
  margin: 0;
  color: var(--primary-color);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.42em;
  text-transform: uppercase;
}

.donate-hero h1 {
  max-width: 980px;
  margin: 1.4rem 0 0;
  color: #fff8eb;
  font-weight: 600;
  line-height: 0.95;
}

.lead {
  max-width: 780px;
  margin: 2rem 0 0;
  color: rgba(255, 248, 235, 0.92);
  font-weight: 500;
  line-height: 1.55;
}

.donate-content {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  padding: 6.25rem 0 4rem;
}

.donate-content h2,
.cta-band h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 600;
  line-height: 1.1;
}

.tier-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.9rem;
  margin-top: 2.8rem;
}

.tier-card {
  min-height: 200px;
  border: 1px solid var(--color-border);
  border-radius: 1.1rem;
  background: rgba(255, 251, 243, 0.72);
  padding: 2.6rem;
  box-shadow: 0 2px 7px rgba(61, 46, 27, 0.1);
}

.tier-card strong {
  display: block;
  color: var(--primary-dark);
  font-size: clamp(2.4rem, 3.4vw, 3.2rem);
  font-weight: 500;
  line-height: 1;
}

.tier-card p {
  max-width: 280px;
  margin: 1.35rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.45;
}

.text-section {
  margin-top: 5rem;
}

.text-section p {
  max-width: 1120px;
  margin: 1.35rem 0 0;
  color: var(--color-ink-soft);
  line-height: 1.55;
}

.bullet-list {
  display: grid;
  gap: 1.1rem;
  margin: 1.8rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

.bullet-list li {
  position: relative;
  padding-left: 1.55rem;
}

.bullet-list li::before {
  content: '';
  position: absolute;
  top: 0.67em;
  left: 0;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--primary-color);
}

.cta-band {
  background: rgba(255, 250, 240, 0.48);
  border-top: 1px solid rgba(225, 212, 191, 0.72);
  padding: 4.8rem 0;
}

.cta-band__inner {
  width: min(100% - 3rem, var(--container-max-width));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3.45rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fffaf0;
  font-weight: 800;
  padding: 0.95rem 1.9rem;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(27, 163, 79, 0.24);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.cta-button:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(20, 129, 62, 0.3);
}

@media (max-width: 980px) {
  .donate-hero {
    min-height: 560px;
  }

  .tier-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .cta-band__inner {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .donate-hero {
    min-height: 520px;
  }

  .donate-hero__content,
  .donate-content,
  .cta-band__inner {
    width: min(100% - 2rem, var(--container-max-width));
  }

  .donate-hero__content {
    padding: 5rem 0;
  }

  .eyebrow {
    letter-spacing: 0.24em;
  }

  .tier-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }

  .tier-card {
    min-height: auto;
    padding: 2rem;
  }
}
</style>
