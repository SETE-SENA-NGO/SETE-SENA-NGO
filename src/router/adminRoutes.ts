import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  { path: '/admin/login', component: () => import('@/views/admin/LoginView.vue'), name: 'admin-login' },
  { path: '/admin', component: () => import('@/views/admin/DashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/pages', component: () => import('@/views/admin/PagesManagerView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/editor/:slug', component: () => import('@/views/admin/PageEditorView.vue'), meta: { requiresAuth: true } },
  // Home slideshow shortcut (edits only the `home-slideshow` section inside the Home page)
  { path: '/admin/editor/home-slideshow', component: () => import('@/views/admin/PageEditorView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/media', component: () => import('@/views/admin/MediaLibraryView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/modules/:module', component: () => import('@/views/admin/AdminModuleView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/education', component: () => import('@/views/admin/EducationDashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/environment', component: () => import('@/views/admin/EnvironmentDashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/livelihood', component: () => import('@/views/admin/LivelihoodDashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/child-protection', component: () => import('@/views/admin/ChildProtectionDashboardView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/programs', component: () => import('@/views/admin/ProgramsOverviewView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/settings', component: () => import('@/views/admin/SettingsView.vue'), meta: { requiresAuth: true } },
  { path: '/admin/donate', component: () => import('@/views/admin/DonationLView.vue'), meta: { requiresAuth: true } },
]
