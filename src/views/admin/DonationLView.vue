<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import ImageCropModal from '@/components/admin/ImageCropModal.vue'
import { useUiStore } from '@/stores/ui.store'
import { useMediaStore } from '@/stores/media.store'
import { imageUploadHelpText, isAllowedImageFile, isSameImage } from '@/lib/media'
import {
  defaultDonationMethods,
  fetchDonationMethods,
  saveDonationMethod,
  type DonationMethod,
} from '@/lib/donationSettings'

const ui = useUiStore()
const media = useMediaStore()

// Exactly two fixed bank slots — banks can be edited but never added or
// removed, so the public Support Us page always shows the same two cards.
const methods = ref<DonationMethod[]>(defaultDonationMethods())
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

// Only one bank card is shown at a time; the switcher toggles between them.
const activeIndex = ref(0)
// methods always has the two fixed slots from defaultDonationMethods(), so
// the fallback here only guards TypeScript's indexed-access check.
const activeMethod = computed<DonationMethod>(
  () => methods.value[activeIndex.value] ?? methods.value[0]!,
)

const loading = ref(true)
// Each card saves independently, so track saving/message state per bank id
// rather than a single global one.
const savingId = ref<string | null>(null)
const cardMessages = reactive<Record<string, { text: string; type: 'success' | 'error' }>>({})

// Merges saved rows into the fixed slots (matching by id, falling back to
// position) so the slot's id — and therefore its identity on save — never
// changes even if older saved data used different ids.
function toFixedSlots(saved: DonationMethod[]): DonationMethod[] {
  return defaultDonationMethods().map((slot, index) => {
    const match = saved.find((m) => m.id === slot.id) ?? saved[index]
    return match ? { ...slot, ...match, id: slot.id } : slot
  })
}

