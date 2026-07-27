<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import AdminConfirmDialog from '@/components/admin/AdminConfirmDialog.vue'
import ImageCropModal from '@/components/admin/ImageCropModal.vue'
import { useAdminTheme } from '@/composables/useAdminTheme'
import { useConfirmDialog } from '@/composables/useConfirmDialog'
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
const { open: confirmOpen, data: confirmData, confirm: confirmDialog } = useConfirmDialog()

useAdminTheme()

const methods = ref<DonationMethod[]>(defaultDonationMethods())
const pendingFiles = reactive<Record<string, File>>({})
const previews = reactive<Record<string, string>>({})

const activeIndex = ref(0)
const activeMethod = computed<DonationMethod>(
  () => methods.value[activeIndex.value] ?? methods.value[0]!,
)

const loading = ref(true)
const savingId = ref<string | null>(null)
const cardMessages = reactive<Record<string, { text: string; type: 'success' | 'error' }>>({})

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
    // defaults
  } finally {
    loading.value = false
  }
})

onBeforeUnmount(() => {
  for (const id of Object.keys(previews)) revokePreview(id)
  closeCropTarget()
})

function revokePreview(id: string) {
  if (previews[id]) { URL.revokeObjectURL(previews[id]); delete previews[id] }
}

function triggerFileUpload() {
  const el = document.getElementById(activeMethod.value.id + '-qr-upload')
  el?.click()
}

const activeQrSrc = computed(() => {
  const method = activeMethod.value
  return previews[method.id] || method.qrUrl || ''
})

const cropTarget = ref<{ methodId: string; file: File; src: string } | null>(null)

async function onFileChange(method: DonationMethod, event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!isAllowedImageFile(file)) { cardMessages[method.id] = { text: `Please choose ${imageUploadHelpText()}`, type: 'error' }; return }
  if (method.qrUrl && (await isSameImage(file, method.qrUrl))) { cardMessages[method.id] = { text: 'That image matches the current QR code — choose a different image to upload.', type: 'error' }; return }
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
  cropTarget.value = { methodId: method.id, file: existing, src: URL.createObjectURL(existing) }
}

function removeQr(method: DonationMethod) {
  revokePreview(method.id); delete pendingFiles[method.id]; method.qrUrl = ''
}

async function uploadQr(method: DonationMethod, file: File) {
  const item = await media.upload(file)
  if (!item?.url) throw new Error(`Could not upload QR for ${method.bank || 'donation method'}.`)
  return item.url
}

async function saveCard(method: DonationMethod, index: number) {
  if (savingId.value) return
  if (!method.bank.trim()) { cardMessages[method.id] = { text: 'This bank needs a name before saving.', type: 'error' }; return }
  savingId.value = method.id; delete cardMessages[method.id]
  try {
    const file = pendingFiles[method.id]
    if (file) { method.qrUrl = await uploadQr(method, file); delete pendingFiles[method.id]; revokePreview(method.id) }
    await saveDonationMethod(method, index)
    cardMessages[method.id] = { text: 'Saved. The Support Us page is now updated.', type: 'success' }
  } catch (e) {
    cardMessages[method.id] = { text: e instanceof Error ? e.message : 'Failed to save this bank.', type: 'error' }
  } finally { savingId.value = null }
}
</script>

