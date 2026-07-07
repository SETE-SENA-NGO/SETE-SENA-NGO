export type NavChild = { to: string; label: string; desc: string; hash?: string }
export type NavLink = { to: string; label: string; children?: NavChild[] }

export const links: NavLink[] = [
  { to: '/', label: 'Home' },
  {
    to: '/about',
    label: 'About',
    children: [
      { to: '/about', label: 'Our Story', desc: 'Founded 1994 — three decades walking with villages.' },
      { to: '/about/vision', label: 'Vision & Mission', desc: 'Peace, sustainability, dignified livelihoods.' },
      { to: '/about/organization', label: 'Organization', desc: 'Board, staff and field structure.' },
    ],
  },
  {
    to: '/programs',
    label: 'Programs',
    children: [
      { to: '/programs/education', label: 'Education', desc: 'Pre-schools, scholarships and youth learning.' },
      { to: '/programs/environment', label: 'Environment', desc: 'Reforestation, biogas and climate resilience.' },
      { to: '/programs/livelihood', label: 'Livelihood', desc: 'Saving-for-Change groups and rural enterprise.' },
      { to: '/programs/child-protection', label: 'Child Protection', desc: 'Safeguarding and community-led care.' },
    ],
  },
  {
    to: '/impact',
    label: 'Impact',
    children: [
      { to: '/impact/numbers', label: 'By the Numbers', desc: '293 villages reached since 1994.' },
      { to: '/impact/timeline', label: 'Timeline', desc: 'Milestones from 1994 to 2024.' },
      { to: '/impact/partners', label: 'Partners', desc: 'UNDP, ADB, Oxfam and more.' },
    ],
  },
  {
    to: '/get-involved',
    label: 'Get Involved',
    children: [
      { to: '/get-involved/donate', label: 'Support Us', desc: 'Single gifts that water dozens of households.' },
      { to: '/get-involved/partner', label: 'Partner', desc: 'Co-design multi-year community programs.' },
      { to: '/get-involved/volunteer', label: 'Volunteer', desc: 'Bring your skills to a field project.' },
    ],
  },
  {
    to: '/contact',
    label: 'Contact',
    children: [
      { to: '/contact/head-office', label: 'Head Office', desc: 'Svay Rieng Province, Cambodia.' },
      { to: '/contact/field-offices', label: 'Field Offices', desc: 'Prey Veng and Kratie provinces.' },
      { to: '/contact/write', label: 'Write to Us', desc: 'Send a message — we read every letter.' },
    ],
  },
]
