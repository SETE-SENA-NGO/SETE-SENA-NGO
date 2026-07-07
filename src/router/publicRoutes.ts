import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import ServicesView from '@/views/public/ServicesView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import GetInvolvedView from '@/views/public/GetInvolvedView.vue'
import ContactView from '@/views/public/ContactView.vue'
import HeadOfficeView from '@/views/public/HeadOfficeView.vue'
import FieldOfficesView from '@/views/public/FieldOfficesView.vue'

export const publicRoutes = [
  { path: '/', component: HomeView },
  { path: '/about', component: AboutView },
  { path: '/services', component: ServicesView },
  { path: '/impact', component: ImpactView },
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/contact', component: ContactView },
  { path: '/contact/head-office', component: HeadOfficeView },
  { path: '/contact/field-offices', component: FieldOfficesView },
]
