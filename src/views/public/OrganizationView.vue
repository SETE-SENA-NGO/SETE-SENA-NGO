<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useScrollReveal } from '@/composables/useScrollReveal'

const { observe } = useScrollReveal({ threshold: 0.1 })

interface TeamMember { role: string; desc: string }

const team: TeamMember[] = [
  {
    role: 'Board of Directors',
    desc: 'Policy and oversight, including senior Buddhist leadership and respected community elders. Meets quarterly to approve strategy, budgets and audits.',
  },
  {
    role: 'Executive Director',
    desc: 'Leads daily operations and strategic execution, accountable to the Board and to the communities Santi Sena serves.',
  },
  {
    role: 'Management Committee',
    desc: 'Senior managers coordinating programs across the three provinces, finance, HR and external partnerships.',
  },
  {
    role: 'Technical Coordination Unit',
    desc: 'Cross-cutting expertise — monitoring & evaluation, gender, environment, child safeguarding — supporting every field team.',
  },
  {
    role: 'Professional Staff',
    desc: '30+ full-time and project-based staff: agronomists, teachers, social workers, accountants and community organizers.',
  },
  {
    role: 'Field Facilitators & Volunteers',
    desc: 'Trained villagers and youth who carry programs the last mile, from biogas installation to mobile library visits.',
  },
]

const priorities: string[] = [
  'Strengthened governance and accountability at every level',
  'Continuous staff and volunteer development, including safeguarding training',
  'Diversified income and funding to reduce single-donor dependency',
  'Research and knowledge management to learn from every project',
  'Public advocacy on environment, child rights and rural livelihoods',
]

interface FactItem { value: string; label: string; desc: string; icon: string }
const facts: FactItem[] = [
  { value: '30+', label: 'Full-time staff', desc: 'Advanced degrees in management, agriculture, education and rural development.', icon: 'users' },
  { value: '3', label: 'Provinces', desc: 'Svay Rieng · Prey Veng · Kratie.', icon: 'map' },
  { value: '10+', label: 'Donor partners', desc: 'UNDP, ADB, Oxfam and eight more managed grants.', icon: 'handshake' },
]

const teamCardRefs = ref<(HTMLElement | null)[]>([])
const priorityRefs = ref<(HTMLElement | null)[]>([])
const accountabilityRef = ref<HTMLElement | null>(null)

function setTeamCardRef(el: HTMLElement | null, idx: number) { teamCardRefs.value[idx] = el }
function setPriorityRef(el: HTMLElement | null, idx: number) { priorityRefs.value[idx] = el }

onMounted(() => {
  document.title = 'Organization — Santi Sena'

  const setMeta = (name: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
    if (!el) { el = document.createElement('meta'); el.name = name; document.head.appendChild(el) }
    el.content = content
  }
  setMeta('description', 'Board, executive team and field staff structure of Santi Sena across Svay Rieng, Prey Veng and Kratie provinces.')

  const setOgMeta = (property: string, content: string) => {
    let el = document.querySelector<HTMLMetaElement>(`meta[property="${property}"]`)
    if (!el) { el = document.createElement('meta'); el.setAttribute('property', property); document.head.appendChild(el) }
    el.content = content
  }
  setOgMeta('og:title', 'Organization — Santi Sena')
  setOgMeta('og:description', 'How the Peace Army is organized — from the Board of Directors to village field staff.')

  teamCardRefs.value.forEach((el) => observe(el))
  priorityRefs.value.forEach((el) => observe(el))
  observe(accountabilityRef.value)
})
</script>

