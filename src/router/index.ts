import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, top: 96 }
    return { top: 0 }
  },
  routes: [
    ...publicRoutes,
    ...adminRoutes,
    { path: '/:pathMatch(.*)*', component: NotFoundView, name: 'NotFound' },
  ],
})

router.beforeEach(async (to) => {
  const isAuthRoute = to.name === 'admin-login'

  if (to.meta.requiresAuth || isAuthRoute) {
    const auth = useAuthStore()
    if (!auth.initialized) {
      await auth.init()
    }

    if (isAuthRoute) {
      if (auth.isAuthenticated) {
        if (auth.isAdmin) {
          return { path: '/admin' }
        }
        return { path: '/' }
      }
    } else if (to.meta.requiresAuth) {
      if (!auth.isAuthenticated) {
        return { name: 'admin-login', query: { redirect: to.fullPath } }
      }
      // Signed in but not an admin: no access to the admin area.
      if (!auth.isAdmin) {
        return { path: '/' }
      }
    }
  }
})

export default router
