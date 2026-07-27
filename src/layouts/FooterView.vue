<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { Mail, MapPin, Phone } from "lucide-vue-next";
import logoUrl from "@/assets/santi_sena_logo.png";
import pncLogoUrl from "@/assets/pnc_logo.png";
import type { SupportedLocale } from "@/i18n";
import {
  contactPageSlug,
  fallbackContactContent,
  mergeContactContent,
  parseContactCmsBody,
  type ContactPageContent,
} from "@/lib/contactContent";
import { useContentStore } from "@/stores/content.store";

const { t, locale } = useI18n();
const contentStore = useContentStore();

const exploreLinks = [
  { labelKey: "nav.about", to: "/about" },
  { labelKey: "nav.programs", to: "/programs" },
  { labelKey: "nav.getInvolved", to: "/get-involved" },
  { labelKey: "nav.contact", to: "/contact" },
];

const year = new Date().getFullYear();

const activeLocale = computed<SupportedLocale>(() =>
  locale.value === "kh" ? "kh" : "en",
);
const cmsContent = ref<Partial<ContactPageContent> | null>(null);
let stopCmsSubscription: (() => void) | null = null;

const headquarters = computed(
  () => mergeContactContent(fallbackContactContent, cmsContent.value).headquarters,
);
const contactEmail = computed(() => headquarters.value.email);
const contactPhone = computed(() => headquarters.value.phone);
const contactPhoneHref = computed(() => {
  const digits = contactPhone.value.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "";
});

async function loadContactContent() {
  try {
    const page = await contentStore.fetchBySlug(contactPageSlug, activeLocale.value);
    cmsContent.value = page ? parseContactCmsBody(page.body) : null;
  } catch {
    cmsContent.value = null;
  }
}

onMounted(async () => {
  stopCmsSubscription = contentStore.subscribeToSlug(contactPageSlug, () => {
    void loadContactContent();
  });
  await loadContactContent();
});

onUnmounted(() => {
  stopCmsSubscription?.();
  stopCmsSubscription = null;
});
</script>

<template>
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-brand-row">
          <span class="footer-logo">
            <img :src="logoUrl" alt="Santi Sena seal" />
          </span>
          <span class="footer-name">Santi Sena</span>
        </div>
        <p class="footer-desc">
          {{ t("footer.desc") }}
        </p>
        <p class="footer-provinces">{{ t("footer.provinces") }}</p>
      </div>

      <nav class="footer-col" aria-label="Footer navigation">
        <p class="footer-heading">{{ t("footer.explore") }}</p>
        <RouterLink
          v-for="link in exploreLinks"
          :key="link.labelKey"
          :to="link.to"
          class="footer-link"
        >
          {{ t(link.labelKey) }}
        </RouterLink>
      </nav>

      <div class="footer-col">
        <p class="footer-heading">{{ t("footer.contactHeading") }}</p>
        <p class="footer-contact-item">
          <MapPin :size="18" aria-hidden="true" />
          <span>{{ headquarters.address }}</span>
        </p>
        <a
          :href="`mailto:${contactEmail}`"
          class="footer-contact-item footer-link-inline"
        >
          <Mail :size="18" aria-hidden="true" />
          <span>{{ contactEmail }}</span>
        </a>
        <a
          :href="contactPhoneHref"
          class="footer-contact-item footer-link-inline"
        >
          <Phone :size="18" aria-hidden="true" />
          <span>{{ contactPhone }}</span>
        </a>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="footer-bottom-note">&copy; {{ year }} {{ t("footer.rights") }}</p>
      <p class="footer-bottom-note">{{ t("footer.partners") }}</p>
      <p
        class="footer-credit"
        :aria-label="`${t('footer.builtBy')} Passerelles Numériques Cambodia`"
      >
        <span class="footer-credit-label">{{ t("footer.builtBy") }}</span>
        <span class="footer-credit-mark">
          <img :src="pncLogoUrl" alt="" aria-hidden="true" />
        </span>
        <span class="footer-credit-name">Passerelles Numériques Cambodia</span>
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  --footer-bg: #083f33;
  --footer-bg-soft: #0b5f49;
  --footer-cream: #ffffff;
  --footer-text: rgba(255, 255, 255, 0.86);
  --footer-muted: rgba(255, 255, 255, 0.64);
  --footer-border: rgba(255, 255, 255, 0.14);
  --footer-accent: #d8b15a;
  --footer-accent-soft: rgba(216, 177, 90, 0.2);

  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(15, 143, 105, 0.28), rgba(8, 63, 51, 0) 36%),
    repeating-linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.025) 0,
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px,
      transparent 18px
    ),
    linear-gradient(
      135deg,
      var(--footer-bg-soft),
      var(--footer-bg) 58%,
      #062e27
    );
  color: var(--footer-text);
}

.site-footer::before {
  content: "";
  position: absolute;
  inset: 0 0 auto;
  height: 5px;
  background: linear-gradient(
    90deg,
    var(--footer-accent),
    #f2dfaa 48%,
    var(--primary-color)
  );
}

