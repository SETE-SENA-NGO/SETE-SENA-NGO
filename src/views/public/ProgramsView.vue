<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, type ComponentPublicInstance } from 'vue'

interface ProgramGoal {
  number: string
  tag: string
  title: string
  intro: string
  whatWeDo: string
  whyItMatters: string
  quote: string
  image: string
}

const goals: ProgramGoal[] = [
  {
    number: '01',
    tag: 'GOAL 01',
    title: 'Environment',
    intro:
      'Community forestry, biogas digesters, rainwater harvesting and WASH — climate resilience built one household at a time.',
    whatWeDo:
      'Facilitate community forest agreements, install biogas systems, dig wells and support smallholder tree nurseries.',
    whyItMatters:
      'Southeastern Cambodia is one of the most climate-vulnerable regions in the country. Healthy forests and clean water are peacekeeping infrastructure.',
    quote: 'The forest belongs to the pagoda and the pagoda belongs to the village.',
    image: '/images/programs/environment.jpg',
  },
  {
    number: '02',
    tag: 'GOAL 02',
    title: 'Education',
    intro:
      "Pre-schools in remote hamlets, community libraries, and youth scholarships that keep children learning past grade six.",
    whatWeDo:
      'Set up village pre-schools, train local teachers, stock small libraries, and support scholarships for at-risk children — especially girls.',
    whyItMatters:
      'In the districts we work in, many hamlets are more than an hour is walk from the nearest school. Early learning centres change that.',
    quote:
      'Our library used to be a bag of ten books under the pagoda. Now the children come every afternoon.',
    image: '/images/programs/education.jpg',
  },
  {
    number: '03',
    tag: 'GOAL 03',
    title: 'Livelihood',
    intro:
      'Saving-for-Change groups, women-led cooperatives, and rural enterprises that keep families out of debt.',
    whatWeDo:
      'Train Saving-for-Change facilitators, seed household enterprises and link cooperatives to fair-price buyers.',
    whyItMatters:
      'Cash predictability is what lets a family send their child to school this term instead of to a garment factory.',
    quote:
      'Before the savings group, I borrowed at 10% a month. Now I lend to my neighbours at zero.',
    image: '/images/programs/livelihood.jpg',
  },
  {
    number: '04',
    tag: 'GOAL 04',
    title: 'Child Protection',
    intro:
      'Village-level Child Protection Networks, anti-trafficking outreach, and safe-migration training for youth.',
    whatWeDo:
      'Set up Child Protection Networks, train monks and elders as safeguarding leads, and run safe-migration workshops for young people.',
    whyItMatters:
      'The border with Vietnam brings both opportunity and risk. Community-led safeguarding is the most durable defense.',
    quote: "The safest village is one where every adult knows every child's name.",
    image: '/images/programs/child-protection.jpg',
  },
]

const priorities = [
  {
    title: 'Strengthened governance and accountability',
    icon: 'shield',
  },
  {
    title: 'Staff and volunteer development',
    icon: 'users',
  },
  {
    title: 'Income and funding diversification',
    icon: 'sprout',
  },
  {
    title: 'Research and knowledge management',
    icon: 'book',
  },
  {
    title: 'Public advocacy',
    icon: 'megaphone',
  },
]

// Font Awesome icon names for each priority card (used with <font-awesome-icon :icon="..." />)
const priorityIcons: Record<string, string> = {
  shield: 'shield-halved',
  users: 'users',
  sprout: 'seedling',
  book: 'book',
  megaphone: 'bullhorn',
}

// Scroll-triggered reveal: each goal card (and the priorities grid) animates in once visible
const cardRefs = ref<HTMLElement[]>([])
const priorityWaveRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function setCardRef(el: unknown | null, index: number) {
  if (el && el instanceof Element) {
    cardRefs.value[index] = el as HTMLElement
  }
}

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -10% 0px' },
  )

  cardRefs.value.forEach((el) => el && observer?.observe(el))
  if (priorityWaveRef.value) observer.observe(priorityWaveRef.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
})
</script>

