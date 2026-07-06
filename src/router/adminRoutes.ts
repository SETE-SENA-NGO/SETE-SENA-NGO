import LoginView from '@/views/admin/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import PagesManagerView from '@/views/admin/PagesManagerView.vue'
import MediaLibraryView from '@/views/admin/MediaLibraryView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'

export const adminRoutes = [
  { path: '/admin/login', component: LoginView, name: 'admin-login' },
  { path: '/admin', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/admin/pages', component: PagesManagerView, meta: { requiresAuth: true } },
  { path: '/admin/media', component: MediaLibraryView, meta: { requiresAuth: true } },
  { path: '/admin/settings', component: SettingsView, meta: { requiresAuth: true } },
]
