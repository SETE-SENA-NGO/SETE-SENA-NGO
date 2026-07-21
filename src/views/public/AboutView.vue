<script setup lang="ts">
import { onMounted, ref, onUnmounted } from 'vue'
import { imageUrls } from '@/lib/imageUrls'
import { useScrollReveal } from '@/composables/useScrollReveal'

const cambodiaMap = imageUrls.maps.cambodiaOffices
const logoUrl = imageUrls.logo

const { observe } = useScrollReveal({ threshold: 0.12 })

const values = [
  { name: 'Honesty', body: 'We have honesty with our donors, target group, operational partners and working group.' },
  { name: 'Non-discrimination', body: 'We do not have any discrimination for the disabled, religions, colors, races, respect to target group, and political factions.' },
  { name: 'Collective Benefits', body: 'We do not utilize property of organization for any private benefit, working tirelessly, sharing information and knowledge.' },
  { name: 'Flexibility', body: 'We respect and accept good comments from target groups, development partners which respond to goal and resources existed.' },
]

const team = [
  {
    role: 'Board of Directors',
    desc: 'Policy and oversight, including senior Buddhist leadership.',
  },
  { role: 'Executive Director', desc: 'Daily operations and strategic execution.' },
  { role: 'Management Committee', desc: 'Coordinates programs across provinces.' },
  { role: 'Technical Coordination', desc: 'Provides inputs across thematic areas.' },
  {
    role: 'Professional Staff',
    desc: '30+ full-time and project-based experts in agriculture, education and rural development.',
  },
]

const provinces = [
  {
    name: 'Svay Rieng',
    tagline: 'Southeastern rice bowl',
    villages: 86,
    desc: 'Bordering Vietnam, known for its fertile rice plains and close-knit farming communities rebuilding after decades of hardship.',
    accent: '#0f8f69',
    accentLight: 'color-mix(in srgb, #0f8f69 12%, transparent)',
  },
  {
    name: 'Prey Veng',
    tagline: 'Heart of the floodplains',
    villages: 97,
    desc: 'The most populous southeastern province, where we run extensive water, sanitation and early childhood education programs.',
    accent: '#0b5f49',
    accentLight: 'color-mix(in srgb, #0b5f49 12%, transparent)',
  },
  {
    name: 'Kratie',
    tagline: 'Mekong river gateway',
    villages: 110,
    desc: 'Northeastern province along the Mekong, home to remote villages where we focus on sustainable agriculture and forest restoration.',
    accent: '#1a7a5c',
    accentLight: 'color-mix(in srgb, #1a7a5c 12%, transparent)',
  },
]

const storyRef = ref<HTMLElement | null>(null)
const vmgRefs = ref<(HTMLElement | null)[]>([])
const valuesRef = ref<(HTMLElement | null)[]>([])
const teamRef = ref<(HTMLElement | null)[]>([])
const geoRefs = ref<(HTMLElement | null)[]>([])
const ctaRef = ref<HTMLElement | null>(null)
const photoFrameRef = ref<HTMLElement | null>(null)
const photoInnerRef = ref<HTMLElement | null>(null)

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

  setMeta(
    'description',
    "Santi Sena ('Peace Army') was founded in 1994 to alleviate poverty and rebuild moral, environmental and economic life across rural Cambodia.",
  )

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

  // Observe elements for scroll-reveal
  observe(storyRef.value)
  vmgRefs.value.forEach((el) => observe(el))
  valuesRef.value.forEach((el) => observe(el))
  teamRef.value.forEach((el) => observe(el))
  geoRefs.value.forEach((el) => observe(el))
  observe(ctaRef.value)

  onUnmounted(() => {
    // no hover animation cleanup needed because photo hover interactivity has been removed
  })
})

function setVmgRef(el: HTMLElement | null, index: number) {
  vmgRefs.value[index] = el
}

function setValueRef(el: HTMLElement | null, index: number) {
  valuesRef.value[index] = el
}

function setTeamRef(el: HTMLElement | null, index: number) {
  teamRef.value[index] = el
}

function setGeoRef(el: HTMLElement | null, index: number) {
  geoRefs.value[index] = el
}
</script>

