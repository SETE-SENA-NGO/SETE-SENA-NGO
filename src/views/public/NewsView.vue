<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'

// ─── Dummy news data ────────────────────────────────────────────────
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
    authorAvatar:
      'https://scontent.fpnh19-1.fna.fbcdn.net/v/t1.6435-9/35900553_1047076135445733_7189013137327128576_n.jpg?stp=dst-jpg_tt6&cstp=mx707x707&ctp=s707x707&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=xb5UYMAIeNMQ7kNvwEt7Q8i&_nc_oc=AdqPikyD0Z1y3BAiT_OcMuGkjgnSqV9DKQN43x6GvgKfwJquYQEAiosG5Di3wIMKqPo&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=36yLmpqg5kk7J_nxSrPEWA&_nc_ss=7b289&oh=00_AQBhUQK4Hktg9RkMOkEmODVtVSUIyB6SuY8s0oDQX39Pdg&oe=6A7C0C58',
    featured: true,
    readTime: '3 min read',
    views: 1247,
    likes: 89,
    trending: true,
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
    authorAvatar:
      'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/506530593_3179455962207729_7906865104877534081_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=5mQl5LmMygsQ7kNvwGIGKj4&_nc_oc=AdpoAa3DuGZZFRwBtdn79A7geXSQ5qaPjkhibcODSGQcyZT8NqVtbWwbxX_VxsCDRFs&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=_4hsYoxY5A2Au4YHk1j0xg&_nc_ss=7b289&oh=00_AQDJoPrS0ht2yVVpTjacF8cLwnkjCZAY9kwuv66_r3v-BQ&oe=6A5A679F',
    featured: false,
    readTime: '4 min read',
    views: 856,
    likes: 64,
    trending: false,
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
    authorAvatar:
      'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/471173194_2997098380443489_5592666706350897819_n.jpg?stp=dst-jpg_tt6&cstp=mx720x960&ctp=s720x960&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=hFP2sKxfXCsQ7kNvwHxLGf8&_nc_oc=Adr2I7CZWYRBJMnV1SK1RvJI7jQtvOTMwhAMXMPMgoshaCbN1E-_7HVYnJEa8CR5z0s&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=YU-fNkdEviJfS6YG5vhw9A&_nc_ss=7b289&oh=00_AQBOG0k1Sd8ESYZKqyeBugQDl05XREVWwbhjzFPRxLasBg&oe=6A5A5B8E',
    featured: false,
    readTime: '2 min read',
    views: 523,
    likes: 42,
    trending: false,
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
    authorAvatar:
      'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/507567691_3182212525265406_8387750789754024704_n.jpg?stp=dst-jpg_tt6&cstp=mx1944x1458&ctp=s1944x1458&_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=s3WJgdYbjO4Q7kNvwE5b8SI&_nc_oc=AdrdDhedkIVV6mkk9ih5cSJLHeWED54DAxi2H4pIwJYlNaj-6JgI34iyqZWADDFvsWQ&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=b8h1w67zdj8K6NFZyJh4Sg&_nc_ss=7b289&oh=00_AQAizxgtNDtWvLd331TlORpObCOXJNrw2Y1bdwSocYu7JA&oe=6A5A8424',
    featured: false,
    readTime: '3 min read',
    views: 2134,
    likes: 156,
    trending: true,
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
    authorAvatar:
      'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/506686989_3180477048772287_5998299243352970740_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=3bsX9ehYnOwQ7kNvwGjsu0z&_nc_oc=AdrWMcO3CYPFu2u_ujNxDyCbrMd7xkG8WTEsiEy-FxqXUjUDa2pgBfV4bK2PGirnaCU&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=JX13CMJg7q0Ca4PkxObg_g&_nc_ss=7b289&oh=00_AQCdlfPvqNIYjaV9AnBBH5kH-CzESfLgwiWWJ5EiIc1fnQ&oe=6A5A4DBB',
    featured: false,
    readTime: '5 min read',
    views: 678,
    likes: 51,
    trending: false,
  },
])

