<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import Slideshow from '@/components/shared/Slideshow.vue'

const slideItems = [
  { image: '/images/programs/child-protection.jpg', caption: '' },
  { image: '/images/programs/child-protection1.jpg', caption: '' },
  { image: '/images/programs/child-protection2.jpg', caption: '' },
  { image: '/images/programs/child-protection3.jpg', caption: '' },
]

const stats = [
  {
    number: '43',
    label: 'COMMUNES',
    description: 'With active Child Protection Networks.',
    icon: 'pin',
  },
  {
    number: '600+',
    label: 'PEER EDUCATORS',
    description: 'Youth trained in child rights and safeguarding.',
    icon: 'users',
  },
  {
    number: '24/7',
    label: 'VILLAGE HOTLINES',
    description: 'Case referral into commune and provincial authorities.',
    icon: 'phone',
  },
]

// "What we do" — each item keeps its full original sentence in `text`;
// `title` is just a short label pulled from that same sentence for the wheel display.
const whatWeDo = [
  {
    title: 'Anti-Trafficking Campaigns',
    text: 'Anti-child-trafficking campaigns at borders, markets and schools',
    icon: 'megaphone',
    color: '#0a7d5c',
    image: '/images/programs/child-protection.jpg',
  },
  {
    title: 'Child Protection Networks',
    text: 'Village Child Protection Networks (CPN) trained in identification and referral',
    icon: 'shield',
    color: '#2c7be5',
    image: '/images/programs/child-protection1.jpg',
  },
  {
    title: 'Child Rights Advocacy',
    text: 'Child rights advocacy with commune councils and provincial authorities',
    icon: 'scale',
    color: '#e8871e',
    image: '/images/programs/child-protection2.jpg',
  },
  {
    title: 'Peer Educators',
    text: 'Peer-educator youth groups on safe migration, health and rights',
    icon: 'users',
    color: '#8b5cf6',
    image: '/images/programs/child-protection3.jpg',
  },
  {
    title: 'Family Reintegration',
    text: 'Family reintegration support for children returning from unsafe labour',
    icon: 'home',
    color: '#e0475a',
    image: '/images/programs/child-protection.jpg',
  },
  {
    title: 'Safeguarding Training',
    text: 'Safeguarding training for every teacher, monk and volunteer we work with',
    icon: 'book',
    color: '#c9a227',
    image: '/images/programs/child-protection1.jpg',
  },
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

const wheelEl = ref<HTMLElement | null>(null)
let wheelObserver: IntersectionObserver | undefined

const pathwayEl = ref<HTMLElement | null>(null)
let pathwayObserver: IntersectionObserver | undefined

onMounted(() => {
  if (wheelEl.value) {
    wheelObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
            wheelObserver?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.2 }
    )
    wheelObserver.observe(wheelEl.value)
  }

  if (!pathwayEl.value) return
  pathwayObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view')
          pathwayObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.25 }
  )
  pathwayObserver.observe(pathwayEl.value)
})

