import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/ProgramEnviromentView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import ImpactPartnersView from '@/views/ImpactPartnersView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramsLivelihoodView from '@/views/public/ProgramsLivelihoodView.vue'
import ProgramsChildProtectionView from '@/views/public/ProgramsChildProtectionView.vue'
import GetInvolvedView from '@/views/public/GetInvolvedView.vue'
import DonateView from '@/views/public/Getinvolved.donat.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about/organization', component: AboutView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/about', component: AboutView },
  { path: '/programs/environment', component: ProgramEnviromentView },
  { path: '/services', component: ServicesView },
  { path: '/impact/partners', component: ImpactPartnersView },
  { path: '/get-involved/donate', component: DonateView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/contact', component: ContactView },
  { path: '/programs', component: ProgramsView, name: 'programs' },
  { path: '/programs/livelihood', component: ProgramsLivelihoodView, name: 'programs-livelihood' },
  { path: '/programs/child-protection', component: ProgramsChildProtectionView, name: 'programs-child-protection' },
]