<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ContentEditor from '@/components/admin/ContentEditor.vue'
import DataTable from '@/components/admin/DataTable.vue'
import { useContentStore } from '@/stores/content.store'
import type { PageContent } from '@/types/content'

const store = useContentStore()
const selectedPage = ref<PageContent | null>(null)

const columns = [
  { key: 'slug', label: 'Slug' },
  { key: 'title', label: 'Title' },
  { key: 'updated_at', label: 'Updated' },
]

onMounted(() => store.fetchAll())

function selectPage(row: unknown) {
  selectedPage.value = row as PageContent
}

function createPage() {
  selectedPage.value = null
}

function editGetInvolvedPage() {
  selectedPage.value =
    store.pages['get-involved'] ??
    ({
      id: '',
      slug: 'get-involved',
      title: 'Get Involved',
      body: '',
      updated_at: '',
    } satisfies PageContent)
}

function editPartnerPage() {
  selectedPage.value =
    store.pages['get-involved-partner'] ??
    ({
      id: '',
      slug: 'get-involved-partner',
      title: 'Partner with Santi Sena',
      body: '',
      updated_at: '',
    } satisfies PageContent)
}

function onSaved(page: PageContent) {
  selectedPage.value = page
}
</script>

<template>
  <div class="admin-page">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <h1>Pages</h1>
        <div class="toolbar">
          <button type="button" @click="createPage">New page</button>
          <button type="button" @click="editGetInvolvedPage">Get involved JSON</button>
          <button type="button" @click="editPartnerPage">Partner page JSON</button>
          <RouterLink to="/admin/vision-mission" class="toolbar-link">Vision & Mission</RouterLink>
        </div>
        <div class="grid">
          <ContentEditor :page="selectedPage" @saved="onSaved" />
          <DataTable :columns="columns" :data="store.getAll" selectable @row-select="selectPage" />
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.admin-layout {
  display: flex;
}
.main {
  flex: 1;
  padding: 1.5rem;
  max-width: 1200px;
}
@media (min-width: 900px) {
  .main {
    margin-left: max(10%, 180px);
  }
}
.grid {
  display: grid;
  gap: 1rem;
}
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0 0 1rem;
}
.toolbar button {
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  padding: 0.55rem 0.8rem;
}
.toolbar button:hover {
  background: #27272a;
}
.toolbar-link {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: 0.45rem;
  background: var(--panel);
  color: var(--text);
  cursor: pointer;
  padding: 0.55rem 0.8rem;
  text-decoration: none;
  font: inherit;
  font-size: inherit;
}
.toolbar-link:hover {
  background: #27272a;
}
</style>
