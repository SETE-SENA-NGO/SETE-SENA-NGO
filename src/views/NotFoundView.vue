<script setup lang="ts"></script>

<template>
  <div class="not-found">
    <h1>404</h1>
    <p>Page not found.</p>
    <RouterLink to="/">Go home</RouterLink>
  </div>
</template>

<style scoped>
.not-found {
  text-align: center;
  padding: 6rem 1rem;
}
h1 {
  font-size: 5rem;
  margin: 0;
}
a {
  color: var(--text);
  text-decoration: underline;
}
</style>
