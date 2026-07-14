<script setup lang="ts">
import heroImage1 from '@/assets/hero-impact.jpg'
import heroImage2 from '@/assets/hero-impact-village.jpg'
import heroImage3 from '@/assets/hero-impact-forest.jpg'
import Slideshow from '@/components/shared/Slideshow.vue'
import { ref } from 'vue'

const milestones = [
  {
    year: '2024',
    title: '30-Year Strategic Plan',
    description:
      'New five-year strategy to deepen quality, diversify funding and invest in youth leadership.',
    detail:
      'The plan prioritises three pillars: (1) expanding community-led education programmes, (2) strengthening child protection systems, and (3) launching a dedicated youth innovation fund. Over 50 community dialogues were held to co‑design the strategy.',
    image: new URL('@/assets/maps/2024.png', import.meta.url).href,
  },
  {
    year: '2022',
    title: 'Melaleuca Oil Enterprise',
    description:
      'Village forest guardians launch a rural enterprise from non-timber forest products.',
    detail:
      'With technical support from Santi Sena, 12 village cooperatives now sustainably harvest melaleuca leaves, producing essential oils sold locally and exported. The enterprise provides income for 200 families while preserving the forest.',
    image: new URL('@/assets/maps/2022.png', import.meta.url).href,
  },
  {
    year: '2020',
    title: 'COVID-19 Response',
    description: 'Emergency food, hygiene and remote-learning kits reach more than 200 villages.',
    detail:
      'In partnership with local authorities, we distributed 3,500 food packs, 5,000 hygiene kits, and 2,000 radio‑based learning materials to keep children learning despite school closures.',
    image: new URL('@/assets/maps/2019.png', import.meta.url).href,
  },
  {
    year: '2018',
    title: 'Child Protection Networks',
    description: 'CPNs become active across 43 communes with 24/7 referral pathways.',
    detail:
      'Each network includes trained volunteers, social workers, and local police. They have handled over 1,200 cases, ensuring vulnerable children receive immediate care and legal support.',
    image: new URL('@/assets/maps/2018.png', import.meta.url).href,
  },
  {
    year: '2014',
    title: '20th Anniversary',
    description:
      'Kratie office opens. Programs extend to a third province and staff grows past 30 full-time.',
    detail:
      'The expansion to Kratie brought our integrated approach to another province, reaching an additional 80 villages. We also launched our first youth leadership camp that year.',
    image: new URL('@/assets/maps/2014.png', import.meta.url).href,
  },
  {
    year: '2011',
    title: 'Biogas program launched',
    description: 'Household biogas units begin replacing firewood in remote kitchens.',
    detail:
      'By 2015, we had installed over 400 biogas units, reducing deforestation and improving indoor air quality. The program also trains local technicians to maintain the systems.',
    image: new URL('@/assets/maps/2011.png', import.meta.url).href,
  },
  {
    year: '2007',
    title: 'Expansion to Prey Veng',
    description: 'Education and child protection programming reaches a second province.',
    detail:
      'We partnered with the provincial government to replicate the Svay Rieng model, focusing on school enrolment and community‑based child protection committees.',
    image: new URL('@/assets/maps/2007.png', import.meta.url).href,
  },
  {
    year: '2003',
    title: 'Saving-for-Change begins',
    description:
      'First women-led savings circles launched in Svay Rieng; the model becomes a program backbone.',
    detail:
      'Today, over 500 savings groups exist, with more than 12,000 members. The groups provide micro‑loans and financial literacy training, empowering women to start small businesses.',
    image: new URL('@/assets/maps/2003.png', import.meta.url).href,
  },
  {
    year: '1998',
    title: 'First community forestry site',
    description: 'Village committees take legal stewardship of 120 hectares of degraded forest.',
    detail:
      'The site has since become a model for community‑led reforestation, with over 50,000 trees planted and a thriving biodiversity corridor. It now serves as a learning hub for other villages.',
    image: new URL('@/assets/maps/1998.png', import.meta.url).href,
  },
  {
    year: '1994',
    title: 'Founded in Svay Rieng',
    description:
      'Buddhist monks and community elders establish the Peace Army after the war, focused on moral regeneration and rural recovery.',
    detail:
      'The founding team began with just five monks and a handful of volunteers. Their first project was rebuilding a primary school destroyed during the conflict, which became the spark for decades of community development.',
    image: new URL('@/assets/maps/1994.png', import.meta.url).href,
  },
]

