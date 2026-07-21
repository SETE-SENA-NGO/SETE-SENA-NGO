<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()

const statsCards = [
  { label: 'Total Schools', value: '17', desc: 'Across rural Cambodia', color: 'blue' },
  { label: 'Children Reached', value: '3,400+', desc: 'Receiving education', color: 'emerald' },
  { label: 'Villages Served', value: '43', desc: 'In program areas', color: 'amber' },
  { label: 'Teachers Supported', value: '120+', desc: 'Trained & equipped', color: 'violet' },
]

const quickLinks = [
  { title: 'Edit Education Page', desc: 'Update public education content', to: '/admin/editor/programs-education', color: 'blue' },
  { title: 'Manage Records', desc: 'Create & organize data entries', to: '/admin/modules/programs', color: 'emerald' },
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media', color: 'amber' },
  { title: 'Impact Stories', desc: 'Publish success stories', to: '/admin/modules/impact-stories', color: 'violet' },
]

const programHighlights = [
  { title: 'Community Pre-schools', desc: 'Early childhood education in remote villages', count: '17 centers', color: 'blue' },
  { title: 'Mobile Libraries', desc: 'Books delivered to rural children', count: '12 units', color: 'emerald' },
  { title: 'Scholarship Program', desc: 'Supporting children from poor families', count: '363 students', color: 'amber' },
  { title: 'Buddhist Education', desc: 'Traditional learning through pagodas', count: '8 sites', color: 'violet' },
  { title: 'Teacher Support', desc: 'Training and resources for educators', count: '45 teachers', color: 'slate' },
  { title: 'Parent Engagement', desc: 'Connecting families with schools', count: '280 families', color: 'emerald' },
]

const impactNumbers = [
  { value: '27,810', label: 'Seedlings distributed to schools' },
  { value: '293', label: 'Villages in program areas' },
  { value: '4,555', label: 'Families in saving groups' },
  { value: '363', label: 'Children in pre-schools' },
]

const infoPages = [
  { title: 'Education Page Content', slug: 'programs-education', route: '/programs/education' },
  { title: 'Programs Overview', slug: 'programs', route: '/programs' },
  { title: 'Impact Numbers', slug: 'impact-numbers', route: '/impact/numbers' },
]
</script>