<template>
  <div class="org-page">

    <!-- ═══ Key Facts ═══ -->
    <section class="facts-section">
      <div class="container">
        <div class="facts-header">
          <span class="section-badge">Key Facts</span>
          <h2 class="facts-heading">The Peace Army by the <span class="txt-gradient">numbers</span></h2>
          <p class="facts-lead">
            Santi Sena is a growing organization with professional, deep community roots,
            and trusted partnerships across southeastern Cambodia.
          </p>
        </div>
        <div class="facts-grid">
          <div v-for="(fact, idx) in facts" :key="fact.value" class="fact-card" :style="{
            '--fact-h': ['255', '38', '158'][idx],
            '--fact-s': ['84%', '92%', '50%'][idx],
            '--fact-l': ['58%', '55%', '38%'][idx]
          }">
            <div class="fact-accent" />
            <div class="fact-card-inner">
              <div class="fact-icon-ring">
                <svg v-if="fact.icon === 'users'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"
                  aria-hidden="true">
                  <path
                    d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm6 8v-1c0-2.21-3.58-4-6-4s-6 1.79-6 4v1h12z" />
                </svg>
                <svg v-else-if="fact.icon === 'map'" width="22" height="22" viewBox="0 0 24 24" fill="currentColor"
                  aria-hidden="true">
                  <path
                    d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 11.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z" />
                </svg>
                <svg v-else width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path
                    d="M12.1 21.35l-1.1-1.02C5.4 15.36 2 12.28 2 8.5 2 6 3.99 4 6.5 4c1.74 0 3.41 1.04 4.5 2.44C12.59 5.04 14.26 4 16 4 18.51 4 20.5 6 20.5 8.5c0 3.78-3.4 6.86-8.4 11.83l-.0 .02z" />
                </svg>
              </div>
              <div class="fact-value-wrap">
                <span class="fact-value">{{ fact.value }}</span>
                <span class="fact-label">{{ fact.label }}</span>
              </div>
              <p class="fact-desc">{{ fact.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ How We Are Organized ═══ -->
    <section class="team-section">
      <div class="container">
        <div class="team-header">
          <span class="section-badge">Structure</span>
          <h2 class="team-heading-title">How we are <span class="txt-gradient">organized</span></h2>
          <p class="team-lead">Leadership, technical support and field teams — connected from strategy to village
            action.</p>
        </div>

        <div class="team-timeline">
          <div class="timeline-line" aria-hidden="true" />
          <div v-for="(t, i) in team" :key="t.role" :ref="(el) => setTeamCardRef(el as HTMLElement | null, i)"
            class="reveal-on-scroll timeline-node" :class="i % 2 === 0 ? 'tl-left' : 'tl-right'"
            :style="{ transitionDelay: `${i * 0.1}s` }">
            <div class="tl-dot" :class="`dot-${i}`" aria-hidden="true">
              <span class="tl-num">{{ i + 1 }}</span>
            </div>
            <div class="tl-card" :class="`card-${i}`">
              <div class="tl-card-top">
                <div class="tl-badge" :class="`tlb-${i}`">{{
                  ['Governance', 'Leadership', 'Coordination', 'Expertise', 'Execution', 'Grassroots'][i] }}</div>
                <h3 class="tl-role">{{ t.role }}</h3>
              </div>
              <p class="tl-desc">{{ t.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Operational Priorities ═══ -->
    <section class="prio-section">
      <div class="container">
        <div class="prio-header">
          <span class="section-badge">Focus Areas</span>
          <h2 class="prio-heading">Operational <span class="txt-gradient">priorities</span></h2>
          <p class="prio-lead">The organization works through clear internal priorities so each program can stay
            accountable, resilient and useful to the communities it serves.</p>
        </div>

        <div class="prio-list">
          <div v-for="(p, i) in priorities" :key="p" :ref="(el) => setPriorityRef(el as HTMLElement | null, i)"
            class="reveal-on-scroll prio-item" :style="{ transitionDelay: `${i * 0.08}s` }">
            <div class="prio-col-num">
              <span class="prio-number">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="prio-bar-track">
                <div class="prio-bar-fill" :style="{ height: `${100 - i * 15}%` }" />
              </div>
            </div>
            <div class="prio-col-body">
              <span class="prio-text">{{ p }}</span>
              <span class="prio-cat">{{ ['Governance', 'Development', 'Finance', 'Learning', 'Advocacy'][i] }}</span>
            </div>
            <div class="prio-col-pct">
              <span class="prio-pct">{{ 100 - i * 15 }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ Accountability ═══ -->
    <section ref="accountabilityRef" class="reveal-on-scroll acc-section">
      <div class="acc-bg-orb" aria-hidden="true" />
      <div class="container">
        <div class="acc-certificate">
          <div class="acc-cert-border" aria-hidden="true" />
          <div class="acc-cert-inner">
            <div class="acc-seal">
              <svg class="acc-seal-svg" viewBox="0 0 100 100" width="80" height="80">
                <defs>
                  <linearGradient id="sealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#4ade80" />
                    <stop offset="100%" stop-color="#1BA34F" />
                  </linearGradient>
                </defs>
                <circle cx="50" cy="50" r="45" fill="none" stroke="url(#sealGrad)" stroke-width="2" opacity="0.3" />
                <circle cx="50" cy="50" r="38" fill="none" stroke="url(#sealGrad)" stroke-width="1.5" opacity="0.2" />
                <circle cx="50" cy="50" r="30" fill="none" stroke="url(#sealGrad)" stroke-width="3" opacity="0.15" />
                <path d="M50 22 L54 40 L72 40 L58 51 L63 69 L50 58 L37 69 L42 51 L28 40 L46 40 Z" fill="url(#sealGrad)"
                  opacity="0.15" />
                <circle cx="50" cy="46" r="12" fill="none" stroke="url(#sealGrad)" stroke-width="2" />
                <path d="M44 46 L48 50 L56 42" fill="none" stroke="url(#sealGrad)" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
              <div class="acc-seal-pulse" />
            </div>
            <div class="acc-body">
              <span class="section-badge acc-badge-style">Accountability</span>
              <h2 class="acc-title">How we earn <span class="txt-gradient">trust</span></h2>
              <p class="acc-text">Santi Sena is registered with Cambodia's Ministry of Interior and produces annual
                audited financial statements. Every project is monitored quarterly against pre-agreed indicators, with
                village-level feedback sessions built into each program cycle.</p>
              <div class="acc-trust-grid">
                <div class="acc-trust-chip"><span class="chip-dot" /> Registered with Ministry of Interior</div>
                <div class="acc-trust-chip"><span class="chip-dot" /> Annual audited financial statements</div>
                <div class="acc-trust-chip"><span class="chip-dot" /> Quarterly monitoring per indicator</div>
                <div class="acc-trust-chip"><span class="chip-dot" /> Village-level feedback sessions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Organization Page — Premium Editorial
   ═══════════════════════════════════════════ */

/* ─── Scroll-Reveal (Dropdown style, two-way) ─── */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(-24px);
  transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1), transform 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ─── Tokens ─── */
.org-page {
  --green: var(--primary-color);
  --green-deep: var(--primary-dark);
  --green-soft: var(--primary-light);
  --ink: var(--color-ink);
  --ink-soft: var(--color-ink-soft);
  --cream: var(--color-cream);
  --cream-soft: var(--color-cream-soft);
  --border: var(--color-border);
  --white: var(--color-white);
  --gold: #D4A837;
}

.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: var(--green-deep);
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--green-deep) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--green-deep) 18%, transparent);
}

