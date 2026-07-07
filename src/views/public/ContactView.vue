<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const sent = ref(false)

const canSubmit = computed(() => Boolean(name.value.trim() && email.value.trim() && message.value.trim()))

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
            Whether you wish to partner, donate, visit or simply learn more - our team in
            Cambodia is ready to hear from you.
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
              <textarea v-model="message" required rows="8"></textarea>
            </label>

            <div class="contact-card__actions">
              <button type="submit" :disabled="!canSubmit">
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
                <template v-for="line in office.lines" :key="line">
                  {{ line }}<br />
                </template>
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
  --cream: #fbf4e8;
  --cream-card: #fffaf2;
  --cream-field: #fbf2e5;
  --green: #053d35;
  --green-soft: #2e554d;
  --orange: #f47b20;
  --border: #deccb3;
  --shadow: rgba(18, 48, 40, 0.12);
  --serif: Georgia, 'Times New Roman', serif;

  min-height: 100vh;
  background: var(--cream);
  color: var(--green);
  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
}

.contact-hero {
  min-height: 530px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background:
    linear-gradient(90deg, rgba(1, 47, 39, 0.96) 0%, rgba(5, 65, 55, 0.78) 46%, rgba(5, 65, 55, 0.32) 100%),
    linear-gradient(180deg, rgba(2, 34, 29, 0.12), rgba(2, 34, 29, 0.24)),
    url('https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=82')
      center 42% / cover;
}

.contact-hero__content {
  width: min(100%, 1540px);
  margin: 0 auto;
  padding: 4rem 8rem;
}

.contact-hero__eyebrow {
  margin: 0 0 1rem;
  color: var(--orange);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: uppercase;
}

.contact-hero h1 {
  max-width: 720px;
  margin: 0;
  color: #fff8ed;
  font-family: var(--serif);
  font-size: 3.8rem;
  font-weight: 700;
  line-height: 1.05;
}

.contact-hero p:last-child {
  max-width: 700px;
  margin: 1.45rem 0 0;
  color: #fff8ed;
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.45;
}

.contact-body {
  background: var(--cream);
  padding: 3.75rem 8rem 4.75rem;
}

.contact-body__inner {
  display: grid;
  grid-template-columns: minmax(0, 700px) minmax(260px, 1fr);
  gap: 3.6rem;
  width: min(100%, 1540px);
  margin: 0 auto;
}

.contact-card {
  display: grid;
  gap: 1.08rem;
  padding: 2rem 2.25rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.88);
  box-shadow: 0 22px 70px var(--shadow);
  scroll-margin-top: 7rem;
}

.contact-card h2,
.contact-detail h2 {
  margin: 0;
  color: var(--green);
  font-family: var(--serif);
  font-weight: 700;
  line-height: 1.12;
}

.contact-card h2 {
  margin-bottom: 0.3rem;
  font-size: 1.78rem;
}

.contact-card__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.contact-card label {
  display: grid;
  gap: 0.42rem;
  color: #123f37;
  font-size: 0.9rem;
  font-weight: 500;
}

.contact-card input,
.contact-card textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--cream-field);
  color: var(--green);
  outline: none;
  padding: 0.55rem 0.75rem;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.contact-card input {
  height: 41px;
}

.contact-card textarea {
  min-height: 132px;
  resize: vertical;
}

.contact-card input:focus,
.contact-card textarea:focus {
  border-color: var(--orange);
  background: #fffaf2;
  box-shadow: 0 0 0 3px rgba(244, 123, 32, 0.16);
}

.contact-card__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  min-height: 46px;
  padding-top: 0.1rem;
}

.contact-card button {
  min-width: 150px;
  min-height: 44px;
  border: 0;
  border-radius: 999px;
  background: var(--orange);
  color: #fff6ea;
  font-size: 0.92rem;
  font-weight: 700;
  box-shadow: 0 18px 38px rgba(244, 123, 32, 0.2);
}

.contact-card button:disabled {
  cursor: not-allowed;
  opacity: 0.32;
  box-shadow: 0 20px 45px rgba(244, 123, 32, 0.1);
}

.contact-card__actions p {
  margin: 0;
  color: #9e571e;
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

.contact-detail h2 {
  font-size: 1.52rem;
}

.contact-detail p {
  margin: 0.62rem 0 0;
  color: var(--green-soft);
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

  .contact-hero h1 {
    font-size: 3.25rem;
  }

  .contact-body__inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 2.45rem;
  }

  .contact-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .contact-hero {
    min-height: 420px;
    background-position: center top;
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

  .contact-hero h1 {
    font-size: 2.18rem;
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

  .contact-card h2 {
    font-size: 1.5rem;
  }

  .contact-card__row,
  .contact-details {
    grid-template-columns: 1fr;
  }

  .contact-detail h2 {
    font-size: 1.32rem;
  }

  .contact-detail p {
    font-size: 0.9rem;
  }
}
</style>