onMounted(async () => {
  try {
    const saved = await fetchDonationMethods()
    if (saved.length) methods.value = toFixedSlots(saved)
  } catch {
    // No settings saved yet — start from defaults.
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  for (const id of Object.keys(previews)) revokePreview(id)
  closeCropTarget()
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

// Holds the just-picked (not yet cropped) file while the crop modal is open.
const cropTarget = ref<{ methodId: string; file: File; src: string } | null>(null)

async function onFileChange(method: DonationMethod, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  if (!isAllowedImageFile(file)) {
    cardMessages[method.id] = { text: `Please choose ${imageUploadHelpText()}`, type: 'error' }
    return
  }

  if (method.qrUrl && (await isSameImage(file, method.qrUrl))) {
    cardMessages[method.id] = {
      text: 'That image matches the current QR code — choose a different image to upload.',
      type: 'error',
    }
    return
  }

  delete cardMessages[method.id]
  cropTarget.value = { methodId: method.id, file, src: URL.createObjectURL(file) }
}

function closeCropTarget() {
  if (cropTarget.value) URL.revokeObjectURL(cropTarget.value.src)
  cropTarget.value = null
}

function onCropConfirm(croppedFile: File) {
  const methodId = cropTarget.value?.methodId
  closeCropTarget()
  if (!methodId) return

  revokePreview(methodId)
  pendingFiles[methodId] = croppedFile
  previews[methodId] = URL.createObjectURL(croppedFile)
}

function reopenCrop(method: DonationMethod) {
  const existing = pendingFiles[method.id]
  if (!existing) return
  // A fresh object URL for this crop session — independent of `previews`, so
  // cancelling doesn't revoke the URL the card's thumbnail is still using.
  cropTarget.value = { methodId: method.id, file: existing, src: URL.createObjectURL(existing) }
}

function removeQr(method: DonationMethod) {
  revokePreview(method.id)
  delete pendingFiles[method.id]
  method.qrUrl = ''
}

async function uploadQr(method: DonationMethod, file: File) {
  const item = await media.upload(file)
  if (!item?.url) throw new Error(`Could not upload QR for ${method.bank || 'donation method'}.`)
  return item.url
}

async function saveCard(method: DonationMethod, index: number) {
  if (savingId.value) return

  if (!method.bank.trim()) {
    cardMessages[method.id] = { text: 'This bank needs a name before saving.', type: 'error' }
    return
  }

  savingId.value = method.id
  delete cardMessages[method.id]

  try {
    const file = pendingFiles[method.id]
    if (file) {
      method.qrUrl = await uploadQr(method, file)
      delete pendingFiles[method.id]
      revokePreview(method.id)
    }

    await saveDonationMethod(method, index)

    cardMessages[method.id] = { text: 'Saved. The Support Us page is now updated.', type: 'success' }
  } catch (e) {
    cardMessages[method.id] = {
      text: e instanceof Error ? e.message : 'Failed to save this bank.',
      type: 'error',
    }
  } finally {
    savingId.value = null
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
                Manage the two banks shown on the public Support Us page — upload each bank's QR
                code and edit its account details. Changes go live as soon as you save.
              </p>
            </div>
          </header>

          <p v-if="loading" class="loading-note">Loading current settings...</p>

          <div v-else class="method-single">
            <div class="method-switcher" role="tablist" aria-label="Select bank to edit">
              <button
                v-for="(m, i) in methods"
                :key="m.id"
                type="button"
                role="tab"
                class="switch-tab"
                :class="{ active: i === activeIndex }"
                :aria-selected="i === activeIndex"
                @click="activeIndex = i"
              >
                <span class="tab-badge">{{ i + 1 }}</span>
                {{ i === 0 ? 'First bank' : 'Second bank' }}
              </button>
            </div>

            <article class="method-card">
              <header class="method-head" :style="{ background: activeMethod.headerColor }">
                <div class="head-copy">
                  <div class="bank-name">{{ activeMethod.bank || 'New bank' }}</div>
                  <div class="bank-subtitle">{{ activeMethod.subtitle || 'Bank subtitle' }}</div>
                </div>
              </header>

              <div class="method-body">
                <div class="method-body-col">
                  <div class="qr-preview" :style="{ borderColor: activeMethod.headerColor }">
                    <img
                      v-if="displayedQr(activeMethod)"
                      :src="displayedQr(activeMethod)"
                      :alt="`${activeMethod.bank || 'Bank'} donation QR code`"
                    />
                    <div v-else class="qr-empty">
                      <span class="qr-empty-icon" aria-hidden="true">&#9635;</span>
                      <span>No QR uploaded yet</span>
                    </div>
                    <span v-if="pendingFiles[activeMethod.id]" class="pending-tag"
                      >Not saved yet</span
                    >
                  </div>

                  <div class="qr-actions">
                    <label class="upload-btn">
                      <input
                        :id="`${activeMethod.id}-qr-upload`"
                        :name="`${activeMethod.id}-qr-upload`"
                        type="file"
                        accept="image/*"
                        class="sr-only"
                        @change="onFileChange(activeMethod, $event)"
                      />
                      {{ displayedQr(activeMethod) ? 'Replace QR image' : 'Upload QR image' }}
                    </label>
                    <button
                      v-if="pendingFiles[activeMethod.id]"
                      type="button"
                      class="crop-btn"
                      @click="reopenCrop(activeMethod)"
                    >
                      Adjust crop
                    </button>
                    <button
                      v-if="displayedQr(activeMethod)"
                      type="button"
                      class="remove-btn"
                      @click="removeQr(activeMethod)"
                    >
                      Remove QR
                    </button>
                  </div>
                </div>

                <div class="method-body-col fields-col">
                  <div class="field">
                    <label :for="`${activeMethod.id}-bank`">Bank name</label>
                    <input
                      :id="`${activeMethod.id}-bank`"
                      v-model="activeMethod.bank"
                      :name="`${activeMethod.id}-bank`"
                      placeholder="e.g. Wing Bank"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeMethod.id}-subtitle`">Subtitle</label>
                    <input
                      :id="`${activeMethod.id}-subtitle`"
                      v-model="activeMethod.subtitle"
                      :name="`${activeMethod.id}-subtitle`"
                      placeholder="e.g. WING BANK - CAMBODIA"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeMethod.id}-color`">Card color</label>
                    <div class="color-field">
                      <input
                        :id="`${activeMethod.id}-color`"
                        v-model="activeMethod.headerColor"
                        :name="`${activeMethod.id}-color`"
                        type="color"
                      />
                      <span class="color-value">{{ activeMethod.headerColor }}</span>
                    </div>
                  </div>
                  <div class="field">
                    <label :for="`${activeMethod.id}-account-name`">Account name</label>
                    <input
                      :id="`${activeMethod.id}-account-name`"
                      v-model="activeMethod.accountName"
                      :name="`${activeMethod.id}-account-name`"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeMethod.id}-account-no`">Account number</label>
                    <input
                      :id="`${activeMethod.id}-account-no`"
                      v-model="activeMethod.accountNo"
                      :name="`${activeMethod.id}-account-no`"
                    />
                  </div>
                  <div class="field">
                    <label :for="`${activeMethod.id}-currency`">Currency</label>
                    <input
                      :id="`${activeMethod.id}-currency`"
                      v-model="activeMethod.currency"
                      :name="`${activeMethod.id}-currency`"
                    />
                  </div>
                </div>
              </div>

              <footer class="card-save-bar">
                <p
                  v-if="cardMessages[activeMethod.id]"
                  :class="['save-message', cardMessages[activeMethod.id]?.type]"
                  role="status"
                >
                  {{ cardMessages[activeMethod.id]?.text }}
                </p>
                <button
                  class="save-btn"
                  type="button"
                  :disabled="savingId === activeMethod.id"
                  @click="saveCard(activeMethod, activeIndex)"
                >
                  {{ savingId === activeMethod.id ? 'Saving...' : 'Save changes' }}
                </button>
              </footer>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>

  <Teleport to="body">
    <ImageCropModal
      v-if="cropTarget"
      :image-src="cropTarget.src"
      :file-name="cropTarget.file.name"
      :mime-type="cropTarget.file.type || 'image/png'"
      @confirm="onCropConfirm"
      @cancel="closeCropTarget"
    />
  </Teleport>
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
  font-family: var(--font-family-base);
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

.loading-note {
  margin: 0;
  color: var(--admin-muted);
  font-weight: 600;
}

.method-single {
  display: grid;
  gap: 1rem;
}

.method-switcher {
  display: inline-flex;
  gap: 0.4rem;
  padding: 0.35rem;
  border: 1px solid var(--admin-border);
  border-radius: 12px;
  background: var(--admin-surface-soft);
  width: fit-content;
}

.switch-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  border: none;
  border-radius: 9px;
  background: transparent;
  color: var(--admin-muted);
  padding: 0.5rem 1.1rem;
  font-weight: 700;
  font-size: 0.86rem;
  cursor: pointer;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.switch-tab:hover {
  color: var(--admin-contrast);
}

.switch-tab.active {
  background: var(--admin-surface);
  color: var(--admin-contrast);
  box-shadow: var(--admin-shadow);
}

.tab-badge {
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: var(--admin-border);
  color: var(--admin-muted);
  font-size: 0.72rem;
  font-weight: 800;
  transition:
    background 0.18s ease,
    color 0.18s ease;
}

.switch-tab.active .tab-badge {
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
}

.method-card {
  width: 100%;
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

.method-body {
  padding: 1.4rem;
  display: grid;
  grid-template-columns: minmax(280px, 380px) 1fr;
  gap: 1.75rem;
  align-items: start;
}

.method-body-col {
  display: grid;
  gap: 1rem;
  align-content: start;
}

.fields-col {
  grid-template-columns: 1fr 1fr;
  align-content: start;
}

.fields-col .field:nth-child(1),
.fields-col .field:nth-child(2) {
  grid-column: 1 / -1;
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
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease;
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

.crop-btn {
  min-height: 42px;
  border: 1.5px solid var(--admin-border-strong);
  border-radius: 10px;
  background: var(--admin-surface-soft);
  color: var(--admin-text);
  padding: 0.5rem 1rem;
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: background 0.18s ease;
}

.crop-btn:hover {
  background: var(--admin-border);
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
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
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

.card-save-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.4rem 1.4rem;
  border-top: 1px solid var(--admin-border);
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
  transition:
    transform 0.12s ease,
    box-shadow 0.18s ease;
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

  .method-body {
    grid-template-columns: 1fr;
  }

  .fields-col {
    grid-template-columns: 1fr;
  }

  .fields-col .field:nth-child(1),
  .fields-col .field:nth-child(2) {
    grid-column: auto;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
