<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { imageUrls } from '@/lib/imageUrls'
import { fetchPublishedNews, fetchPublishedNewsArticle, type NewsArticle } from '@/lib/newsContent'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'

const route = useRoute()
const articleId = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? id : '1'
})

// ─── Fallback sample data (shown when no published news from admin) ─
const fallbackArticles: NewsArticle[] = [
  {
    id: 'sample-1',
    slug: 'new-community-pre-school-opens-in-svay-rieng',
    title: 'New community pre‑school opens in Svay Rieng',
    summary: 'With support from local partners, Santi Sena inaugurated a new pre‑school serving 60 children in a remote village.',
    content: '<p>The new pre‑school, located in the village of Thmor Kor, was built with funding from the Australian Embassy and local community contributions. It features two classrooms, a play area, and a kitchen for preparing nutritious meals.</p><p>Over 60 children are now enrolled, with three trained teachers providing early childhood education. The school also serves as a hub for parent education sessions on nutrition and child development.</p><p>"This school is a dream come true for our community," said village chief Sok Heng. "Our children now have a safe place to learn and grow."</p><p>The project is part of Santi Sena\'s broader education program that has established over 20 pre‑schools across three provinces.</p>',
    image: imageUrls.news.student,
    date: '2025-03-15',
    category: 'Education',
    author: 'Santi Sena Communications Team',
    authorBio: 'The Communications Team shares stories of impact from the field, highlighting the voices of communities and partners.',
    readTime: '3 min read',
    authorAvatar: imageUrls.logo,
    views: 1247,
    likes: 89,
    tags: ['Education', 'Community', 'Early Childhood'],
    featured: true,
    trending: true,
  },
  {
    id: 'sample-2',
    slug: 'forest-guardians-celebrate-500-hectares',
    title: 'Forest Guardians celebrate 500 hectares of protected land',
    summary: 'Community forestry committees have successfully conserved 500 hectares of forest, boosting biodiversity and livelihoods.',
    content: '<p>After years of dedicated conservation efforts, the community forestry committees in Prey Veng have officially protected 500 hectares of forest. The area is now home to diverse wildlife and serves as a vital carbon sink.</p><p>The achievement was celebrated with a ceremony attended by provincial authorities and local villagers, who have worked tirelessly to replant trees and prevent illegal logging.</p>',
    image: imageUrls.news.wash,
    date: '2025-02-28',
    category: 'Environment',
    author: 'Santi Sena Environment Team',
    authorBio: 'The Environment Team works with communities to protect natural resources and promote sustainable land use.',
    readTime: '4 min read',
    authorAvatar: imageUrls.logo,
    views: 856,
    likes: 64,
    tags: ['Environment', 'Conservation', 'Biodiversity'],
    featured: false,
    trending: false,
  },
  {
    id: 'sample-3',
    slug: 'youth-leaders-trained-in-child-protection-advocacy',
    title: 'Youth leaders trained in child protection advocacy',
    summary: 'Over 40 young volunteers completed a training on child rights and protection, ready to act as peer educators in their villages.',
    content: '<p>Forty young volunteers from 25 villages completed a three‑day training on child rights, protection mechanisms, and reporting procedures. The participants are now equipped to lead awareness sessions in their communities.</p><p>The training was facilitated by Santi Sena\'s Child Protection Unit and supported by UNICEF. It is part of a larger initiative to establish youth‑led child protection networks across the province.</p>',
    image: imageUrls.news.certificate,
    date: '2025-02-10',
    category: 'Child Protection',
    author: 'Santi Sena Child Protection Team',
    authorBio: 'The Child Protection Unit works to safeguard children\'s rights and empower communities to prevent abuse and exploitation.',
    readTime: '2 min read',
    authorAvatar: imageUrls.logo,
    views: 523,
    likes: 42,
    tags: ['Child Protection', 'Youth', 'Advocacy'],
    featured: false,
    trending: false,
  },
  {
    id: 'sample-4',
    slug: 'saving-for-change-groups-reach-10000-members',
    title: 'Saving‑for‑Change groups reach 10,000 members',
    summary: 'The village savings program now boasts more than 10,000 active members, providing financial security to hundreds of families.',
    content: '<p>The village savings program, which started with just 50 members in 2003, has now grown to 10,000 active participants across 293 villages. The groups provide a safe way for families to save, access small loans, and build financial resilience.</p><p>To celebrate, Santi Sena held a series of community events, highlighting success stories of members who have used loans to start small businesses or invest in education.</p>',
    image: imageUrls.news.preschool,
    date: '2025-01-20',
    category: 'Livelihood',
    author: 'Santi Sena Livelihood Unit',
    authorBio: 'The Livelihood Unit promotes economic empowerment through savings groups, skills training, and enterprise development.',
    readTime: '3 min read',
    authorAvatar: imageUrls.logo,
    views: 2134,
    likes: 156,
    tags: ['Livelihood', 'Savings', 'Financial Inclusion'],
    featured: false,
    trending: true,
  },
  {
    id: 'sample-5',
    slug: 'new-partnership-to-expand-clean-water-access',
    title: 'New partnership to expand clean water access',
    summary: 'Santi Sena partners with WaterAid to bring safe drinking water to 15 additional villages in Kratie province.',
    content: '<p>Santi Sena has signed a memorandum of understanding with WaterAid to bring safe drinking water to 15 additional villages in Kratie province. The initiative includes the construction of boreholes, water purification systems, and community training on hygiene practices.</p><p>This partnership will directly benefit over 2,000 families and is expected to reduce waterborne diseases significantly.</p>',
    image: imageUrls.news.water,
    date: '2025-01-05',
    category: 'WASH',
    author: 'Santi Sena WASH Team',
    authorBio: 'The WASH Team focuses on improving water, sanitation, and hygiene practices in underserved communities.',
    readTime: '5 min read',
    authorAvatar: imageUrls.logo,
    views: 678,
    likes: 51,
    tags: ['WASH', 'Water', 'Health'],
    featured: false,
    trending: false,
  },
]

