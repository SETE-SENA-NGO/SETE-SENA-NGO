<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Slideshow background images (Unsplash - free to use)
const slides = [
  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&q=80',  // forest/nature
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1600&q=80',  // green landscape
  'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80',  // forest path
  'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1600&q=80',  // nature/sunlight
]

const currentSlide = ref(0)
const isTransitioning = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null

function nextSlide() {
  if (isTransitioning.value) return
  isTransitioning.value = true
  currentSlide.value = (currentSlide.value + 1) % slides.length
  setTimeout(() => {
    isTransitioning.value = false
  }, 1200)
}

function startSlideshow() {
  intervalId = setInterval(nextSlide, 5000)
}

function stopSlideshow() {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

onMounted(() => {
  startSlideshow()
})

onUnmounted(() => {
  stopSlideshow()
})
</script>

<template>
  <div class="environment-page">
    <!-- Hero Section -->
    <section class="hero">
      <!-- Slideshow backgrounds -->
      <div class="slideshow-container">
        <div
          v-for="(src, index) in slides"
          :key="index"
          class="slide"
          :class="{ active: index === currentSlide, prev: index === (currentSlide - 1 + slides.length) % slides.length }"
          :style="{ backgroundImage: `url(${src})` }"
        ></div>
        <div class="hero-overlay"></div>
        <!-- Gradient overlay for text readability -->
        <div class="hero-gradient-overlay"></div>
      </div>

      <!-- Slide indicators -->
      <div class="slide-indicators">
        <button
          v-for="(_, index) in slides"
          :key="index"
          class="indicator-dot"
          :class="{ active: index === currentSlide }"
          @click="currentSlide = index"
          :aria-label="`Go to slide ${index + 1}`"
        ></button>
      </div>

      <div class="hero-content">
        <span class="badge">Environment Program</span>
        <h1>Protecting Our Planet<br />For Future Generations</h1>
        <p class="hero-subtitle">
          We are committed to environmental conservation, sustainable practices, and 
          empowering communities to become stewards of their natural resources.
        </p>
      </div>
    </section>

    <!-- Program Overview Section -->
    <section class="section overview-section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Our Approach</span>
          <h2>Environmental Stewardship in Action</h2>
          <p class="section-desc">
            Our environment program takes a holistic approach to conservation, combining 
            immediate action with long-term community education and sustainable development.
          </p>
        </div>
        <div class="overview-grid">
          <div class="overview-card">
            <div class="icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <h3>Conservation</h3>
            <p>
              Protecting and restoring natural habitats, wildlife corridors, and biodiversity 
              hotspots through community-led initiatives and scientific research.
            </p>
          </div>
          <div class="overview-card">
            <div class="icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h3>Sustainability</h3>
            <p>
              Promoting renewable energy, sustainable agriculture, and circular economy 
              practices that reduce environmental impact while supporting livelihoods.
            </p>
          </div>
          <div class="overview-card">
            <div class="icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3>Community Engagement</h3>
            <p>
              Empowering local communities with knowledge, resources, and tools to actively 
              participate in environmental protection and climate action.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Initiatives Section -->
    <section class="section initiatives-section alt-bg">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Key Initiatives</span>
          <h2 style="font-family: var(--font-serif);">What We're Doing</h2>
        </div>
        <div class="initiatives-list">
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80" alt="Reforestation Projects" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Reforestation Projects</h3>
              <p>
                Planting native tree species to restore degraded forests, combat desertification, 
                and create carbon sinks. We've planted over 500,000 trees across 12 communities.
              </p>
            </div>
          </div>
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80" alt="Environmental Education" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Environmental Education</h3>
              <p>
                Developing curriculum and training programs for schools and community groups 
                to build environmental literacy and promote sustainable practices from an early age.
              </p>
            </div>
          </div>
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80" alt="Renewable Energy Access" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Renewable Energy Access</h3>
              <p>
                Installing solar panels and clean energy solutions in rural communities, 
                reducing dependence on fossil fuels and improving quality of life.
              </p>
            </div>
          </div>
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1548685913-fe6678b0d5c9?w=800&q=80" alt="Water Conservation" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Water Conservation</h3>
              <p>
                Implementing rainwater harvesting, watershed management, and water purification 
                systems to ensure clean water access and protect aquatic ecosystems.
              </p>
            </div>
          </div>
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800&q=80" alt="Sustainable Agriculture" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Sustainable Agriculture</h3>
              <p>
                Training farmers in organic farming, crop rotation, and agroforestry techniques 
                that increase yields while preserving soil health and biodiversity.
              </p>
            </div>
          </div>
          <div class="initiative-item">
            <div class="initiative-image">
              <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80" alt="Climate Research & Advocacy" loading="lazy" />
              <div class="initiative-overlay"></div>
            </div>
            <div class="initiative-content">
              <h3>Climate Research & Advocacy</h3>
              <p>
                Conducting climate impact assessments and advocating for policy changes that 
                protect vulnerable ecosystems and promote environmental justice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Impact Stats Section -->
    <section class="section impact-section alt-bg">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Our Impact</span>
          <h2>Making a Difference</h2>
        </div>
        <div class="impact-grid">
          <div class="impact-card">
            <span class="impact-number">500K+</span>
            <span class="impact-label">Trees Planted</span>
          </div>
          <div class="impact-card">
            <span class="impact-number">12</span>
            <span class="impact-label">Communities Served</span>
          </div>
          <div class="impact-card">
            <span class="impact-number">50+</span>
            <span class="impact-label">Ecosystems Protected</span>
          </div>
          <div class="impact-card">
            <span class="impact-number">10K+</span>
            <span class="impact-label">People Trained</span>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="section process-section alt-bg">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Our Process</span>
          <h2>How We Work</h2>
          <p class="section-desc">
            Our approach combines scientific expertise with community participation to create 
            lasting environmental change.
          </p>
        </div>
        <div class="process-steps">
          <div class="process-step">
            <div class="step-number">01</div>
            <h3>Assessment</h3>
            <p>
              We conduct comprehensive environmental assessments to understand local ecosystems, 
              identify challenges, and prioritize interventions.
            </p>
          </div>
          <div class="process-step">
            <div class="step-number">02</div>
            <h3>Planning</h3>
            <p>
              Working with community leaders and environmental experts, we develop tailored 
              action plans that balance conservation with community needs.
            </p>
          </div>
          <div class="process-step">
            <div class="step-number">03</div>
            <h3>Implementation</h3>
            <p>
              We execute projects with active community participation, ensuring local ownership 
              and building capacity for long-term sustainability.
            </p>
          </div>
          <div class="process-step">
            <div class="step-number">04</div>
            <h3>Monitoring & Learning</h3>
            <p>
              Continuous monitoring and evaluation help us measure impact, learn from experiences, 
              and adapt our strategies for greater effectiveness.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quote Section -->
    <section class="quote-section">
      <div class="container">
        <blockquote>
          <svg class="quote-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
          </svg>
          <p class="quote-text">
            "We do not inherit the earth from our ancestors; we borrow it from our children. 
            Our environmental program is a pledge to protect that inheritance and ensure 
            future generations inherit a planet that is healthy, vibrant, and full of possibility."
          </p>
          <cite>— SETE SENA Environmental Team</cite>
        </blockquote>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Join the Environmental Movement</h2>
          <p>
            Whether you want to volunteer, partner with us, or support our conservation efforts, 
            your contribution helps create a sustainable future for all.
          </p>
          <div class="cta-actions">
            <router-link to="/contact" class="btn btn-primary">Get Involved</router-link>
            <router-link to="/about" class="btn btn-outline">Learn More</router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.environment-page {
  min-height: 100vh;
  font-family: inherit;
  color: var(--ink);
  background: #FCF6E9;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 5rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 3.5rem;
}

.overview-section,
.process-section {
  background: #f5ebe0;
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--green);
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  border: 1px solid rgba(22, 48, 42, 0.15);
  border-radius: 9999px;
  background: rgba(22, 48, 42, 0.05);
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.25;
  color: var(--green);
  margin-bottom: 0.75rem;
  font-family: var(--font-serif);
}

