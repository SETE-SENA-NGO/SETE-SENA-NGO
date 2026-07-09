<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import FooterView from '@/layouts/FooterView.vue'
import HeaderView from '@/layouts/HeaderView.vue'

const route = useRoute()

// Hide public header/footer on admin login
const showChrome = computed(() => route.path !== '/admin/login')
</script>


<template>
  <HeaderView v-if="showChrome" />
  <RouterView />
  <FooterView v-if="showChrome" />
</template>