const article = ref<NewsArticle | null>(null)
const allArticles = ref<NewsArticle[]>(fallbackArticles)

// ─── Auth & Admin content editing ───────────────────────────────
const auth = useAuthStore()
void auth.init()
const isAdmin = computed(() => auth.isAdmin)

const editContentMode = ref(false)
const editContentValue = ref('')
let originalContent = ''

function openContentEdit() {
  if (!article.value) return
  originalContent = article.value.content
  editContentValue.value = article.value.content
  editContentMode.value = true
}

function cancelContentEdit() {
  editContentMode.value = false
  editContentValue.value = ''
  if (article.value) {
    article.value.content = originalContent
  }
}

async function saveContentEdit() {
  if (!article.value || !article.value.id) return
  if (article.value.id.startsWith('sample-')) {
    // Can't save to sample/fallback articles
    showAlertToast('Cannot edit sample articles. Only news from admin can be edited.')
    editContentMode.value = false
    return
  }

  try {
    const savedAt = new Date().toISOString()
    const { error } = await supabase
      .from('news_posts')
      .update({
        body: editContentValue.value,
        updated_at: savedAt,
      })
      .eq('id', article.value.id)

    if (error) throw error

    article.value.content = editContentValue.value
    editContentMode.value = false
    showAlertToast('Content saved successfully.')
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Could not save content.'
    showAlertToast(msg)
  }
}

onMounted(async () => {
  const fallback = fallbackArticles.find((a) => a.id === articleId.value) ?? null

  try {
    const [loadedArticle, publishedNews] = await Promise.all([
      fetchPublishedNewsArticle(articleId.value),
      fetchPublishedNews(),
    ])

    if (publishedNews.length) allArticles.value = publishedNews
    article.value = loadedArticle ?? fallback
  } catch {
    article.value = fallback
  }

  await nextTick()
  setupObservers()
})

// Related articles
const relatedArticles = computed(() => {
  const current = article.value
  if (!current) return []
  return allArticles.value
    .filter((a) => a.id !== current.id && a.category === current.category)
    .slice(0, 3)
})

// ─── Scroll‑triggered pop‑up for cards ──────────────────────────
let observers: IntersectionObserver[] = []