// ─── State ──────────────────────────────────────────────────────────
const savedArticles = ref<number[]>([])
const likedArticles = ref<number[]>([])
const newsletterEmail = ref('')

// Featured + regular articles
const featuredArticle = computed(() => newsItems.value.find((item) => item.featured))
const regularArticles = computed(() => newsItems.value.filter((item) => !item.featured))

// ─── Scroll‑triggered animations ──────────────────────────────────
const articleRefs = ref<HTMLElement[]>([])
const newsletterRef = ref<HTMLElement | null>(null)
const newsletterVisible = ref(false)

let articleObservers: IntersectionObserver[] = []
let newsletterObserver: IntersectionObserver | null = null

const setupIntersectionObservers = () => {
  articleObservers.forEach((obs) => obs.disconnect())
  articleObservers = []
  if (newsletterObserver) {
    newsletterObserver.disconnect()
    newsletterObserver = null
  }

  articleRefs.value.forEach((el) => {
    if (!el) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('card-visible')
          } else {
            el.classList.remove('card-visible')
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px',
      },
    )
    observer.observe(el)
    articleObservers.push(observer)
  })

  if (newsletterRef.value) {
    newsletterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            newsletterVisible.value = true
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -20px 0px',
      },
    )
    newsletterObserver.observe(newsletterRef.value)
  }
}

onMounted(() => {
  nextTick(() => {
    const els = document.querySelectorAll('.news-card')
    articleRefs.value = Array.from(els) as HTMLElement[]
    setupIntersectionObservers()
  })
})

onBeforeUnmount(() => {
  articleObservers.forEach((obs) => obs.disconnect())
  articleObservers = []
  if (newsletterObserver) {
    newsletterObserver.disconnect()
    newsletterObserver = null
  }
})

// ─── Actions ───────────────────────────────────────────────────────
const toggleSave = (id: number) => {
  const index = savedArticles.value.indexOf(id)
  if (index > -1) {
    savedArticles.value.splice(index, 1)
  } else {
    savedArticles.value.push(id)
  }
}

const toggleLike = (id: number) => {
  const index = likedArticles.value.indexOf(id)
  if (index > -1) {
    likedArticles.value.splice(index, 1)
  } else {
    likedArticles.value.push(id)
  }
}

const isSaved = (id: number) => savedArticles.value.includes(id)
const isLiked = (id: number) => likedArticles.value.includes(id)

const toastMessage = ref('')
const showToast = ref(false)
let toastTimer: number | null = null

const showToastNow = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  if (toastTimer) window.clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    showToast.value = false
  }, 2200)
}

const shareArticle = (title: string) => {
  if (navigator.share) {
    navigator
      .share({
        title,
        text: `Check out this article: ${title}`,
        url: window.location.href,
      })
      .catch(() => {})
  } else {
    navigator.clipboard
      ?.writeText(window.location.href)
      .then(() => {
        showToastNow('Link copied to clipboard!')
      })
      .catch(() => {
        showToastNow('Could not copy link. Please copy manually.')
      })
  }
}

