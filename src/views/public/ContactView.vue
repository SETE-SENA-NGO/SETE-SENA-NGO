<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const menu = ref(false)
const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const sent = ref(false)

const offices = [
  {
    title: 'Head Office',
    lines: ['Svay Rieng Town', 'Svay Rieng Province', 'Kingdom of Cambodia'],
  },
  {
    title: 'Email',
    lines: ['info@santisena.org', 'partnerships@santisena.org'],
  },
  {
    title: 'Phone',
    lines: ['+855 (0) 12 345 678'],
  },
  {
    title: 'Field offices',
    lines: ['Prey Veng Province', 'Kratie Province'],
  },
] as const

function submitContact() {
  sent.value = true
}

function closeMenu() {
  menu.value = false
}

onMounted(() => {
  document.title = 'Contact Santi Sena'
})
</script>

<template>
  <div class="contact-page">
    <header class="site-header">
      <div class="site-header__inner">
        <RouterLink class="brand" to="/" aria-label="Santi Sena home" @click="closeMenu">
          <span class="brand__mark" aria-hidden="true">
            <span class="brand__leaf"></span>
          </span>
          <span class="brand__text">
            <strong>Santi Sena</strong>
            <small>Peace Army . Cambodia</small>
          </span>
        </RouterLink>

        <button class="menu-button" type="button" @click="menu = !menu" aria-label="Toggle menu">
          <span class="menu-button__icon" aria-hidden="true"></span>
        </button>

        <nav :class="['site-nav', { 'site-nav--open': menu }]" aria-label="Primary navigation">
          <RouterLink to="/" class="site-nav__link" @click="closeMenu">Home</RouterLink>
          <RouterLink to="/about" class="site-nav__link site-nav__link--dropdown" @click="closeMenu">
            About
          </RouterLink>
          <RouterLink
            to="/services"
            class="site-nav__link site-nav__link--dropdown"
            @click="closeMenu"
          >
            Programs
          </RouterLink>
          <a href="#impact" class="site-nav__link site-nav__link--dropdown" @click="closeMenu">
            Impact
          </a>
          <a href="#get-involved" class="site-nav__link site-nav__link--dropdown" @click="closeMenu">
            Get Involved
          </a>
          <RouterLink
            to="/contact"
            class="site-nav__link site-nav__link--active site-nav__link--dropdown"
            aria-current="page"
            @click="closeMenu"
          >
            Contact
          </RouterLink>
        </nav>

        <div class="site-actions">
          <button class="language-button" type="button" aria-label="Change language">
            <span class="language-button__flag" aria-hidden="true"></span>
            <span class="language-button__chevron" aria-hidden="true"></span>
          </button>
          <a class="support-button" href="#support">Support Us <span aria-hidden="true">&rarr;</span></a>
        </div>
      </div>
    </header>

    <main>
      <section class="contact-hero" aria-labelledby="contact-heading">
        <div class="contact-hero__inner">
          <div class="contact-hero__copy">
            <span class="contact-hero__eyebrow">Contact</span>
            <h1 id="contact-heading">Write to us. We read every letter.</h1>
            <p>
              Whether you wish to partner, donate, visit or simply learn more - our team in
              Cambodia is ready to hear from you.
            </p>
          </div>
        </div>
      </section>

      <section class="contact-section" aria-label="Contact form and office information">
        <form class="contact-form" @submit.prevent="submitContact">
          <div class="contact-form__header">
            <span>Send a message</span>
            <p>Share a few details and our team will follow up.</p>
          </div>

          <div class="contact-form__grid">
            <label>
              <span>Name</span>
              <input v-model="name" required autocomplete="name" />
            </label>
            <label>
              <span>Email</span>
              <input v-model="email" type="email" required autocomplete="email" />
            </label>
          </div>

          <label>
            <span>Subject</span>
            <input v-model="subject" autocomplete="off" />
          </label>

          <label>
            <span>Message</span>
            <textarea v-model="message" required rows="6"></textarea>
          </label>

          <div class="contact-form__actions">
            <button type="submit">{{ sent ? 'Thank you :)' : 'Send message' }}</button>
            <p v-if="sent" role="status">Your message is ready for the Santi Sena team.</p>
          </div>
        </form>

        <aside class="contact-details" aria-label="Office details">
          <div v-for="office in offices" :key="office.title" class="contact-detail">
            <h2>{{ office.title }}</h2>
            <p>
              <template v-for="line in office.lines" :key="line">
                {{ line }}<br />
              </template>
            </p>
          </div>
        </aside>
      </section>
    </main>

    <footer class="site-footer">
      <div class="site-footer__main">
        <div class="footer-brand">
          <div class="footer-brand__heading">
            <span class="brand__mark footer-brand__mark" aria-hidden="true">
              <span class="brand__leaf"></span>
            </span>
            <strong>Santi Sena</strong>
          </div>
          <p>
            A Buddhist NGO founded in 1994, walking with Cambodian communities toward peace,
            sustainability and dignified livelihoods.
          </p>
          <span class="footer-brand__places">Svay Rieng . Prey Veng . Kratie</span>
        </div>

        <nav class="footer-nav" aria-label="Footer navigation">
          <h2>Explore</h2>
          <RouterLink to="/about">About</RouterLink>
          <RouterLink to="/services">Programs</RouterLink>
          <a href="#impact">Impact</a>
          <a href="#get-involved">Get Involved</a>
          <RouterLink to="/contact" aria-current="page">Contact</RouterLink>
        </nav>

        <address class="footer-contact">
          <h2>Contact</h2>
          <p>Svay Rieng Province, Cambodia</p>
          <a href="mailto:info@santisena.org">info@santisena.org</a>
          <a href="tel:+85512345678">+855 (0) 12 345 678</a>
        </address>
      </div>

      <div class="site-footer__bottom">
        <p>&copy; 2026 Santi Sena Organization. All rights reserved.</p>
        <p>Registered NGO . Partners: UNDP . ADB . Oxfam</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f8efdf;
  color: #143d33;
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: #f8efdf;
  box-shadow: 0 1px 0 rgba(20, 61, 51, 0.08);
}