<template>
  <div class="about-page">

    <!-- ─── Our Story ─── -->
    <section class="story-section">
      <div class="container">
        <div ref="storyRef" class="reveal-on-scroll story-grid">
          <div class="story-badge-row">
            <span class="section-badge">Our Story</span>
          </div>
          <div class="story-content">
            <h2 class="story-heading">From the ashes of conflict,<br />a <span class="highlight">seed of peace</span>
              was planted.</h2>
            <div class="story-body">
              <p>
                In the years following the Cambodian Civil War, as the nation began to heal from decades of
                devastation, a group of Buddhist monks saw that true reconciliation could not be decreed
                from afar — it had to be cultivated in the rice paddies, the classrooms, and the
                village meeting halls where daily life unfolds.
              </p>
              <p>
                Thus, in <strong>1994</strong>, <strong>Santi Sena</strong> — the <em>"Peace Army"</em> — was
                born. With little more than steadfast faith and the trust of rural communities, these monks
                began organizing farmers, building simple schools, and tending to the degraded forests that
                had sustained their ancestors for generations.
              </p>
              <p>
                Over three decades, that seed has grown into an organization spanning three provinces,
                employing over 30 dedicated staff, and touching the lives of tens of thousands of
                families. Yet our approach remains the same: <strong>listen first, act together,
                  sustain forever.</strong>
              </p>
            </div>
          </div>
          <div class="story-visual">
            <div class="photo-frame" ref="photoFrameRef">
              <div class="photo-inner" ref="photoInnerRef">
                <img class="photo-img" :src="cambodiaMap"
                  alt="Santi Sena operations across Cambodia" loading="lazy" />
                <!-- Reveal sweep overlay -->
                <div class="photo-sweep" aria-hidden="true"></div>
              </div>
              <!-- Photo info caption -->
              <div class="photo-caption">
                <span class="photo-caption-dot" aria-hidden="true"></span>
                <span>Santi Sena operates across <strong>3 provinces</strong> in southeastern Cambodia</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Vision / Mission / Goal ─── -->
    <section class="vmg-section">
      <div class="vmg-bg-pattern" aria-hidden="true">
        <div class="vmg-bg-circle vmg-bg-c1" />
        <div class="vmg-bg-circle vmg-bg-c2" />
        <div class="vmg-bg-circle vmg-bg-c3" />
      </div>
      <div class="container">
        <div class="vmg-badge-row">
          <span class="section-badge">What Drives Us</span>
        </div>
        <h2 class="vmg-section-heading">Our <span class="vmg-heading-accent">North Star</span></h2>
        <p class="vmg-intro">
          Everything we do at Santi Sena is guided by three interconnected pillars.
          They keep us focused, grounded, and accountable to the communities we serve.
        </p>

        <!-- Flow connector between cards -->
        <div class="vmg-flow" aria-hidden="true">
          <svg width="100%" height="40" viewBox="0 0 400 40" preserveAspectRatio="none">
            <line x1="50" y1="20" x2="180" y2="20" stroke="var(--about-saffron)" stroke-width="1.5"
              stroke-dasharray="6 4" opacity="0.3" />
            <polygon points="178,14 188,20 178,26" fill="var(--about-saffron)" opacity="0.3" />
            <line x1="220" y1="20" x2="350" y2="20" stroke="var(--about-saffron)" stroke-width="1.5"
              stroke-dasharray="6 4" opacity="0.3" />
            <polygon points="348,14 358,20 348,26" fill="var(--about-saffron)" opacity="0.3" />
          </svg>
        </div>

        <div class="vmg-grid">
          <!-- Vision Card -->
          <div :ref="(el) => setVmgRef(el as HTMLElement | null, 0)" class="reveal vmg-card"
            style="transition-delay: 0s">
            <div class="vmg-card-glow vision-glow" />
            <div class="vmg-card-inner">
              <span class="vmg-number">01</span>
              <div class="vmg-icon-ring">
                <div class="vmg-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
              </div>
              <h3 class="vmg-title vision-title">Vision</h3>
              <p class="vmg-text">
                A Cambodia where peace, justice and harmony flourish across every village and generation.
              </p>
              <div class="vmg-card-footer">
                <span class="vmg-tag">Long-term compass</span>
              </div>
            </div>
          </div>

          <!-- Mission Card -->
          <div :ref="(el) => setVmgRef(el as HTMLElement | null, 1)" class="reveal vmg-card"
            style="transition-delay: 0.12s">
            <div class="vmg-card-glow mission-glow" />
            <div class="vmg-card-inner">
              <span class="vmg-number">02</span>
              <div class="vmg-icon-ring">
                <div class="vmg-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
              </div>
              <h3 class="vmg-title mission-title">Mission</h3>
              <p class="vmg-text">
                To alleviate poverty through community-led development rooted in Buddhist ethics —
                empowering farmers, women, youth and children to build better lives.
              </p>
              <div class="vmg-card-footer">
                <span class="vmg-tag">Our daily work</span>
              </div>
            </div>
          </div>

          <!-- Goal Card -->
          <div :ref="(el) => setVmgRef(el as HTMLElement | null, 2)" class="reveal vmg-card"
            style="transition-delay: 0.24s">
            <div class="vmg-card-glow goal-glow" />
            <div class="vmg-card-inner">
              <span class="vmg-number">03</span>
              <div class="vmg-icon-ring">
                <div class="vmg-icon-wrap">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
              </div>
              <h3 class="vmg-title goal-title">Goal</h3>
              <p class="vmg-text">
                Better work and living situations for the most vulnerable rural households of southeastern Cambodia.
              </p>
              <div class="vmg-card-footer">
                <span class="vmg-tag">Tangible outcome</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Core Values ─── -->
    <section class="values-section">
      <div class="container">
        <div class="values-badge-row">
          <span class="section-badge">Core Values</span>
        </div>
        <h2 class="values-section-heading">Four <span class="highlight">values</span> that shape every program</h2>
        <p class="values-intro">
          Our values were forged through decades of working alongside rural communities.
          They guide every decision, partnership, and program we undertake.
        </p>
        <div class="values-grid">
          <div v-for="(v, idx) in values" :key="v.name" :ref="(el) => setValueRef(el as HTMLElement | null, idx)"
            class="reveal value-card" :style="{ transitionDelay: `${idx * 0.1}s` }">
            <div class="value-icon-wrap">
              <!-- Honesty: heart icon -->
              <svg v-if="idx === 0" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path
                  d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
              <!-- Non-discrimination: users icon -->
              <svg v-else-if="idx === 1" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <!-- Collective Benefits: share icon -->
              <svg v-else-if="idx === 2" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              <!-- Flexibility: wind/refresh icon -->
              <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
              </svg>
            </div>
            <h3 class="value-name">{{ v.name }}</h3>
            <p class="value-body">{{ v.body }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Organizational Structure ─── -->
    <section class="org-section">
      <div class="container">
        <div class="org-grid">
          <div class="org-text">
            <span class="section-badge">Organizational Structure</span>
            <h2 class="org-heading">A team of <span class="highlight">monks, managers</span> and master practitioners.
            </h2>
            <p class="org-body">
              From the Board of Directors to the field staff in Kratie, every level of Santi Sena is
              accountable to the villagers we serve and the donors who trust us.
            </p>
            <figure class="org-visual" aria-label="Santi Sena organization seal">
              <div class="org-logo-float">
                <img class="org-logo" :src="logoUrl" alt="Santi Sena seal" loading="lazy" />
              </div>
            </figure>
          </div>
          <ul class="team-list">
            <li v-for="(t, idx) in team" :key="t.role" :ref="(el) => setTeamRef(el as HTMLElement | null, idx)"
              class="reveal team-card" :style="{ transitionDelay: `${idx * 0.08}s` }">
              <div class="team-card-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <div class="team-card-body">
                <h3 class="team-role">{{ t.role }}</h3>
                <p class="team-desc">{{ t.desc }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ─── Geographical Reach ─── -->
    <section class="geo-section">
      <div class="geo-bg-map" aria-hidden="true"></div>
      <div class="container">
        <div class="geo-badge-row">
          <span class="section-badge">Where We Work</span>
        </div>
        <h2 class="geo-heading"><span class="highlight">Three provinces.</span> Forty-three communes. Two hundred and
          ninety-three villages.</h2>
        <p class="geo-intro">
          We work where the need is greatest: the southeastern provinces of Cambodia,
          home to farming families and remote villages rebuilding after decades of hardship.
        </p>

        <!-- Decorative connecting path -->
        <div class="geo-connector" aria-hidden="true">
          <svg viewBox="0 0 800 40" preserveAspectRatio="none">
            <path d="M 80 20 Q 200 0, 400 20 T 720 20" fill="none" stroke="var(--about-border)" stroke-width="1.5"
              stroke-dasharray="8 6" />
            <circle cx="80" r="4" cy="20" fill="var(--about-highlight)" opacity="0.4" />
            <circle cx="400" r="4" cy="20" fill="var(--about-highlight)" opacity="0.4" />
            <circle cx="720" r="4" cy="20" fill="var(--about-highlight)" opacity="0.4" />
          </svg>
        </div>

        <div class="geo-grid">
          <div v-for="(p, idx) in provinces" :key="p.name" :ref="(el) => setGeoRef(el as HTMLElement | null, idx)"
            class="reveal geo-card" :style="{
              transitionDelay: `${idx * 0.15}s`,
              '--province-accent': p.accent,
              '--province-accent-light': p.accentLight
            }">
            <!-- Top decorative band -->
            <div class="geo-card-band">
              <div class="geo-card-band-inner"></div>
            </div>

            <div class="geo-card-body">
              <!-- Pulsing marker -->
              <div class="geo-marker-wrap">
                <div class="geo-marker-pulse"></div>
                <div class="geo-marker-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
              </div>

              <!-- Province name -->
              <h3 class="geo-name">{{ p.name }}</h3>

              <!-- Tagline -->
              <p class="geo-tagline">{{ p.tagline }}</p>

              <!-- Divider -->
              <div class="geo-card-divider"></div>

              <!-- Description -->
              <p class="geo-desc">{{ p.desc }}</p>

              <!-- Villages stat chip -->
              <div class="geo-stat">
                <span class="geo-stat-number">{{ p.villages }}</span>
                <span class="geo-stat-label">villages served</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Call to Action ─── -->
    <section ref="ctaRef" class="reveal cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Join the Peace Army</h2>
          <p>
            Whether through partnership, volunteering, or support, your contribution brings
            us one step closer to a Cambodia where every village thrives.
          </p>
          <div class="cta-actions">
            <router-link to="/get-involved" class="btn btn-primary">Get Involved</router-link>
            <router-link to="/contact" class="btn btn-outline">Contact Us</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════
   About Page — Complete Redesign
   Tokens, shared styles, animation keyframes
   ═══════════════════════════════════════════════ */

/* ─── Design Tokens ─── */
.about-page {
  --about-primary: var(--primary-color);
  --about-saffron: var(--primary-dark);
  --about-cream: var(--color-cream);
  --about-cream-soft: var(--color-cream-soft);
  --about-ink: var(--color-ink);
  --about-ink-soft: var(--color-ink-soft);
  --about-border: var(--color-border);
  --about-white: var(--color-white);
  --about-surface: color-mix(in srgb, var(--about-primary) 8%, transparent);
  --about-surface-strong: color-mix(in srgb, var(--about-primary) 92%, var(--color-white));
  --about-surface-soft: var(--about-cream-soft);
  --about-highlight: var(--primary-color);
  --about-shadow: var(--shadow-sm);
}

/* ─── Shared Elements ─── */
.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--about-saffron);
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--about-saffron) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--about-saffron) 18%, transparent);
}