const subscribeNewsletter = () => {
  if (newsletterEmail.value) {
    alert(`Subscribed with ${newsletterEmail.value}!`)
    newsletterEmail.value = ''
  }
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const scrollToTop = () => {
  window?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="news-view">
    <!-- Toast notification -->
    <transition name="toast">
      <div v-if="showToast" class="toast toast--success" role="status" aria-live="polite">
        <span class="toast__icon">✅</span>
        <span class="toast__text">{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- ─── BALANCED HERO (shifted right) ────────────────────── -->
    <header class="hero-static">
      <div class="hero-static-inner">
        <div class="hero-badge">
          <span class="pulse-dot"></span>
          Latest Stories
        </div>
        <h1>Stories that <span class="highlight">matter</span></h1>
        <p class="hero-subtitle">
          Discover the impact of our work with communities across Cambodia.
        </p>
        <div class="hero-stats">
          <div class="hero-stat">
            <span class="stat-number">10K+</span>
            <span class="stat-label">Community Members</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">45</span>
            <span class="stat-label">Active Projects</span>
          </div>
          <div class="hero-stat">
            <span class="stat-number">12</span>
            <span class="stat-label">Provinces</span>
          </div>
        </div>
      </div>
    </header>

    <!-- ─── MAIN CONTENT ───────────────────────────────────────── -->
    <div class="container">
      <!-- Featured Article -->
      <div v-if="featuredArticle" class="featured-section">
        <div class="featured-label">
          <span class="featured-icon">✦</span>
          Featured Story
        </div>
        <RouterLink :to="`/news/${featuredArticle.id}`" class="featured-card">
          <div class="featured-image">
            <img :src="featuredArticle.image" :alt="featuredArticle.title" />
            <div class="featured-image-overlay">
              <span v-if="featuredArticle.trending" class="trending-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                Trending
              </span>
            </div>
          </div>
          <div class="featured-content">
            <div class="news-meta">
              <span class="news-category">{{ featuredArticle.category }}</span>
              <time class="news-date">{{ formatDate(featuredArticle.date) }}</time>
            </div>
            <h2 class="featured-title">{{ featuredArticle.title }}</h2>
            <p class="featured-summary">{{ featuredArticle.summary }}</p>
            <div class="featured-footer">
              <div class="author-info">
                <div
                  class="author-avatar"
                  :style="{ backgroundImage: `url(${featuredArticle.authorAvatar})` }"
                >
                  <span v-if="!featuredArticle.authorAvatar">{{ getInitials(featuredArticle.author) }}</span>
                </div>
                <span class="news-author">{{ featuredArticle.author }}</span>
              </div>
              <div class="featured-metrics">
                <span class="metric">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {{ featuredArticle.views }}
                </span>
                <span class="metric">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    />
                  </svg>
                  {{ featuredArticle.likes }}
                </span>
                <span class="metric read-time">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {{ featuredArticle.readTime }}
                </span>
              </div>
            </div>
            <div class="featured-actions">
              <button class="action-btn read-more-btn">
                Read full story
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14" />
                  <path d="M12 5l7 7-7 7" />
                </svg>
              </button>
              <div class="action-group">
                <button
                  class="action-btn icon-btn"
                  :class="{ active: isSaved(featuredArticle.id) }"
                  @click.prevent="toggleSave(featuredArticle.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                  </svg>
                </button>
                <button
                  class="action-btn icon-btn"
                  :class="{ active: isLiked(featuredArticle.id) }"
                  @click.prevent="toggleLike(featuredArticle.id)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    />
                  </svg>
                </button>
                <button
                  class="action-btn icon-btn"
                  @click.prevent="shareArticle(featuredArticle.title)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </RouterLink>
      </div>

      <!-- ─── ALL STORIES ─────────────────────────────────────── -->
      <div class="section-header">
        <div class="section-header-left">
          <h2 class="section-title">All Stories</h2>
          <span class="section-count">{{ regularArticles.length }} articles</span>
        </div>
      </div>

      <!-- News Grid -->
      <div v-if="regularArticles.length > 0" class="news-grid">
        <article
          v-for="item in regularArticles"
          :key="item.id"
          class="news-card"
          :data-id="item.id"
        >
          <RouterLink :to="`/news/${item.id}`" class="card-link">
            <div class="news-image">
              <img :src="item.image" :alt="item.title" />
              <div class="image-badges">
                <span v-if="item.trending" class="trending-badge small">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </span>
              </div>
            </div>
            <div class="news-content">
              <div class="news-meta">
                <span class="news-category">{{ item.category }}</span>
                <time class="news-date">{{ formatDate(item.date) }}</time>
              </div>
              <h2 class="news-title">{{ item.title }}</h2>
              <p class="news-summary">{{ item.summary }}</p>
              <div class="news-footer">
                <div class="author-info compact">
                  <div
                    class="author-avatar small"
                    :style="{ backgroundImage: `url(${item.authorAvatar})` }"
                  >
                    <span v-if="!item.authorAvatar">{{ getInitials(item.author) }}</span>
                  </div>
                  <span class="news-author">{{ item.author }}</span>
                </div>
                <div class="news-metrics">
                  <span class="metric">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    {{ item.views }}
                  </span>
                  <span class="metric">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                      />
                    </svg>
                    {{ item.likes }}
                  </span>
                </div>
              </div>
            </div>
          </RouterLink>
          <div class="card-actions">
            <button
              class="action-btn icon-btn small"
              :class="{ active: isSaved(item.id) }"
              @click.prevent="toggleSave(item.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
              </svg>
            </button>
            <button
              class="action-btn icon-btn small"
              :class="{ active: isLiked(item.id) }"
              @click.prevent="toggleLike(item.id)"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                />
              </svg>
            </button>
            <button class="action-btn icon-btn small" @click.prevent="shareArticle(item.title)">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            <RouterLink :to="`/news/${item.id}`" class="action-btn icon-btn small read-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14" />
                <path d="M12 5l7 7-7 7" />
              </svg>
            </RouterLink>
          </div>
        </article>
      </div>

      <div v-else class="no-results">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <p>No articles found.</p>
      </div>

      <!-- ─── NEWSLETTER ───────────────────────────────────────── -->
      <div class="newsletter-section" ref="newsletterRef">
        <div class="newsletter-card" :class="{ 'newsletter-visible': newsletterVisible }">
          <div class="newsletter-icon">✉</div>
          <div class="newsletter-content">
            <h3>Never miss a story</h3>
            <p>Subscribe to our newsletter and get the latest updates delivered to your inbox.</p>
          </div>
          <div class="newsletter-form">
            <input
              type="email"
              v-model="newsletterEmail"
              placeholder="Enter your email"
              class="newsletter-input"
            />
            <button class="newsletter-btn" @click="subscribeNewsletter">Subscribe</button>
          </div>
        </div>
      </div>

      <!-- ─── BOTTOM ACTIONS ──────────────────────────────────── -->
      <div class="news-actions" aria-label="News page footer">
        <RouterLink to="/" class="back-home">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back to home
        </RouterLink>

        <button class="scroll-top" @click="scrollToTop">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --color-cream: #faf8f5;
  --color-border: #e8e3dc;
  --color-ink: #1e1a16;
  --color-ink-soft: #5a524a;
  --primary-color: #2d7a5a;
  --primary-dark: #1a3d2e;
  --primary-light: #aad6c7;
  --gold: #c9a84c;
  --gold-light: #e8d5a3;
  --gold-glow: rgba(201, 168, 76, 0.15);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 32px rgba(30, 26, 22, 0.06);
  --shadow-lg: 0 16px 56px rgba(30, 26, 22, 0.1);
  --shadow-xl: 0 24px 80px rgba(30, 26, 22, 0.14);
  --radius-md: 20px;
  --transition: 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.news-view {
  min-height: 90vh;
  background: var(--color-cream);
}

.container {
  max-width: 1060px;
  margin: 0 auto;
  padding: 0 clamp(1.25rem, 4vw, 3rem);
}

/* ─── BALANCED HERO (shifted right) ────────────────────────── */
.hero-static {
  background: linear-gradient(135deg, #f0f7f4, #ffffff);
  padding: 4rem 1.5rem 3rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
}

.hero-static-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0 1.5rem 0 clamp(2rem, 10vw, 8rem); /* 👈 shifts content right */
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.hero-static .hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--primary-color);
  background: rgba(45, 122, 90, 0.08);
  padding: 0.4rem 1.4rem;
  border-radius: 999px;
  border: 1px solid rgba(45, 122, 90, 0.1);
  margin-bottom: 1rem;
}

.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4ade80;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.8); }
}

