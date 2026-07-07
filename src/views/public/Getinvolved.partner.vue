<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'

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
    step: 'Listen locally',
    title: 'Start with community needs',
    body: 'Santi Sena works with vulnerable and marginalized people, local authorities and stakeholders to identify practical community priorities.',
  },
  {
    step: 'Coordinate technically',
    title: 'Bring the right institutions together',
    body: 'The report names cooperation with provincial departments, school leaders, commune committees, forest authorities and child protection bodies.',
  },
  {
    step: 'Build capacity',
    title: 'Strengthen people, not only projects',
    body: 'Funding partners supported training in monitoring and evaluation, strategic planning, proposal writing and financial management.',
  },
  {
    step: 'Reflect and improve',
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

const collaborationBase = [
  {
    title: 'Government and technical partners',
    items: [
      'Forest Administration Cantonment of Svay Rieng',
      'Provincial Department of Agriculture',
      'Provincial Department of Rural Development',
      'Provincial Department of Education Youth and Sports',
      'Provincial Committees for Counter Trafficking',
      'Commune Committee for Women and Children',
    ],
  },
  {
    title: 'Funding and capacity partners',
    items: [
      'Terre Des Hommes Germany',
      'Terre Des Hommes Netherlands',
      'Heifer International Cambodia',
      'Cambodia ACTs',
      'Educo Cambodia',
      'Plan International Cambodia',
    ],
  },
  {
    title: 'Networks and learning',
    items: [
      'Regional Working Group for Bio-diversity in Southeast Asia',
      'Management and youth participation in network meetings',
      'Regional learning action for social development programs',
      'Cross-sector cooperation with local authorities, schools and community groups',
    ],
  },
]

const commitments = [
  'Honesty with donors, target groups, operational partners and working groups',
  'Non-discrimination across disability, religion, color, race and political affiliation',
  'Collective benefit and careful use of organizational property',
  'Flexibility in responding to target groups, development partners and available resources',
  'Transparency, accountability and consistency through finance, child protection, anti-corruption and grievance policies',
]

const description =
  'Partner with Santi Sena through community-rooted programs in natural resources, livelihoods, WASH, education, Buddhist preservation and child protection.'

let previousTitle = ''
let descriptionMeta: HTMLMetaElement | null = null
let previousDescription: string | null = null
let createdDescriptionMeta = false

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
  <main class="partner-page">
    <section class="partner-hero" aria-label="Partner with Santi Sena">
      <div class="partner-hero__content">
        <p class="eyebrow">Get Involved - Partner</p>
        <h1>Cooperate with a community-rooted organization.</h1>
        <p class="lead">
          Santi Sena's report shows development work built through cooperation with local
          authorities, provincial departments, funding partners, schools, commune committees and
          community groups.
        </p>
      </div>
    </section>

    <section class="proof-band" aria-label="Partnership reach">
      <article v-for="point in proofPoints" :key="point.label" class="proof-card">
        <span class="proof-card__mark" aria-hidden="true">{{ point.label.charAt(0) }}</span>
        <div class="proof-card__body">
          <strong>{{ point.value }}</strong>
          <span class="proof-card__label">{{ point.label }}</span>
          <p>{{ point.detail }}</p>
        </div>
      </article>
    </section>

    <section class="partner-content" aria-labelledby="practice-heading">
      <div class="section-kicker">Partnership in practice</div>
      <h2 id="practice-heading">How collaboration becomes village-level action</h2>
      <div class="step-grid">
        <article v-for="item in partnershipSteps" :key="item.step" class="step-card">
          <span>{{ item.step }}</span>
          <h3>{{ item.title }}</h3>
          <p>{{ item.body }}</p>
        </article>
      </div>

      <section class="text-section" aria-labelledby="areas-heading">
        <div class="section-kicker">Where partners can engage</div>
        <h2 id="areas-heading">Program systems named in the report</h2>
        <div class="area-grid">
          <article v-for="area in engagementAreas" :key="area.title" class="area-card">
            <h3>{{ area.title }}</h3>
            <p>{{ area.body }}</p>
          </article>
        </div>
      </section>

      <section class="text-section base-section" aria-labelledby="base-heading">
        <div>
          <div class="section-kicker">Existing collaboration base</div>
          <h2 id="base-heading">Partners join an ecosystem already at work</h2>
          <p>
            The document repeatedly describes good cooperation with local authorities, relevant
            provincial departments and stakeholders. New partners can strengthen a field system that
            already includes technical, community and funding relationships.
          </p>
        </div>
        <div class="base-grid">
          <article v-for="group in collaborationBase" :key="group.title" class="base-card">
            <h3>{{ group.title }}</h3>
            <ul>
              <li v-for="item in group.items" :key="item">{{ item }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="text-section commitments-section" aria-labelledby="commitments-heading">
        <div>
          <div class="section-kicker">Working values</div>
          <h2 id="commitments-heading">What Santi Sena commits to partners</h2>
        </div>
        <ul class="commitment-list">
          <li v-for="item in commitments" :key="item">{{ item }}</li>
        </ul>
      </section>
    </section>

    <section class="cta-band" aria-label="Contact partnerships team">
      <div class="cta-band__inner">
        <h2>Ready to build a partnership?</h2>
        <RouterLink to="/contact" class="cta-button">Contact our partnerships team -&gt;</RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.partner-page {
  --cream: #fbf4e6;
  --cream-soft: #fffaf0;
  --border: #e1d4bf;
  --primary: #073f3a;
  --text-soft: #244c46;
  --clay: #b85b1f;
  --orange: #f47d24;
  --green-deep: #094239;
  --font-display: Cambria, Georgia, 'Times New Roman', serif;
  --font-body: Aptos, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;

  min-height: 100vh;
  background: var(--cream);
  color: var(--primary);
  font-family: var(--font-body);
}

.partner-hero {
  min-height: 620px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(3, 47, 43, 0.9), rgba(3, 47, 43, 0.68), rgba(3, 47, 43, 0.22)),
    url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1800&q=82')
      center 42% / cover;
}

.partner-hero__content,
.proof-band,
.partner-content,
.cta-band__inner {
  width: min(100% - 3rem, 1220px);
  margin: 0 auto;
}

.partner-hero__content {
  padding: 7rem 0;
}

.eyebrow,
.section-kicker {
  margin: 0;
  color: var(--orange);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.34em;
  text-transform: uppercase;
}

.partner-hero h1 {
  max-width: 960px;
  margin: 1.4rem 0 0;
  color: #fff8eb;
  font-family: var(--font-display);
  font-size: clamp(3.25rem, 6vw, 5.2rem);
  font-weight: 600;
  line-height: 0.95;
}

.lead {
  max-width: 820px;
  margin: 2rem 0 0;
  color: rgba(255, 248, 235, 0.92);
  font-size: clamp(1.1rem, 1.7vw, 1.45rem);
  font-weight: 500;
  line-height: 1.55;
}

.proof-band {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.15rem;
  margin-top: -3rem;
  position: relative;
  z-index: 2;
}

.proof-card,
.step-card,
.area-card,
.base-card {
  border: 1px solid var(--border);
  background: rgba(255, 251, 243, 0.9);
  box-shadow: 0 2px 8px rgba(61, 46, 27, 0.12);
}

.proof-card {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  gap: 1.15rem;
  min-height: 170px;
  border-color: rgba(225, 212, 191, 0.9);
  border-radius: 1rem;
  background:
    linear-gradient(135deg, rgba(255, 251, 243, 0.96), rgba(250, 243, 230, 0.9)),
    var(--cream-soft);
  padding: 1.65rem 1.75rem;
  box-shadow: 0 18px 42px rgba(61, 46, 27, 0.16);
}

.proof-card::after {
  content: '';
  position: absolute;
  inset: auto 1.5rem 0;
  height: 4px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(90deg, var(--orange), rgba(184, 91, 31, 0.28));
}

.proof-card__mark {
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(244, 125, 36, 0.12);
  color: var(--orange);
  font-weight: 900;
  font-size: 1rem;
  line-height: 1;
  margin-top: 0.25rem;
}

.proof-card__body {
  min-width: 0;
}

.proof-card strong {
  display: block;
  color: var(--clay);
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 4.2vw, 3.8rem);
  font-weight: 500;
  line-height: 1;
}

