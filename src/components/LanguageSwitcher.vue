<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronDown } from 'lucide-vue-next'
import FlagKH from '@/components/icons/FlagKH.vue'
import FlagUK from '@/components/icons/FlagUK.vue'
import { setLocale, type SupportedLocale } from '@/i18n'

const { locale, t } = useI18n()

const rootEl = ref<HTMLElement | null>(null)
const open = ref(false)

const defaultLanguage = {
  code: 'kh',
  labelKey: 'language.khmer',
  shortLabel: 'KH',
  icon: FlagKH,
} satisfies {
  code: SupportedLocale
  labelKey: string
  shortLabel: string
  icon: typeof FlagKH
}
const languageOptions = [
  defaultLanguage,
  { code: 'en', labelKey: 'language.english', shortLabel: 'EN', icon: FlagUK },
] satisfies Array<{
  code: SupportedLocale
  labelKey: string
  shortLabel: string
  icon: typeof FlagKH
}>

const currentLanguage = computed(
  () =>
    languageOptions.find((language) => language.code === locale.value) ??
    defaultLanguage,
)

function toggleMenu() {
  open.value = !open.value
}

function selectLanguage(code: SupportedLocale) {
  setLocale(code)
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (rootEl.value && !rootEl.value.contains(event.target as Node)) {
    open.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>
  <div ref="rootEl" class="language-switcher">
    <button
      type="button"
      class="language-trigger"
      :aria-label="t('language.label')"
      :aria-expanded="open"
      aria-haspopup="menu"
      @click.stop="toggleMenu"
    >
      <component :is="currentLanguage.icon" aria-hidden="true" />
      <span class="language-code">{{ currentLanguage.shortLabel }}</span>
      <ChevronDown class="language-chevron" aria-hidden="true" />
    </button>

    <div v-show="open" class="language-menu" role="menu">
      <div class="language-menu-card">
        <button
          v-for="language in languageOptions"
          :key="language.code"
          type="button"
          class="language-option"
          :class="{ 'is-active': language.code === locale }"
          role="menuitemradio"
          :aria-checked="language.code === locale"
          @click="selectLanguage(language.code)"
        >
          <component :is="language.icon" aria-hidden="true" />
          <span>{{ t(language.labelKey) }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.language-switcher {
  --language-switcher-text: var(--color-ink);
  --language-switcher-surface: var(--color-white);
  --language-switcher-border: var(--color-border);
  --language-switcher-hover: var(--primary-light);
  --language-switcher-accent: var(--primary-color);

  position: relative;
  flex-shrink: 0;
}

.language-trigger {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 999px;
  background: transparent;
  color: var(--language-switcher-text);
  padding: 0.35rem 0.5rem;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.language-trigger:hover,
.language-trigger[aria-expanded='true'] {
  border-color: var(--language-switcher-border);
  background: var(--language-switcher-surface);
  color: var(--language-switcher-accent);
}

.language-trigger :deep(.flag-icon),
.language-option :deep(.flag-icon) {
  width: 1.25rem;
  height: 0.8rem;
  border-radius: 2px;
  flex-shrink: 0;
}

.language-code {
  width: 1.35rem;
  font-size: 0.74rem;
  font-weight: 800;
  line-height: 1;
  text-align: center;
}

.language-chevron {
  width: 0.8rem;
  height: 0.8rem;
  stroke-width: 2.2;
}

.language-menu {
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 10;
  padding-top: 0.5rem;
}

.language-menu-card {
  min-width: 138px;
  border: 1px solid var(--language-switcher-border);
  border-radius: 0.6rem;
  background: var(--language-switcher-surface);
  box-shadow: 0 12px 28px rgba(31, 61, 46, 0.16);
  padding: 0.35rem;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  border: 0;
  border-radius: 0.4rem;
  background: transparent;
  color: var(--language-switcher-text);
  cursor: pointer;
  font-size: 0.88rem;
  padding: 0.45rem 0.55rem;
  text-align: left;
}

.language-option:hover,
.language-option.is-active {
  background: var(--language-switcher-hover);
  color: var(--language-switcher-accent);
}
</style>
