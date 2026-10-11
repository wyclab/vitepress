<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData, useRouter } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import BackToTop from './components/BackToTop.vue'
import MobileNav from './components/MobileNav.vue'
import TwikooComment from './components/TwikooComment.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
const router = useRouter()

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
// 阈值取 8px，避免轻微回弹就触发形变。
function syncNavState() {
  document.documentElement.classList.toggle('nav-floating', window.scrollY > 8)
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
