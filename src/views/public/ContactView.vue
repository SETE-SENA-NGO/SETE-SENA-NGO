<script setup lang="ts">
import { ref } from 'vue'
import ContentBlock from '@/components/public/ContentBlock.vue'

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<template>
  <div class="public-page">
    <ContentBlock title="Contact">
      <form class="contact-form" @submit.prevent>
        <label>
          Name
          <input v-model="name" />
        </label>
        <label>
          Email
          <input v-model="email" type="email" />
        </label>
        <label>
          Message
          <textarea v-model="message" rows="5" />
        </label>
        <button type="submit" class="primary">Send</button>
      </form>
    </ContentBlock>
  </div>
</template>

<style scoped>
.public-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.contact-form {
  display: grid;
  gap: 0.75rem;
  max-width: 600px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  color: var(--muted);
  font-size: 0.9rem;
}
input,
textarea {
  background: #0c0c0e;
  border: 1px solid var(--border);
  color: var(--text);
  border-radius: 0.45rem;
  padding: 0.6rem;
}
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
}
</style>
