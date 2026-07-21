<script setup lang="ts">
import { RouterLink } from 'vue-router'
import logoUrl from '@/assets/santi_sena_logo.png'

const exploreLinks = [
  { label: 'About', to: '/about' },
  { label: 'Programs', to: '/programs' },
  { label: 'Impact', to: '/impact' },
  { label: 'Get Involved', to: '/get-involved' },
  { label: 'Contact', to: '/contact' },
]

const year = new Date().getFullYear()
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
          A Buddhist NGO founded in 1994, walking with Cambodian communities toward peace,
          sustainability and dignified livelihoods.
        </p>
        <p class="footer-provinces">Prey Chlak pagoda &middot; Svay Rieng</p>
      </div>

      <nav class="footer-col">
        <p class="footer-heading">Explore</p>
        <RouterLink
          v-for="link in exploreLinks"
          :key="link.label"
          :to="link.to"
          class="footer-link"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="footer-col">
        <p class="footer-heading">Contact</p>
        <p class="footer-line">Svay Rieng Province, Cambodia</p>
        <a href="mailto:info@santisena.org" class="footer-line footer-link-inline"
          >SANTISENAMONK@GMAIL.COM</a
        >
        <a href="tel:+855012345678" class="footer-line footer-link-inline">(+855-77) 65 54 64</a>
      </div>
    </div>

    <div class="footer-bottom">
      <p>&copy; {{ year }} Santi Sena Organization. All rights reserved.</p>
      <p>Registered NGO &middot; Partners: UNDP &middot; ADB &middot; Oxfam</p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  --green: var(--primary-color);
  --green-deep: var(--primary-dark);
  --cream: var(--color-white);
  --cream-soft: rgba(255, 255, 255, 0.85);
  --cream-muted: rgba(255, 255, 255, 0.6);
  --border: rgba(255, 255, 255, 0.14);

  background: var(--green-deep);
  color: var(--cream-soft);
}

.footer-inner {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 3.5rem 1.5rem 2.5rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
}

.footer-brand-row {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.1rem;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 999px;
  background: var(--cream);
  flex-shrink: 0;
}

.footer-logo img {
  width: 2.3rem;
  height: 2.3rem;
  object-fit: contain;
}

.footer-name {
  font-weight: 700;
  font-size: 1.4rem;
  color: var(--cream);
}

.footer-desc {
  max-width: 420px;
  margin: 0 0 1.25rem;
  font-size: 0.92rem;
  line-height: 1.7;
  color: var(--cream-soft);
}

.footer-provinces {
  margin: 0;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--cream-muted);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.footer-heading {
  margin: 0 0 0.3rem;
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--cream);
}

.footer-link {
  color: var(--cream-soft);
  text-decoration: none;
  font-size: 0.92rem;
  width: fit-content;
}

.footer-link:hover {
  color: var(--cream);
  text-decoration: underline;
}

.footer-line {
  margin: 0;
  font-size: 0.92rem;
  color: var(--cream-soft);
}

.footer-link-inline {
  text-decoration: none;
  width: fit-content;
}

.footer-link-inline:hover {
  color: var(--cream);
  text-decoration: underline;
}

.footer-bottom {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.8rem;
  color: var(--cream-muted);
}

.footer-bottom p {
  margin: 0;
}

@media (min-width: 768px) {
  .footer-inner {
    grid-template-columns: 1.6fr 1fr 1fr;
  }

  .footer-bottom {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
