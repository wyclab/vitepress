<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.js'

// ---------- 站点信息（按需修改） ----------
const authorName = '无用处'
const authorDesc = '无用之物是最高等级的美好'
const avatar = withBase('/favicon/android-chrome-512x512.png')
const socials = [
  { name: 'GitHub', link: 'https://github.com/wyclab' },
  { name: 'RSS订阅', link: '/feed.xml' },
]

const siteTitle = '无用处实验室'
const siteDesc = '折腾一些好玩的，看似无用，实则真的无用。'

// ---------- 标签统计 ----------
const tagCounts = computed(() => {
  const map = new Map()
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

// ---------- 精选轮播 ----------
const recommended = computed(() => posts.filter((p) => p.description).slice(0, 6))
const recPages = computed(() => {
  const pages = []
  for (let i = 0; i < recommended.value.length; i += 2) pages.push(recommended.value.slice(i, i + 2))
  return pages
})
const current = ref(0)

const AUTOPLAY_MS = 4500
const SWIPE_TRIGGER = 56 // 松手时超过该位移才翻页（px）
const EDGE_DAMPING = 0.32 // 首/末页继续外拉的阻尼系数

let timer = null
let paused = false

function startAutoplay() {
  stopAutoplay()
  if (recPages.value.length <= 1) return
  timer = setInterval(() => {
    if (!paused) go(current.value + 1)
  }, AUTOPLAY_MS)
}
function stopAutoplay() {
  if (timer) clearInterval(timer)
  timer = null
}
// 切页统一入口：自动轮播、圆点、手势都走这里
function go(index) {
  const n = recPages.value.length
  if (!n) return
  const next = ((index % n) + n) % n
  if (next === current.value) return
  current.value = next
  buzz()
}
// 轻震动反馈（Android Chrome 支持；iOS Safari 不支持，静默跳过）
function buzz(ms = 8) {
  try {
    navigator.vibrate?.(ms)
  } catch {
    /* ignore */
  }
}

// ---------- 手势滑动（跟手拖拽 + 松手吸附） ----------
const listEl = ref(null)
const dragging = ref(false) // 是否处于拖拽中
const dragX = ref(0) // 跟手位移，直接进 transform
const dragged = ref(false) // 本次交互是否真的拖动过（用于拦截误点击）
let pointerId = null
let startX = 0
let startY = 0
let axis = null // 'x' | 'y'：先判定主方向，纵向手势让位给页面滚动

function onPointerDown(e) {
  if (e.pointerType === 'mouse' && e.button !== 0) return
  if (recPages.value.length <= 1) return
  pointerId = e.pointerId
  dragging.value = true
  dragged.value = false
  axis = null
  startX = e.clientX
  startY = e.clientY
  dragX.value = 0
  paused = true // 拖拽期间暂停自动轮播
  // 注意：此处不做 setPointerCapture。轻点也应被当作拖拽起点，一旦提前捕获指针，
  // 松手后的 click 会落到容器而不是文章卡片上，导致手机上点不开文章。
}

function onPointerMove(e) {
  if (!dragging.value || e.pointerId !== pointerId) return
  const dx = e.clientX - startX
  const dy = e.clientY - startY
  // 首次移动判定主方向：纵向则直接放弃接管，避免抢走页面上下滚动
  if (axis === null) {
    if (Math.abs(dx) < 4 && Math.abs(dy) < 4) return
    axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
    if (axis === 'y') {
      endDrag()
      return
    }
  }
  if (axis !== 'x') return
  // 确认是横向拖拽（而非轻点）后才捕获指针：既能把 click 留给文章卡片，
  // 又能保证手指滑出卡片范围后仍继续收到事件，不会卡在拖拽态
  if (!dragged.value && Math.abs(dx) > 6) {
    dragged.value = true
    try {
      listEl.value?.setPointerCapture(e.pointerId)
    } catch {
      /* ignore */
    }
  }
  const atStart = current.value === 0 && dx > 0
  const atEnd = current.value === recPages.value.length - 1 && dx < 0
  dragX.value = atStart || atEnd ? dx * EDGE_DAMPING : dx
}

function endDrag() {
  dragging.value = false
  dragX.value = 0
  pointerId = null
  axis = null
  paused = false
  startAutoplay() // 重置自动轮播计时，避免刚滑完立刻跳页
}

function finishDrag(e) {
  if (!dragging.value || e.pointerId !== pointerId) return
  // 用实际跟手位移判定：边界处位移被阻尼过，若按手指原始位移判定会出现
  // 「卡片几乎没动却翻页」的错位感
  const offset = dragX.value
  const moved = dragged.value
  endDrag()
  if (!moved) return
  if (offset <= -SWIPE_TRIGGER) go(current.value + 1)
  else if (offset >= SWIPE_TRIGGER) go(current.value - 1)
}

// 浏览器判定为纵向滚动（或系统打断）时会发 pointercancel，
// 此时只是复位，绝不能因为位移就翻页
function cancelDrag() {
  if (!dragging.value) return
  dragged.value = false
  endDrag()
}

// 拖动结束后紧跟着的那次 click 要吞掉，否则会误进文章
function onClickCapture(e) {
  if (!dragged.value) return
  dragged.value = false
  e.preventDefault()
  e.stopPropagation()
}

onMounted(() => startAutoplay())
onUnmounted(() => stopAutoplay())

// ---------- 最新文章 ----------
const latest = computed(() => posts.slice(0, 8))
</script>

<template>
  <div class="blog-home">
    <div class="container">
      <!-- 顶部区域 -->
      <div class="top-grid">
        <div class="top-left">
          <div class="hero-card card">
            <div>
              <h1 class="hero-title">{{ siteTitle }}</h1>
              <p class="hero-desc">{{ siteDesc }}</p>
            </div>

            <!-- 作者信息 -->
            <div class="head-wrapper">
              <img class="head-img" :src="avatar" :alt="authorName" />
              <div class="head-info">
                <h3 class="head-name">{{ authorName }}</h3>
                <p class="head-desc">{{ authorDesc }}</p>
                <div class="head-social">
                  <a
                    v-for="s in socials"
                    :key="s.name"
                    class="social-link"
                    :href="s.link"
                    target="_blank"
                    rel="noopener"
                    :title="s.name"
                  >{{ s.name }}</a>
                </div>
              </div>
            </div>

            <!-- 标签跑马灯 -->
            <div class="tag-marquee" v-if="tagCounts.length">
              <div class="tag-marquee-track">
                <div class="tag-marquee-group" v-for="n in 2" :key="n" :aria-hidden="n === 2">
                  <a
                    v-for="[tag, count] in tagCounts"
                    :key="tag + n"
                    class="tag-link"
                    :href="withBase('/pages/tags/?q=' + encodeURIComponent(tag))"
                  >
                    <span class="tag-count">#</span>{{ tag }}
                    <span class="tag-count">{{ count }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 精选推荐 -->
        <div class="top-right">
          <div class="recommend-card card">
            <div class="recommend-head">
              <h2>精选推荐</h2>
              <div class="recommend-indicators">
                <button
                  v-for="(page, i) in recPages"
                  :key="i"
                  class="indicator-dot"
                  :class="{ active: i === current }"
                  :aria-label="`第 ${i + 1} 页`"
                  @click="go(i)"
                ></button>
              </div>
            </div>
            <div
              ref="listEl"
              class="recommend-list"
              :class="{ 'is-dragging': dragging }"
              @pointerdown="onPointerDown"
              @pointermove="onPointerMove"
              @pointerup="finishDrag"
              @pointercancel="cancelDrag"
              @click.capture="onClickCapture"
            >
              <div
                class="recommend-track"
                :style="{ transform: `translateX(calc(${-current * 100}% + ${dragX}px))` }"
              >
                <div class="recommend-page" v-for="(page, pi) in recPages" :key="pi">
                  <a v-for="p in page" :key="p.url" class="recommend-item" :href="withBase(p.url)">
                    <span class="recommend-icon">{{ p.category ? p.category.slice(0, 1) : '文' }}</span>
                    <span class="recommend-body">
                      <span class="recommend-title">{{ p.title }}</span>
                      <span class="recommend-desc">{{ p.description }}</span>
                      <span class="recommend-meta">
                        <span>{{ p.date }}</span>
                        <span class="dot"></span>
                        <span class="cat">{{ p.category }}</span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新文章 -->
      <section class="latest-articles">
        <div class="latest-head">
          <h2>最新文章</h2>
          <a class="view-all" :href="withBase('/pages/posts/')">查看全部 →</a>
        </div>
        <div class="latest-grid">
          <a v-for="p in latest" :key="p.url" class="article-card card" :href="withBase(p.url)">
            <div class="article-card-date">{{ p.date }}</div>
            <h3 class="article-card-title">{{ p.title }}</h3>
            <p class="article-card-desc">{{ p.description || p.excerpt }}</p>
            <div class="article-card-tags">
              <span class="article-tag" v-for="t in p.tags" :key="t">{{ t }}</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
