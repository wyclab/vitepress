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

    <!-- ========== 专题卡片（卡片内含该专题最近更新的文章） ========== -->
    <section class="topics-grid">
      <article v-for="card in topicCards" :key="card.dir" class="topic-card">
        <!-- 整卡可点：铺满卡片的透明链接，进专题首页 -->
        <a class="topic-card-link" :href="card.href" :aria-label="`${card.label} 专题`" />

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

          <!-- 该专题最近更新的一篇文章：小红点 + 标题（日期已在上面，这里不重复） -->
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
          <p v-else class="topic-latest-empty">暂无文章</p>
        </div>
      </article>
    </section>
  </div>
</template>
