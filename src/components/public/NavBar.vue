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
  border-bottom: 1px solid #3A7D44;
  background: #FFFFFF;
  position: sticky;
  top: 0;
  z-index: 50;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}
.public-nav-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.brand {
  font-weight: 700;
  font-size: 1.1rem;
  letter-spacing: 0.05em;
  color: #1F2937;
  text-decoration: none;
  transition: color 0.2s ease;
}
.brand:hover {
  color: #3A7D44;
}
.nav-toggle {
  display: block;
  background: transparent;
  color: #4B5563;
  border: 1px solid #E5E7EB;
  padding: 0.4rem 0.7rem;
  border-radius: 0.4rem;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background 0.2s ease, border-color 0.2s ease;
}
.nav-toggle:hover {
  background: #F3F4F6;
  border-color: #9CA3AF;
}
.nav-links {
  display: none;
  gap: 0.25rem;
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
  background: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
  padding: 0.5rem 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}
.nav-links a {
  position: relative;
  display: inline-block;
  padding: 0.4rem 0.5rem;
  color: #4B5563;
  text-decoration: none;
  font-size: 0.9rem;
  border-radius: 0.3rem;
  transition: color 0.2s ease, background 0.2s ease;
}
.nav-links a::after {
  content: '';
  position: absolute;
  left: 0.5rem;
  right: 0.5rem;
  bottom: 2px;
  height: 2px;
  background: #3A7D44;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.25s ease;
}
.nav-links a:hover {
  color: #3A7D44;
  background: #F3F7F4;
}
.nav-links a:hover::after {
  transform: scaleX(1);
}
.nav-links a.router-link-exact-active {
  color: #3A7D44;
  font-weight: 600;
  background: #F3F7F4;
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
    gap: 0.25rem;
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
