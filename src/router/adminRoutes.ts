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
import SlideshowManagerView from '@/views/admin/SlideshowManagerView.vue'
import GetinvolvedManagement from '@/views/admin/GetinvolvedManagement.vue'
import ContactManagement from '@/views/admin/ContactManagement.vue'

export const adminRoutes: RouteRecordRaw[] = [
  { path: '/admin/login', component: LoginView, name: 'admin-login' },
  { path: '/admin', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/admin/pages', component: PagesManagerView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact', redirect: '/admin/editor/impact-numbers', meta: { requiresAuth: true } },
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
  { path: '/admin/contact', component: ContactManagement, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved', redirect: '/admin/get-involved', meta: { requiresAuth: true } },
  // Home slideshow shortcut (edits only the `home-slideshow` section inside the Home page)
  { path: '/admin/editor/home-slideshow', component: PageEditorView, meta: { requiresAuth: true } },
  // Redirect old /admin/news to the News page editor
  { path: '/admin/news', redirect: '/admin/editor/news' },
]