<template>
  <v-app :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section class="donation-overview" aria-label="Donation QR settings">
          <header class="manager-hero">
            <div class="manager-title">
              <v-chip size="small" variant="tonal" color="primary" class="mb-1">Support Us</v-chip>
              <h1>Donation Banks & QR Codes</h1>
              <p class="text-body-2 text-medium-emphasis" style="max-width: 640px;">
                Manage the two banks shown on the public Support Us page — upload each bank's QR
                code and edit its account details. Changes go live as soon as you save.
              </p>
            </div>
          </header>

          <div v-if="loading" class="d-flex flex-column align-center justify-center pa-8 text-medium-emphasis">
            <v-progress-circular indeterminate color="primary" :size="40" :width="4" />
            <span class="mt-4 font-weight-bold">Loading current settings...</span>
          </div>

          <div v-else class="method-single">
            <div class="method-switcher" role="tablist" aria-label="Select bank to edit">
              <button v-for="(m, i) in methods" :key="m.id" type="button" role="tab"
                class="switch-tab" :class="{ active: i === activeIndex }"
                :aria-selected="i === activeIndex" @click="activeIndex = i">
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
                    <v-img v-if="activeQrSrc" :key="activeMethod.id" :src="activeQrSrc" :alt="`${activeMethod.bank || 'Bank'} donation QR code`" max-height="260" contain class="bg-white rounded-lg" />
                    <div v-else class="qr-empty">
                      <v-icon size="32" color="disabled">mdi-qrcode</v-icon>
                      <span class="text-body-2">No QR uploaded yet</span>
                    </div>
                    <span v-if="pendingFiles[activeMethod.id]" class="pending-tag">Not saved yet</span>
                  </div>

                  <div class="d-flex flex-wrap ga-2">
                    <v-btn variant="elevated" color="primary" @click="triggerFileUpload">
                      {{ activeQrSrc ? 'Replace QR image' : 'Upload QR image' }}
                    </v-btn>
                    <input :id="`${activeMethod.id}-qr-upload`" type="file" accept="image/*" class="d-none"
                      @change="onFileChange(activeMethod, $event)" />
                    <v-btn v-if="pendingFiles[activeMethod.id]" variant="tonal" @click="reopenCrop(activeMethod)">
                      Adjust crop
                    </v-btn>
                    <v-btn v-if="activeQrSrc" variant="tonal" color="error" @click="removeQr(activeMethod)">
                      Remove QR
                    </v-btn>
                  </div>
                </div>

                <div class="method-body-col fields-col">
                  <v-text-field v-model="activeMethod.bank" :id="`${activeMethod.id}-bank`" label="Bank name" placeholder="e.g. Wing Bank" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeMethod.subtitle" :id="`${activeMethod.id}-subtitle`" label="Subtitle" placeholder="e.g. WING BANK - CAMBODIA" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeMethod.headerColor" :id="`${activeMethod.id}-color`" label="Card color" type="color" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeMethod.accountName" :id="`${activeMethod.id}-account-name`" label="Account name" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeMethod.accountNo" :id="`${activeMethod.id}-account-no`" label="Account number" hide-details density="comfortable" variant="outlined" />
                  <v-text-field v-model="activeMethod.currency" :id="`${activeMethod.id}-currency`" label="Currency" hide-details density="comfortable" variant="outlined" />
                </div>
              </div>

              <v-divider />
              <div class="card-save-bar">
                <div v-if="cardMessages[activeMethod.id]" :class="['save-message', cardMessages[activeMethod.id]?.type]">
                  {{ cardMessages[activeMethod.id]?.text }}
                </div>
                <v-btn color="primary" variant="elevated" :loading="savingId === activeMethod.id" :disabled="savingId === activeMethod.id" @click="saveCard(activeMethod, activeIndex)">
                  {{ savingId === activeMethod.id ? 'Saving...' : 'Save changes' }}
                </v-btn>
              </div>
            </article>
          </div>
        </section>
      </main>
    </div>

    <AdminConfirmDialog v-model="confirmOpen" :title="confirmData.title" :body="confirmData.body" @confirm="confirmData.onConfirm()" />
  </v-app>

  <Teleport to="body">
    <ImageCropModal v-if="cropTarget" :image-src="cropTarget.src" :file-name="cropTarget.file.name"
      :mime-type="cropTarget.file.type || 'image/png'"
      @confirm="onCropConfirm" @cancel="closeCropTarget" />
  </Teleport>
</template>

