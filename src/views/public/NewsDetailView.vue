<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()
const articleId = Number(route.params.id)

// ── Dummy data (replace with API call) ──
const articles = [
  {
    id: 1,
    title: 'New community pre‑school opens in Svay Rieng',
    summary: 'With support from local partners, Santi Sena inaugurated a new pre‑school serving 60 children in a remote village.',
    content: `
      <p>The new pre‑school, located in the village of Thmor Kor, was built with funding from the Australian Embassy and local community contributions. It features two classrooms, a play area, and a kitchen for preparing nutritious meals.</p>
      <p>Over 60 children are now enrolled, with three trained teachers providing early childhood education. The school also serves as a hub for parent education sessions on nutrition and child development.</p>
      <p>"This school is a dream come true for our community," said village chief Sok Heng. "Our children now have a safe place to learn and grow."</p>
      <p>The project is part of Santi Sena's broader education program that has established over 20 pre‑schools across three provinces.</p>
    `,
    image: '/src/assets/maps/student.png',
    date: '2025-03-15',
    category: 'Education',
    author: 'Santi Sena Communications Team',
    readTime: '3 min read',
  },
  {
    id: 2,
    title: 'Forest Guardians celebrate 500 hectares of protected land',
    content: `<p>After years of dedicated conservation efforts, the community forestry committees in Prey Veng have officially protected 500 hectares of forest. The area is now home to diverse wildlife and serves as a vital carbon sink.</p><p>The achievement was celebrated with a ceremony attended by provincial authorities and local villagers, who have worked tirelessly to replant trees and prevent illegal logging.</p>`,
    image: '/src/assets/maps/wash.png',
    date: '2025-02-28',
    category: 'Environment',
    author: 'Santi Sena Environment Team',
    readTime: '4 min read',
  },
  {
    id: 3,
    title: 'Youth leaders trained in child protection advocacy',
    content: `<p>Forty young volunteers from 25 villages completed a three‑day training on child rights, protection mechanisms, and reporting procedures. The participants are now equipped to lead awareness sessions in their communities.</p><p>The training was facilitated by Santi Sena's Child Protection Unit and supported by UNICEF. It is part of a larger initiative to establish youth‑led child protection networks across the province.</p>`,
    image: '/src/assets/maps/certi.png',
    date: '2025-02-10',
    category: 'Child Protection',
    author: 'Santi Sena Child Protection Team',
    readTime: '2 min read',
  },
  {
    id: 4,
    title: 'Saving‑for‑Change groups reach 10,000 members',
    content: `<p>The village savings program, which started with just 50 members in 2003, has now grown to 10,000 active participants across 293 villages. The groups provide a safe way for families to save, access small loans, and build financial resilience.</p><p>To celebrate, Santi Sena held a series of community events, highlighting success stories of members who have used loans to start small businesses or invest in education.</p>`,
    image: '/src/assets/maps/pre-school.png',
    date: '2025-01-20',
    category: 'Livelihood',
    author: 'Santi Sena Livelihood Unit',
    readTime: '3 min read',
  },
  {
    id: 5,
    title: 'New partnership to expand clean water access',
    content: `<p>Santi Sena has signed a memorandum of understanding with WaterAid to bring safe drinking water to 15 additional villages in Kratie province. The initiative includes the construction of boreholes, water purification systems, and community training on hygiene practices.</p><p>This partnership will directly benefit over 2,000 families and is expected to reduce waterborne diseases significantly.</p>`,
    image: '/src/assets/maps/water.png',
    date: '2025-01-05',
    category: 'WASH',
    author: 'Santi Sena WASH Team',
    readTime: '5 min read',
  },
]

const article = ref<any>(null)

onMounted(() => {
  article.value = articles.find(a => a.id === articleId) || null
})

// Related news: articles with same category, excluding current
const relatedArticles = computed(() => {
  if (!article.value) return []
  return articles
    .filter(a => a.id !== article.value.id && a.category === article.value.category)
    .slice(0, 2)
})
</script>

