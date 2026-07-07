import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/ProgramEnviromentView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import ContactView from '@/views/public/ContactView.vue'
import GetInvolvedView from '@/views/public/GetInvolvedView.vue'
import DonateView from '@/views/public/Getinvolved.donat.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/about/organization', component: AboutView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/programs/environment', component: ProgramEnviromentView },
  { path: '/services', component: ServicesView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/get-involved/donate', component: DonateView },
  { path: '/contact', component: ContactView },
]