const slideItems = [
  { image: heroImage1, caption: '' },
  { image: heroImage2, caption: '' },
  { image: heroImage3, caption: '' },
]

// State for expanded cards
const expanded = ref<boolean[]>(Array.from({ length: milestones.length }, () => false))

function toggleExpand(index: number) {
  expanded.value[index] = !expanded.value[index]
}
</script>

<template>
  <div class="timeline-page">
    <!-- Hero Slideshow -->
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">Impact · Timeline</span>
        <h1>Thirty years of walking with villages.</h1>
        <p>
          From a small pagoda in Svay Rieng to 293 villages across three provinces — the milestones
          that shaped Santi Sena.
        </p>
      </div>
    </Slideshow>

    <!-- Timeline Section -->
    <section class="history-section">
      <div class="container">
        <div class="section-heading">
          <span class="label">Milestones</span>
          <h2>Progress built through patient partnership.</h2>
          <p>
            Each step reflects a commitment to long-term, community-led change grounded in trust,
            dignity and local stewardship.
          </p>
        </div>

        <div class="timeline">
          <div
            v-for="(item, index) in milestones"
            :key="item.year"
            class="timeline-item"
            :class="{ 'timeline-item--reverse': index % 2 }"
          >
            <div class="timeline-card" @click="toggleExpand(index)">
              <div class="card-content">
                <div class="card-text">
                  <h3>{{ item.title }}</h3>
                  <p class="card-summary">{{ item.description }}</p>
                  <!-- Expanded detail -->
                  <div v-if="expanded[index]" class="card-detail">
                    <p>{{ item.detail }}</p>
                    <span class="read-less">— click to collapse</span>
                  </div>
                  <span v-else class="read-more">Read more</span>
                </div>
                <div class="card-image">
                  <img :src="item.image" :alt="item.title" />
                </div>
              </div>
            </div>

            <div class="timeline-node">
              <div class="node-line"></div>
              <div class="node-dot"></div>
              <div class="node-year">{{ item.year }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Santi Sena Cambodia Intro -->
    <section class="intro-section">
      <div class="container">
        <div class="intro-grid">
          <div class="intro-content">
            <h2>Santi Sena Cambodia</h2>

            <p>
              For more than <strong>30 years</strong>, Santi Sena Cambodia has partnered with rural
              communities to build peaceful, resilient and sustainable livelihoods through
              community-led development.
            </p>

            <p>
              Working across
              <span class="highlight">293 villages</span>,
              <span class="highlight">43 communes</span>, and
              <span class="highlight">3 provinces</span>, we empower children, youth and families
              through education, child protection, environmental conservation, sustainable
              livelihoods and local leadership.
            </p>

            <p>
              Our approach is rooted in dignity, trust and long-term partnership, ensuring
              communities have the opportunities and capacity to create lasting change for future
              generations.
            </p>
          </div>

          <div class="intro-image">
            <img
              src="https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/505525876_3181813175305341_2459654488011023770_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=KbphgVDtLEUQ7kNvwHwZoMd&_nc_oc=AdoEQdWJwc0WofG5wZkcxZUirfqYT4NJTaUZEmHge-clF78G4Ktd1xWu97cfyLoW4Jo&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=mM-k-o8joxyLISffyX9ncQ&_nc_ss=7b289&oh=00_AQBe77By6MxWzjiOTY8RROyjc3kuPm7orwHcP0SaARI5Xg&oe=6A566409"
              alt="Santi Sena Cambodia"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- Call to Action -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-box">
          <div class="cta-text">
            <span class="cta-label">Partnership</span>
            <h3>Ready to take the next step?</h3>
          </div>
          <RouterLink to="/impact" class="cta-button">
            Back to impact
            <span class="arrow">→</span>
          </RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Global Reset & Colors ── */
.timeline-page {
  min-height: 100vh;
  background: #faf8f5;
  color: #1e1a16;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* ── Hero ── */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    105deg,
    rgba(6, 18, 13, 0.88) 0%,
    rgba(6, 18, 13, 0.55) 42%,
    rgba(6, 18, 13, 0.2) 70%,
    transparent 100%
  );
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  max-width: 720px;
  margin: 0;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
  color: #fffdf8;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(32px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.eyebrow {
  display: inline-block;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  font-weight: 700;
  color: #aad6c7;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.25rem 1rem;
  border-radius: 999px;
  backdrop-filter: none;
}

