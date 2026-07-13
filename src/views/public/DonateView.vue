<script setup lang="ts">
import { ref } from 'vue'

type Tab = 'qr' | 'card'
const activeTab = ref<Tab>('qr')

interface PayMethod {
  key: string
  bank: string
  subtitle: string
  badge: string
  qrFile: string
  accountName: string
  accountNo: string
  currency: string
  steps: string[]
  headerColor: string
  panelColor: string
  numberColor: string
}

const methods: PayMethod[] = [
  {
    key: 'aba',
    bank: 'ABA Pay',
    subtitle: 'ABA BANK - CAMBODIA',
    badge: 'ABA',
    qrFile: 'qr-aba.png',
    accountName: 'SANTI SENA',
    accountNo: '000 000 000',
    currency: 'KHR / USD',
    steps: ['Open ABA Mobile app', 'Tap ABA PAY or Scan', 'Scan the QR code above', 'Confirm amount & payment'],
    headerColor: '#0d2c63',
    panelColor: '#eef1f6',
    numberColor: '#0d2c63',
  },
  {
    key: 'acleda',
    bank: 'ACLEDA Bank',
    subtitle: 'ACLEDA - CAMBODIA',
    badge: 'ACL',
    qrFile: 'qr-acleda.png',
    accountName: 'SANTI SENA',
    accountNo: '0000 0000 000',
    currency: 'KHR / USD',
    steps: ['Open ACLEDA Mobile app', 'Tap QR Payment or Scan', 'Scan the QR code above', 'Confirm amount & payment'],
    headerColor: '#d81f2b',
    panelColor: '#fcebec',
    numberColor: '#d81f2b',
  },
]
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
          <div class="badge">{{ m.badge }}</div>
          <div>
            <div class="bank-name">{{ m.bank }}</div>
            <div class="bank-subtitle">{{ m.subtitle }}</div>
          </div>
        </div>

        <div class="card-body">
          <div class="qr-box" :style="{ borderColor: m.headerColor }">
            <span class="qr-icon" :style="{ color: m.headerColor }">&#9635;</span>
            <span class="qr-caption" :style="{ color: m.headerColor }">SCAN TO DONATE</span>
            <span class="qr-file">{{ m.qrFile }}</span>
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
        <p class="notice-sub">This allows us to send you an official receipt and our sincere gratitude.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.donate-page {
  background: #f4f5fa;
  color: #1f2430;
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
  color: #6b7280;
  margin: 0 auto 1.5rem;
  max-width: 640px;
  line-height: 1.5;
}

.tabs {
  display: inline-flex;
  gap: 1.5rem;
  border-bottom: 1px solid #e1e3ec;
}
.tab {
  background: none;
  border: none;
  padding: 0.6rem 0.2rem;
  font-weight: 600;
  color: #9ca3af;
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: #1f2430;
  border-bottom-color: #1f2430;
}

.cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  max-width: 1100px;
  margin: 0 auto;
}

.pay-card {
  background: #fff;
  border-radius: 1rem;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(20, 20, 40, 0.08);
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
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.75rem;
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
  color: #9ca3af;
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
  border-bottom: 1px solid #eef0f5;
}
.details dt {
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  color: #9ca3af;
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
  text-align: center;
  color: #6b7280;
}

.notice {
  max-width: 900px;
  margin: 2.5rem auto 0;
  background: #fff;
  border-radius: 0.9rem;
  padding: 1.25rem 1.5rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  box-shadow: 0 6px 20px rgba(20, 20, 40, 0.06);
}
.notice-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: #eef1f6;
  color: #0d2c63;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice p {
  margin: 0;
}
.notice a {
  color: #0d2c63;
  font-weight: 600;
}
.notice-sub {
  margin-top: 0.35rem;
  color: #9ca3af;
  font-size: 0.9rem;
}
</style>