<style scoped>
.admin-page { min-height: 100vh; background: var(--admin-bg); color: var(--admin-text); transition: padding-left 0.25s ease; }
.admin-layout { display: flex; min-height: 100vh; }
.main { flex: 1; width: 100%; padding: 2rem 2.25rem 2.5rem; }
.donation-overview { display: grid; gap: 1.5rem; }
.manager-hero {
  display: flex; align-items: center; justify-content: space-between; gap: 1.25rem;
  padding: 1.4rem 1.6rem; border: 1px solid var(--admin-theme-border); border-radius: 8px;
  background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow);
}
.manager-hero h1 { margin: 0 0 0.25rem; color: var(--admin-theme-contrast); font-size: 1.85rem; font-weight: 800; letter-spacing: -0.01em; }
.manager-title { display: grid; gap: 0.32rem; }
.manager-hero p { margin: 0; line-height: 1.6; }
.method-single { display: grid; gap: 1rem; }
.method-switcher {
  display: inline-flex; gap: 0.4rem; padding: 0.35rem;
  border: 1px solid var(--admin-theme-border); border-radius: 12px;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface));
  width: fit-content;
}
.switch-tab {
  display: inline-flex; align-items: center; gap: 0.5rem; min-height: 40px;
  border: none; border-radius: 9px; background: transparent; color: var(--admin-theme-muted);
  padding: 0.5rem 1.1rem; font-weight: 700; font-size: 0.86rem; cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}
.switch-tab:hover { color: var(--admin-theme-contrast); }
.switch-tab.active { background: var(--admin-theme-surface); color: var(--admin-theme-contrast); box-shadow: var(--admin-theme-shadow); }
.tab-badge {
  display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 999px;
  background: var(--admin-theme-border); color: var(--admin-theme-muted);
  font-size: 0.72rem; font-weight: 800;
  transition: background 0.18s ease, color 0.18s ease;
}
.switch-tab.active .tab-badge { background: var(--admin-theme-primary); color: #ffffff; }
.method-card {
  border: 1px solid var(--admin-theme-border); border-radius: 16px;
  background: var(--admin-theme-surface); box-shadow: var(--admin-theme-shadow);
  overflow: hidden; display: grid; align-content: start;
}
.method-head { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.4rem; color: #ffffff; }
.head-copy { min-width: 0; }
.bank-name { font-weight: 800; font-size: 1.05rem; }
.bank-subtitle { font-size: 0.7rem; letter-spacing: 0.04em; opacity: 0.85; }
.method-body { padding: 1.4rem; display: grid; grid-template-columns: minmax(280px, 380px) 1fr; gap: 1.75rem; align-items: start; }
.method-body-col { display: grid; gap: 1rem; align-content: start; }
.fields-col { grid-template-columns: 1fr 1fr; }
.fields-col > :nth-child(1),
.fields-col > :nth-child(2) { grid-column: 1 / -1; }
.qr-preview {
  position: relative; border: 2px dashed; border-radius: 12px; min-height: 220px;
  display: grid; place-items: center; padding: 0.75rem;
  background: color-mix(in srgb, var(--admin-theme-surface-soft) 55%, var(--admin-theme-surface));
}
.qr-empty { display: grid; gap: 0.35rem; justify-items: center; color: var(--admin-theme-muted); }
.pending-tag {
  position: absolute; top: 0.6rem; right: 0.6rem;
  background: #d9ad2f; color: #1d3d5c; font-size: 0.68rem; font-weight: 800;
  padding: 0.25rem 0.55rem; border-radius: 999px;
}
:global(.admin-dark) .pending-tag { background: rgba(217, 173, 47, 0.85); color: #0c1f1a; }
.card-save-bar {
  display: flex; flex-wrap: wrap; align-items: center; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.4rem;
}
.save-message { margin: 0 auto 0 0; font-weight: 700; font-size: 0.9rem; }
.save-message.success { color: var(--admin-theme-primary-deep); }
.save-message.error { color: #be123c; }
:global(.admin-dark) .save-message.error { color: #fb7185; }

@media (min-width: 900px) { .admin-page.sidebar-open { padding-left: 260px; } }
@media (max-width: 760px) {
  .main { padding: 1rem; }
  .manager-hero { padding: 1.1rem; }
  .method-body { grid-template-columns: 1fr; }
  .fields-col { grid-template-columns: 1fr; }
  .fields-col > :nth-child(1), .fields-col > :nth-child(2) { grid-column: auto; }
  .manager-hero h1 { font-size: 1.5rem; }
}
</style>
