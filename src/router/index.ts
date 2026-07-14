import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'

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

// router.beforeEach(async (to) => {
//   if (to.meta.requiresAuth) {
//     const auth = useAuthStore()
//     if (!auth.initialized) {
//       await auth.init()
//     }
//     if (!auth.isAuthenticated) {
//       return { name: 'admin-login', query: { redirect: to.fullPath } }
//     }
//   }
// })

export default router
