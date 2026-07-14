<script setup lang="ts">

const stats = [
  { number: '43', label: 'COMMUNES', description: 'With active Child Protection Networks.', icon: 'pin' },
  { number: '600+', label: 'PEER EDUCATORS', description: 'Youth trained in child rights and safeguarding.', icon: 'users' },
  { number: '24/7', label: 'VILLAGE HOTLINES', description: 'Case referral into commune and provincial authorities.', icon: 'phone' },
]

const whatWeDo = [
  'Anti-child-trafficking campaigns at borders, markets and schools',
  'Village Child Protection Networks (CPN) trained in identification and referral',
  'Child rights advocacy with commune councils and provincial authorities',
  'Peer-educator youth groups on safe migration, health and rights',
  'Family reintegration support for children returning from unsafe labour',
  'Safeguarding training for every teacher, monk and volunteer we work with',
]

// A referral case moves through three real stages described in "Our approach" below —
// this list just breaks that same sentence into steps for the pathway diagram.
const pathway = [
  {
    step: 'Village, at dawn',
    text: 'A trusted community member — mother, monk, teacher or commune council member — identifies a case early.',
    icon: 'village',
  },
  {
    step: 'Trained & connected',
    text: 'That network is trained, coached and connected by Santi Sena to formal referral pathways.',
    icon: 'link',
  },
  {
    step: 'Province, by dusk',
    text: 'The case reaches the provincial social affairs office the same day it was identified.',
    icon: 'office',
  },
]
</script>

<template>
  <div class="child-protection-page">
    <!-- Hero -->

    <!-- Trust bar -->
    <section class="trust-bar">
      <div class="container trust-bar-inner">
        <template v-for="(stat, i) in stats" :key="stat.label">
          <div class="trust-item">
            <span class="trust-icon">
              <svg v-if="stat.icon === 'pin'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.6"/>
              </svg>
              <svg v-else-if="stat.icon === 'users'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6"/>
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
                <circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.6"/>
                <path d="M15 20c0-2.6 2-4.6 5-4.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>
              </svg>
            </span>
            <div class="trust-copy">
              <p class="trust-number">{{ stat.number }}</p>
              <p class="trust-label">{{ stat.label }}</p>
              <p class="trust-desc">{{ stat.description }}</p>
            </div>
          </div>
          <div v-if="i < stats.length - 1" class="trust-divider" aria-hidden="true"></div>
        </template>
      </div>
    </section>

    <!-- Intro -->
    <section class="section-cream intro-section">
      <div class="container">
        <div class="intro-rule" aria-hidden="true"></div>
        <p class="intro-text text-center">
          Cross-border migration, poverty and family separation put rural Cambodian
          children at risk of unsafe labour and trafficking. Santi Sena works with
          villages, schools and pagodas to build the safety net closest to the child
          — before anything goes wrong.
        </p>
      </div>
    </section>

    <!-- What we do -->
    <section class="section-light">
      <div class="container">
        <div class="two-col-grid">
          <div class="col-text">
            <p class="section-eyebrow">Our work</p>
            <h2 class="section-title">What we do</h2>
            <ul class="check-grid">
              <li v-for="item in whatWeDo" :key="item">
                <span class="check-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </span>
                <span>{{ item }}</span>
              </li>
            </ul>
          </div>
          <div class="col-image">
            <div class="photo-duo">
              <div class="col-image-frame photo-duo-back">
                <img src="/images/programs/child-protection1.jpg" alt="Monk and peer educator reading with a child" />
              </div>
              <div class="col-image-frame photo-duo-front">
                <img src="/images/programs/child-protection2.jpg" alt="Youth peer educators standing together" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Our approach — referral pathway -->
    <section class="section-cream">
      <div class="container">
        <p class="section-eyebrow text-center">Our method</p>
        <h2 class="section-title text-center">Our approach</h2>
        <p class="approach-text text-center">
          Every network is anchored by the people children already trust — mothers,
          monks, teachers, commune council members. We train, coach and connect them
          to formal referral pathways so a case identified in a village at dawn
          reaches the provincial social affairs office by dusk.
        </p>

        <ol class="pathway">
          <svg class="pathway-wave" viewBox="0 0 100 34" preserveAspectRatio="none">
            <path d="M16.6,17 C28,3 38,3 50,17 S72,31 83.3,17" />
          </svg>

          <li v-for="(node, i) in pathway" :key="node.step" class="pathway-node">
            <div class="pathway-marker">
              <span class="pathway-index">{{ i + 1 }}</span>
              <svg v-if="node.icon === 'village'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.5L12 5l8 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 10v8.5a1 1 0 001 1h10a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M10 19.5v-5h4v5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="node.icon === 'link'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.5 14.5l5-5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
                <path d="M8 16.5l-1.8 1.8a3 3 0 01-4.3-4.3L4 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M16 7.5l1.8-1.8a3 3 0 014.3 4.3L20 12" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 21V6a1 1 0 011-1h6a1 1 0 011 1v15" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M13 11h5a1 1 0 011 1v9" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M8 9h0M8 12h0M8 15h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M16 15h0" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="pathway-step">{{ node.step }}</p>
            <p class="pathway-text">{{ node.text }}</p>
          </li>
        </ol>
      </div>
    </section>

    <!-- Story + CTA -->
    <section class="section-light">
      <div class="container">
        <div class="two-col-grid reverse">
          <div class="col-image">
            <div class="col-image-frame story-frame">
              <img src="/images/programs/child-protection3.jpg" alt="Child Protection Network volunteer speaking with a family" />
            </div>
          </div>
          <div class="col-text">
            <p class="section-eyebrow">A network at work</p>
            <div class="story-card">
              <span class="story-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <p class="story-text">
                "The network spotted my nephew before the broker took him. He is
                back in school this term."
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Closing CTA -->
    <section class="cta-split">
      <div class="container cta-split-inner">
        <div class="cta-split-text">
          <p class="cta-split-eyebrow">Get involved</p>
          <h2 class="cta-split-title">Ready to take the next step?</h2>
        </div>
        <router-link to="/get-involved" class="btn-primary btn-large">
          Support a network
          <span class="btn-arrow">→</span>
        </router-link>
      </div>
    </section>
  </div>
