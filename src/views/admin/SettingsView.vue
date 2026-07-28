<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useUiStore } from '@/stores/ui.store'
import { useAuthStore } from '@/stores/auth.store'
import { supabase } from '@/lib/supabase'

const ui = useUiStore()
const auth = useAuthStore()

// The logged-in admin's email is real, known data (already shown in
// AdminHeader) - showing it here read-only is more honest than the old
// plain <input> that looked editable but never saved anywhere.
const adminEmail = computed(() => auth.user?.email ?? '')

const SITE_NAME_KEY = 'site.name'
const siteName = ref('')
const siteNameLoading = ref(true)
const savingSiteName = ref(false)
const siteNameMessage = ref<{ text: string; type: 'success' | 'error' } | null>(null)

onMounted(async () => {
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', SITE_NAME_KEY)
      .maybeSingle()
    if (error) throw error
    siteName.value = typeof data?.value === 'string' ? data.value : ''
  } catch {
    // Leave the field blank - the general card just won't have a starting
    // value, saving still works from scratch.
  } finally {
    siteNameLoading.value = false
  }
})

async function saveSiteName() {
  if (savingSiteName.value) return

  const trimmed = siteName.value.trim()
  if (!trimmed) {
    siteNameMessage.value = { text: 'Site name cannot be empty.', type: 'error' }
    return
  }

  savingSiteName.value = true
  siteNameMessage.value = null

  try {
    const { error } = await supabase.from('site_settings').upsert(
      {
        key: SITE_NAME_KEY,
        label: 'Site name',
        value: trimmed,
        field_type: 'text',
        group_key: 'general',
        is_public: true,
        updated_by: auth.user?.id ?? null,
      },
      { onConflict: 'key' },
    )
    if (error) throw error

    siteName.value = trimmed
    siteNameMessage.value = { text: 'Site name saved.', type: 'success' }
    ui.addToast('Site name saved.', 'success')
  } catch (e) {
    siteNameMessage.value = {
      text: e instanceof Error ? e.message : 'Could not save site name.',
      type: 'error',
    }
  } finally {
    savingSiteName.value = false
  }
}

const MIN_PASSWORD_LENGTH = 8

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const changingPassword = ref(false)
const passwordSuccess = ref('')

// Per-field errors only surface once a field has been touched (blurred at
// least once, or a submit was attempted) so the form doesn't open with every
// field already showing "required" - same reasoning as blur-validated forms
// elsewhere. currentPasswordServerError is separate: it comes back from the
// actual reauth attempt on submit, not client-side shape checks, and clears
// as soon as the user edits the field again.
const touched = ref({ current: false, new: false, confirm: false })
const currentPasswordServerError = ref('')

function touch(field: 'current' | 'new' | 'confirm') {
  touched.value[field] = true
}

watch(currentPassword, () => {
  currentPasswordServerError.value = ''
})

const currentPasswordError = computed(() => {
  if (currentPasswordServerError.value) return currentPasswordServerError.value
  if (!touched.value.current) return ''
  if (!currentPassword.value) return 'Current password is required.'
  return ''
})

const newPasswordError = computed(() => {
  if (!touched.value.new) return ''
  if (!newPassword.value) return 'New password is required.'
  if (newPassword.value.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (currentPassword.value && newPassword.value === currentPassword.value) {
    return 'New password must be different from your current password.'
  }
  return ''
})

const confirmPasswordError = computed(() => {
  if (!touched.value.confirm) return ''
  if (!confirmPassword.value) return 'Please confirm your new password.'
  if (confirmPassword.value !== newPassword.value) return 'Passwords do not match.'
  return ''
})

const isPasswordFormValid = computed(
  () =>
    currentPassword.value.length > 0 &&
    newPassword.value.length >= MIN_PASSWORD_LENGTH &&
    newPassword.value !== currentPassword.value &&
    confirmPassword.value.length > 0 &&
    confirmPassword.value === newPassword.value,
)

async function changePassword() {
  touched.value = { current: true, new: true, confirm: true }
  currentPasswordServerError.value = ''
  passwordSuccess.value = ''

  if (changingPassword.value || !isPasswordFormValid.value) return

  const email = auth.user?.email
  if (!email) {
    currentPasswordServerError.value = 'Could not determine your account email. Please log in again.'
    return
  }

  changingPassword.value = true
  try {
    // Re-verify the current password before allowing a change, so an
    // unattended open session can't have its password swapped by someone
    // else at the desk. Supabase has no "check password without touching
    // the session" call, so this just re-signs-in with it.
    const { error: reauthError } = await supabase.auth.signInWithPassword({
      email,
      password: currentPassword.value,
    })
    if (reauthError) {
      currentPasswordServerError.value = 'Current password is incorrect.'
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword.value })
    if (error) throw error

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
    touched.value = { current: false, new: false, confirm: false }
    passwordSuccess.value = 'Password changed successfully.'
    ui.addToast('Password changed.', 'success')
  } catch (e) {
    currentPasswordServerError.value = e instanceof Error ? e.message : 'Could not change password.'
  } finally {
    changingPassword.value = false
  }
}
</script>

