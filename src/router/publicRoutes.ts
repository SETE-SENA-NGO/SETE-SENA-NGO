import HomeView from '@/views/public/HomeView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/public/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/public/ProgramEnviromentView.vue'
import OrganizationView from '@/views/public/OrganizationView.vue'
import EducationView from '@/views/public/EducationView.vue'
import ImpactPartnersView from '@/views/public/ImpactPartnersView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ImpactTimelineView from '@/views/public/ImpactTimelineView.vue'
import ImpactNumbersView from '@/views/public/ImpactNumbersView.vue'

import GetInvolvedView from '@/views/public/GetInvolvedView.vue'

import DonateView from '@/views/public/Getinvolved.donat.vue'
import VolunteerView from '@/views/public/Getinvolved.volunteer.vue'
import PartnerView from '@/views/public/Getinvolved.partner.vue'

import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramsLivelihoodView from '@/views/public/ProgramsLivelihoodView.vue'
import ProgramsChildProtectionView from '@/views/public/ProgramsChildProtectionView.vue'
import QrDonateView from '@/views/public/DonateView.vue'



// 👇 NEW: import news views
import NewsView from '@/views/public/NewsView.vue'
import NewsDetailView from '@/views/public/NewsDetailView.vue'

export const publicRoutes = [
  // Home
  { path: '/', component: HomeView },

  // About
  { path: '/about', component: AboutView },
  { path: '/about/vision', component: AboutVisionView },
  { path: '/about/organization', component: OrganizationView },

  // Programs
  { path: '/programs', component: ProgramsView, name: 'programs' },
  { path: '/programs/environment', component: ProgramEnviromentView },
  { path: '/programs/education', component: EducationView },
  { path: '/programs/livelihood', component: ProgramsLivelihoodView, name: 'programs-livelihood' },
  { path: '/programs/child-protection', component: ProgramsChildProtectionView, name: 'programs-child-protection' },

  // Impact
  { path: '/impact/numbers', component: ImpactNumbersView },
  { path: '/impact/partners', component: ImpactPartnersView },
  { path: '/impact/timeline', component: ImpactTimelineView },

  // Get Involved
  { path: '/get-involved', component: GetInvolvedView },
  { path: '/get-involved/donate', component: DonateView },
  { path: '/get-involved/volunteer', component: VolunteerView },
  { path: '/get-involved/partner', component: PartnerView },

  // Contact
  { path: '/contact', component: ContactView },

  // Donation (QR)
  { path: '/qr-donate', component: QrDonateView },

  // 👇 NEW: News routes
  { path: '/news', component: NewsView, name: 'news' },
  { path: '/news/:id', component: NewsDetailView, name: 'news-detail' },
]
