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
  border-top: 2px solid var(--green-dark);
  background: var(--panel);
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
  color: var(--white);
}
.footer-links a {
  color: var(--muted);
  transition: color 0.2s;
}
.footer-links a:hover {
  color: var(--gold);
}
@media (min-width: 640px) {
  .public-footer-inner {
    flex-direction: row;
    justify-content: space-between;
  }
}
</style>
