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
  border-color: #3A7D44;
  box-shadow: 0 0 0 3px rgba(58, 125, 68, 0.12);
}
.primary {
  justify-self: start;
  background: #3A7D44;
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
  background: #2D5E34;
  transform: translateY(-1px);
}
</style>
