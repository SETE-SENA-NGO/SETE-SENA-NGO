<script setup lang="ts"></script>

<template>
  <footer class="public-footer">
    <div class="public-footer-inner">
      <div>© {{ new Date().getFullYear() }} Santi Sena NGO. All rights reserved.</div>
      <div class="footer-links">
        <a href="mailto:hello@example.com">hello@example.com</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.public-footer {
  border-top: 2px solid #1F4223;
  background: #0F1F17;
  margin-top: auto;
}
.public-footer-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  color: #FFFFFF;
}
.footer-links a {
  color: #9CA3AF;
  transition: color 0.2s;
  text-decoration: none;
}
.footer-links a:hover {
  color: #D4A017;
}
@media (min-width: 640px) {
  .public-footer-inner {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