/* ─── Scroll-Reveal (Dropdown style, two-way) ─── */
.reveal {
  opacity: 0;
  transform: translateY(-24px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════════════════════════════════════════
   Hero
   ═══════════════════════════════════════════════ */

.hero-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to right, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.5) 40%, rgba(0, 0, 0, 0.15) 68%, transparent 100%),
    linear-gradient(to top, rgba(0, 0, 0, 0.45) 0%, transparent 45%, rgba(0, 0, 0, 0.1) 100%);
}

.hero-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  text-align: left;
  max-width: 720px;
  margin: 0;
  left: var(--container-offset);
  padding: 3rem 1.5rem;
  animation: fadeInUp 0.8s ease-out;
  color: var(--about-white);
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

.hero-badge {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--admin-theme-contrast);
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid var(--text-on-dark-secondary);
  border-radius: 9999px;
  background: var(--green-tint-light);
  backdrop-filter: blur(4px);
}

.hero-title {
  max-width: 48rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-white);
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
  margin: 0 0 0.75rem;
}

.hero-highlight {
  background: linear-gradient(135deg, #4ade80, #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  max-width: 42rem;
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--text-on-dark-secondary);
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
  margin: 0 0 2rem;
}

.hero-stats-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.hero-stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.hero-stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--admin-theme-primary), var(--admin-theme-primary-deep));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.hero-stat-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-on-dark-tertiary);
}

