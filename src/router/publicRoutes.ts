import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import ContactView from '@/views/public/ContactView.vue'
import GetinvoledView from '@/views/public/GetinvoledView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/get-involved', component: GetinvoledView },
  { path: '/contact', component: ContactView },
]
