<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { useScrollReveal } from '@/composables/useScrollReveal'
import { imageUrls } from '@/lib/imageUrls'

const cambodiaMap = imageUrls.maps.cambodiaOffices
const locationIcon = imageUrls.maps.locationIcon
const preyVengMap = imageUrls.maps.preyVeng
const svayRiengMap = imageUrls.maps.svayRieng
const logoUrl = imageUrls.logo
const headquartersPhoto = imageUrls.programs.hero1
const visitBackground = `url(${imageUrls.programs.hero4})`

const headquarters = {
  name: 'Our headquarters in Svay Rieng',
  address: 'Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia',
  email: 'info@santisena.org',
  phone: '+855 (0) 12 345 678',
  hours: 'Monday - Friday, 8:00 - 17:00',
}

const offices = [
  {
    id: 'all',
    tab: 'Cambodia',
    title: 'Santi Sena offices in Cambodia',
    type: 'All provinces',
    provinceName: 'Cambodia',
    address: 'Head office in Svay Rieng with field office support in Prey Veng',
    phone: '+855 (0) 12 345 678',
    email: 'info@santisena.org',
    contact: 'Select a province above to view that province map and office details.',
    mapLabel: 'Cambodia offices',
    mapImage: cambodiaMap,
    pinLeft: '62%',
    pinTop: '54%',
  },
  {
    id: 'head-office',
    tab: 'Svay Rieng',
    title: 'Svay Rieng Head Office',
    type: 'Head office',
    provinceName: 'Svay Rieng Province',
    address: 'Svay Rieng Town, Svay Rieng Province, Kingdom of Cambodia',
    phone: '+855 (0) 12 345 678',
    email: 'info@santisena.org',
    contact: 'General coordination, donors, partners and project visits',
    mapLabel: 'Santi Sena Head Office',
    mapImage: svayRiengMap,
    pinLeft: '61.8%',
    pinTop: '81.4%',
    countryPinLeft: '61.8%',
    countryPinTop: '81.4%',
  },
  {
    id: 'prey-veng-office',
    tab: 'Prey Veng',
    title: 'Prey Veng Field Office',
    type: 'Field office',
    provinceName: 'Prey Veng Province',
    address: 'Prey Veng Town, Prey Veng Province, Cambodia',
    phone: '+855 (0) 12 111 222',
    email: 'preyveng@santisena.org',
    contact: 'Environment, livelihood and education program coordination',
    mapLabel: 'Prey Veng Field Office',
    mapImage: preyVengMap,
    pinLeft: '53.5%',
    pinTop: '72.4%',
    countryPinLeft: '53.5%',
    countryPinTop: '72.4%',
  },
] as const

const visitNotes = [
  'Field staff are often in villages, so email replies may take 24-48 hours.',
  'Donors, partners and researchers are welcome by appointment.',
  'Village visits should be arranged through the head office two weeks in advance.',
]

const contactMethods = [
  {
    id: 'email',
    tab: 'Email',
    type: 'Contact form',
    heading: 'Email to Us',
    fieldLabel: 'Email',
    inputType: 'email',
    autocomplete: 'email',
    placeholder: 'name@example.com',
    buttonLabel: 'Send message',
    sentLabel: 'Message ready',
    status: 'Thank you. Your message is ready for our team.',
  },
  {
    id: 'telegram',
    tab: 'Telegram',
    type: 'Quick chat',
    heading: 'Telegram to Us',
    fieldLabel: 'Telegram',
    inputType: 'text',
    autocomplete: 'off',
    placeholder: '@yourtelegram',
    buttonLabel: 'Send via Telegram',
    sentLabel: 'Telegram ready',
    status: 'Thank you. Your Telegram contact is ready for our team.',
  },
] as const

const telegramContact = {
  qrImage: '/images/contact/telegram-qr.jpg',
  url: 'https://t.me/sannta_close',
}

const name = ref('')
const contactDetail = ref('')
const subject = ref('')
const message = ref('')
const formSent = ref(false)
const contactFormBarsVisible = ref(false)
const contactFormMotionActive = ref(false)
const messageMaxLength = 600
let contactFormMotionFrame: number | undefined
let contactFormMotionTimer: number | undefined

const activeOfficeId = ref<(typeof offices)[number]['id']>('all')
const activeContactMethodId = ref<(typeof contactMethods)[number]['id']>('email')
const activeOffice = computed(
  () => offices.find((office) => office.id === activeOfficeId.value) ?? offices[0],
)
const activeContactMethod = computed(
  () =>
    contactMethods.find((contactMethod) => contactMethod.id === activeContactMethodId.value) ??
    contactMethods[0],
)
const isTelegramMethod = computed(() => activeContactMethodId.value === 'telegram')
const mapOfficeHotspots = computed(() =>
  offices.filter(
    (office): office is Extract<(typeof offices)[number], { countryPinLeft: string }> =>
      'countryPinLeft' in office && 'countryPinTop' in office,
  ),
)
const canSubmit = computed(() =>
  !isTelegramMethod.value &&
  Boolean(name.value.trim() && contactDetail.value.trim() && message.value.trim()),
)

useScrollReveal()

function selectOffice(officeId: (typeof offices)[number]['id']) {
  activeOfficeId.value = officeId
}

function selectContactMethod(contactMethodId: (typeof contactMethods)[number]['id']) {
  if (activeContactMethodId.value === contactMethodId) return

  activeContactMethodId.value = contactMethodId
  contactDetail.value = ''
  formSent.value = false
  triggerContactFormMotion()
}

function triggerContactFormMotion() {
  contactFormBarsVisible.value = true

  if (contactFormMotionFrame !== undefined) {
    window.cancelAnimationFrame(contactFormMotionFrame)
  }
  if (contactFormMotionTimer !== undefined) {
    window.clearTimeout(contactFormMotionTimer)
  }

  contactFormMotionActive.value = false

  contactFormMotionFrame = window.requestAnimationFrame(() => {
    contactFormMotionFrame = window.requestAnimationFrame(() => {
      contactFormMotionActive.value = true
      contactFormMotionFrame = undefined
      contactFormMotionTimer = window.setTimeout(() => {
        contactFormMotionActive.value = false
        contactFormMotionTimer = undefined
      }, 720)
    })
  })
}

function submitContact() {
  if (!canSubmit.value) return
  formSent.value = true
}

onMounted(() => {
  document.title = 'Contact Santi Sena'
})

