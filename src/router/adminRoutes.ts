import type { RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/admin/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import PagesManagerView from '@/views/admin/PagesManagerView.vue'
import PageEditorView from '@/views/admin/PageEditorView.vue'
import AdminModuleView from '@/views/admin/AdminModuleView.vue'
import MediaLibraryView from '@/views/admin/MediaLibraryView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import EducationDashboardView from '@/views/admin/EducationDashboardView.vue'
import EnvironmentDashboardView from '@/views/admin/EnvironmentDashboardView.vue'
import LivelihoodDashboardView from '@/views/admin/LivelihoodDashboardView.vue'
import ChildProtectionDashboardView from '@/views/admin/ChildProtectionDashboardView.vue'
import ProgramsOverviewView from '@/views/admin/ProgramsOverviewView.vue'
import DonationLView from '@/views/admin/DonationLView.vue'
import DonateAdminView from '@/views/admin/DonateAdminView.vue'
import SlideshowManagerView from '@/views/admin/SlideshowManagerView.vue'
import GetinvolvedManagement from '@/views/admin/GetinvolvedManagement.vue'
import PartnerManagement from '@/views/admin/PartnerManagement(involved).vue'
import ContactManagement from '@/views/admin/ContactManagement.vue'
import VolunteerManagement from '@/views/admin/VolunteerManagement.vue'

export const adminRoutes: RouteRecordRaw[] = [
  { path: '/admin/login', component: LoginView, name: 'admin-login' },
  { path: '/admin', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/admin/pages', component: PagesManagerView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact', redirect: '/admin/editor/impact-numbers', meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved-partner', component: PartnerManagement, meta: { requiresAuth: true } },
  { path: '/admin/partner-management', redirect: '/admin/editor/get-involved-partner', meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved-donate', component: DonateAdminView, meta: { requiresAuth: true } },
  { path: '/admin/editor/:slug', component: PageEditorView, meta: { requiresAuth: true } },
  { path: '/admin/media', component: MediaLibraryView, meta: { requiresAuth: true } },
  { path: '/admin/modules/:module', component: AdminModuleView, meta: { requiresAuth: true } },
  { path: '/admin/education', component: EducationDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/environment', component: EnvironmentDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/livelihood', component: LivelihoodDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/child-protection', component: ChildProtectionDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/programs', component: ProgramsOverviewView, meta: { requiresAuth: true } },
  { path: '/admin/settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin/donate', component: DonationLView, meta: { requiresAuth: true } },
  { path: '/admin/slideshow', component: SlideshowManagerView, meta: { requiresAuth: true } },
  { path: '/admin/get-involved', component: GetinvolvedManagement, meta: { requiresAuth: true } },
  { path: '/admin/volunteer', component: VolunteerManagement, meta: { requiresAuth: true } },
  { path: '/admin/contact', component: ContactManagement, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved', redirect: '/admin/get-involved', meta: { requiresAuth: true } },
  { path: '/admin/editor/volunteer', redirect: '/admin/volunteer', meta: { requiresAuth: true } },
  // Home slideshow shortcut (edits only the `home-slideshow` section inside the Home page)
  { path: '/admin/editor/home-slideshow', component: PageEditorView, meta: { requiresAuth: true } },
]