<template>
  <div class="news-detail">
    <!-- Hero with background image -->
    <section
      v-if="article"
      class="page-hero"
      :style="{ backgroundImage: `url(${article.image})` }"
    >
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <RouterLink to="/news" class="back-link">← Back to all news</RouterLink>
        <span class="eyebrow">{{ article.category }}</span>
        <h1>{{ article.title }}</h1>
        <p class="hero-subtitle">{{ article.summary }}</p>
        <div class="hero-meta">
          <span class="meta-item">By {{ article.author }}</span>
          <span class="meta-item">{{ new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
          <span class="meta-item">{{ article.readTime }}</span>
        </div>
      </div>
    </section>

    <!-- Article Body -->
    <div class="container">
      <div v-if="article" class="detail-wrapper">
        <div class="article-grid">
          <!-- Image (left) – we already used it as background, but we can still show it inline if you want.
               However, to avoid duplication, we can omit the inline image and just show content.
               For a clean design, I'll keep the image on the left as a smaller "featured" image.
          -->
          <div class="detail-image">
            <img :src="article.image" :alt="article.title" />
          </div>
          <div class="detail-content" v-html="article.content"></div>
        </div>

        <div class="detail-footer">
          <span class="tag">#{{ article.category }}</span>
        </div>

        <div v-if="relatedArticles.length > 0" class="related-section">
          <h3 class="related-title">You might also like</h3>
          <div class="related-grid">
            <RouterLink
              v-for="item in relatedArticles"
              :key="item.id"
              :to="`/news/${item.id}`"
              class="related-card"
            >
              <div class="related-image">
                <img :src="item.image" :alt="item.title" />
              </div>
              <div class="related-content">
                <span class="related-category">{{ item.category }}</span>
                <h4 class="related-headline">{{ item.title }}</h4>
                <span class="related-date">{{ new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }}</span>
              </div>
            </RouterLink>
          </div>
        </div>
      </div>

      <div v-else class="not-found">
        <h2>Article not found</h2>
        <p>The news you're looking for doesn't exist.</p>
        <RouterLink to="/news" class="btn btn--read">Go back to news list</RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.news-detail {
  min-height: 100vh;
  background: var(--color-cream);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem clamp(1.25rem, 4vw, 3rem);
}

/* ── Hero with background image ── */
.page-hero {
  position: relative;
  background-size: cover;
  background-position: center;
  padding: 5rem 1.5rem 4rem;
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(6, 18, 13, 0.88) 0%,
    rgba(6, 18, 13, 0.6) 50%,
    rgba(6, 18, 13, 0.3) 100%
  );
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 820px;
  margin: 0 auto;
  width: 100%;
}

.back-link {
  display: inline-block;
  color: #aad6c7;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1rem;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.back-link:hover {
  border-color: currentColor;
}

.eyebrow {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  font-weight: 700;
  color: #aad6c7;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.3rem 1.2rem;
  border-radius: 999px;
  backdrop-filter: blur(2px);
  margin-bottom: 0.75rem;
}

.page-hero h1 {
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 700;
  color: #fdf8ef;
  margin: 0.5rem 0 0.5rem;
  letter-spacing: -0.02em;
}

.hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.7;
  color: rgba(253, 248, 239, 0.85);
  max-width: 700px;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1rem;
  font-size: 0.85rem;
  color: rgba(253, 248, 239, 0.75);
}

.meta-item::before {
  content: '•';
  margin-right: 0.3rem;
  color: var(--primary-color);
}

.meta-item:first-child::before {
  content: '';
  margin-right: 0;
}

/* ── Article body ── */
.detail-wrapper {
  padding: 2rem 0 3rem;
}

.article-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

.detail-image {
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(47, 36, 29, 0.12);
  position: sticky;
  top: 2rem;
}

.detail-image img {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
  display: block;
}

.detail-content {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-ink);
}

.detail-content p {
  margin: 0 0 1.2rem 0;
}

.detail-content h2,
.detail-content h3 {
  margin: 1.8rem 0 0.8rem;
  color: var(--primary-dark);
}

.detail-content ul,
.detail-content ol {
  margin: 0 0 1.2rem 1.5rem;
}

.detail-content blockquote {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  border-left: 4px solid var(--primary-color);
  font-style: italic;
  color: var(--color-ink-soft);
}

.detail-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.tag {
  display: inline-block;
  background: var(--color-border);
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--color-ink-soft);
}

/* ── Related ── */
.related-section {
  margin-top: 3rem;
  padding-top: 2rem;
  border-top: 1px solid var(--color-border);
}

.related-title {
  font-size: 1.3rem;
  color: var(--primary-dark);
  margin: 0 0 1.5rem;
}

.related-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.related-card {
  display: flex;
  gap: 1rem;
  background: #fff;
  border-radius: 1rem;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  border: 1px solid var(--color-border);
  transition: transform 0.3s, box-shadow 0.3s;
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(47, 36, 29, 0.08);
}

.related-image {
  flex: 0 0 100px;
  aspect-ratio: 1 / 1;
  overflow: hidden;
}

.related-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-content {
  padding: 0.75rem 0.75rem 0.75rem 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.related-category {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--primary-color);
}

.related-headline {
  font-size: 0.95rem;
  margin: 0.2rem 0 0.3rem;
  line-height: 1.3;
  color: var(--primary-dark);
}

.related-date {
  font-size: 0.7rem;
  color: var(--color-ink-soft);
}

/* ── Not Found ── */
.not-found {
  text-align: center;
  padding: 4rem 1rem;
}

.not-found h2 {
  color: var(--primary-dark);
  margin-bottom: 0.5rem;
}

.btn--read {
  display: inline-block;
  padding: 0.5rem 1.25rem;
  border-radius: 999px;
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  transition: background 0.25s, color 0.25s;
}

.btn--read:hover {
  background: var(--primary-color);
  color: #fff;
}

/* ── Responsive ── */
@media (max-width: 820px) {
  .article-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  .detail-image {
    position: static;
  }
  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-hero {
    padding: 3rem 1.5rem 2.5rem;
    min-height: 300px;
  }
  .page-hero h1 {
    font-size: 1.6rem;
  }
  .hero-meta {
    flex-direction: column;
    gap: 0.4rem;
  }
  .meta-item::before {
    display: none;
  }
  .detail-content {
    font-size: 0.95rem;
  }
}
</style>