.hero-content h1 {
  font-size: clamp(1.2rem, 3vw, 3.8rem);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: -0.02em;
  max-width: 720px;
  color: #fffdf8;
  margin: 0;
}

.hero-content p {
  max-width: 640px;
  margin-top: 1.25rem;
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 253, 248, 0.88);
}

/* ── Section Heading ── */
.history-section {
  padding: 80px 0 60px;
  background: #faf8f5;
}

.section-heading {
  text-align: center;
  margin-bottom: 70px;
}

.section-heading .label {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  font-weight: 700;
  color: #2d7a5a;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.3rem 1.4rem;
  border-radius: 999px;
  margin-bottom: 1rem;
}

.section-heading h2 {
  font-size: clamp(1rem, 2.5vw, 3.2rem);
  font-weight: 700;
  color: #1a3d2e;
  margin: 0.5rem 0 1rem;
  letter-spacing: -0.02em;
}

.section-heading p {
  max-width: 700px;
  margin: 0 auto;
  font-size: 1.05rem;
  line-height: 1.8;
  color: #5a524a;
}

/* ── Timeline ── */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #d4d0ca;
  transform: translateX(-50%);
}

.timeline-item {
  display: flex;
  margin-bottom: 80px;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.timeline-item--reverse {
  flex-direction: row-reverse;
}

/* Cards */
.timeline-card {
  width: 45%;
  background: #ffffff;
  border-radius: 1.5rem;
  box-shadow: 0 8px 30px rgba(47, 36, 29, 0.06);
  border: 1px solid rgba(47, 36, 29, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  overflow: hidden;
  cursor: pointer;
}

.timeline-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(47, 36, 29, 0.08);
}

.card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
}

.timeline-item--reverse .card-content {
  flex-direction: row-reverse;
}

.card-text {
  flex: 1;
}

.card-text h3 {
  font-size: 1.35rem;
  font-weight: 600;
  color: #1a3d2e;
  margin: 0 0 0.4rem;
}

.card-summary {
  font-size: 0.95rem;
  line-height: 1.6;
  color: #5a524a;
  margin: 0;
}

/* Expanded detail */
.card-detail {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(47, 36, 29, 0.08);
  animation: fadeDetail 0.25s ease;
}

@keyframes fadeDetail {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-detail p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: #4a423a;
  margin: 0 0 0.5rem 0;
}

.read-more,
.read-less {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #2d7a5a;
  margin-top: 0.5rem;
  letter-spacing: 0.02em;
}

.read-less {
  color: #8a7a6a;
  font-weight: 400;
}

.card-image {
  flex-shrink: 0;
}

.card-image img {
  width: 110px;
  height: 110px;
  object-fit: cover;
  border-radius: 50%;
  border: 4px solid #e8e3dc;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

/* ── Timeline Node – dot and year on the same line ── */
.timeline-node {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center; /* centers the dot */
  pointer-events: none;
  /* width is auto by default */
}

/* The dot is centered on the line */
.node-dot {
  width: 20px;
  height: 20px;
  background: #119992;
  border: 4px solid #faf8f5;
  border-radius: 50%;
  box-shadow: 0 0 0 2px #1e7a55;
  flex-shrink: 0;
  z-index: 2;
}

/* The year is positioned absolutely next to the dot */
.node-year {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  white-space: nowrap;
  font-size: 2.2rem;
  font-weight: 700;
  color: #136bd6;
  letter-spacing: -0.02em;
}

/* Cards on the left → year to the right of the dot */
.timeline-item:not(.timeline-item--reverse) .node-year {
  left: 100%;
  margin-left: 14px;
}

/* Cards on the right → year to the left of the dot */
.timeline-item--reverse .node-year {
  right: 100%;
  margin-right: 14px;
}

/* The vertical line that connects the node to the top/bottom */
.node-line {
  position: absolute;
  width: 2px;
  background: #d4d0ca;
  height: 100%;
  top: -50%;
  z-index: 0;
  transform-origin: center;
  animation: timelineWave 3.6s ease-in-out infinite;
}

@keyframes timelineWave {
  0% {
    transform: scaleY(0.98);
    opacity: 0.92;
  }
  50% {
    transform: scaleY(1.04);
    opacity: 1;
  }
  100% {
    transform: scaleY(0.98);
    opacity: 0.92;
  }
}

/* ── Intro Section ── */
.intro-section {
  padding: 90px 0;
  background: #fff;
}

.intro-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 70px;
  align-items: center;
}

