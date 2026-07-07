<script setup lang="ts">
</script>

<template>
  <section class="min-h-screen bg-[#fdf8ee] px-6 py-6 text-[#2f241d] sm:px-8 lg:px-12">
    <div class="mx-auto flex max-w-6xl flex-col gap-4">
      <div class="space-y-2">
        <p class="text-sm font-semibold uppercase tracking-[0.3em] text-[#9a5b2d]">Impact · Partners</p>
        <h1 class="font-serif text-4xl leading-tight text-[#214438] sm:text-5xl">
          Partnerships that help communities endure and thrive.
        </h1>
        <p class="max-w-3xl text-lg leading-8 text-[#4b4037]">
          Santi Sena works with local communities, funders, and development partners to strengthen education,
          livelihoods, child protection, and environmental stewardship across Cambodia.
        </p>
      </div>

      <div class="flex flex-wrap gap-4">
        <router-link to="/impact" class="rounded-full border border-[#d8c8a5] bg-white px-6 py-3 font-semibold text-[#214438] transition hover:-translate-y-0.5">
          Back to impact overview
        </router-link>
        <router-link to="/impact/timeline" class="rounded-full bg-[#f3c66d] px-6 py-3 font-semibold text-[#2f241d] shadow-[0_10px_25px_rgba(243,198,109,0.25)] transition hover:-translate-y-0.5">
          View the timeline
        </router-link>
      </div>
    </div>
  </section>
</template>
