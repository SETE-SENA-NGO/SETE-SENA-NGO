<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'

const ui = useUiStore()

const totalStats = [
  { label: 'Active Programs', value: '4', desc: 'Program areas', color: 'blue' },
  { label: 'Villages Served', value: '86', desc: 'Across Cambodia', color: 'emerald' },
  { label: 'Children Impacted', value: '8,200+', desc: 'Under 18', color: 'amber' },
  { label: 'Communities', value: '61', desc: 'In program areas', color: 'violet' },
]

const programs = [
  {
    title: 'Education',
    desc: 'Early childhood education, mobile libraries, scholarships, and teacher training across Cambodian communities.',
    route: '/admin/education',
    stats: '17 schools · 3,400+ children · 43 villages',
    color: 'prog-blue',
  },
  {
    title: 'Environment',
    desc: 'Reforestation, renewable energy, waste management, and climate resilience projects.',
    route: '/admin/environment',
    stats: '571 ha forest · 6 nurseries · 280+ biogas',
    color: 'prog-emerald',
  },
  {
    title: 'Livelihood',
    desc: 'Savings groups, agricultural cooperatives, vocational training, and food security initiatives.',
    route: '/admin/livelihood',
    stats: '38 groups · 15 co-ops · 1,700+ trained',
    color: 'prog-amber',
  },
  {
    title: 'Child Protection',
    desc: 'Protection networks, peer education, safe migration awareness, and family strengthening.',
    route: '/admin/child-protection',
    stats: '14 networks · 200+ educators · 500+ safe',
    color: 'prog-violet',
  },
]

const quickActions = [
  { title: 'Manage Program Records', desc: 'Create & edit data entries', to: '/admin/modules/programs' },
  { title: 'Media Library', desc: 'Upload images & documents', to: '/admin/media' },
  { title: 'Edit Website Pages', desc: 'Update public content', to: '/admin/editor/programs' },
  { title: 'Settings', desc: 'Configure preferences', to: '/admin/settings' },
]

const infoPages = [
  { title: 'Programs Page Content', slug: 'programs', route: '/programs' },
  { title: 'Education Page', slug: 'programs-education', route: '/programs/education' },
  { title: 'Environment Page', slug: 'programs-environment', route: '/programs/environment' },
  { title: 'Livelihood Page', slug: 'programs-livelihood', route: '/programs/livelihood' },
  { title: 'Child Protection Page', slug: 'programs-child-protection', route: '/programs/child-protection' },
]
</script>

