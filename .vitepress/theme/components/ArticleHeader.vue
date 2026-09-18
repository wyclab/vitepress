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

// 构建时由 config.mts 的 transformPageData 注入：{ updated, words, minutes }
const meta = computed(() => page.value.articleMeta || null)

const updated = computed(() => {
  const fm = frontmatter.value
  return meta.value?.updated || fm.updated || fm.date || ''
})
</script>

<template>
  <header v-if="show" class="article-header">
    <h1 class="article-header-title">{{ title }}</h1>
    <div v-if="updated || meta" class="article-header-meta">
      <span v-if="updated">更新: {{ updated }}</span>
      <span v-if="meta?.words">字数: {{ meta.words }} 字</span>
      <span v-if="meta?.minutes">时长: 约 {{ meta.minutes }} 分钟</span>
    </div>
  </header>
</template>

<style scoped>
.article-header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.875rem;
  border-bottom: 1px solid var(--vp-c-divider);
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

.article-header-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem 1.25rem;
  font-size: 0.875rem;
  color: var(--vp-c-text-2);
}
</style>
