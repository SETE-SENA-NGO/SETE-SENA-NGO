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
import HeadOfficeView from '@/views/public/HeadOfficeView.vue'
import FieldOfficesView from '@/views/public/FieldOfficesView.vue'
import ManagedPublicPageView from '@/views/public/ManagedPublicPageView.vue'
import type { Component } from 'vue'

import GetInvolvedView from '@/views/public/GetInvolvedView.vue'

import DonateView from '@/views/public/Getinvolved.donat.vue'
import VolunteerView from '@/views/public/Getinvolved.volunteer.vue'
import PartnerView from '@/views/public/Getinvolved.partner.vue'

import ProgramsView from '@/views/public/ProgramsView.vue'
import ProgramsLivelihoodView from '@/views/public/ProgramsLivelihoodView.vue'
import ProgramsChildProtectionView from '@/views/public/ProgramsChildProtectionView.vue'
import QrDonateView from '@/views/public/DonateView.vue'

type ManagedPageOptions = {
  name?: string
  alias?: string | string[]
}

function managedPage(
  path: string,
  contentSlug: string,
  fallbackComponent?: Component,
  options: ManagedPageOptions = {},
) {
  return {
    path,
    component: ManagedPublicPageView,
    ...(options.name ? { name: options.name } : {}),
    ...(options.alias ? { alias: options.alias } : {}),
    meta: {
      contentSlug,
      fallbackComponent,
    },
  }
}

export const publicRoutes = [
  // Home
  managedPage('/', 'home', HomeView),

  // About
  managedPage('/about', 'about', AboutView),
  { path: '/about/vision', component: AboutVisionView },
  { path: '/about/organization', component: OrganizationView },

  // Programs
  managedPage('/programs', 'programs', ProgramsView, { name: 'programs' }),
  managedPage('/programs/environment', 'programs-environment', ProgramEnviromentView),
  managedPage('/programs/education', 'programs-education', EducationView),
  managedPage('/programs/livelihood', 'programs-livelihood', ProgramsLivelihoodView, {
    name: 'programs-livelihood',
  }),
  managedPage('/programs/child-protection', 'programs-child-protection', ProgramsChildProtectionView, {
    name: 'programs-child-protection',
  }),
  managedPage('/services', 'services'),

  // Impact
  managedPage('/impact/numbers', 'impact-numbers', ImpactNumbersView),
  managedPage('/impact/partners', 'impact-partners', ImpactPartnersView),
  managedPage('/impact/timeline', 'impact-timeline', ImpactTimelineView),

  // Get Involved
  managedPage('/get-involved', 'get-involved', GetInvolvedView),
  managedPage('/get-involved/donate', 'get-involved-donate', DonateView),
  managedPage('/get-involved/volunteer', 'get-involved-volunteer', VolunteerView),
  managedPage('/get-involved/partner', 'get-involved-partner', PartnerView),

  // Contact
  managedPage('/contact', 'contact', ContactView),
  managedPage('/contact/headoffice', 'contact-head-office', HeadOfficeView, {
    alias: '/contact/head-office',
  }),
  managedPage('/contact/fieldoffice', 'contact-field-offices', FieldOfficesView, {
    alias: ['/contact/field-office', '/contact/field-offices'],
  }),

  // Donation (QR)
  managedPage('/qr-donate', 'qr-donate', QrDonateView),
]