<template>
  <div class="programs-page">

    <!-- GOALS -->
    <section class="goals-wrap">
      <article
        v-for="(goal, index) in goals"
        :key="goal.number"
        :ref="(el) => setCardRef(el, index)"
        class="goal-card"
        :class="{ reverse: index % 2 === 1 }"
      >
        <div class="goal-media" :style="{ backgroundImage: `url(${goal.image})` }" />
        <div class="goal-overlay" />

        <div class="goal-content">
          <p class="tag">{{ goal.tag }}</p>
          <h2>{{ goal.title }}</h2>
          <p class="intro">{{ goal.intro }}</p>

          <div class="goal-detail">
            <h3>What we do</h3>
            <p>{{ goal.whatWeDo }}</p>
          </div>

          <div class="goal-detail">
            <h3>Why it matters</h3>
            <p>{{ goal.whyItMatters }}</p>
          </div>

          <blockquote>"{{ goal.quote }}"</blockquote>
        </div>
      </article>
    </section>

    <!-- OPERATIONAL PRIORITIES -->
    <section class="priorities">
      <p class="eyebrow center">
        <span class="line" /> OPERATIONAL PRIORITIES <span class="line" />
      </p>
      <h2 class="center">How we keep the tree alive</h2>

      <div ref="priorityWaveRef" class="priorities-grid">
        <div
          v-for="(item, idx) in priorities"
          :key="item.title"
          class="priority-card"
          :style="{ transitionDelay: idx * 90 + 'ms' }"
        >
          <div class="priority-step">
            <span class="step-number">{{ String(idx + 1).padStart(2, '0') }}</span>
            <span class="step-connector" />
          </div>

          <div class="priority-body">
            <div class="priority-icon">
              <font-awesome-icon :icon="priorityIcons[item.icon]" />
            </div>
            <p class="priority-label">{{ item.title }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.programs-page {
  background: var(--color-cream);
  color: var(--primary-dark);
}

/* HERO */
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
  max-width: 700px;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  color: #fff;
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
  letter-spacing: 0.15em;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.hero-content h1 {
  font-weight: 600;
  line-height: 1.2;
  margin: 0 0 1rem;
  color: #fff;
}
.hero-content .lead {
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
}

/* GOAL CARDS — content sits inside the photo */
.goals-wrap {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.goal-card {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 560px;
  border-radius: 1.25rem;
  overflow: hidden;
  background-color: #e5ddc8; /* fallback while image loads */

  /* scroll-reveal: card fades/rises in, image is clipped by overflow:hidden above */
  opacity: 0;
  transform: translateY(56px);
  transition:
    opacity 0.9s cubic-bezier(0.16, 1, 0.3, 1),
    transform 0.9s cubic-bezier(0.16, 1, 0.3, 1);
}
.goal-card.is-visible {
  opacity: 1;
  transform: translateY(0);
}

.goal-media {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  transform: scale(1.14);
  transition: transform 1.5s cubic-bezier(0.16, 1, 0.3, 1);
}
.goal-card.is-visible .goal-media {
  transform: scale(1);
}

.goal-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    rgba(15, 61, 42, 0.9) 0%,
    rgba(15, 61, 42, 0.72) 38%,
    rgba(15, 61, 42, 0.25) 68%,
    rgba(15, 61, 42, 0) 100%
  );
}

.goal-card.reverse {
  justify-content: flex-end;
}
.goal-card.reverse .goal-overlay {
  background: linear-gradient(
    270deg,
    rgba(15, 61, 42, 0.9) 0%,
    rgba(15, 61, 42, 0.72) 38%,
    rgba(15, 61, 42, 0.25) 68%,
    rgba(15, 61, 42, 0) 100%
  );
}

.goal-content {
  position: relative;
  z-index: 1;
  max-width: 560px;
  padding: 3rem 3.5rem;
  color: #fff;

  /* text settles in just after the image starts revealing */
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.7s ease 0.25s,
    transform 0.7s ease 0.25s;
}
.goal-card.is-visible .goal-content {
  opacity: 1;
  transform: translateY(0);
}