<template>
  <div :class="['edu-dash', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <!-- PREMIUM BANNER -->
        <header class="dash-banner">
          <div class="banner-glow" aria-hidden="true"></div>
          <div class="banner-particles" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="banner-inner">
            <div class="banner-breadcrumb">
              <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-label">Programs</span>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Education</span>
            </div>
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                  Education Program
                </div>
                <h1 class="banner-title">Education Dashboard</h1>
                <p class="banner-desc">Manage education content, track schools, students, and impact across Cambodia.</p>
              </div>
              <div class="banner-actions">
                <RouterLink class="btn btn-ghost" to="/admin/editor/programs-education">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Content
                </RouterLink>
                <RouterLink class="btn btn-primary" to="/programs/education">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Page
                </RouterLink>
              </div>
            </div>
            <div class="banner-stats">
              <div v-for="stat in statsCards" :key="stat.label" class="bstat" :class="'bstat-' + stat.color">
                <div class="bstat-icon">
                  <svg v-if="stat.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                  <svg v-else-if="stat.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="stat.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ stat.value }}</strong>
                  <small>{{ stat.label }}</small>
                  <span class="bstat-desc">{{ stat.desc }}</span>
                </div>                </div>
            </div>
          </div>
        </header>

        <!-- CONTENT GRID -->
        <div class="content-grid">
          <div class="content-main">
            <!-- Quick Links -->
            <section class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Quick access</span>
                  <h2 class="card-title">Frequent actions</h2>
                </div>
              </div>
              <div class="card-body">
                <div class="links-grid">
                  <RouterLink v-for="link in quickLinks" :key="link.title" :to="link.to" class="link-card" :class="'link-' + link.color">
                    <span class="link-icon">
                      <svg v-if="link.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      <svg v-else-if="link.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                      <svg v-else-if="link.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </span>
                    <div class="link-text">
                      <strong>{{ link.title }}</strong>
                      <small>{{ link.desc }}</small>
                    </div>
                    <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </RouterLink>
                </div>
              </div>
            </section>

            <!-- Program Highlights -->
            <section class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Initiatives</span>
                  <h2 class="card-title">Education programs</h2>
                </div>
                <RouterLink class="card-hdr-link" to="/admin/modules/programs">
                  View all
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </RouterLink>
              </div>
              <div class="card-body">
                <div class="highlights-grid">
                  <div v-for="item in programHighlights" :key="item.title" class="hcard" :class="'hcard-' + item.color">
                    <div class="hcard-top">
                      <span class="hcard-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                      </span>
                      <span class="hcard-count">{{ item.count }}</span>
                    </div>
                    <div class="hcard-body">
                      <strong>{{ item.title }}</strong>
                      <small>{{ item.desc }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <!-- SIDEBAR -->
          <aside class="content-side">
            <div class="side-card">
              <div class="side-card-hdr">
                <span class="side-card-badge">Impact</span>
                <h3>Key numbers</h3>
              </div>
              <div class="side-list">
                <div v-for="item in impactNumbers" :key="item.label" class="side-item">
                  <div class="side-item-dot"></div>
                  <div class="side-item-info">
                    <strong>{{ item.value }}</strong>
                    <small>{{ item.label }}</small>
                  </div>
                </div>
              </div>
            </div>

            <div class="side-card">
              <div class="side-card-hdr">
                <span class="side-card-badge">Content</span>
                <h3>Related pages</h3>
              </div>
              <div class="side-nav">
                <RouterLink v-for="page in infoPages" :key="page.slug" :to="'/admin/editor/' + page.slug" class="side-nav-link">
                  <div class="side-nav-info">
                    <strong>{{ page.title }}</strong>
                    <small>{{ page.route }}</small>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                </RouterLink>
              </div>
            </div>

            <div class="side-card">
              <div class="side-card-hdr">
                <span class="side-card-badge">Actions</span>
                <h3>Manage</h3>
              </div>
              <RouterLink class="side-btn" to="/admin/modules/programs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Program records
              </RouterLink>
              <RouterLink class="side-btn" to="/admin/editor/programs-education">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit page content
              </RouterLink>
              <RouterLink class="side-btn" to="/admin/media">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Media library
              </RouterLink>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.edu-dash {
  --bg: var(--admin-theme-bg);
  --surface: var(--admin-theme-surface);
  --border: var(--admin-theme-border);
  --border-s: var(--admin-theme-border-strong);
  --text: var(--admin-theme-text);
  --contrast: var(--admin-theme-contrast);
  --muted: var(--admin-theme-muted);
  --blue: var(--admin-theme-teal);
  --blue-glow: color-mix(in srgb, var(--admin-theme-teal) 25%, transparent);
  --blue-soft: color-mix(in srgb, var(--admin-theme-teal) 12%, transparent);
  --emerald: var(--admin-theme-primary);
  --emerald-glow: color-mix(in srgb, var(--admin-theme-primary) 25%, transparent);
  --emerald-soft: color-mix(in srgb, var(--admin-theme-primary) 12%, transparent);
  --amber: var(--admin-theme-gold);
  --amber-glow: color-mix(in srgb, var(--admin-theme-gold) 25%, transparent);
  --amber-soft: color-mix(in srgb, var(--admin-theme-gold) 12%, transparent);
  --violet: #7c3aed;
  --violet-glow: rgba(124,58,237,0.25);
  --violet-soft: color-mix(in srgb, #7c3aed 12%, transparent);
  --slate: #64748b;
  --slate-soft: color-mix(in srgb, #64748b 12%, transparent);
  --shadow-xs: var(--admin-theme-shadow);
  --shadow-sm: var(--admin-theme-shadow);
  --shadow-md: var(--admin-theme-shadow);
  --shadow-lg: var(--admin-theme-shadow);
--radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;

  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}

.dash-layout { display: flex; }
.dash-main { flex: 1; width: 100%; padding: 1.25rem 1.5rem 2rem; }

/* ─── BUTTONS ─── */
.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  min-height: 36px; padding: 0.4rem 1rem;
border-radius: var(--radius-sm); font-weight: 700; font-size: 0.82rem;
  cursor: pointer; text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  border: 1px solid transparent; font-family: inherit;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff; border-color: transparent;
  box-shadow: 0 4px 14px rgba(37,99,235,0.3);
}
.btn-primary:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.4); }
.btn-ghost {
  background: rgba(255,255,255,0.7); color: var(--contrast);
  border-color: var(--border); backdrop-filter: blur(8px);
}
.btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }

