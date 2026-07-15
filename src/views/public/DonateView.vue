<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import acledaLogo from '@/assets/acleda-logo.png'
import {
  defaultDonationMethods,
  fetchDonationMethods,
  type DonationMethod,
} from '@/lib/donationSettings'

type Tab = 'qr' | 'card'
const activeTab = ref<Tab>('qr')

interface PayMethod {
  key: string
  bank: string
  subtitle: string
  badge: string
  qrUrl: string
  accountName: string
  accountNo: string
  currency: string
  steps: string[]
  headerColor: string
  badgeColor: string
  badgeTextColor: string
  logo?: string
  logoAlt?: string
  panelColor: string
  numberColor: string
}

// Extra styling for banks we ship artwork/colors for; any other bank the
// admin adds derives its look from the card color chosen in the admin panel.
const knownMeta: Record<string, Partial<PayMethod>> = {
  aba: {
    badgeColor: '#294f8f',
    badgeTextColor: '#ffffff',
    panelColor: '#eef1f6',
  },
  acleda: {
    badgeColor: '#d9ad2f',
    badgeTextColor: '#1d3d5c',
    logo: acledaLogo,
    logoAlt: 'ACLEDA Bank logo',
    panelColor: '#fff4d4',
    numberColor: '#d9ad2f',
  },
}

function badgeFor(bank: string) {
  return (
    bank
      .replace(/[^a-zA-Z]/g, '')
      .slice(0, 3)
      .toUpperCase() || 'QR'
  )
}

function toPayMethod(method: DonationMethod): PayMethod {
  return {
    key: method.id,
    bank: method.bank,
    subtitle: method.subtitle,
    badge: badgeFor(method.bank),
    qrUrl: method.qrUrl,
    accountName: method.accountName,
    accountNo: method.accountNo,
    currency: method.currency,
    steps: [
      `Open the ${method.bank} mobile app`,
      'Tap QR Payment or Scan',
      'Scan the QR code above',
      'Confirm amount & payment',
    ],
    headerColor: method.headerColor,
    badgeColor: method.headerColor,
    badgeTextColor: '#ffffff',
    panelColor: `color-mix(in srgb, ${method.headerColor} 9%, #ffffff)`,
    numberColor: method.headerColor,
    ...knownMeta[method.id],
  }
}

const savedMethods = ref<DonationMethod[]>([])

onMounted(async () => {
  try {
    savedMethods.value = await fetchDonationMethods()
  } catch {
    // No admin settings saved yet — fall back to the defaults.
  }
})

const methods = computed<PayMethod[]>(() => {
  const source = savedMethods.value.length ? savedMethods.value : defaultDonationMethods()
  return source.map(toPayMethod)
})
</script>

<template>
  <div class="donate-page">
    <header class="donate-header">
      <h1>Donate Locally in Cambodia</h1>
      <p class="subtitle">
        Scan with your banking app &middot; No internet transfer fees. Your contribution directly
        supports the education of disabled children.
      </p>

      <div class="tabs">
        <button :class="['tab', { active: activeTab === 'qr' }]" @click="activeTab = 'qr'">
          Pay with QR
        </button>
        <button :class="['tab', { active: activeTab === 'card' }]" @click="activeTab = 'card'">
          Pay with credit card
        </button>
      </div>
    </header>

    <section v-if="activeTab === 'qr'" class="cards">
      <article v-for="m in methods" :key="m.key" class="pay-card">
        <div class="card-header" :style="{ background: m.headerColor }">
          <div
            v-if="!m.logo"
            class="badge"
            :style="{ background: m.badgeColor, color: m.badgeTextColor }"
          >
            {{ m.badge }}
          </div>
          <div v-else class="logo-badge">
            <img :src="m.logo" :alt="m.logoAlt" />
          </div>
          <div>
            <div class="bank-name">{{ m.bank }}</div>
            <div class="bank-subtitle">{{ m.subtitle }}</div>
          </div>
        </div>

        <div class="card-body">
          <div
            class="qr-box"
            :class="{ 'has-qr': m.qrUrl }"
            :style="{ borderColor: m.headerColor }"
          >
            <template v-if="m.qrUrl">
              <img class="qr-image" :src="m.qrUrl" :alt="`${m.bank} donation QR code`" />
              <span class="qr-caption" :style="{ color: m.headerColor }">SCAN TO DONATE</span>
            </template>
            <template v-else>
              <span class="qr-icon" :style="{ color: m.headerColor }">&#9635;</span>
              <span class="qr-caption" :style="{ color: m.headerColor }">SCAN TO DONATE</span>
              <span class="qr-file">QR coming soon</span>
            </template>
            <span class="mini-badge" :style="{ background: m.headerColor }">{{
              m.badge.slice(0, 3)
            }}</span>
          </div>

          <dl class="details">
            <div class="row">
              <dt>Account Name</dt>
              <dd>{{ m.accountName }}</dd>
            </div>
            <div class="row">
              <dt>Account No.</dt>
              <dd class="account-no">{{ m.accountNo }}</dd>
            </div>
            <div class="row">
              <dt>Currency</dt>
              <dd>{{ m.currency }}</dd>
            </div>
          </dl>

          <div class="how-to-pay" :style="{ background: m.panelColor }">
            <div class="how-title" :style="{ color: m.headerColor }">How to Pay</div>
            <ol>
              <li v-for="(step, i) in m.steps" :key="step">
                <span class="step-number" :style="{ background: m.numberColor }">{{ i + 1 }}</span>
                <span>{{ step }}</span>
              </li>
            </ol>
          </div>
        </div>
      </article>
    </section>

    <section v-else class="card-payment">
      <p>Credit card donations are coming soon. Please use the QR payment methods above for now.</p>
    </section>

    <div class="notice">
      <span class="notice-icon">&#9432;</span>
      <div>
        <p>
          After completing your donation, please send your <strong>payment screenshot</strong> to
          <a href="mailto:SANTISENAMONK@GMAIL.COM">SANTISENAMONK@GMAIL.COM</a>.
        </p>
        <p class="notice-sub">
          This allows us to send you an official receipt and our sincere gratitude.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.donate-page {
  background: var(--color-cream);
  color: var(--color-ink);
  min-height: 100vh;
  padding: 3rem 1.5rem 4rem;
}

