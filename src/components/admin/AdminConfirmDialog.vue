<script setup lang="ts">
defineProps<{
  modelValue: boolean
  title: string
  body: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

function onConfirm() {
  emit('confirm')
  emit('update:modelValue', false)
}

function onCancel() {
  emit('update:modelValue', false)
}
</script>

<template>
  <v-dialog :model-value="modelValue" max-width="430" persistent @update:model-value="onCancel">
    <v-card>
      <v-card-title class="font-weight-bold">{{ title }}</v-card-title>
      <v-card-text class="text-body-2">{{ body }}</v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="tonal" @click="onCancel">Cancel</v-btn>
        <v-btn color="error" variant="elevated" @click="onConfirm">
          Confirm
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