.proof-card__label {
  display: block;
  margin-top: 0.65rem;
  color: var(--primary);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  line-height: 1.2;
  text-transform: uppercase;
}

.proof-card p {
  margin: 0.6rem 0 0;
  color: var(--text-soft);
  font-size: 0.98rem;
  line-height: 1.5;
}

.partner-content {
  padding: 5.75rem 0 5rem;
}

.partner-content h2,
.cta-band h2 {
  margin: 0;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: clamp(2rem, 3vw, 2.75rem);
  font-weight: 600;
  line-height: 1.1;
}

.partner-content > h2 {
  max-width: 860px;
  margin-top: 0.8rem;
}

.step-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1.25rem;
  margin-top: 2.8rem;
}

.step-card {
  min-height: 250px;
  border-radius: 1rem;
  padding: 1.65rem;
}

.step-card span {
  display: inline-flex;
  color: var(--orange);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.step-card h3,
.area-card h3,
.base-card h3 {
  margin: 1rem 0 0;
  color: var(--primary);
  font-family: var(--font-display);
  font-size: 1.45rem;
  font-weight: 600;
  line-height: 1.15;
}

.step-card p,
.area-card p,
.base-section p {
  margin: 0.9rem 0 0;
  color: var(--text-soft);
  font-size: 1rem;
  line-height: 1.5;
}

.text-section {
  margin-top: 5rem;
}

.text-section h2 {
  margin-top: 0.8rem;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  margin-top: 2.3rem;
}

.area-card {
  border-radius: 1rem;
  padding: 2rem;
}

.base-section {
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
  gap: 3rem;
  align-items: start;
}

.base-grid {
  display: grid;
  gap: 1rem;
}

.base-card {
  border-radius: 1rem;
  padding: 1.6rem;
}

.base-card h3 {
  margin-top: 0;
}

.base-card ul,
.commitment-list {
  display: grid;
  gap: 0.75rem;
  margin: 1.1rem 0 0;
  padding: 0;
  list-style: none;
  color: var(--text-soft);
  line-height: 1.45;
}

.base-card li,
.commitment-list li {
  position: relative;
  padding-left: 1.45rem;
}

.base-card li::before,
.commitment-list li::before {
  content: '';
  position: absolute;
  top: 0.62em;
  left: 0;
  width: 0.42rem;
  height: 0.42rem;
  border-radius: 50%;
  background: var(--orange);
}

.commitments-section {
  display: grid;
  grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr);
  gap: 3rem;
  align-items: start;
  border-radius: 1.1rem;
  background: var(--green-deep);
  padding: 3rem;
}