const setupObservers = () => {
  observers.forEach((obs) => obs.disconnect())
  observers = []

  const selectors = [
    '.sidebar-card',
    '.author-bio-card',
    '.share-section',
    '.related-sidebar-item',
  ]
  const elements = document.querySelectorAll(selectors.join(','))
  elements.forEach((el) => {
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
      { threshold: 0.15, rootMargin: '0px 0px -20px 0px' },
    )
    observer.observe(el)
    observers.push(observer)
  })
}

onBeforeUnmount(() => {
  observers.forEach((obs) => obs.disconnect())
  observers = []
})

// ─── Share functions ──────────────────────────────────────────────
const shareOn = (platform: string) => {
  const url = window.location.href
  const title = article.value?.title || ''
  let shareUrl = ''
  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
      break
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`
      break
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
      break
    case 'email':
      shareUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`
      break
    default:
      return
  }
  window.open(shareUrl, '_blank', 'width=600,height=400')
}

const toastMessage = ref('')
const showToast = ref(false)
let toastTimer: number | null = null

const showAlertToast = (message: string) => {
  toastMessage.value = message
  showToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = window.setTimeout(() => {
    showToast.value = false
  }, 2200)
}

const copyLink = () => {
  navigator.clipboard
    ?.writeText(window.location.href)
    .then(() => showAlertToast('Link copied to clipboard!'))
    .catch(() => showAlertToast('Could not copy link. Please copy manually.'))
}
</script>

