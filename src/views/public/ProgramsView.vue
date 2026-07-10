<script setup lang="ts">
import Slideshow from '@/components/shared/Slideshow.vue'

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
      'Pre-schools in remote hamlets, community libraries, and youth scholarships that keep children learning past grade six..',
    whatWeDo:
      'Set up village pre-schools, train local teachers, stock small libraries, and support scholarships for at-risk children — especially girls.',
    whyItMatters:
      'In the districts we work in, many hamlets are more than an hour is walk from the nearest school. Early learning centres change that.',
    quote: 'Our library used to be a bag of ten books under the pagoda. Now the children come every afternoon.',
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
    quote: 'Before the savings group, I borrowed at 10% a month. Now I lend to my neighbours at zero.',
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
  'Strengthened governance and accountability',
  'Staff and volunteer development',
  'Income and funding diversification',
  'Research and knowledge management',
  'Public advocacy',
]

const slideItems = [
  { image: '/images/programs/education-hero.jpg', caption: '' },
  { image: '/images/programs/environment-hero.jpg', caption: '' },
  { image: '/images/programs/livelihood-hero1.jpg', caption: '' },
  { image: '/images/programs/child-protection.jpg', caption: '' },
]
</script>

<template>
  <div class="programs-page">
    <Slideshow :slides="slideItems">
      <div class="hero-overlay" />
      <div class="hero-content">
        <p class="eyebrow">OUR PROGRAMS</p>
        <h1>Four roots. One tree of peace.</h1>
        <p class="lead">
          Santi Sena's work follows four interwoven strategic goals — environment,
          education, livelihoods and child protection — each delivered with and by
          the communities themselves.
        </p>
      </div>
    </Slideshow>

    <!-- GOALS -->
    <section
      v-for="(goal, index) in goals"
      :key="goal.number"
      class="goal-block"
      :class="{ reverse: index % 2 === 1 }"
    >
      <div class="goal-media">
        <img :src="goal.image" :alt="goal.title" />
      </div>
      <div class="goal-text">
        <p class="tag">{{ goal.tag }}</p>
        <h2>{{ goal.title }}</h2>
        <p class="intro">{{ goal.intro }}</p>

        <h3>What we do</h3>
        <p>{{ goal.whatWeDo }}</p>

        <h3>Why it matters</h3>
        <p>{{ goal.whyItMatters }}</p>

        <blockquote>"{{ goal.quote }}"</blockquote>
      </div>
    </section>

    <!-- OPERATIONAL PRIORITIES -->
    <section class="priorities">
      <p class="eyebrow center">
        <span class="line" /> OPERATIONAL PRIORITIES <span class="line" />
      </p>
      <h2 class="center">How we keep the tree alive</h2>
      <div class="priorities-grid">
        <div v-for="item in priorities" :key="item" class="priority-card">
          {{ item }}
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

/* GOAL BLOCKS */
.goal-block {
  display: flex;
  align-items: center;
  gap: 3.5rem;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 5rem 3rem;
}
.goal-block.reverse {
  flex-direction: row-reverse;
}
.goal-media {
  flex: 1 1 45%;
}
.goal-media img {
  width: 100%;
  border-radius: 1rem;
  display: block;
  object-fit: cover;
  aspect-ratio: 4 / 3;
  background: #e5ddc8;
}
.goal-text {
  flex: 1 1 55%;
}
.goal-text .tag {
  color: var(--primary-color);
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.goal-text h2 {
  font-weight: 600;
  margin: 0 0 0.75rem;
}
.goal-text .intro {
  color: var(--color-ink-soft);
  margin-bottom: 1.5rem;
}
.goal-text h3 {
  font-weight: 600;
  margin: 1.25rem 0 0.35rem;
}
.goal-text p {
  color: var(--color-ink-soft);
  line-height: 1.7;
}
.goal-text blockquote {
  margin: 1.5rem 0 0;
  padding-left: 1rem;
  border-left: 3px solid var(--primary-color);
  font-style: italic;
  color: var(--primary-dark);
}

/* PRIORITIES */
.priorities {
  padding: 5rem 3rem 6rem;
  text-align: center;
}
.eyebrow.center {
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
  font-weight: 600;
  margin: 0.5rem 0 2.5rem;
}
.priorities-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
}
.priority-card {
  background: var(--color-white);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 220px;
  color: var(--primary-dark);
  box-shadow: 0 2px 10px rgba(20, 129, 62, 0.06);
}

@media (max-width: 860px) {
  .goal-block,
  .goal-block.reverse {
    flex-direction: column;
  }
}
</style>
