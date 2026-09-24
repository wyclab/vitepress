<script setup>
import { onMounted, onBeforeUnmount } from 'vue'
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import BackToTop from './components/BackToTop.vue'
import MobileNav from './components/MobileNav.vue'
import TwikooComment from './components/TwikooComment.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()

// 滚动时给 <html> 挂 nav-floating，驱动顶部导航从「透明全宽」切换为「悬浮圆角区块」。
// 阈值取 8px，避免轻微回弹就触发形变。
function syncNavState() {
  document.documentElement.classList.toggle('nav-floating', window.scrollY > 8)
}
onMounted(() => {
  syncNavState()
  window.addEventListener('scroll', syncNavState, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', syncNavState))
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