.txt-gradient {
  background: linear-gradient(135deg, var(--green-deep), #4ade80);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════════
   Key Facts
   ═══════════════════════════════════════════ */

/* ─── Section Base ─── */
.facts-section {
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
  background: var(--cream-soft);
}

.facts-header {
  margin-bottom: 2.5rem;
}

.facts-heading {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0.75rem 0 0.75rem;
  line-height: 1.15;
}

.facts-lead {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--ink-soft);
  max-width: 1200px;
}

/* ── Facts Grid ── */
.facts-grid {
  display: grid;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  align-items: stretch;
}

/* ── Card Base ── */
.fact-card {
  position: relative;
  border-radius: 1.125rem;
  background: var(--white);
  border: 1px solid var(--border);
  box-shadow: 0 6px 20px rgba(18, 24, 32, 0.06);
  overflow: hidden;
  transition: transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.28s ease,
    border-color 0.28s ease;
  display: flex;
  align-items: center;
  min-height: 160px;
}

.fact-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 8px;
  border-top-left-radius: 1.125rem;
  border-bottom-left-radius: 1.125rem;
  background: linear-gradient(180deg, hsl(calc(var(--fact-h)), var(--fact-s), calc(var(--fact-l) + 18%)), hsl(calc(var(--fact-h)), var(--fact-s), calc(var(--fact-l) - 6%)));
}

.fact-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 26px 68px rgba(18, 24, 32, 0.09), 0 8px 20px rgba(18, 24, 32, 0.04);
  border-color: hsl(calc(var(--fact-h)), var(--fact-s), calc(var(--fact-l) + 25%));
}