.site-footer::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  pointer-events: none;
}

.footer-inner {
  position: relative;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: clamp(3.4rem, 7vw, 4.8rem) var(--container-padding) 2.75rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.45rem;
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  margin-bottom: 1.25rem;
}

.footer-brand {
  max-width: 34rem;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3.4rem;
  height: 3.4rem;
  border-radius: 999px;
  background: var(--footer-cream);
  box-shadow:
    0 14px 30px rgba(0, 0, 0, 0.18),
    0 0 0 6px rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.footer-logo img {
  width: 2.55rem;
  height: 2.55rem;
  object-fit: contain;
}

.footer-name {
  font-weight: 800;
  font-size: 1.55rem;
  line-height: 1;
  color: var(--footer-cream);
}

.footer-desc {
  max-width: 440px;
  margin: 0 0 1.35rem;
  font-size: 0.98rem;
  line-height: 1.72;
  color: var(--footer-text);
}

.footer-provinces {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #b8dece;
}

.footer-link:focus-visible,
.footer-link-inline:focus-visible {
  outline: 2px solid #f2dfaa;
  outline-offset: 4px;
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.82rem;
  min-width: 0;
}

.footer-heading {
  position: relative;
  margin: 0 0 0.5rem;
  padding-bottom: 0.7rem;
  font-weight: 800;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--footer-cream);
}

.footer-heading::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 2.2rem;
  height: 2px;
  border-radius: 999px;
  background: var(--footer-accent);
}

.footer-link {
  position: relative;
  color: var(--footer-text);
  text-decoration: none;
  font-size: 0.95rem;
  line-height: 1.35;
  width: fit-content;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.footer-link::after {
  content: "";
  position: absolute;
  left: 0;
  right: 100%;
  bottom: -0.2rem;
  height: 1px;
  background: var(--footer-accent);
  transition: right 0.18s ease;
}

.footer-link:hover {
  color: var(--footer-cream);
  transform: translateX(4px);
}

.footer-link:hover::after {
  right: 0;
}

.footer-contact-item {
  display: grid;
  grid-template-columns: 2rem minmax(0, 1fr);
  align-items: start;
  gap: 0.78rem;
  margin: 0;
  color: var(--footer-text);
  font-size: 0.94rem;
  line-height: 1.55;
}

.footer-contact-item svg {
  width: 2rem;
  height: 2rem;
  margin-top: -0.15rem;
  padding: 0.42rem;
  color: #d6f1e5;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
}

.footer-link-inline {
  color: var(--footer-text);
  text-decoration: none;
  width: max-content;
  max-width: 100%;
}

.footer-link-inline:hover {
  color: var(--footer-cream);
}

.footer-link-inline span {
  overflow-wrap: anywhere;
}

.footer-bottom {
  position: relative;
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 1.1rem var(--container-padding) 1.3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.16);
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: var(--footer-muted);
}

.footer-bottom p {
  margin: 0;
}

.footer-bottom-note {
  line-height: 1.5;
}

.footer-credit {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.48rem;
  justify-self: start;
  width: fit-content;
  max-width: 100%;
  padding: 0.38rem 0.62rem 0.38rem 0.46rem;
  color: var(--footer-muted);
}

.footer-credit-label {
  line-height: 1.25;
}

.footer-credit-mark {
  display: inline-flex;
  width: 1.7rem;
  height: 1.7rem;
  overflow: hidden;
  border-radius: 50%;
  flex: 0 0 auto;
  background: #171717;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.18);
}

.footer-credit-mark img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: left center;
}

.footer-credit-name {
  color: var(--footer-cream);
  font-weight: 400;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

@media (min-width: 768px) {
  .footer-inner {
    grid-template-columns: minmax(280px, 1.2fr) minmax(160px, 0.7fr);
    align-items: start;
    gap: clamp(2.5rem, 6vw, 6rem);
  }

  .footer-col:last-child {
    grid-column: 1 / -1;
  }

  .footer-bottom {
    align-items: center;
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.75fr);
    gap: 1.5rem;
  }

  .footer-credit {
    grid-column: 1 / -1;
  }
}

@media (max-width: 767px) {
  .footer-inner {
    padding-top: 3.4rem;
  }

  .footer-name {
    font-size: 1.35rem;
  }

  .footer-bottom {
    align-items: flex-start;
  }
}

@media (min-width: 1024px) {
  .footer-inner {
    grid-template-columns: minmax(300px, 1.45fr) minmax(160px, 0.7fr) minmax(
        280px,
        1fr
      );
  }

  .footer-col:last-child {
    grid-column: auto;
  }

  .footer-col {
    height: 100%;
    padding-left: clamp(1.4rem, 3vw, 2.2rem);
    border-left: 1px solid rgba(255, 255, 255, 0.1);
  }

  .footer-bottom {
    grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr) max-content;
  }

  .footer-credit {
    grid-column: auto;
    justify-self: end;
  }
}
</style>
