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
import HeadOfficeView from '@/views/public/HeadOfficeView.vue'
import FieldOfficeView from '@/views/public/FieldOfficesView.vue'
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
import ManagedPublicPageView from '@/views/public/ManagedPublicPageView.vue'

function managedRoute(
  path: string,
  contentSlug: string,
  fallbackComponent: unknown,
  options: Record<string, unknown> = {},
) {
  return {
    path,
    component: ManagedPublicPageView,
    meta: { contentSlug, fallbackComponent },
    ...options,
  }
}

export const publicRoutes = [
  managedRoute('/', 'home', HomeView),
  managedRoute('/about', 'about', AboutView, { alias: ['/about/aboutview'] }),
  managedRoute('/about/vision', 'about-vision', AboutVisionView),
  managedRoute('/about/organization', 'about-organization', OrganizationView),
  managedRoute('/programs', 'programs', ProgramsView, { name: 'programs' }),
  managedRoute('/programs/environment', 'programs-environment', ProgramEnviromentView),
  managedRoute('/programs/education', 'programs-education', EducationView),
  managedRoute('/programs/livelihood', 'programs-livelihood', ProgramsLivelihoodView, {
    name: 'programs-livelihood',
  }),
  managedRoute(
    '/programs/child-protection',
    'programs-child-protection',
    ProgramsChildProtectionView,
    {
      name: 'programs-child-protection',
    },
  ),
  managedRoute('/services', 'services', ServicesView),
  managedRoute('/impact', 'impact', ImpactView),
  managedRoute('/impact/numbers', 'impact-numbers', ImpactNumbersView),
  managedRoute('/impact/timeline', 'impact-timeline', ImpactTimelineView),
  managedRoute('/impact/partners', 'impact-partners', ImpactPartnersView),
  managedRoute('/get-involved', 'get-involved', GetInvolvedView),
  managedRoute('/get-involved/donate', 'get-involved-donate', DonateView),
  managedRoute('/get-involved/volunteer', 'get-involved-volunteer', VolunteerView),
  managedRoute('/get-involved/partner', 'get-involved-partner', PartnerView),
  managedRoute('/qr-donate', 'qr-donate', QrDonateView),
  managedRoute('/contact', 'contact', ContactView),
  managedRoute('/contact/headoffice', 'contact-head-office', HeadOfficeView, {
    alias: ['/contact/head-office'],
  }),
  managedRoute('/contact/fieldoffice', 'contact-field-offices', FieldOfficeView, {
    alias: ['/contact/field-offices'],
  }),
]