<template>
  <div :class="['prog-overview', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="dash-layout">
      <AdminSidebar />
      <main class="dash-main">
        <header class="dash-banner">
          <div class="banner-glow" aria-hidden="true"></div>
          <div class="banner-particles" aria-hidden="true">
            <span></span><span></span><span></span><span></span>
          </div>
          <div class="banner-inner">
            <div class="banner-breadcrumb">
              <RouterLink to="/admin" class="bcrumb-link">Dashboard</RouterLink>
              <svg class="bcrumb-sep" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              <span class="bcrumb-current">Programs</span>
            </div>
            <div class="banner-content">
              <div class="banner-text">
                <div class="banner-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  Program management
                </div>
                <h1 class="banner-title">Programs Overview</h1>
                <p class="banner-desc">Manage all four program areas — Education, Environment, Livelihood, and Child Protection.</p>
              </div>
              <div class="banner-actions">
                <RouterLink class="btn btn-primary" to="/admin/modules/programs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                  Manage Records
                </RouterLink>
                <RouterLink class="btn btn-ghost" to="/programs">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  View Site
                </RouterLink>
              </div>
            </div>
            <div class="banner-stats">
              <div v-for="stat in totalStats" :key="stat.label" class="bstat" :class="'bstat-' + stat.color">
                <div class="bstat-icon">
                  <svg v-if="stat.color === 'blue'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                  <svg v-else-if="stat.color === 'emerald'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  <svg v-else-if="stat.color === 'amber'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div class="bstat-info">
                  <strong>{{ stat.value }}</strong>
                  <small>{{ stat.label }}</small>
                  <span class="bstat-desc">{{ stat.desc }}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div class="content-grid">
          <div class="content-main">
            <section class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Program areas</span>
                  <h2 class="card-title">All programs</h2>
                </div>
              </div>
              <div class="card-body">
                <div class="programs-grid">
                  <RouterLink
                    v-for="program in programs"
                    :key="program.title"
                    :to="program.route"
                    class="prog-card"
                    :class="program.color"
                  >
                    <div class="prog-top">
                      <span class="prog-icon">
                        <svg v-if="program.color === 'prog-blue'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c0 1.1 2 2 6 2s6-.9 6-2v-5"/></svg>
                        <svg v-else-if="program.color === 'prog-emerald'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>
                        <svg v-else-if="program.color === 'prog-amber'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                      </span>
                      <svg class="prog-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                    </div>
                    <div class="prog-body">
                      <h3>{{ program.title }}</h3>
                      <p>{{ program.desc }}</p>
                      <span class="prog-stats">{{ program.stats }}</span>
                    </div>
                  </RouterLink>
                </div>
              </div>
            </section>

            <section class="card-section">
              <div class="card-hdr">
                <div class="card-hdr-left">
                  <span class="card-badge">Quick access</span>
                  <h2 class="card-title">Common tasks</h2>
                </div>
              </div>
              <div class="card-body">
                <div class="actions-grid">
                  <RouterLink v-for="action in quickActions" :key="action.title" :to="action.to" class="action-card">
                    <div class="action-text">
                      <strong>{{ action.title }}</strong>
                      <small>{{ action.desc }}</small>
                    </div>
                    <svg class="action-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
                  </RouterLink>
                </div>
              </div>
            </section>
          </div>

          <aside class="content-side">
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
                <span class="side-card-badge">Navigate</span>
                <h3>Quick links</h3>
              </div>
              <RouterLink class="side-btn" to="/admin/modules/programs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                Program records
              </RouterLink>
              <RouterLink class="side-btn" to="/admin/media">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                Media library
              </RouterLink>
              <RouterLink class="side-btn" to="/admin/editor/programs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                Edit page content
              </RouterLink>
            </div>
          </aside>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
.prog-overview {
  --bg: #f3f6fd; --surface: #ffffff; --border: #e8edf6; --border-s: #d4dcee;
  --text: #1e2a4a; --contrast: #0a142d; --muted: #6a7fa0;
  --blue: #2563eb; --blue-soft: #ecf2ff;
  --emerald: #059669; --emerald-soft: #eafaf5;
  --amber: #d97706; --amber-soft: #fef8ee;
  --violet: #7c3aed; --violet-soft: #f3efff;
  --prog-blue: #2563eb; --prog-emerald: #059669; --prog-amber: #d97706; --prog-violet: #7c3aed;
  --shadow-xs: 0 1px 2px rgba(10,20,45,0.04);
  --shadow-sm: 0 2px 8px rgba(10,20,45,0.06);
  --shadow-md: 0 4px 16px rgba(10,20,45,0.07);
  --shadow-lg: 0 8px 32px rgba(10,20,45,0.09);
  --radius-sm: 8px; --radius-md: 12px; --radius-lg: 16px; --radius-xl: 20px;
  min-height: 100vh; background: var(--bg); color: var(--text);
  transition: padding-left 0.3s cubic-bezier(0.16,1,0.3,1);
}
:global(.admin-dark) .prog-overview {
  --bg: #080c1a; --surface: #101826; --border: #1c2642; --border-s: #263252;
  --text: #c8d2e6; --contrast: #eaf0f8; --muted: #7a8aaa;
  --blue: #3b82f6; --blue-soft: #172244;
  --emerald: #10b981; --emerald-soft: #142a22;
  --amber: #f59e0b; --amber-soft: #241e14;
  --violet: #a78bfa; --violet-soft: #1c1640;
  --prog-blue: #3b82f6; --prog-emerald: #10b981; --prog-amber: #f59e0b; --prog-violet: #a78bfa;
  --shadow-xs: 0 1px 2px rgba(0,0,0,0.15);
  --shadow-sm: 0 2px 8px rgba(0,0,0,0.2);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.25);
  --shadow-lg: 0 8px 32px rgba(0,0,0,0.3);
}

