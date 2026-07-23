<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { fetchPublishedNews, type NewsArticle } from '@/lib/newsContent'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/stores/auth.store'

// ─── Fallback sample data ───────────────────────────────────────────
const fallbackArticles: NewsArticle[] = [
  {
    id: 'sample-1',
    slug: 'new-community-pre-school-opens-in-svay-rieng',
    title: 'New community pre‑school opens in Svay Rieng',
    summary: 'With support from local partners, Santi Sena inaugurated a new pre‑school serving 60 children in a remote village.',
    content: '',
    image: 'src/assets/maps/student.png',
    date: '2025-03-15',
    category: 'Education',
    author: 'Santi Sena Communications Team',
    authorAvatar: 'https://scontent.fpnh19-1.fna.fbcdn.net/v/t1.6435-9/35900553_1047076135445733_7189013137327128576_n.jpg?stp=dst-jpg_tt6&cstp=mx707x707&ctp=s707x707&_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=xb5UYMAIeNMQ7kNvwEt7Q8i&_nc_oc=AdqPikyD0Z1y3BAiT_OcMuGkjgnSqV9DKQN43x6GvgKfwJquYQEAiosG5Di3wIMKqPo&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=36yLmpqg5kk7J_nxSrPEWA&_nc_ss=7b289&oh=00_AQBhUQK4Hktg9RkMOkEmODVtVSUIyB6SuY8s0oDQX39Pdg&oe=6A7C0C58',
    featured: true,
    readTime: '3 min read',
    views: 1247,
    likes: 89,
    trending: true,
    tags: [],
  },
  {
    id: 'sample-2',
    slug: 'forest-guardians-celebrate-500-hectares',
    title: 'Forest Guardians celebrate 500 hectares of protected land',
    summary: 'Community forestry committees have successfully conserved 500 hectares of forest, boosting biodiversity and livelihoods.',
    content: '',
    image: 'src/assets/maps/wash.png',
    date: '2025-02-28',
    category: 'Environment',
    author: 'Santi Sena Environment Team',
    authorAvatar: 'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/506530593_3179455962207729_7906865104877534081_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=5mQl5LmMygsQ7kNvwGIGKj4&_nc_oc=AdpoAa3DuGZZFRwBtdn79A7geXSQ5qaPjkhibcODSGQcyZT8NqVtbWwbxX_VxsCDRFs&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=_4hsYoxY5A2Au4YHk1j0xg&_nc_ss=7b289&oh=00_AQDJoPrS0ht2yVVpTjacF8cLwnkjCZAY9kwuv66_r3v-BQ&oe=6A5A679F',
    featured: false,
    readTime: '4 min read',
    views: 856,
    likes: 64,
    trending: false,
    tags: [],
  },
  {
    id: 'sample-3',
    slug: 'youth-leaders-trained-in-child-protection-advocacy',
    title: 'Youth leaders trained in child protection advocacy',
    summary: 'Over 40 young volunteers completed a training on child rights and protection, ready to act as peer educators in their villages.',
    content: '',
    image: 'src/assets/maps/certi.png',
    date: '2025-02-10',
    category: 'Child Protection',
    author: 'Santi Sena Child Protection Team',
    authorAvatar: 'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/471173194_2997098380443489_5592666706350897819_n.jpg?stp=dst-jpg_tt6&cstp=mx720x960&ctp=s720x960&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=hFP2sKxfXCsQ7kNvwHxLGf8&_nc_oc=Adr2I7CZWYRBJMnV1SK1RvJI7jQtvOTMwhAMXMPMgoshaCbN1E-_7HVYnJEa8CR5z0s&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=YU-fNkdEviJfS6YG5vhw9A&_nc_ss=7b289&oh=00_AQBOG0k1Sd8ESYZKqyeBugQDl05XREVWwbhjzFPRxLasBg&oe=6A5A5B8E',
    featured: false,
    readTime: '2 min read',
    views: 523,
    likes: 42,
    trending: false,
    tags: [],
  },
  {
    id: 'sample-4',
    slug: 'saving-for-change-groups-reach-10000-members',
    title: 'Saving‑for‑Change groups reach 10,000 members',
    summary: 'The village savings program now boasts more than 10,000 active members, providing financial security to hundreds of families.',
    content: '',
    image: 'src/assets/maps/pre-school.png',
    date: '2025-01-20',
    category: 'Livelihood',
    author: 'Santi Sena Livelihood Unit',
    authorAvatar: 'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/507567691_3182212525265406_8387750789754024704_n.jpg?stp=dst-jpg_tt6&cstp=mx1944x1458&ctp=s1944x1458&_nc_cat=110&ccb=1-7&_nc_sid=127cfc&_nc_ohc=s3WJgdYbjO4Q7kNvwE5b8SI&_nc_oc=AdrdDhedkIVV6mkk9ih5cSJLHeWED54DAxi2H4pIwJYlNaj-6JgI34iyqZWADDFvsWQ&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=b8h1w67zdj8K6NFZyJh4Sg&_nc_ss=7b289&oh=00_AQAizxgtNDtWvLd331TlORpObCOXJNrw2Y1bdwSocYu7JA&oe=6A5A8424',
    featured: false,
    readTime: '3 min read',
    views: 2134,
    likes: 156,
    trending: true,
    tags: [],
  },
  {
    id: 'sample-5',
    slug: 'new-partnership-to-expand-clean-water-access',
    title: 'New partnership to expand clean water access',
    summary: 'Santi Sena partners with WaterAid to bring safe drinking water to 15 additional villages in Kratie province.',
    content: '',
    image: 'src/assets/maps/water.png',
    date: '2025-01-05',
    category: 'WASH',
    author: 'Santi Sena WASH Team',
    authorAvatar: 'https://scontent.fpnh19-1.fna.fbcdn.net/v/t39.30808-6/506686989_3180477048772287_5998299243352970740_n.jpg?stp=dst-jpg_tt6&cstp=mx2048x1536&ctp=s2048x1536&_nc_cat=111&ccb=1-7&_nc_sid=127cfc&_nc_ohc=3bsX9ehYnOwQ7kNvwGjsu0z&_nc_oc=AdrWMcO3CYPFu2u_ujNxDyCbrMd7xkG8WTEsiEy-FxqXUjUDa2pgBfV4bK2PGirnaCU&_nc_zt=23&_nc_ht=scontent.fpnh19-1.fna&_nc_gid=JX13CMJg7q0Ca4PkxObg_g&_nc_ss=7b289&oh=00_AQCdlfPvqNIYjaV9AnBBH5kH-CzESfLgwiWWJ5EiIc1fnQ&oe=6A5A4DBB',
    featured: false,
    readTime: '5 min read',
    views: 678,
    likes: 51,
    trending: false,
    tags: [],
  },
]

