<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.js'

// 按年份分组（date 格式为 YYYY-MM-DD）
const grouped = computed(() => {
  const map = new Map()
  for (const p of posts) {
    const year = p.date.slice(0, 4) || '未分类'
    if (!map.has(year)) map.set(year, [])
    map.get(year).push(p)
  }
  return [...map.entries()].map(([year, list]) => ({ year, list }))
})

// 日期显示为 MM-DD（年份已在分组标题中）
const mmdd = (d) => d.slice(5)
</script>

<template>
  <div id="main" class="posts-page">
    <div class="title">
      <h1>全部文章</h1>
    </div>

    <div id="post">
      <div v-for="g in grouped" :key="g.year" class="year-section">
        <h2 class="year-title">{{ g.year }}</h2>
        <div v-for="p in g.list" :key="p.url" class="post-item">
          <div class="post-date">{{ mmdd(p.date) }}</div>
          <div class="post-main">
            <a :href="withBase(p.url)" class="post-title">{{ p.title }}</a>
            <span v-if="p.category" class="post-category">{{ p.category }}</span>
          </div>
        </div>
      </div>

      <div v-if="!posts.length" class="no-posts">暂无文章</div>
    </div>
  </div>
</template>
