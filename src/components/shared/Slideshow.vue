<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'SharedSlideshow' })

interface SlideItem {
  image: string
  caption: string
  alt?: string
  label?: string
  eyebrow?: string
  title?: string
  description?: string
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  position?: string
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
const isPaused = ref(false)
const activeSlide = computed(() => props.slides[activeIndex.value])
let timer: ReturnType<typeof setInterval> | undefined

function next() {
  if (!props.slides.length) return
  activeIndex.value = (activeIndex.value + 1) % props.slides.length
}

function previous() {
  if (!props.slides.length) return
  activeIndex.value = (activeIndex.value - 1 + props.slides.length) % props.slides.length
}

function goTo(index: number) {
  activeIndex.value = index
  restartAutoplay()
}

function startAutoplay() {
  if (props.slides.length <= 1) return
  stopTimer()
  isPaused.value = false
  timer = setInterval(next, props.intervalMs)
}

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = undefined
  }
}

function stopAutoplay() {
  isPaused.value = true
  stopTimer()
}

function restartAutoplay() {
  stopTimer()
  startAutoplay()
}

function goNext() {
  next()
  restartAutoplay()
}

function goPrevious() {
  previous()
  restartAutoplay()
}

onMounted(startAutoplay)
onUnmounted(stopTimer)
</script>

<template>
  <div
    class="slideshow"
    :class="{ 'has-overlay': $slots.default, 'is-paused': isPaused }"
    role="region"
    aria-label="Image slideshow"
    tabindex="0"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    @focusin="stopAutoplay"
    @focusout="startAutoplay"
    @keydown.left.prevent="goPrevious"
    @keydown.right.prevent="goNext"
  >
    <div v-if="slides.length" class="slideshow-track">
      <div
        v-for="(slide, i) in slides"
        :key="slide.image"
        class="slideshow-slide"
        :class="{ 'is-active': i === activeIndex }"
        :style="{ '--slide-position': slide.position ?? 'center' }"
      >
        <img
          :src="slide.image"
          :alt="slide.alt ?? slide.caption"
          :loading="i === 0 ? 'eager' : 'lazy'"
          decoding="async"
          :fetchpriority="i === 0 ? 'high' : 'auto'"
        />
        <p v-if="slide.caption" class="slideshow-caption">{{ slide.caption }}</p>
      </div>
    </div>

    <div v-if="$slots.default" class="slideshow-overlay">
      <slot :active-slide="activeSlide" :active-index="activeIndex" />
    </div>

    <div v-if="slides.length > 1" class="slideshow-controls" aria-label="Slideshow controls">
      <button
        type="button"
        class="slideshow-control slideshow-control--previous"
        aria-label="Previous slide"
        @click="goPrevious"
      >
        <span aria-hidden="true"></span>
      </button>
      <button
        type="button"
        class="slideshow-control slideshow-control--next"
        aria-label="Next slide"
        @click="goNext"
      >
        <span aria-hidden="true"></span>
      </button>
    </div>

    <div v-if="slides.length > 1" class="slideshow-dots">
      <button
        v-for="(slide, i) in slides"
        :key="'dot-' + slide.image"
        type="button"
        class="slideshow-dot"
        :class="{ 'is-active': i === activeIndex }"
        :aria-label="
          slide.title || slide.label || slide.caption
            ? `Go to slide ${i + 1}: ${slide.title ?? slide.label ?? slide.caption}`
            : `Go to slide ${i + 1}`
        "
        @click="goTo(i)"
      />
    </div>

    <div
      v-if="slides.length > 1"
      :key="activeIndex"
      class="slideshow-progress"
      :style="{ '--slide-duration': `${intervalMs}ms` }"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.slideshow {
  position: relative;
  width: 100%;
  height: 260px;
  overflow: hidden;
  background: var(--color-ink);
  outline: none;
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
    rgba(6, 18, 13, 0.595) 45%,
    rgba(6, 18, 13, 0.28) 70%,
    rgba(6, 18, 13, 0.258) 100%
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
  transition:
    opacity 0.8s ease,
    transform 1.2s ease;
}

.slideshow-slide.is-active {
  opacity: 1;
  transform: scale(1);
  z-index: 1;
}

.slideshow-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: var(--slide-position, center);
  display: block;
  backface-visibility: hidden;
  filter: none;
  transform: none;
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
  font-weight: 600;
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

.slideshow-controls {
  position: absolute;
  right: clamp(1rem, 3vw, 2rem);
  bottom: clamp(1.1rem, 3vw, 2rem);
  z-index: 3;
  display: flex;
  gap: 0.55rem;
}

.slideshow-control {
  position: relative;
  width: 2.8rem;
  height: 2.8rem;
  border: 1px solid rgba(255, 250, 240, 0.5);
  border-radius: 999px;
  background: rgba(6, 18, 13, 0.36);
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease;
}

.slideshow-control:hover,
.slideshow-control:focus-visible {
  border-color: rgba(255, 250, 240, 0.84);
  background: rgba(20, 129, 62, 0.78);
  transform: translateY(-1px);
}

.slideshow-control span {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.62rem;
  height: 0.62rem;
  border-top: 2px solid #fffaf0;
  border-right: 2px solid #fffaf0;
}

.slideshow-control--previous span {
  transform: translate(-38%, -50%) rotate(-135deg);
}

.slideshow-control--next span {
  transform: translate(-62%, -50%) rotate(45deg);
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
  width: 0.72rem;
  height: 0.72rem;
  border-radius: 999px;
  border: 1px solid rgba(255, 250, 240, 0.78);
  background: rgba(255, 250, 240, 0.5);
  padding: 0;
  cursor: pointer;
  transition:
    width 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease;
}

.slideshow-dot.is-active {
  width: 1.8rem;
  background: var(--primary-color);
  border-color: var(--primary-color);
}

.slideshow-progress {
  position: absolute;
  left: 0;
  bottom: 0;
  z-index: 3;
  width: 100%;
  height: 3px;
  background: var(--primary-color);
  transform-origin: left;
  animation: slideshowProgress var(--slide-duration, 5000ms) linear forwards;
}

.slideshow.is-paused .slideshow-progress {
  animation-play-state: paused;
}

@keyframes slideshowProgress {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@media (max-width: 640px) {
  .slideshow-caption {
    font-size: 0.95rem;
    padding: 1rem 1.5rem 2.25rem;
  }

  .slideshow-dots {
    bottom: 0.7rem;
  }

  .slideshow-controls {
    right: 1rem;
    bottom: 1.45rem;
  }

  .slideshow-control {
    width: 2.35rem;
    height: 2.35rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .slideshow-slide,
  .slideshow-control,
  .slideshow-dot {
    transition: none;
  }

  .slideshow-progress {
    display: none;
  }
}
</style>