.hero-static h1 {
  font-size: clamp(2.6rem, 6vw, 4.2rem);
  font-weight: 700;
  color: var(--primary-dark);
  letter-spacing: -0.03em;
  line-height: 1.05;
  margin: 0 0 0.5rem;
}

.hero-static h1 .highlight {
  background: linear-gradient(135deg, var(--gold-light), var(--gold));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-static .hero-subtitle {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-ink-soft);
  max-width: 680px;
  margin: 0 0 2rem;
}

.hero-static .hero-stats {
  display: flex;
  gap: 2.5rem;
  flex-wrap: wrap;
}

.hero-static .hero-stat {
  display: flex;
  flex-direction: column;
}

.hero-static .stat-number {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--primary-color);
  letter-spacing: -0.02em;
}

.hero-static .stat-label {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

/* ── Featured Section ── */
.featured-section {
  margin: 2.5rem 0 3.5rem;
}

.featured-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-ink-soft);
  margin-bottom: 1rem;
}

.featured-icon {
  color: var(--gold);
  font-size: 1rem;
}

.featured-card {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  background: #dafff3;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
  border: 1px solid rgba(47, 36, 29, 0.04);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition);
}

.featured-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-xl);
  border-color: rgba(45, 122, 90, 0.08);
}

.featured-image {
  position: relative;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: var(--color-border);
  border-radius: 0 12px 12px 0;
}

