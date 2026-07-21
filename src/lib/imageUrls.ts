const useGoogleDriveImages = import.meta.env.VITE_USE_GOOGLE_DRIVE_IMAGES !== 'false'

const svgDataUrl = (svg: string) => `data:image/svg+xml,${encodeURIComponent(svg)}`
const localFavicon = '/favicon.ico'
const publicGoogleDriveFolderId = import.meta.env.VITE_PUBLIC_GOOGLE_DRIVE_FOLDER_ID || ''

export const googleDriveImageFolderUrl = publicGoogleDriveFolderId
  ? `https://drive.google.com/drive/folders/${encodeURIComponent(publicGoogleDriveFolderId)}`
  : ''

export function googleDriveImageUrl(fileId: string, size = 'w1600') {
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}=${size}`
}

const fallbackPhoto = (label: string, accent = '#0f8f69', secondary = '#d4a017') =>
  svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 1050">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#f8fbf6"/>
          <stop offset="1" stop-color="#e5f0e8"/>
        </linearGradient>
        <linearGradient id="sun" x1="0" x2="1">
          <stop offset="0" stop-color="${secondary}"/>
          <stop offset="1" stop-color="#f0c75c"/>
        </linearGradient>
      </defs>
      <rect width="1600" height="1050" fill="url(#bg)"/>
      <circle cx="1310" cy="210" r="150" fill="url(#sun)" opacity=".55"/>
      <path d="M0 745c210-112 376-148 566-104 116 27 190 82 327 76 195-8 332-129 526-87 72 16 125 48 181 90v330H0z" fill="${accent}" opacity=".18"/>
      <path d="M0 820c176-78 342-95 498-50 157 45 261 134 441 95 189-41 287-149 453-102 76 22 142 64 208 112v175H0z" fill="${accent}" opacity=".42"/>
      <path d="M186 831c82-117 176-172 282-165 112 7 179 83 270 128 129 63 246 25 351-56 99-77 213-96 324-36 68 37 122 94 171 161" fill="none" stroke="#ffffff" stroke-width="20" stroke-linecap="round" opacity=".72"/>
      <g transform="translate(220 230)">
        <rect width="580" height="300" rx="26" fill="#ffffff" opacity=".82"/>
        <path d="M72 210c60-108 158-164 294-168 71-2 130 10 178 32" fill="none" stroke="${accent}" stroke-width="24" stroke-linecap="round"/>
        <path d="M102 246c89-60 179-80 270-61 60 13 108 40 145 81" fill="none" stroke="${secondary}" stroke-width="18" stroke-linecap="round" opacity=".78"/>
        <circle cx="140" cy="92" r="34" fill="${accent}" opacity=".28"/>
        <circle cx="228" cy="112" r="48" fill="${accent}" opacity=".2"/>
        <circle cx="334" cy="88" r="30" fill="${secondary}" opacity=".35"/>
      </g>
      <text x="104" y="944" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="#16302a">${label}</text>
      <text x="106" y="1004" font-family="Arial, sans-serif" font-size="28" font-weight="700" fill="#50645b">Image placeholder until Google Drive is public</text>
    </svg>
  `)

const mapImage = (label: string, markerLeft: number, markerTop: number) =>
  svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 520">
      <rect width="760" height="520" rx="42" fill="#f4fbf4"/>
      <path d="M300 62c62 8 122 38 163 83 38 42 56 92 91 133 31 36 79 60 88 111 8 48-23 92-66 114-50 25-105 5-156 8-56 4-106 33-163 27-62-7-115-47-140-104-22-50-1-104-12-157-11-54-58-101-43-154 17-57 86-70 141-72 33-1 64 7 97 11z" fill="#d9ecdf" stroke="#0f8f69" stroke-width="6"/>
      <path d="M454 145c-14 36-18 80-1 115 18 37 58 55 80 90 22 36 16 78-10 111" fill="none" stroke="#9cc9ac" stroke-width="9" stroke-linecap="round"/>
      <path d="M234 150c68 7 115 43 149 95 37 56 61 121 117 158" fill="none" stroke="#b7d9bf" stroke-width="8" stroke-linecap="round"/>
      <circle cx="${markerLeft}" cy="${markerTop}" r="18" fill="#d4a017" stroke="#fff" stroke-width="8"/>
      <circle cx="${markerLeft}" cy="${markerTop}" r="6" fill="#16302a"/>
      <text x="50%" y="464" text-anchor="middle" font-family="Arial, sans-serif" font-size="34" font-weight="800" fill="#16302a">${label}</text>
    </svg>
  `)

const pinIcon = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
    <path d="M48 8c-18.8 0-34 15.2-34 34 0 25.5 34 46 34 46s34-20.5 34-46C82 23.2 66.8 8 48 8z" fill="#d4a017" stroke="#fff" stroke-width="8"/>
    <circle cx="48" cy="42" r="12" fill="#16302a"/>
  </svg>
`)