// ─── News data (loaded live from Supabase, fallback to samples) ─────
const newsItems = ref<NewsArticle[]>(fallbackArticles)

// ─── Auth & Admin state ─────────────────────────────────────────────
const auth = useAuthStore()
void auth.init()
const isAdmin = computed(() => auth.isAdmin)
const adminEditMode = ref(false)
const editingCardId = ref<string | null>(null)
const editFormData = ref({ title: '', image_url: '' })
const addFormOpen = ref(false)
const addFormData = ref({ title: '', category: 'Education', excerpt: '', image_url: '' })
const categories = ref(['Education', 'Environment', 'Child Protection', 'Livelihood', 'WASH'])

function openEditCard(article: NewsArticle) {
  editingCardId.value = article.id
  editFormData.value = { title: article.title, image_url: article.image }
}

function closeEditCard() {
  editingCardId.value = null
  editFormData.value = { title: '', image_url: '' }
}

function openAddCard() {
  addFormOpen.value = true
  addFormData.value = { title: '', category: 'Education', excerpt: '', image_url: '' }
}

function closeAddCard() {
  addFormOpen.value = false
}

async function saveCardEdit(article: NewsArticle) {
  if (!article || article.id.startsWith('sample-')) {
    showToastNow('Cannot edit sample articles.')
    closeEditCard()
    return
  }
  try {
    const savedAt = new Date().toISOString()
    const { error } = await supabase
      .from('news_posts')
      .update({
        title: editFormData.value.title,
        metadata: { image_url: editFormData.value.image_url },
        updated_at: savedAt,
      })
      .eq('id', article.id)
    if (error) throw error
    article.title = editFormData.value.title
    article.image = editFormData.value.image_url
    closeEditCard()
    showToastNow('Card updated.')
  } catch (e) {
    showToastNow(e instanceof Error ? e.message : 'Could not save.')
  }
}