.hero-stat-divider {
  width: 1px;
  height: 2.5rem;
  background: var(--text-on-dark-secondary);
}

/* ═══════════════════════════════════════════════
   Our Story
   ═══════════════════════════════════════════════ */

.story-section {
  padding: 4rem 0;
  background: var(--about-surface);
}

.story-grid {
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 2.5rem;
  align-items: center;
}

.story-badge-row {
  grid-column: 1 / -1;
  margin-bottom: 0.75rem;
}

.story-heading {
  font-size: clamp(1.75rem, 3.5vw, 2.25rem);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--about-ink);
  margin-bottom: 1.5rem;
}

.story-heading .highlight {
  background: linear-gradient(135deg, var(--about-highlight), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.story-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.story-body p {
  font-size: 0.95rem;
  line-height: 1.8;
  color: var(--about-ink-soft);
  margin: 0;
}

.story-body strong {
  background: linear-gradient(135deg, var(--about-highlight), #22c55e);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.story-visual {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

/* ═══════════════════════════════════════
   Photo Frame — Clean & Impactful Animations
   ═══════════════════════════════════════ */

/* ── Frame: entrance + visual design ── */
.photo-frame {
  position: relative;
  width: 100%;
  /* allow the image to use available column width instead of a small max */
  max-width: none;
  border-radius: 1.125rem;
  background: transparent;
  padding: 0;
  box-shadow: none;
  transition: transform 0.35s ease;
  opacity: 0;
  animation: frameFadeIn 0.7s ease 0.1s forwards;
}

@keyframes frameFadeIn {
  to {
    opacity: 1;
  }
}

/* ── Warm overlay (gentle gradient, no border) ── */
.photo-frame::after {
  /* decorative overlay disabled when frame is removed */
  content: none;
}

@keyframes warmFadeIn {
  to {
    opacity: 1;
  }
}

/* ── Inner container — handles hover lift ── */
.photo-frame .photo-inner {
  position: relative;
  z-index: 1;
  border-radius: 0.9rem;
  overflow: hidden;
  transition:
    box-shadow 0.4s ease;
  will-change: transform;
}

/* ── Image — Ken Burns continuous slow zoom ── */
.photo-frame .photo-img {
  display: block;
  width: 100%;
  height: auto;
  /* show the full image (no cropping); if you prefer fill, change to 'cover' */
  object-fit: contain;
  transform-origin: center 45%;
  animation: none !important;
}

@keyframes kenBurns {
  0% {
    transform: scale(1);
  }

  100% {
    transform: scale(1.12);
  }
}

/* ── Sweep reveal overlay (left-to-right curtain) ── */
.photo-sweep {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background: linear-gradient(110deg,
      transparent 30%,
      rgba(255, 255, 255, 0.25) 45%,
      rgba(255, 255, 255, 0.15) 50%,
      transparent 65%);
  transform: translateX(-100%);
  display: none;
  animation: none !important;
}

@keyframes sweepReveal {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(200%);
  }
}

/* ── Photo caption ── */
.photo-caption {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  font-size: 0.78rem;
  color: var(--about-ink-soft);
  background: var(--about-surface-soft);
  border-radius: 0.6rem;
  border: 1px solid var(--about-border);
  opacity: 0;
  animation: captionFadeIn 0.6s ease 0.6s forwards;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}

@keyframes captionFadeIn {
  to {
    opacity: 1;
  }
}

.photo-caption-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--about-highlight);
  flex-shrink: 0;
  animation: dotPulse 2s ease-in-out infinite;
}

@keyframes dotPulse {

  0%,
  100% {
    opacity: 0.5;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.3);
  }
}

.photo-caption strong {
  color: var(--about-highlight);
  font-weight: 700;
}