const partnerLogo = (label: string, accent = '#0f8f69') =>
  svgDataUrl(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 240">
      <rect width="420" height="240" rx="28" fill="#ffffff"/>
      <rect x="18" y="18" width="384" height="204" rx="24" fill="#f5faf6" stroke="#d8e8dd" stroke-width="4"/>
      <circle cx="92" cy="120" r="44" fill="${accent}" opacity=".16"/>
      <path d="M74 130c18-36 48-36 64 0" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round"/>
      <path d="M90 102l20 20 38-42" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
      <text x="240" y="132" text-anchor="middle" font-family="Arial, sans-serif" font-size="52" font-weight="900" fill="#16302a">${label}</text>
    </svg>
  `)

const acledaLogo = svgDataUrl(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 180">
    <rect width="420" height="180" rx="24" fill="#ffffff"/>
    <rect x="24" y="24" width="372" height="132" rx="20" fill="#103b7a"/>
    <text x="210" y="108" text-anchor="middle" font-family="Arial, sans-serif" font-size="58" font-weight="900" fill="#ffffff">ACLEDA</text>
  </svg>
`)

const driveOrFallback = (fileId: string, fallback: string) =>
  useGoogleDriveImages ? googleDriveImageUrl(fileId) : fallback

const fallbackImages = {
  education: fallbackPhoto('Education', '#0f8f69', '#d4a017'),
  environment: fallbackPhoto('Environment', '#0b7d52', '#d4a017'),
  livelihood: fallbackPhoto('Livelihoods', '#2d7f6f', '#c99018'),
  childProtection: fallbackPhoto('Child protection', '#2f6f62', '#d4a017'),
  village: fallbackPhoto('Village peace', '#0f8f69', '#d4a017'),
}