.dash-layout { display: flex; }
.dash-main { flex:1; width:100%; padding:1.25rem 1.5rem 2rem; }

.btn {
  display: inline-flex; align-items: center; gap: 0.45rem;
  min-height: 36px; padding: 0.4rem 1rem;
  border-radius: var(--radius-sm); font-weight: 750; font-size: 0.82rem;
  cursor: pointer; text-decoration: none;
  transition: all 0.2s cubic-bezier(0.16,1,0.3,1);
  border: 1px solid transparent; font-family: inherit;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: #fff; box-shadow: 0 4px 14px rgba(37,99,235,0.3);
}
.btn-primary:hover { box-shadow: 0 6px 24px rgba(37,99,235,0.4); }
.btn-ghost {
  background: rgba(255,255,255,0.7); color: var(--contrast);
  border-color: var(--border); backdrop-filter: blur(8px);
}
.btn-ghost:hover { background: var(--surface); border-color: var(--border-s); box-shadow: var(--shadow-sm); }
:global(.admin-dark) .btn-ghost { background: rgba(16,24,38,0.7); border-color: var(--border); }

.dash-banner { position: relative; background: var(--surface); border:1px solid var(--border); border-radius:var(--radius-xl); box-shadow:var(--shadow-md); overflow:hidden; }
.banner-glow { position:absolute; inset:0; background:radial-gradient(ellipse 400px 200px at 10% 30%,rgba(37,99,235,0.08) 0%,transparent 70%),radial-gradient(ellipse 300px 200px at 90% 80%,rgba(5,150,105,0.05) 0%,transparent 70%); pointer-events:none; }
.banner-particles { position:absolute; inset:0; overflow:hidden; pointer-events:none; }
.banner-particles span { position:absolute; width:6px; height:6px; border-radius:50%; background:rgba(37,99,235,0.1); }
.banner-particles span:nth-child(1) { top:15%; left:10%; animation:float 8s ease-in-out infinite; }
.banner-particles span:nth-child(2) { top:60%; right:15%; width:4px; height:4px; animation:float 6s ease-in-out infinite reverse; }
.banner-particles span:nth-child(3) { bottom:20%; left:40%; width:5px; height:5px; animation:float 10s ease-in-out infinite 2s; }
.banner-particles span:nth-child(4) { top:25%; right:30%; animation:float 7s ease-in-out infinite 1s; }
@keyframes float { 0%,100%{transform:translateY(0) scale(1);opacity:.4} 50%{transform:translateY(-12px) scale(1.2);opacity:.8} }
.banner-inner { position:relative; z-index:1; }
.banner-breadcrumb { display:flex;align-items:center;gap:.4rem;padding:.6rem 1.25rem;background:rgba(255,255,255,.5);backdrop-filter:blur(8px);border-bottom:1px solid var(--border);font-size:.76rem;font-weight:700 }
:global(.admin-dark) .banner-breadcrumb { background:rgba(16,24,38,.5) }
.bcrumb-link { color:var(--blue); text-decoration:none; }
.bcrumb-link:hover { text-decoration:underline; }
.bcrumb-sep { color:var(--muted); width:10px; }
.bcrumb-current { color:var(--contrast); }
.banner-content { display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;padding:1.25rem 1.25rem .75rem }
.banner-text { display:grid; gap:.3rem; }
.banner-badge { display:inline-flex;align-items:center;gap:.35rem;width:fit-content;font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--blue);background:var(--blue-soft);padding:.2rem .7rem;border-radius:999px }
.banner-title { margin:0;color:var(--contrast);font-size:clamp(1.35rem,2.8vw,1.85rem);font-weight:900;letter-spacing:-.025em;line-height:1.1 }
.banner-desc { margin:0;color:var(--muted);font-size:.86rem;line-height:1.5;max-width:460px }
.banner-actions { display:flex;gap:.45rem;flex-shrink:0;flex-wrap:wrap }
.banner-stats { display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--border) }
.bstat { display:flex;align-items:center;gap:.7rem;padding:.75rem 1rem;border-right:1px solid var(--border);transition:all .2s ease }
.bstat:last-child { border-right:none; }
.bstat:hover { background:var(--surface); }
.bstat-icon { width:40px;height:40px;display:grid;place-items:center;border-radius:var(--radius-sm);flex-shrink:0;transition:transform .2s ease,box-shadow .2s ease }
.bstat:hover .bstat-icon { transform:scale(1.08); }
.bstat-blue .bstat-icon { background:var(--blue-soft);color:var(--blue) }
.bstat-blue:hover .bstat-icon { box-shadow:0 0 0 4px rgba(37,99,235,.2) }
.bstat-emerald .bstat-icon { background:var(--emerald-soft);color:var(--emerald) }
.bstat-emerald:hover .bstat-icon { box-shadow:0 0 0 4px rgba(5,150,105,.2) }
.bstat-amber .bstat-icon { background:var(--amber-soft);color:var(--amber) }
.bstat-amber:hover .bstat-icon { box-shadow:0 0 0 4px rgba(217,119,6,.2) }
.bstat-violet .bstat-icon { background:var(--violet-soft);color:var(--violet) }
.bstat-violet:hover .bstat-icon { box-shadow:0 0 0 4px rgba(124,58,237,.2) }
.bstat-info strong { display:block;color:var(--contrast);font-size:1.05rem;font-weight:900;line-height:1.2 }
.bstat-info small { display:block;color:var(--muted);font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.02em }
.bstat-desc { display:block;color:var(--muted);font-size:.68rem;font-weight:600;margin-top:1px }