/* ── Colored Accent Bar ── */
.fact-accent {
  height: 4px;
  background: linear-gradient(90deg,
      hsl(calc(var(--fact-h)), var(--fact-s), var(--fact-l)),
      hsl(calc(var(--fact-h)), var(--fact-s), calc(var(--fact-l) + 15%)));
  transition: height 0.3s ease;
}

.fact-card:hover .fact-accent {
  height: 6px;
}

/* ── Card Inner ── */
.fact-card-inner {
  padding: 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.6rem;
  width: 100%;
  min-height: 110px;
}

/* ── Icon Ring ── */
.fact-icon-ring {
  width: 3.4rem;
  height: 3.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-bottom: 0.6rem;
  background: hsla(calc(var(--fact-h)), var(--fact-s), var(--fact-l), 0.12);
  color: hsl(calc(var(--fact-h)), var(--fact-s), var(--fact-l));
  border: 1px solid transparent;
  box-shadow: 0 6px 18px rgba(12, 16, 20, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
    background 0.22s ease,
    color 0.22s ease,
    border-color 0.22s ease,
    box-shadow 0.22s ease;
}

.fact-card:hover .fact-icon-ring {
  transform: scale(1.08);
  background: hsl(calc(var(--fact-h)), var(--fact-s), var(--fact-l));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 10px 30px hsla(calc(var(--fact-h)), var(--fact-s), var(--fact-l), 0.18);
}

/* ── Value + Label ── */
.fact-value-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  margin-bottom: 0.35rem;
}

.fact-value {
  font-size: 3rem;
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg,
      hsl(calc(var(--fact-h)), var(--fact-s), var(--fact-l)),
      hsl(calc(var(--fact-h)), var(--fact-s), calc(var(--fact-l) + 20%)));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  transition: transform 0.3s ease;
}

.fact-card:hover .fact-value {
  transform: scale(1.04);
}

.fact-label {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--ink-soft);
}

/* ── Description ── */
.fact-desc {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--ink-soft);
  max-width: 100%;
}

@media (min-width: 640px) {
  .fact-card-inner {
    flex-direction: row;
    align-items: center;
    text-align: left;
  }

  .fact-icon-ring {
    margin-bottom: 0;
    margin-right: 1rem;
  }

  .fact-value-wrap {
    align-items: flex-start;
    margin-right: 1rem;
  }

  .fact-desc {
    max-width: 420px;
  }
}

/* ═══════════════════════════════════════════
   Team Timeline
   ═══════════════════════════════════════════ */

.team-section {
  padding: 4rem 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(180deg, color-mix(in srgb, var(--green-soft) 20%, white) 0%, var(--cream) 100%);
}

.team-header {
  margin-bottom: 2.5rem;
}

.team-heading-title {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0.75rem 0 0.75rem;
  line-height: 1.15;
}

.team-lead {
  max-width: 1200px;
  margin: 0 auto;
  color: var(--ink-soft);
  font-size: 1.05rem;
  line-height: 1.7;
}

.team-timeline {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, color-mix(in srgb, var(--green) 30%, transparent) 0%, var(--green) 50%, color-mix(in srgb, var(--green) 30%, transparent) 100%);
  transform: translateX(-50%);
}

.timeline-node {
  position: relative;
  margin-bottom: 1.25rem;
}

.timeline-node:last-child {
  margin-bottom: 0;
}

.tl-dot {
  position: absolute;
  left: 50%;
  top: 1rem;
  transform: translateX(-50%);
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  transition: transform 0.25s, box-shadow 0.25s;
}

.tl-dot:hover {
  transform: translateX(-50%) scale(1.12);
}

