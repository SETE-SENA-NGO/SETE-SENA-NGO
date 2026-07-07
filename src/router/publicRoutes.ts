import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/AboutVisionView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ContactView from '@/views/public/ContactView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/services', component: ServicesView },
  { path: '/contact', component: ContactView },
]