<template>
  <div :class="['admin-page', { 'sidebar-open': ui.sidebarOpen }]">
    <AdminHeader />
    <div class="admin-layout">
      <AdminSidebar />
      <main class="main">
        <section class="settings-overview" aria-label="Settings">
          <header class="settings-header">
            <p class="eyebrow">Administration</p>
            <h1>Settings</h1>
            <p>Manage your admin panel configuration and preferences.</p>
          </header>

          <div class="settings-grid">
            <article class="settings-card">
              <header>
                <span class="settings-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <circle cx="12" cy="12" r="3" />
                    <path
                      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
                    />
                  </svg>
                </span>
                <h2>General</h2>
              </header>
              <div class="settings-field">
                <label for="site-name">Site name</label>
                <input
                  id="site-name"
                  v-model="siteName"
                  name="site-name"
                  :disabled="siteNameLoading || savingSiteName"
                  :placeholder="siteNameLoading ? 'Loading...' : 'e.g. Santi Sena NGO'"
                />
              </div>
              <div class="settings-field">
                <label for="admin-email">Signed in as</label>
                <input id="admin-email" :value="adminEmail" name="admin-email" type="email" disabled />
              </div>

              <p
                v-if="siteNameMessage"
                :class="['settings-message', siteNameMessage.type]"
                role="status"
              >
                {{ siteNameMessage.text }}
              </p>

              <button
                class="settings-btn"
                type="button"
                :disabled="siteNameLoading || savingSiteName"
                @click="saveSiteName"
              >
                {{ savingSiteName ? 'Saving...' : 'Save changes' }}
              </button>
            </article>

            <article class="settings-card">
              <header>
                <span class="settings-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <h2>Security</h2>
              </header>
              <div class="settings-field">
                <p class="settings-label">Authentication</p>
                <p class="settings-note">Admin authentication is managed through Supabase.</p>
              </div>
              <div class="settings-field">
                <p class="settings-label">Session</p>
                <p class="settings-note">You are currently logged in as an administrator.</p>
              </div>
            </article>

            <article class="settings-card password-card">
              <header>
                <span class="settings-icon">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <circle cx="12" cy="16" r="1" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <h2>Change Password</h2>
              </header>

              <form class="password-form" novalidate @submit.prevent="changePassword">
                <div class="settings-field">
                  <label for="current-password">Current password</label>
                  <div class="password-input-wrap">
                    <input
                      id="current-password"
                      v-model="currentPassword"
                      name="current-password"
                      :type="showCurrentPassword ? 'text' : 'password'"
                      autocomplete="current-password"
                      placeholder="Enter your current password"
                      :aria-invalid="!!currentPasswordError"
                      :disabled="changingPassword"
                      @blur="touch('current')"
                    />
                    <button
                      type="button"
                      class="toggle-visibility-btn"
                      :aria-label="showCurrentPassword ? 'Hide current password' : 'Show current password'"
                      tabindex="-1"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <svg v-if="showCurrentPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  <p v-if="currentPasswordError" class="field-error">{{ currentPasswordError }}</p>
                </div>

                <div class="settings-field">
                  <label for="new-password">New password</label>
                  <div class="password-input-wrap">
                    <input
                      id="new-password"
                      v-model="newPassword"
                      name="new-password"
                      :type="showNewPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="At least 8 characters"
                      :aria-invalid="!!newPasswordError"
                      :disabled="changingPassword"
                      @blur="touch('new')"
                    />
                    <button
                      type="button"
                      class="toggle-visibility-btn"
                      :aria-label="showNewPassword ? 'Hide new password' : 'Show new password'"
                      tabindex="-1"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <svg v-if="showNewPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  <p v-if="newPasswordError" class="field-error">{{ newPasswordError }}</p>
                </div>

                <div class="settings-field">
                  <label for="confirm-password">Confirm new password</label>
                  <div class="password-input-wrap">
                    <input
                      id="confirm-password"
                      v-model="confirmPassword"
                      name="confirm-password"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      autocomplete="new-password"
                      placeholder="Re-enter your new password"
                      :aria-invalid="!!confirmPasswordError"
                      :disabled="changingPassword"
                      @blur="touch('confirm')"
                    />
                    <button
                      type="button"
                      class="toggle-visibility-btn"
                      :aria-label="showConfirmPassword ? 'Hide confirmation password' : 'Show confirmation password'"
                      tabindex="-1"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    </button>
                  </div>
                  <p v-if="confirmPasswordError" class="field-error">{{ confirmPasswordError }}</p>
                </div>

                <p v-if="passwordSuccess" class="settings-message success" role="status">
                  {{ passwordSuccess }}
                </p>

                <div class="password-form-actions">
                  <button
                    class="settings-btn"
                    type="submit"
                    :disabled="changingPassword || !isPasswordFormValid"
                  >
                    {{ changingPassword ? 'Changing password...' : 'Change Password' }}
                  </button>
                </div>
              </form>
            </article>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-bg-deep: var(--admin-theme-bg-deep);
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

