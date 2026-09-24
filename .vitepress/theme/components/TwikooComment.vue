<script>
// 模块级：twikoo 脚本全局只加载一次（SPA 切换页面时复用，避免重复注入）
let twikooPromise = null

function loadTwikooScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('SSR'))
  if (window.twikoo) return Promise.resolve(window.twikoo)
  if (!twikooPromise) {
    twikooPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      // 前端版本需与后端 twikoo.wyclab.com 保持一致（当前 2.0.9）
      // CDN 用 npmmirror（国内镜像，站点已 ICP 备案，国内访问为主）
      // 备选：https://cdn.jsdelivr.net/npm/twikoo@2.0.9/dist/twikoo.min.js
      s.src = 'https://registry.npmmirror.com/twikoo/2.0.9/files/dist/twikoo.min.js'
      s.crossOrigin = 'anonymous'
      s.onload = () => resolve(window.twikoo)
      s.onerror = () => {
        twikooPromise = null
        reject(new Error('twikoo 脚本加载失败'))
      }
      document.head.appendChild(s)
    })
  }
  return twikooPromise
}
</script>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'

const { page, frontmatter, isDark } = useData()
const route = useRoute()

// 自托管后端地址
const envId = 'https://twikoo.wyclab.com'

const container = ref(null)

// 显示评论区的位置：文章页（articles/ 下非 index）+ 关于页 + 友链页
// 单篇文章可用 frontmatter.comment: false 关闭
const show = computed(() => {
  if (frontmatter.value.comment === false) return false
  const p = (page.value.relativePath || '').replace(/\\/g, '/')
  if (p.startsWith('articles/') && !p.endsWith('/index.md') && p !== 'articles/index.md') {
    return true
  }
  return p === 'pages/about.md' || p === 'pages/friend.md'
})

function init() {
  if (typeof window === 'undefined') return
  loadTwikooScript()
    .then((twikoo) => {
      if (!twikoo || !container.value) return
      twikoo.init({
        envId,
        el: '#twikoo',
        path: window.location.pathname, // 区分不同页面/文章的评论
        lang: 'zh-CN',
      })
    })
    .catch(() => {})
}

onMounted(() => {
  if (show.value) init()
})

// SPA 切换文章时，重新加载对应页面的评论（flush: 'post' 确保容器 DOM 已更新）
watch(
  () => route.path,
  () => {
    if (show.value) init()
  },
  { flush: 'post' },
)
</script>

<template>
  <div
    v-if="show"
    id="twikoo"
    ref="container"
    class="twikoo-comment"
    :data-theme="isDark ? 'dark' : 'light'"
  ></div>
</template>

<style scoped>
.twikoo-comment {
  margin-top: 2.5rem;
  padding-top: 2rem;
  border-top: 1px solid var(--vp-c-divider);
  /* twikoo 2.0 主界面文字用 currentColor 继承，这里显式指定主题色，确保亮/暗主题下都正确 */
  color: var(--vp-c-text-1);
}
</style>