.donate-header {
  max-width: 900px;
  margin: 0 auto 2.5rem;
  text-align: center;
}
.donate-header h1 {
  margin: 0 0 0.75rem;
}
.subtitle {
  color: var(--color-ink-soft);
  margin: 0 auto 1.5rem;
  max-width: 640px;
  line-height: 1.5;
}

.tabs {
  display: inline-flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
}
.tab {
  min-height: 3rem;
  border: 1px solid #1d3d5c;
  border-radius: 999px;
  background: transparent;
  padding: 0.75rem 1.45rem;
  font-weight: 600;
  line-height: 1.1;
  color: #1d3d5c;
  cursor: pointer;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.18s ease;
}
.tab:hover {
  border-color: #d9ad2f;
  color: #1d3d5c;
  transform: translateY(-1px);
}
.tab.active {
  background: #1d3d5c;
  color: var(--color-white);
  border-color: #1d3d5c;
  box-shadow: 0 12px 24px rgba(29, 61, 92, 0.18);
}
.tab.active:hover {
  background: #17314a;
  color: var(--color-white);
  border-color: #17314a;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.pay-card {
  background: linear-gradient(145deg, var(--color-white) 0%, var(--color-cream-soft) 100%);
  border: 1px solid var(--color-border);
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 14px 34px rgba(43, 43, 40, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 1.25rem 1.5rem;
  color: #fff;
}
.badge {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.6rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
}
.logo-badge {
  width: 7.5rem;
  height: 2.75rem;
  border-radius: 0.6rem;
  background: rgba(255, 255, 255, 0.94);
  padding: 0.35rem 0.55rem;
  display: flex;
  align-items: center;
  justify-content: center;
}
.logo-badge img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.bank-name {
  font-weight: 700;
  font-size: 1.05rem;
}
.bank-subtitle {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.card-body {
  padding: 1.5rem;
}

.qr-box {
  position: relative;
  border: 2px dashed;
  border-radius: 0.75rem;
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  opacity: 0.85;
  margin-bottom: 1.5rem;
}
.qr-box.has-qr {
  border-style: solid;
  opacity: 1;
  padding: 1rem;
}
.qr-image {
  max-width: 200px;
  max-height: 200px;
  width: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  background: #fff;
}
.qr-icon {
  font-size: 2rem;
}
.qr-caption {
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}
.qr-file {
  font-size: 0.7rem;
  color: var(--color-ink-soft);
}
.mini-badge {
  position: absolute;
  bottom: 0.75rem;
  right: 0.75rem;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.35rem;
}

.details .row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--color-border);
}
.details dt {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: var(--color-ink-soft);
  text-transform: uppercase;
}
.details dd {
  margin: 0;
  font-weight: 700;
}
.account-no {
  font-size: 1.1rem;
}

.how-to-pay {
  margin-top: 1.5rem;
  border-radius: 0.75rem;
  padding: 1.25rem 1.5rem;
}
.how-title {
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  margin-bottom: 0.75rem;
}
.how-to-pay ol {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}
.how-to-pay li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.step-number {
  width: 1.5rem;
  height: 1.5rem;
  flex-shrink: 0;
  border-radius: 50%;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-payment {
  max-width: 700px;
  margin: 0 auto;
  border: 1px solid var(--color-border);
  border-radius: 0.9rem;
  background: linear-gradient(145deg, var(--color-white) 0%, var(--color-cream-soft) 100%);
  padding: 1.5rem;
  text-align: center;
  color: var(--color-ink-soft);
  box-shadow: 0 10px 24px rgba(43, 43, 40, 0.06);
}

.notice {
  max-width: 900px;
  margin: 2.5rem auto 0;
  background: linear-gradient(145deg, var(--color-white) 0%, var(--color-cream-soft) 100%);
  border: 1px solid var(--color-border);
  border-radius: 0.9rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 10px 24px rgba(43, 43, 40, 0.06);
}
.notice-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #fff4d4;
  color: #1d3d5c;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice p {
  margin: 0;
}
.notice a {
  color: #1d3d5c;
  font-weight: 600;
}
.notice-sub {
  margin-top: 0.35rem;
  color: var(--color-ink-soft);
  font-size: 0.9rem;
}
</style>