.dot-0 {
  background: color-mix(in srgb, #8b5cf6 12%, white);
  border-color: #8b5cf6;
  color: #8b5cf6;
}

.dot-1 {
  background: color-mix(in srgb, #f59e0b 12%, white);
  border-color: #f59e0b;
  color: #f59e0b;
}

.dot-2 {
  background: color-mix(in srgb, #3b82f6 12%, white);
  border-color: #3b82f6;
  color: #3b82f6;
}

.dot-3 {
  background: color-mix(in srgb, #06b6d4 12%, white);
  border-color: #06b6d4;
  color: #06b6d4;
}

.dot-4 {
  background: color-mix(in srgb, var(--green) 12%, white);
  border-color: var(--green);
  color: var(--green);
}

.dot-5 {
  background: color-mix(in srgb, #ec4899 12%, white);
  border-color: #ec4899;
  color: #ec4899;
}

.tl-num {
  font-size: 0.75rem;
  font-weight: 800;
}

.tl-card {
  position: relative;
  width: calc(50% - 2rem);
  padding: 1.5rem 1.5rem;
  border-radius: 0.85rem;
  background: var(--white);
  border: 1px solid var(--border);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}

.tl-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.06);
}

.tl-left .tl-card {
  margin-right: auto;
  margin-left: 0;
}

.tl-right .tl-card {
  margin-left: auto;
  margin-right: 0;
}

.card-0 .tl-card:hover {
  border-color: #8b5cf6;
}

.card-1 .tl-card:hover {
  border-color: #f59e0b;
}

.card-2 .tl-card:hover {
  border-color: #3b82f6;
}

.card-3 .tl-card:hover {
  border-color: #06b6d4;
}

.card-4 .tl-card:hover {
  border-color: var(--green);
}

.card-5 .tl-card:hover {
  border-color: #ec4899;
}

.tl-card-top {
  margin-bottom: 0.5rem;
}

.tl-badge {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  margin-bottom: 0.4rem;
}

.tlb-0 {
  background: color-mix(in srgb, #8b5cf6 8%, transparent);
  color: #8b5cf6;
}

.tlb-1 {
  background: color-mix(in srgb, #f59e0b 8%, transparent);
  color: #f59e0b;
}

.tlb-2 {
  background: color-mix(in srgb, #3b82f6 8%, transparent);
  color: #3b82f6;
}

.tlb-3 {
  background: color-mix(in srgb, #06b6d4 8%, transparent);
  color: #06b6d4;
}

.tlb-4 {
  background: color-mix(in srgb, var(--green) 8%, transparent);
  color: var(--green);
}

.tlb-5 {
  background: color-mix(in srgb, #ec4899 8%, transparent);
  color: #ec4899;
}

.tl-role {
  font-size: 1rem;
  font-weight: 800;
  color: var(--ink);
  margin: 0;
}

.tl-desc {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--ink-soft);
  margin: 0;
}

/* ═══════════════════════════════════════════
   Priorities — Dashboard Style
   ═══════════════════════════════════════════ */

.prio-section {
  padding: 4rem 0;
  background: var(--white);
}

.prio-header {
  margin-bottom: 2rem;
}

.prio-heading {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0.75rem 0 0.75rem;
  line-height: 1.15;
}

.prio-lead {
  max-width: 1200px;
  margin: 0 auto;
  color: var(--ink-soft);
  font-size: 1.05rem;
  line-height: 1.7;
}

.prio-list {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.prio-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.15rem 1.5rem;
  border-radius: 1rem;
  background: var(--cream-soft);
  border: 1px solid var(--border);
  transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s, background 0.25s;
}

.prio-item:hover {
  transform: translateX(5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.04);
  border-color: var(--green);
  background: var(--white);
}

.prio-col-num {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  min-width: 2.5rem;
}

.prio-number {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--green-deep);
}

.prio-bar-track {
  width: 4px;
  height: 32px;
  background: color-mix(in srgb, var(--green) 12%, transparent);
  border-radius: 999px;
  position: relative;
  overflow: hidden;
}

.prio-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  background: linear-gradient(to top, var(--green), #4ade80);
  border-radius: 999px;
  transition: height 0.8s cubic-bezier(0.22, 1, 0.36, 1);
}

.prio-col-body {
  flex: 1;
  min-width: 0;
}

.prio-text {
  font-size: 0.9rem;
  font-weight: 600;
  line-height: 1.6;
  color: var(--ink);
  display: block;
}

.prio-cat {
  display: inline-block;
  margin-top: 0.3rem;
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--green) 8%, transparent);
  color: var(--green);
}

.prio-col-pct {
  flex-shrink: 0;
}

.prio-pct {
  font-size: 1.1rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--green-deep), var(--green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ═══════════════════════════════════════════
   Accountability — Certificate Style
   ═══════════════════════════════════════════ */

.acc-section {
  position: relative;
  overflow: hidden;
  padding: 3rem 0;
  /* Softer light background with a subtle green wash */
  background: linear-gradient(180deg, color-mix(in srgb, var(--green-soft) 10%, var(--cream)) 0%, var(--cream) 100%);
}

.acc-bg-orb {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.04) 0%, transparent 70%);
  top: -150px;
  right: -100px;
  pointer-events: none;
}

.acc-certificate {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
}

.acc-cert-border {
  position: absolute;
  inset: -12px;
  border: 1px solid color-mix(in srgb, var(--green) 18%, rgba(0, 0, 0, 0.06));
  border-radius: 1.75rem;
  pointer-events: none;
}

.acc-cert-inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 2rem;
  padding: 2.5rem;
  border-radius: 1.5rem;
  background: var(--white);
  border: 4px solid color-mix(in srgb, var(--green) 100%, rgba(0, 0, 0, 0.06));
  box-shadow: 0 12px 30px color-mix(in srgb, var(--green) 20%, rgba(8, 10, 12, 0.04));
}

.acc-seal {
  position: relative;
  flex-shrink: 0;
}

.acc-seal-svg {
  display: block;
}

.acc-seal-pulse {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 1px solid rgba(74, 222, 128, 0.15);
  animation: sealPulse 3s ease-in-out infinite;
}

@keyframes sealPulse {

  0%,
  100% {
    transform: scale(1);
    opacity: 0.4;
  }

  50% {
    transform: scale(1.15);
    opacity: 0;
  }
}

.acc-body {
  flex: 1;
  min-width: 0;
}

.acc-badge-style {
  background: color-mix(in srgb, var(--green) 8%, transparent) !important;
  border-color: color-mix(in srgb, var(--green) 12%, transparent) !important;
  color: var(--green-deep) !important;
}

.acc-title {
  font-size: clamp(1.8rem, 3.5vw, 2.4rem);
  font-weight: 800;
  letter-spacing: -0.025em;
  color: var(--ink);
  margin: 0.75rem 0 0.75rem;
  line-height: 1.15;
}

.acc-text {
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--ink-soft);
  margin: 0 0 1.25rem;
  max-width: 1200px;
}

.acc-trust-grid {
  display: grid;
  gap: 0.5rem;
}

.acc-trust-chip {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
  color: var(--ink-soft);
  padding: 0.4rem 0;
}

.chip-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #4ade80;
  flex-shrink: 0;
}

