export const adminRoutes = [
  {
    path: '/admin/login',
    component: () => import('@/views/admin/LoginView.vue'),
    name: 'admin-login',
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/editor/:slug',
    component: () => import('@/views/admin/PageEditorView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/media',
    component: () => import('@/views/admin/MediaLibraryView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/modules/:module',
    component: () => import('@/views/admin/AdminModuleView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/settings',
    component: () => import('@/views/admin/SettingsView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/admin/donate',
    component: () => import('@/views/admin/DonationLView.vue'),
    meta: { requiresAuth: true },
  },
]