<template>
  <div class="news-detail">
    <!-- Toast notification -->
    <transition name="toast">
      <div
        v-if="showToast"
        class="toast toast--success"
        role="status"
        aria-live="polite"
      >
        <span class="toast__icon">✅</span>
        <span class="toast__text">{{ toastMessage }}</span>
      </div>
    </transition>

    <!-- ─── ADMIN TOOLBAR ────────────────────────────────────── -->
    <div v-if="isAdmin" class="admin-detail-toolbar">
      <div class="admin-detail-toolbar-inner">
        <div class="admin-detail-toolbar-left">
          <span class="admin-detail-badge">Admin</span>
          <span class="admin-detail-divider"></span>
          <span class="admin-detail-label">Editing news content</span>
        </div>
        <div class="admin-detail-toolbar-right">
          <button
            v-if="!editContentMode"
            type="button"
            class="admin-detail-edit-btn"
            @click="openContentEdit"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Content
          </button>
          <template v-if="editContentMode">
            <button
              type="button"
              class="admin-detail-cancel-btn"
              @click="cancelContentEdit"
            >
              Cancel
            </button>
            <button
              type="button"
              class="admin-detail-save-btn"
              @click="saveContentEdit"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save Content
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- ─── HEADER with wave image ─── -->
    <header class="detail-header" v-if="article">
      <div class="container">
        <div class="header-grid">
          <!-- Left: Text -->
          <div class="header-left">
            <RouterLink to="/news" class="back-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5" />
                <path d="M12 19l-7-7 7-7" />
              </svg>
              Back to all news
            </RouterLink>

            <div class="header-badge">{{ article.category }}</div>
            <h1 class="header-title">{{ article.title }}</h1>
            <p class="header-summary">{{ article.summary }}</p>

            <div class="header-meta">
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {{ article.author }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {{
                  new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ article.readTime }}
              </span>
              <span class="meta-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {{ article.views }} views
              </span>
            </div>

            <div class="header-accent"></div>
          </div>

          <!-- Right: Round image with wave animation -->
          <div class="header-right">
            <div class="image-wrapper wave">
              <img
                :src="article.image"
                :alt="article.title"
                class="header-round-image"
              />
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Article Body -->
    <div class="container">
      <div v-if="article" class="detail-wrapper">
        <div class="article-grid">
          <!-- Left: Main content -->
          <div class="detail-content">
            <!-- Admin content editor: show textarea when editing -->
            <div v-if="editContentMode" class="admin-content-editor">
              <div class="admin-editor-header">
                <span class="admin-editor-label">Editing content (HTML)</span>
              </div>
              <textarea
                v-model="editContentValue"
                class="admin-editor-textarea"
                rows="12"
                placeholder="Enter HTML content here..."
              ></textarea>
              <div class="admin-editor-preview">
                <span class="admin-editor-label">Preview</span>
                <div class="admin-editor-preview-body" v-html="editContentValue"></div>
              </div>
            </div>
            <!-- Normal content display -->
            <div v-else class="content-body" v-html="article.content"></div>

            <!-- Tags -->
            <div class="tags-section" v-if="article.tags && article.tags.length">
              <span class="tags-label">Tags</span>
              <div class="tags-list">
                <span v-for="tag in article.tags" :key="tag" class="tag-item"
                  >#{{ tag }}</span
                >
              </div>
            </div>

            <!-- Share Section (pop‑up) -->
            <div class="share-section">
              <span class="share-label">Share this story</span>
              <div class="share-buttons">
                <button class="share-btn facebook" @click="shareOn('facebook')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"
                    />
                  </svg>
                </button>
                <button class="share-btn twitter" @click="shareOn('twitter')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"
                    />
                  </svg>
                </button>
                <button class="share-btn linkedin" @click="shareOn('linkedin')">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path
                      d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"
                    />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </button>
                <button class="share-btn email" @click="shareOn('email')">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </button>
                <button class="share-btn copy" @click="copyLink">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
              </div>
            </div>

            <!-- Author Bio (pop‑up) -->
            <div class="author-bio-card">
              <div
                class="author-avatar-large"
                :style="{ backgroundImage: `url(${article.authorAvatar})` }"
              >
                <span v-if="!article.authorAvatar">{{
                  article.author
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                }}</span>
              </div>
              <div class="author-bio-content">
                <h4 class="author-name">{{ article.author }}</h4>
                <p class="author-bio-text">
                  {{ article.authorBio || 'Contributor to Santi Sena.' }}
                </p>
              </div>
            </div>
          </div>

          <!-- Right: Sidebar -->
          <aside class="detail-sidebar">
            <!-- Article stats -->
            <div class="sidebar-card stats-card">
              <h4>Article stats</h4>
              <div class="stat-row">
                <span>{{ article.views }} views</span>
              </div>
              <div class="stat-row">
                <span>{{ article.likes }} likes</span>
              </div>
              <div class="stat-row">
                <span>{{ article.readTime }}</span>
              </div>
              <div class="stat-row">
                <span>{{
                  new Date(article.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                }}</span>
              </div>
            </div>

            <!-- Related articles -->
            <div
              v-if="relatedArticles.length > 0"
              class="sidebar-card related-sidebar"
            >
              <h4>More from {{ article.category }}</h4>
              <RouterLink
                v-for="item in relatedArticles"
                :key="item.id"
                :to="`/news/${item.id}`"
                class="related-sidebar-item"
              >
                <div class="related-sidebar-image">
                  <img :src="item.image" :alt="item.title" />
                </div>
                <div class="related-sidebar-info">
                  <span class="related-sidebar-category">{{ item.category }}</span>
                  <h5>{{ item.title }}</h5>
                  <span class="related-sidebar-date">{{
                    new Date(item.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}</span>
                </div>
              </RouterLink>
            </div>

            <!-- Newsletter mini -->
            <div class="sidebar-card newsletter-mini">
              <h4>📬 Never miss a story</h4>
              <p>Get the latest updates delivered to your inbox.</p>
              <div class="newsletter-mini-form">
                <input
                  type="email"
                  placeholder="Your email"
                  class="mini-input"
                />
                <button class="mini-btn">Subscribe</button>
              </div>
            </div>
          </aside>
        </div>

        <!-- Bottom navigation -->
        <div class="detail-footer-nav">
          <RouterLink to="/news" class="footer-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            All news
          </RouterLink>
          <button
            class="scroll-top-btn"
            @click="
              $el?.ownerDocument?.defaultView?.scrollTo({
                top: 0,
                behavior: 'smooth',
              })
            "
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 15l-6-6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <div v-else class="not-found">
        <h2>Article not found</h2>
        <p>The news you're looking for doesn't exist.</p>
        <RouterLink to="/news" class="btn btn--read"
          >Go back to news list</RouterLink
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
:root {
  --gold: #c9a84c;
  --gold-light: #e8d5a3;
  --gold-glow: rgba(201, 168, 76, 0.15);
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 8px 32px rgba(30, 26, 22, 0.06);
  --shadow-lg: 0 16px 56px rgba(30, 26, 22, 0.1);
  --shadow-xl: 0 24px 80px rgba(30, 26, 22, 0.14);
  --radius-md: 20px;
  --radius-lg: 28px;
  --transition: 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.news-detail {
  min-height: 100vh;
  background: var(--color-cream);
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem clamp(1.25rem, 4vw, 3rem);
}

/* ─── HEADER – Two columns with wave image ─── */
.detail-header {
  background: #c7edf380;
  border-bottom: 1px solid var(--color-border);
  padding: 3rem 0 2rem;
}

.header-grid {
  display: grid;
  grid-template-columns: 1.8fr 1fr;
  gap: 3rem;
  align-items: center;
}

.header-left {
  max-width: 840px;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-ink-soft);
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1.5rem;
  padding: 0.4rem 1rem;
  border-radius: 999px;
  border: 1px solid var(--color-border);
  background: var(--color-cream);
  transition: all var(--transition);
  font-size: 0.85rem;
}

.back-link:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(45, 122, 90, 0.15);
}

.back-link svg {
  width: 18px;
  height: 18px;
}

.header-badge {
  display: inline-block;
  text-transform: uppercase;
  letter-spacing: 0.35em;
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary-color);
  background: rgba(45, 122, 90, 0.08);
  padding: 0.3rem 1.2rem;
  border-radius: 999px;
  margin-bottom: 0.75rem;
}

.header-title {
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.header-summary {
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--color-ink-soft);
  max-width: 700px;
  margin: 0 0 1rem;
}

.header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: var(--color-ink-soft);
}

.header-meta .meta-item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

.header-meta .meta-item svg {
  width: 18px;
  height: 18px;
  opacity: 0.5;
}

.header-accent {
  margin-top: 1.5rem;
  width: 80px;
  height: 3px;
  background: linear-gradient(to right, var(--primary-color), transparent);
  border-radius: 4px;
}

/* ─── Right: Round image with WAVE animation ─── */
.header-right {
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-wrapper {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1 / 1;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(45, 122, 90, 0.08);
  box-shadow: 0 12px 40px rgba(11, 61, 46, 0.12);
  transition: box-shadow 0.5s ease, border-color 0.5s ease, transform 0.3s ease;
  will-change: transform;
}

.image-wrapper.wave {
  animation: waveFloat 4s ease-in-out infinite;
}

@keyframes waveFloat {
  0% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-8px) rotate(1.5deg); }
  50% { transform: translateY(0px) rotate(0deg); }
  75% { transform: translateY(8px) rotate(-1.5deg); }
  100% { transform: translateY(0px) rotate(0deg); }
}

