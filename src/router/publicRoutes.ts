import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/ProgramEnviromentView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ContactView from '@/views/public/ContactView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/programs/environment', component: ProgramEnviromentView },
  { path: '/services', component: ServicesView },
  { path: '/contact', component: ContactView },
]
