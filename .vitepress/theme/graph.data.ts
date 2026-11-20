import path from 'node:path'
import { readFileSync } from 'node:fs'
import { createContentLoader } from 'vitepress'
import { getGitTimestamp } from '../gitTimestamp.mjs'
import { topics } from '../topics.ts'

export interface GraphArticle {
  id: string
  url: string
  title: string
  description: string
  topicDir: string
  topicLabel: string
  categoryDir: string
  categoryLabel: string
  tags: string[]
  date: string
  updated: string
  links: string[]
}

export interface GraphTopic {
  dir: string
  label: string
  description: string
  url: string
}

export interface GraphData {
  articles: GraphArticle[]
  topics: GraphTopic[]
}

declare const data: GraphData
export { data }

// 与 posts.data.js 保持同一份草稿排除名单（本地 SHOW_DRAFTS=1 时为空）
const siteConfig = (globalThis as any).VITEPRESS_CONFIG
const draftIgnore: string[] = (siteConfig?.userConfig?.srcExclude ?? []).map((p: string) =>
  path.resolve(siteConfig.srcDir, p),
)

const topicMap = new Map(topics.map((t) => [t.dir, t]))

function formatDate(d: unknown): string {
  if (!d) return ''
  const date = new Date(d as string | number | Date)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const SKIP_LINE = /^(#{1,6}\s|\||```|~~~|:::|-{3,}|\*{3,}|_{3,}|<|!\[)/

function stripFrontmatter(raw: string): string {
  return raw.replace(/^\uFEFF?---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
}

function firstParagraph(raw: string, max = 96): string {
  const body = stripFrontmatter(raw)
  for (const block of body.split(/\r?\n\s*\r?\n/)) {
    const lines = block
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (!lines.length || lines.every((l) => SKIP_LINE.test(l))) continue
    const text = lines
      .join(' ')
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
      .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
      .replace(/\[\[([^\]]+)\]\]/g, '$1')
      .replace(/^\s*>\s?/gm, '')
      .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
      .replace(/[*_`~#>|]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (text.length >= 12) return text.length > max ? `${text.slice(0, max)}…` : text
  }
  return ''
}

function safeDecode(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

/** 规范化文章路径为无前导斜杠、无扩展名的 POSIX 路径（如 articles/ai/ai-tech/agent-intro） */
function normalizeSlugPath(p: string): string {
  return safeDecode(p)
    .replace(/\\/g, '/')
    .replace(/[?#].*$/, '')
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/\.(md|html)$/i, '')
}

/** 从 markdown 正文中提取所有站内链接与 Obsidian 双链（[[...]]） */
function extractRawLinks(raw: string): { mdHrefs: string[]; wikiTargets: string[] } {
  // 去掉 frontmatter、围栏代码块与行内代码，避免示例代码里的假链接
  const cleaned = stripFrontmatter(raw)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/~~~[\s\S]*?~~~/g, '')
    .replace(/`[^`\n]*`/g, '')

  const mdHrefs: string[] = []
  const mdRe = /(?<!!)\[[^\]]*\]\(([^)\n]+)\)/g
  let m: RegExpExecArray | null
  while ((m = mdRe.exec(cleaned)) !== null) {
    const href = m[1].trim().split(/\s+/)[0].replace(/^<|>$/g, '')
    if (!href) continue
    if (/^(?:https?:|mailto:|tel:|javascript:|#)/i.test(href)) continue
    mdHrefs.push(href)
  }

  const wikiTargets: string[] = []
  const wikiRe = /(?<!!)\[\[([^\]\n]+)\]\]/g
  while ((m = wikiRe.exec(cleaned)) !== null) {
    const rawTarget = m[1].split('|')[0].split('#')[0].trim()
    if (rawTarget) wikiTargets.push(rawTarget)
  }

  return { mdHrefs, wikiTargets }
}

export default createContentLoader('articles/**/*.md', {
  globOptions: { ignore: draftIgnore },
  transform(rawPages): GraphData {
    interface TempItem {
      article: GraphArticle
      slugPath: string
      fileName: string
      rawContent: string
    }

    const items: TempItem[] = rawPages
      .filter((p) => !p.url.endsWith('/'))
      .map((p) => {
        const slugPath = normalizeSlugPath(p.url)
        const relMd = `${slugPath}.md`
        const abs = path.join(siteConfig.srcDir, relMd)
        let rawContent = ''
        try {
          rawContent = readFileSync(abs, 'utf-8')
        } catch {
          rawContent = ''
        }

        const segments = slugPath.split('/') // ['articles', topicDir, categoryDir, fileName]
        const topicDir = segments[1] || ''
        const categoryDir = segments.length >= 4 ? segments[2] : ''
        const fileName = segments[segments.length - 1] || ''

        const topicDef = topicMap.get(topicDir)
        const catDef = topicDef?.categories.find((c) => c.dir === categoryDir)

        const title =
          String(p.frontmatter.title || p.frontmatter.sidebarTitle || '').trim() ||
          safeDecode(fileName) ||
          '未命名'

        const date = formatDate(p.frontmatter.date)
        const updated = getGitTimestamp(abs) || date
        const tags = Array.isArray(p.frontmatter.tags)
          ? p.frontmatter.tags.map((t: unknown) => String(t).trim()).filter(Boolean)
          : []

        return {
          slugPath,
          fileName,
          rawContent,
          article: {
            id: p.url,
            url: p.url,
            title,
            description: String(p.frontmatter.description || '').trim() || firstParagraph(rawContent),
            topicDir,
            topicLabel: topicDef?.label || String(p.frontmatter.category || topicDir || '未分类'),
            categoryDir,
            categoryLabel: catDef?.label || categoryDir || '',
            tags,
            date,
            updated,
            links: [],
          },
        }
      })

    // 建立多维索引以解析标准 Markdown 链接和 Obsidian [[双链]]
    const bySlugPath = new Map<string, string>()
    const byFileName = new Map<string, string>()
    const byTitle = new Map<string, string>()

    for (const item of items) {
      bySlugPath.set(item.slugPath.toLowerCase(), item.article.id)
      const fnKey = item.fileName.toLowerCase()
      if (!byFileName.has(fnKey)) byFileName.set(fnKey, item.article.id)
      const titleKey = item.article.title.toLowerCase()
      if (!byTitle.has(titleKey)) byTitle.set(titleKey, item.article.id)
    }

    for (const item of items) {
      const { mdHrefs, wikiTargets } = extractRawLinks(item.rawContent)
      const currentDir = path.posix.dirname(item.slugPath)
      const resolved = new Set<string>()

      for (const href of mdHrefs) {
        let candidate = ''
        if (href.startsWith('/')) {
          candidate = normalizeSlugPath(href)
        } else {
          const clean = safeDecode(href).replace(/[?#].*$/, '')
          candidate = normalizeSlugPath(path.posix.join(currentDir, clean))
        }
        const targetId =
          bySlugPath.get(candidate.toLowerCase()) ||
          bySlugPath.get(`articles/${candidate}`.toLowerCase())
        if (targetId && targetId !== item.article.id) {
          resolved.add(targetId)
        }
      }

      for (const target of wikiTargets) {
        const norm = normalizeSlugPath(target)
        const relNorm = normalizeSlugPath(path.posix.join(currentDir, target))
        const targetId =
          bySlugPath.get(norm.toLowerCase()) ||
          bySlugPath.get(`articles/${norm}`.toLowerCase()) ||
          bySlugPath.get(relNorm.toLowerCase()) ||
          byFileName.get(path.posix.basename(norm).toLowerCase()) ||
          byTitle.get(target.toLowerCase())
        if (targetId && targetId !== item.article.id) {
          resolved.add(targetId)
        }
      }

      item.article.links = [...resolved]
    }

    // 按更新时间降序排列，方便侧边面板展示
    const articles = items
      .map((i) => i.article)
      .sort((a, b) => (b.updated || b.date).localeCompare(a.updated || a.date))

    return {
      articles,
      topics: topics.map((t) => ({
        dir: t.dir,
        label: t.label,
        description: t.description,
        url: `/articles/${t.dir}/index.html`,
      })),
    }
  },
})
