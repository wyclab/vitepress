import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// 项目根目录（.vitepress 的上一级）
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

export interface CategoryDef {
  /** 子目录名（articles/<专题>/<栏目>/） */
  dir: string
  /** 侧边栏 / 页面显示名 */
  label: string
}

/** 从 markdown frontmatter 里提取 title / sidebarTitle / date / order */
function parseFrontmatter(content: string): {
  title?: string
  sidebarTitle?: string
  date?: string
  order?: number
} {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!m) return {}
  const fm: Record<string, string> = {}
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return {
    title: fm.title,
    sidebarTitle: fm.sidebarTitle,
    date: fm.date,
    order: fm.order && !Number.isNaN(Number(fm.order)) ? Number(fm.order) : undefined,
  }
}

/**
 * 自动扫描一个专题下所有栏目目录，生成 VitePress sidebar 配置。
 * - 每个栏目目录 → 一个侧边栏分组，分组标题链接到栏目首页 index.md
 * - 目录下其余 .md 文件 → 自动成为该分组的条目
 * - 条目显示名优先取 frontmatter 的 sidebarTitle（侧边栏短标题），其次 title
 * - 有 frontmatter date 时按日期倒序（新的在前），否则按文件名排序
 * - 新增 / 删除 md 文件后，重新跑 dev / build 即自动更新（dev 需重启）
 */
export function buildTopicSidebar(topicDir: string, categories: CategoryDef[]) {
  return categories.map(({ dir, label }) => {
    const absDir = path.join(projectRoot, topicDir, dir)
    const files = fs.existsSync(absDir)
      ? fs
          .readdirSync(absDir)
          .filter(
            (f) =>
              (f.endsWith('.md') || f.endsWith('.mdx')) &&
              !f.startsWith('index.') &&
              !f.startsWith('_'),
          )
      : []

    const items = files
      .map((f) => {
        const slug = f.replace(/\.mdx?$/, '')
        let text = slug
        let date = ''
        let order: number | undefined
        try {
          const fm = parseFrontmatter(fs.readFileSync(path.join(absDir, f), 'utf-8'))
          // 侧边栏优先显示 sidebarTitle（短标题），其次 title
          text = fm.sidebarTitle || fm.title || slug
          if (fm.date) date = fm.date
          order = fm.order
        } catch {
          /* 读不到 frontmatter 就用文件名 */
        }
        return { text, date, order, link: `/${topicDir}/${dir}/${slug}` }
      })
      .sort((a, b) => {
        // 有 order 按 order 升序（手动编排优先），无 order 的按日期倒序排在后面
        const oa = a.order ?? Number.MAX_SAFE_INTEGER
        const ob = b.order ?? Number.MAX_SAFE_INTEGER
        if (oa !== ob) return oa - ob
        if (a.date && b.date) return a.date < b.date ? 1 : -1 // 新的在前
        if (a.date) return -1
        if (b.date) return 1
        return a.text.localeCompare(b.text, 'zh-CN')
      })
      .map(({ text, link }) => ({ text, link }))

    return {
      text: label,
      link: `/${topicDir}/${dir}/`,
      collapsed: false,
      items,
    }
  })
}