async function deleteNewsCard(article: NewsArticle) {
  if (!article || article.id.startsWith('sample-')) {
    showToastNow('Cannot delete sample articles.')
    closeEditCard()
    return
  }
  try {
    const { error } = await supabase.from('news_posts').delete().eq('id', article.id)
    if (error) throw error
    newsItems.value = newsItems.value.filter((a) => a.id !== article.id)
    closeEditCard()
    showToastNow('Card deleted.')
  } catch (e) {
    showToastNow(e instanceof Error ? e.message : 'Could not delete.')
  }
}

async function saveNewCard() {
  const title = addFormData.value.title.trim()
  if (!title) {
    showToastNow('Title is required.')
    return
  }
  try {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || `news-${Date.now()}`
    const savedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('news_posts')
      .insert({
        title,
        slug,
        excerpt: addFormData.value.excerpt,
        status: 'published',
        metadata: { image_url: addFormData.value.image_url },
        published_at: savedAt,
        updated_at: savedAt,
      })
      .select('id, slug, title, excerpt, body, status, is_featured, author_name, read_time, published_at, updated_at, metadata, news_categories(name)')
      .single()
    if (error) throw error
    if (data) {
      const newArticle: NewsArticle = {
        id: data.id,
        slug: data.slug,
        title: data.title,
        summary: data.excerpt ?? '',
        content: data.body ?? '',
        image: (data.metadata as Record<string, unknown>)?.image_url as string || '/images/programs/hero-1.jpg',
        date: data.published_at ?? savedAt,
        category: 'News',
        author: data.author_name ?? 'Santi Sena Communications Team',
        readTime: data.read_time ?? '3 min read',
        views: 0,
        likes: 0,
        featured: false,
        trending: false,
        tags: [],
      }
      newsItems.value = [newArticle, ...newsItems.value]
    }
    closeAddCard()
    showToastNow('Card published.')
  } catch (e) {
    showToastNow(e instanceof Error ? e.message : 'Could not publish.')
  }
}

// ─── State ──────────────────────────────────────────────────────────
const savedArticles = ref<string[]>([])
const likedArticles = ref<string[]>([])
const newsletterEmail = ref('')

// Featured + regular articles
const featuredArticle = computed(() => {
  const featured = newsItems.value.find((item) => item.featured)
  return featured || newsItems.value[0] || null
})
const regularArticles = computed(() => {
  if (featuredArticle.value && newsItems.value.length > 1) {
    return newsItems.value.filter((item) => item.id !== featuredArticle.value!.id)
  }
  return newsItems.value
})

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

