// Generates a static HTML shell per public route so crawlers see the correct
// title/description/canonical/OG tags on the very first (pre-JS) fetch,
// instead of every route serving the homepage's meta tags.
//
// This does NOT render the Vue app or fetch CMS content — it only clones
// dist/index.html and swaps the <head> meta tags per route. The client JS
// still mounts and hydrates the page normally for real users.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, pageMeta } from '../src/lib/seo-data.ts'

const rootDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const distDir = join(rootDir, 'dist')

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function replaceTag(html, pattern, replacement) {
  if (!pattern.test(html)) {
    throw new Error(`prerender-meta: expected tag not found in template (pattern: ${pattern})`)
  }
  return html.replace(pattern, replacement)
}

function renderForRoute(template, path) {
  const meta = pageMeta[path]
  const title = escapeHtml(meta.title)
  const description = escapeHtml(meta.description)
  const canonicalUrl = `${SITE_URL}${path === '/' ? '' : path}`

  let html = template
  html = replaceTag(html, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
  html = replaceTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/,
    `<meta name="description" content="${description}" />`,
  )
  html = replaceTag(
    html,
    /<link\s+rel="canonical"[\s\S]*?\/>/,
    `<link rel="canonical" href="${canonicalUrl}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:title"[\s\S]*?\/>/,
    `<meta property="og:title" content="${title}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/,
    `<meta property="og:description" content="${description}" />`,
  )
  html = replaceTag(html, /<meta\s+property="og:url"[\s\S]*?\/>/, `<meta property="og:url" content="${canonicalUrl}" />`)
  html = replaceTag(
    html,
    /<meta\s+name="twitter:title"[\s\S]*?\/>/,
    `<meta name="twitter:title" content="${title}" />`,
  )
  html = replaceTag(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/,
    `<meta name="twitter:description" content="${description}" />`,
  )
  return html
}

async function main() {
  const template = await readFile(join(distDir, 'index.html'), 'utf8')
  const routes = Object.keys(pageMeta).filter((path) => path !== '/')

  for (const path of routes) {
    const html = renderForRoute(template, path)
    const outDir = join(distDir, path.replace(/^\//, ''))
    await mkdir(outDir, { recursive: true })
    await writeFile(join(outDir, 'index.html'), html, 'utf8')
  }

  console.log(`prerender-meta: generated ${routes.length} route shells in dist/`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
