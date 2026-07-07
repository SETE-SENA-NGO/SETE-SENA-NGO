import { createRouter, createWebHistory } from 'vue-router'
import NotFoundView from '@/views/NotFoundView.vue'
import { publicRoutes } from './publicRoutes'
import { adminRoutes } from './adminRoutes'
import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