.content-grid { display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:1.25rem;margin-top:1.25rem;align-items:start }
.content-main { display:grid;gap:1.25rem }
.content-side { display:grid;gap:.85rem;position:sticky;top:calc(60px + 1.25rem) }
.card-section { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-xl);box-shadow:var(--shadow-sm);overflow:hidden;transition:box-shadow .2s ease }
.card-section:hover { box-shadow:var(--shadow-md) }
.card-hdr { display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;padding:.85rem 1.2rem;border-bottom:1px solid var(--border) }
.card-hdr-left { display:grid;gap:.15rem }
.card-badge { font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--blue) }
.card-title { margin:0;color:var(--contrast);font-size:.95rem;font-weight:850 }
.card-hdr-link { display:inline-flex;align-items:center;gap:.3rem;font-size:.78rem;font-weight:700;color:var(--blue);text-decoration:none;padding:.3rem .6rem;border-radius:var(--radius-sm);transition:background .15s ease }
.card-hdr-link:hover { background:var(--blue-soft) }
.card-body { padding:1rem 1.2rem 1.2rem }

.programs-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:.85rem }
.prog-card { display:flex;flex-direction:column;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--surface);text-decoration:none;transition:all .25s cubic-bezier(.16,1,.3,1);overflow:hidden }
.prog-card:hover { transform:translateY(-4px);box-shadow:var(--shadow-lg);border-color:color-mix(in srgb,var(--pc) 30%,var(--border-s)) }
.prog-blue { --pc:#2563eb } .prog-emerald { --pc:#059669 } .prog-amber { --pc:#d97706 } .prog-violet { --pc:#7c3aed }
:global(.admin-dark) .prog-blue { --pc:#3b82f6 } :global(.admin-dark) .prog-emerald { --pc:#10b981 } :global(.admin-dark) .prog-amber { --pc:#f59e0b } :global(.admin-dark) .prog-violet { --pc:#a78bfa }
.prog-top { display:flex;align-items:center;justify-content:space-between;padding:.7rem .8rem .5rem;border-bottom:1px solid var(--border);background:var(--surface) }
.prog-icon { width:40px;height:40px;display:grid;place-items:center;border-radius:var(--radius-sm);background:color-mix(in srgb,var(--pc) 12%,var(--surface));color:var(--pc);transition:transform .2s ease }
.prog-card:hover .prog-icon { transform:scale(1.1) }
.prog-arrow { color:var(--muted);transition:transform .2s ease }
.prog-card:hover .prog-arrow { transform:translateX(4px);color:var(--pc) }
.prog-body { padding:.65rem .8rem .85rem;display:grid;gap:.25rem }
.prog-body h3 { margin:0;color:var(--contrast);font-size:.95rem;font-weight:850 }
.prog-body p { margin:0;color:var(--muted);font-size:.75rem;line-height:1.45;font-weight:600 }
.prog-stats { display:inline-block;width:fit-content;font-size:.68rem;font-weight:700;color:var(--pc);background:color-mix(in srgb,var(--pc) 10%,var(--surface));padding:.15rem .5rem;border-radius:999px;margin-top:.1rem }

.actions-grid { display:grid;grid-template-columns:repeat(2,1fr);gap:.65rem }
.action-card { display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.75rem .85rem;border-radius:var(--radius-md);border:1px solid var(--border);background:var(--surface);text-decoration:none;transition:all .2s cubic-bezier(.16,1,.3,1) }
.action-card:hover { border-color:var(--border-s);box-shadow:var(--shadow-sm);transform:translateY(-2px) }
.action-text { flex:1;min-width:0 }
.action-text strong { display:block;color:var(--contrast);font-size:.82rem;font-weight:800;margin-bottom:1px }
.action-text small { display:block;color:var(--muted);font-size:.72rem;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap }
.action-arrow { flex-shrink:0;color:var(--muted);transition:transform .2s ease }
.action-card:hover .action-arrow { transform:translateX(3px);color:var(--blue) }

.side-card { background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:.85rem;box-shadow:var(--shadow-xs);transition:box-shadow .2s ease }
.side-card:hover { box-shadow:var(--shadow-sm) }
.side-card-hdr { display:grid;gap:.15rem;margin-bottom:.7rem }
.side-card-badge { font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.04em;color:var(--blue) }
.side-card-hdr h3 { margin:0;color:var(--contrast);font-size:.85rem;font-weight:800 }
.side-nav { display:grid;gap:.25rem }
.side-nav-link { display:flex;align-items:center;justify-content:space-between;gap:.5rem;padding:.45rem .6rem;border-radius:var(--radius-sm);text-decoration:none;transition:background .15s ease }
.side-nav-link:hover { background:var(--surface) }
.side-nav-info strong { display:block;color:var(--contrast);font-size:.78rem;font-weight:800 }
.side-nav-info small { display:block;color:var(--muted);font-size:.68rem;font-weight:600 }
.side-nav-link > svg { color:var(--muted);flex-shrink:0 }
.side-btn { display:flex;align-items:center;gap:.45rem;padding:.45rem .6rem;border-radius:var(--radius-sm);border:1px solid var(--border);background:var(--surface);color:var(--text);font-size:.78rem;font-weight:700;text-decoration:none;transition:all .15s ease;margin-bottom:.3rem }
.side-btn:last-child { margin-bottom:0 }
.side-btn:hover { border-color:var(--border-s);background:var(--surface);color:var(--contrast);box-shadow:var(--shadow-xs) }

@media (min-width:900px) { .prog-overview.sidebar-open { padding-left:260px } }
@media (max-width:1100px) { .content-grid { grid-template-columns:1fr } .content-side { position:static } }
@media (max-width:900px) { .banner-stats { grid-template-columns:repeat(2,1fr) } .programs-grid { grid-template-columns:1fr } .actions-grid { grid-template-columns:1fr } }
@media (max-width:720px) { .dash-main { padding:1rem } .banner-content { flex-direction:column } .banner-stats { grid-template-columns:1fr } .bstat { border-right:none;border-bottom:1px solid var(--border) } .bstat:last-child { border-bottom:none } }
@media (max-width:600px) { .banner-actions { width:100% } .banner-actions .btn { flex:1;justify-content:center } }
</style>
