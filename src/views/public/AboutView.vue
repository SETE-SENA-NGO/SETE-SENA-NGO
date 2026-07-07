<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const values = [
  { name: 'Honesty', body: 'we have honesty with our donors, target group, operational partners and working group.' },
  { name: 'Non-discrimination', body: 'we do not have any discrimination for the disabled, religions, colors, races, respect to target group, and political factions. ' },
  { name: 'Collective Benefits', body: 'we do not utilize property of organization for any private benefit, working tirelessly, sharing information and knowledge. ' },
  { name: 'Flexibility', body: 'we respect and accept good comments from target groups, development partners which response to goal and resources existed.' },
  { name: 'Empowerment', body: 'We do not deliver development; we hand it back to the community.' },
]

const team = [
  { role: 'Board of Directors', desc: 'Policy and oversight, including senior Buddhist leadership.' },
  { role: 'Executive Director', desc: 'Daily operations and strategic execution.' },
  { role: 'Management Committee', desc: 'Coordinates programs across provinces.' },
  { role: 'Technical Coordination', desc: 'Provides inputs across thematic areas.' },
  { role: 'Professional Staff', desc: '30+ full-time and project-based experts in agriculture, education and rural development.' },
]

const provinces = ['Svay Rieng', 'Prey Veng', 'Kratie']

// ── Slideshow ──

const imageUrls: string[] = [
  'https://images.pexels.com/photos/5905476/pexels-photo-5905476.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/5905470/pexels-photo-5905470.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/5905493/pexels-photo-5905493.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  'https://images.pexels.com/photos/5905700/pexels-photo-5905700.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
]

const currentSlide = ref(0)
let slideTimer: number | undefined

const startSlideshow = () => {
  stopSlideshow()
  slideTimer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % imageUrls.length
  }, 5000)
}

const stopSlideshow = () => {
  if (slideTimer) {
    clearInterval(slideTimer)
    slideTimer = undefined
  }
}

onMounted(() => {
  document.title = 'About Santi Sena — Buddhist NGO in Cambodia'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.name = name
      document.head.appendChild(el)
    }
    el.content = content
  }

  setMeta('description', "Santi Sena ('Peace Army') was founded in 1994 to alleviate poverty and rebuild moral, environmental and economic life across rural Cambodia.")

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) {
      el = document.createElement('meta')
      el.setAttribute('property', property)
      document.head.appendChild(el)
    }
    el.content = content
  }

  setOgMeta('og:title', 'About Santi Sena')
  setOgMeta('og:description', 'Our story, vision, values and the team carrying the Peace Army forward.')

  startSlideshow()
})

onUnmounted(() => {
  stopSlideshow()
})
</script>

