<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="badge">About Us</span>
          <h1>Learn More About<br />Our Mission</h1>
          <p class="hero-subtitle">
            We are dedicated to creating positive change and empowering communities around the world.
          </p>
        </div>
      </div>
    </section>

    <!-- Intro Section -->
    <section class="section intro-section">
      <div class="container">
        <p class="intro-text">
          Decades of war and unregulated logging stripped southeastern Cambodia of its forest cover and water security. 
          Santi Sena works village by village to restore the land base that makes farming, drinking water and Buddhist ceremony possible.
        </p>
      </div>
    </section>

    <!-- Impact Stats Section -->
    <section class="section stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">570+</span>
            <span class="stat-label">HECTARES</span>
            <p class="stat-desc">Community forest under active protection and restoration.</p>
          </div>
          <div class="stat-card">
            <span class="stat-number">50k+</span>
            <span class="stat-label">SAPLINGS</span>
            <p class="stat-desc">Grown each year in village nurseries.</p>
          </div>
          <div class="stat-card">
            <span class="stat-number">300+</span>
            <span class="stat-label">BIOGAS UNITS</span>
            <p class="stat-desc">Replacing firewood in rural kitchens.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- What We Do Section -->
    <section class="section programs-section">
      <div class="container">
        <h2 class="section-title">What we do</h2>
        <ul class="programs-list">
          <li>Community forestry management with legally recognized village committees</li>
          <li>Tree nurseries and annual reforestation campaigns (native and fruit species)</li>
          <li>WASH and community-led total sanitation (CLTS) programs</li>
          <li>Climate change adaptation training for rice and vegetable farmers</li>
          <li>Household biogas systems that cut firewood use and indoor smoke</li>
          <li>Melaleuca oil and non-timber forest enterprise for forest guardians</li>
        </ul>
      </div>
    </section>

    <!-- Approach Section -->
    <section class="section approach-section">
      <div class="container">
        <h2 class="section-title">Our approach</h2>
        <p class="approach-text">
          Every project starts with a village-led resource map: what forest remains, what water sources survive the dry season, 
          what fuel families cook with. From there, we co-design a five-year plan — nursery locations, patrol rotas, 
          biogas priority households — and stay long enough to see the trees mature.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* =====================
   Layout Helpers
   ===================== */
.about-page {
  min-height: 100vh;
  font-family: inherit;
  color: var(--ink);
  background: #FBF3E3;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section {
  padding: 5rem 0;
}

/* =====================
   Hero
   ===================== */
.hero {
  background: #FBF3E3;
  padding: 4rem 1.5rem 3rem;
}

.hero-content {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.badge {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--green);
  margin-bottom: 1.25rem;
  padding: 0.35rem 1.1rem;
  border: 1px solid rgba(22, 48, 42, 0.15);
  border-radius: 9999px;
  background: rgba(22, 48, 42, 0.05);
}

.hero-content h1 {
  font-size: 3.25rem;
  font-weight: 700;
  line-height: 1.2;
  color: #1B4D4D;
  margin-bottom: 1.25rem;
  font-family: var(--font-serif);
}

.hero-subtitle {
  font-size: 1.15rem;
  color: var(--ink);
  line-height: 1.7;
  max-width: 700px;
  margin: 0 auto;
}

/* =====================
   Intro Section
   ===================== */
.intro-section {
  padding: 3rem 0;
}

.intro-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--ink);
  max-width: 900px;
}

/* =====================
   Stats Section
   ===================== */
.stats-section {
  padding: 3rem 0 4rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}

.stat-card {
  background: #ffffff;
  border-radius: 1rem;
  padding: 2.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(22, 48, 42, 0.08);
}

.stat-number {
  display: block;
  font-size: 3rem;
  font-weight: 700;
  color: #B8651A;
  margin-bottom: 0.5rem;
  font-family: var(--font-serif);
}

.stat-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--green);
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
}

.stat-desc {
  font-size: 0.95rem;
  color: var(--ink);
  line-height: 1.6;
}

/* =====================
   Programs Section
   ===================== */
.programs-section {
  padding: 4rem 0;
  background: #ffffff;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1B4D4D;
  margin-bottom: 2rem;
  font-family: var(--font-serif);
}

.programs-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.programs-list li {
  font-size: 1.1rem;
  color: var(--ink);
  line-height: 1.7;
  padding-left: 1.5rem;
  position: relative;
}

.programs-list li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: #B8651A;
  font-weight: bold;
  font-size: 1.3rem;
}

/* =====================
   Approach Section
   ===================== */
.approach-section {
  padding: 4rem 0;
}

.approach-text {
  font-size: 1.15rem;
  line-height: 1.8;
  color: var(--ink);
  max-width: 900px;
}

/* =====================
   Responsive
   ===================== */
@media (max-width: 1024px) {
  .stats-grid {
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
  .section-title {
    font-size: 2rem;
  }
  .section {
    padding: 3rem 0;
  }
  .stats-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 1.85rem;
  }
  .stat-number {
    font-size: 2.5rem;
  }
}
</style>