.section-desc {
  color: var(--ink);
  font-size: 1.1rem;
  max-width: 540px;
  margin: 0 auto;
}

.alt-bg {
  background: #f5ebe0;
}

/* =====================
   Hero
   ===================== */
.hero {
  position: relative;
  min-height: 70vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 5rem 1.5rem;
}

/* Slideshow */
.slideshow-container {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 1.2s ease-in-out;
  will-change: opacity;
}

.slide.active {
  opacity: 1;
  z-index: 1;
}

.slide.prev {
  /* Keep the previous slide visible briefly during crossfade */
  opacity: 0;
  z-index: 0;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.65) 0%, rgba(22, 48, 42, 0.55) 100%);
  z-index: 2;
}

/* Gradient edge fade for smooth blending */
.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(15, 23, 42, 0.7) 0%, transparent 50%),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.4) 0%, transparent 35%),
    linear-gradient(to right, rgba(22, 48, 42, 0.3) 0%, transparent 60%);
  z-index: 3;
  pointer-events: none;
}

/* Slide indicators */
.slide-indicators {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.6rem;
  z-index: 10;
}

.indicator-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.indicator-dot:hover {
  border-color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.25);
}

.indicator-dot.active {
  background: #ffffff;
  border-color: #ffffff;
  transform: scale(1.2);
}

