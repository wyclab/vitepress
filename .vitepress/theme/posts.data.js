import path from 'node:path'
import { readFileSync } from 'node:fs'
import { createContentLoader } from 'vitepress'
import { getGitTimestamp } from '../gitTimestamp.mjs'

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

// 没写 frontmatter description 时，从正文首段提取纯文本兜底。
// 首页「最近更新」会过滤掉 description 为空的文章，缺 description 的文章会被直接隐形，
// 所以这里必须给一个兜底值，避免「刚提交的文章没出现在最近更新里」。
//
// 不能用 loader 的 p.excerpt：VitePress 传给 gray-matter 的是 { excerpt: true }，
// gray-matter 的默认分隔符是正文里第一个 `---`，大多数文章没有该分隔线 → excerpt 恒为空。
// 所以这里直接读源文件、跳过 frontmatter，取第一个「像正文」的段落。
const SKIP_LINE = /^(#{1,6}\s|\||```|~~~|:::|-{3,}|\*{3,}|_{3,}|<|!\[)/

function firstParagraph(absPath, max = 72) {
  let raw
  try {
    raw = readFileSync(absPath, 'utf-8')
  } catch {
    return ''
  }
  const body = raw.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  for (const block of body.split(/\r?\n\s*\r?\n/)) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    // 跳过标题、表格、代码块、容器标记等非正文块（整块都命中才跳过）
    if (!lines.length || lines.every((l) => SKIP_LINE.test(l))) continue
    const text = lines
      .join(' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 去图片
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
      .replace(/^\s*>\s?/gm, '') // 引用标记
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '') // 列表标记
      .replace(/[*_`~#>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length >= 12) return text.length > max ? `${text.slice(0, max)}…` : text
  }
  return ''
}

export default createContentLoader('articles/**/*.md', {
  excerpt: true, // 注意：官方选项名是 excerpt（不是 excerpts）；它取的是正文中第一个 `---` 之前的内容，不是首段
  globOptions: { ignore: draftIgnore },
  transform(raw) {
    return raw
      .filter((p) => !p.url.endsWith('/')) // 过滤掉分类 index 页
      .map((p) => {
        // 从 url 反推文件路径，查 git 最后提交时间作为「更新时间」（最近更新排序用）
        const relMd = p.url.replace(/^\//, '').replace(/\.html$/, '') + '.md'
        const abs = path.join(siteConfig.srcDir, relMd)
        const updated = getGitTimestamp(abs) || formatDate(p.frontmatter.date)
        return {
          url: p.url,
          title: p.frontmatter.title || '',
          description: p.frontmatter.description || firstParagraph(abs),
          category: p.frontmatter.category || '',
          tags: Array.isArray(p.frontmatter.tags) ? p.frontmatter.tags : [],
          date: formatDate(p.frontmatter.date),
          ts: new Date(p.frontmatter.date).getTime() || 0,
          updated,
          updatedTs: new Date(updated).getTime() || 0,
          excerpt: p.excerpt || '',
        }
      })
      .sort((a, b) => b.ts - a.ts)
  },
})
