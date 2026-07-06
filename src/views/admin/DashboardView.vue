<script setup lang="ts">
import { onMounted } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DataTable from '@/components/admin/DataTable.vue'
import { useContentStore } from '@/stores/content.store'

const store = useContentStore()

const columns = [
  { key: 'slug', label: 'Slug' },
  { key: 'title', label: 'Title' },
  { key: 'updated_at', label: 'Updated' },
]

onMounted(() => store.fetchAll())
</script>

<template>
  <div class="admin-page">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <h1>Dashboard</h1>
        <DataTable :columns="columns" :data="store.getAll" />
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
  margin-left: 260px;
  padding: 1.5rem;
  max-width: 1200px;
}
</style>