/* ─── BANNER ─── */
.dash-banner {
  position: relative; background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-md);
  overflow: hidden;
}
.banner-glow {
  position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 400px 200px at 10% 30%, rgba(37,99,235,0.08) 0%, transparent 70%),
    radial-gradient(ellipse 300px 200px at 90% 80%, rgba(5,150,105,0.05) 0%, transparent 70%);
  pointer-events: none;
}
.banner-particles {
  position: absolute; inset: 0; overflow: hidden; pointer-events: none;
}
.banner-particles span {
  position: absolute; width: 6px; height: 6px; border-radius: 50%;
  background: rgba(37,99,235,0.1);
}
.banner-particles span:nth-child(1) { top: 15%; left: 10%; animation: float 8s ease-in-out infinite; }
.banner-particles span:nth-child(2) { top: 60%; right: 15%; width: 4px; height: 4px; animation: float 6s ease-in-out infinite reverse; }
.banner-particles span:nth-child(3) { bottom: 20%; left: 40%; width: 5px; height: 5px; animation: float 10s ease-in-out infinite 2s; }
.banner-particles span:nth-child(4) { top: 25%; right: 30%; animation: float 7s ease-in-out infinite 1s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); opacity: 0.4; }
  50% { transform: translateY(-12px) scale(1.2); opacity: 0.8; }
}

.banner-inner { position: relative; z-index: 1; }
.banner-breadcrumb {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border);
  font-size: 0.76rem; font-weight: 700;
}
:global(.admin-dark) .banner-breadcrumb { background: rgba(16,24,38,0.5); }
.bcrumb-link { color: var(--blue); text-decoration: none; }
.bcrumb-link:hover { text-decoration: underline; }
.bcrumb-sep { color: var(--muted); width: 10px; }
.bcrumb-label { color: var(--muted); }
.bcrumb-current { color: var(--contrast); }

.banner-content {
  display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;
  padding: 1.25rem 1.25rem 0.75rem;
}
.banner-text { display: grid; gap: 0.3rem; }
.banner-badge {
  display: inline-flex; align-items: center; gap: 0.35rem; width: fit-content;
font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--blue); background: var(--blue-soft);
  padding: 0.2rem 0.7rem; border-radius: 999px;
}
.banner-title {
  margin: 0; color: var(--contrast);
font-size: clamp(1.35rem,2.8vw,1.85rem); font-weight: 700;
  letter-spacing: -0.025em; line-height: 1.1;
}
.banner-desc { margin: 0; color: var(--muted); font-size: 0.86rem; line-height: 1.5; max-width: 460px; }
.banner-actions { display: flex; gap: 0.45rem; flex-shrink: 0; flex-wrap: wrap; }

.banner-stats {
  display: grid; grid-template-columns: repeat(4,1fr);
  border-top: 1px solid var(--border);
}
.bstat {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.75rem 1rem;
  border-right: 1px solid var(--border);
  text-decoration: none; transition: all 0.2s ease;
}
.bstat:last-child { border-right: none; }
.bstat:hover { background: var(--surface); }
.bstat-icon {
  width: 40px; height: 40px; display: grid; place-items: center;
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.bstat:hover .bstat-icon { transform: scale(1.08); }
.bstat-blue .bstat-icon { background: var(--blue-soft); color: var(--blue);
  box-shadow: 0 0 0 0 var(--blue-glow); }
.bstat-blue:hover .bstat-icon { box-shadow: 0 0 0 4px var(--blue-glow); }
.bstat-emerald .bstat-icon { background: var(--emerald-soft); color: var(--emerald);
  box-shadow: 0 0 0 0 var(--emerald-glow); }
.bstat-emerald:hover .bstat-icon { box-shadow: 0 0 0 4px var(--emerald-glow); }
.bstat-amber .bstat-icon { background: var(--amber-soft); color: var(--amber);
  box-shadow: 0 0 0 0 var(--amber-glow); }
.bstat-amber:hover .bstat-icon { box-shadow: 0 0 0 4px var(--amber-glow); }
.bstat-violet .bstat-icon { background: var(--violet-soft); color: var(--violet);
  box-shadow: 0 0 0 0 var(--violet-glow); }
.bstat-violet:hover .bstat-icon { box-shadow: 0 0 0 4px var(--violet-glow); }
.bstat-info strong { display: block; color: var(--contrast); font-size: 1.05rem; font-weight: 700; line-height: 1.2; }
.bstat-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.02em; }
.bstat-desc { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 500; margin-top: 1px; }