.featured-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.featured-card:hover .featured-image img {
  transform: scale(1.04);
}

.featured-image-overlay {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
}

.trending-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.7rem 0.2rem 0.5rem;
  background: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 999px;
  font-size: 0.6rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.trending-badge svg {
  width: 12px;
  height: 12px;
  stroke: #24fb44;
}

.trending-badge.small {
  padding: 0.15rem 0.4rem;
}

.trending-badge.small svg {
  width: 10px;
  height: 10px;
}

.featured-content {
  padding: 2rem 2rem 2rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.featured-title {
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  color: var(--primary-dark);
  margin: 0.4rem 0 0.6rem;
  line-height: 1.2;
  font-weight: 700;
}

.featured-summary {
  color: var(--color-ink-soft);
  line-height: 1.7;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
}

.featured-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.author-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary-dark);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
}

.author-avatar.small {
  width: 28px;
  height: 28px;
  font-size: 0.55rem;
}

.news-author {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  font-weight: 500;
}

.featured-metrics {
  display: flex;
  gap: 1.25rem;
}

.metric {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  color: var(--color-ink-soft);
}

.metric svg {
  width: 15px;
  height: 15px;
  opacity: 0.5;
}

.metric.read-time {
  color: var(--color-ink-soft);
  opacity: 0.7;
}

.featured-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 0.25rem;
}

.read-more-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.5rem 0.5rem 1.8rem;
  border: none;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.read-more-btn svg {
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.read-more-btn:hover {
  background: rgb(6, 127, 61);
  box-shadow: 0 8px 24px rgba(19, 237, 146, 0.3);
  transform: translateY(-2px);
  color: white;
}

.read-more-btn:hover svg {
  transform: translateX(4px);
}

.action-group {
  display: flex;
  gap: 0.3rem;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
  color: rgb(255, 255, 255);
  background: #169c14;
  border-radius: 999px;
}

.icon-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgb(154, 224, 199);
  border: 1px solid transparent;
  color: black;
  opacity: 0.6;
  transition: all var(--transition);
}

.icon-btn:hover {
  background: rgba(45, 122, 90, 0.06);
  opacity: 1;
  transform: scale(1.05);
}

.icon-btn.active {
  color: #ef4444;
  opacity: 1;
  background: rgba(239, 68, 68, 0.06);
}

.icon-btn.active svg {
  fill: #ef4444;
  stroke: #ef4444;
}

.icon-btn.small {
  width: 32px;
  height: 32px;
}

.icon-btn.small svg {
  width: 16px;
  height: 16px;
}

.icon-btn svg {
  width: 20px;
  height: 20px;
  stroke-width: 1.8;
}

.icon-btn.read-link {
  color: var(--primary-color);
  opacity: 0.7;
}

.icon-btn.read-link:hover {
  opacity: 1;
  background: rgba(45, 122, 90, 0.08);
}

/* ── Section Header ── */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--color-border);
}

.section-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.section-count {
  font-size: 0.75rem;
  color: var(--color-ink-soft);
  background: var(--color-border);
  padding: 0.1rem 0.7rem;
  border-radius: 999px;
  font-weight: 500;
}

/* ── News Grid ── */
.news-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

