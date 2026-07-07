<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

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

// --- Hero slideshow ---
// Add more files (slide-2.jpg, slide-3.jpg, ...) into public/images/programs/hero/
// and list them here. It still works fine with just one image.
const heroSlides = [
  '/images/programs/hero-1.jpg',
  '/images/programs/hero-2.jpg',
  '/images/programs/hero-3.jpg',
  '/images/programs/hero-4.jpg',
]

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval> | undefined

onMounted(() => {
  if (heroSlides.length > 1) {
    slideTimer = setInterval(() => {
      currentSlide.value = (currentSlide.value + 1) % heroSlides.length
    }, 5000)
  }
})
onUnmounted(() => {
  if (slideTimer) clearInterval(slideTimer)
})
</script>

<template>
  <div class="programs-page">
    <!-- HERO SLIDESHOW -->
    <section class="hero">
      <div class="hero-slides">
        <div
          v-for="(slide, i) in heroSlides"
          :key="slide"
          class="hero-slide"
          :class="{ active: i === currentSlide }"
          :style="{ backgroundImage: `url('${slide}')` }"
        />
        <div class="hero-overlay" />
      </div>
      <div class="hero-content">
        <p class="eyebrow">OUR PROGRAMS</p>
        <h1>Four roots. One tree of peace.</h1>
        <p class="lead">
          Santi Sena's work follows four interwoven strategic goals — environment, 
          education, livelihoods and child protection — each delivered with and by 
          the communities themselves.
        </p>
      </div>
    </section>

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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500&family=Inter:wght@400;500;600&display=swap');

.programs-page {
  --p-bg: #f7f1e4;
  --p-panel: #fffdf8;
  --p-green: #1f3d2e;
  --p-orange: #d9793a;
  --p-muted: #5a6b5f;
  --font-heading: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', ui-sans-serif, system-ui, sans-serif;

  background: var(--p-bg);
  color: var(--p-green);
  font-family: var(--font-body);
}

.programs-page h1,
.programs-page h2,
.programs-page h3 {
  font-family: var(--font-heading);
}
.programs-page p,
.programs-page blockquote,
.programs-page .priority-card,
.programs-page .tag,
.programs-page .eyebrow {
  font-family: var(--font-body);
}

/* HERO */
.hero {
  position: relative;
  min-height: 560px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.hero-slides {
  position: absolute;
  inset: 0;
}
.hero-slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
}
.hero-slide.active {
  opacity: 1;
}
.hero-overlay {
  position: absolute;
  inset: 0;
  /* dull olive/forest-green tint over the photo, like the reference design */
  background: linear-gradient(
    180deg,
    rgba(38, 61, 43, 0.65) 0%,
    rgba(38, 61, 43, 0.45) 55%,
    rgba(38, 61, 43, 0.6) 100%
  );
  mix-blend-mode: multiply;
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 700px;
  padding: 0 3rem;
  color: #fff;
}
.eyebrow {
  color: var(--p-orange);
  letter-spacing: 0.15em;
  font-size: 0.8rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
}
.hero-content h1 {
  font-weight: 600;
  font-size: 3rem;
  line-height: 1.2;
  margin: 0 0 1rem;
  
}
.hero-content .lead {
  font-size: 1.05rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.92);
}

/* GOAL BLOCKS */
.goal-block {
  display: flex;
  align-items: center;
  gap: 3.5rem;
  max-width: 1200px;
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
  color: var(--p-orange);
  font-weight: 700;
  letter-spacing: 0.05em;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}
.goal-text h2 {
  font-weight: 600;
  font-size: 2rem;
  margin: 0 0 0.75rem;
}
.goal-text .intro {
  font-size: 1.05rem;
  color: var(--p-muted);
  margin-bottom: 1.5rem;
}
.goal-text h3 {
  font-weight: 600;
  font-size: 1.1rem;
  margin: 1.25rem 0 0.35rem;
}
.goal-text p {
  color: var(--p-muted);
  line-height: 1.7;
}
.goal-text blockquote {
  margin: 1.5rem 0 0;
  padding-left: 1rem;
  border-left: 3px solid var(--p-orange);
  font-style: italic;
  color: var(--p-green);
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
}
.eyebrow .line {
  width: 2rem;
  height: 1px;
  background: var(--p-orange);
  display: inline-block;
}
.priorities h2 {
  font-weight: 600;
  font-size: 2rem;
  margin: 0.5rem 0 2.5rem;
}
.priorities-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.25rem;
}
.priority-card {
  background: var(--p-panel);
  border-radius: 0.75rem;
  padding: 1.5rem;
  max-width: 220px;
  color: var(--p-green);
  box-shadow: 0 2px 10px rgba(31, 61, 46, 0.06);
}

@media (max-width: 860px) {
  .goal-block,
  .goal-block.reverse {
    flex-direction: column;
  }
  .hero-content h1 {
    font-size: 2.2rem;
  }
}
</style>