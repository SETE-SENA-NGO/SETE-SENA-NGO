import { supabase } from '@/lib/supabase'

export type HomeSlide = {
  id: string
  imageUrl: string
  alt: string
  eyebrow: string
  title: string
  description: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel: string
  secondaryTo: string
}

// Row shape of the home_slides table (snake_case columns).
type HomeSlideRow = {
  id: string
  image_url: string
  alt: string
  eyebrow: string
  title: string
  description: string
  primary_label: string
  primary_to: string
  secondary_label: string
  secondary_to: string
  sort_order: number
}

export function createHomeSlide(overrides: Partial<HomeSlide> = {}): HomeSlide {
  return {
    id: crypto.randomUUID(),
    imageUrl: '',
    alt: '',
    eyebrow: '',
    title: '',
    description: '',
    primaryLabel: 'Support Us',
    primaryTo: '/qr-donate',
    secondaryLabel: 'Learn more',
    secondaryTo: '/about',
    ...overrides,
  }
}

// Used the first time the admin screen loads with no saved rows yet, and as
// the public homepage fallback while slides are loading or if none are saved.
export function defaultHomeSlides(): HomeSlide[] {
  return [
    createHomeSlide({
      id: 'education',
      imageUrl: '/images/programs/education-hero.jpg',
      alt: 'Children learning with Santi Sena education support',
      eyebrow: 'Education and Buddhist learning',
      title: 'Helping children learn with confidence.',
      description:
        'Santi Sena supports schools, mobile libraries, scholarships and Buddhist education so children can keep learning close to home.',
      primaryLabel: 'Support education',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Explore programs',
      secondaryTo: '/programs',
    }),
    createHomeSlide({
      id: 'environment',
      imageUrl: '/images/programs/environment.jpg',
      alt: 'Community environmental activity in rural Cambodia',
      eyebrow: 'Environment and climate action',
      title: 'Protecting the land that sustains villages.',
      description:
        'Community forestry, tree nurseries, WASH and climate adaptation help families care for the natural resources around them.',
      primaryLabel: 'Support the work',
      primaryTo: '/qr-donate',
      secondaryLabel: 'Environment program',
      secondaryTo: '/programs/environment',
    }),
    createHomeSlide({
      id: 'livelihood',
      imageUrl: '/images/programs/livelihood-hero2.jpg',
      alt: 'Rural livelihood activity with community members',
      eyebrow: 'Livelihoods and family resilience',
      title: 'Growing practical income and food security.',
      description:
        'Savings groups, home gardens, cooperatives and farmer support help rural families build steadier livelihoods.',
      primaryLabel: 'Get involved',
      primaryTo: '/get-involved',
      secondaryLabel: 'Livelihood program',
      secondaryTo: '/programs/livelihood',
    }),
    createHomeSlide({
      id: 'child-protection',
      imageUrl: '/images/programs/child-protection1.jpg',
      alt: 'Children and community members participating in a protection activity',
      eyebrow: 'Child protection and dignity',
      title: 'Safeguarding children through local action.',
      description:
        'Child rights campaigns, youth peer groups and community networks help children grow in safer, more caring communities.',
      primaryLabel: 'Stand with us',
      primaryTo: '/get-involved',
      secondaryLabel: 'Protection program',
      secondaryTo: '/programs/child-protection',
    }),
  ]
}

function rowToSlide(row: HomeSlideRow): HomeSlide {
  return {
    id: row.id,
    imageUrl: row.image_url,
    alt: row.alt,
    eyebrow: row.eyebrow,
    title: row.title,
    description: row.description,
    primaryLabel: row.primary_label,
    primaryTo: row.primary_to,
    secondaryLabel: row.secondary_label,
    secondaryTo: row.secondary_to,
  }
}

function slideToRow(slide: HomeSlide, sortOrder: number): HomeSlideRow {
  return {
    id: slide.id,
    image_url: slide.imageUrl.trim(),
    alt: slide.alt.trim(),
    eyebrow: slide.eyebrow.trim(),
    title: slide.title.trim(),
    description: slide.description.trim(),
    primary_label: slide.primaryLabel.trim(),
    primary_to: slide.primaryTo.trim(),
    secondary_label: slide.secondaryLabel.trim(),
    secondary_to: slide.secondaryTo.trim(),
    sort_order: sortOrder,
  }
}

export async function fetchHomeSlides(): Promise<HomeSlide[]> {
  const { data, error } = await supabase
    .from('home_slides')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return ((data ?? []) as HomeSlideRow[]).map(rowToSlide)
}

export async function deleteHomeSlide(id: string): Promise<void> {
  const { error } = await supabase.from('home_slides').delete().eq('id', id)
  if (error) throw error
}

export async function saveHomeSlides(slides: HomeSlide[]): Promise<void> {
  const rows = slides.map(slideToRow)

  const { data: existing, error: fetchError } = await supabase.from('home_slides').select('id')
  if (fetchError) throw fetchError

  const keep = new Set(rows.map((row) => row.id))
  const removed = ((existing ?? []) as { id: string }[])
    .map((row) => row.id)
    .filter((id) => !keep.has(id))

  if (removed.length) {
    const { error: deleteError } = await supabase.from('home_slides').delete().in('id', removed)
    if (deleteError) throw deleteError
  }

  if (rows.length) {
    const { error: upsertError } = await supabase.from('home_slides').upsert(
      rows.map((row) => ({ ...row, updated_at: new Date().toISOString() })),
      { onConflict: 'id' },
    )
    if (upsertError) throw upsertError
  }
}