.logo-frame {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  margin-top: 1.5rem;
  padding: 1rem 1rem 1.25rem;
  background: var(--about-surface);
  border-radius: 0.875rem;
  border: 1px solid var(--about-border);
  box-shadow: var(--shadow-xs);
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease;
}

.logo-frame:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  border-color: color-mix(in srgb, var(--about-highlight) 30%, transparent);
}

.logo-frame-inner {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--about-surface);
  padding: 6px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.4s ease, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.logo-frame:hover .logo-frame-inner {
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.14);
  transform: scale(1.05);
}

.logo-frame-inner::after {
  content: '';
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: linear-gradient(135deg,
      rgba(15, 143, 105, 0.08),
      transparent 50%);
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-frame:hover .logo-frame-inner::after {
  opacity: 1;
}

.logo-frame-img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 50%;
  background: var(--color-cream);
  opacity: 0;
  animation: logoRevealIn 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.3s forwards;
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes logoRevealIn {
  to {
    opacity: 1;
  }
}

.logo-frame-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
}

.logo-frame-name {
  font-size: 0.95rem;
  font-weight: 800;
  color: var(--about-highlight);
  letter-spacing: -0.01em;
}

.logo-frame-sub {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--about-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.timeline-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.timeline-year {
  font-size: 1rem;
  font-weight: 700;
  color: var(--about-saffron);
  letter-spacing: 0.05em;
}

.timeline-desc {
  font-size: 0.82rem;
  color: var(--about-ink-soft);
  text-align: center;
  line-height: 1.4;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--about-saffron) 30%, transparent);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════
   Vision / Mission / Goal — Dynamic Redesign
   ═══════════════════════════════════════════════ */

.vmg-section {
  padding: 4rem 0;
  background: var(--about-cream);
  position: relative;
  overflow: hidden;
}

/* ── Animated Background Pattern ── */
.vmg-bg-pattern {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.vmg-bg-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
  animation: none !important;
}

.vmg-bg-c1 {
  width: 400px;
  height: 400px;
  background: #3b82f6;
  top: -100px;
  left: -80px;
  animation-delay: 0s;
}

.vmg-bg-c2 {
  width: 350px;
  height: 350px;
  background: var(--about-primary);
  bottom: -60px;
  right: -60px;
  animation-delay: -4s;
}

.vmg-bg-c3 {
  width: 250px;
  height: 250px;
  background: #f59e0b;
  top: 40%;
  left: 55%;
  animation-delay: -8s;
}

@keyframes vmgFloat {
  0% {
    transform: translate(0, 0) scale(1);
  }

  33% {
    transform: translate(30px, -20px) scale(1.05);
  }

  66% {
    transform: translate(-20px, 15px) scale(0.95);
  }

  100% {
    transform: translate(10px, -30px) scale(1.02);
  }
}

