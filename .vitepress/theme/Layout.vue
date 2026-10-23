<script setup>
import { nextTick, onMounted, onBeforeUnmount, watch } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRouter } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import BackToTop from './components/BackToTop.vue'
import MobileNav from './components/MobileNav.vue'
import TwikooComment from './components/TwikooComment.vue'

// 内部 composable：与默认 Layout 用的是同一个模块级 isScreenOpen 单例，
// 用来感知移动端菜单（汉堡按钮）的开合，见下方「专题默认展开」。
import { useNav } from 'vitepress/dist/client/theme-default/composables/nav.js'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const router = useRouter()
const { isScreenOpen } = useNav()

// ---------------- 移动端菜单里的「专题」默认展开 ----------------
// VitePress 的 VPNavScreenMenuGroup 内部 isOpen 默认为 false，必须点右侧 + 号才展开。
// 这里在菜单打开后找到「专题」分组，模拟一次点击把它展开（用户仍可再点 × 折叠）。
// 只按分组文字匹配，不写死 DOM 结构顺序；找不到时用 rAF 重试几次，等过渡动画挂载完成。
const AUTO_EXPAND_GROUP_LABEL = '专题'

function expandTopicsGroup(retry = 3) {
  const groups = document.querySelectorAll('.VPNavScreenMenuGroup')
  let matched = false
  groups.forEach((group) => {
    const btn = group.querySelector(':scope > button') || group.querySelector('button')
    if (!btn) return
    const label = (btn.textContent || '').replace(/\s+/g, '')
    if (!label.startsWith(AUTO_EXPAND_GROUP_LABEL)) return
    matched = true
    if (btn.getAttribute('aria-expanded') !== 'true') btn.click()
  })
  if (!matched && retry > 0) {
    window.requestAnimationFrame(() => expandTopicsGroup(retry - 1))
  }
}

watch(isScreenOpen, async (open) => {
  if (!open) return
  await nextTick()
  expandTopicsGroup()
})

// 导航「专题」是 v-html 注入的锚点，位于 VPFlyout 的 button 内。
// VitePress 的全局点击拦截会跳过 button 内的链接（走整页刷新），
// 这里提前接管：SPA 跳转到专题页，保持无刷新体验。
function onNavTopicsClick(e) {
  const a = e.target instanceof Element && e.target.closest('a.nav-topics-link')
  if (!a) return
  e.preventDefault()
  router.go(a.getAttribute('href'))
}

// 滚动时给 <html> 挂 nav-floating，驱动顶部导航从「透明全宽」切换为「悬浮圆角区块」。
// 阈值取 8px，避免轻微回弹就触发形变；配合 rAF 节流减轻重排压力。
let navTicking = false
function syncNavState() {
  if (!navTicking) {
    navTicking = true
    window.requestAnimationFrame(() => {
      document.documentElement.classList.toggle('nav-floating', window.scrollY > 8)
      navTicking = false
    })
  }
}
onMounted(() => {
  document.addEventListener('click', onNavTopicsClick, true)
  syncNavState()
  window.addEventListener('scroll', syncNavState, { passive: true })
})
onBeforeUnmount(() => {
  document.removeEventListener('click', onNavTopicsClick, true)
  window.removeEventListener('scroll', syncNavState)
})
</script>

<template>
  <Layout>
    <template #home-hero-after>
      <HomeLayout v-if="frontmatter.layout === 'home'" />
    </template>
    <template #layout-bottom>
      <SiteFooter />
    </template>
    <template #doc-before>
      <ArticleHeader />
    </template>
    <template #doc-after>
      <TwikooComment />
    </template>
    <template #page-bottom>
      <TwikooComment />
    </template>
  </Layout>
  <BackToTop />
  <MobileNav />
</template>