.site-header__inner {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 2rem;
  align-items: center;
  max-width: 1540px;
  min-height: 88px;
  margin: 0 auto;
  padding: 0 2rem;
}

.brand {
  display: inline-flex;
  gap: 1rem;
  align-items: center;
  color: #0b2f27;
  text-decoration: none;
}

.brand__mark {
  position: relative;
  display: grid;
  width: 50px;
  height: 50px;
  place-items: center;
  border: 2px solid #7daa64;
  border-radius: 50%;
  background:
    radial-gradient(circle at 50% 42%, #f8fff0 0 32%, transparent 33%),
    #eff8e9;
  box-shadow: inset 0 0 0 4px #f8efdf;
}

.brand__mark::before,
.brand__mark::after {
  position: absolute;
  content: '';
  border-radius: 50%;
}

.brand__mark::before {
  inset: 5px;
  border: 1px solid rgba(42, 117, 48, 0.45);
}

.brand__mark::after {
  bottom: 8px;
  width: 28px;
  height: 9px;
  border-radius: 999px;
  background: #2f7d32;
}

.brand__leaf {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 24px 24px 24px 4px;
  background: #22843a;
  transform: rotate(-45deg);
}

.brand__leaf::before,
.brand__leaf::after {
  position: absolute;
  content: '';
  background: rgba(255, 255, 255, 0.65);
}

.brand__leaf::before {
  top: 4px;
  left: 11px;
  width: 2px;
  height: 17px;
  transform: rotate(45deg);
}

.brand__leaf::after {
  top: 11px;
  left: 5px;
  width: 14px;
  height: 2px;
}

.brand__text {
  display: grid;
  gap: 0.1rem;
}

.brand__text strong {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.6rem;
  line-height: 1;
}

.brand__text small {
  color: #68746d;
  font-size: 0.78rem;
  text-transform: uppercase;
}

.site-nav {
  display: flex;
  gap: 2.2rem;
  align-items: center;
  justify-content: center;
}

.site-nav__link {
  position: relative;
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  color: #344e43;
  font-size: 1.02rem;
  font-weight: 500;
  text-decoration: none;
  white-space: nowrap;
}

.site-nav__link--dropdown::after,
.language-button__chevron {
  width: 0.42rem;
  height: 0.42rem;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  content: '';
  transform: translateY(-2px) rotate(45deg);
}

.site-nav__link--active {
  color: #f47a20;
}

.site-nav__link--active::before {
  position: absolute;
  right: 0;
  bottom: -1rem;
  left: 0;
  height: 2px;
  background: #f47a20;
  content: '';
}

.site-actions {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.language-button,
.menu-button {
  display: inline-flex;
  align-items: center;
  border: 0;
  background: transparent;
  color: #344e43;
}

.language-button {
  gap: 0.7rem;
  padding: 0;
}

.language-button__flag {
  width: 46px;
  height: 46px;
  border: 3px solid #fff;
  border-radius: 50%;
  background:
    linear-gradient(90deg, transparent 42%, #fff 42% 58%, transparent 58%),
    linear-gradient(0deg, transparent 42%, #fff 42% 58%, transparent 58%),
    linear-gradient(90deg, transparent 47%, #d8203f 47% 53%, transparent 53%),
    linear-gradient(0deg, transparent 47%, #d8203f 47% 53%, transparent 53%),
    linear-gradient(32deg, transparent 44%, #fff 44% 56%, transparent 56%),
    linear-gradient(-32deg, transparent 44%, #fff 44% 56%, transparent 56%),
    linear-gradient(32deg, transparent 48%, #d8203f 48% 52%, transparent 52%),
    linear-gradient(-32deg, transparent 48%, #d8203f 48% 52%, transparent 52%),
    #1b3274;
  box-shadow: 0 4px 12px rgba(20, 61, 51, 0.18);
}

.support-button {
  display: inline-flex;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  min-width: 170px;
  min-height: 50px;
  border-radius: 999px;
  background: #f58224;
  color: #fff;
  font-weight: 800;
  text-decoration: none;
  box-shadow: 0 14px 34px rgba(245, 130, 36, 0.22);
}

.menu-button {
  display: none;
  justify-self: end;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 1px solid rgba(20, 61, 51, 0.16);
  border-radius: 8px;
  font-weight: 700;
}

.menu-button__icon,
.menu-button__icon::before,
.menu-button__icon::after {
  display: block;
  width: 18px;
  height: 2px;
  border-radius: 999px;
  background: currentColor;
  content: '';
}

.menu-button__icon {
  position: relative;
}

.menu-button__icon::before,
.menu-button__icon::after {
  position: absolute;
  left: 0;
}

.menu-button__icon::before {
  top: -6px;
}

.menu-button__icon::after {
  top: 6px;
}

.contact-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  height: clamp(460px, calc(100vh - 130px), 620px);
  background:
    linear-gradient(90deg, rgba(0, 42, 33, 0.94) 0%, rgba(0, 63, 51, 0.72) 45%, rgba(0, 34, 28, 0.95) 100%),
    linear-gradient(180deg, rgba(0, 42, 33, 0.1), rgba(0, 42, 33, 0.2)),
    url('https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1920&q=82')
      center 47% / cover;
}

.contact-hero::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  background:
    radial-gradient(circle at 64% 40%, rgba(255, 255, 255, 0.14), transparent 18rem),
    linear-gradient(90deg, rgba(0, 31, 25, 0.5), transparent 45%, rgba(0, 31, 25, 0.46));
  content: '';
}

.contact-hero__inner {
  display: flex;
  align-items: center;
  max-width: 1540px;
  height: 100%;
  margin: 0 auto;
  padding: 0 2rem;
}

.contact-hero__copy {
  width: min(830px, 100%);
  margin-top: 2rem;
}

.contact-hero__eyebrow {
  color: #ff8526;
  font-size: 1rem;
  font-weight: 800;
  text-transform: uppercase;
}

.contact-hero h1 {
  max-width: 840px;
  margin: 1.6rem 0 0;
  color: #fff7eb;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 4.7rem;
  font-weight: 700;
  line-height: 1.02;
}

.contact-hero p {
  max-width: 820px;
  margin: 2rem 0 0;
  color: #fff7eb;
  font-size: 1.45rem;
  font-weight: 500;
  line-height: 1.5;
}

.contact-section {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 4rem;
  max-width: 1180px;
  margin: 0 auto;
  padding: 4.5rem 1.25rem 6rem;
  background: #f8efdf;
}

.contact-form {
  display: grid;
  gap: 1.25rem;
  padding: 2rem;
  border: 1px solid rgba(20, 61, 51, 0.1);
  border-radius: 8px;
  background: #fffaf1;
  box-shadow: 0 24px 80px rgba(20, 61, 51, 0.08);
}

.contact-form__header span {
  color: #f47a20;
  font-size: 0.88rem;
  font-weight: 800;
  text-transform: uppercase;
}

.contact-form__header p {
  margin: 0.6rem 0 0;
  color: #66756e;
}

.contact-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.contact-form label {
  display: grid;
  gap: 0.5rem;
  color: #244f43;
  font-size: 0.92rem;
  font-weight: 700;
}

.contact-form input,
.contact-form textarea {
  width: 100%;
  border: 1px solid rgba(20, 61, 51, 0.16);
  border-radius: 8px;
  background: #fff;
  color: #143d33;
  outline: none;
  padding: 0.78rem 0.9rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;
}

.contact-form textarea {
  resize: vertical;
}

.contact-form input:focus,
.contact-form textarea:focus {
  border-color: #f47a20;
  background: #fffdf8;
  box-shadow: 0 0 0 3px rgba(244, 122, 32, 0.16);
}

.contact-form__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-top: 0.35rem;
}

.contact-form button {
  border: 0;
  border-radius: 999px;
  background: #f58224;
  color: #fff;
  padding: 0.85rem 1.35rem;
  font-weight: 800;
  box-shadow: 0 12px 30px rgba(245, 130, 36, 0.24);
}

.contact-form__actions p {
  margin: 0;
  color: #c55d14;
  font-size: 0.92rem;
}

.contact-details {
  display: grid;
  align-content: start;
  gap: 2rem;
}

.contact-detail {
  padding-bottom: 2rem;
  border-bottom: 1px solid rgba(20, 61, 51, 0.12);
}

.contact-detail h2 {
  margin: 0;
  color: #0d3d32;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 1.7rem;
}

.contact-detail p {
  margin: 0.8rem 0 0;
  color: #5d6e66;
  line-height: 1.8;
}

.site-footer {
  overflow: hidden;
  border-radius: 0 0 18px 18px;
  background: #0f463c;
  color: #fff7eb;
}

.site-footer__main {
  display: grid;
  grid-template-columns: minmax(320px, 1.3fr) minmax(170px, 0.45fr) minmax(270px, 0.8fr);
  gap: 5rem;
  max-width: 1540px;
  margin: 0 auto;
  padding: 5rem 2rem 4.8rem;
}

.footer-brand {
  max-width: 560px;
}

.footer-brand__heading {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.footer-brand__heading strong,
.site-footer h2 {
  margin: 0;
  color: #fff7eb;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 2rem;
  line-height: 1.1;
}

.footer-brand__mark {
  width: 60px;
  height: 60px;
  border-color: rgba(255, 247, 235, 0.82);
  box-shadow: inset 0 0 0 5px #f8efdf;
}

.footer-brand p {
  max-width: 520px;
  margin: 1.55rem 0 0;
  color: rgba(255, 247, 235, 0.86);
  font-size: 1.08rem;
  line-height: 1.6;
}

.footer-brand__places {
  display: block;
  margin-top: 2rem;
  color: rgba(255, 247, 235, 0.62);
  font-size: 0.94rem;
  font-weight: 700;
  text-transform: uppercase;
}

.footer-nav,
.footer-contact {
  display: grid;
  align-content: start;
  gap: 0.88rem;
}

.site-footer h2 {
  margin-bottom: 1rem;
  font-size: 1.45rem;
}

.footer-nav a,
.footer-contact a,
.footer-contact p {
  margin: 0;
  color: rgba(255, 247, 235, 0.82);
  font-size: 1.06rem;
  font-style: normal;
  line-height: 1.35;
  text-decoration: none;
}

.footer-nav a:hover,
.footer-contact a:hover {
  color: #f58224;
}

.site-footer__bottom {
  display: flex;
  gap: 2rem;
  justify-content: space-between;
  max-width: 1540px;
  margin: 0 auto;
  padding: 1.7rem 2rem;
  border-top: 1px solid rgba(255, 247, 235, 0.1);
}

.site-footer__bottom p {
  margin: 0;
  color: rgba(255, 247, 235, 0.62);
  font-size: 0.92rem;
}

@media (max-width: 1180px) {
  .site-header__inner {
    grid-template-columns: auto auto;
  }

  .menu-button {
    display: inline-flex;
  }

  .site-nav {
    position: absolute;
    top: 100%;
    right: 1rem;
    left: 1rem;
    display: none;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    padding: 0.75rem;
    border: 1px solid rgba(20, 61, 51, 0.12);
    border-radius: 8px;
    background: #fff8ec;
    box-shadow: 0 18px 48px rgba(20, 61, 51, 0.14);
  }

  .site-nav--open {
    display: flex;
  }

  .site-nav__link {
    justify-content: space-between;
    padding: 0.85rem;
  }

  .site-nav__link--active::before {
    bottom: 0.35rem;
    left: 0.85rem;
    width: 4rem;
  }

  .site-actions {
    grid-column: 1 / -1;
    justify-self: end;
  }

  .site-footer__main {
    grid-template-columns: 1fr 1fr;
  }

  .footer-brand {
    grid-column: 1 / -1;
  }
}

@media (max-width: 760px) {
  .site-header__inner {
    gap: 0.9rem;
    min-height: 78px;
    padding: 0.8rem 1rem;
  }

  .brand__mark {
    width: 42px;
    height: 42px;
  }

  .brand__text strong {
    font-size: 1.32rem;
  }

  .brand__text small {
    font-size: 0.64rem;
  }

  .site-actions {
    display: none;
  }

  .contact-hero {
    height: clamp(430px, calc(100vh - 120px), 540px);
  }

  .contact-hero__inner {
    padding: 0 1.25rem;
  }

  .contact-hero__copy {
    margin-top: 0;
  }

  .contact-hero h1 {
    margin-top: 1.2rem;
    font-size: 3rem;
    line-height: 1.08;
  }

  .contact-hero p {
    margin-top: 1.35rem;
    font-size: 1.08rem;
  }

  .contact-section {
    grid-template-columns: 1fr;
    gap: 3rem;
    padding-block: 3.5rem;
  }

  .contact-form {
    padding: 1.25rem;
  }

  .contact-form__grid {
    grid-template-columns: 1fr;
  }

  .site-footer {
    border-radius: 0;
  }

  .site-footer__main {
    grid-template-columns: 1fr;
    gap: 2.75rem;
    padding: 3.5rem 1.25rem;
  }

  .footer-brand__heading strong {
    font-size: 1.65rem;
  }

  .footer-brand p {
    font-size: 1rem;
  }

  .site-footer__bottom {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1.3rem 1.25rem;
  }
}
</style>
