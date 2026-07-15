<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { supabase } from '@/lib/supabase'
import {
  createDonationMethod,
  defaultDonationMethods,
  fetchDonationMethods,
  saveDonationMethods,
  type DonationMethod,
} from '@/lib/donationSettings'

const MAX_QR_SIZE = 5 * 1024 * 1024

const ui = useUiStore()

const methods = ref<DonationMethod[]>(defaultDonationMethods())
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

const loading = ref(true)
const saving = ref(false)
const message = ref('')
const messageType = ref<'success' | 'error'>('success')

onMounted(async () => {
  try {
    const saved = await fetchDonationMethods()
    if (saved.length) methods.value = saved
  } catch {
    // No settings saved yet — start from defaults.
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  for (const id of Object.keys(previews)) revokePreview(id)
})

function revokePreview(id: string) {
  if (previews[id]) {
    URL.revokeObjectURL(previews[id])
    delete previews[id]
  }
}

function displayedQr(method: DonationMethod) {
  return previews[method.id] || method.qrUrl
}

function onFileChange(method: DonationMethod, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!file.type.startsWith('image/')) {
    showMessage('Please choose an image file (PNG or JPG).', 'error')
    return
  }
  if (file.size > MAX_QR_SIZE) {
    showMessage('QR image must be smaller than 5MB.', 'error')
    return
  }

  revokePreview(method.id)
  pendingFiles[method.id] = file
  previews[method.id] = URL.createObjectURL(file)
  message.value = ''
}

function removeQr(method: DonationMethod) {
  revokePreview(method.id)
  delete pendingFiles[method.id]
  method.qrUrl = ''
}

function addBank() {
  methods.value.push(createDonationMethod())
  message.value = ''
}

function removeBank(method: DonationMethod) {
  revokePreview(method.id)
  delete pendingFiles[method.id]
  methods.value = methods.value.filter((m) => m.id !== method.id)
  message.value = ''
}

function showMessage(text: string, type: 'success' | 'error') {
  message.value = text
  messageType.value = type
}

