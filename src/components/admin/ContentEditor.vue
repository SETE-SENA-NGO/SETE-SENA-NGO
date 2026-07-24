<script setup lang="ts">
import { watch } from 'vue'
import { useContentEditor } from '@/composables/useContentEditor'
import type { PageContent } from '@/types/content'

const props = defineProps<{ page?: PageContent | null }>()
const emit = defineEmits<{
  saved: [page: PageContent]
}>()

const { draft, save, reset } = useContentEditor()

watch(
  () => props.page,
  (page) => reset(page || undefined),
  { immediate: true },
)

async function onSubmit() {
  const savedPage = await save()
  emit('saved', savedPage)
}
</script>

<template>
  <form class="content-editor" @submit.prevent="onSubmit">
    <div class="editor-heading">
      <h2>{{ draft.id ? 'Edit page' : 'Create page' }}</h2>
      <p>
        Use slug <strong>get-involved</strong> or <strong>get-involved-partner</strong> for page
        JSON.
      </p>
    </div>
    <label>
      Slug
      <input id="content-editor-slug" v-model="draft.slug" name="content-editor-slug" required />
    </label>
    <label>
      Title
      <input id="content-editor-title" v-model="draft.title" name="content-editor-title" required />
    </label>
    <label>
      Body
      <textarea id="content-editor-body" v-model="draft.body" name="content-editor-body" rows="12" />
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
.editor-heading {
  display: grid;
  gap: 0.25rem;
}
.editor-heading h2,
.editor-heading p {
  margin: 0;
}
.editor-heading p {
  color: var(--muted);
  font-size: 0.9rem;
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