.goal-content .tag {
  color: var(--primary-light);
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.goal-content h2 {
  font-weight: 600;
  margin: 0 0 0.75rem;
  color: #fff;
}
.goal-content .intro {
  color: rgba(255, 255, 255, 0.88);
  margin-bottom: 1.5rem;
  line-height: 1.7;
}
.goal-detail {
  margin-bottom: 1.1rem;
}
.goal-content h3 {
  font-weight: 600;
  margin: 0 0 0.3rem;
  color: #fff;
  font-size: 1rem;
}
.goal-content .goal-detail p {
  color: rgba(255, 255, 255, 0.78);
  line-height: 1.7;
  margin: 0;
}
.goal-content blockquote {
  margin: 1.5rem 0 0;
  padding-left: 1rem;
  border-left: 3px solid var(--primary-light);
  font-style: italic;
  color: #fff;
}

/* ===== PRIORITIES — clean, professional stepper with cards ===== */
.priorities {
  position: relative;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 5rem 3rem 6rem;
  text-align: center;
  overflow: hidden;
}
/* Soft ambient glow behind the whole section for depth */
.priorities::before {
  content: '';
  position: absolute;
  top: -10%;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 500px;
  background: radial-gradient(ellipse at center, rgba(20, 129, 62, 0.07) 0%, rgba(20, 129, 62, 0) 70%);
  pointer-events: none;
  z-index: 0;
}
.eyebrow.center {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--primary-color);
}
.eyebrow .line {
  width: 2rem;
  height: 1px;
  background: var(--primary-color);
  display: inline-block;
}
.priorities h2 {
  position: relative;
  z-index: 1;
  font-weight: 600;
  margin: 0.5rem 0 3.5rem;
}

/* Straight, evenly-spaced stepper row instead of the zigzag wave */
.priorities-grid {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 1.75rem;
  align-items: start;
}

.priority-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 0.6s ease,
    transform 0.6s ease;
}
.priorities-grid.is-visible .priority-card {
  opacity: 1;
  transform: translateY(0);
}

/* Numbered node + connecting line */
.priority-step {
  position: relative;
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
}
.step-number {
  position: relative;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow: 0 6px 14px -4px rgba(20, 129, 62, 0.5);
}
.step-connector {
  position: absolute;
  top: 50%;
  left: 50%;
  width: calc(100% + 1.75rem);
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
  opacity: 0.35;
  transform: translateY(-50%);
  z-index: 1;
}
.priority-card:last-child .step-connector {
  display: none;
}

/* Card body */
.priority-body {
  width: 100%;
  background: var(--color-white);
  border-radius: 18px;
  border: 1px solid rgba(20, 129, 62, 0.1);
  padding: 1.85rem 1.1rem 1.5rem;
  box-shadow:
    0 4px 10px rgba(20, 129, 62, 0.06),
    0 16px 32px -14px rgba(20, 129, 62, 0.18);
  transition:
    transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
.priority-card:hover .priority-body {
  transform: translateY(-6px);
  border-color: rgba(20, 129, 62, 0.28);
  box-shadow:
    0 6px 14px rgba(20, 129, 62, 0.1),
    0 24px 44px -16px rgba(20, 129, 62, 0.3);
}

.priority-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: linear-gradient(160deg, var(--color-white) 0%, rgba(20, 129, 62, 0.08) 100%);
  border: 1.5px solid rgba(20, 129, 62, 0.16);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.6),
    0 8px 18px -8px rgba(20, 129, 62, 0.35);
  color: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
}
.priority-card:hover .priority-icon {
  transform: scale(1.08);
  border-color: var(--primary-color);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 10px 22px -8px rgba(20, 129, 62, 0.5);
}
.priority-icon :deep(.svg-inline--fa) {
  width: 24px;
  height: 24px;
}
.priority-label {
  margin: 0;
  font-weight: 400;
  color: #6b7280;
  line-height: 1.45;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}
.priority-card:hover .priority-label {
  color: #6b7280;
}

@media (max-width: 860px) {
  .goals-wrap {
    padding: 3rem 1.25rem;
  }
  .goal-card {
    min-height: 480px;
    justify-content: flex-start;
  }
  .goal-content {
    max-width: 100%;
    padding: 2rem 1.5rem;
  }
  .priorities {
    padding: 3.5rem 1.25rem 4rem;
  }

  .priorities-grid {
    grid-template-columns: 1fr;
    gap: 1.1rem;
  }
  .priority-card {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }
  .priority-step {
    width: auto;
    height: auto;
    margin-bottom: 0;
  }
  .step-connector {
    display: none;
  }
  .priority-body {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem 1.1rem;
  }
  .priority-icon {
    margin: 0;
    flex-shrink: 0;
  }
  .priority-label {
    text-align: left;
  }
  .hero-arrow {
    width: 36px;
    height: 36px;
    font-size: 1.5rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .goal-card,
  .goal-media,
  .goal-content,
  .priority-card {
    transition: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>