.vmg-badge-row {
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.vmg-section-heading {
  font-size: clamp(1.6rem, 3vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-ink);
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

.vmg-heading-accent {
  background: linear-gradient(135deg, var(--about-saffron), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Flow Connector ── */
.vmg-flow {
  position: relative;
  z-index: 1;
  margin-bottom: 1rem;
  max-width: 500px;
}

.vmg-flow svg {
  display: block;
  height: 24px;
}

/* ── Intro paragraph ── */
.vmg-intro {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--about-ink-soft);
  max-width: 580px;
  margin: 0 0 1.25rem;
  position: relative;
  z-index: 1;
}

/* ── Card Grid ── */
.vmg-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

/* ── Card Base ── */
.vmg-card {
  position: relative;
  border-radius: 1.5rem;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.4s ease;
}

.vmg-card:hover {
  transform: translateY(-10px) scale(1.02);
}

/* ── Glowing border effect ── */
.vmg-card-glow {
  position: absolute;
  inset: -2px;
  border-radius: 1.6rem;
  background: none;
  background: linear-gradient(135deg, #3b82f6, #60a5fa, #93c5fd, #3b82f6);
  background-size: 300% 300%;
  animation: gradientShift 4s ease infinite;
}

.mission-glow {
  background: linear-gradient(135deg, var(--about-primary), #4ade80, #86efac, var(--about-primary));
  background-size: 300% 300%;
  animation: gradientShift 4s ease infinite;
}

.goal-glow {
  background: linear-gradient(135deg, #f59e0b, #fbbf24, #fcd34d, #f59e0b);
  background-size: 300% 300%;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

.vmg-card:hover .vmg-card-glow {
  opacity: 0.7;
}

/* ── Card Inner ── */
.vmg-card-inner {
  position: relative;
  z-index: 1;
  background: var(--about-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--about-border);
  border-radius: 1.5rem;
  padding: 2rem 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
  box-shadow: var(--about-shadow);
}

.vmg-card:hover .vmg-card-inner {
  background: var(--about-surface-strong);
  border-color: var(--about-border);
  box-shadow: var(--shadow-md);
}

/* ── Number Badge ── */
.vmg-number {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  padding: 0.25rem 0.7rem;
  border-radius: 9999px;
  margin-bottom: 1.25rem;
  align-self: flex-start;
}

.vmg-card:nth-child(1) .vmg-number {
  background: color-mix(in srgb, var(--about-primary) 12%, transparent);
  color: var(--about-primary);
}

.vmg-card:nth-child(2) .vmg-number {
  background: color-mix(in srgb, var(--about-primary) 12%, transparent);
  color: var(--about-primary);
}

.vmg-card:nth-child(3) .vmg-number {
  background: color-mix(in srgb, #f59e0b 12%, transparent);
  color: #f59e0b;
}

/* ── Icon Ring ── */
.vmg-icon-ring {
  width: 4rem;
  height: 4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 1.25rem;
  position: relative;
  animation: vmgIconFloat 3s ease-in-out infinite;
}

@keyframes vmgIconFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

.vmg-card:nth-child(1) .vmg-icon-ring {
  background: color-mix(in srgb, #3b82f6 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, #3b82f6 20%, transparent);
}

.vmg-card:nth-child(2) .vmg-icon-ring {
  background: color-mix(in srgb, var(--about-primary) 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--about-primary) 20%, transparent);
}

.vmg-card:nth-child(3) .vmg-icon-ring {
  background: color-mix(in srgb, #f59e0b 10%, transparent);
  box-shadow: 0 0 0 1px color-mix(in srgb, #f59e0b 20%, transparent);
}

.vmg-icon-wrap {
  width: 2.6rem;
  height: 2.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.vmg-card:nth-child(1) .vmg-icon-wrap {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
  color: #ffffff;
  box-shadow: 0 4px 12px color-mix(in srgb, #3b82f6 30%, transparent);
}

.vmg-card:nth-child(2) .vmg-icon-wrap {
  background: linear-gradient(135deg, var(--about-primary), #4ade80);
  color: #ffffff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--about-primary) 30%, transparent);
}

.vmg-card:nth-child(3) .vmg-icon-wrap {
  background: linear-gradient(135deg, #f59e0b, #fbbf24);
  color: #ffffff;
  box-shadow: 0 4px 12px color-mix(in srgb, #f59e0b 30%, transparent);
}

/* ── Title ── */
.vmg-title {
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 0.65rem;
  letter-spacing: -0.02em;
}

.vision-title {
  color: #2563eb;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.mission-title {
  color: var(--about-saffron);
  background: linear-gradient(135deg, var(--about-saffron), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.goal-title {
  color: #d97706;
  background: linear-gradient(135deg, #d97706, #fbbf24);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.vmg-text {
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--about-ink-soft);
  margin: 0;
  flex: 1;
}

/* ── Card Footer Tag ── */
.vmg-card-footer {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--about-border);
}

.vmg-tag {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  background: var(--about-surface);
  color: var(--about-saffron);
}

.vmg-card:nth-child(1) .vmg-tag {
  background: color-mix(in srgb, #3b82f6 8%, transparent);
  color: #3b82f6;
}

.vmg-card:nth-child(2) .vmg-tag {
  background: color-mix(in srgb, var(--about-primary) 8%, transparent);
  color: var(--about-primary);
}

.vmg-card:nth-child(3) .vmg-tag {
  background: color-mix(in srgb, #f59e0b 8%, transparent);
  color: #f59e0b;
}

/* ═══════════════════════════════════════════════
   Core Values
   ═══════════════════════════════════════════════ */

.values-section {
  padding: 4rem 0;
  background: var(--about-white);
}

.values-badge-row {
  margin-bottom: 0.75rem;
}

.values-section-heading {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-ink);
  margin-bottom: 0.5rem;
}

.values-section-heading .highlight {
  background: linear-gradient(135deg, var(--about-highlight), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.values-intro {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--about-ink-soft);
  max-width: 580px;
  margin-bottom: 2.5rem;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.value-card {
  background: var(--about-surface);
  border: 1px solid var(--about-border);
  border-radius: 1.125rem;
  padding: 1.5rem 1.25rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;
}

.value-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-sm);
  border-color: color-mix(in srgb, var(--about-saffron) 30%, transparent);
}

.value-icon-wrap {
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--about-saffron) 12%, transparent);
  color: var(--about-saffron);
  margin-bottom: 1rem;
  flex-shrink: 0;
}

.value-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--about-highlight);
  margin-bottom: 0.5rem;
}

.value-body {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--about-ink-soft);
  margin: 0;
  flex: 1;
}

/* ═══════════════════════════════════════════════
   Organizational Structure
   ═══════════════════════════════════════════════ */

.org-section {
  padding: 4rem 0;
  background: var(--about-cream);
}

.org-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.org-heading {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-ink);
  margin-top: 1rem;
  margin-bottom: 1.25rem;
}

.org-heading .highlight {
  background: linear-gradient(135deg, var(--about-highlight), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.org-body {
  font-size: 0.95rem;
  line-height: 1.75;
  color: var(--about-ink-soft);
  margin-bottom: 2rem;
}

.org-visual {
  display: grid;
  place-items: center;
}

.org-logo-float {
  animation: logoFloat 5s ease-in-out infinite;
}

.org-logo {
  display: block;
  width: min(100%, 280px);
  max-height: clamp(160px, 28vw, 280px);
  object-fit: contain;
  filter: drop-shadow(0 14px 22px var(--dark-green-shadow));
  transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
    filter 0.4s ease;
}

.org-logo:hover {
  transform: scale(1.08);
  filter: drop-shadow(0 20px 36px var(--dark-green-shadow-strong));
}

@keyframes logoFloat {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-6px);
  }
}

.team-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.team-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-radius: 0.875rem;
  background: var(--about-surface);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--about-border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
}

.team-card:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  border-color: var(--about-saffron);
}

.team-card-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.625rem;
  background: color-mix(in srgb, var(--about-saffron) 10%, transparent);
  color: var(--about-saffron);
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.team-card-body {
  min-width: 0;
}

.team-role {
  font-size: 1rem;
  font-weight: 700;
  color: var(--about-highlight);
  margin-bottom: 0.2rem;
}

.team-desc {
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--about-ink-soft);
  margin: 0;
}

/* ═══════════════════════════════════════════════
   Geographical Reach — Creative Redesign
   ═══════════════════════════════════════════════ */

.geo-section {
  padding: 5rem 0;
  background: var(--about-white);
  position: relative;
  overflow: hidden;
}

/* ── Background Cambodia Map Silhouette ── */
.geo-bg-map {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500'%3E%3Cpath d='M200 20C120 40 60 100 40 180C20 260 30 340 70 400C110 460 160 490 200 495C240 490 290 460 330 400C370 340 380 260 360 180C340 100 280 40 200 20Z' fill='%230f8f69'/%3E%3Ccircle cx='120' cy='220' r='12' fill='%230f8f69'/%3E%3Ccircle cx='200' cy='280' r='12' fill='%230f8f69'/%3E%3Ccircle cx='280' cy='180' r='12' fill='%230f8f69'/%3E%3C/svg%3E");
  background-size: 280px auto;
  background-position: 85% 55%;
  background-repeat: no-repeat;
}

.geo-badge-row {
  margin-bottom: 0.75rem;
  position: relative;
  z-index: 1;
}

.geo-heading {
  font-size: clamp(1.4rem, 2.5vw, 1.8rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--about-ink);
  margin-bottom: 0.5rem;
  max-width: 540px;
  position: relative;
  z-index: 1;
}

.geo-heading .highlight {
  background: linear-gradient(135deg, var(--about-highlight), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.geo-intro {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--about-ink-soft);
  max-width: 580px;
  margin-bottom: 0.5rem;
  position: relative;
  z-index: 1;
}

/* ── Connecting Path ── */
.geo-connector {
  max-width: 100%;
  margin: 0.75rem 0 2rem;
  position: relative;
  z-index: 1;
}

.geo-connector svg {
  display: block;
  width: 100%;
  height: 32px;
}

/* ── Card Grid ── */
.geo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

/* ── Province Card ── */
.geo-card {
  display: flex;
  flex-direction: column;
  border-radius: 1.25rem;
  background: var(--about-surface);
  border: 1px solid var(--about-border);
  position: relative;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.4s ease,
    border-color 0.4s ease;
  box-shadow: var(--shadow-sm);
}

.geo-card::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 1.35rem;
  background: conic-gradient(from 0deg,
      transparent,
      var(--province-accent),
      transparent 30%,
      transparent 70%,
      var(--province-accent),
      transparent);
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 0;
  pointer-events: none;
  animation: none !important;
}

@keyframes geoSpin {
  to {
    transform: rotate(360deg);
  }
}

.geo-card:hover::before {
  opacity: 0.6;
}

.geo-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.08);
  border-color: var(--province-accent);
}

/* ── Top Band ── */
.geo-card-band {
  position: relative;
  z-index: 1;
  height: 6px;
  background: var(--about-cream);
  border-radius: 1.25rem 1.25rem 0 0;
  overflow: hidden;
}

.geo-card-band-inner {
  height: 100%;
  width: 0%;
  background: linear-gradient(90deg, var(--province-accent), color-mix(in srgb, var(--province-accent) 60%, #4ade80));
  transition: width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.geo-card:hover .geo-card-band-inner {
  width: 100%;
}

/* ── Card Body ── */
.geo-card-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem 1.5rem 1.5rem;
  background: var(--about-white);
  flex: 1;
}

/* ── Pulsing Marker ── */
.geo-marker-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.geo-marker-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid var(--province-accent);
  opacity: 0;
  animation: none !important;
  animation-delay: calc(var(--pulse-delay, 0) * 0.4s);
}

.geo-card:nth-child(1) .geo-marker-pulse {
  --pulse-delay: 0;
}

.geo-card:nth-child(2) .geo-marker-pulse {
  --pulse-delay: 1;
}

.geo-card:nth-child(3) .geo-marker-pulse {
  --pulse-delay: 2;
}

@keyframes geoPulse {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }

  60% {
    transform: scale(1.6);
    opacity: 0;
  }

  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.geo-marker-icon {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in srgb, var(--province-accent) 10%, transparent);
  color: var(--province-accent);
  transition: transform 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.geo-card:hover .geo-marker-icon {
  transform: scale(1.1);
  background: color-mix(in srgb, var(--province-accent) 18%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--province-accent) 12%, transparent);
}

.geo-marker-icon svg {
  width: 22px;
  height: 22px;
  transition: transform 0.3s ease;
}

.geo-card:hover .geo-marker-icon svg {
  transform: translateY(-1px);
}

/* ── Province Name ── */
.geo-name {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--about-ink);
  margin-bottom: 0.2rem;
  letter-spacing: -0.02em;
  transition: color 0.3s ease;
}

.geo-card:hover .geo-name {
  color: var(--province-accent);
}

/* ── Tagline ── */
.geo-tagline {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--province-accent);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  opacity: 0.8;
}

/* ── Divider ── */
.geo-card-divider {
  width: 40px;
  height: 3px;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--province-accent), transparent);
  margin-bottom: 1rem;
  transition: width 0.3s ease;
}

.geo-card:hover .geo-card-divider {
  width: 60px;
}

/* ── Description ── */
.geo-desc {
  font-size: 0.85rem;
  line-height: 1.65;
  color: var(--about-ink-soft);
  margin: 0 0 1.25rem;
  text-align: center;
  flex: 1;
}

/* ── Villages Stat Chip ── */
.geo-stat {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.45rem 1rem;
  border-radius: 9999px;
  background: var(--about-cream);
  border: 1px solid var(--about-border);
  transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease;
}

.geo-card:hover .geo-stat {
  background: color-mix(in srgb, var(--province-accent) 8%, transparent);
  border-color: color-mix(in srgb, var(--province-accent) 25%, transparent);
  transform: scale(1.05);
}

.geo-stat-number {
  font-size: 1rem;
  font-weight: 800;
  color: var(--province-accent);
  line-height: 1;
}

.geo-stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--about-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* ═══════════════════════════════════════════════
   Call to Action
   ═══════════════════════════════════════════════ */

.cta-section {
  padding: 3.5rem 0;
  background: linear-gradient(135deg, var(--about-saffron) 0%, #0f5e2e 100%);
  position: relative;
  overflow: hidden;
}

.cta-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse at 80% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 60%);
  pointer-events: none;
}

.cta-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cta-content h2 {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.cta-content p {
  font-size: 1rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
  margin-bottom: 2rem;
}

.cta-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.8rem 2rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.25s ease;
  cursor: pointer;
  text-decoration: none;
  letter-spacing: 0.02em;
}

.btn-primary {
  background: #ffffff;
  color: var(--about-saffron);
  border: 1px solid #ffffff;
}

.btn-primary:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.btn-outline {
  background: transparent;
  color: var(--about-white);
  border: 1px solid var(--text-on-dark-secondary);
}

.btn-outline:hover {
  border-color: var(--about-white);
  background: var(--green-tint-light);
  transform: translateY(-1px);
}

/* ─── Reduced Motion ─── */
@media (prefers-reduced-motion: reduce) {

  .reveal,
  .reveal.revealed {
    opacity: 1;
    transform: none;
    transition: none;
  }

  .hero-content {
    animation: none;
  }

  .vmg-card:hover,
  .value-card:hover,
  .geo-card:hover,
  .team-card:hover {
    transform: none;
  }

  .geo-card::before {
    animation: none !important;
  }

  .geo-marker-pulse {
    animation: none !important;
  }

  .photo-frame {
    animation: none !important;
    opacity: 1;
  }

  .photo-frame::after {
    animation: none !important;
    opacity: 1;
  }

  .photo-frame .photo-img {
    animation: none !important;
    transform: none !important;
  }

  .photo-frame .photo-inner {
    transition: none;
    will-change: auto;
  }

  .photo-frame:hover .photo-inner {
    transform: none !important;
    box-shadow: none !important;
  }

  .photo-sweep {
    animation: none !important;
    display: none;
  }

  .photo-caption {
    animation: none !important;
    opacity: 1;
  }

  .photo-caption-dot {
    animation: none !important;
  }

  .org-logo-float {
    animation: none;
  }

  .logo-frame:hover {
    transform: none;
  }

  .logo-frame:hover .logo-frame-inner {
    transform: none;
  }

  .logo-frame-img {
    animation: none;
    opacity: 1;
  }
}

/* ═══════════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════════ */

@media (min-width: 768px) and (max-width: 1023px) {
  .story-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .vmg-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .values-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .org-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }

  .geo-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .geo-connector {
    display: none;
  }
}