/* Hero Content */
.hero-content {
  position: relative;
  z-index: 5;
  text-align: center;
  max-width: 780px;
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

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #ffffff;
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
}

.hero-content h1 {
  font-size: 3.25rem;
  font-weight: 800;
  line-height: 1.15;
  color: #ffffff;
  margin-bottom: 1.25rem;
  letter-spacing: -0.02em;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.25);
}

.hero-subtitle {
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  max-width: 600px;
  margin: 0 auto;
  text-shadow: 0 1px 12px rgba(0, 0, 0, 0.2);
}

/* =====================
   Overview Grid
   ===================== */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.overview-card {
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.overview-card:hover {
  border-color: rgba(22, 48, 42, 0.25);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  transform: translateY(-2px);
}

.icon-wrapper {
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background: #f5ebe0;
  color: var(--green);
  margin-bottom: 1.25rem;
}

.overview-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--green);
  font-family: var(--font-serif);
}

.overview-card p {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.65;
}

/* =====================
   Initiatives
   ===================== */
.initiatives-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.initiative-item {
  position: relative;
  border-radius: 1rem;
  overflow: hidden;
  height: 400px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
}

.initiative-item:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
}

.initiative-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.initiative-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

@media (hover: hover) {
  .initiative-item:hover .initiative-image img {
    transform: scale(1.1);
  }
}

.initiative-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(22, 48, 42, 0.3) 0%,
    rgba(22, 48, 42, 0.5) 50%,
    rgba(22, 48, 42, 0.85) 100%
  );
  transition: all 0.4s ease;
}

@media (hover: hover) {
  .initiative-item:hover .initiative-overlay {
    background: linear-gradient(
      to bottom,
      rgba(22, 48, 42, 0.4) 0%,
      rgba(22, 48, 42, 0.6) 50%,
      rgba(22, 48, 42, 0.9) 100%
    );
  }
}

.initiative-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  z-index: 2;
  color: #ffffff;
  transform: translateY(0);
  transition: all 0.4s ease;
}

.initiative-content h3 {
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #ffffff;
  letter-spacing: -0.01em;
  font-family: var(--font-serif);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.initiative-content p {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.9);
  line-height: 1.6;
  opacity: 0.9;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

/* =====================
   Impact Stats
   ===================== */
.impact-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.impact-card {
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.impact-card:hover {
  border-color: rgba(22, 48, 42, 0.25);
  transform: translateY(-2px);
}

.impact-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--orange);
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.impact-label {
  font-size: 0.9rem;
  color: var(--ink);
  font-weight: 500;
}

/* =====================
   Process Steps
   ===================== */
.process-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
}

.process-step {
  text-align: center;
  padding: 2rem 1.5rem;
  background: linear-gradient(145deg, #ffffff 0%, #f5ebe0 100%);
  border: 1px solid rgba(22, 48, 42, 0.08);
  border-radius: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
}

.process-step:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
}

