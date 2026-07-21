export const adminRoutes = [
  { path: '/admin/login', component: LoginView, name: 'admin-login' },
  { path: '/admin', component: DashboardView, meta: { requiresAuth: true } },
  { path: '/admin/pages', component: PagesManagerView, meta: { requiresAuth: true } },
  { path: '/admin/editor/:slug', component: PageEditorView, meta: { requiresAuth: true } },
  // Home slideshow shortcut (edits only the `home-slideshow` section inside the Home page)
  { path: '/admin/editor/home-slideshow', component: PageEditorView, meta: { requiresAuth: true } },
  { path: '/admin/media', component: MediaLibraryView, meta: { requiresAuth: true } },
  { path: '/admin/modules/:module', component: AdminModuleView, meta: { requiresAuth: true } },
  { path: '/admin/education', component: EducationDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/environment', component: EnvironmentDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/livelihood', component: LivelihoodDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/child-protection', component: ChildProtectionDashboardView, meta: { requiresAuth: true } },
  { path: '/admin/programs', component: ProgramsOverviewView, meta: { requiresAuth: true } },
  { path: '/admin/settings', component: SettingsView, meta: { requiresAuth: true } },
  { path: '/admin/donate', component: DonationLView, meta: { requiresAuth: true } },
]
