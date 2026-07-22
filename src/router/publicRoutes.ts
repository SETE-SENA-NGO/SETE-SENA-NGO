import type { RouteRecordRaw } from 'vue-router'

type ViewLoader = () => Promise<unknown>

function managedRoute(
  path: string,
  contentSlug: string,
  fallbackComponent: ViewLoader,
  name?: string,
): RouteRecordRaw {
  return {
    path,
    component: () => import('@/views/public/ManagedPublicPageView.vue'),
    meta: { contentSlug, fallbackComponent },
    ...(name ? { name } : {}),
  }
}

export const publicRoutes: RouteRecordRaw[] = [
  managedRoute('/', 'home', () => import('@/views/public/HomeView.vue')),

  // Home slideshow page
  { path: '/home-slideshow', component: () => import('@/views/public/HomeSlideshowView.vue') },

  // About
  managedRoute('/about', 'about', () => import('@/views/public/AboutView.vue')),
  managedRoute('/about/vision', 'about-vision', () => import('@/views/public/AboutVisionView.vue')),
  managedRoute(
    '/about/organization',
    'about-organization',
    () => import('@/views/public/OrganizationView.vue'),
  ),

  { path: '/programs', component: () => import('@/views/public/ProgramsView.vue'), name: 'programs' },
  managedRoute(
    '/programs/environment',
    'programs-environment',
    () => import('@/views/public/ProgramEnvironmentView.vue'),
  ),
  managedRoute(
    '/programs/education',
    'programs-education',
    () => import('@/views/public/EducationView.vue'),
  ),
  managedRoute(
    '/programs/livelihood',
    'programs-livelihood',
    () => import('@/views/public/ProgramsLivelihoodView.vue'),
    'programs-livelihood',
  ),
  managedRoute(
    '/programs/child-protection',
    'programs-child-protection',
    () => import('@/views/public/ProgramsChildProtectionView.vue'),
    'programs-child-protection',
  ),

  managedRoute(
    '/impact/numbers',
    'impact-numbers',
    () => import('@/views/public/ImpactNumbersView.vue'),
  ),
  managedRoute(
    '/impact/partners',
    'impact-partners',
    () => import('@/views/public/ImpactPartnersView.vue'),
  ),
  managedRoute(
    '/impact/timeline',
    'impact-timeline',
    () => import('@/views/public/ImpactTimelineView.vue'),
  ),

  managedRoute(
    '/get-involved',
    'get-involved',
    () => import('@/views/public/GetInvolvedView.vue'),
  ),
  managedRoute(
    '/get-involved/donate',
    'get-involved-donate',
    () => import('@/views/public/GetInvolvedDonateView.vue'),
  ),
  managedRoute(
    '/get-involved/volunteer',
    'get-involved-volunteer',
    () => import('@/views/public/GetInvolvedVolunteerView.vue'),
  ),
  managedRoute(
    '/get-involved/partner',
    'get-involved-partner',
    () => import('@/views/public/GetInvolvedPartnerView.vue'),
  ),

  managedRoute('/contact', 'contact', () => import('@/views/public/ContactView.vue')),
  managedRoute(
    '/contact/head-office',
    'contact-head-office',
    () => import('@/views/public/HeadOfficeView.vue'),
  ),
  managedRoute(
    '/contact/field-offices',
    'contact-field-offices',
    () => import('@/views/public/FieldOfficesView.vue'),
  ),
  { path: '/contact/headoffice', redirect: '/contact/head-office' },
  { path: '/contact/fieldoffice', redirect: '/contact/field-offices' },
  managedRoute('/qr-donate', 'qr-donate', () => import('@/views/public/DonateView.vue')),

  managedRoute('/news', 'news', () => import('@/views/public/NewsView.vue'), 'news'),
  managedRoute(
    '/news/:id',
    'news-detail',
    () => import('@/views/public/NewsDetailView.vue'),
    'news-detail',
  ),
]
