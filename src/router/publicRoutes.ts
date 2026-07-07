import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramsEducationView from '@/views/public/ProgramsEducationView.vue'
import ProgramsEnvironmentView from '@/views/public/ProgramsEnvironmentView.vue'
import ProgramsLivelihoodView from '@/views/public/ProgramsLivelihoodView.vue'
import ProgramsChildProtectionView from '@/views/public/ProgramsChildProtectionView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/contact', component: ContactView },
  { path: '/programs', component: ProgramsView, name: 'programs' },
  { path: '/programs/education', component: ProgramsEducationView, name: 'programs-education' },
  { path: '/programs/environment', component: ProgramsEnvironmentView, name: 'programs-environment' },
  { path: '/programs/livelihood', component: ProgramsLivelihoodView, name: 'programs-livelihood' },
  { path: '/programs/child-protection', component: ProgramsChildProtectionView, name: 'programs-child-protection' },
]