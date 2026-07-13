<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'SharedSlideshow' })

interface SlideItem {
  image: string
  caption: string
}


const props = withDefaults(
  defineProps<{
    slides: SlideItem[]
    intervalMs?: number
  }>(),
  {
    intervalMs: 5000,
  },
)

const activeIndex = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

function next() {
  activeIndex.value = (activeIndex.value + 1) % props.slides.length
}

function goTo(index: number) {
  activeIndex.value = index
  restartAutoplay()
}

function startAutoplay() {
  if (props.slides.length <= 1) return
  stopAutoplay()
  timer = setInterval(next, props.intervalMs)
}

function stopAutoplay() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function restartAutoplay() {
  stopAutoplay()
  startAutoplay()
}

onMounted(startAutoplay)
onUnmounted(stopAutoplay)
</script>

<template>
  <div
    class="slideshow"
    :class="{ 'has-overlay': $slots.default }"
    role="region"
    aria-label="Image slideshow"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
  >
    <div class="slideshow-track">
      <div
        v-for="(slide, i) in slides"
        :key="slide.image"
        class="slideshow-slide"
        :class="{ 'is-active': i === activeIndex }"
      >
        <img :src="slide.image" :alt="slide.caption" />
        <p v-if="slide.caption" class="slideshow-caption">{{ slide.caption }}</p>
      </div>
    </div>

    <div v-if="$slots.default" class="slideshow-overlay">
      <slot />
    </div>

    <div v-if="slides.length > 1" class="slideshow-dots">
      <button
        v-for="(slide, i) in slides"
        :key="'dot-' + slide.image"
        type="button"
        class="slideshow-dot"
        :class="{ 'is-active': i === activeIndex }"
        :aria-label="`Go to slide ${i + 1}: ${slide.caption}`"
        @click="goTo(i)"
      />
    </div>
  </div>
</template>

<style scoped>
.slideshow {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: var(--color-ink);
}

/* Background “header” overlay (used when pages want consistent hero styling)
   without needing to create their own overlay in each page. */
.slideshow::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(6, 18, 13, 0.88) 0%,
    rgba(6, 18, 13, 0.55) 45%,
    rgba(6, 18, 13, 0.28) 70%,
    rgba(6, 18, 13, 0.06) 100%
  );
  z-index: 0;
}

/* Keep images above the background overlay */
.slideshow-track {
  position: relative;
  z-index: 1;
}

.slideshow-slide {
  z-index: 1;
}



@media (min-width: 640px) {
  .slideshow {
    height: 360px;
  }
}

@media (min-width: 1024px) {
  .slideshow {
    height: 480px;
  }
}

@media (min-width: 1440px) {
  .slideshow {
    height: 560px;
  }
}

.slideshow.has-overlay {
  height: 420px;
}

@media (min-width: 640px) {
  .slideshow.has-overlay {
    height: 520px;
  }
}

@media (min-width: 1024px) {
  .slideshow.has-overlay {
    height: 620px;
  }
}

@media (min-width: 1440px) {
  .slideshow.has-overlay {
    height: 680px;
  }
}

.slideshow-track {
  position: relative;
  width: 100%;
  height: 100%;
}

.slideshow-slide {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.slideshow-slide.is-active {
  opacity: 1;
  z-index: 1;
}

.slideshow-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(2px);
  transform: scale(1.04);
}

.slideshow-caption {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 1.25rem calc(var(--container-offset) + 1.5rem) 2.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.6), transparent);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 500;
  pointer-events: none;
}

.slideshow-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.slideshow-overlay > :deep(*) {
  pointer-events: auto;
}

.slideshow-dots {
  position: absolute;
  bottom: 0.9rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 2;
  display: flex;
  gap: 0.5rem;
}

.slideshow-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 999px;
  border: 1px solid var(--primary-color);
  background: rgba(255, 255, 255, 0.6);
  padding: 0;
  cursor: pointer;
  transition: background 0.2s ease;
}

.slideshow-dot.is-active {
  background: var(--primary-color);
}

@media (max-width: 640px) {
  .slideshow-caption {
    font-size: 0.95rem;
    padding: 1rem 1.5rem 2.25rem;
  }

  .slideshow-dots {
    bottom: 0.7rem;
  }
}
</style>