async function uploadQr(method: DonationMethod, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const safeId = method.id.replace(/[^a-zA-Z0-9_-]/g, '')
  const path = `donation-qr/${safeId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(path, file, { upsert: true })
  if (uploadError) throw uploadError

  return supabase.storage.from('media').getPublicUrl(path).data.publicUrl
}

async function save() {
  if (saving.value) return

  if (!methods.value.length) {
    showMessage('Add at least one bank before saving.', 'error')
    return
  }
  if (methods.value.some((m) => !m.bank.trim())) {
    showMessage('Every bank needs a name before saving.', 'error')
    return
  }

  saving.value = true
  message.value = ''

  try {
    for (const method of methods.value) {
      const file = pendingFiles[method.id]
      if (file) {
        method.qrUrl = await uploadQr(method, file)
        delete pendingFiles[method.id]
        revokePreview(method.id)
      }
    }

    await saveDonationMethods(methods.value)

    showMessage('Donation settings saved. The Support Us page is now updated.', 'success')
  } catch (e) {
    showMessage(e instanceof Error ? e.message : 'Failed to save donation settings.', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section class="donation-overview" aria-label="Donation QR settings">
          <header class="donation-header">
            <div class="header-copy">
              <p class="eyebrow">Support Us</p>
              <h1>Donation Banks & QR Codes</h1>
              <p>
                Manage the banks shown on the public Support Us page — upload each bank's QR code,
                edit account details, or add a new bank. Changes go live as soon as you save.
              </p>
            </div>
            <button class="add-btn" type="button" :disabled="loading" @click="addBank">
              + Add bank
            </button>
          </header>

          <p v-if="loading" class="loading-note">Loading current settings...</p>

          <div v-else class="method-grid">
            <article v-for="method in methods" :key="method.id" class="method-card">
              <header class="method-head" :style="{ background: method.headerColor }">
                <div class="head-copy">
                  <div class="bank-name">{{ method.bank || 'New bank' }}</div>
                  <div class="bank-subtitle">{{ method.subtitle || 'Bank subtitle' }}</div>
                </div>
                <button
                  type="button"
                  class="remove-bank-btn"
                  :aria-label="`Remove ${method.bank || 'this bank'}`"
                  @click="removeBank(method)"
                >
                  &times;
                </button>
              </header>

              <div class="method-body">
                <div class="qr-preview" :style="{ borderColor: method.headerColor }">
                  <img
                    v-if="displayedQr(method)"
                    :src="displayedQr(method)"
                    :alt="`${method.bank || 'Bank'} donation QR code`"
                  />
                  <div v-else class="qr-empty">
                    <span class="qr-empty-icon" aria-hidden="true">&#9635;</span>
                    <span>No QR uploaded yet</span>
                  </div>
                  <span v-if="pendingFiles[method.id]" class="pending-tag">Not saved yet</span>
                </div>

                <div class="qr-actions">
                  <label class="upload-btn">
                    <input
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="onFileChange(method, $event)"
                    />
                    {{ displayedQr(method) ? 'Replace QR image' : 'Upload QR image' }}
                  </label>
                  <button
                    v-if="displayedQr(method)"
                    type="button"
                    class="remove-btn"
                    @click="removeQr(method)"
                  >
                    Remove QR
                  </button>
                </div>

                <div class="field">
                  <label :for="`${method.id}-bank`">Bank name</label>
                  <input
                    :id="`${method.id}-bank`"
                    v-model="method.bank"
                    placeholder="e.g. Wing Bank"
                  />
                </div>
                <div class="field">
                  <label :for="`${method.id}-subtitle`">Subtitle</label>
                  <input
                    :id="`${method.id}-subtitle`"
                    v-model="method.subtitle"
                    placeholder="e.g. WING BANK - CAMBODIA"
                  />
                </div>
                <div class="field">
                  <label :for="`${method.id}-color`">Card color</label>
                  <div class="color-field">
                    <input
                      :id="`${method.id}-color`"
                      v-model="method.headerColor"
                      type="color"
                    />
                    <span class="color-value">{{ method.headerColor }}</span>
                  </div>
                </div>
                <div class="field">
                  <label :for="`${method.id}-account-name`">Account name</label>
                  <input :id="`${method.id}-account-name`" v-model="method.accountName" />
                </div>
                <div class="field">
                  <label :for="`${method.id}-account-no`">Account number</label>
                  <input :id="`${method.id}-account-no`" v-model="method.accountNo" />
                </div>
                <div class="field">
                  <label :for="`${method.id}-currency`">Currency</label>
                  <input :id="`${method.id}-currency`" v-model="method.currency" />
                </div>
              </div>
            </article>
          </div>

          <footer v-if="!loading" class="save-bar">
            <p v-if="message" :class="['save-message', messageType]" role="status">
              {{ message }}
            </p>
            <button class="save-btn" type="button" :disabled="saving" @click="save">
              {{ saving ? 'Saving...' : 'Save changes' }}
            </button>
          </footer>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-blue: var(--admin-theme-primary);
  --admin-blue-deep: var(--admin-theme-primary-deep);
  --admin-shadow: var(--admin-theme-shadow);

  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--admin-bg);
  color: var(--admin-text);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  transition: padding-left 0.25s ease;
}

.admin-layout {
  display: flex;
  flex: 1;
}

.main {
  flex: 1;
  width: 100%;
  padding: 1.5rem 2.25rem 2.5rem;
  background: var(--admin-bg);
}

.donation-overview {
  display: grid;
  gap: 1.5rem;
}

.donation-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--admin-surface-soft), var(--admin-surface));
  box-shadow: var(--admin-shadow);
}

.header-copy {
  display: grid;
  gap: 0.5rem;
  max-width: 640px;
}

.eyebrow {
  margin: 0;
  color: var(--admin-blue-deep);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  color: var(--admin-contrast);
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.header-copy p:not(.eyebrow) {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.6;
}

.add-btn {
  min-height: 46px;
  border: 1.5px solid var(--admin-blue);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-blue-deep);
  padding: 0.6rem 1.2rem;
  font-weight: 800;
  font-size: 0.92rem;
  cursor: pointer;
  transition: background 0.18s ease, transform 0.12s ease;
}

.add-btn:hover {
  background: var(--admin-surface-soft);
  transform: translateY(-1px);
}

.add-btn:disabled {
  cursor: wait;
  opacity: 0.6;
}

.loading-note {
  margin: 0;
  color: var(--admin-muted);
  font-weight: 600;
}

.method-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.1rem;
}

.method-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  overflow: hidden;
  display: grid;
  align-content: start;
}

.method-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 1.4rem;
  color: #ffffff;
}

.head-copy {
  min-width: 0;
}

.bank-name {
  font-weight: 800;
  font-size: 1.05rem;
}

.bank-subtitle {
  font-size: 0.7rem;
  letter-spacing: 0.04em;
  opacity: 0.85;
}

.remove-bank-btn {
  width: 2rem;
  height: 2rem;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  transition: background 0.18s ease;
}

.remove-bank-btn:hover {
  background: rgba(225, 29, 72, 0.65);
}

.method-body {
  padding: 1.4rem;
  display: grid;
  gap: 1rem;
}

.qr-preview {
  position: relative;
  border: 2px dashed;
  border-radius: 12px;
  min-height: 220px;
  display: grid;
  place-items: center;
  padding: 0.75rem;
  background: var(--admin-surface-soft);
}

.qr-preview img {
  max-width: 100%;
  max-height: 260px;
  border-radius: 8px;
  background: #ffffff;
}

.qr-empty {
  display: grid;
  gap: 0.35rem;
  justify-items: center;
  color: var(--admin-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.qr-empty-icon {
  font-size: 2rem;
}

.pending-tag {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
  background: #d9ad2f;
  color: #1d3d5c;
  font-size: 0.68rem;
  font-weight: 800;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
}

.qr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.upload-btn {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition: transform 0.12s ease, box-shadow 0.18s ease;
}

.upload-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.remove-btn {
  min-height: 42px;
  border: 1.5px solid rgba(225, 29, 72, 0.35);
  border-radius: 10px;
  background: rgba(225, 29, 72, 0.06);
  color: #be123c;
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.18s ease;
}

.remove-btn:hover {
  background: rgba(225, 29, 72, 0.13);
}

.field {
  display: grid;
  gap: 0.4rem;
}

.field label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-contrast-soft);
}

.field input:not([type='color']) {
  min-height: 44px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  color: var(--admin-text);
  padding: 0.6rem 0.85rem;
  font-size: 0.92rem;
  font-family: inherit;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.field input:not([type='color']):focus {
  border-color: var(--admin-blue);
  box-shadow: 0 0 0 4px rgba(22, 163, 74, 0.15);
  outline: none;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.color-field input[type='color'] {
  width: 3.2rem;
  height: 2.6rem;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface);
  padding: 0.2rem;
  cursor: pointer;
}

.color-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--admin-muted);
  text-transform: uppercase;
}

.save-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.4rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
}

.save-message {
  margin: 0 auto 0 0;
  font-weight: 700;
  font-size: 0.9rem;
}

.save-message.success {
  color: var(--admin-blue-deep);
}

.save-message.error {
  color: #be123c;
}

.save-btn {
  min-height: 46px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.6rem 1.5rem;
  font-weight: 700;
  font-size: 0.92rem;
  cursor: pointer;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition: transform 0.12s ease, box-shadow 0.18s ease;
}

.save-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.save-btn:disabled {
  cursor: wait;
  opacity: 0.72;
  transform: none;
}

@media (min-width: 900px) {
  .admin-page.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 760px) {
  .main {
    padding: 1rem;
  }

  .donation-header {
    padding: 1.1rem;
  }

  .method-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