export const imageUrls = {
  favicon: localFavicon,
  logo: localFavicon,
  donation: {
    acledaLogo: driveOrFallback('1ZshbEMfcy4n7bMBcr2B2gx6dB4tYqvIj', acledaLogo),
  },
  programs: {
    childProtection: driveOrFallback('1nMadwzd7BFV4uDOZILh3ir1rFnLoR92L', fallbackImages.childProtection),
    childProtection1: driveOrFallback('1omb6wmt0nfs_RDkMjF8quBJ9dzSfpO53', fallbackImages.childProtection),
    childProtection2: driveOrFallback('14M_kqxOmAYfkfg3IwVr5ijFE0f-20V0G', fallbackImages.childProtection),
    childProtection3: driveOrFallback('1HmA2ekQZDZppMYB2rbTey3FJLVR7U6U_', fallbackImages.childProtection),
    education: driveOrFallback('1PeWfmnkBPz83fFYNtydsio9LLFgp1HOr', fallbackImages.education),
    educationHero: driveOrFallback('1oLliPMim5_YsBSsstLo7ZdV3id5n5OQG', fallbackImages.education),
    environment: driveOrFallback('1_TlqRYDZBH8rhnPumIRysRO4zTcTzr6r', fallbackImages.environment),
    environmentHero1: driveOrFallback('1TyEkPpMaouSYyYyWMcpmeCWAtBnM5ZtN', fallbackImages.environment),
    hero1: driveOrFallback('1whUvuDT8FTTN9EtYXtMtRFlonML67aJv', fallbackImages.village),
    hero2: driveOrFallback('1QtIOaAYlwHCwO7l7_uuvxwdA_ONIRB98', fallbackImages.village),
    hero3: driveOrFallback('15dMob3OSDw-nxju4VuCIB0BiRHT0P5Od', fallbackImages.education),
    hero4: driveOrFallback('1DMorxbgVk5RLsUyb84gRIKUojkAzwzW7', fallbackImages.environment),
    livelihood: driveOrFallback('1b9AzdY0Mpqe0jfvEWg2WRSyB84_asWSY', fallbackImages.livelihood),
    livelihoodHero1: driveOrFallback('1l5NLDZCjmJcRM8JoSPFyUSHKOG5Z-dJa', fallbackImages.livelihood),
    livelihoodHero2: driveOrFallback('1hzIL6Cr_qXFPPtuIjJe0CLn3ffjl3wIy', fallbackImages.livelihood),
    livelihoodHero3: driveOrFallback('1Hrzqid2Szxv3ivPFsLVaMdjQqQSW9SLx', fallbackImages.livelihood),
    livelihoodHero4: driveOrFallback('1mdldHtTI8rsL0j63z7a1YAWGyp4QThaj', fallbackImages.livelihood),
  },
  home: {
    child: driveOrFallback('1b9AzdY0Mpqe0jfvEWg2WRSyB84_asWSY', fallbackImages.childProtection),
    education: driveOrFallback('1A48ssE-xq_eT1jh4EvJ4xqAaIWz2d7uG', fallbackImages.education),
    environment: driveOrFallback('1MET3GHWBTMWkusil0thU9nmWhjFayxzb', fallbackImages.environment),
    livelihood: driveOrFallback('1DMorxbgVk5RLsUyb84gRIKUojkAzwzW7', fallbackImages.livelihood),
  },
  education: {
    intro: driveOrFallback('1aiC3FEAQNS6IWV5Ohdtk5H79__iQBRJ4', fallbackImages.education),
    reading: driveOrFallback('1HebMqX_egm3EsgYaSEYbg0_gB0lmmm3N', fallbackImages.education),
    study: driveOrFallback('1_altRLSSbZp8SU6S9ngYP8JVvGff6FFL', fallbackImages.education),
    teacher: driveOrFallback('14rjiFllDs3Z_CDeoN9GjTS2fWVJ9y96u', fallbackImages.education),
  },
  impact: {
    hero: driveOrFallback('1ST8oaWgzUUG_FyLpTArGe1_44uusj3t0', fallbackImages.village),
    forest: driveOrFallback('1p5woZaoZ5_HsqAw7nGWQt9UB5FrBXyn8', fallbackImages.environment),
    village: driveOrFallback('1cdGohoZ1L4P75nCgBOB_X9bmJtwBxyxw', fallbackImages.village),
  },
  maps: {
    cambodia: driveOrFallback('1uRmjMjgSUryEA0TtvU3PkpWpubAyd19m', mapImage('Cambodia', 476, 394)),
    cambodiaOffices: driveOrFallback('1Z1M4cwXa3r8T7tEAsdtso3qnOD0XIkku', mapImage('Santi Sena field area', 470, 404)),
    locationIcon: driveOrFallback('1qqImiOGVC_1TDzFOAFxMphuaLjFupRhF', pinIcon),
    preyVeng: driveOrFallback('1aR1QZwhDtINQb-i1p9K72iLqOH0lNGPl', mapImage('Prey Veng Province', 407, 362)),
    svayRieng: driveOrFallback('1dwJc7ia13bNZiJjXoALTgazgFOsnKRuK', mapImage('Svay Rieng Province', 470, 404)),
    timeline1994: driveOrFallback('1gtfK8YY-fXHTX-PLLYJ_KqW5cahN_HVi', fallbackImages.environment),
    timeline1998: driveOrFallback('1j1isQHv7zkvrH0FdIW20-opA0zKiT6O3', fallbackImages.village),
    timeline2003: driveOrFallback('1D5vN0Ai8yLpp-hCYaAYTHB_YUW5w5tOZ', fallbackImages.livelihood),
    timeline2007: driveOrFallback('1G_A5kfMX7nFmgNMiI0HCBXyF_u9k2LqB', fallbackImages.education),
    timeline2011: driveOrFallback('1hg2OwuCGQkrxJM9PNgOM65oRajMztXCr', fallbackImages.environment),
    timeline2014: driveOrFallback('1-5Qbo7LDlOnNlAwG-1KxV7aVgn5UKi46', fallbackImages.village),
    timeline2018: driveOrFallback('18bqG1Z7rIYVf3oilhhlKJfrL7BazVSxc', fallbackImages.education),
    timeline2019: driveOrFallback('1DBocc-nmcTM3hY6Jd1TGa0fDhWJBbBfO', fallbackImages.livelihood),
    timeline2022: driveOrFallback('13faFB89oB5fI-f4Cty0oeGDpLSPhQjnb', fallbackImages.environment),
    timeline2024: driveOrFallback('1iTw2YGL_fzfyP6UNFlrm-xRhJ_kKJudA', fallbackImages.village),
  },
  news: {
    certificate: driveOrFallback('1hX1B6dQBpobmdcqcJ1NYi50jsyXAIpu5', fallbackImages.childProtection),
    preschool: driveOrFallback('13Dc1t4n20sJz82rCno0tkI9YiG2u3vhC', fallbackImages.education),
    student: driveOrFallback('16aBVVPZFAeCLfRk8flYXrYZ-jxVg0zsh', fallbackImages.education),
    wash: driveOrFallback('1Ox0LNIT0ZZ1xprkuwPsKTtXU--DW_KIh', fallbackImages.environment),
    water: driveOrFallback('1KVZgPZ7vq0CgKtBbS-dl8oJBeYdTkBx4', fallbackImages.livelihood),
  },
  partners: {
    undp: driveOrFallback('1Qm2I-1nY3vsbXo3zqvrGGWGZfbY6Rt25', partnerLogo('UNDP', '#2c7be5')),
    adb: driveOrFallback('1L2_lFl8qMAml1Bd81-2A_eJdkGp5aQOM', partnerLogo('ADB', '#1672b9')),
    oxfam: driveOrFallback('1UhwXf-GhNgOr7kBxIOGh3FyNOJ-wRZa7', partnerLogo('OXFAM', '#61a534')),
    breadForTheWorld: driveOrFallback('1R0Xyd39Wswo85i-nF0dCXgkNpD_DZpzE', partnerLogo('BFW', '#c38320')),
    misereor: driveOrFallback('1TNFu8bGrZWu0Oh7TZ6ayIZzpb8vUmZOb', partnerLogo('MIS', '#6b6b6b')),
    europeanUnion: driveOrFallback('1etASkXAiPo1bqObnvQOftFa2Fkoq0zb6', partnerLogo('EU', '#244aa5')),
    usaidWinrock: driveOrFallback('1rEieY3Du6PHdZovSTs6nVrftcev2KXA1', partnerLogo('USAID', '#b31b34')),
    diakonia: driveOrFallback('1vj_V4eKwBM9Gjcui5bQBVzzWAaixROYC', partnerLogo('DIA', '#7a3db8')),
    heinrichBoll: driveOrFallback('1Zs7eihVkT9voNK2EOJrFxX-nFTMS6ivv', partnerLogo('HBS', '#64a70b')),
    caritas: driveOrFallback('1NdehUpufRuQVoIYdFOlRWkgHkZ0QCCYa', partnerLogo('CAR', '#c92a2a')),
  },
  volunteer: {
    buddhistEducation: driveOrFallback('1h8rVFA3DbXADZsk8FNVj_5dPpurJ2v6c', fallbackImages.environment),
    childProtection: driveOrFallback('1QR07Wk2T-LU_s5dSVGHsSrqdhWpePoY4', fallbackImages.childProtection),
    communityForestry: driveOrFallback('1QnosDkLGAXV_x30-6EdUO_Ga24sXDNeA', fallbackImages.environment),
    livelihood: driveOrFallback('1pEIPnll9s5gyKAP6IcVPg6xk5ezZ0TtF', fallbackImages.livelihood),
    mobileLibrary: driveOrFallback('13jVkDXyOQ8pnDp7q7pbQ57cB3EvcRKeG', fallbackImages.education),
    hero: driveOrFallback('15fG5tyBvMNhFLA7Ed4XN9R946Wqadwua', fallbackImages.village),
    washSchool: driveOrFallback('1022x-_ULcvB15hMyTIcyEMhnHNqSa5UC', fallbackImages.education),
  },
} as const

