import path from 'node:path'
import { createContentLoader } from 'vitepress'

// ---------- 草稿（draft: yes）过滤 ----------
// config.mts 已经把 `draft: yes` 的文章算进 srcExclude（本地 SHOW_DRAFTS=1 时该数组为空），
// 这里复用同一份名单做 glob ignore，保证「全部文章 / 标签页」与构建结果一致。
// 注意：数据加载器的 glob 不会自动应用 srcExclude，必须手动传 ignore。
const siteConfig = globalThis.VITEPRESS_CONFIG
const draftIgnore = (siteConfig?.userConfig?.srcExclude ?? []).map((p) =>
  path.resolve(siteConfig.srcDir, p),
)

function formatDate(d) {
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default createContentLoader('articles/**/*.md', {
  excerpt: true, // 注意：官方选项名是 excerpt（不是 excerpts），开启后 p.excerpt 为首段渲染的 HTML
  globOptions: { ignore: draftIgnore },
  transform(raw) {
    return raw
      .filter((p) => !p.url.endsWith('/')) // 过滤掉分类 index 页
      .map((p) => ({
        url: p.url,
        title: p.frontmatter.title || '',
        description: p.frontmatter.description || '',
        category: p.frontmatter.category || '',
        tags: Array.isArray(p.frontmatter.tags) ? p.frontmatter.tags : [],
        date: formatDate(p.frontmatter.date),
        ts: new Date(p.frontmatter.date).getTime() || 0,
        excerpt: p.excerpt || '',
      }))
      .sort((a, b) => b.ts - a.ts)
  },
})
