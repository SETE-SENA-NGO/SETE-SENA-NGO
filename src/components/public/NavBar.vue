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
        <li class="has-dropdown">
          <RouterLink to="/programs">Programs</RouterLink>
          <ul class="dropdown">
            <li><a href="/programs#education">Education</a></li>
            <li><a href="/programs#environment">Environment</a></li>
            <li><a href="/programs#livelihood">Livelihood</a></li>
            <li><a href="/programs#child-protection">Child Protection</a></li>
          </ul>
        </li>
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

/* Dropdown */
.has-dropdown {
  position: relative;
}
.dropdown {
  list-style: none;
  margin: 0;
  padding: 0.5rem;
  display: none;
  min-width: 180px;
}
.has-dropdown:hover .dropdown {
  display: block;
}
.dropdown li a {
  display: block;
  padding: 0.4rem 0.5rem;
  border-radius: 0.3rem;
}
.dropdown li a:hover {
  background: var(--border);
}

@media (min-width: 640px) {
  .nav-toggle {
    display: none;
  }
  .nav-links {
    display: flex;
    flex-direction: row;
  }
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    background: var(--panel);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  }
}
</style>