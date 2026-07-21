<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import Slideshow from '@/components/shared/Slideshow.vue'

import { supabase } from '@/lib/supabase'

interface NgoSlide {
  image: string
  caption: string
  alt: string
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
  position?: string
}

const slides = ref<NgoSlide[]>([])

function safeJsonParse<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

function normalizeSlide(raw: unknown): NgoSlide | null {
  const r = raw as Record<string, unknown> | null
  if (!r || typeof raw !== 'object') return null

  const image = typeof r.image === 'string' ? r.image : ''
  if (!image) return null

  return {
    image,
    caption: typeof r.caption === 'string' ? r.caption : '',
    alt: typeof r.alt === 'string' ? r.alt : image,
    eyebrow: typeof r.eyebrow === 'string' ? r.eyebrow : '',
    title: typeof r.title === 'string' ? r.title : '',
    description: typeof r.description === 'string' ? r.description : '',
    primaryLabel: typeof r.primaryLabel === 'string' ? r.primaryLabel : '',
    primaryTo: typeof r.primaryTo === 'string' ? r.primaryTo : '',
    secondaryLabel: typeof r.secondaryLabel === 'string' ? r.secondaryLabel : '',
    secondaryTo: typeof r.secondaryTo === 'string' ? r.secondaryTo : '',
    position: typeof r.position === 'string' ? r.position : undefined,
  }
}

async function loadHomeSlideshow() {
  // Default fallback slides (same structure as HomeView)
  const defaultSlides: NgoSlide[] = [
    {
      image: '/images/programs/education-hero.jpg',
      caption: '',
      alt: 'Children learning with Santi Sena education support',
      eyebrow: 'Education and Buddhist learning',
      title: 'Helping children learn with confidence.',
      description:
        'Santi Sena supports schools, mobile libraries, scholarships and Buddhist education so children can keep learning close to home.',
      primaryLabel: 'Support education',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Explore programs',
      secondaryTo: '/programs',
      position: 'center',
    },
    {
      image: '/images/programs/environment.jpg',
      caption: '',
      alt: 'Community environmental activity in rural Cambodia',
      eyebrow: 'Environment and climate action',
      title: 'Protecting the land that sustains villages.',
      description:
        'Community forestry, tree nurseries, WASH and climate adaptation help families care for the natural resources around them.',
      primaryLabel: 'Support the work',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Environment program',
      secondaryTo: '/programs/environment',
      position: 'center',
    },
    {
      image: '/images/programs/livelihood-hero2.jpg',
      caption: '',
      alt: 'Rural livelihood activity with community members',
      eyebrow: 'Livelihoods and family resilience',
      title: 'Growing practical income and food security.',
      description:
        'Savings groups, home gardens, cooperatives and farmer support help rural families build steadier livelihoods.',
      primaryLabel: 'Get involved',
      primaryTo: '/get-involved',
      secondaryLabel: 'Livelihood program',
      secondaryTo: '/programs/livelihood',
      position: 'center',
    },
    {
      image: '/images/programs/child-protection1.jpg',
      caption: '',
      alt: 'Children and community members participating in a protection activity',
      eyebrow: 'Child protection and dignity',
      title: 'Safeguarding children through local action.',
      description:
        'Child rights campaigns, youth peer groups and community networks help children grow in safer, more caring communities.',
      primaryLabel: 'Stand with us',
      primaryTo: '/get-involved',
      secondaryLabel: 'Protection program',
      secondaryTo: '/programs/child-protection',
      position: 'center',
    },
  ]

  const { data, error } = await supabase
    .from('pages')
    .select('body')
    .eq('slug', 'home')
    .maybeSingle()

  if (error || !data?.body) {
    slides.value = defaultSlides
    return
  }

  const parsed = safeJsonParse<{ sections?: Array<unknown> }>(data.body)
  const sections: unknown[] = Array.isArray(parsed?.sections) ? parsed.sections : []

  const slideshowSection = sections.find(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      typeof (s as Record<string, unknown>).id === 'string' &&
      (s as Record<string, unknown>).id === 'home-slideshow',
  )

  const rawSlidesText =
    slideshowSection && typeof (slideshowSection as { items?: unknown }).items === 'string'
      ? (slideshowSection as { items: string }).items
      : ''

  if (!rawSlidesText) {
    slides.value = defaultSlides
    return
  }

  const rawSlides = safeJsonParse<unknown>(rawSlidesText)
  if (!Array.isArray(rawSlides)) {
    slides.value = defaultSlides
    return
  }

  const normalized = rawSlides
    .map(normalizeSlide)
    .filter((s): s is NgoSlide => Boolean(s))

  slides.value = normalized.length ? normalized : defaultSlides
}

