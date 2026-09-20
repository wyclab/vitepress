<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const progress = ref(0)
const visible = ref(false)

// 环形进度条周长（r = 22）
const R = 22
const circumference = 2 * Math.PI * R
const dashOffset = ref(circumference)

let ticking = false

function update() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
  const pct = scrollHeight > 0 ? Math.round((scrollTop / scrollHeight) * 100) : 0
  progress.value = Math.max(0, Math.min(100, pct))
  dashOffset.value = circumference * (1 - progress.value / 100)
  visible.value = scrollTop > 200
}

function onScroll() {
  if (!ticking) {
    ticking = true
    window.requestAnimationFrame(() => {
      update()
      ticking = false
    })
  }
}

function backToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <Transition name="btt">
    <button
      v-if="visible"
      class="back-to-top"
      type="button"
      :title="`回到顶部（已阅读 ${progress}%）`"
      :aria-label="`回到顶部，已阅读 ${progress}%`"
      @click="backToTop"
    >
      <svg class="btt-ring" viewBox="0 0 52 52" aria-hidden="true">
        <circle class="btt-ring-bg" cx="26" cy="26" :r="R" />
        <circle
          class="btt-ring-fg"
          cx="26"
          cy="26"
          :r="R"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
      </svg>
      <span class="btt-inner">
        <svg class="btt-arrow" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 13V3M8 3L3.5 7.5M8 3l4.5 4.5" />
        </svg>
        <span class="btt-percent">{{ progress }}%</span>
      </span>
    </button>
  </Transition>
</template>

<style scoped>
.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 32px;
  z-index: 100;
  width: 52px;
  height: 52px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: var(--blog-card-bg);
  box-shadow: var(--blog-shadow-hover);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18);
}

.back-to-top:active {
  transform: translateY(-1px);
}

.btt-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.btt-ring circle {
  fill: none;
  stroke-width: 3;
}

.btt-ring-bg {
  stroke: var(--blog-card-border);
}

.btt-ring-fg {
  stroke: var(--vp-c-brand-1);
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
}

.btt-inner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 1;
  gap: 2px;
}

.btt-arrow {
  width: 14px;
  height: 14px;
  stroke: var(--vp-c-brand-1);
  stroke-width: 1.8;
  fill: none;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.btt-percent {
  font-size: 10px;
  font-weight: 700;
  color: var(--blog-text);
  font-variant-numeric: tabular-nums;
}

/* 显示 / 隐藏过渡 */
.btt-enter-active,
.btt-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.btt-enter-from,
.btt-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (max-width: 768px) {
  .back-to-top {
    right: 16px;
    bottom: 20px;
    width: 46px;
    height: 46px;
  }
}
</style>
