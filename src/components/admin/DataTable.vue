<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    columns: { key: string; label: string }[]
    data: unknown[]
    selectable?: boolean
  }>(),
  {
    selectable: false,
  },
)

const emit = defineEmits<{
  'row-select': [row: unknown]
}>()

const rows = computed(() => props.data)

function cell(row: unknown, key: string) {
  return (row as Record<string, unknown>)[key]
}

function rowKey(row: unknown, index: number) {
  const record = row as Record<string, unknown>
  return String(record.id ?? record.slug ?? index)
}

function selectRow(row: unknown) {
  if (!props.selectable) return
  emit('row-select', row)
}
</script>

<template>
  <div class="data-table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th v-for="col in columns" :key="col.key">{{ col.label }}</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, idx) in rows"
          :key="rowKey(row, idx)"
          :class="{ 'is-selectable': selectable }"
          :tabindex="selectable ? 0 : undefined"
          @click="selectRow(row)"
          @keydown.enter.prevent="selectRow(row)"
        >
          <td v-for="col in columns" :key="col.key">{{ cell(row, col.key) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--admin-theme-border);
  border-radius: 0.5rem;
  background: var(--admin-theme-surface);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--admin-theme-border);
  font-size: 0.9rem;
  color: var(--admin-theme-text);
}
th {
  background: var(--admin-theme-surface-soft);
  color: var(--admin-theme-muted);
  font-weight: 700;
}
.is-selectable {
  cursor: pointer;
}
.is-selectable:hover,
.is-selectable:focus {
  background: color-mix(in srgb, var(--admin-theme-primary) 8%, transparent);
  outline: none;
}
</style>
