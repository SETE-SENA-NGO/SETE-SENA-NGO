import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import GetInvolvedView from '@/views/public/GetInvolvedView.vue'
import ContactView from '@/views/public/ContactView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/about/organization', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/impact', component: ImpactView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/contact', component: ContactView },
]