/* ─── CONTENT GRID ─── */
.content-grid {
  display: grid; grid-template-columns: minmax(0,1fr) 280px;
  gap: 1.25rem; margin-top: 1.25rem; align-items: start;
}
.content-main { display: grid; gap: 1.25rem; }
.content-side { display: grid; gap: 0.85rem; position: sticky; top: calc(60px + 1.25rem); }

/* ─── CARD ─── */
.card-section {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-xl); box-shadow: var(--shadow-sm);
  overflow: hidden; transition: box-shadow 0.2s ease;
}
.card-section:hover { box-shadow: var(--shadow-md); }
.card-hdr {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem;
  padding: 0.85rem 1.2rem;
  border-bottom: 1px solid var(--border);
}
.card-hdr-left { display: grid; gap: 0.15rem; }
.card-badge {
font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--blue);
}
.card-title { margin: 0; color: var(--contrast); font-size: 0.95rem; font-weight: 700; }
.card-hdr-link {
  display: inline-flex; align-items: center; gap: 0.3rem;
  font-size: 0.78rem; font-weight: 700; color: var(--blue); text-decoration: none;
  padding: 0.3rem 0.6rem; border-radius: var(--radius-sm);
  transition: background 0.15s ease;
}
.card-hdr-link:hover { background: var(--blue-soft); }
.card-body { padding: 1rem 1.2rem 1.2rem; }

