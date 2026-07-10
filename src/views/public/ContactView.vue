<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const sent = ref(false)

const canSubmit = computed(() =>
  Boolean(name.value.trim() && email.value.trim() && message.value.trim()),
)

const offices = [
  {
    id: 'head-office',
    title: 'Head Office',
    lines: ['Svay Rieng Town', 'Svay Rieng Province', 'Kingdom of Cambodia'],
  },
  {
    id: 'email',
    title: 'Email',
    lines: ['info@santisena.org', 'partnerships@santisena.org'],
  },
  {
    id: 'phone',
    title: 'Phone',
    lines: ['+855 (0) 12 345 678'],
  },
  {
    id: 'field-offices',
    title: 'Field offices',
    lines: ['Prey Veng Province', 'Kratie Province'],
  },
] as const

function submitContact() {
  if (!canSubmit.value) return
  sent.value = true
}

onMounted(() => {
  document.title = 'Contact Santi Sena'
})
</script>

<template>
  <div class="contact-page">
    <main>
      <section class="contact-hero" aria-labelledby="contact-heading">
        <div class="contact-hero__content">
          <p class="contact-hero__eyebrow">Contact</p>
          <h1 id="contact-heading">Write to us. We read every letter.</h1>
          <p>
            Whether you wish to partner, donate, visit or simply learn more - our team in Cambodia
            is ready to hear from you.
          </p>
        </div>
      </section>

      <section class="contact-body" aria-label="Contact form and office information">
        <div class="contact-body__inner">
          <form id="write" class="contact-card" @submit.prevent="submitContact">
            <h2>Send a message</h2>

            <div class="contact-card__row">
              <label>
                <span>Name</span>
                <input v-model="name" required autocomplete="name" />
              </label>

              <label>
                <span>Email</span>
                <input v-model="email" required type="email" autocomplete="email" />
              </label>
            </div>

            <label>
              <span>Subject</span>
              <input v-model="subject" autocomplete="off" />
            </label>

            <label>
              <span>Message</span>
              <textarea v-model="message" required rows="5"></textarea>
            </label>

            <div class="contact-card__actions">
              <button
                type="submit"
                class="contact-card__submit"
                :class="{ 'contact-card__submit--sent': sent }"
                :disabled="!canSubmit"
              >
                {{ sent ? 'Message sent' : 'Send message' }}
              </button>
              <p v-if="sent" role="status">Thank you. Your message is ready for our team.</p>
            </div>
          </form>

          <aside class="contact-details" aria-label="Office details">
            <section
              v-for="office in offices"
              :id="office.id"
              :key="office.title"
              class="contact-detail"
            >
              <h2>{{ office.title }}</h2>
              <p>
                <template v-for="line in office.lines" :key="line"> {{ line }}<br /> </template>
              </p>
            </section>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: var(--color-cream);
  color: var(--color-ink);
}

.contact-hero {
  position: relative;
  isolation: isolate;
  min-height: 530px;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: #4B5563;
  font-size: 0.9rem;
  font-weight: 600;
}
input,
textarea {
  background: #FFFFFF;
  border: 1px solid #D1D5DB;
  color: #1F2937;
  border-radius: 0.45rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(27, 163, 79, 0.12);
}
.primary {
  justify-self: start;
  background: var(--primary-color);
  border: none;
  color: #fff;
  padding: 0.65rem 1.5rem;
  border-radius: 0.45rem;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
  transition: background 0.2s, transform 0.15s;
}
.primary:hover {
  background: var(--primary-dark);
  transform: translateY(-1px);
  align-items: center;
  overflow: hidden;
}

.contact-hero::before {
  position: absolute;
  z-index: 1;
  inset: 0;
  background:
    linear-gradient(
      90deg,
      rgba(1, 47, 39, 0.96) 0%,
      rgba(5, 65, 55, 0.78) 46%,
      rgba(5, 65, 55, 0.34) 100%
    ),
    linear-gradient(180deg, rgba(2, 34, 29, 0.1), rgba(2, 34, 29, 0.28));
  content: '';
  pointer-events: none;
}

.contact-hero__content {
  position: relative;
  z-index: 2;
  width: min(100%, var(--container-max-width));
  margin: 0 auto;
  padding: 4rem var(--container-padding);
}

