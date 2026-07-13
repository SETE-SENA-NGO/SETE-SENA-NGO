<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, computed } from 'vue'
import Slideshow from '@/components/shared/Slideshow.vue'

// Dummy news data – replace with API call later
const newsItems = ref([
  {
    id: 1,
    title: 'New community pre‑school opens in Svay Rieng',
    summary:
      'With support from local partners, Santi Sena inaugurated a new pre‑school serving 60 children in a remote village.',
    image: 'src/assets/maps/student.png',
    date: '2025-03-15',
    category: 'Education',
    author: 'Santi Sena Communications Team',
    featured: true,
    readTime: '3 min read',
  },
  {
    id: 2,
    title: 'Forest Guardians celebrate 500 hectares of protected land',
    summary:
      'Community forestry committees have successfully conserved 500 hectares of forest, boosting biodiversity and livelihoods.',
    image: 'src/assets/maps/wash.png',

    date: '2025-02-28',
    category: 'Environment',
    author: 'Santi Sena Environment Team',
    featured: false,
    readTime: '4 min read',
  },
  {
    id: 3,
    title: 'Youth leaders trained in child protection advocacy',
    summary:
      'Over 40 young volunteers completed a training on child rights and protection, ready to act as peer educators in their villages.',
    image: 'src/assets/maps/certi.png',

    date: '2025-02-10',
    category: 'Child Protection',
    author: 'Santi Sena Child Protection Team',
    featured: false,
    readTime: '2 min read',
  },
  {
    id: 4,
    title: 'Saving‑for‑Change groups reach 10,000 members',
    summary:
      'The village savings program now boasts more than 10,000 active members, providing financial security to hundreds of families.',
    image: 'src/assets/maps/pre-school.png',

    date: '2025-01-20',
    category: 'Livelihood',
    author: 'Santi Sena Livelihood Unit',
    featured: false,
    readTime: '3 min read',
  },
  {
    id: 5,
    title: 'New partnership to expand clean water access',
    summary:
      'Santi Sena partners with WaterAid to bring safe drinking water to 15 additional villages in Kratie province.',
    image: 'src/assets/maps/water.png',

    date: '2025-01-05',
    category: 'WASH',
    author: 'Santi Sena WASH Team',
    featured: false,
    readTime: '5 min read',
  },
])

const heroSlides = [
  { image: '/images/programs/hero-1.jpg', caption: '' },
  { image: '/images/programs/hero-2.jpg', caption: '' },
  { image: '/images/programs/hero-3.jpg', caption: '' },
  { image: '/images/programs/hero-4.jpg', caption: '' },
]

// Category filter
const categories = ['All', 'Education', 'Environment', 'Child Protection', 'Livelihood', 'WASH']

const selectedCategory = ref('All')
const searchQuery = ref('')

const filteredNews = computed(() => {
  return newsItems.value.filter((item) => {
    const matchesCategory =
      selectedCategory.value === 'All' || item.category === selectedCategory.value
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.summary.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesCategory && matchesSearch
  })
})

// Featured article (the first featured one, or none)
const featuredArticle = computed(() => newsItems.value.find((item) => item.featured))
const regularArticles = computed(() => filteredNews.value.filter((item) => !item.featured))
</script>

