// remove-vision-guides.cjs
// Removes the vision-guides section from the about-vision page in Supabase.
// Run with: node remove-vision-guides.cjs
// Prerequisite: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars,
// or run the SQL migration manually in Supabase Dashboard > SQL Editor.

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Please set SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function removeVisionGuides() {
  const { data: pages, error } = await supabase
    .from('pages')
    .select('id, body')
    .eq('slug', 'about-vision')
    .eq('locale', 'en')

  if (error) {
    console.error('Error fetching pages:', error.message)
    process.exit(1)
  }

  for (const page of pages) {
    try {
      const parsed = JSON.parse(page.body)
      if (!parsed.sections) continue

      const filteredSections = parsed.sections.filter(s => s.id !== 'vision-guides')
      parsed.sections = filteredSections

      const { error: updateError } = await supabase
        .from('pages')
        .update({ body: JSON.stringify(parsed) })
        .eq('id', page.id)

      if (updateError) {
        console.error(`Error updating page ${page.id}:`, updateError.message)
      } else {
        console.log(`Removed vision-guides section from page ${page.id}`)
      }
    } catch (e) {
      console.error(`Error processing page ${page.id}:`, e.message)
    }
  }

  console.log('Done.')\n}

removeVisionGuides()