import HomeView from '@/views/public/HomeView.vue'
import HomeSlideshowView from '@/views/public/HomeSlideshowView.vue'
import AboutView from '@/views/public/AboutView.vue'
import AboutVisionView from '@/views/public/AboutVisionView.vue'
import ProgramEnviromentView from '@/views/public/ProgramEnviromentView.vue'
import OrganizationView from '@/views/public/OrganizationView.vue'
import EducationView from '@/views/public/EducationView.vue'
import ImpactView from '@/views/public/ImpactView.vue'
import ImpactPartnersView from '@/views/public/ImpactPartnersView.vue'
import ContactView from '@/views/public/ContactView.vue'
import ImpactTimelineView from '@/views/public/ImpactTimelineView.vue'
import ImpactNumbersView from '@/views/public/ImpactNumbersView.vue'
import HeadOfficeView from '@/views/public/HeadOfficeView.vue'
import FieldOfficesView from '@/views/public/FieldOfficesView.vue'
import ManagedPublicPageView from '@/views/public/ManagedPublicPageView.vue'
import type { Component } from 'vue'

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
  { path: '/home-slideshow', component: HomeSlideshowView },

  // About
  managedPage('/about', 'about', AboutView),
  managedPage('/about/vision', 'about-vision', AboutVisionView),
  managedPage('/about/organization', 'about-organization', OrganizationView),

  managedRoute('/programs', 'programs', () => import('@/views/public/ProgramsView.vue'), 'programs'),
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
