import HomeView from '@/views/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/ProgramEnviromentView.vue'
import OrganizationView from '@/views/public/OrganizationView.vue'
import EducationView from '@/views/public/EducationView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import ImpactPartnersView from '@/views/ImpactPartnersView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramsLivelihoodView from '@/views/public/ProgramsLivelihoodView.vue'
import ProgramsChildProtectionView from '@/views/public/ProgramsChildProtectionView.vue'
import GetInvolvedView from '@/views/public/GetInvolvedView.vue'
import DonateView from '@/views/public/Getinvolved.donat.vue'
import QrDonateView from '@/views/public/DonateView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/programs/environment', component: ProgramEnviromentView },
  { path: '/about', component: AboutView },
  { path: '/about/organization', component: OrganizationView },
  { path: '/programs/education', component: EducationView },
  { path: '/about/aboutview', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/impact', component: ImpactView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/impact/partners', component: ImpactPartnersView },
  { path: '/get-involved/donate', component: DonateView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/contact', component: ContactView },
  { path: '/programs', component: ProgramsView, name: 'programs' },
  { path: '/programs/livelihood', component: ProgramsLivelihoodView, name: 'programs-livelihood' },
  { path: '/programs/child-protection', component: ProgramsChildProtectionView, name: 'programs-child-protection' },
  { path: '/qr-donate', component: QrDonateView },
]
