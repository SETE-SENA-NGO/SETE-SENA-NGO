import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ProgramsView from '@/views/public/ProgramsView.vue' 

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/contact', component: ContactView },
  { path: '/programs', component: ProgramsView }, 
]