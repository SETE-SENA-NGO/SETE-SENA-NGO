<script setup lang="ts">
import { onMounted } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageUploader from '@/components/admin/ImageUploader.vue'
import DataTable from '@/components/admin/DataTable.vue'
import { useMediaStore } from '@/stores/media.store'

const media = useMediaStore()

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'mime_type', label: 'Type' },
  { key: 'created_at', label: 'Created' },
]

onMounted(() => media.list())
</script>

<template>
  <div class="admin-page">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <h1>Media</h1>
        <ImageUploader />
        <DataTable :columns="columns" :data="media.items" />
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