</template>

<style scoped>
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding);
}

/* ===== Hero ===== */
.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(6,18,13,0.85) 0%, rgba(6,18,13,0.55) 42%, rgba(6,18,13,0.22) 70%, transparent 100%);
}
.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 600px;
  color: white;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}
.eyebrow {
  color: var(--primary-light);
  font-weight: 600;
  letter-spacing: 0.08em;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}
.hero-content h1 {
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
  color: white;
}
.hero-desc {
  line-height: 1.6;
  opacity: 0.95;
}

/* ===== Trust bar ===== */
.trust-bar {
  background: var(--primary-dark);
  padding: 2.25rem 0;
}
.trust-bar-inner {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
}
.trust-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0 0.75rem;
}
.trust-divider {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.16);
}
.trust-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--primary-light);
}
.trust-icon svg { width: 20px; height: 20px; }
.trust-copy { min-width: 0; }
.trust-number {
  font-weight: 700;
  color: #ffffff;
  font-size: 1.35rem;
  line-height: 1.15;
  margin-bottom: 0.15rem;
}
.trust-label {
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--primary-light);
  font-size: 0.7rem;
  margin-bottom: 0.2rem;
}
.trust-desc {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.82rem;
  line-height: 1.4;
}

/* ===== Cream / light sections ===== */
.section-cream {
  background: var(--color-cream);
  padding: 4.5rem 0;
}
.section-light {
  background: #f2f5ee;
  padding: 4.5rem 0;
}
.intro-section { text-align: center; }
.intro-rule {
  width: 56px;
  height: 3px;
  border-radius: 999px;
  background: var(--primary-color);
  margin: 0 auto 1.75rem;
}
.intro-text {
  line-height: 1.75;
  color: var(--primary-dark);
  max-width: 760px;
  margin: 0 auto;
  font-size: 1.05rem;
}

.section-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.6rem;
}
.section-title {
  font-weight: 600;
  color: var(--primary-dark);
  margin-bottom: 1.5rem;
  letter-spacing: -0.01em;
}
.text-center { text-align: center; }

/* ===== Two-column layout ===== */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}
.two-col-grid.reverse .col-image { order: 1; }
.two-col-grid.reverse .col-text { order: 2; }
.col-image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 16px 36px -18px rgba(22, 52, 42, 0.3);
  transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s ease, border-color 0.35s ease;
}
.col-image-frame:hover,
.col-image-frame:active {
  transform: translateY(-8px);
  border-color: var(--primary-color);
  box-shadow: 0 28px 56px -18px rgba(22, 52, 42, 0.35);
}
.col-image-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.5s ease;
}
.col-image-frame:hover img,
.col-image-frame:active img {
  transform: scale(1.06);
}
.story-frame { min-height: 420px; }

