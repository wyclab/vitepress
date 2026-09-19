import { createContentLoader } from 'vitepress'

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
