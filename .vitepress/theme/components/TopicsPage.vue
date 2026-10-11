<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { topics } from '../../topics.ts'
import { data as posts } from '../posts.data.js'

// ============ 专题卡片 ============
// 每个专题：文章数 + 最新一篇文章的更新时间（updatedTs 排序的 posts 里按 url 前缀反查）
const topicCards = computed(() =>
  topics.map((t) => {
    const prefix = `/articles/${t.dir}/`
    const list = posts.filter((p) => p.url.startsWith(prefix))
    const latest = list.reduce((acc, p) => (p.updatedTs > (acc?.updatedTs ?? 0) ? p : acc), null)
    return {
      ...t,
      href: withBase(`${prefix}index.html`),
      cover: withBase(t.cover),
      count: list.length,
      latest,
    }
  }),
)

// ============ 最近更新（卡片下方，跨专题取最近 8 篇，按更新时间倒序） ============
const topicLabelOf = (url) => {
  const dir = url.split('/')[2]
  return topics.find((t) => t.dir === dir)?.label ?? ''
}

const recent = computed(() =>
  [...posts]
    .sort((a, b) => b.updatedTs - a.updatedTs)
    .slice(0, 8)
    .map((p) => ({
      ...p,
      topic: topicLabelOf(p.url),
      href: withBase(p.url),
    })),
)

const fmt = (d) => (d ? d.slice(5).replace('-', ' 月 ') + ' 日' : '')

// 兜底：个别文章缺 frontmatter title 时不至于出现空行，用文件名代替
const titleOf = (p) => {
  if (p.title) return p.title
  const slug = String(p.url || '').split('/').pop() || ''
  return decodeURIComponent(slug.replace(/\.html$/, '')) || '未命名'
}
</script>

<template>
  <div id="main" class="topics-page">
    <header class="topics-head">
      <h1>专题</h1>
      <p class="topics-sub">{{ topics.length }} 个专题 · {{ posts.length }} 篇文章</p>
    </header>

    <!-- ========== 专题卡片 ========== -->
    <section class="topics-grid">
      <a v-for="card in topicCards" :key="card.dir" class="topic-card" :href="card.href">
        <div class="topic-cover" :style="{ backgroundImage: `url(${card.cover})` }" />
        <div class="topic-shade" />
        <div class="topic-info">
          <h2 class="topic-title">{{ card.label }}</h2>
          <p class="topic-desc">{{ card.description }}</p>
          <p class="topic-meta">
            <span>{{ card.count }} 篇</span>
            <template v-if="card.latest">
              <span class="topic-dot">·</span>
              <span>最近更新 {{ fmt(card.latest.updated) }}</span>
            </template>
          </p>
        </div>
      </a>
    </section>

    <!-- ========== 最近更新 ========== -->
    <section class="topics-recent">
      <div class="section-heading">
        <h2>最近更新</h2>
        <span>按更新时间排序</span>
      </div>
      <ul class="topics-recent-list">
        <li v-for="p in recent" :key="p.url" class="topics-recent-row">
          <time class="topics-recent-date">{{ fmt(p.updated) }}</time>
          <span class="topics-recent-topic">{{ p.topic }}</span>
          <a class="topics-recent-title" :href="p.href" :title="titleOf(p)">{{ titleOf(p) }}</a>
        </li>
      </ul>
    </section>
  </div>
</template>
