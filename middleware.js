import { next } from '@vercel/edge'

// Search engine / social-preview crawlers that should get a fully
// server-rendered snapshot instead of the raw SPA shell.
const BOT_USER_AGENTS = [
  'googlebot',
  'bingbot',
  'yandex',
  'yandexbot',
  'baiduspider',
  'duckduckbot',
  'ia_archiver',
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'telegrambot',
  'discordbot',
  'whatsapp',
  'redditbot',
  'applebot',
  'pinterest',
  'embedly',
  'quora link preview',
  'outbrain',
  'vkshare',
  'skypeuripreview',
  'flipboard',
  'tumblr',
  'bitlybot',
  'w3c_validator',
]

function isBotRequest(userAgent) {
  const ua = userAgent.toLowerCase()
  return BOT_USER_AGENTS.some((bot) => ua.includes(bot))
}

export default async function middleware(request) {
  const url = new URL(request.url)

  // Never intercept admin, API, or static asset requests.
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api/') ||
    /\.[a-zA-Z0-9]+$/.test(url.pathname)
  ) {
    return next()
  }

  const userAgent = request.headers.get('user-agent') || ''
  if (!isBotRequest(userAgent)) {
    return next()
  }

  const token = process.env.PRERENDER_TOKEN
  if (!token) {
    // Not configured yet — fail open to normal routing rather than error.
    return next({
      headers: { 'x-middleware-debug': 'bot-detected-no-token' },
    })
  }

  const targetUrl = `https://service.prerender.io/${url.toString()}`

  try {
    const prerenderResponse = await fetch(targetUrl, {
      headers: {
        'X-Prerender-Token': token,
        'User-Agent': userAgent,
      },
    })

    return new Response(prerenderResponse.body, {
      status: prerenderResponse.status,
      headers: prerenderResponse.headers,
    })
  } catch {
    // If Prerender.io is unreachable, fall back to normal routing rather
    // than showing bots an error page.
    return next({
      headers: { 'x-middleware-debug': 'prerender-fetch-failed' },
    })
  }
}

export const config = {
  matcher: ['/((?!api/|admin).*)'],
}