onBeforeUnmount(() => {
  wheelObserver?.disconnect()
  pathwayObserver?.disconnect()
})
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
              <svg
                v-if="stat.icon === 'pin'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21s-7-6.2-7-11.5A7 7 0 0112 2a7 7 0 017 7.5C19 14.8 12 21 12 21z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
                <circle cx="12" cy="9.5" r="2.4" stroke="currentColor" stroke-width="1.6" />
              </svg>
              <svg
                v-else-if="stat.icon === 'users'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="9" cy="8" r="3.2" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
                <circle cx="17" cy="9" r="2.4" stroke="currentColor" stroke-width="1.6" />
                <path
                  d="M15 20c0-2.6 2-4.6 5-4.6"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linecap="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 005 5l1.5-2 4 1.5v3a1.5 1.5 0 01-1.6 1.5A16.5 16.5 0 015 5.1 1.5 1.5 0 016.5 3.5z"
                  stroke="currentColor"
                  stroke-width="1.6"
                  stroke-linejoin="round"
                />
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
          Cross-border migration, poverty and family separation put rural Cambodian children at risk
          of unsafe labour and trafficking. Santi Sena works with villages, schools and pagodas to
          build the safety net closest to the child — before anything goes wrong.
        </p>
      </div>
    </section>

    <!-- What we do — wheel of items radiating around a center hub -->
    <section class="section-light">
      <div class="container">
        <div class="do-section">
          <p class="section-eyebrow text-center">Our work</p>
          <h2 class="section-title text-center">What we do</h2>

          <div class="wheel-wrap" ref="wheelEl">
            <div class="wheel-center">
              <span class="wheel-center-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 18h6M10 21h4M12 3a6 6 0 00-3.6 10.8c.6.45 1.1 1.2 1.1 2.2h5c0-1 .5-1.75 1.1-2.2A6 6 0 0012 3z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>
                </svg>
              </span>
              <p class="wheel-center-title">Child<br />Protection</p>
            </div>

            <div
              v-for="(item, i) in whatWeDo"
              :key="item.title"
              class="wheel-item"
              :class="`wheel-item--${i + 1}`"
            >
              <div class="wheel-photo">
                <img :src="item.image" alt="" />
              </div>
              <span class="wheel-icon" :style="{ background: item.color }">
                <svg v-if="item.icon === 'megaphone'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 11v2a2 2 0 002 2h1l2 5h2l-1.5-5H10l8 4V6l-8 4H8l-2-3H5a2 2 0 00-2 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="item.icon === 'shield'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3l7 3v5c0 5-3.4 8.5-7 10-3.6-1.5-7-5-7-10V6l7-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M9.3 12.2l1.9 1.9 3.5-3.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="item.icon === 'scale'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 3v18M7 21h10M5 7l3.5-1.5L12 7M19 7l-3.5-1.5L12 7M3 7l2 5.5a2.3 2.3 0 004 0L11 7M13 7l2 5.5a2.3 2.3 0 004 0L21 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <svg v-else-if="item.icon === 'users'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3.5 20c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <circle cx="17" cy="9" r="2.2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M15.5 20c0-2.4 1.9-4.4 4.5-4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
                <svg v-else-if="item.icon === 'home'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 11.5L12 5l8 6.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M6 10v8.5a1 1 0 001 1h10a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M12 18c-1.8-1.5-3-2.6-3-4a1.7 1.7 0 013-1 1.7 1.7 0 013 1c0 1.4-1.2 2.5-3 4z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/>
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 5.5A1.5 1.5 0 015.5 4H12v16H5.5A1.5 1.5 0 014 18.5v-13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M20 5.5A1.5 1.5 0 0018.5 4H12v16h6.5a1.5 1.5 0 001.5-1.5v-13z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M7 8h3M7 11h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                </svg>
              </span>
              <p class="wheel-title" :style="{ color: item.color }">{{ item.title }}</p>
              <p class="wheel-text">{{ item.text }}</p>
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
          Every network is anchored by the people children already trust — mothers, monks, teachers,
          commune council members. We train, coach and connect them to formal referral pathways so a
          case identified in a village at dawn reaches the provincial social affairs office by dusk.
        </p>

        <ol class="pathway" ref="pathwayEl">
          <svg class="pathway-wave" viewBox="0 0 100 220" preserveAspectRatio="none">
            <path class="pathway-curve" d="M16.6,132 C33,132 33,62 50,62 C67,62 67,132 83.3,132" />
          </svg>

          <li v-for="(node, i) in pathway" :key="node.step" class="pathway-node" :class="{ 'pathway-node-raised': i === 1 }">
            <span class="pathway-bignum">{{ String(i + 1).padStart(2, '0') }}</span>
            <div class="pathway-marker">
              <svg v-if="node.icon === 'village'" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 11.5L12 5l8 6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 10v8.5a1 1 0 001 1h10a1 1 0 001-1V10" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
                <path d="M10 19.5v-5h4v5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
              </svg>
              <svg
                v-else-if="node.icon === 'link'"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.5 14.5l5-5"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                />
                <path
                  d="M8 16.5l-1.8 1.8a3 3 0 01-4.3-4.3L4 12"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
                <path
                  d="M16 7.5l1.8-1.8a3 3 0 014.3 4.3L20 12"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 21V6a1 1 0 011-1h6a1 1 0 011 1v15"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
                <path
                  d="M13 11h5a1 1 0 011 1v9"
                  stroke="currentColor"
                  stroke-width="1.7"
                  stroke-linejoin="round"
                />
                <path
                  d="M8 9h0M8 12h0M8 15h0"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                />
                <path d="M16 15h0" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
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
              <img
                src="/images/programs/child-protection3.jpg"
                alt="Child Protection Network volunteer speaking with a family"
              />
            </div>
          </div>
          <div class="col-text">
            <p class="section-eyebrow">A network at work</p>
            <div class="story-card">
              <span class="story-badge">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M12 2l8 3v6c0 5-3.5 8.5-8 11-4.5-2.5-8-6-8-11V5l8-3z"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    stroke-width="1.8"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </span>
              <p class="story-text">
                "The network spotted my nephew before the broker took him. He is back in school this
                term."
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
  background: linear-gradient(
    90deg,
    rgba(6, 18, 13, 0.85) 0%,
    rgba(6, 18, 13, 0.55) 42%,
    rgba(6, 18, 13, 0.22) 70%,
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
  text-align: left;
  max-width: 600px;
  color: white;
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
.trust-icon svg {
  width: 20px;
  height: 20px;
}
.trust-copy {
  min-width: 0;
}
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
.intro-section {
  text-align: center;
}
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
.text-center {
  text-align: center;
}

/* ===== Two-column layout ===== */
.two-col-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3.5rem;
  align-items: center;
}
.two-col-grid.reverse .col-image {
  order: 1;
}
.two-col-grid.reverse .col-text {
  order: 2;
}
.col-image-frame {
  position: relative;
  border-radius: 20px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 16px 36px -18px rgba(22, 52, 42, 0.3);
  transition:
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.35s ease,
    border-color 0.35s ease;
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
.story-frame {
  min-height: 420px;
}

/* ===== What we do — wheel around a center hub ===== */
.do-section {
  max-width: var(--container-max-width);
  margin: 0 auto;
}

.wheel-wrap {
  position: relative;
  max-width: 900px;
  height: 860px;
  margin: 3.5rem auto 0;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 2;
  width: 168px;
  height: 168px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 16px 36px -14px rgba(22, 52, 42, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 1rem;
}
.wheel-center-icon {
  width: 34px;
  height: 34px;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
}
.wheel-center-icon svg { width: 100%; height: 100%; }
.wheel-center-title {
  font-weight: 700;
  color: var(--primary-dark);
  font-size: 0.95rem;
  line-height: 1.3;
  margin: 0;
}

.wheel-item {
  position: absolute;
  width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
}
/* 6 items placed evenly (60° apart) around the center hub, clockwise from the top */
.wheel-item--1 { top: calc(50% - 320px); left: 50%; transform: translate(-50%, -50%); }
.wheel-item--2 { top: calc(50% - 160px); left: calc(50% + 277px); transform: translate(-50%, -50%); }
.wheel-item--3 { top: calc(50% + 160px); left: calc(50% + 277px); transform: translate(-50%, -50%); }
.wheel-item--4 { top: calc(50% + 320px); left: 50%; transform: translate(-50%, -50%); }
.wheel-item--5 { top: calc(50% + 160px); left: calc(50% - 277px); transform: translate(-50%, -50%); }
.wheel-item--6 { top: calc(50% - 160px); left: calc(50% - 277px); transform: translate(-50%, -50%); }

.wheel-photo {
  width: 200px;
  height: 150px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 8px 18px -8px rgba(22, 52, 42, 0.3);
}
.wheel-photo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.wheel-icon {
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -19px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
}
.wheel-icon svg { width: 18px; height: 18px; }
.wheel-title {
  font-weight: 700;
  font-size: 0.92rem;
  margin: 0.2rem 0 0;
}
.wheel-text {
  color: #6b7280;
  font-size: 0.8rem;
  line-height: 1.5;
  margin: 0;
}

/* Scroll-in reveal */
.wheel-center,
.wheel-item {
  opacity: 0;
  transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.wheel-wrap.in-view .wheel-center {
  opacity: 1;
}
.wheel-item {
  transform: translate(-50%, calc(-50% + 20px)) scale(0.9);
}
.wheel-wrap.in-view .wheel-item {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}
.wheel-wrap.in-view .wheel-item--1 { transition-delay: 0.1s; }
.wheel-wrap.in-view .wheel-item--2 { transition-delay: 0.2s; }
.wheel-wrap.in-view .wheel-item--3 { transition-delay: 0.3s; }
.wheel-wrap.in-view .wheel-item--4 { transition-delay: 0.4s; }
.wheel-wrap.in-view .wheel-item--5 { transition-delay: 0.5s; }
.wheel-wrap.in-view .wheel-item--6 { transition-delay: 0.6s; }

@media (max-width: 900px) {
  .wheel-wrap {
    height: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
  }
  .wheel-center,
  .wheel-item {
    position: static;
    transform: none !important;
  }
  .wheel-icon {
    margin-top: -19px;
  }
}

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
  padding: 100px 0 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: start;
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
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.pathway.in-view .pathway-node {
  opacity: 1;
  transform: translateY(0);
}
.pathway.in-view .pathway-node:nth-of-type(1) { transition-delay: 0s; }
.pathway.in-view .pathway-node:nth-of-type(2) { transition-delay: 0.2s; }
.pathway.in-view .pathway-node:nth-of-type(3) { transition-delay: 0.4s; }
.pathway-node-raised {
  margin-top: -70px;
}

.pathway-wave {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 220px;
  z-index: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.8s ease 0.55s;
}
.pathway.in-view .pathway-wave {
  opacity: 1;
}
.pathway-curve {
  fill: none;
  stroke: var(--primary-color);
  stroke-opacity: 0.35;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.pathway-bignum {
  position: absolute;
  top: -46px;
  left: 50%;
  transform: translateX(-58%);
  font-size: 3.2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--primary-color);
  opacity: 0.15;
  line-height: 1;
  z-index: -1;
  pointer-events: none;
}

.pathway-marker {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 8px 20px -8px rgba(22, 52, 42, 0.35);
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
.story-badge svg {
  width: 17px;
  height: 17px;
}
.story-text {
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-size: 1.15rem;
  color: var(--primary-dark);
  line-height: 1.6;
  margin: 0;
}
.cta-row {
  display: flex;
}

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
  transition:
    background 0.25s ease,
    transform 0.25s ease,
    box-shadow 0.25s ease;
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
  .pathway { grid-template-columns: 1fr; gap: 2.5rem; padding-top: 2.5rem; }
  .pathway-wave { display: none; }
  .pathway-node-raised { margin-top: 0; }
  .pathway-bignum { position: static; display: block; transform: none; margin-bottom: 0.5rem; }
  .pathway-text { max-width: none; }
}

@media (max-width: 768px) {
  .hero-content {
    padding: 2rem 1.5rem;
  }

  .trust-bar-inner {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .trust-divider {
    display: none;
  }

  .two-col-grid { grid-template-columns: 1fr; gap: 2.5rem; }
  .two-col-grid.reverse .col-image { order: 0; }
  .two-col-grid.reverse .col-text { order: 1; }
  .story-frame { min-height: 300px; }

  .cta-split-inner { flex-direction: column; align-items: flex-start; text-align: left; }
}
</style>
