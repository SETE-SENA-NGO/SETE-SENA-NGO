<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import type { Component } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { supabase } from '@/lib/supabase'
import {
  parsePublishedPage,
  sectionItems,
  type PublishedPageContent,
  type PublishedPageRow,
} from '@/lib/publishedContent'

const route = useRoute()
const content = ref<PublishedPageContent | null>(null)
const loaded = ref(false)
const loadError = ref('')
const fallbackComponent = shallowRef<Component | null>(null)

const slug = computed(() => {
  return typeof route.meta.contentSlug === 'string' ? route.meta.contentSlug : ''
})

watch(
  () => route.meta.fallbackComponent,
  (component) => {
    fallbackComponent.value = (component as Component | undefined) ?? null
  },
  { immediate: true },
)

watch(
  slug,
  () => {
    void loadPage()
  },
  { immediate: true },
)

async function loadPage() {
  if (!slug.value) {
    content.value = null
    loaded.value = true
    return
  }

  loaded.value = false
  loadError.value = ''

  try {
    const { data, error } = await supabase
      .from('pages')
      .select('slug, title, body, updated_at')
      .eq('slug', slug.value)
      .maybeSingle()

    if (error) throw error

    content.value = data ? parsePublishedPage(data as PublishedPageRow) : null
  } catch (error) {
    content.value = null
    loadError.value = error instanceof Error ? error.message : 'Could not load page content.'
  } finally {
    loaded.value = true
  }
}

function actionRoute(index: number) {
  if (index === 0) return '/contact'
  if (content.value?.group === 'Programs') return '/programs'
  if (content.value?.group === 'Get Involved') return '/get-involved'
  return '/'
}
</script>

<template>
  <main v-if="content" class="managed-page">
    <section class="managed-hero">
      <div class="managed-hero-inner">
        <p class="managed-eyebrow">{{ content.eyebrow || content.group }}</p>
        <h1>{{ content.headline || content.title }}</h1>
        <p class="managed-intro">{{ content.intro }}</p>
        <div class="managed-actions">
          <RouterLink
            v-if="content.primaryAction"
            class="managed-button managed-button-primary"
            :to="actionRoute(0)"
          >
            {{ content.primaryAction }}
          </RouterLink>
          <RouterLink
            v-if="content.secondaryAction"
            class="managed-button managed-button-secondary"
            :to="actionRoute(1)"
          >
            {{ content.secondaryAction }}
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="managed-sections" aria-label="Page content">
      <article v-for="section in content.sections" :key="section.id" class="managed-section">
        <p class="managed-section-label">{{ section.label }}</p>
        <h2>{{ section.heading }}</h2>
        <p v-if="section.body" class="managed-section-body">{{ section.body }}</p>

        <div v-if="sectionItems(section).length" class="managed-item-grid">
          <div v-for="item in sectionItems(section)" :key="item.title" class="managed-item">
            <strong>{{ item.title }}</strong>
            <p v-if="item.detail">{{ item.detail }}</p>
          </div>
        </div>
      </article>
    </section>
  </main>

  <component v-else-if="loaded && fallbackComponent" :is="fallbackComponent" />

  <main v-else class="managed-loading" aria-live="polite">
    <p>{{ loadError || 'Loading page content...' }}</p>
  </main>
</template>

<style scoped>
.managed-page {
  background: #fcf6e9;
  color: #17231d;
}

.managed-hero {
  min-height: 520px;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(22, 48, 42, 0.88), rgba(58, 125, 68, 0.82)),
    url('/images/programs/hero-1.jpg') center / cover;
}

.managed-hero::after {
  position: absolute;
  inset: auto 0 0;
  height: 8px;
  background: linear-gradient(90deg, #d4a017, #52b788);
  content: '';
}

.managed-hero-inner {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.managed-eyebrow,
.managed-section-label {
  margin: 0 0 0.7rem;
  color: #d4a017;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.managed-hero h1 {
  max-width: 820px;
  margin: 0;
  color: #ffffff;
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(2.7rem, 7vw, 5.8rem);
  font-weight: 800;
  line-height: 0.98;
}

.managed-intro {
  max-width: 760px;
  margin: 1.35rem 0 0;
  color: rgba(255, 255, 255, 0.88);
  font-size: 1.08rem;
  line-height: 1.85;
}

.managed-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.6rem;
}

.managed-button {
  min-height: 46px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-weight: 900;
  text-decoration: none;
}

.managed-button-primary {
  background: #d4a017;
  color: #1b271f;
}

.managed-button-secondary {
  border: 1px solid rgba(255, 255, 255, 0.72);
  color: #ffffff;
}

.managed-sections {
  width: min(1120px, calc(100% - 2rem));
  display: grid;
  gap: 1.25rem;
  margin: 0 auto;
  padding: 4rem 0;
}

.managed-section {
  border: 1px solid rgba(22, 48, 42, 0.12);
  border-radius: 8px;
  background: #ffffff;
  padding: 1.5rem;
  box-shadow: 0 16px 34px rgba(22, 48, 42, 0.08);
}

.managed-section h2 {
  margin: 0;
  color: #16302a;
  font-family: var(--font-serif, Georgia, serif);
  font-size: clamp(1.7rem, 4vw, 2.7rem);
  font-weight: 800;
  line-height: 1.1;
}

.managed-section-body {
  max-width: 820px;
  margin: 0.9rem 0 0;
  color: #5b564c;
  font-size: 1rem;
  line-height: 1.8;
}

.managed-item-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 0.8rem;
  margin-top: 1.25rem;
}

.managed-item {
  border-left: 4px solid #d4a017;
  background: #f8faf5;
  padding: 0.95rem;
}

.managed-item strong {
  display: block;
  color: #16302a;
  font-weight: 900;
}

.managed-item p {
  margin: 0.45rem 0 0;
  color: #5b564c;
  line-height: 1.6;
}

.managed-loading {
  min-height: 50vh;
  display: grid;
  place-items: center;
  background: #fcf6e9;
  color: #16302a;
  font-weight: 800;
}

@media (max-width: 720px) {
  .managed-hero {
    min-height: 460px;
  }

  .managed-section {
    padding: 1rem;
  }
}
</style>