onUnmounted(() => {
  if (contactFormMotionFrame !== undefined) {
    window.cancelAnimationFrame(contactFormMotionFrame)
  }
  if (contactFormMotionTimer !== undefined) {
    window.clearTimeout(contactFormMotionTimer)
  }
})
</script>

<template>
  <main class="contact-page">
    <section id="head-office" class="headquarters-section" aria-labelledby="headquarters-heading">
      <div class="section-intro reveal">
        <p class="section-kicker">Contact us</p>
        <h2 id="headquarters-heading">Our headquarters in Cambodia</h2>
        <p>
          Our Svay Rieng headquarters is the main contact point for partnerships, donor
          coordination, visits and support for village programs across Cambodia.
        </p>
      </div>

      <div class="headquarters-layout">
        <figure class="headquarters-photo reveal" style="animation-delay: 0.1s">
          <img :src="headquartersPhoto" alt="Santi Sena team meeting in Cambodia" />
        </figure>

        <article class="headquarters-details reveal" style="animation-delay: 0.22s">
          <p class="office-type">Head office</p>
          <h3>{{ headquarters.name }}</h3>
          <dl class="details-list">
            <div>
              <dt>Address</dt>
              <dd>{{ headquarters.address }}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>
                <a :href="`mailto:${headquarters.email}`">{{ headquarters.email }}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>
                <a :href="`tel:${headquarters.phone.replace(/[^+\d]/g, '')}`">
                  {{ headquarters.phone }}
                </a>
              </dd>
            </div>
            <div>
              <dt>Office hours</dt>
              <dd>{{ headquarters.hours }}</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>

    <section id="field-offices" class="centers-section" aria-labelledby="centers-heading">
      <div class="section-intro reveal">
        <p class="section-kicker">Contact us</p>
        <h2 id="centers-heading">Our offices across Cambodia</h2>
        <p>
          Santi Sena works from the head office and a provincial field office. Choose an office
          below to see the best contact details for your visit or message.
        </p>
      </div>

      <div class="office-tabs reveal" role="tablist" aria-label="Santi Sena offices">
        <button
          v-for="office in offices"
          :id="`${office.id}-tab`"
          :key="office.id"
          type="button"
          role="tab"
          :aria-controls="`${office.id}-panel`"
          :aria-selected="activeOfficeId === office.id"
          class="office-tab"
          :class="{ 'office-tab--active': activeOfficeId === office.id }"
          @click="selectOffice(office.id)"
        >
          <span class="office-tab__label">{{ office.tab }}</span>
          <span class="office-tab__meta">{{ office.type }}</span>
        </button>
      </div>

      <article
        :id="`${activeOffice.id}-panel`"
        class="office-map reveal"
        role="tabpanel"
        :aria-labelledby="`${activeOffice.id}-tab`"
        :style="{ '--pin-left': activeOffice.pinLeft, '--pin-top': activeOffice.pinTop }"
      >
        <p class="province-badge">{{ activeOffice.provinceName }}</p>

        <div class="map-illustration">
          <Transition name="map-slide" mode="out-in">
            <div
              :key="activeOffice.id"
              class="map-frame"
              :class="{ 'map-frame--interactive': activeOffice.id === 'all' }"
            >
              <div class="map-image-shell">
                <img class="contact-map-image" :src="activeOffice.mapImage" alt="" />
                <img
                  v-if="activeOffice.id !== 'all'"
                  class="map-location-pin"
                  :src="locationIcon"
                  :alt="activeOffice.mapLabel"
                  :style="{ left: activeOffice.pinLeft, top: activeOffice.pinTop }"
                />
                <div v-if="activeOffice.id === 'all'" class="map-hotspots">
                  <button
                    v-for="office in mapOfficeHotspots"
                    :key="office.id"
                    type="button"
                    class="map-hotspot"
                    :style="{ left: office.countryPinLeft, top: office.countryPinTop }"
                    :aria-label="`View ${office.tab} office details`"
                    @click.stop="selectOffice(office.id)"
                  >
                    <img class="map-hotspot__icon" :src="locationIcon" alt="" aria-hidden="true" />
                    <span class="map-hotspot__label">{{ office.tab }}</span>
                  </button>
                </div>
              </div>
            </div>
          </Transition>
          <template v-if="false">
            <svg
              v-if="activeOffice.id === 'all'"
              class="contact-map contact-map--country"
              viewBox="0 0 760 520"
            >
              <path
                class="water-shape"
                d="M58 330 L95 346 L106 398 L148 452 L82 494 L34 470 L28 386 Z"
              />
              <g class="country-regions">
                <path
                  class="region region--mint"
                  d="M122 104 L198 76 L294 96 L286 166 L214 184 L136 164 Z"
                />
                <path
                  class="region region--pink"
                  d="M214 184 L286 166 L344 206 L314 282 L238 274 L188 224 Z"
                />
                <path
                  class="region region--yellow"
                  d="M136 164 L214 184 L188 224 L202 298 L122 306 L76 252 L86 186 Z"
                />
                <path
                  class="region region--mint"
                  d="M294 96 L398 72 L492 98 L474 178 L392 198 L344 206 L286 166 Z"
                />
                <path
                  class="region region--orange"
                  d="M492 98 L602 62 L704 104 L690 190 L604 208 L474 178 Z"
                />
                <path
                  class="region region--lavender"
                  d="M474 178 L604 208 L584 308 L486 324 L392 198 Z"
                />
                <path
                  class="region region--yellow"
                  d="M604 208 L704 190 L724 292 L642 354 L584 308 Z"
                />
                <path
                  class="region region--pink"
                  d="M122 306 L202 298 L238 274 L300 324 L274 396 L176 420 L106 398 Z"
                />
                <path
                  class="region region--yellow"
                  d="M300 324 L376 292 L454 322 L424 402 L336 420 L274 396 Z"
                />
                <path
                  class="region region--orange"
                  d="M454 322 L486 324 L584 308 L642 354 L594 426 L500 424 L424 402 Z"
                />
                <path
                  class="region region--mint"
                  d="M336 420 L424 402 L500 424 L482 488 L380 492 L308 462 Z"
                />
                <path
                  class="region region--pink"
                  d="M500 424 L594 426 L650 470 L586 506 L482 488 Z"
                />
              </g>
              <path
                class="river-line"
                d="M522 92 C498 148 544 174 520 226 C494 278 540 316 500 376 C474 416 488 456 462 492"
              />
              <g class="province-labels">
                <text x="176" y="132">Banteay Mean Chey</text>
                <text x="245" y="222">Siem Reap</text>
                <text x="382" y="144">Preah Vihear</text>
                <text x="556" y="148">Stung Treng</text>
                <text x="642" y="154">Ratanak Kiri</text>
                <text x="132" y="238">Battambang</text>
                <text x="250" y="336">Kampong Chhnang</text>
                <text x="378" y="284">Kampong Thom</text>
                <text x="614" y="286">Mondol Kiri</text>
                <text x="158" y="376">Koh Kong</text>
                <text x="334" y="374">Kampong Speu</text>
                <text x="432" y="378">Phnom Penh</text>
                <text x="514" y="374">Kampong Cham</text>
                <text x="498" y="434">Prey Veng</text>
                <text x="580" y="466">Svay Rieng</text>
                <text x="390" y="458">Takeo</text>
                <text x="314" y="482">Kampot</text>
              </g>
              <g class="office-points">
                <circle cx="585" cy="448" r="5" />
                <text x="598" y="452">Svay Rieng</text>
                <circle cx="520" cy="412" r="5" />
                <text x="532" y="416">Prey Veng</text>
              </g>
            </svg>

            <svg
              v-else-if="activeOffice.id === 'head-office'"
              class="contact-map contact-map--province"
              viewBox="0 0 520 420"
            >
              <g class="province-regions">
                <path
                  class="region region--mint"
                  d="M212 22 L318 40 L338 124 L286 182 L204 166 L182 82 Z"
                />
                <path
                  class="region region--yellow"
                  d="M134 170 L204 166 L234 230 L194 306 L108 288 L86 218 Z"
                />
                <path
                  class="region region--pink"
                  d="M234 176 L338 124 L408 170 L386 254 L278 256 L234 230 Z"
                />
                <path
                  class="region region--lavender"
                  d="M278 256 L386 254 L458 302 L420 386 L306 360 Z"
                />
                <path
                  class="region region--mint"
                  d="M194 306 L278 256 L306 360 L238 400 L164 356 Z"
                />
                <path
                  class="region region--yellow"
                  d="M204 166 L234 176 L234 230 L194 306 L164 260 Z"
                />
              </g>
              <g class="province-labels">
                <text x="224" y="106">Romeas Haek</text>
                <text x="126" y="230">Svay Chrum</text>
                <text x="254" y="218">Rumdoul</text>
                <text class="province-title" x="238" y="266">Svay Rieng</text>
                <text x="326" y="294">Svay Teab</text>
                <text x="322" y="354">Kampong Rou</text>
                <text x="392" y="330">Chantrea</text>
              </g>
              <g class="district-dots">
                <circle cx="252" cy="250" r="4" />
                <circle cx="174" cy="236" r="4" />
                <circle cx="282" cy="198" r="4" />
                <circle cx="334" cy="270" r="4" />
                <circle cx="352" cy="344" r="4" />
                <circle cx="404" cy="322" r="4" />
              </g>
            </svg>

            <svg
              v-else-if="activeOffice.id === 'prey-veng-office'"
              class="contact-map contact-map--province"
              viewBox="0 0 520 420"
            >
              <g class="province-regions">
                <path
                  class="region region--yellow"
                  d="M150 42 L252 26 L298 82 L260 142 L168 138 L112 94 Z"
                />
                <path
                  class="region region--mint"
                  d="M298 82 L406 68 L454 126 L398 188 L308 168 L260 142 Z"
                />
                <path
                  class="region region--pink"
                  d="M168 138 L260 142 L250 218 L168 238 L110 192 Z"
                />
                <path
                  class="region region--lavender"
                  d="M250 142 L308 168 L318 244 L244 268 L250 218 Z"
                />
                <path
                  class="region region--yellow"
                  d="M318 168 L398 188 L434 270 L350 292 L318 244 Z"
                />
                <path
                  class="region region--mint"
                  d="M168 238 L244 268 L226 340 L144 354 L98 286 Z"
                />
                <path
                  class="region region--pink"
                  d="M244 268 L350 292 L318 386 L220 378 L226 340 Z"
                />
                <path
                  class="region region--yellow"
                  d="M350 292 L434 270 L450 356 L368 400 L318 386 Z"
                />
              </g>
              <g class="province-labels">
                <text x="154" y="92">Pea Reang</text>
                <text x="314" y="120">Kanhchriech</text>
                <text x="140" y="190">Kampong Leav</text>
                <text class="province-title" x="228" y="224">Prey Veng</text>
                <text x="340" y="224">Kamchay Mear</text>
                <text x="160" y="306">Ba Phnom</text>
                <text x="244" y="334">Preah Sdach</text>
                <text x="346" y="344">Kampong Trabaek</text>
              </g>
              <g class="district-dots">
                <circle cx="204" cy="108" r="4" />
                <circle cx="328" cy="106" r="4" />
                <circle cx="184" cy="202" r="4" />
                <circle cx="256" cy="210" r="4" />
                <circle cx="360" cy="204" r="4" />
                <circle cx="194" cy="292" r="4" />
                <circle cx="278" cy="324" r="4" />
                <circle cx="374" cy="330" r="4" />
              </g>
            </svg>
          </template>
        </div>

        <Transition name="office-card" mode="out-in">
          <div :key="activeOffice.id" class="office-panel">
            <div class="office-panel__header">
              <div>
                <p class="section-kicker">Contact us</p>
                <h3>{{ activeOffice.title }}</h3>
              </div>
              <p class="office-panel__badge">{{ activeOffice.type }}</p>
            </div>

            <dl class="details-list details-list--compact">
              <div>
                <dt>Address</dt>
                <dd>{{ activeOffice.address }}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a :href="`tel:${activeOffice.phone.replace(/[^+\d]/g, '')}`">
                    {{ activeOffice.phone }}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a :href="`mailto:${activeOffice.email}`">{{ activeOffice.email }}</a>
                </dd>
              </div>
              <div>
                <dt>Contact</dt>
                <dd>{{ activeOffice.contact }}</dd>
              </div>
            </dl>

            <div class="office-actions">
              <a class="email-button email-button--primary" :href="`mailto:${activeOffice.email}`">
                Email us
              </a>
              <a class="email-button" :href="`tel:${activeOffice.phone.replace(/[^+\d]/g, '')}`">
                Call office
              </a>
            </div>
          </div>
        </Transition>
      </article>
    </section>

    <section id="write" class="contact-form-section reveal" aria-labelledby="form-heading">
      <div
        class="contact-method-section reveal"
        style="animation-delay: 0.04s"
        aria-label="Choose how to contact us"
      >
        <div class="contact-method-tabs" role="radiogroup" aria-label="Contact method">
          <button
            v-for="contactMethod in contactMethods"
            :key="contactMethod.id"
            type="button"
            role="radio"
            :aria-checked="activeContactMethodId === contactMethod.id"
            class="contact-method-tab"
            :class="{ 'contact-method-tab--active': activeContactMethodId === contactMethod.id }"
            @click="selectContactMethod(contactMethod.id)"
          >
            <span class="contact-method-tab__label">{{ contactMethod.tab }}</span>
            <span class="contact-method-tab__meta">{{ contactMethod.type }}</span>
          </button>
        </div>
      </div>

      <div class="contact-form-intro reveal" style="animation-delay: 0.12s">
        <p class="section-kicker">Write to us</p>
        <h2 id="form-heading">Send a message to our team</h2>
        <p>
          Share your question, visit request, or partnership idea and our team will follow up from
          the right office.
        </p>
        <figure class="contact-logo-visual" aria-label="Santi Sena seal">
          <img class="contact-logo" :src="logoUrl" alt="Santi Sena seal" loading="lazy" />
        </figure>
      </div>

      <form
        class="contact-form"
        :class="{
          'contact-form--bars-visible': contactFormBarsVisible,
          'contact-form--method-motion': contactFormMotionActive,
        }"
        style="animation-delay: 0.2s"
        @submit.prevent="submitContact"
      >
        <p class="form-kicker">Contact form</p>
        <p class="form-heading">{{ activeContactMethod.heading }}</p>

        <div v-if="isTelegramMethod" class="telegram-contact-panel">
          <figure class="telegram-qr-figure">
            <img
              class="telegram-qr-image"
              :src="telegramContact.qrImage"
              alt="Telegram QR code for Santi Sena"
              loading="lazy"
            />
          </figure>
          <a
            class="form-submit telegram-open-button"
            :href="telegramContact.url"
            target="_blank"
            rel="noopener"
          >
            Open Telegram
          </a>
        </div>

        <template v-else>
          <div class="form-row">
            <label class="form-field">
              <span class="field-topline">
                <span class="field-label">Name</span>
                <span class="field-required">Required</span>
              </span>
              <span class="field-control">
                <input
                  v-model="name"
                  required
                  autocomplete="name"
                  type="text"
                  placeholder="Your full name"
                />
              </span>
            </label>

            <label class="form-field">
              <span class="field-topline">
                <span class="field-label">{{ activeContactMethod.fieldLabel }}</span>
                <span class="field-required">Required</span>
              </span>
              <span class="field-control">
                <input
                  :key="activeContactMethod.id"
                  v-model="contactDetail"
                  required
                  :autocomplete="activeContactMethod.autocomplete"
                  :type="activeContactMethod.inputType"
                  :placeholder="activeContactMethod.placeholder"
                />
              </span>
            </label>
          </div>

          <label class="form-field">
            <span class="field-topline">
              <span class="field-label">Subject</span>
              <span class="field-optional">Optional</span>
            </span>
            <span class="field-control">
              <input
                v-model="subject"
                autocomplete="off"
                type="text"
                placeholder="What would you like to discuss?"
              />
            </span>
          </label>

          <label class="form-field form-field--message">
            <span class="field-topline">
              <span class="field-label">Message</span>
              <span class="field-count">{{ message.length }}/{{ messageMaxLength }}</span>
            </span>
            <span class="field-control">
              <textarea
                v-model="message"
                required
                rows="5"
                :maxlength="messageMaxLength"
                placeholder="Share a few details so the right team can reply."
              ></textarea>
            </span>
          </label>

          <div class="form-actions">
            <button type="submit" class="form-submit" :disabled="!canSubmit">
              {{ formSent ? activeContactMethod.sentLabel : activeContactMethod.buttonLabel }}
            </button>
            <p v-if="formSent" class="form-status" role="status">
              {{ activeContactMethod.status }}
            </p>
          </div>
        </template>
      </form>
    </section>

    <section
      class="visit-section reveal"
      :style="{ '--visit-background': visitBackground }"
      aria-labelledby="write-heading"
    >
      <div class="reveal" style="animation-delay: 0.06s">
        <p class="section-kicker section-kicker--light">Write to us</p>
        <h2 id="write-heading">A little coordination helps us welcome you well.</h2>
      </div>

      <ul class="visit-notes reveal" style="animation-delay: 0.16s">
        <li v-for="note in visitNotes" :key="note">{{ note }}</li>
      </ul>

      <div class="visit-actions reveal" style="animation-delay: 0.26s">
        <a class="visit-button visit-button--primary" href="mailto:info@santisena.org">Email us</a>
        <RouterLink class="visit-button visit-button--ghost" to="/get-involved/partner">
          Partnership
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.reveal {
  opacity: 0;
}