.commitments-section h2,
.commitments-section .section-kicker,
.commitment-list {
  color: #fff8eb;
}

.commitment-list {
  margin-top: 0;
}

.cta-band {
  background: rgba(255, 250, 240, 0.48);
  border-top: 1px solid rgba(225, 212, 191, 0.72);
  padding: 4.8rem 0;
}

.cta-band__inner {
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
  background: var(--orange);
  color: #fffaf0;
  font-weight: 800;
  padding: 0.95rem 1.9rem;
  text-decoration: none;
  box-shadow: 0 18px 34px rgba(244, 125, 36, 0.24);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.cta-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 38px rgba(244, 125, 36, 0.3);
}

@media (max-width: 1060px) {
  .proof-band,
  .area-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .step-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .base-section,
  .commitments-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .partner-hero {
    min-height: 560px;
  }

  .partner-hero__content,
  .proof-band,
  .partner-content,
  .cta-band__inner {
    width: min(100% - 2rem, 1220px);
  }

  .partner-hero__content {
    padding: 5rem 0;
  }

  .proof-band {
    grid-template-columns: 1fr;
    margin-top: 1.5rem;
  }

  .step-grid,
  .area-grid {
    grid-template-columns: 1fr;
  }

  .commitments-section {
    padding: 2rem;
  }

  .cta-band__inner {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
