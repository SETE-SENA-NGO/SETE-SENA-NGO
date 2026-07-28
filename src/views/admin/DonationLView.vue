<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
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
useAdminTheme()

// Exactly two fixed bank slots — banks can be edited but never added or
// removed, so the public Support Us page always shows the same two cards.
const methods = ref<DonationMethod[]>(defaultDonationMethods())
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

// Only one bank card is shown at a time; the switcher toggles between them.
const activeIndex = ref(0)
const activeMethod = computed<DonationMethod>(
  () => methods.value[activeIndex.value] ?? methods.value[0]!,
)

const loading = ref(true)
const savingId = ref<string | null>(null)
const cardMessages = reactive<Record<string, { text: string; type: 'success' | 'error' }>>({})
const fileInputRefs = reactive<Record<string, HTMLInputElement | null>>({})

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
  <v-app :class="['donation-admin', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="manager-main">
        <section class="donation-overview" aria-label="Donation QR settings">
          <header class="manager-hero">
            <div class="manager-title">
              <h1>Donation Banks & QR Codes</h1>
            </div>
            <p class="header-description">
              Manage the two banks shown on the public Support Us page — upload each bank's QR
              code and edit its account details. Changes go live as soon as you save.
            </p>
          </header>

          <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading current settings...</span>
          </div>

          <div v-else class="method-single">
            <div class="method-switcher" role="tablist" aria-label="Select bank to edit">
              <v-btn
                v-for="(m, i) in methods"
                :key="m.id"
                role="tab"
                variant="tonal"
                :color="i === activeIndex ? 'primary' : 'default'"
                :aria-selected="i === activeIndex"
                size="small"
                class="switch-tab"
                @click="activeIndex = i"
              >
                <v-icon start size="14">mdi-bank</v-icon>
                {{ i === 0 ? 'First bank' : 'Second bank' }}
              </v-btn>
            </div>

            <article class="method-card">
              <header class="method-head" :style="{ background: activeMethod.headerColor }">
                <v-icon start size="28" color="white">mdi-bank</v-icon>
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
                      <v-icon size="36" color="disabled">mdi-qrcode</v-icon>
                      <span>No QR uploaded yet</span>
                    </div>
                    <v-chip
                      v-if="pendingFiles[activeMethod.id]"
                      size="x-small"
                      color="warning"
                      class="pending-tag"
                    >Not saved yet</v-chip>
                  </div>

                  <div class="qr-actions">
                    <input
                      :id="`${activeMethod.id}-qr-upload`"
                      :ref="(el) => { if (el) fileInputRefs[activeMethod.id] = el as HTMLInputElement }"
                      type="file"
                      accept="image/*"
                      class="sr-only"
                      @change="onFileChange(activeMethod, $event)"
                    />
                    <v-btn
                      variant="tonal"
                      color="primary"
                      size="small"
                      :disabled="savingId === activeMethod.id"
                      @click="fileInputRefs[activeMethod.id]?.click()"
                    >
                      <v-icon start size="16">mdi-upload</v-icon>
                      {{ displayedQr(activeMethod) ? 'Replace QR image' : 'Upload QR image' }}
                    </v-btn>
                    <v-btn
                      v-if="pendingFiles[activeMethod.id]"
                      variant="tonal"
                      size="small"
                      :disabled="savingId === activeMethod.id"
                      @click="reopenCrop(activeMethod)"
                    >
                      <v-icon start size="16">mdi-crop</v-icon>
                      Adjust crop
                    </v-btn>
                    <v-btn
                      v-if="displayedQr(activeMethod)"
                      variant="tonal"
                      color="error"
                      size="small"
                      :disabled="savingId === activeMethod.id"
                      @click="removeQr(activeMethod)"
                    >
                      <v-icon start size="16">mdi-delete</v-icon>
                      Remove QR
                    </v-btn>
                  </div>
                </div>

                <div class="method-body-col fields-col">
                  <v-text-field
                    v-model="activeMethod.bank"
                    label="Bank name"
                    placeholder="e.g. Wing Bank"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="activeMethod.subtitle"
                    label="Subtitle"
                    placeholder="e.g. WING BANK - CAMBODIA"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                  />
                  <div class="color-field-wrap">
                    <label class="color-label">Card color</label>
                    <div class="color-field">
                      <input
                        v-model="activeMethod.headerColor"
                        type="color"
                        class="color-input"
                      />
                      <span class="color-value">{{ activeMethod.headerColor }}</span>
                    </div>
                  </div>
                  <v-text-field
                    v-model="activeMethod.accountName"
                    label="Account name"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="activeMethod.accountNo"
                    label="Account number"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                  />
                  <v-text-field
                    v-model="activeMethod.currency"
                    label="Currency"
                    placeholder="KHR / USD"
                    hide-details
                    density="comfortable"
                    variant="outlined"
                  />
                </div>
              </div>

              <footer class="card-save-bar">
                <div v-if="cardMessages[activeMethod.id]" class="save-message-wrap">
                  <v-alert
                    :type="cardMessages[activeMethod.id]?.type"
                    variant="tonal"
                    density="compact"
                    class="save-message"
                    closable
                    @click:close="delete cardMessages[activeMethod.id]"
                  >{{ cardMessages[activeMethod.id]?.text }}</v-alert>
                </div>
                <v-btn
                  color="primary"
                  :loading="savingId === activeMethod.id"
                  :disabled="savingId === activeMethod.id"
                  @click="saveCard(activeMethod, activeIndex)"
                >
                  <v-icon start size="18">mdi-content-save</v-icon>
                  {{ savingId === activeMethod.id ? 'Saving...' : 'Save changes' }}
                </v-btn>
              </footer>
            </article>
          </div>
        </section>
      </main>
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
  </v-app>
