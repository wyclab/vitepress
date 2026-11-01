<script setup>
import { computed } from 'vue'
import { useData, withBase } from 'vitepress'
import { topics } from '../../topics.ts'
import { data as posts } from '../posts.data.js'

/**
 * 专题 / 栏目首页的文章目录（自动生成）
 * - articles/<专题>/index.md        → 按栏目分组，列出该专题全部文章
 * - articles/<专题>/<栏目>/index.md → 平铺列出该栏目全部文章
 * 数据来自 posts.data.js（已排除 index 页与草稿），新增文章后无需手改页面。
 * 只在这两类页面渲染，其他页面直接返回空（不影响文章页）。
 */

const { page } = useData()

// 没有 order 的文章排在最后（与自动侧边栏的排序规则保持一致）
const NO_ORDER = Number.MAX_SAFE_INTEGER

// 兜底：个别文章缺 frontmatter.title 时用文件名代替，避免出现空链接
const titleOf = (p) => {
  if (p.title) return p.title
  const slug = String(p.url || '').split('/').pop() || ''
  return decodeURIComponent(slug.replace(/\.html$/, '')) || '未命名'
}

// 解析当前页面身份：匹配到才渲染
const view = computed(() => {
  const rel = (page.value.relativePath || '').replace(/\\/g, '/')
  const m = rel.match(/^articles\/([^/]+)(?:\/([^/]+))?\/index\.md$/)
  if (!m) return null
  const topicDir = m[1]
  const categoryDir = m[2] || ''
  const topic = topics.find((t) => t.dir === topicDir)
  return {
    topicDir,
    categoryDir,
    topicLabel: topic?.label || topicDir,
    categories: topic?.categories || [],
  }
})

// 当前页面对应的 url 前缀（专题页覆盖整个专题，栏目页只覆盖该栏目）
const list = computed(() => {
  if (!view.value) return []
  const { topicDir, categoryDir } = view.value
  const prefix = categoryDir ? `/articles/${topicDir}/${categoryDir}/` : `/articles/${topicDir}/`
  return posts
    .filter((p) => p.url.startsWith(prefix))
    .sort((a, b) => {
      // 有 order 的按 order 升序（手动编排优先），其余按发布时间倒序
      const oa = a.order > 0 ? a.order : NO_ORDER
      const ob = b.order > 0 ? b.order : NO_ORDER
      if (oa !== ob) return oa - ob
      if ((a.ts || 0) !== (b.ts || 0)) return (b.ts || 0) - (a.ts || 0)
      return titleOf(a).localeCompare(titleOf(b), 'zh-CN')
    })
})

// 专题页：按 topics.ts 里的栏目顺序分组，未在 topics.ts 登记的目录排在最后
const groups = computed(() => {
  if (!view.value || view.value.categoryDir) return []
  const { topicDir, categories } = view.value
  const map = new Map()
  for (const p of list.value) {
    const rest = p.url.slice(`/articles/${topicDir}/`.length)
    const dir = rest.includes('/') ? rest.slice(0, rest.indexOf('/')) : ''
    if (!map.has(dir)) map.set(dir, [])
    map.get(dir).push(p)
  }
  const out = []
  for (const c of categories) {
    // 栏目即使暂时没有文章也保留，让目录结构与侧边栏一致
    out.push({ dir: c.dir, label: c.label, items: map.get(c.dir) || [] })
    map.delete(c.dir)
  }
  for (const [dir, items] of map) {
    if (!dir) continue // 直接放在专题根目录下的文章已在平铺列表中体现
    out.push({ dir, label: dir, items })
  }
  return out
})
</script>

<template>
  <section v-if="view" class="topic-index">
    <div class="ti-head">
      <h2 class="ti-title">目录</h2>
      <span class="ti-count">共 {{ list.length }} 篇</span>
    </div>

    <p v-if="!list.length" class="ti-empty">还没有文章，后续发布后会自动出现在这里。</p>

    <template v-else>
      <!-- 栏目首页：平铺列出该栏目的全部文章 -->
      <ul v-if="view.categoryDir" class="ti-list">
        <li v-for="p in list" :key="p.url">
          <a :href="withBase(p.url)">{{ titleOf(p) }}</a>
        </li>
      </ul>

      <!-- 专题首页：按栏目分组，栏目标题可点击进入栏目首页 -->
      <div v-else class="ti-groups">
        <div v-for="g in groups" :key="g.dir || 'misc'" class="ti-group">
          <h3 class="ti-group-title">
            <a
              v-if="g.dir"
              :href="withBase(`/articles/${view.topicDir}/${g.dir}/index.html`)"
            >{{ g.label }}</a>
            <span v-else>{{ g.label }}</span>
            <span class="ti-group-count">{{ g.items.length }} 篇</span>
          </h3>
          <ul v-if="g.items.length" class="ti-list">
            <li v-for="p in g.items" :key="p.url">
              <a :href="withBase(p.url)">{{ titleOf(p) }}</a>
            </li>
          </ul>
          <p v-else class="ti-empty">暂无文章</p>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
/* 目录区块：注入在正文之后、上一篇/下一篇之前（VPDocFooter 的 margin-top 已给出上方留白） */
.topic-index {
  margin-bottom: 2.5rem;
}

.ti-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--vp-c-divider);
}

.ti-title {
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.01em;
  color: var(--vp-c-text-1);
}

.ti-count {
  font-size: 0.8125rem;
  color: var(--vp-c-text-3);
}

.ti-list {
  margin: 0;
  padding-left: 1.25rem;
  list-style: disc;
}

.ti-list li {
  margin: 0.5rem 0;
  line-height: 1.75;
}

.ti-list li::marker {
  color: var(--vp-c-text-3);
}

.ti-list a {
  color: var(--vp-c-text-1);
  font-weight: 500;
  text-decoration: none;
  transition: color 0.2s ease;
}

.ti-list a:hover {
  color: var(--vp-c-brand-1);
  text-decoration: underline;
  text-underline-offset: 0.25em;
}

/* 专题首页的栏目分组 */
.ti-group + .ti-group {
  margin-top: 1.75rem;
}

.ti-group-title {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
  padding: 0;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--vp-c-text-1);
}

.ti-group-title a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s ease;
}

.ti-group-title a:hover {
  color: var(--vp-c-brand-1);
}

.ti-group-title a::after {
  content: '→';
  margin-left: 0.35rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.ti-group-count {
  font-size: 0.75rem;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.ti-empty {
  margin: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--vp-c-text-3);
}

@media (max-width: 640px) {
  .ti-title {
    font-size: 1.25rem;
  }

  .ti-list {
    padding-left: 1.1rem;
  }
}
</style>
