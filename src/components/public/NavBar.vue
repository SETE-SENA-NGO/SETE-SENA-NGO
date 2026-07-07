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
        <li><RouterLink to="/" @click="menu = false">Home</RouterLink></li>
        <li><RouterLink to="/about/vision" @click="menu = false">About Vision</RouterLink></li>
        <li><RouterLink to="/programs/environment" @click="menu = false">Programs</RouterLink></li>
        <li><RouterLink to="/services" @click="menu = false">Services</RouterLink></li>
        <li><RouterLink to="/impact/partners" @click="menu = false">Partners</RouterLink></li>
        <li><RouterLink to="/contact" @click="menu = false">Contact</RouterLink></li>
        <li><RouterLink to="/admin/login" @click="menu = false">Admin</RouterLink></li>
      </ul>
    </div>
  </nav>
</template>

<style scoped>
.public-nav {
  border-bottom: 1px solid var(--green);
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
  transition: color 0.2s ease;
}
.brand:hover {
  color: var(--accent, #eaeaea);
  opacity: 0.85;
}
.nav-toggle {
  display: block;
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
  transition:
    background 0.2s ease,
    border-color 0.2s ease;
}
.nav-toggle:hover {
  background: var(--border);
  border-color: var(--muted);
}
.nav-links {
  display: none;
  gap: 1rem;
  list-style: none;
  margin: 0;
  padding: 0;
}
.nav-links a {
  padding: 0.25rem 0.5rem;
  border-radius: 0.3rem;
  transition: color 0.2s, background 0.2s;
}
.nav-links a:hover {
  color: var(--green-light);
  background: color-mix(in srgb, var(--green) 10%, transparent);
}
.nav-links a.router-link-active {
  color: var(--white);
  font-weight: 600;
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
.nav-links a {
  position: relative;
  display: inline-block;
  padding: 0.3rem 0;
  color: var(--muted);
  transition: color 0.2s ease;
}
.nav-links a::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background: var(--text);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}
.nav-links a:hover {
  color: var(--text);
}
.nav-links a:hover::after {
  transform: scaleX(1);
}
.nav-links a.router-link-exact-active {
  color: var(--text);
  font-weight: 600;
}
.nav-links a.router-link-exact-active::after {
  transform: scaleX(1);
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