.reveal--visible {
  opacity: 1;
  animation: revealUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) backwards;
}

@keyframes revealUp {
  from {
    opacity: 0;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.section-kicker,
.office-type {
  display: inline-block;
  margin: 0;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.section-kicker--light {
  color: var(--primary-light);
}

.visit-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.email-button,
.visit-button {
  display: inline-flex;
  min-height: 52px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.email-button:hover,
.visit-button:hover {
  transform: translateY(-1px);
}

.headquarters-section,
.centers-section {
  width: min(100%, var(--container-max-width));
  margin: 0 auto;
  padding: clamp(4rem, 8vw, 6.5rem) var(--container-padding);
}

.headquarters-section {
  background: var(--color-cream);
}

.section-intro {
  max-width: 860px;
  margin: 0 auto clamp(3rem, 6vw, 5.5rem);
  text-align: center;
}

.section-intro h2 {
  margin: 0.75rem 0 1rem;
  color: var(--color-ink);
  font-size: clamp(2rem, 4.5vw, 3.4rem);
  line-height: 1.08;
}

.section-intro p:last-child {
  margin: 0 auto;
  max-width: 760px;
  color: var(--color-ink-soft);
  font-size: 1rem;
  line-height: 1.7;
}

.headquarters-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.14fr) minmax(320px, 0.86fr);
  gap: clamp(2rem, 6vw, 4.5rem);
  align-items: center;
}

.headquarters-photo {
  position: relative;
  min-height: 420px;
  overflow: hidden;
  border-radius: 8px;
  background: var(--primary-dark);
  box-shadow: 0 24px 60px rgba(43, 43, 40, 0.14);
}

.headquarters-photo::after {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(20, 129, 62, 0.18), rgba(252, 246, 233, 0));
  content: '';
}

.headquarters-photo img {
  width: 100%;
  height: 100%;
  min-height: inherit;
  object-fit: cover;
}

.headquarters-details h3,
.office-panel h3 {
  margin: 0.45rem 0 1.5rem;
  color: var(--color-ink);
  font-size: clamp(1.55rem, 3vw, 2.15rem);
  line-height: 1.18;
}

.details-list {
  display: grid;
  gap: 1.35rem;
  margin: 0;
}

.details-list--compact {
  gap: 1.05rem;
}

.details-list div {
  display: grid;
  gap: 0.3rem;
}

.details-list dt {
  color: var(--color-ink);
  font-size: 0.98rem;
  font-weight: 700;
}

.details-list dd {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 1rem;
  line-height: 1.55;
}

.details-list a {
  color: var(--primary-dark);
  font-weight: 600;
  text-decoration: none;
}

.details-list a:hover {
  color: var(--primary-color);
  text-decoration: underline;
}

.centers-section {
  width: min(100%, var(--container-max-width));
  padding-top: clamp(2rem, 4vw, 3.25rem);
  padding-bottom: clamp(3rem, 5vw, 4.25rem);
}

.office-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.55rem;
  position: relative;
  z-index: 2;
  padding: 0.55rem;
  border: 1px solid rgba(232, 228, 223, 0.95);
  border-radius: 8px 8px 0 0;
  background: var(--color-white);
  box-shadow: 0 12px 30px rgba(43, 43, 40, 0.06);
}