.contact-hero__eyebrow {
  margin: 0 0 1rem;
  color: var(--primary-color);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.contact-hero h1 {
  max-width: 720px;
  margin: 0;
  color: var(--color-white);
  font-weight: 700;
  line-height: 1.05;
}

.contact-hero p:last-child {
  max-width: 700px;
  margin: 1.45rem 0 0;
  color: var(--color-white);
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.45;
}

.contact-body {
  background: var(--color-cream);
  padding: 3.75rem var(--container-padding) 4.75rem;
}

.contact-body__inner {
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(260px, 1fr);
  gap: 3rem;
  width: min(100%, var(--container-max-width));
  margin: 0 auto;
}

.contact-card {
  display: grid;
  gap: 0.86rem;
  max-width: 680px;
  padding: 1.45rem 1.65rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.88);
  box-shadow: 0 18px 52px rgba(43, 43, 40, 0.12);
  scroll-margin-top: 7rem;
}

.contact-card h2,
.contact-detail h2 {
  margin: 0;
  color: var(--color-ink);
  font-weight: 700;
  line-height: 1.12;
}

.contact-card h2 {
  margin-bottom: 0.12rem;
}

.contact-card__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.contact-card label {
  display: grid;
  gap: 0.32rem;
  color: var(--color-ink);
  font-size: 0.84rem;
  font-weight: 500;
}

.contact-card input,
.contact-card textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-cream-soft);
  color: var(--color-ink);
  outline: none;
  padding: 0.44rem 0.65rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.contact-card input {
  height: 36px;
}

.contact-card textarea {
  height: 116px;
  min-height: 104px;
  resize: vertical;
}

.contact-card input:focus,
.contact-card textarea:focus {
  border-color: var(--primary-color);
  background: #fffaf2;
  box-shadow: 0 0 0 3px rgba(27, 163, 79, 0.16);
}

.contact-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  align-items: center;
  min-height: 40px;
  padding-top: 0.1rem;
}

.contact-card__submit {
  min-width: 164px;
  min-height: 50px;
  border: 0;
  border-radius: 999px;
  background: var(--primary-color);
  color: #fff6ea;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(27, 163, 79, 0.2);
  transition:
    box-shadow 0.2s ease,
    outline-color 0.2s ease;
}

.contact-card__submit:focus-visible {
  outline: 3px solid rgba(27, 163, 79, 0.26);
  outline-offset: 3px;
}

.contact-card__submit--sent:not(:disabled) {
  background: var(--primary-color);
  box-shadow: 0 14px 28px rgba(27, 163, 79, 0.2);
}

.contact-card__submit:disabled {
  background: #8da49d;
  cursor: not-allowed;
  opacity: 0.62;
  box-shadow: none;
}

.contact-card__actions p {
  margin: 0;
  color: var(--primary-dark);
  font-size: 0.86rem;
}

.contact-details {
  display: grid;
  align-content: start;
  gap: 1.65rem;
  padding-top: 0.2rem;
}

.contact-detail {
  scroll-margin-top: 7rem;
}

.contact-detail p {
  margin: 0.62rem 0 0;
  color: var(--color-ink-soft);
  font-size: 0.98rem;
  line-height: 1.35;
}

@media (max-width: 1180px) {
  .contact-hero {
    min-height: 500px;
  }

  .contact-hero__content,
  .contact-body {
    padding-right: 4rem;
    padding-left: 4rem;
  }

  .contact-body__inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.45rem;
  }

  .contact-card {
    width: min(100%, 680px);
  }

  .contact-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .contact-hero {
    min-height: 420px;
  }

  .contact-hero__content,
  .contact-body {
    padding-right: 1.25rem;
    padding-left: 1.25rem;
  }

  .contact-hero__content {
    padding-top: 3rem;
    padding-bottom: 3rem;
  }

  .contact-hero p:last-child {
    margin-top: 1rem;
    font-size: 0.92rem;
  }

  .contact-body {
    padding-top: 2.75rem;
    padding-bottom: 3.5rem;
  }

  .contact-card {
    padding: 1.05rem;
  }

  .contact-card__row,
  .contact-details {
    grid-template-columns: 1fr;
  }

  .contact-detail p {
    font-size: 0.9rem;
  }
}
</style>
