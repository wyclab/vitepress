<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page, frontmatter } = useData()

// 仅在文章页显示（articles/ 下的非 index 页面）
const show = computed(() => {
  const p = (page.value.relativePath || '').replace(/\\/g, '/')
  return p.startsWith('articles/') && p.endsWith('.md') && !p.endsWith('/index.md') && p !== 'articles/index.md'
})

const title = computed(() => frontmatter.value.title || page.value.title || '')

// 构建时由 config.mts 的 transformPageData 注入：{ published, updated, words, minutes, draft }
const meta = computed(() => page.value.articleMeta || null)

// 草稿标记：只有本地 SHOW_DRAFTS=1 预览时草稿页才会被渲染，线上构建产物里不存在草稿页
const isDraft = computed(() => !!meta.value?.draft)

// 发布时间（frontmatter.date），构建时已格式化为 YYYY-MM-DD，这里兜底格式化
const fmt = (d) =>
  d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? '').slice(0, 10)

const published = computed(() => meta.value?.published || fmt(frontmatter.value.date) || '')
const updated = computed(() => meta.value?.updated || '')
</script>

<template>
  <header v-if="show" class="article-header">
    <h1 class="article-header-title">
      <span v-if="isDraft" class="article-header-draft">草稿</span>{{ title }}
    </h1>
    <div v-if="meta" class="article-header-meta">
      <span v-if="published">发布: {{ published }}</span>
      <span v-if="updated">更新: {{ updated }}</span>
      <span v-if="meta?.words">字数: {{ meta.words }} 字</span>
      <span v-if="meta?.minutes">时长: 约 {{ meta.minutes }} 分钟</span>
    </div>
  </header>
</template>

<style scoped>
.article-header {
  margin-bottom: 1.25rem;
}

.article-header-title {
  margin: 0 0 0.5rem;
  padding: 0;
  border: none;
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.35;
  color: var(--vp-c-text-1);
}

/* 草稿标记：仅本地 SHOW_DRAFTS=1 预览草稿时出现 */
.article-header-draft {
  display: inline-block;
  margin-right: 0.5rem;
  padding: 0.1rem 0.45rem;
  border: 1px solid var(--vp-c-warning-1);
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.4;
  vertical-align: 0.25em;
  color: var(--vp-c-warning-1);
}

.article-header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  padding-bottom: 0.25rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
