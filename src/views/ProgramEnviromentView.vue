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
          <h2>What We're Doing</h2>
        </div>
        <div class="initiatives-list">
          <div class="initiative-item">
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
                <path d="M12 6v6l4 2" />
              </svg>
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
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
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
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
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
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
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
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
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
            <div class="initiative-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
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
  background: #FBF3E3;
}

.section-label {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #2563eb;
  margin-bottom: 0.75rem;
  padding: 0.35rem 1rem;
  border: 1px solid rgba(37, 99, 235, 0.15);
  border-radius: 9999px;
  background: rgba(37, 99, 235, 0.05);
}

.section-header h2 {
  font-size: 2.25rem;
  font-weight: 700;
  line-height: 1.25;
  color: #1B4D4D;
  margin-bottom: 0.75rem;
}

.section-desc {
  color: #1B4D4D;
  font-size: 1.1rem;
  max-width: 540px;
  margin: 0 auto;
}

.alt-bg {
  background: #FBF3E3;
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
  background: rgba(15, 23, 42, 0.45);
  z-index: 2;
}

/* Gradient edge fade for smooth blending */
.hero-gradient-overlay {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(to top, rgba(15, 23, 42, 0.6) 0%, transparent 40%),
    linear-gradient(to bottom, rgba(15, 23, 42, 0.3) 0%, transparent 30%);
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
  background: #FFFBF3;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem;
  transition: border-color 0.3s, box-shadow 0.3s, transform 0.2s;
}

.overview-card:hover {
  border-color: rgba(37, 99, 235, 0.25);
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
  background: #FFFBF3;
  color: #2563eb;
  margin-bottom: 1.25rem;
}

.overview-card h3 {
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1B4D4D;
}

.overview-card p {
  font-size: 0.9rem;
  color: #1B4D4D;
  line-height: 1.65;
}

/* =====================
   Initiatives
   ===================== */
.initiatives-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.initiative-item {
  background: #FFFBF3;
  border-left: 4px solid rgb(238, 132, 26);
  border-radius: 0.75rem;
  padding: 2rem 2.5rem;
  transition: all 0.3s ease;
  position: relative;
}

.initiative-item:hover {
  border-left-color: rgb(185, 104, 23);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.initiative-icon {
  display: none;
}

.initiative-content h3 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: #1B4D4D;
  letter-spacing: -0.01em;
}

.initiative-content p {
  font-size: 1.05rem;
  color: #1B4D4D;
  line-height: 1.7;
  font-style: italic;
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
  background: #FFFBF3;
  border: 1px solid #e2e8f0;
  border-radius: 1rem;
  padding: 2rem 1.5rem;
  text-align: center;
  transition: border-color 0.3s, transform 0.2s;
}

.impact-card:hover {
  border-color: rgba(37, 99, 235, 0.25);
  transform: translateY(-2px);
}

.impact-number {
  display: block;
  font-size: 2.5rem;
  font-weight: 700;
  color: #B8651A;
  margin-bottom: 0.5rem;
}

.impact-label {
  font-size: 0.9rem;
  color: #1B4D4D;
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
  padding: 1.5rem;
}

.step-number {
  font-size: 2.5rem;
  font-weight: 800;
  color: #2563eb;
  opacity: 0.2;
  margin-bottom: 1rem;
  line-height: 1;
}

.process-step h3 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1B4D4D;
}

.process-step p {
  font-size: 0.9rem;
  color: #1B4D4D;
  line-height: 1.65;
}

/* =====================
   Quote
   ===================== */
.quote-section {
  padding: 5rem 0;
  background: #FBF3E3;
  border-top: 1px solid #e2e8f0;
  border-bottom: 1px solid #e2e8f0;
}

.quote-section blockquote {
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.quote-icon {
  color: #2563eb;
  opacity: 0.12;
  margin-bottom: 1rem;
}

.quote-text {
  font-size: 1.2rem;
  font-style: italic;
  color: #1B4D4D;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.quote-section cite {
  font-style: normal;
  font-size: 0.9rem;
  color: #1B4D4D;
}

/* =====================
   CTA
   ===================== */
.cta-section {
  padding: 5rem 0;
  background: #FBF3E3;
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
  color: #1B4D4D;
  margin-bottom: 0.75rem;
}

.cta-content p {
  color: #1B4D4D;
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
  color: #000000;
  border: 1px solid #c7c7c8;
}

.btn-primary:hover {
  background: #dedede;
  border-color: #b2b2b2;
}

.btn-outline {
  background: rgb(238, 132, 26);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.btn-outline:hover {
  border-color: #ffffff;
  background: rgb(185, 104, 23);
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

  .initiative-item {
    padding: 1.75rem 1.5rem;
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
}
</style>