.intro-content h2 {
  font-size: 42px;
  font-weight: 700;
  color: #1a3d2e;
  margin-bottom: 30px;
}

.intro-content p {
  font-size: 18px;
  line-height: 1.8;
  color: #444;
  margin-bottom: 22px;
}

.highlight {
  color: #27b4e7;
  font-weight: 700;
}

.intro-image img {
  width: 100%;
  border-radius: 16px;
  object-fit: cover;
}

@media (max-width: 992px) {
  .intro-grid {
    grid-template-columns: 1fr;
  }

  .intro-content h2 {
    font-size: 40px;
  }

  .intro-image {
    order: -1;
  }
}

/* ── CTA ── */
.cta-section {
  padding: 40px 0 60px;
  background: #faf8f5;
}

.cta-box {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  background: #ffffff;
  padding: 2rem 2.5rem;
  border-radius: 1.5rem;
  border: 1px solid rgba(30, 80, 60, 0.06);
  box-shadow: 0 4px 20px rgba(47, 36, 29, 0.04);
}

.cta-text .cta-label {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.6rem;
  font-weight: 700;
  color: #2d7a5a;
  background: rgba(45, 122, 90, 0.08);
  padding: 0.15rem 1rem;
  border-radius: 999px;
  margin-bottom: 0.4rem;
}

.cta-text h3 {
  font-weight: 600;
  font-size: 1.3rem;
  color: #1a3d2e;
  margin: 0;
}

.cta-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.7rem 1.8rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  background: #f99f02;
  color: #fff;
  box-shadow: 0 8px 24px rgba(30, 122, 85, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(30, 122, 85, 0.3);
}

.arrow {
  transition: transform 0.2s ease;
  display: inline-block;
}

.cta-button:hover .arrow {
  transform: translateX(3px);
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .timeline::before {
    display: none;
  }

  .timeline-item,
  .timeline-item--reverse {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 60px;
  }

  .timeline-card {
    width: 100%;
  }

  .card-content {
    flex-direction: row !important;
    padding: 1.25rem;
  }

  .timeline-item--reverse .card-content {
    flex-direction: row !important;
  }

  /* On mobile, the node becomes a horizontal row below the card */
  .timeline-node {
    position: relative;
    left: auto;
    top: auto;
    transform: none;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;
    margin-top: 20px;
    pointer-events: auto;
  }

  .node-line {
    display: none;
  }

  .node-year {
    position: static; /* remove absolute */
    transform: none;
    font-size: 1.8rem;
    margin: 0; /* remove left/right margins */
  }

  .node-dot {
    width: 16px;
    height: 16px;
  }

  /* Override the absolute positioning for mobile */
  .timeline-item:not(.timeline-item--reverse) .node-year,
  .timeline-item--reverse .node-year {
    left: auto;
    right: auto;
    margin-left: 0;
    margin-right: 0;
  }
}

@media (max-width: 640px) {
  .hero-content {
    padding: 3.5rem 1.5rem;
  }

  .section-heading {
    margin-bottom: 40px;
  }

  .section-heading h2 {
    font-size: 1.8rem;
  }

  .section-heading p {
    font-size: 0.95rem;
  }

  .card-content {
    flex-direction: column !important;
    text-align: center;
    padding: 1.25rem;
  }

  .timeline-item--reverse .card-content {
    flex-direction: column !important;
  }

  .card-image img {
    width: 90px;
    height: 90px;
  }

  .card-text h3 {
    font-size: 1.15rem;
  }

  .card-text p {
    font-size: 0.9rem;
  }

  .cta-box {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
  }

  .cta-text h3 {
    font-size: 1.1rem;
  }

  .hero-content h1 {
    font-size: 1.8rem;
  }
}
</style>