.office-tab {
  position: relative;
  display: grid;
  min-height: 58px;
  align-content: center;
  gap: 0.08rem;
  padding: 0.5rem 1rem 0.78rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
  font-size: 0.96rem;
  font-weight: 700;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.office-tab::after {
  position: absolute;
  right: 1rem;
  bottom: 0.45rem;
  left: 1rem;
  height: 3px;
  border-radius: 999px;
  background: var(--primary-color);
  opacity: 0;
  content: '';
}

.office-tab__label,
.office-tab__meta {
  position: relative;
  z-index: 1;
}

.office-tab__meta {
  color: var(--color-ink-soft);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.office-tab:hover,
.office-tab--active {
  color: var(--primary-dark);
}

.office-tab:hover {
  background: rgba(230, 246, 236, 0.74);
}

.office-tab--active {
  z-index: 1;
  border-color: rgba(20, 129, 62, 0.28);
  background: linear-gradient(180deg, rgba(230, 246, 236, 0.98), rgba(255, 250, 242, 0.94));
  box-shadow:
    0 12px 26px rgba(20, 129, 62, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.office-tab--active .office-tab__label,
.office-tab--active .office-tab__meta {
  color: var(--primary-dark);
}

.office-tab--active::after {
  opacity: 1;
}

.office-map {
  --pin-left: 64%;
  --pin-top: 55%;

  position: relative;
  display: grid;
  grid-template-columns: minmax(300px, 0.86fr) minmax(0, 1.14fr);
  gap: clamp(1rem, 3vw, 2rem);
  align-items: center;
  min-height: 470px;
  overflow: hidden;
  padding: clamp(1rem, 2.6vw, 1.6rem);
  border: 1px solid rgba(232, 228, 223, 0.82);
  border-top: 0;
  border-radius: 0 0 8px 8px;
  background: var(--color-white);
  box-shadow: 0 18px 42px rgba(43, 43, 40, 0.08);
}

.province-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 4;
  margin: 0;
  padding: 0.4rem 0.72rem;
  border: 1px solid rgba(20, 129, 62, 0.16);
  border-radius: 999px;
  background: var(--color-white);
  color: var(--primary-dark);
  font-size: 0.78rem;
  font-weight: 700;
  box-shadow: 0 8px 20px rgba(43, 43, 40, 0.06);
}

.map-illustration {
  position: relative;
  z-index: 1;
  display: flex;
  grid-column: 2;
  grid-row: 1;
  align-items: center;
  justify-content: center;
  min-height: 390px;
}

.map-frame {
  position: relative;
  display: flex;
  width: 100%;
  height: min(390px, 48vw);
  min-height: 330px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1rem;
  border: 0;
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: none;
}

.map-frame--interactive {
  cursor: pointer;
}

.map-image-shell {
  position: relative;
  width: min(100%, 440px);
  aspect-ratio: 1448 / 1086;
}

  .map-slide-enter-active,
  .map-slide-leave-active {
    transition:
      opacity 0.32s ease,
      transform 0.32s ease;
  }

.map-slide-enter-from {
  opacity: 0;
  transform: translateX(44px);
}

.map-slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.contact-map-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  filter: none;
}

.map-location-pin {
  position: absolute;
  z-index: 3;
  width: clamp(20px, 3.5vw, 20px);
  height: auto;
  filter: drop-shadow(0 7px 11px rgba(20, 129, 62, 0.24));
  transform: translate(30%, -50%);
  pointer-events: none;
}

.map-hotspots {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.map-hotspot {
  position: absolute;
  display: grid;
  width: 25px;
  height: 25px;
  place-items: start end;
  border: 0;
  border-radius: 8px;
  background: transparent;
  cursor: pointer;
  padding: 0;
  transform: translate(-30%, -100%);
  pointer-events: auto;
}

.map-hotspot::after {
  position: absolute;
  border-radius: 999px;
  content: '';
}


.map-hotspot__icon {
  position: relative;
  z-index: 2;
  display: block;
  width: 20px;
  height: auto;
  filter: drop-shadow(0 9px 9px rgba(20, 129, 62, 0.26));
  transition:
    filter 0.2s ease,
    transform 0.2s ease;
}

.map-hotspot:hover .map-hotspot__icon,
.map-hotspot:focus-visible .map-hotspot__icon {
  filter: drop-shadow(0 8px 12px rgba(20, 129, 62, 0.34));
  transform: translateY(-2px);
}

.map-hotspot:focus-visible {
  outline: 3px solid rgba(20, 129, 62, 0.28);
  outline-offset: 40px;
}

.map-hotspot__label {
  position: absolute;
  bottom: calc(100% - 0.15rem);
  left: 50%;
  z-index: 4;
  min-width: max-content;
  padding: 0.28rem 0.48rem;
  border-radius: 6px;
  background: var(--primary-dark);
  color: var(--color-white);
  font-size: 0.72rem;
  font-weight: 800;
  opacity: 0;
  transform: translate(-10%, 6px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  pointer-events: none;
}

.map-hotspot:hover .map-hotspot__label,
.map-hotspot:focus-visible .map-hotspot__label {
  opacity: 1;
  transform: translate(0%, 0);
}

@keyframes mapHotspotPulse {
  0% {
    opacity: 0.8;
    transform: translate(-50%, -50%) scale(0.72);
  }
  70%,
  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(1.28);
  }
}

.contact-map {
  width: min(100%, 620px);
  height: 100%;
  max-height: 410px;
  filter: drop-shadow(0 18px 32px rgba(43, 43, 40, 0.08));
}

.contact-map--province {
  width: min(100%, 480px);
  max-height: 390px;
}

.water-shape {
  fill: #22d0de;
  opacity: 0.9;
}

.region {
  stroke: #101511;
  stroke-width: 2.2;
  stroke-linejoin: round;
}

.region--mint {
  fill: #bff6c6;
}

.region--pink {
  fill: #f7b8bd;
}

.region--yellow {
  fill: #fff7b8;
}

.region--orange {
  fill: #ffc21a;
}

.region--lavender {
  fill: #eda6f1;
}

.river-line {
  fill: none;
  stroke: #1fd8e5;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.province-labels text {
  fill: #27302a;
  font-family: var(--font-family-base);
  font-size: 13px;
  font-weight: 500;
  text-anchor: middle;
}

.province-labels .province-title {
  fill: #161914;
  font-size: 26px;
  font-weight: 800;
}

.office-points circle,
.district-dots circle {
  fill: var(--primary-color);
  stroke: #0a5f2c;
  stroke-width: 2;
}

.office-points text {
  fill: var(--primary-dark);
  font-family: var(--font-family-base);
  font-size: 12px;
  font-weight: 800;
}

.office-panel {
  position: relative;
  z-index: 2;
  grid-column: 1;
  grid-row: 1;
  width: 100%;
  margin: 0;
  overflow: hidden;
  padding: clamp(1.35rem, 2.6vw, 2rem);
  border: 1px solid rgba(232, 228, 223, 0.9);
  border-radius: 8px;
  background: var(--color-white);
  box-shadow: none;
  transition:
    border-color 0.32s ease,
    box-shadow 0.32s ease,
    transform 0.32s ease;
}

.office-panel::before,
.office-panel::after {
  position: absolute;
  left: 0;
  z-index: 0;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
  content: '';
  pointer-events: none;
}

.office-panel::before {
  top: 0;
  width: 100%;
}

.office-panel::after {
  top: calc(100% - 5px);
  width: 100%;
}

.office-panel > * {
  position: relative;
  z-index: 1;
}

.office-panel:hover,
.office-panel:focus-within {
  border-color: rgba(20, 129, 62, 0.18);
  box-shadow: 0 20px 42px rgba(20, 129, 62, 0.1);
  transform: translateY(-2px);
}

.office-panel__header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
}

.office-panel__header > div {
  min-width: 0;
}

.office-panel .section-kicker {
  color: var(--primary-dark);
  letter-spacing: 0;
  text-transform: none;
  font-size: 1rem;
}

.office-panel__badge {
  flex: 0 0 auto;
  margin: 0.18rem 0 0;
  padding: 0.35rem 0.62rem;
  border: 1px solid rgba(20, 129, 62, 0.16);
  border-radius: 999px;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.office-panel h3 {
  max-width: 300px;
  margin-bottom: 1.15rem;
  font-size: clamp(1.55rem, 2.6vw, 2.05rem);
  line-height: 1.08;
}

.office-panel .details-list--compact {
  gap: 0;
}

.office-panel .details-list--compact div {
  padding: 0.72rem 0;
  border-top: 1px solid rgba(232, 228, 223, 0.82);
}

.office-panel .details-list--compact div:first-child {
  padding-top: 0;
  border-top: 0;
}

.office-panel .details-list dt {
  font-size: 0.95rem;
}

.office-panel .details-list dd {
  font-size: 0.96rem;
}

.office-panel .details-list a {
  color: var(--primary-dark);
}

.office-card-enter-active,
.office-card-leave-active {
  transition:
    opacity 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    transform 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.34s ease;
}

.office-card-enter-active::before {
  animation: officeAccentSweep 0.44s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.office-card-enter-from {
  opacity: 0;
  filter: blur(4px);
  transform: translateX(-28px) scale(0.985);
}

.office-card-leave-to {
  opacity: 0;
  filter: blur(4px);
  transform: translateX(22px) scale(0.985);
}

@keyframes officeAccentSweep {
  from {
    width: 0;
  }
  to {
    width: 100%;
  }
}

.email-button {
  min-width: 132px;
  padding: 0.68rem 1rem;
  border: 1px solid var(--primary-color);
  color: var(--primary-dark);
}

.office-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 1.2rem;
}

.email-button--primary {
  background: var(--primary-color);
  color: var(--color-white);
  box-shadow: 0 12px 26px rgba(20, 129, 62, 0.18);
}

.email-button:hover {
  background: var(--primary-color);
  color: var(--color-white);
}

.contact-form-section {
  display: grid;
  grid-template-columns: minmax(260px, 0.82fr) minmax(0, 1.18fr);
  gap: clamp(1.5rem, 5vw, 3rem);
  align-items: start;
  width: min(100%, var(--container-max-width));
  margin: 0 auto;
  padding: clamp(3rem, 6vw, 4.5rem) var(--container-padding);
}

.contact-method-section {
  grid-column: 1 / -1;
  width: 100%;
  padding-bottom: clamp(0.5rem, 1.8vw, 1rem);
}

.contact-form-intro {
  max-width: 420px;
}

.contact-form-intro h2 {
  margin: 0.65rem 0 1rem;
  color: var(--color-ink);
  font-size: clamp(1.75rem, 3.4vw, 2.6rem);
  line-height: 1.08;
}

.contact-form-intro p:last-child {
  margin: 0;
  color: var(--color-ink-soft);
  font-size: 0.98rem;
  line-height: 1.7;
}

.contact-logo-visual {
  display: grid;
  place-items: center;
  margin-top: 0.85rem;
}

.contact-logo {
  width: min(100%, 300px);
  max-height: clamp(180px, 30vw, 320px);
  object-fit: contain;
  filter: drop-shadow(0 14px 22px rgba(31, 61, 46, 0.16));
}

.contact-form {
  position: relative;
  display: grid;
  gap: 0.85rem;
  overflow: hidden;
  padding: clamp(1rem, 2.2vw, 1.45rem);
  border: 1px solid rgba(232, 228, 223, 0.95);
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(255, 253, 248, 0.98)),
    var(--color-white);
  box-shadow:
    0 22px 48px rgba(43, 43, 40, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.78);
}

.contact-form::before,
.contact-form::after {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 5px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
  content: '';
  opacity: 0;
  pointer-events: none;
}


.contact-form--bars-visible::before,
.contact-form--method-motion::before {
  top: 0;
  left: calc(100% - 6px);
  width: 6px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-dark), var(--primary-color), #7bd89b);
  opacity: 1;
}

.contact-form--bars-visible::after,
.contact-form--method-motion::after {
  top: 0;
  left: 0;
  width: 5px;
  height: 100%;
  background: linear-gradient(180deg, var(--primary-dark), var(--primary-color), #7bd89b);
  opacity: 1;
}

.contact-form--method-motion::before {
  animation: contactFormRightBar 0.72s ease both;
}

.contact-form--method-motion::after {
  animation: contactFormLeftBar 0.72s ease both;
}

@keyframes contactFormRightBar {
  0% {
    top: calc(100% - 5px);
    left: 0;
    width: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  45% {
    top: calc(100% - 5px);
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  65% {
    top: calc(100% - 5px);
    left: calc(100% - 6px);
    width: 6px;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  100% {
    top: 0;
    left: calc(100% - 6px);
    width: 6px;
    height: 100%;
    background: linear-gradient(180deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }
}

@keyframes contactFormLeftBar {
  0% {
    top: calc(100% - 5px);
    left: 0;
    width: 0;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  45% {
    top: calc(100% - 5px);
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  65% {
    top: calc(100% - 5px);
    left: 0;
    width: 5px;
    height: 5px;
    background: linear-gradient(90deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }

  100% {
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: linear-gradient(180deg, var(--primary-dark), var(--primary-color), #7bd89b);
    opacity: 1;
  }
}

.form-kicker {
  margin: 0;
  color: var(--primary-dark);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  line-height: 1.2;
  text-transform: uppercase;
}

.form-heading {
  margin: -0.35rem 0 0.2rem;
  color: var(--color-ink);
  font-size: clamp(1.25rem, 2.2vw, 1.65rem);
  font-weight: 800;
  line-height: 1.15;
}

.contact-method-tabs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  padding: 0.45rem;
  border: 1px solid rgba(232, 228, 223, 0.96);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.72);
}

.contact-method-tab {
  position: relative;
  display: grid;
  min-height: 68px;
  align-content: center;
  gap: 0.08rem;
  padding: 0.5rem 0.65rem 0.75rem;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--color-ink);
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  line-height: 1.15;
  text-align: center;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;
}

.contact-method-tab::after {
  position: absolute;
  right: 0.7rem;
  bottom: 0.38rem;
  left: 0.7rem;
  height: 3px;
  border-radius: 999px;
  background: var(--primary-color);
  opacity: 0;
  content: '';
}

.contact-method-tab__label,
.contact-method-tab__meta {
  position: relative;
  z-index: 1;
}

.contact-method-tab__label {
  overflow-wrap: anywhere;
}

.contact-method-tab__meta {
  color: var(--color-ink-soft);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.contact-method-tab:hover,
.contact-method-tab--active {
  color: var(--primary-dark);
}

.contact-method-tab:hover {
  background: rgba(230, 246, 236, 0.74);
}

.contact-method-tab--active {
  border-color: rgba(20, 129, 62, 0.28);
  background: linear-gradient(180deg, rgba(230, 246, 236, 0.98), rgba(255, 250, 242, 0.94));
  box-shadow:
    0 10px 22px rgba(20, 129, 62, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.84);
}

.contact-method-tab--active .contact-method-tab__label,
.contact-method-tab--active .contact-method-tab__meta {
  color: var(--primary-dark);
}

.contact-method-tab--active::after {
  opacity: 1;
}

.telegram-contact-panel {
  display: grid;
  justify-items: center;
  gap: 2.5rem;
  padding: clamp(2.5rem, 2vw, 2rem) 0 0.25rem;
}

.telegram-qr-figure {
  width: min(100%, 280px);
  margin: 0;
}

.telegram-qr-image {
  display: block;
  width: 100%;
  aspect-ratio: 1;
  object-fit: contain;
  border: 1px solid rgba(20, 129, 62, 0.18);
  border-radius: 8px;
  background: var(--color-white);
  padding: 0.7rem;
  box-shadow: 0 16px 34px rgba(43, 43, 40, 0.08);
}

.telegram-open-button {
  min-width: 190px;
  text-decoration: none;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.contact-form label,
.form-field {
  display: grid;
  gap: 0.35rem;
  color: var(--color-ink);
  font-size: 0.92rem;
  font-weight: 700;
}

.field-topline {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  min-height: 1.2rem;
}

.field-label {
  color: var(--color-ink);
  transition: color 0.2s ease;
}

.field-required,
.field-optional,
.field-count {
  color: var(--color-ink-soft);
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.field-count {
  letter-spacing: 0;
}

.field-control {
  position: relative;
  display: block;
}

.field-control::after {
  position: absolute;
  right: 0.85rem;
  bottom: 0.65rem;
  left: 0.85rem;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--primary-dark), var(--primary-color));
  opacity: 0;
  transform: scaleX(0.7);
  transform-origin: left center;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  content: '';
  pointer-events: none;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  border: 1px solid rgba(232, 228, 223, 0.96);
  border-radius: 8px;
  background: linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
  color: var(--color-ink);
  font: inherit;
  outline: none;
  padding: 0.68rem 0.85rem;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.75),
    0 8px 18px rgba(43, 43, 40, 0.04);
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.contact-form input {
  min-height: 48px;
}

.contact-form textarea {
  min-height: 125px;
  resize: vertical;
}

.contact-form input::placeholder,
.contact-form textarea::placeholder {
  color: rgba(91, 86, 76, 0.66);
}

.form-field:hover .field-label,
.form-field:focus-within .field-label {
  color: var(--primary-dark);
}

.contact-form input:hover,
.contact-form textarea:hover {
  border-color: rgba(20, 129, 62, 0.3);
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: var(--primary-color);
  box-shadow:
    0 0 0 4px rgba(27, 163, 79, 0.12),
    0 14px 28px rgba(20, 129, 62, 0.11);
  transform: translateY(-1px);
}

.form-field:focus-within .field-control::after {
  opacity: 1;
  transform: scaleX(1);
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  align-items: center;
  padding-top: 0.1rem;
}

.form-submit {
  display: inline-flex;
  min-height: 44px;
  min-width: 150px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--primary-color);
  border-radius: 999px;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-dark));
  color: var(--color-white);
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(20, 129, 62, 0.18);
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.form-submit:hover:not(:disabled) {
  background: var(--primary-dark);
  border-color: var(--primary-dark);
  box-shadow: 0 18px 34px rgba(20, 129, 62, 0.22);
  transform: translateY(-1px);
}

.form-submit:disabled {
  cursor: not-allowed;
  opacity: 0.56;
  box-shadow: none;
}

.form-status {
  margin: 0;
  padding: 0.62rem 0.8rem;
  border: 1px solid rgba(20, 129, 62, 0.18);
  border-radius: 8px;
  background: var(--primary-light);
  color: var(--primary-dark);
  font-size: 0.9rem;
  font-weight: 600;
}

.visit-section {
  display: grid;
  grid-template-columns: minmax(0, 0.78fr) minmax(280px, 1fr) auto;
  gap: clamp(1.75rem, 5vw, 3.5rem);
  align-items: center;
  border-top: 1px solid rgba(255, 250, 242, 0.12);
  background:
    linear-gradient(
      90deg,
      rgba(4, 48, 29, 0.94) 0%,
      rgba(4, 48, 29, 0.9) 52%,
      rgba(4, 48, 29, 0.76) 100%
    ),
    var(--visit-background) center / cover no-repeat;
  color: #fffaf2;
  padding: clamp(3rem, 6vw, 4.5rem)
    max(
      var(--container-padding),
      calc((100vw - var(--container-max-width)) / 2 + var(--container-padding))
    );
}

.visit-section .section-kicker--light {
  color: #bff6c6;
}

.visit-section h2 {
  margin: 0.6rem 0 0;
  color: #fffaf2;
  font-size: clamp(1.75rem, 3.2vw, 2.5rem);
  line-height: 1.18;
}

.visit-notes {
  display: grid;
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.visit-notes li {
  position: relative;
  padding-left: 1.35rem;
  color: rgba(255, 250, 242, 0.96);
  font-size: 0.98rem;
  line-height: 1.65;
}

.visit-notes li::before {
  position: absolute;
  top: 0.68em;
  left: 0;
  width: 0.48rem;
  height: 0.48rem;
  border: 2px solid rgba(255, 250, 242, 0.86);
  border-radius: 999px;
  background: #bff6c6;
  content: '';
}

.visit-button {
  min-height: 50px;
  padding: 0.72rem 1.5rem;
}

.visit-button--primary {
  background: var(--color-white);
  color: #073f27;
  box-shadow: none;
}

.visit-button--ghost {
  border: 1px solid rgba(255, 250, 242, 0.72);
  color: #fffaf2;
}

.visit-button--primary:hover {
  background: #bff6c6;
  color: #073f27;
}

.visit-button--ghost:hover {
  border-color: #fffaf2;
  background: rgba(255, 250, 242, 0.14);
}

@media (max-width: 1020px) {
  .headquarters-layout,
  .contact-form-section,
  .visit-section {
    grid-template-columns: 1fr;
  }

  .headquarters-photo {
    min-height: 340px;
  }

  .office-map {
    grid-template-columns: minmax(260px, 0.92fr) minmax(0, 1.08fr);
  }

  .map-illustration {
    inset: auto;
    min-height: 340px;
    opacity: 1;
  }

  .map-frame {
    height: 340px;
    min-height: 300px;
  }

  .map-image-shell {
    width: min(100%, 400px);
  }

  .visit-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 720px) {
  .visit-actions,
  .visit-button {
    width: 100%;
  }

  .office-tabs {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .office-tab {
    min-height: 52px;
  }

  .office-map {
    display: flex;
    flex-direction: column;
    min-height: auto;
    gap: 0.85rem;
    padding: 0.85rem;
    background: var(--color-white);
  }

  .province-badge {
    position: relative;
    top: auto;
    right: auto;
    order: 1;
    align-self: flex-start;
    margin: 1rem 1rem 0;
  }

  .office-panel {
    order: 2;
    width: auto;
    margin: 0;
  }

  .map-illustration {
    position: relative;
    inset: auto;
    order: 3;
    width: 100%;
    min-height: auto;
    height: auto;
    padding: 0;
    opacity: 1;
  }

  .map-frame {
    height: 280px;
    min-height: 250px;
  }

  .contact-map {
    max-height: 240px;
  }

  .map-image-shell {
    width: min(100%, 320px);
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    align-items: stretch;
  }

  .contact-logo-visual {
    margin-inline: auto;
  }
}

@media (max-width: 520px) {
  .headquarters-section,
  .centers-section,
  .contact-form-section {
    padding-inline: 1rem;
  }

  .section-intro {
    margin-bottom: 2.25rem;
  }

  .headquarters-photo {
    min-height: 280px;
  }

  .headquarters-details h3,
  .office-panel h3 {
    font-size: 1.55rem;
  }

  .office-panel__header {
    flex-direction: column;
    gap: 0.55rem;
  }

  .contact-method-tabs {
    grid-template-columns: 1fr;
  }

  .contact-method-tab {
    min-height: 50px;
  }

  .form-submit,
  .form-actions {
    width: 100%;
  }

  .form-actions {
    gap: 0.65rem;
  }

  .field-topline {
    align-items: flex-start;
    flex-direction: column;
    gap: 0.18rem;
  }

  .contact-logo-visual {
    margin-top: 0.85rem;
  }

  .contact-logo {
    width: min(100%, 230px);
    max-height: 220px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal--visible {
    animation: none;
  }

  .office-panel,
  .office-panel::before,
  .office-panel::after,
  .office-card-enter-active,
  .office-card-leave-active,
  .map-hotspot__label,
  .contact-form::before,
  .contact-form::after {
    transition: none;
  }

  .office-card-enter-active::before,
  .map-hotspot::after {
    animation: none;
  }

  .office-panel:hover,
  .office-panel:focus-within {
    transform: none;
  }

  .map-slide-enter-active,
  .map-slide-leave-active {
    transition: none;
  }

  .map-slide-enter-from,
  .map-slide-leave-to,
  .office-card-enter-from,
  .office-card-leave-to {
    opacity: 1;
    filter: none;
    transform: none;
  }
}
</style>
