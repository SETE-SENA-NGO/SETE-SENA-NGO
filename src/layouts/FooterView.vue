<script setup lang="ts">
import { RouterLink } from "vue-router";
import { useI18n } from "vue-i18n";
import { Facebook, HeartHandshake, Mail, MapPin, Phone } from "lucide-vue-next";
import logoUrl from "@/assets/santi_sena_logo.png";
import pncLogoUrl from "@/assets/pnc_logo.png";

const { t } = useI18n();

const exploreLinks = [
  { labelKey: "nav.about", to: "/about" },
  { labelKey: "nav.programs", to: "/programs" },
  { labelKey: "nav.getInvolved", to: "/get-involved" },
  { labelKey: "nav.contact", to: "/contact" },
];

const socialLinks = [
  {
    labelKey: "footer.facebook",
    href: "https://www.facebook.com/Santisenaorganization/",
    icon: Facebook,
  },
];

const year = new Date().getFullYear();
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

      <nav class="footer-col">
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
          <span>{{ t("footer.address") }}</span>
        </p>
        <a
          href="mailto:SANTISENAMONK@GMAIL.COM"
          class="footer-contact-item footer-link-inline"
        >
          <Mail :size="18" aria-hidden="true" />
          <span>SANTISENAMONK@GMAIL.COM</span>
        </a>
        <a
          href="tel:+85577655464"
          class="footer-contact-item footer-link-inline"
        >
          <Phone :size="18" aria-hidden="true" />
          <span>(+855-77) 65 54 64</span>
        </a>

        <div class="footer-social">
          <a
            v-for="social in socialLinks"
            :key="social.labelKey"
            :href="social.href"
            :aria-label="t(social.labelKey)"
            class="footer-social-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <component :is="social.icon" :size="18" />
          </a>
          <RouterLink to="/get-involved/donate" class="footer-donate-btn">
            <HeartHandshake :size="17" aria-hidden="true" />
            {{ t("actions.donate") }}
          </RouterLink>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ year }} {{ t("footer.rights") }}</p>
      <p>{{ t("footer.partners") }}</p>
      <p class="footer-credit">
        {{ t("footer.builtBy") }}
        <img
          :src="pncLogoUrl"
          alt="Passerelles Numériques Cambodia"
          class="footer-credit-logo"
        />
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

  position: relative;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(15, 143, 105, 0.24), rgba(8, 63, 51, 0) 34%),
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
  padding: 4.25rem var(--container-padding) 2.8rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.25rem;
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 0.95rem;
  margin-bottom: 1.25rem;
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
  font-weight: 700;
  font-size: 1.55rem;
  line-height: 1;
  color: var(--footer-cream);
}

.footer-desc {
  max-width: 440px;
  margin: 0 0 1.35rem;
  font-size: 0.98rem;
  line-height: 1.75;
  color: var(--footer-text);
}

.footer-provinces {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #b8dece;
}

.footer-social {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.7rem;
  margin-top: 0.45rem;
}

.footer-social-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.65rem;
  height: 2.65rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: var(--footer-cream);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition:
    transform 0.18s ease,
    background 0.18s ease,
    color 0.18s ease,
    border-color 0.18s ease;
}

.footer-social-link:hover {
  transform: translateY(-2px);
  background: var(--footer-cream);
  color: var(--primary-dark);
  border-color: var(--footer-cream);
}

.footer-donate-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  min-height: 2.65rem;
  padding: 0.55rem 1.15rem;
  border-radius: 999px;
  background: var(--footer-cream);
  color: var(--primary-dark);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.16);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    background 0.18s ease;
}

.footer-donate-btn:hover {
  transform: translateY(-2px);
  background: #fff8e7;
  box-shadow: 0 16px 28px rgba(0, 0, 0, 0.2);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.78rem;
}

.footer-heading {
  position: relative;
  margin: 0 0 0.5rem;
  padding-bottom: 0.7rem;
  font-weight: 700;
  font-size: 1.08rem;
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
  color: var(--footer-text);
  text-decoration: none;
  font-size: 0.95rem;
  width: fit-content;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.footer-link:hover {
  color: var(--footer-cream);
  transform: translateX(4px);
}

.footer-contact-item {
  display: grid;
  grid-template-columns: 1.1rem minmax(0, 1fr);
  align-items: start;
  gap: 0.7rem;
  margin: 0;
  color: var(--footer-text);
  font-size: 0.94rem;
  line-height: 1.55;
}

.footer-contact-item svg {
  margin-top: 0.1rem;
  color: #cbe9dc;
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
  padding: 1.35rem var(--container-padding) 1.5rem;
  border-top: 1px solid var(--footer-border);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: var(--footer-muted);
}

.footer-bottom p {
  margin: 0;
}

.footer-credit {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.footer-credit-logo {
  height: 2.45rem;
  width: auto;
  background: var(--footer-cream);
  border-radius: 6px;
  padding: 0.24rem 0.5rem;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.14);
}

@media (min-width: 768px) {
  .footer-inner {
    grid-template-columns: minmax(280px, 1.45fr) minmax(160px, 0.7fr) minmax(
        280px,
        1fr
      );
    align-items: start;
    gap: clamp(2.5rem, 6vw, 6rem);
  }

  .footer-bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    gap: 1.5rem;
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
</style>