/* Overlapping photo duo */
.photo-duo {
  position: relative;
  min-height: 380px;
}
.photo-duo-back {
  position: absolute;
  top: 0;
  left: 0;
  width: 62%;
  height: 300px;
  z-index: 1;
}
.photo-duo-front {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 55%;
  height: 220px;
  z-index: 2;
  box-shadow: 0 20px 44px -16px rgba(22, 52, 42, 0.4);
}

/* ===== What we do — check grid ===== */
.check-grid {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.check-grid li {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid rgba(22, 52, 42, 0.07);
  color: #333;
  line-height: 1.5;
  font-size: 0.92rem;
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}
.check-grid li:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 24px -14px rgba(22, 52, 42, 0.25);
  border-color: rgba(22, 52, 42, 0.14);
}
.check-icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #ffffff;
  border: 1.5px solid var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1px;
}
.check-icon svg { width: 11px; height: 11px; }

/* ===== Approach + referral pathway ===== */
.approach-text {
  line-height: 1.75;
  color: #333;
  max-width: 780px;
  margin: 0 auto 3rem;
  font-size: 1.02rem;
}
.pathway {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  position: relative;
  max-width: 920px;
  margin: 0 auto;
}
.pathway-node {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 0 1.5rem;
}

.pathway-wave {
  position: absolute;
  top: 10px;
  left: 0;
  width: 100%;
  height: 34px;
  z-index: 0;
  pointer-events: none;
}
.pathway-wave path {
  fill: none;
  stroke: var(--primary-color);
  stroke-width: 1.6;
  stroke-opacity: 0.55;
  stroke-dasharray: 4 5;
  stroke-linecap: round;
}

.pathway-marker {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--color-cream);
  border: 1.6px dotted var(--primary-color);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.25rem;
}
.pathway-marker svg {
  width: 26px;
  height: 26px;
}
.pathway-index {
  position: absolute;
  top: -8px;
  left: -6px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--color-cream);
  box-shadow: 0 0 0 2px var(--color-cream);
  color: var(--primary-dark);
  font-weight: 700;
  font-size: 0.72rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pathway-step {
  font-weight: 700;
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
  font-size: 0.98rem;
}
.pathway-text {
  color: #555;
  line-height: 1.55;
  font-size: 0.9rem;
  max-width: 240px;
  margin: 0 auto;
}

/* ===== Story card ===== */
.story-card {
  background: var(--primary-light);
  border-radius: 18px;
  padding: 1.75rem 2rem;
  margin-bottom: 2rem;
}
.story-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #ffffff;
  color: var(--primary-color);
  margin-bottom: 0.9rem;
  box-shadow: 0 4px 10px rgba(22, 52, 42, 0.12);
}
.story-badge svg { width: 17px; height: 17px; }
.story-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.15rem;
  color: var(--primary-dark);
  line-height: 1.6;
  margin: 0;
}
.cta-row { display: flex; }

/* ===== Buttons ===== */
.btn-primary {
  background: var(--primary-color);
  color: white;
  padding: 0.8rem 1.85rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
}
.btn-large {
  padding: 1rem 2.4rem;
  font-size: 1.02rem;
}
.btn-arrow {
  display: inline-block;
  transition: transform 0.25s ease;
}
.btn-primary:hover {
  background: var(--primary-dark);
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -8px rgba(22, 52, 42, 0.35);
}
.btn-primary:hover .btn-arrow {
  transform: translateX(4px);
}

/* ===== Closing split CTA ===== */
.cta-split {
  background: var(--primary-light);
}
.cta-split-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  flex-wrap: wrap;
  padding-top: 3rem;
  padding-bottom: 3rem;
}
.cta-split-eyebrow {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  font-size: 0.75rem;
  margin-bottom: 0.5rem;
}
.cta-split-title {
  color: var(--primary-dark);
  font-weight: 600;
  letter-spacing: -0.01em;
  margin: 0;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .pathway { grid-template-columns: 1fr; gap: 2.5rem; }
  .pathway-wave { display: none; }
  .pathway-text { max-width: none; }
}

@media (max-width: 768px) {
  .hero-content { padding: 2rem 1.5rem; }

  .trust-bar-inner { grid-template-columns: 1fr; gap: 1.25rem; }
  .trust-divider { display: none; }

  .two-col-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .two-col-grid.reverse .col-image { order: 0; }
  .two-col-grid.reverse .col-text { order: 1; }
  .photo-duo { min-height: 320px; }
  .story-frame { min-height: 300px; }

  .check-grid { grid-template-columns: 1fr; }

  .cta-split-inner { flex-direction: column; align-items: flex-start; text-align: left; }
}
</style>