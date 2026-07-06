<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  columns: { key: string; label: string }[]
  data: unknown[]
}>()

const rows = computed(() => props.data)

function cell(row: unknown, key: string) {
  return (row as Record<string, unknown>)[key]
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
        <tr v-for="(row, idx) in rows" :key="idx">
          <td v-for="col in columns" :key="col.key">{{ cell(row, col.key) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.data-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--panel);
}
.data-table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid var(--border);
  font-size: 0.9rem;
}
th {
  background: #0c0c0e;
}
</style>