<template>
  <div class="news-view">
    <!-- Page Hero (image slideshow style like other pages) -->
    <Slideshow :slides="heroSlides">
      <div class="hero-overlay" />
      <div class="hero-content">
        <span class="eyebrow">News & Stories</span>
        <h1>News & Stories Latest updates from the field</h1>
        <p class="hero-subtitle">Stay informed about our work with communities across Cambodia.</p>
      </div>
    </Slideshow>

    <!-- Filter & Search Bar -->
    <div class="container">
      <div class="filter-section">
        <div class="category-filters">
          <button
            v-for="cat in categories"
            :key="cat"
            :class="['filter-btn', { active: selectedCategory === cat }]"
            @click="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>
        <div class="search-wrapper">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search news..."
            class="search-input"
          />
          <span class="search-icon">🔍</span>
        </div>
      </div>

      <!-- Featured Article (if any) -->
      <div v-if="featuredArticle" class="featured-section">
        <span class="featured-tag">⭐ Featured</span>
        <RouterLink :to="`/news/${featuredArticle.id}`" class="featured-card">
          <div class="featured-image">
            <img :src="featuredArticle.image" :alt="featuredArticle.title" />
          </div>
          <div class="featured-content">
            <div class="news-meta">
              <span class="news-category">{{ featuredArticle.category }}</span>
              <time class="news-date">{{
                new Date(featuredArticle.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })
              }}</time>
            </div>
            <h2 class="featured-title">{{ featuredArticle.title }}</h2>
            <p class="featured-summary">{{ featuredArticle.summary }}</p>
            <div class="featured-footer">
              <span class="news-author">{{ featuredArticle.author }}</span>
              <span class="news-readtime">{{ featuredArticle.readTime }}</span>
            </div>
            <span class="read-more-link">Read full story →</span>
          </div>
        </RouterLink>
      </div>

      <!-- Regular News Grid -->
      <div v-if="regularArticles.length > 0" class="news-grid">
        <article v-for="item in regularArticles" :key="item.id" class="news-card">
          <RouterLink :to="`/news/${item.id}`" class="card-link">
            <div class="news-image">
              <img :src="item.image" :alt="item.title" />
            </div>
            <div class="news-content">
              <div class="news-meta">
                <span class="news-category">{{ item.category }}</span>
                <time class="news-date">{{
                  new Date(item.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}</time>
              </div>
              <h2 class="news-title">{{ item.title }}</h2>
              <p class="news-summary">{{ item.summary }}</p>
              <div class="news-footer">
                <span class="news-author">{{ item.author }}</span>
                <span class="news-readtime">{{ item.readTime }}</span>
              </div>
            </div>
          </RouterLink>
        </article>
      </div>
      <div v-else class="no-results">
        <p>No articles match your filters. Try a different search or category.</p>
      </div>
      <div class="news-actions">
        <RouterLink to="/" class="back-home">← Back to home</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Global Reset & Colors ── */
.news-view {
  min-height: 90vh;
  background: var(--color-cream);
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* ── Page Hero ── */
/* Use the same “hero overlay” look as other slideshow-based pages.
   (No static .page-hero wrapper anymore; styles apply to slot content.) */
.hero-content {
  max-width: 700px;
  margin-left: 120px;
  color: #fffdf8;
}

.hero-content .eyebrow {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  font-weight: 700;
  color: #49cea2;
  background: rgba(120, 255, 1, 0.08);
  padding: 0.3rem 1.2rem;
  border-radius: 999px;
  backdrop-filter: none;
  margin-bottom: 0.75rem;
  margin-top: 6rem;
}

.hero-content h1 {
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 700;
  color: #ffffff;
  margin: 0.75rem 0 0.75rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(253, 248, 239, 0.85);
  max-width: 600px;
  margin: 0 auto;
}

/* ── Filter & Search ── */
.filter-section {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;
  padding: 2rem 0 1.5rem;
  border-bottom: 1px solid var(--color-border);
  margin-bottom: 2rem;
}

.category-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.filter-btn {
  padding: 0.4rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: transparent;
  color: var(--color-ink-soft);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.filter-btn:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.filter-btn.active {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
}

.search-wrapper {
  position: relative;
  flex: 1 1 220px;
  max-width: 280px;
}

.search-input {
  width: 100%;
  padding: 0.5rem 1rem 0.5rem 2.4rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #fff;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--color-ink-soft);
}

/* ── Featured Section ── */
.featured-section {
  margin-bottom: 3rem;
  position: relative;
}

.featured-tag {
  display: inline-block;
  background: #ffb347;
  color: #1e1a16;
  font-weight: 700;
  font-size: 0.7rem;
  letter-spacing: 0.08em;
  padding: 0.2rem 1rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
}

.featured-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  background: #fff;
  border-radius: 1.5rem;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(47, 36, 29, 0.08);
  border: 1px solid rgba(47, 36, 29, 0.05);
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.3s,
    box-shadow 0.3s;
}

.featured-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(47, 36, 29, 0.12);
}

.featured-image {
  aspect-ratio: 16 / 10;
  overflow: hidden;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.featured-card:hover .featured-image img {
  transform: scale(1.03);
}

.featured-content {
  padding: 1.5rem 1.5rem 1.5rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-title {
  font-size: 1.8rem;
  color: var(--primary-dark);
  margin: 0.5rem 0 0.75rem;
  line-height: 1.2;
}

.featured-summary {
  color: var(--color-ink-soft);
  line-height: 1.6;
  margin-bottom: 1rem;
}

.featured-footer {
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  margin-bottom: 1rem;
}

.read-more-link {
  font-weight: 600;
  color: var(--primary-color);
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
  align-self: flex-start;
}

.featured-card:hover .read-more-link {
  border-color: currentColor;
}

/* ── News Grid ── */
.news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-top: 1rem;
}

.news-card {
  background: #fff;
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s,
    box-shadow 0.3s;
  border: 1px solid var(--color-border);
}

.news-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(22, 48, 42, 0.12);
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.news-image {
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.news-card:hover .news-image img {
  transform: scale(1.03);
}

.news-content {
  padding: 1.25rem;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  margin-bottom: 0.5rem;
}

.news-category {
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-color);
}

.news-title {
  margin: 0 0 0.4rem;
  font-size: 1.25rem;
  color: var(--primary-dark);
  line-height: 1.3;
}

.news-summary {
  color: var(--color-ink-soft);
  line-height: 1.6;
  font-size: 0.95rem;
  margin-bottom: 0.75rem;
}

.news-footer {
  display: flex;
  gap: 1.5rem;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
}

.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 1rem;
  color: var(--color-ink-soft);
}

/* ── Bottom actions ── */
.news-actions {
  margin-top: 2.5rem;
  display: flex;
  justify-content: center;
}

.back-home {
  display: inline-flex;
  align-items: center;
  margin-bottom: 40px;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 26px rgba(22, 90, 69, 0.25);
  transition:
    transform 0.2s ease,
    box-shadow 0.25s ease;
}

.back-home:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 34px rgba(22, 90, 69, 0.33);
}

/* ── Responsive ── */
@media (max-width: 992px) {
  .featured-card {
    grid-template-columns: 1fr;
  }
  .featured-content {
    padding: 1.5rem;
  }
  .news-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .news-grid {
    grid-template-columns: 1fr;
  }
  .filter-section {
    flex-direction: column;
    align-items: stretch;
  }
  .search-wrapper {
    max-width: 100%;
  }
  .page-hero h1 {
    font-size: 1.8rem;
  }
  .featured-title {
    font-size: 1.4rem;
  }
}
</style>