/* ── Card: initially hidden, pops when scrolled into view ── */
.news-card {
  background: #f9e8e8;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  position: relative;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  opacity: 0;
  transform: translateY(28px) scale(0.96);
  transition:
    opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.4s ease,
    border-color 0.4s ease;
  will-change: transform, opacity;
}

.news-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.news-card:hover {
  transform: translateY(-6px);
  box-shadow: var(--shadow-lg);
  border-color: transparent;
}

.news-card:nth-child(2) { transition-delay: 0.06s; }
.news-card:nth-child(3) { transition-delay: 0.12s; }
.news-card:nth-child(4) { transition-delay: 0.18s; }
.news-card:nth-child(5) { transition-delay: 0.24s; }
.news-card:nth-child(6) { transition-delay: 0.3s; }

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
  flex: 1;
}

.news-image {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--color-border);
}

.news-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.news-card:hover .news-image img {
  transform: scale(1.04);
}

.image-badges {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.3rem;
}

.news-content {
  padding: 1rem 1.25rem 0.75rem;
  flex: 1;
}

.news-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-soft);
  margin-bottom: 0.4rem;
}

.news-category {
  font-weight: 700;
  color: var(--primary-color);
}

.news-date {
  opacity: 0.6;
}

.news-title {
  margin: 0 0 0.35rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--primary-dark);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-summary {
  color: var(--color-ink-soft);
  line-height: 1.6;
  font-size: 0.85rem;
  margin-bottom: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.news-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--color-border);
}

.author-info.compact {
  gap: 0.4rem;
}

.author-info.compact .news-author {
  font-size: 0.7rem;
}

.news-metrics {
  display: flex;
  gap: 0.75rem;
}

.news-metrics .metric {
  font-size: 0.65rem;
}

.news-metrics .metric svg {
  width: 12px;
  height: 12px;
}

.card-actions {
  display: flex;
  gap: 0.1rem;
  padding: 0.25rem 1rem 0.75rem;
  border-top: 1px solid var(--color-border);
  background: rgba(250, 248, 245, 0.3);
}

.card-actions .icon-btn.small {
  width: 28px;
  height: 28px;
}

.card-actions .icon-btn.small svg {
  width: 14px;
  height: 14px;
}

/* ── No Results ── */
.no-results {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 1.5rem;
  color: var(--color-ink-soft);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.no-results svg {
  width: 40px;
  height: 40px;
  opacity: 0.3;
  color: var(--color-ink-soft);
}

.no-results p {
  font-size: 1rem;
  margin: 0;
}

/* ── Newsletter – scale from small → big on scroll (stays big) ── */
.newsletter-section {
  margin: 3.5rem 0 2.5rem;
}

.newsletter-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, var(--primary-dark), #0b623f);
  border-radius: 20px;
  color: #fff;
  box-shadow: 0 12px 48px rgba(26, 61, 46, 0.2);
  transform: scale(0.88);
  opacity: 0.5;
  transition:
    transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.6s ease;
  will-change: transform, opacity;
  transform-origin: center center;
}

.newsletter-card.newsletter-visible {
  transform: scale(1);
  opacity: 1;
  box-shadow: 0 16px 56px rgba(26, 61, 46, 0.3);
}

.newsletter-icon {
  font-size: 2rem;
  line-height: 1;
}

.newsletter-content {
  flex: 1;
  min-width: 180px;
}

.newsletter-content h3 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.15rem;
  color: white;
}

.newsletter-content p {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
}

.newsletter-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.newsletter-input {
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: 999px;
  background: rgb(224, 227, 226);
  color: #050505;
  font-size: 0.85rem;
  min-width: 200px;
  transition: all var(--transition);
  font-family: inherit;
}

.newsletter-input::placeholder {
  color: rgba(20, 16, 16, 0.975);
}

.newsletter-input:focus {
  outline: none;
  background: rgba(236, 221, 221, 0.897);
}

.newsletter-btn {
  padding: 0.5rem 1.8rem;
  border: none;
  border-radius: 999px;
  background: rgb(255, 255, 255);
  color: rgb(19, 135, 73);
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all var(--transition);
  font-family: inherit;
}

