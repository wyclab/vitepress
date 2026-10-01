<script setup>
import { withBase, useData } from 'vitepress'

const { site, theme } = useData()
const year = new Date().getFullYear()

// 全站字数：>= 1 万显示「x.x 万字」，不足 1 万显示「x 字」
const totalWords = theme.value.siteStats?.totalWords ?? 0
const wordsText = totalWords >= 10000 ? `${(totalWords / 10000).toFixed(1)} 万字` : `${totalWords} 字`
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <p class="footer-text">
        © {{ year }} {{ site.title }} · 托管于
        <a href="https://edgeone.ai/zh/products/pages" target="_blank" rel="noopener">EdgeOne Pages</a>
      </p>
      <p class="footer-text">
        <a :href="withBase('/feed.xml')" target="_blank" rel="noopener">RSS 订阅</a>
        <span class="divider">|</span>
        <span>共计 {{ wordsText }}</span>
        <span class="divider">|</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备17074381号-14</a>
      </p>
    </div>
  </footer>
</template>
