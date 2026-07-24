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
.editor-heading h2 {
  color: var(--admin-theme-contrast, #10241c);
}
.editor-heading p {
  color: var(--admin-theme-muted, #678074);
  font-size: 0.9rem;
}
label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--admin-theme-muted, #678074);
}
input,
textarea {
  background: var(--admin-theme-surface, #ffffff);
  border: 1px solid var(--admin-theme-border, #d4e5dc);
  color: var(--admin-theme-text, #31483e);
  border-radius: 0.45rem;
  padding: 0.6rem;
  font-family: inherit;
  font-size: inherit;
}
input:focus,
textarea:focus {
  border-color: var(--admin-theme-primary, #159a57);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--admin-theme-primary, #159a57) 15%, transparent);
}
.primary {
  justify-self: start;
  background: var(--admin-theme-surface, #ffffff);
  border: 1px solid var(--admin-theme-border-strong, #aecdbe);
  color: var(--admin-theme-text, #31483e);
  padding: 0.55rem 0.9rem;
  border-radius: 0.45rem;
  cursor: pointer;
  font-weight: 700;
  font-size: inherit;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.primary:hover {
  background: var(--admin-theme-surface-soft, #eef7f2);
  border-color: var(--admin-theme-primary, #159a57);
}
</style>
