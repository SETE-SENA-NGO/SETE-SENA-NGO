<script setup lang="ts">
import { useContentEditor } from '@/composables/useContentEditor'
import type { PageContent } from '@/types/content'

const props = defineProps<{ page?: PageContent | null }>()
const { draft, save, reset } = useContentEditor(props.page || undefined)

async function onSubmit() {
  await save()
  reset(props.page || undefined)
}
</script>

<template>
  <form class="content-editor" @submit.prevent="onSubmit">
    <label>
      Slug
      <input v-model="draft.slug" required />
    </label>
    <label>
      Title
      <input v-model="draft.title" required />
    </label>
    <label>
      Body
      <textarea v-model="draft.body" rows="6" />
    </label>
    <button type="submit" class="primary">Save</button>
  </form>
</template>

<style scoped>
.content-editor {
  display: grid;
  gap: 0.75rem;
  max-width: 800px;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--muted);
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
  background: #27272a;
  border: 1px solid #3f3f46;
  color: var(--text);
  padding: 0.55rem 0.9rem;
  border-radius: 0.45rem;
}
</style>
