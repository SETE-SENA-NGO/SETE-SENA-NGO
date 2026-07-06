<script setup lang="ts">
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()
</script>

<template>
  <div class="admin-page">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <h1>Settings</h1>
        <p>Signed in as {{ auth.user?.email }}</p>
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