.image-wrapper.wave:hover {
  animation: waveFloatHover 1.6s ease-in-out infinite;
  box-shadow: 0 24px 64px rgba(11, 61, 46, 0.25);
  border-color: rgba(45, 122, 90, 0.3);
}

@keyframes waveFloatHover {
  0% { transform: translateY(0px) rotate(0deg) scale(1.02); }
  25% { transform: translateY(-12px) rotate(2.5deg) scale(1.04); }
  50% { transform: translateY(0px) rotate(0deg) scale(1.02); }
  75% { transform: translateY(12px) rotate(-2.5deg) scale(1.04); }
  100% { transform: translateY(0px) rotate(0deg) scale(1.02); }
}

.header-round-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.6s ease;
}

/* ─── Article Grid ── */
.detail-wrapper {
  padding: 2rem 0 3rem;
}

.article-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2.5rem;
  align-items: start;
}

/* ── Content ── */
.detail-content {
  background: #fff;
  border-radius: var(--radius-md);
  padding: 2rem;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-border);
  border-radius: 20px;
}

.content-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-ink);
}

.content-body p {
  margin: 0 0 1.2rem 0;
}

.content-body h2,
.content-body h3 {
  margin: 1.8rem 0 0.8rem;
  color: var(--primary-dark);
}

.content-body ul,
.content-body ol {
  margin: 0 0 1.2rem 1.5rem;
}

.content-body blockquote {
  margin: 1.5rem 0;
  padding-left: 1.5rem;
  border-left: 4px solid var(--primary-color);
  font-style: italic;
  color: var(--color-ink-soft);
}