</template>

<style scoped>
.donation-admin {
  min-height: 100vh;
  background: var(--admin-bg);
  color: var(--admin-text);
  transition: padding-left 0.25s ease;
}

.admin-layout {
  min-height: 100vh;
  display: flex;
}

.manager-main {
  flex: 1;
  min-height: 100vh;
  padding: 1.5rem 2rem 2.5rem;
}

.donation-overview {
  display: grid;
  gap: 1.5rem;
}

.manager-hero {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 16px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
}

.manager-title {
  display: grid;
  gap: 0.5rem;
}

.manager-hero h1 {
  margin: 0;
  color: var(--admin-theme-contrast);
  font-size: 1.85rem;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.manager-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.header-description {
  margin: 0;
  color: var(--admin-theme-muted);
  line-height: 1.6;
  max-width: 640px;
  font-size: 0.92rem;
}

.method-single {
  display: grid;
  gap: 1rem;
}

.method-switcher {
  display: inline-flex;
  gap: 0.4rem;
  padding: 0.35rem;
  border: 1px solid var(--admin-theme-border);
  border-radius: 12px;
  background: var(--admin-theme-surface-soft);
  width: fit-content;
}

.switch-tab {
  text-transform: none;
  font-weight: 700;
}

.method-card {
  width: 100%;
  border: 1px solid var(--admin-theme-border);
  border-radius: 16px;
  background: var(--admin-theme-surface);
  box-shadow: var(--admin-theme-shadow);
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

.qr-preview {
  position: relative;
  border: 2px dashed;
  border-radius: 12px;
  min-height: 220px;
  display: grid;
  place-items: center;
  padding: 0.75rem;
  background: var(--admin-theme-surface-soft);
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
  color: var(--admin-theme-muted);
  font-size: 0.85rem;
  font-weight: 600;
}

.pending-tag {
  position: absolute;
  top: 0.6rem;
  right: 0.6rem;
}

.qr-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.color-field-wrap {
  display: grid;
  gap: 0.3rem;
}

.color-label {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--admin-theme-contrast-soft);
}

.color-field {
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.color-input {
  width: 3.2rem;
  height: 2.6rem;
  border: 1.5px solid var(--admin-theme-border-strong);
  border-radius: 10px;
  background: var(--admin-theme-surface);
  padding: 0.2rem;
  cursor: pointer;
}

.color-value {
  font-size: 0.86rem;
  font-weight: 700;
  color: var(--admin-theme-muted);
  text-transform: uppercase;
}

.card-save-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.4rem 1.4rem;
  border-top: 1px solid var(--admin-theme-border);
}

.save-message-wrap {
  flex: 1;
  min-width: 200px;
}

.save-message {
  margin: 0;
}

@media (min-width: 900px) {
  .donation-admin.sidebar-open {
    padding-left: 260px;
  }
}

@media (max-width: 760px) {
  .manager-main {
    padding: 1rem;
  }

  .manager-hero {
    padding: 1.1rem;
  }

  .method-body {
    grid-template-columns: 1fr;
  }

  .fields-col {
    grid-template-columns: 1fr;
  }

  .manager-hero h1 {
    font-size: 1.5rem;
  }
}
</style>
