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
  /** 按年份二次折叠（用于文章较多的栏目，如日记）：年份 <= YEAR_CUTOFF 归入「YYYY年及以前」，之后的每年独立一组 */
  groupByYear?: boolean
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
 * 年份二次折叠的截止年：年份 <= YEAR_CUTOFF 的文章统一归入「YYYY年及以前」折叠组，
 * 之后的每个年份（2026、2027…）各自独立一个折叠组。
 * 所有年份组默认折叠，浏览到某篇时会由 VitePress 自动展开其所在的年份组。
 */
const YEAR_CUTOFF = 2025

/** 把按日期倒序排好的条目按年份分桶，返回折叠分组（新的年份在前） */
function groupItemsByYear(items: { text: string; date: string; link: string }[]) {
  const buckets = new Map<number, { text: string; link: string }[]>()
  const noDate: { text: string; link: string }[] = []

  for (const { text, date, link } of items) {
    const y = Number(date.slice(0, 4))
    if (!Number.isFinite(y) || y <= 0) {
      noDate.push({ text, link })
      continue
    }
    const key = y <= YEAR_CUTOFF ? YEAR_CUTOFF : y
    if (!buckets.has(key)) buckets.set(key, [])
    buckets.get(key)!.push({ text, link })
  }

  const groups = [...buckets.entries()]
    .sort((a, b) => b[0] - a[0]) // 年份倒序，新在前
    .map(([key, items]) => ({
      text: key === YEAR_CUTOFF ? `${YEAR_CUTOFF}年及以前` : `${key}年`,
      collapsed: true,
      items,
    }))

  if (noDate.length) groups.push({ text: '未标注年份', collapsed: true, items: noDate })

  return groups
}

/**
 * 自动扫描一个专题下所有栏目目录，生成 VitePress sidebar 配置。
 * - 每个栏目目录 → 一个侧边栏分组，分组标题链接到栏目首页 index.md
 * - 目录下其余 .md 文件 → 自动成为该分组的条目
 * - 条目显示名优先取 frontmatter 的 sidebarTitle（侧边栏短标题），其次 title
 * - 有 frontmatter date 时按日期倒序（新的在前），否则按文件名排序
 * - 栏目开启 groupByYear 时，条目再按年份二次折叠（默认折叠，命中当前页自动展开）
 * - 新增 / 删除 md 文件后，重新跑 dev / build 即自动更新（dev 需重启）
 */
export function buildTopicSidebar(topicDir: string, categories: CategoryDef[]) {
  return categories.map(({ dir, label, groupByYear }) => {
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

    // 按需二次折叠：groupByYear 时按年份分组（默认折叠），否则平铺
    const sidebarItems = groupByYear
      ? groupItemsByYear(items)
      : items.map(({ text, link }) => ({ text, link }))

    return {
      text: label,
      link: `/${topicDir}/${dir}/`,
      collapsed: false,
      items: sidebarItems,
    }
  })
}
