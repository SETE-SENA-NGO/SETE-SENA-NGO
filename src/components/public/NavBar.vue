<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const menu = ref(false)
</script>

<template>
  <nav class="public-nav">
    <div class="public-nav-inner">
      <RouterLink to="/" class="brand">Santi Sena NGO</RouterLink>
      <button class="nav-toggle" @click="menu = !menu" aria-label="Toggle menu">Menu</button>
      <ul :class="['nav-links', { open: menu }]">
        <li><RouterLink to="/">Home</RouterLink></li>
        <li><RouterLink to="/about">About</RouterLink></li>
        <li><RouterLink to="/programs/environment">Environment Program</RouterLink></li>
        <li><RouterLink to="/services">Services</RouterLink></li>
        <li><RouterLink to="/contact">Contact</RouterLink></li>
        <li><RouterLink to="/admin/login">Admin</RouterLink></li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.public-nav {
  border-bottom: 1px solid var(--border);
  background: var(--panel);
  position: sticky;
  top: 0;
  z-index: 50;
}
.public-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font-weight: 700;
  letter-spacing: 0.05em;
}
.nav-toggle {
  display: block;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
}
.nav-links {
  display: none;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-links.open {
  display: flex;
  flex-direction: column;
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  background: var(--panel);
  border-bottom: 1px solid var(--border);
  padding: 1rem;
}
.nav-links li + li {
  margin-top: 0.25rem;
}
@media (min-width: 640px) {
  .nav-toggle {
    display: none;
  }
  .nav-links {
    display: flex;
    flex-direction: row;
  }
}
</style>
