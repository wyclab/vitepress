<script setup>
import { withBase, useData } from 'vitepress'

const { site } = useData()
const year = new Date().getFullYear()
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
        <a href="https://github.com/wyclab" target="_blank" rel="noopener">GitHub</a>
        <span class="divider">|</span>
        <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener">京ICP备17074381号-14</a>
      </p>
    </div>
  </footer>
</template>
