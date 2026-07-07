<script setup lang="ts">
interface Props {
  title?: string
  buttonLabel?: string
  href?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Ready to take the next step?',
  buttonLabel: 'Meet our partners',
  href: '/impact/partners',
})
</script>

<template>
  <section class="w-full border-t border-[#E7E0D2] bg-[#F9F3E8] py-20 px-8 sm:px-10 lg:px-8">
    <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 text-center sm:gap-10 lg:flex-row lg:gap-16 lg:text-left">
      <div class="max-w-2xl">
        <h2 class="font-serif text-[2rem] font-medium leading-tight text-[#073B4C] sm:text-[2.5rem] lg:text-[3rem]">
          {{ props.title }}
        </h2>
      </div>

      <router-link
        :to="props.href"
        class="group inline-flex h-14 items-center justify-center rounded-full bg-[#F68B1F] px-8 text-base font-semibold text-white shadow-[0_10px_30px_rgba(246,139,31,0.24)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E07A13] hover:shadow-[0_14px_34px_rgba(246,139,31,0.32)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F68B1F] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F9F3E8]"
      >
        <span>{{ props.buttonLabel }}</span>
        <svg
          class="ml-3 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path d="M4.16675 10H15.8334M15.8334 10L10.8334 5M15.8334 10L10.8334 15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </router-link>
    </div>
  </section>
</template>
