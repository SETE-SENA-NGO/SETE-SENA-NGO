<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const name = ref('')
const email = ref('')
const subject = ref('')
const message = ref('')
const sent = ref(false)
const activeHeroSlide = ref(0)
let heroSlideTimer: number | undefined

const canSubmit = computed(() =>
  Boolean(name.value.trim() && email.value.trim() && message.value.trim()),
)

const heroSlides = [
  {
    image:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1920&q=82',
    position: 'center 42%',
  },
  {
    image:
      'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1920&q=82',
    position: 'center 48%',
  },
  {
    image:
      'https://images.unsplash.com/photo-1534330207526-8e81f10ec6fc?auto=format&fit=crop&w=1920&q=82',
    position: 'center 46%',
  },
] as const

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

function showHeroSlide(index: number) {
  activeHeroSlide.value = index
}

onMounted(() => {
  document.title = 'Contact Santi Sena'
  heroSlideTimer = window.setInterval(() => {
    activeHeroSlide.value = (activeHeroSlide.value + 1) % heroSlides.length
  }, 5200)
})

onBeforeUnmount(() => {
  if (heroSlideTimer) {
    window.clearInterval(heroSlideTimer)
  }
})
</script>

<template>
  <div class="contact-page">
    <main>
      <section class="contact-hero" aria-labelledby="contact-heading">
        <div class="contact-hero__slides" aria-hidden="true">
          <div
            v-for="(slide, index) in heroSlides"
            :key="slide.image"
            class="contact-hero__slide"
            :class="{ 'contact-hero__slide--active': index === activeHeroSlide }"
            :style="{ backgroundImage: `url(${slide.image})`, backgroundPosition: slide.position }"
          ></div>
        </div>

        <div class="contact-hero__content">
          <p class="contact-hero__eyebrow">Contact</p>
          <h1 id="contact-heading">Write to us. We read every letter.</h1>
          <p>
            Whether you wish to partner, donate, visit or simply learn more - our team in Cambodia
            is ready to hear from you.
          </p>
          <div class="contact-hero__dots" aria-label="Choose header image">
            <button
              v-for="(_, index) in heroSlides"
              :key="index"
              type="button"
              :aria-label="`Show header image ${index + 1}`"
              :aria-pressed="index === activeHeroSlide"
              :class="{ 'contact-hero__dot--active': index === activeHeroSlide }"
              @click="showHeroSlide(index)"
            ></button>
          </div>
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
  position: relative;
  isolation: isolate;
  min-height: 530px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--green);
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

.contact-hero__slides,
.contact-hero__slide {
  position: absolute;
  inset: 0;
}

.contact-hero__slides {
  z-index: 0;
}

.contact-hero__slide {
  background-repeat: no-repeat;
  background-size: cover;
  opacity: 0;
  transform: scale(1.04);
  transition:
    opacity 1.1s ease,
    transform 7s ease;
}

.contact-hero__slide--active {
  opacity: 1;
  transform: scale(1);
}

.contact-hero__content {
  position: relative;
  z-index: 2;
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

.contact-hero__dots {
  display: flex;
  gap: 0.58rem;
  margin-top: 1.8rem;
}

.contact-hero__dots button {
  width: 0.78rem;
  height: 0.78rem;
  border: 1px solid rgba(255, 248, 237, 0.82);
  border-radius: 50%;
  background: rgba(255, 248, 237, 0.34);
  padding: 0;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.contact-hero__dots button:hover,
.contact-hero__dots button:focus-visible,
.contact-hero__dot--active {
  border-color: var(--orange);
  background: var(--orange);
  transform: scale(1.12);
}

.contact-hero__dots button:focus-visible {
  outline: 3px solid rgba(255, 248, 237, 0.42);
  outline-offset: 3px;
}

.contact-body {
  background: var(--cream);
  padding: 3.75rem 8rem 4.75rem;
}

.contact-body__inner {
  display: grid;
  grid-template-columns: minmax(0, 600px) minmax(260px, 1fr);
  gap: 3rem;
  width: min(100%, 1200px);
  margin: 0 auto;
}

.contact-card {
  display: grid;
  gap: 0.86rem;
  max-width: 680px;
  padding: 1.45rem 1.65rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 250, 242, 0.88);
  box-shadow: 0 18px 52px var(--shadow);
  scroll-margin-top: 7rem;
}
<<<<<<< HEAD

.contact-card h2,
.contact-detail h2 {
  margin: 0;
  color: var(--green);
  font-family: var(--serif);
  font-weight: 700;
  line-height: 1.12;
}

.contact-card h2 {
  margin-bottom: 0.12rem;
  font-size: 1.52rem;
}

.contact-card__row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
}

.contact-card label {
  display: grid;
  gap: 0.32rem;
  color: #123f37;
  font-size: 0.84rem;
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
  border-color: var(--orange);
  background: #fffaf2;
  box-shadow: 0 0 0 3px rgba(244, 123, 32, 0.16);
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
  background: #ff781f;
  color: #fff6ea;
  font-size: 1rem;
  font-weight: 700;
  box-shadow: 0 14px 28px rgba(255, 120, 31, 0.2);
  transition:
    box-shadow 0.2s ease,
    outline-color 0.2s ease;
}

.contact-card__submit:focus-visible {
  outline: 3px solid rgba(255, 120, 31, 0.26);
  outline-offset: 3px;
}

.contact-card__submit--sent:not(:disabled) {
  background: #ff781f;
  box-shadow: 0 14px 28px rgba(255, 120, 31, 0.2);
}

.contact-card__submit:disabled {
  background: #8da49d;
  cursor: not-allowed;
  opacity: 0.62;
  box-shadow: none;
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
=======
.primary {
  justify-self: start;
  background: var(--green);
  border: 1px solid var(--green-dark);
  color: #fff;
  padding: 0.55rem 1.2rem;
  border-radius: 0.45rem;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s, transform 0.15s;
}
.primary:hover {
  background: var(--green-dark);
  transform: translateY(-1px);
>>>>>>> 80aef6b07918b6211b72b11bd830c3f88ae3c125
}
</style>