onMounted(async () => {
  try {
    const publishedNews = await fetchPublishedNews()
    if (publishedNews.length) {
      // Replace fallback data with live published news from admin
      newsItems.value = publishedNews
    }
  } catch {
    // Keep fallback sample data if Supabase is unavailable
  }

  await nextTick()
  const els = document.querySelectorAll('.news-card')
  articleRefs.value = Array.from(els) as HTMLElement[]
  setupIntersectionObservers()
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
const toggleSave = (id: string) => {
  const index = savedArticles.value.indexOf(id)
  if (index > -1) {
    savedArticles.value.splice(index, 1)
  } else {
    savedArticles.value.push(id)
  }
}

const toggleLike = (id: string) => {
  const index = likedArticles.value.indexOf(id)
  if (index > -1) {
    likedArticles.value.splice(index, 1)
  } else {
    likedArticles.value.push(id)
  }
}

const isSaved = (id: string) => savedArticles.value.includes(id)
const isLiked = (id: string) => likedArticles.value.includes(id)

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

    <!-- ─── ADMIN EDIT MODE TOOLBAR ───────────────────────────── -->
    <div v-if="isAdmin" class="admin-edit-toolbar">
      <div class="admin-edit-toolbar-inner">
        <div class="admin-edit-toolbar-left">
          <span class="admin-edit-badge">Admin</span>
          <span class="admin-edit-divider"></span>
          <span class="admin-edit-label">Edit news list</span>
        </div>
        <div class="admin-edit-toolbar-right">
          <button
            type="button"
            class="admin-edit-toggle"
            :class="{ active: adminEditMode }"
            @click="adminEditMode = !adminEditMode"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {{ adminEditMode ? 'Exit Edit Mode' : 'Edit Mode' }}
          </button>
        </div>
      </div>
    </div>

    <!-- ─── ADMIN ADD NEW CARD FORM ──────────────────────────── -->
    <div v-if="isAdmin && addFormOpen" class="admin-add-form-overlay" @click.self="closeAddCard">
      <div class="admin-add-form-card">
        <div class="admin-add-form-header">
          <h3>Add New News Card</h3>
          <button type="button" class="admin-add-close" @click="closeAddCard">✕</button>
        </div>
        <form class="admin-add-form" @submit.prevent="saveNewCard">
          <label>
            <span>Title *</span>
            <input v-model="addFormData.title" required placeholder="News title" />
          </label>
          <label>
            <span>Category</span>
            <select v-model="addFormData.category">
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </label>
          <label>
            <span>Summary / Excerpt</span>
            <textarea v-model="addFormData.excerpt" rows="2" placeholder="Short summary..."></textarea>
          </label>
          <label>
            <span>Image URL (Google Drive)</span>
            <input v-model="addFormData.image_url" placeholder="https://drive.google.com/file/d/.../view" />
          </label>
          <div class="admin-add-form-actions">
            <button type="button" class="admin-add-btn-secondary" @click="closeAddCard">Cancel</button>
            <button type="submit" class="admin-add-btn-primary">Publish Card</button>
          </div>
        </form>
      </div>
    </div>

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
              <!-- Admin Edit Button on Featured Card -->
              <span
                v-if="isAdmin && adminEditMode"
                class="admin-edit-card-btn"
                @click.prevent="openEditCard(featuredArticle)"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
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

      <!-- ─── ADMIN: INLINE EDIT MODAL ───────────────────────── -->
      <div
        v-if="isAdmin && editingCardId"
        class="admin-edit-modal-overlay"
        @click.self="closeEditCard"
      >
        <div class="admin-edit-modal-card">
          <div class="admin-edit-modal-header">
            <h3>Edit News Card</h3>
            <button type="button" class="admin-modal-close" @click="closeEditCard">✕</button>
          </div>
          <form class="admin-edit-modal-form" @submit.prevent="saveCardEdit(newsItems.find(a => a.id === editingCardId)!)">
            <label>
              <span>Title</span>
              <input v-model="editFormData.title" required placeholder="News title" />
            </label>
            <label>
              <span>Image URL</span>
              <input v-model="editFormData.image_url" placeholder="https://drive.google.com/file/d/.../view" />
              <small>Paste a Google Drive image URL (shared as "Anyone with the link")</small>
            </label>
            <div class="admin-edit-modal-actions">
              <button type="button" class="admin-modal-btn-secondary" @click="closeEditCard">Cancel</button>
              <button type="submit" class="admin-modal-btn-primary">Save Changes</button>
              <button
                type="button"
                class="admin-modal-btn-danger"
                @click="deleteNewsCard(newsItems.find(a => a.id === editingCardId)!)"
              >
                Delete Card
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- ─── ALL STORIES ─────────────────────────────────────── -->
      <div class="section-header">
        <div class="section-header-left">
          <h2 class="section-title">All Stories</h2>
          <span class="section-count">{{ regularArticles.length }} articles</span>
        </div>
        <!-- Admin: Add Card Button -->
        <button
          v-if="isAdmin && adminEditMode"
          type="button"
          class="admin-add-card-btn"
          @click="openAddCard"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Card
        </button>
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
                <!-- Admin Edit Button -->
                <span
                  v-if="isAdmin && adminEditMode"
                  class="admin-edit-card-btn small"
                  @click.prevent="openEditCard(item)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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
  padding: 0 1.5rem 0 clamp(2rem, 10vw, 8rem);
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
    padding-left: clamp(1rem, 4vw, 2rem);
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
    padding-left: 0.5rem;
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

/* ── Admin Edit Mode Toolbar ── */
.admin-edit-toolbar {
  background: linear-gradient(135deg, #071311 0%, #0f2d25 100%);
  border-bottom: 1px solid rgba(53, 208, 190, 0.22);
  color: #f2fbf6;
  font-size: 0.82rem;
  position: relative;
}

.admin-edit-toolbar::after {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(53, 208, 190, 0.35), transparent);
  content: '';
}

.admin-edit-toolbar-inner {
  max-width: 1060px;
  margin: 0 auto;
  padding: 0.45rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 40px;
}

.admin-edit-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.admin-edit-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.admin-edit-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 800;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #74e0ae;
  flex-shrink: 0;
}

.admin-edit-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.admin-edit-label {
  color: #94a3b8;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-edit-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(116, 224, 174, 0.25);
  border-radius: 8px;
  background: rgba(116, 224, 174, 0.08);
  color: #b9ead5;
  padding: 0.35rem 0.8rem;
  font-weight: 700;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.admin-edit-toggle:hover {
  background: rgba(116, 224, 174, 0.18);
  border-color: rgba(116, 224, 174, 0.45);
  color: #f2fbf6;
}

.admin-edit-toggle.active {
  background: rgba(116, 224, 174, 0.25);
  border-color: rgba(116, 224, 174, 0.5);
  color: #f2fbf6;
}

/* ── Admin Edit Card Button (on image overlay) ── */
.admin-edit-card-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(6px);
  border: 1.5px solid rgba(255, 255, 255, 0.25);
  color: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 0.4rem;
}

.admin-edit-card-btn:hover {
  background: rgba(45, 122, 90, 0.85);
  transform: scale(1.1);
}

.admin-edit-card-btn.small {
  width: 28px;
  height: 28px;
}

/* ── Admin Add Card Button (in section header) ── */
.admin-add-card-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border: 1.5px dashed var(--primary-color);
  border-radius: 999px;
  background: rgba(45, 122, 90, 0.06);
  color: var(--primary-color);
  font-weight: 700;
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-add-card-btn:hover {
  background: var(--primary-color);
  color: #fff;
  border-style: solid;
}

.admin-add-card-btn svg {
  flex-shrink: 0;
}

/* ── Admin Edit Modal Overlay ── */
.admin-edit-modal-overlay,
.admin-add-form-overlay {
  position: fixed;
  inset: 0;
  z-index: 110;
  display: grid;
  place-items: center;
  background: rgba(15, 23, 42, 0.5);
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.admin-edit-modal-card,
.admin-add-form-card {
  width: min(480px, calc(100vw - 2rem));
  border: 1px solid var(--color-border);
  border-radius: 20px;
  background: var(--color-cream);
  padding: 1.5rem;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.25);
}

.admin-edit-modal-header,
.admin-add-form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.admin-edit-modal-header h3,
.admin-add-form-header h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0;
}

