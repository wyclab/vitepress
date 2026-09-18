<script setup>
import { withBase, useData } from 'vitepress'

const { site } = useData()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="site-footer">
    <div class="container">
      <p class="footer-text">
        © {{ year }} {{ site.title }} · 搭建于
        <a href="https://vitepress.dev/zh/" target="_blank" rel="noopener">VitePress</a>
      </p>
      <p class="footer-text">
        <a :href="withBase('/feed.xml')" target="_blank" rel="noopener">RSS 订阅</a>
        <span class="divider">|</span>
        <a href="https://github.com/wyclab" target="_blank" rel="noopener">GitHub</a>
      </p>
    </div>
  </footer>
</template>