<template>
  <div class="about-page">
    <!-- Hero Section with Background Slideshow -->
    <section class="hero-section" @mouseenter="stopSlideshow" @mouseleave="startSlideshow">
      <div class="hero-overlay" />

      <div class="slides" aria-live="polite">
        <div
          v-for="(url, i) in imageUrls"
          :key="i"
          class="slide"
          :class="{ 'is-active': currentSlide === i }"
          :style="{ backgroundImage: `url(${url})` }"
        />
      </div>

      <div class="hero-content">
        <span class="section-label saffron">About Santi Sena</span>
        <h1 class="hero-title">
          A peace army born from the Dharma, raised by villages.
        </h1>
        <p class="hero-subtitle">
          Founded in 1994 by Cambodian Buddhist monks, Santi Sena emerged from the ashes of conflict
          with a quiet conviction: that lasting peace is grown in soil, schools and dignified work,
          not signed in distant offices.
        </p>
      </div>
    </section>

    <!-- Vision / Mission / Goal -->
    <section class="vmg-section">
      <div class="vmg-card">
        <h2 class="vmg-heading">Vision</h2>
        <p class="vmg-body">
          A Cambodia where peace, justice and harmony flourish across every village and generation.
        </p>
      </div>
      <div class="vmg-card">
        <h2 class="vmg-heading">Mission</h2>
        <p class="vmg-body">
          To alleviate poverty through community-led development rooted in Buddhist ethics —
          empowering farmers, women, youth and children to build better lives.
        </p>
      </div>
      <div class="vmg-card">
        <h2 class="vmg-heading">Goal</h2>
        <p class="vmg-body">
          Better work and living situations for the most vulnerable rural households of southeastern
          Cambodia.
        </p>
      </div>
    </section>

    <!-- Core Values -->
    <section class="values-section">
      <div class="values-container">
        <span class="section-label saffron">Core Values</span>
        <h2 class="values-title">Five vows that shape every program</h2>
        <div class="values-grid">
          <div v-for="v in values" :key="v.name" class="value-card">
            <div class="value-name">{{ v.name }}</div>
            <p class="value-body">{{ v.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Organizational Structure -->
    <section class="org-section">
      <div class="org-grid">
        <div class="org-text">
          <span class="section-label saffron">Organizational Structure</span>
          <h2 class="org-heading">A team of monks, managers and master practitioners.</h2>
          <p class="org-body">
            From the Board of Directors to the field staff in Kratie, every level of Santi Sena is
            accountable to the villagers we serve and the donors who trust us.
          </p>
        </div>
        <ul class="team-list">
          <li v-for="t in team" :key="t.role" class="team-card">
            <div class="team-role">{{ t.role }}</div>
            <p class="team-desc">{{ t.desc }}</p>
          </li>
        </ul>
      </div>
    </section>

    <!-- Geographical Reach -->
    <section class="geo-section">
      <div class="geo-container">
        <span class="section-label saffron">Geographical reach</span>
        <h2 class="geo-heading">Three provinces. Forty-three communes. Two hundred and ninety-three villages.</h2>
        <div class="geo-grid">
          <div v-for="p in provinces" :key="p" class="geo-card">
            <div class="geo-name">{{ p }}</div>
            <div class="geo-label">Province</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ─── About page color tokens ───
 * Green + Gold palette to match the logo.
 * Green (#3A7D44) represents nature, growth, and rural Cambodia.
 * Gold (#D4A017 / saffron) represents Buddhism, wisdom, and the Dharma.
 */
.about-page {
  --about-primary: #1F472F;
  --about-primary-foreground: #FFFFFF;
  --about-saffron: #D4A017;
  --about-white: #FFFFFF;
  --about-muted: #4B5563;
  --about-border: #E5E7EB;
  --about-panel: #FFFFFF;
  --about-bg-alt: #F3F7F4;
  --about-cream: #0e311c;
  --about-surface: color-mix(in srgb, var(--about-primary) 90%, white);
  --about-surface-strong: color-mix(in srgb, var(--about-primary) 82%, white);
}

/* ─── Shared ─── */
.section-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
}

.section-label.saffron {
  color: var(--about-saffron);
  font-weight: 700;
  letter-spacing: 0.4em;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 2rem;
  background: color-mix(in srgb, var(--about-saffron) 15%, transparent);
  color: var(--about-saffron);
}

/* ─── Hero ─── */
.hero-section {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--about-primary) 40%, transparent);
  background: var(--about-primary);
}

.slides {
  position: absolute;
  inset: 0;
}

.slide {
  position: absolute;
  inset: -10px;
  opacity: 0;
  transition: opacity 1500ms ease-in-out;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-color: #5a7d5e;
  filter: blur(4px);
  transform: scale(1.05);
}

.slide.is-active {
  opacity: 1;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.50) 0%, rgba(0, 0, 0, 0.20) 45%, rgba(0, 0, 0, 0.05) 70%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.35) 0%, transparent 40%, rgba(0, 0, 0, 0.10) 100%);
  z-index: -10;
  /* darker subtle gradient overlay to keep the hero firmly dark green */
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.28) 0%,
      rgba(0, 0, 0, 0.18) 50%,
      rgba(0, 0, 0, 0.08) 100%);
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 1280px;
  margin: 0 auto;
  padding: 8rem 1.5rem;
  color: var(--about-white);
}