/* Tags */
.tags-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.tags-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-soft);
  margin-bottom: 0.5rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  background: var(--color-cream);
  padding: 0.2rem 0.8rem;
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--primary-dark);
  border: 1px solid var(--color-border);
}

/* ── Share Section ── */
.share-section {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.share-section.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.share-label {
  font-weight: 600;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}

.share-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.share-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  background: var(--color-cream);
  color: var(--color-ink-soft);
}

.share-btn:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
}

.share-btn svg {
  width: 20px;
  height: 20px;
}

.share-btn.facebook { background: #1877f2; color: #fff; }
.share-btn.twitter { background: #1da1f2; color: #fff; }
.share-btn.linkedin { background: #0a66c2; color: #fff; }
.share-btn.email { background: #6c5ce7; color: #fff; }
.share-btn.copy { background: var(--primary-color); color: #fff; }
.share-btn.copy:hover { background: var(--primary-dark); }

/* ── Author Bio ── */
.author-bio-card {
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 2rem;
  padding: 1.5rem;
  background: var(--color-cream);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.author-bio-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.author-avatar-large {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: var(--primary-light);
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--primary-dark);
}

.author-name {
  margin: 0 0 0.2rem;
  font-size: 1.1rem;
  color: var(--primary-dark);
}

.author-bio-text {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-ink-soft);
  line-height: 1.5;
}

/* ── Sidebar ── */
.detail-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.sidebar-card {
  background: #fff;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  border-radius: 20px;
  opacity: 0;
  transform: translateY(20px) scale(0.97);
  transition: opacity 0.5s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.sidebar-card.card-visible {
  opacity: 1;
  transform: translateY(0) scale(1);
}

.sidebar-card h4 {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--primary-dark);
  margin: 0 0 1rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.stats-card .stat-row {
  display: flex;
  align-items: center;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 0.9rem;
  color: var(--color-ink-soft);
}

.stats-card .stat-row:last-child { border-bottom: none; }

.related-sidebar-item {
  display: flex;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  color: inherit;
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.4s ease, transform 0.4s ease, border-color 0.2s;
}

.related-sidebar-item.card-visible {
  opacity: 1;
  transform: translateY(0);
}

.related-sidebar-item:hover { opacity: 0.7; }
.related-sidebar-item:last-child { border-bottom: none; }

.related-sidebar-image {
  flex: 0 0 60px;
  aspect-ratio: 1 / 1;
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.related-sidebar-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.related-sidebar-info { flex: 1; }

.related-sidebar-category {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--primary-color);
}

.related-sidebar-info h5 {
  margin: 0.1rem 0 0.2rem;
  font-size: 0.9rem;
  line-height: 1.3;
  color: var(--primary-dark);
}

.related-sidebar-date {
  font-size: 0.7rem;
  color: var(--color-ink-soft);
}

.newsletter-mini p {
  font-size: 0.85rem;
  color: var(--color-ink-soft);
  margin: 0 0 0.75rem;
}

.newsletter-mini-form {
  display: flex;
  gap: 0.4rem;
}

.mini-input {
  flex: 1;
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  font-size: 0.8rem;
  font-family: inherit;
  background: var(--color-cream);
}

.mini-input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.mini-btn {
  padding: 0.4rem 1rem;
  border: none;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fff;
  font-weight: 600;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.2s;
}

.mini-btn:hover { background: var(--primary-dark); }

/* ── Footer Nav ── */
.detail-footer-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.footer-link {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  text-decoration: none;
  color: var(--color-ink-soft);
  font-weight: 600;
  border-bottom: 1px solid transparent;
  transition: border-color 0.2s;
}

.footer-link:hover { border-color: currentColor; }

.footer-link svg {
  width: 18px;
  height: 18px;
}

.scroll-top-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 1px solid var(--color-border);
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition);
  box-shadow: var(--shadow-sm);
}

.scroll-top-btn:hover {
  background: var(--primary-color);
  color: #fff;
  border-color: var(--primary-color);
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(45, 122, 90, 0.2);
}

.scroll-top-btn svg {
  width: 20px;
  height: 20px;
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

.toast--success { border-color: rgba(74, 222, 128, 0.35); }

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
@media (max-width: 992px) {
  .article-grid { grid-template-columns: 1fr; }
  .detail-sidebar { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .header-grid { grid-template-columns: 1fr; gap: 2rem; }
  .header-right { order: -1; }
  .image-wrapper { max-width: 200px; }
}

@media (max-width: 768px) {
  .detail-header { padding: 2rem 0 1.5rem; }
  .header-title { font-size: 1.8rem; }
  .header-meta { flex-direction: column; gap: 0.4rem; }
  .detail-content { padding: 1.25rem; }
  .detail-sidebar { grid-template-columns: 1fr; }
  .author-bio-card { flex-direction: column; text-align: center; }
  .share-section { flex-direction: column; align-items: stretch; }
  .share-buttons { justify-content: center; }
  .image-wrapper { max-width: 150px; }
}

@media (max-width: 480px) {
  .header-summary { font-size: 0.95rem; }
  .content-body { font-size: 0.95rem; }
  .image-wrapper { max-width: 120px; }
}

/* ── Admin Detail Toolbar ── */
.admin-detail-toolbar {
  background: linear-gradient(135deg, #071311 0%, #0f2d25 100%);
  border-bottom: 1px solid rgba(53, 208, 190, 0.22);
  color: #f2fbf6;
  font-size: 0.82rem;
  position: relative;
}

.admin-detail-toolbar::after {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(53, 208, 190, 0.35), transparent);
  content: '';
}

.admin-detail-toolbar-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0.45rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  min-height: 40px;
}

.admin-detail-toolbar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.admin-detail-toolbar-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.admin-detail-badge {
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

.admin-detail-divider {
  width: 1px;
  height: 18px;
  background: rgba(255, 255, 255, 0.12);
  flex-shrink: 0;
}

.admin-detail-label {
  color: #94a3b8;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.admin-detail-edit-btn {
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

.admin-detail-edit-btn:hover {
  background: rgba(116, 224, 174, 0.18);
  border-color: rgba(116, 224, 174, 0.45);
  color: #f2fbf6;
}

.admin-detail-save-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(116, 224, 174, 0.5);
  border-radius: 8px;
  background: rgba(116, 224, 174, 0.2);
  color: #f2fbf6;
  padding: 0.35rem 0.8rem;
  font-weight: 700;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, border-color 0.15s ease;
}

.admin-detail-save-btn:hover {
  background: rgba(116, 224, 174, 0.35);
  border-color: rgba(116, 224, 174, 0.7);
}

.admin-detail-cancel-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: transparent;
  color: #94a3b8;
  padding: 0.35rem 0.8rem;
  font-weight: 600;
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s ease, color 0.15s ease;
}

.admin-detail-cancel-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #f2fbf6;
}

/* ── Admin Content Editor (inside detail content) ── */
.admin-content-editor {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.admin-editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.admin-editor-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-ink-soft);
  margin-bottom: 0.35rem;
}

.admin-editor-textarea {
  width: 100%;
  min-height: 280px;
  padding: 1rem;
  border: 2px solid var(--primary-color);
  border-radius: 12px;
  font-size: 0.92rem;
  line-height: 1.7;
  font-family: 'Courier New', Courier, monospace;
  background: #f8fbf6;
  color: var(--color-ink);
  resize: vertical;
  transition: border-color 0.2s ease;
}

.admin-editor-textarea:focus {
  outline: none;
  border-color: var(--primary-dark);
  box-shadow: 0 0 0 3px rgba(45, 122, 90, 0.1);
}

.admin-editor-preview {
  padding: 1rem;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background: #fff;
}

.admin-editor-preview-body {
  font-size: 1.05rem;
  line-height: 1.8;
  color: var(--color-ink);
}

.admin-editor-preview-body p {
  margin: 0 0 1.2rem 0;
}

@media (max-width: 600px) {
  .admin-detail-toolbar-inner {
    padding: 0.35rem 0.75rem;
    min-height: 36px;
  }
  .admin-detail-label {
    display: none;
  }
  .admin-detail-divider {
    display: none;
  }
  .admin-detail-edit-btn,
  .admin-detail-save-btn,
  .admin-detail-cancel-btn {
    padding: 0.3rem 0.6rem;
    font-size: 0.75rem;
  }
}
</style>