:global(.admin-dark) .admin-page {
  --admin-bg: var(--admin-theme-bg);
  --admin-surface: var(--admin-theme-surface);
  --admin-surface-soft: var(--admin-theme-surface-soft);
  --admin-border: var(--admin-theme-border);
  --admin-border-strong: var(--admin-theme-border-strong);
  --admin-text: var(--admin-theme-text);
  --admin-muted: var(--admin-theme-muted);
  --admin-contrast: var(--admin-theme-contrast);
  --admin-contrast-soft: var(--admin-theme-contrast-soft);
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

.settings-overview {
  display: grid;
  gap: 1.5rem;
}

.settings-header {
  display: grid;
  gap: 0.5rem;
  padding: 1.4rem 1.6rem;
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: linear-gradient(135deg, var(--admin-surface-soft), var(--admin-surface));
  box-shadow: var(--admin-shadow);
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

.settings-header p:not(.eyebrow) {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.6;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.1rem;
}

.settings-card {
  border: 1px solid var(--admin-border);
  border-radius: 16px;
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow);
  padding: 1.4rem;
  display: grid;
  gap: 1.5rem;
  align-content: start;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.settings-card:hover {
  transform: translateY(-2px);
  border-color: var(--admin-border-strong);
  box-shadow: 0 22px 44px rgba(16, 88, 51, 0.13);
}

.settings-card header {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  color: var(--admin-contrast);
  padding-bottom: 1rem;
  border-bottom: 1px dashed var(--admin-border);
}

.settings-icon {
  display: inline-grid;
  place-items: center;
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 11px;
  background: var(--admin-surface-soft);
  color: var(--admin-blue-deep);
  border: 1px solid rgba(22, 163, 74, 0.22);
  flex: 0 0 auto;
}

.settings-card h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--admin-contrast);
}

.settings-field {
  display: grid;
  gap: 0.4rem;
}

.settings-field label,
.settings-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--admin-form-label);
}

.settings-field input {
  min-height: 54px;
  border: 1px solid var(--admin-form-border);
  border-radius: var(--admin-form-radius);
  background: var(--admin-form-bg);
  color: var(--admin-text);
  padding: 1rem 1.25rem;
  font-size: 1rem;
  font-family: inherit;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.settings-field input::placeholder {
  color: var(--admin-form-placeholder);
}

@media (hover: hover) {
  .settings-field input:hover:not(:disabled):not(:focus) {
    border-color: var(--admin-form-border-hover);
  }
}

.settings-field input:focus {
  border-color: var(--admin-form-focus);
  box-shadow: 0 0 0 4px var(--admin-form-focus-shadow);
  outline: none;
}

.settings-field input:disabled {
  background: color-mix(in srgb, var(--admin-surface-soft) 60%, var(--admin-surface));
  color: var(--admin-muted);
  cursor: not-allowed;
}

.settings-note {
  margin: 0;
  font-size: 0.86rem;
  color: var(--admin-muted);
  line-height: 1.55;
  background: var(--admin-surface-soft);
  border: 1px solid var(--admin-border);
  border-radius: 10px;
  padding: 0.65rem 0.8rem;
}

.settings-btn {
  min-height: 44px;
  border: 1px solid var(--admin-blue);
  border-radius: 10px;
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  color: #ffffff;
  padding: 0.6rem 1.15rem;
  font-weight: 700;
  font-size: 0.9rem;
  cursor: pointer;
  justify-self: start;
  box-shadow: 0 12px 22px rgba(15, 125, 56, 0.25);
  transition:
    background 0.18s ease,
    transform 0.12s ease,
    box-shadow 0.18s ease;
}

.settings-btn:hover {
  background: linear-gradient(180deg, var(--admin-blue), var(--admin-blue-deep));
  transform: translateY(-1px);
  box-shadow: 0 16px 28px rgba(15, 125, 56, 0.3);
}

.settings-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
  transform: none;
  box-shadow: none;
}

.password-form {
  display: grid;
  gap: 1.5rem;
}

.password-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrap input {
  width: 100%;
  padding-right: 3rem;
}

.toggle-visibility-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.1rem;
  height: 2.1rem;
  border: none;
  border-radius: 6px;
  background: none;
  padding: 0;
  color: var(--admin-muted);
  cursor: pointer;
  transition:
    color 0.15s ease,
    background 0.15s ease;
}

.toggle-visibility-btn:hover {
  color: var(--admin-form-focus);
  background: color-mix(in srgb, var(--admin-form-focus) 10%, transparent);
}

.toggle-visibility-btn:focus-visible {
  outline: 2px solid var(--admin-form-focus);
  outline-offset: 2px;
}

.field-error {
  margin: 0;
  font-size: 0.8rem;
  font-weight: 600;
  color: #be123c;
}

:global(.admin-dark) .field-error {
  color: #fb7185;
}

.password-form-actions {
  display: flex;
  justify-content: flex-end;
}

.settings-message {
  margin: 0;
  font-size: 0.86rem;
  font-weight: 700;
}

.settings-message.success {
  color: var(--admin-blue-deep);
}

.settings-message.error {
  color: #be123c;
}

:global(.admin-dark) .settings-message.error {
  color: #fb7185;
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

  .settings-header {
    padding: 1.1rem;
  }

  .settings-grid {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
