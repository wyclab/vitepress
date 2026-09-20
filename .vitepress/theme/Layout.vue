<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import HomeLayout from './components/HomeLayout.vue'
import SiteFooter from './components/SiteFooter.vue'
import ArticleHeader from './components/ArticleHeader.vue'
import BackToTop from './components/BackToTop.vue'

const { Layout } = DefaultTheme
const { frontmatter } = useData()
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
  </Layout>
  <BackToTop />
</template>