.admin-modal-close,
.admin-add-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: var(--color-cream);
  color: var(--color-ink-soft);
  font-size: 1rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: all 0.2s ease;
}

.admin-modal-close:hover,
.admin-add-close:hover {
  background: var(--color-border);
  color: var(--color-ink);
}

.admin-edit-modal-form,
.admin-add-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.admin-edit-modal-form label,
.admin-add-form label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-ink-soft);
}

.admin-edit-modal-form input,
.admin-edit-modal-form textarea,
.admin-edit-modal-form select,
.admin-add-form input,
.admin-add-form textarea,
.admin-add-form select {
  padding: 0.65rem 0.85rem;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: 0.9rem;
  font-family: inherit;
  background: #fff;
  color: var(--color-ink);
  transition: border-color 0.2s ease;
}

.admin-edit-modal-form input:focus,
.admin-edit-modal-form textarea:focus,
.admin-edit-modal-form select:focus,
.admin-add-form input:focus,
.admin-add-form textarea:focus,
.admin-add-form select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.admin-edit-modal-form small,
.admin-add-form small {
  font-size: 0.72rem;
  color: var(--color-ink-soft);
  opacity: 0.7;
}

.admin-edit-modal-actions,
.admin-add-form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
  justify-content: flex-end;
}

.admin-modal-btn-secondary,
.admin-add-btn-secondary {
  padding: 0.55rem 1.2rem;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: #fff;
  color: var(--color-ink-soft);
  font-weight: 600;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-modal-btn-secondary:hover,
.admin-add-btn-secondary:hover {
  background: var(--color-border);
}

.admin-modal-btn-primary,
.admin-add-btn-primary {
  padding: 0.55rem 1.2rem;
  border: 1px solid var(--primary-color);
  border-radius: 10px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
}

.admin-modal-btn-primary:hover,
.admin-add-btn-primary:hover {
  background: var(--primary-dark);
}

.admin-modal-btn-danger {
  padding: 0.55rem 1.2rem;
  border: 1px solid #dc2626;
  border-radius: 10px;
  background: transparent;
  color: #dc2626;
  font-weight: 600;
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-right: auto;
}

.admin-modal-btn-danger:hover {
  background: #dc2626;
  color: #fff;
}

@media (max-width: 600px) {
  .admin-edit-toolbar-inner {
    padding: 0.35rem 0.75rem;
    min-height: 36px;
  }
  .admin-edit-label {
    display: none;
  }
  .admin-edit-divider {
    display: none;
  }
  .admin-edit-toggle {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
  .admin-edit-modal-card,
  .admin-add-form-card {
    padding: 1.25rem;
  }
}
</style>