export function normalizeImageUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return ''

  const driveId = getGoogleDriveFileId(trimmed)
  if (driveId) return googleDriveImageUrl(driveId)

  return trimmed
}

export function resolveImageUrl(value: string, fallback = imageUrls.programs.hero1) {
  const normalized = normalizeImageUrl(value)
  if (!normalized) return fallback
  const legacyImageUrl = legacyLocalImageUrl(normalized)
  if (legacyImageUrl) return legacyImageUrl
  if (normalized.startsWith('/images/') || normalized.startsWith('/assets/')) return fallback
  return normalized
}

function legacyLocalImageUrl(value: string) {
  const path = value.split('?')[0]?.replace(/\\/g, '/').toLowerCase() ?? ''

  if (path.endsWith('/images/programs/education-hero.jpg')) {
    return imageUrls.programs.educationHero
  }

  if (path.endsWith('/images/programs/environment.jpg')) {
    return imageUrls.programs.environment
  }

  if (path.endsWith('/images/programs/livelihood-hero2.jpg')) {
    return imageUrls.programs.livelihoodHero2
  }

  if (path.endsWith('/images/programs/child-protection1.jpg')) {
    return imageUrls.programs.childProtection1
  }

  return ''
}

function getGoogleDriveFileId(value: string) {
  try {
    const url = new URL(value)

    if (url.hostname === 'lh3.googleusercontent.com') {
      return url.pathname.split('/').filter(Boolean).at(-1)?.split('=')[0] ?? ''
    }

    if (url.hostname.endsWith('drive.google.com')) {
      return url.searchParams.get('id') ?? url.pathname.match(/\/d\/([^/]+)/)?.[1] ?? ''
    }
  } catch {
    return ''
  }

  return ''
}