.newsletter-btn:hover {
  background: rgb(255, 255, 255);
  transform: translateY(-2px);
  color: rgb(8, 113, 17);
  box-shadow: 0 8px 24px rgba(14, 14, 14, 0.25);
}

/* ── Bottom Actions ── */
.news-actions {
  margin-top: 1.5rem;
  padding-bottom: 3.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.back-home {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.8rem;
  border-radius: 999px;
  background: rgb(156, 254, 134);
  color: var(--color-ink-soft);
  font-weight: 600;
  text-decoration: none;
  border: 1px solid var(--color-border);
  transition: all var(--transition);
  font-size: 0.85rem;
}

.back-home svg {
  width: 18px;
  height: 18px;
}

.back-home:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 122, 90, 0.2);
}

.scroll-top {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #fff;
  border: 1px solid var(--color-border);
  color: var(--color-ink-soft);
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.scroll-top:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(45, 122, 90, 0.2);
}

.scroll-top svg {
  width: 20px;
  height: 20px;
}

/* ── Toast ── */
.toast {
  position: fixed;
  left: 50%;
  bottom: 24px;
  transform: translateX(-50%) translateY(16px);
  z-index: 9999;
  background: rgba(14, 26, 20, 0.92);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 0.75rem 1rem;
  border-radius: 999px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.25);
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  backdrop-filter: blur(10px);
  max-width: calc(100vw - 2rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.toast__icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(74, 222, 128, 0.18);
  border: 1px solid rgba(74, 222, 128, 0.35);
  flex: 0 0 auto;
}

.toast__text {
  font-weight: 600;
  font-size: 0.9rem;
}

.toast--success {
  border-color: rgba(74, 222, 128, 0.35);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 220ms ease, transform 220ms ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(24px);
}

.toast-enter-to,
.toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .news-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 992px) {
  .featured-card {
    grid-template-columns: 1fr;
  }
  .featured-content {
    padding: 1.5rem 1.75rem;
  }
  .featured-image {
    aspect-ratio: 16 / 8;
  }
}

@media (max-width: 768px) {
  .hero-static {
    padding: 3rem 1.5rem 2rem;
  }
  .hero-static-inner {
    padding-left: clamp(1rem, 4vw, 2rem); /* reduce indent on tablet */
  }
  .hero-static h1 {
    font-size: 2rem;
  }
  .hero-static .hero-stats {
    gap: 1.5rem;
  }
  .hero-static .stat-number {
    font-size: 1.2rem;
  }
  .featured-actions {
    flex-direction: column;
    align-items: stretch;
  }
  .read-more-btn {
    justify-content: center;
  }
  .action-group {
    justify-content: center;
  }
  .newsletter-card {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
  .newsletter-form {
    width: 100%;
    flex-direction: column;
  }
  .newsletter-input {
    min-width: unset;
    width: 100%;
  }
  .newsletter-btn {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .news-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
  .featured-card {
    grid-template-columns: 1fr;
  }
  .featured-content {
    padding: 1.25rem;
  }
  .featured-title {
    font-size: 1.25rem;
  }
  .featured-footer {
    flex-direction: column;
    align-items: flex-start;
  }
  .featured-metrics {
    flex-wrap: wrap;
  }
  .news-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
  .back-home {
    justify-content: center;
  }
  .scroll-top {
    align-self: center;
  }
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  .hero-static-inner {
    padding-left: 0.5rem; /* minimal indent on mobile */
  }
  .hero-static h1 {
    font-size: 1.8rem;
  }
  .hero-static .hero-subtitle {
    font-size: 0.95rem;
  }
  .hero-static .stat-number {
    font-size: 1.4rem;
  }
}

@media (max-width: 400px) {
  .hero-static .hero-stats {
    gap: 0.75rem;
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-static .hero-stat {
    width: 100%;
  }
  .hero-static h1 {
    font-size: 1.5rem;
  }
  .hero-static .hero-badge {
    font-size: 0.5rem;
    padding: 0.3rem 1rem;
  }
}
</style>