.hero-title {
  margin-top: 1rem;
  max-width: 48rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2.75rem;
  line-height: 1.1;
  font-weight: 700;
}

.hero-subtitle {
  margin-top: 1.5rem;
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.8);
}

/* ─── Vision / Mission / Goal ─── */
.vmg-section {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  gap: 3rem;
  padding: 6rem 1.5rem;
}

.vmg-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  border-radius: 1rem;
  background: var(--about-surface);
  color: var(--about-primary-foreground);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.vmg-heading {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.5rem;
  color: var(--about-primary);
  margin: 0 0 0.5rem;
}

.vmg-body {
  color: var(--about-muted);
  color: var(--about-primary-foreground);
  line-height: 1.75;
  margin: 0;
  font-size: 1rem;
}

/* ─── Core Values ─── */
.values-section {
  background: var(--about-bg-alt);
  padding: 6rem 0;
}

.values-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.values-title {
  margin-top: 1.5rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2rem;
  color: var(--about-primary);
}

.values-grid {
  margin-top: 3.5rem;
  display: grid;
  gap: 1.5rem;
}

.value-card {
  border-radius: 1rem;
  border: 1px solid var(--about-border);
  background: var(--about-panel);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.value-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid color-mix(in srgb, var(--about-primary-foreground) 20%, transparent);
  background: var(--about-surface-strong);
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  text-align: left;
  color: var(--about-primary-foreground);
}

.value-name {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  color: var(--about-saffron);
  margin-bottom: 0.5rem;
}

.value-body {
  font-size: 0.9rem;
  color: var(--about-muted);
  color: var(--about-primary-foreground);
  line-height: 1.65;
  margin: 0;
}

/* ─── Organizational Structure ─── */
.org-section {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6rem 1.5rem;
}

.org-grid {
  display: grid;
  gap: 3rem;
}

.org-heading {
  margin-top: 1rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2rem;
  color: var(--about-primary);
}

.org-body {
  margin-top: 1.5rem;
  color: var(--about-muted);
  color: var(--about-primary-foreground);
  line-height: 1.75;
  font-size: 1rem;
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.team-card {
  border-radius: 0.75rem;
  border-left: 4px solid var(--about-saffron);
  background: var(--about-panel);
  padding: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.team-card:hover {
  transform: translateX(4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  background: var(--about-surface);
  padding: 1.5rem;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
  color: var(--about-primary-foreground);
}

.team-role {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.125rem;
  color: var(--about-primary);
}

.team-desc {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--about-muted);
  color: var(--about-primary-foreground);
  line-height: 1.65;
}

/* ─── Geographical Reach ─── */
.geo-section {
  background: var(--about-primary);
  padding: 6rem 0;
  color: var(--about-primary-foreground);
}

.geo-container {
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 1.5rem;
  text-align: center;
}

.geo-heading {
  margin-top: 1rem;
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 2rem;
  line-height: 1.2;
}

.geo-grid {
  margin-top: 2.5rem;
  display: grid;
  gap: 1.5rem;
}

.geo-card {
  border-radius: 1rem;
  border: 1px solid color-mix(in srgb, var(--about-primary-foreground) 20%, transparent);
  padding: 2rem;
}

.geo-name {
  font-family: ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif;
  font-size: 1.5rem;
}

.geo-label {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: color-mix(in srgb, var(--about-primary-foreground) 55%, transparent);
}

/* ─── Responsive ─── */
@media (min-width: 768px) {
  .hero-title {
    font-size: 3.75rem;
  }

  .vmg-section {
    grid-template-columns: repeat(3, 1fr);
  }

  .values-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .org-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .geo-heading {
    font-size: 2.5rem;
  }

  .geo-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .values-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
</style>
