import LoginView from '@/views/admin/LoginView.vue'
import DashboardView from '@/views/admin/DashboardView.vue'
import AdminModuleView from '@/views/admin/AdminModuleView.vue'
import MediaLibraryView from '@/views/admin/MediaLibraryView.vue'
import SettingsView from '@/views/admin/SettingsView.vue'
import EducationDashboardView from '@/views/admin/EducationDashboardView.vue'
import EnvironmentDashboardView from '@/views/admin/EnvironmentDashboardView.vue'
import LivelihoodDashboardView from '@/views/admin/LivelihoodDashboardView.vue'
import ChildProtectionView from '@/views/admin/ChildProtectionView.vue'
import ProgramsOverviewView from '@/views/admin/ProgramsOverviewView.vue'
import HomeEditorView from '@/views/admin/HomeEditorView.vue'
import AboutEditorView from '@/views/admin/AboutEditorView.vue'
import VisionMissionEditorView from '@/views/admin/VisionMissionEditorView.vue'
import OrganizationEditorView from '@/views/admin/OrganizationEditorView.vue'
import ProgramsEditorView from '@/views/admin/ProgramsEditorView.vue'
import EducationEditorView from '@/views/admin/EducationEditorView.vue'
import EnvironmentEditorView from '@/views/admin/EnvironmentEditorView.vue'
import LivelihoodEditorView from '@/views/admin/LivelihoodEditorView.vue'
import ImpactEditorView from '@/views/admin/ImpactEditorView.vue'
import NumbersEditorView from '@/views/admin/NumbersEditorView.vue'
import TimelineEditorView from '@/views/admin/TimelineEditorView.vue'
import PartnersEditorView from '@/views/admin/PartnersEditorView.vue'
import GetInvolvedEditorView from '@/views/admin/GetInvolvedEditorView.vue'
import DonateEditorView from '@/views/admin/DonateEditorView.vue'
import VolunteerEditorView from '@/views/admin/VolunteerEditorView.vue'
import PartnerEditorView from '@/views/admin/PartnerEditorView.vue'
import ContactPageEditorView from '@/views/admin/ContactPageEditorView.vue'
import NewsEditorView from '@/views/admin/NewsEditorView.vue'
import NewsDetailEditorView from '@/views/admin/NewsDetailEditorView.vue'
import QRDonateEditorView from '@/views/admin/QRDonateEditorView.vue'
import GlobalHeaderFooterEditorView from '@/views/admin/GlobalHeaderFooterEditorView.vue'

export const adminRoutes = [
  { path: '/admin/login', component: LoginView, name: 'admin-login' },
  { path: '/admin', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/admin/editor/home', component: HomeEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/about', component: AboutEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/about-vision', component: VisionMissionEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/about-organization', component: OrganizationEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/programs', component: ProgramsEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/programs-education', component: EducationEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/programs-environment', component: EnvironmentEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/programs-livelihood', component: LivelihoodEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/programs-child-protection', component: ChildProtectionView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact', component: ImpactEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact-numbers', component: NumbersEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact-timeline', component: TimelineEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/impact-partners', component: PartnersEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved', component: GetInvolvedEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved-donate', component: DonateEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved-volunteer', component: VolunteerEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/get-involved-partner', component: PartnerEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/contact', component: ContactPageEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/contact-head-office', component: ContactPageEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/contact-field-offices', component: ContactPageEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/news', component: NewsEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/news-detail', component: NewsDetailEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/qr-donate', component: QRDonateEditorView, meta: { requiresAuth: true } },
  { path: '/admin/editor/site-footer', component: GlobalHeaderFooterEditorView, meta: { requiresAuth: true } },
  { path: '/admin/media', component: MediaLibraryView, meta: { requiresAuth: true } },
  { path: '/admin/modules/:module', component: AdminModuleView, meta: { requiresAuth: true } },
  { path: '/admin/education', component: EducationDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/environment', component: EnvironmentDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/livelihood', component: LivelihoodDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/child-protection', component: ChildProtectionView, meta: { requiresAuth: true } },
  { path: '/admin/programs', component: ProgramsOverviewView, meta: { requiresAuth: true } },
  { path: '/admin/settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin/donate', component: DonateEditorView, meta: { requiresAuth: true } },
]