.step-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--green);
  opacity: 0.2;
  margin-bottom: 1rem;
  line-height: 1;
  font-family: var(--font-serif);
}

.process-step h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--green);
  font-family: var(--font-serif);
}

.process-step p {
  font-size: 0.9rem;
  color: var(--ink);
  line-height: 1.65;
}

/* =====================
   Quote
   ===================== */
.quote-section {
  padding: 5rem 0;
  background: linear-gradient(180deg, #f5ebe0 0%, #f0e6d8 100%);
  border-top: 1px solid rgba(22, 48, 42, 0.08);
  border-bottom: 1px solid rgba(22, 48, 42, 0.08);
  position: relative;
  overflow: hidden;
}

.quote-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23228047' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.5;
  pointer-events: none;
}

.quote-section blockquote {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.quote-icon {
  color: var(--green);
  opacity: 0.12;
  margin-bottom: 1rem;
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: var(--ink);
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.quote-section cite {
  font-style: normal;
  font-size: 0.9rem;
  color: var(--ink-soft);
}

/* =====================
   CTA
   ===================== */
.cta-section {
  padding: 5rem 0;
  background: linear-gradient(135deg, #f5ebe0 0%, #f0e6d8 100%);
  position: relative;
}

.cta-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 50%, rgba(34, 128, 71, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 80% 50%, rgba(238, 132, 26, 0.05) 0%, transparent 50%);
  pointer-events: none;
}

.cta-content {
  text-align: center;
  max-width: 580px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.cta-content h2 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--green);
  margin-bottom: 0.75rem;
  font-family: var(--font-serif);
}

.cta-content p {
  color: var(--ink);
  line-height: 1.7;
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
  padding: 0.75rem 1.75rem;
  border-radius: 9999px;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: #ffffff;
  color: var(--ink);
  border: 1px solid rgba(22, 48, 42, 0.2);
}

.btn-primary:hover {
  background: #f5ebe0;
  border-color: var(--green-muted);
}

.btn-outline {
  background: var(--orange);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  border-color: #ffffff;
  background: #b8681a;
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .impact-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .process-steps {
    grid-template-columns: repeat(2, 1fr);
  }
  .initiatives-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.25rem;
  }
  .hero-subtitle {
    font-size: 1.05rem;
  }
  .section-header h2 {
    font-size: 1.75rem;
  }
  .section {
    padding: 3rem 0;
  }
  .overview-grid {
    grid-template-columns: 1fr;
  }
  .impact-grid {
    grid-template-columns: 1fr 1fr;
  }
  .process-steps {
    grid-template-columns: 1fr;
  }
  .cta-content h2 {
    font-size: 1.5rem;
  }

  .slide-indicators {
    bottom: 1.75rem;
    gap: 0.5rem;
  }

  .indicator-dot {
    width: 8px;
    height: 8px;
  }

  .initiatives-list {
    grid-template-columns: 1fr;
  }

  .initiative-item {
    height: 350px;
  }

  .initiative-content {
    padding: 1.5rem;
  }

  .initiative-content h3 {
    font-size: 1.25rem;
  }

  .initiative-content p {
    font-size: 0.9rem;
  }

  .btn-outline {
    color: #334155;
    border: 1px solid #cbd5e1;
  }
  .btn-outline:hover {
    border-color: #94a3b8;
    background: rgba(0, 0, 0, 0.02);
  }
}

@media (max-width: 480px) {
  .hero {
    min-height: 55vh;
    padding: 3rem 1.25rem;
  }
  .hero-content h1 {
    font-size: 1.85rem;
  }
  .impact-grid {
    gap: 0.75rem;
  }
  .impact-card {
    padding: 1.25rem 1rem;
  }
  .impact-number {
    font-size: 1.75rem;
  }
  .initiative-item {
    height: 300px;
  }
  .initiative-content {
    padding: 1.25rem;
  }
  .initiative-content h3 {
    font-size: 1.15rem;
  }
  .initiative-content p {
    font-size: 0.85rem;
  }
}
</style>
