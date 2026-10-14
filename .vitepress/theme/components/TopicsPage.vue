<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import { topics } from '../../topics.ts'
import { data as posts } from '../posts.data.js'

// ============ 专题卡片 ============
// 每个专题：文章数 + 该专题内最近更新的一篇文章（按 updatedTs 降序取第一条）
const topicCards = computed(() =>
  topics.map((t) => {
    const prefix = `/articles/${t.dir}/`
    const list = posts.filter((p) => p.url.startsWith(prefix))
    const latest = [...list].sort((a, b) => b.updatedTs - a.updatedTs)[0] ?? null
    return {
      ...t,
      href: withBase(`${prefix}index.html`),
      cover: withBase(t.cover),
      count: list.length,
      latest: latest ? { ...latest, href: withBase(latest.url) } : null,
    }
  }),
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

    <!--
      结构说明（刻意保持简单，避免任何叠层/裁切技巧）：
      .topic-card 只做布局容器，内部是两个平级链接——
        1. .topic-card-main：封面 + 标题/简介/篇数，整块点击进专题首页
        2. .topic-latest：该专题最近更新的一篇文章，点击直达文章
      没有 a 嵌套 a，没有铺满卡片的透明链接，没有 z-index 悬浮层，
      封面不做任何动画 —— hover 只有卡片整体 translateY + 阴影。
    -->
    <div class="topics-grid">
      <div v-for="card in topicCards" :key="card.dir" class="topic-card">
        <a class="topic-card-main" :href="card.href" :aria-label="`${card.label} 专题`">
          <div class="topic-cover-wrap">
            <div class="topic-cover" :style="{ backgroundImage: `url(${card.cover})` }" />
            <div class="topic-shade" />
            <div class="topic-info">
              <h2 class="topic-title">{{ card.label }}</h2>
              <p class="topic-desc">{{ card.description }}</p>
            </div>
          </div>

          <div class="topic-body">
            <p class="topic-meta">
              <span>{{ card.count }} 篇文章</span>
              <template v-if="card.latest">
                <span class="topic-meta-dot">·</span>
                <span>最近更新 {{ fmt(card.latest.updated) }}</span>
              </template>
            </p>
          </div>
        </a>

        <!-- 该专题最近更新的一篇文章：小红点 + 标题 + NEW -->
        <a
          v-if="card.latest"
          class="topic-latest"
          :href="card.latest.href"
          :title="titleOf(card.latest)"
        >
          <span class="topic-latest-dot" aria-hidden="true" />
          <span class="topic-latest-title">{{ titleOf(card.latest) }}</span>
          <span class="topic-latest-badge">NEW</span>
        </a>
        <p v-else class="topic-latest topic-latest-empty">暂无文章</p>
      </div>
    </div>
  </div>
</template>