onMounted(() => {
  void loadHomeSlideshow()
})

const activeSlideFallback = computed(() => {
  return slides.value[0] ?? null
})
</script>

<template>
  <div class="home-slideshow-view">
    <Slideshow :slides="slides" :interval-ms="4000" v-slot="{ activeSlide }">
      <div class="hero-overlay" />
      <div class="hero-inner">
        <div :key="activeSlide?.image" class="hero-message">
          <p class="eyebrow eyebrow--light">
            {{ activeSlide?.eyebrow ?? 'Buddhist NGO - Cambodia - Since 1994' }}
          </p>
          <h1 class="hero-title">
            {{
              activeSlide?.title ??
              activeSlideFallback?.title ??
              'Walking with villages toward peace, sustainability and dignity.'
            }}
          </h1>
          <p class="hero-subtitle">
            {{
              activeSlide?.description ??
              'Santi Sena works alongside rural Cambodian communities in education, livelihoods, environment and child protection.'
            }}
          </p>
          <div class="hero-actions">
            <a :href="activeSlide?.primaryTo ?? '/qr-donate'" class="btn btn--primary">
              {{ activeSlide?.primaryLabel ?? 'Support Us' }}
            </a>
            <a :href="activeSlide?.secondaryTo ?? '/about'" class="btn btn--outline">
              {{ activeSlide?.secondaryLabel ?? 'Stand with us' }}
            </a>
          </div>
        </div>
      </div>
    </Slideshow>
  </div>
</template>

<style scoped>
.home-slideshow-view {
  font-family: inherit;
  color: var(--color-ink);
  background: var(--color-cream);
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
      90deg,
      rgba(6, 18, 13, 0.92) 0%,
      rgba(6, 18, 13, 0.68) 38%,
      rgba(6, 18, 13, 0.3) 65%,
      rgba(6, 18, 13, 0.05) 100%
    ),
    radial-gradient(circle at 82% 25%, rgba(77, 111, 86, 0.4) 0%, transparent 55%);
}

.hero-inner {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 760px;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  width: 100%;
  animation: fadeInUp 0.8s ease-out;
}

.hero-message {
  animation: heroMessageIn 0.8s cubic-bezier(0.22, 1, 0.36, 1);
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

@keyframes heroMessageIn {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-title {
  margin: 0.75rem 0 1.25rem;
  color: #fdf8ef;
}

.hero-subtitle {
  max-width: 620px;
  margin: 0 0 2rem;
  color: rgba(253, 248, 239, 0.85);
  font-size: 1.05rem;
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.85rem;
  border-radius: 999px;
  font-weight: 600;
  font-size: 0.95rem;
  text-decoration: none;
  border: 1px solid transparent;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;
}

.btn--primary {
  background: var(--primary-color);
  color: var(--color-white);
}

.btn--primary:hover {
  background: var(--primary-dark);
}

.btn--outline {
  border-color: rgba(253, 248, 239, 0.6);
  color: #fdf8ef;
}

.btn--outline:hover {
  background: rgba(253, 248, 239, 0.1);
}

.eyebrow {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--primary-color);
}

.eyebrow--light {
  color: var(--primary-light);
}
</style>