/* ─── LINKS GRID ─── */
.links-grid { display: grid; grid-template-columns: repeat(2,1fr); gap: 0.7rem; }
.link-card {
  display: flex; align-items: center; gap: 0.7rem;
  padding: 0.75rem 0.85rem; border-radius: var(--radius-md);
  border: 1px solid var(--border); background: var(--surface);
  text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.link-card:hover {
  border-color: var(--border-s);
  box-shadow: var(--shadow-sm); transform: translateY(-2px);
}
.link-icon {
  width: 36px; height: 36px; display: grid; place-items: center;
  border-radius: var(--radius-sm); flex-shrink: 0;
  transition: transform 0.2s ease;
}
.link-card:hover .link-icon { transform: scale(1.1); }
.link-blue .link-icon { background: var(--blue-soft); color: var(--blue); }
.link-emerald .link-icon { background: var(--emerald-soft); color: var(--emerald); }
.link-amber .link-icon { background: var(--amber-soft); color: var(--amber); }
.link-violet .link-icon { background: var(--violet-soft); color: var(--violet); }
.link-text { flex: 1; min-width: 0; }
.link-text strong { display: block; color: var(--contrast); font-size: 0.82rem; font-weight: 700; margin-bottom: 1px; }
.link-text small { display: block; color: var(--muted); font-size: 0.72rem; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.link-arrow { flex-shrink: 0; color: var(--muted); transition: transform 0.2s ease; }
.link-card:hover .link-arrow { transform: translateX(3px); color: var(--blue); }

/* ─── HIGHLIGHTS GRID ─── */
.highlights-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem;
}
.hcard {
  border: 1px solid var(--border); border-radius: var(--radius-md);
  background: var(--surface); overflow: hidden;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
}
.hcard:hover { transform: translateY(-3px); box-shadow: var(--shadow-sm);
  border-color: color-mix(in srgb, var(--hc) 25%, var(--border-s)); }
.hcard-blue { --hc: var(--blue); }
.hcard-emerald { --hc: var(--emerald); }
.hcard-amber { --hc: var(--amber); }
.hcard-violet { --hc: var(--violet); }
.hcard-slate { --hc: var(--slate); }
.hcard-top {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0.55rem 0.7rem;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.hcard-icon {
  width: 26px; height: 26px; display: grid; place-items: center;
  border-radius: 6px;
  background: color-mix(in srgb, var(--hc) 12%, var(--surface));
  color: var(--hc);
}
.hcard-count {
  font-size: 0.72rem; font-weight: 700; color: var(--muted);
  padding: 0.1rem 0.4rem; border-radius: 999px;
  background: var(--surface); border: 1px solid var(--border);
}
.hcard-body { padding: 0.5rem 0.7rem 0.65rem; display: grid; gap: 0.12rem; }
.hcard-body strong { color: var(--contrast); font-size: 0.8rem; font-weight: 700; }
.hcard-body small { color: var(--muted); font-size: 0.7rem; font-weight: 500; line-height: 1.4; }

/* ─── SIDEBAR ─── */
.side-card {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: var(--radius-lg); padding: 0.85rem;
  box-shadow: var(--shadow-xs); transition: box-shadow 0.2s ease;
}
.side-card:hover { box-shadow: var(--shadow-sm); }
.side-card-hdr { display: grid; gap: 0.15rem; margin-bottom: 0.7rem; }
.side-card-badge {
font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;
  color: var(--blue);
}
.side-card-hdr h3 { margin: 0; color: var(--contrast); font-size: 0.85rem; font-weight: 700; }

.side-list { display: grid; gap: 0.5rem; }
.side-item {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.5rem 0.6rem; border-radius: var(--radius-sm);
  background: var(--surface); border: 1px solid var(--border);
  transition: border-color 0.15s ease;
}
.side-item:hover { border-color: var(--border-s); }
.side-item-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--blue); flex-shrink: 0;
}
.side-item-info strong { display: block; color: var(--contrast); font-size: 0.9rem; font-weight: 700; line-height: 1.2; }
.side-item-info small { display: block; color: var(--muted); font-size: 0.7rem; font-weight: 600; }

.side-nav { display: grid; gap: 0.25rem; }
.side-nav-link {
  display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
  padding: 0.45rem 0.6rem; border-radius: var(--radius-sm);
  text-decoration: none; transition: background 0.15s ease;
}
.side-nav-link:hover { background: var(--surface); }
.side-nav-info strong { display: block; color: var(--contrast); font-size: 0.78rem; font-weight: 700; }
.side-nav-info small { display: block; color: var(--muted); font-size: 0.68rem; font-weight: 500; }
.side-nav-link > svg { color: var(--muted); flex-shrink: 0; }

.side-btn {
  display: flex; align-items: center; gap: 0.45rem;
  padding: 0.45rem 0.6rem; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--surface);
color: var(--text); font-size: 0.78rem; font-weight: 600;
  text-decoration: none; transition: all 0.15s ease;
  margin-bottom: 0.3rem;
}
.side-btn:last-child { margin-bottom: 0; }
.side-btn:hover { border-color: var(--border-s); background: var(--surface); color: var(--contrast); box-shadow: var(--shadow-xs); }

/* ─── RESPONSIVE ─── */
@media (min-width: 900px) { .edu-dash.sidebar-open { padding-left: 260px; } }
@media (max-width: 1100px) {
  .content-grid { grid-template-columns: 1fr; }
  .content-side { position: static; }
}
@media (max-width: 900px) {
  .banner-stats { grid-template-columns: repeat(2,1fr); }
  .links-grid { grid-template-columns: 1fr; }
  .highlights-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 720px) {
  .dash-main { padding: 1rem; }
  .banner-content { flex-direction: column; }
  .banner-stats { grid-template-columns: 1fr; }
  .bstat { border-right: none; border-bottom: 1px solid var(--border); }
  .bstat:last-child { border-bottom: none; }
  .highlights-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .banner-actions { width: 100%; }
  .banner-actions .btn { flex: 1; justify-content: center; }
}
</style>