@media (max-width: 767px) {
  .hero-content {
    padding-block: 2.5rem;
  }

  .hero-title {
    font-size: clamp(1.8rem, 10vw, 2.4rem);
  }

  .hero-subtitle {
    font-size: 0.95rem;
    line-height: 1.65;
  }

  .hero-stats-row {
    gap: 1rem;
  }

  .hero-stat-value {
    font-size: 1.2rem;
  }

  .hero-stat-divider {
    display: none;
  }

  .story-section,
  .vmg-section,
  .values-section,
  .org-section,
  .geo-section {
    padding-block: 3rem;
  }

  .story-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .story-heading {
    font-size: 1.5rem;
  }

  .vmg-flow {
    display: none;
  }

  .vmg-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .vmg-section-heading {
    margin-bottom: 1.5rem;
  }

  .values-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .org-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .org-visual {
    margin-inline: auto;
  }

  .geo-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .geo-heading {
    max-width: 100%;
  }

  .geo-connector {
    display: none;
  }

  .geo-card-body {
    padding: 1.5rem 1.25rem 1.25rem;
  }
}

@media (max-width: 480px) {
  .section-badge {
    font-size: 0.7rem;
    padding: 0.3rem 0.75rem;
  }

  .org-logo {
    width: min(100%, 200px);
  }

  .vmg-card-inner {
    padding: 1.5rem 1rem;
  }

  .cta-section {
    padding: 3.5rem 0;
  }
}
</style>
