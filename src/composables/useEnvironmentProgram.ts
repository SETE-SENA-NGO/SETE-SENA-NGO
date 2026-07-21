import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabase'

/* ─── Types ────────────────────────────────────── */

export interface SupabaseProgram {
  id: string
  slug: string
  title: string
  pillar: string
  summary: string
  description: string
  icon: string | null
  color: string | null
  status: string
}

export interface SupabaseMetric {
  id: string
  metric_key: string
  label: string
  value_text: string
  unit: string | null
  icon: string | null
  sort_order: number
}

export interface SupabaseSection {
  id: string
  slug: string
  label: string
  heading: string | null
  subheading: string | null
  body: string | null
  sort_order: number
  items: SupabaseSectionItem[]
}

export interface SupabaseSectionItem {
  id: string
  slug: string
  title: string
  subtitle: string | null
  body: string | null
  item_value: string | null
  sort_order: number
}

export interface SupabasePartner {
  id: string
  name: string
  partner_type: string
  description: string | null
  sort_order: number
}

export interface SupabasePage {
  id: string
  slug: string
  title: string
  hero_headline: string | null
  hero_intro: string | null
}

/* ─── Composable ────────────────────────────────── */

export function useEnvironmentProgram() {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const program = ref<SupabaseProgram | null>(null)
  const metrics = ref<SupabaseMetric[]>([])
  const sections = ref<SupabaseSection[]>([])
  const partners = ref<SupabasePartner[]>([])
  const page = ref<SupabasePage | null>(null)

  const hasData = computed(() => !!program.value || !!page.value)

  async function load() {
    loading.value = true
    error.value = null

    try {
      // Run all queries in parallel
      const [programResult, metricsResult, sectionsResult, partnersResult, pageResult] =
        await Promise.all([
          fetchProgram(),
          fetchMetrics(),
          fetchSections(),
          fetchPartners(),
          fetchPage(),
        ])

      program.value = programResult
      metrics.value = metricsResult
      sections.value = sectionsResult
      partners.value = partnersResult
      page.value = pageResult
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load environment data'
      console.warn('[useEnvironmentProgram]', error.value)
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    program,
    metrics,
    sections,
    partners,
    page,
    hasData,
    load,
  }
}

/* ─── Queries ───────────────────────────────────── */

async function fetchProgram(): Promise<SupabaseProgram | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('id, slug, title, pillar, summary, description, icon, color, status')
    .eq('slug', 'programs-environment')
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.warn('[useEnvironmentProgram] programs query:', error.message)
    return null
  }
  return data as SupabaseProgram | null
}

async function fetchMetrics(): Promise<SupabaseMetric[]> {
  const { data, error } = await supabase
    .from('impact_metrics')
    .select('id, metric_key, label, value_text, unit, icon, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .limit(20)

  if (error) {
    console.warn('[useEnvironmentProgram] impact_metrics query:', error.message)
    return []
  }
  return (data ?? []) as SupabaseMetric[]
}

async function fetchSections(): Promise<SupabaseSection[]> {
  // First, get the page ID for 'programs-environment'
  const { data: pageData } = await supabase
    .from('pages')
    .select('id')
    .eq('slug', 'programs-environment')
    .maybeSingle()

  if (!pageData) {
    // Try falling back to route_path
    const { data: altPage } = await supabase
      .from('pages')
      .select('id')
      .eq('route_path', '/programs/environment')
      .maybeSingle()

    if (!altPage) return []
    return fetchSectionsForPage(altPage.id)
  }

  return fetchSectionsForPage(pageData.id)
}

async function fetchSectionsForPage(pageId: string): Promise<SupabaseSection[]> {
  const { data: sectionRows, error: sectionError } = await supabase
    .from('page_sections')
    .select('id, slug, label, heading, subheading, body, sort_order')
    .eq('page_id', pageId)
    .eq('status', 'published')
    .order('sort_order', { ascending: true })

  if (sectionError || !sectionRows?.length) {
    return []
  }

  const sectionIds = sectionRows.map((s: { id: string }) => s.id)

  const { data: itemRows } = await supabase
    .from('section_items')
    .select('id, slug, title, subtitle, body, item_value, sort_order, section_id')
    .in('section_id', sectionIds)
    .order('sort_order', { ascending: true })

  const itemsBySection: Record<string, SupabaseSectionItem[]> = {}
  if (itemRows) {
    for (const item of itemRows as Array<SupabaseSectionItem & { section_id: string }>) {
      const sid = item.section_id
      if (!itemsBySection[sid]) itemsBySection[sid] = []
      itemsBySection[sid].push({
        id: item.id,
        slug: item.slug,
        title: item.title,
        subtitle: item.subtitle,
        body: item.body,
        item_value: item.item_value,
        sort_order: item.sort_order,
      })
    }
  }

  return (sectionRows as Array<{
    id: string
    slug: string
    label: string
    heading: string | null
    subheading: string | null
    body: string | null
    sort_order: number
  }>).map((s) => ({
    id: s.id,
    slug: s.slug,
    label: s.label,
    heading: s.heading,
    subheading: s.subheading,
    body: s.body,
    sort_order: s.sort_order,
    items: itemsBySection[s.id] ?? [],
  }))
}

async function fetchPartners(): Promise<SupabasePartner[]> {
  const { data, error } = await supabase
    .from('partners')
    .select('id, name, partner_type, description, sort_order')
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })
    .limit(20)

  if (error) {
    console.warn('[useEnvironmentProgram] partners query:', error.message)
    return []
  }
  return (data ?? []) as SupabasePartner[]
}

async function fetchPage(): Promise<SupabasePage | null> {
  const { data, error } = await supabase
    .from('pages')
    .select('id, slug, title, hero_headline, hero_intro')
    .eq('slug', 'programs-environment')
    .maybeSingle()

  if (error) {
    console.warn('[useEnvironmentProgram] pages query:', error.message)
    return null
  }
  return data as SupabasePage | null
}