/* ─── Reduced Motion ─── */
@media (prefers-reduced-motion: reduce) {

  .reveal-on-scroll,
  .reveal-on-scroll.revealed {
    opacity: 1 !important;
    transform: none !important;
    animation: none !important;
    transition: none !important;
  }

  .acc-seal-pulse {
    display: none;
  }

  .prio-item:hover {
    transform: none;
  }

  .fact-card:hover {
    transform: none;
  }

  .fact-card:hover .fact-icon-ring,
  .fact-card:hover .fact-value,
  .fact-card:hover .fact-accent {
    transform: none;
    height: 4px;
  }

  .tl-card:hover {
    transform: none;
  }
}

/* ═══════════════════════════════════════════
   Responsive
   ═══════════════════════════════════════════ */

@media (min-width: 640px) {
  .facts-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 768px) {
  .acc-cert-inner {
    padding: 3rem;
  }
}

@media (max-width: 767px) {
  .facts-section {
    padding: 3rem 0;
  }

  .team-section {
    padding: 3rem 0;
  }

  .prio-section {
    padding: 3rem 0;
  }

  .acc-section {
    padding: 3rem 0;
  }

  .timeline-line {
    left: 1.25rem;
  }

  .tl-left .tl-card,
  .tl-right .tl-card {
    width: calc(100% - 3.5rem);
    margin-left: 3.5rem;
  }

  .tl-dot {
    left: 1.25rem;
    width: 2rem;
    height: 2rem;
  }

  .tl-num {
    font-size: 0.65rem;
  }

  .acc-cert-inner {
    flex-direction: column;
    text-align: center;
    padding: 2rem;
  }

  .acc-trust-grid {
    text-align: left;
  }

  .prio-item {
    padding: 1rem 1.15rem;
  }

  .prio-col-pct {
    display: none;
  }
}

@media (max-width: 480px) {
  .fact-card-inner {
    padding: 1.5rem 1rem 1.75rem;
  }

  .fact-value {
    font-size: 2rem;
  }

  .tl-card {
    padding: 1rem 1.15rem;
  }
}
</style>
