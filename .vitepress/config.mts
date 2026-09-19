import fs from 'node:fs'
import path from 'node:path'
import { defineConfig } from 'vitepress'
import type { Plugin } from 'vite'
import { buildTopicSidebar, type CategoryDef } from './autoSidebar.ts'

// ---------- dev 下文章增删时自动重启，刷新自动侧边栏 ----------
// 侧边栏是 config 加载时扫描目录生成的静态配置，dev 中新增/删除 md 不会自动重算。
// 这里监听 articles/ 下 md 文件的创建与删除，防抖后重启 dev server。
function sidebarAutoRestart(): Plugin {
  let timer: NodeJS.Timeout | undefined
  return {
    name: 'sidebar-auto-restart',
    apply: 'serve',
    configureServer(server) {
      const refresh = (file: string) => {
        if (!file.replace(/\\/g, '/').includes('/articles/') || !file.endsWith('.md')) return
        if (file.includes('/node_modules/') || file.endsWith('index.md')) return
        clearTimeout(timer)
        timer = setTimeout(() => server.restart(), 500)
      }
      server.watcher.on('add', refresh)
      server.watcher.on('unlink', refresh)
    },
  }
}

// ---------- 专题配置（每个专题一个目录，侧边栏按目录自动生成） ----------
interface TopicDef {
  dir: string
  label: string
  categories: CategoryDef[]
}

const topics: TopicDef[] = [
  {
    dir: 'zstn',
    label: '置身事内',
    categories: [
      { dir: 'macro', label: '宏观观察' },
      { dir: 'gov', label: '政府观察' },
      { dir: 'firm', label: '企业观察' },
      { dir: 'law', label: '法治观察' },
    ],
  },
  {
    dir: 'life',
    label: '生活指南',
    categories: [
      { dir: 'life-plan', label: '人生主线' },
      { dir: 'beijing', label: '北京通' },
      { dir: 'parenting', label: '养娃记录' },
      { dir: 'smart-life', label: '智能生活' },
      { dir: 'productivity', label: '生产力' },
    ],
  },
  {
    dir: 'fitness',
    label: '健康健身',
    categories: [
      { dir: 'basics', label: '基础知识' },
      { dir: 'posture', label: '日常体态' },
      { dir: 'functional', label: '功能训练' },
      { dir: 'strength', label: '力量训练' },
    ],
  },
  {
    dir: 'ai',
    label: 'AI世界',
    categories: [
      { dir: 'ai-invest', label: 'AI投资' },
      { dir: 'ai-tech', label: 'AI技术' },
      { dir: 'prompts', label: '提示词' },
    ],
  },
  {
    dir: 'invest',
    label: '投资笔记',
    categories: [
      { dir: 'basics', label: '基础知识' },
      { dir: 'practice', label: '实战记录' },
    ],
  },
  {
    dir: 'notes',
    label: '随笔',
    categories: [
      { dir: 'diary', label: '日记' },
      { dir: 'books', label: '读书笔记' },
      { dir: 'journal', label: '游记' },
      { dir: 'website', label: '建站笔记' },
    ],
  },
]

// 生成 sidebar：'/articles/<专题>/' → 自动扫描的侧边栏
function buildTopicsSidebar(): Record<string, ReturnType<typeof buildTopicSidebar>> {
  return Object.fromEntries(
    topics.map((t) => [`/articles/${t.dir}/`, buildTopicSidebar(`articles/${t.dir}`, t.categories)]),
  )
}

// ---------- 文章页头部元信息（更新时间 / 字数 / 阅读时长） ----------
// 注入到 pageData.articleMeta，由 ArticleHeader.vue 展示
// YAML 会把 date/updated 解析成 Date 对象，统一格式化为 YYYY-MM-DD
function fmtDate(d: any): string {
  if (d instanceof Date) return d.toISOString().slice(0, 10)
  return String(d ?? '').slice(0, 10)
}

function injectArticleMeta(pageData: any, cfg: any) {
  const rel: string | undefined = pageData.relativePath
  if (!rel) return
  const relPath = rel.replace(/\\/g, '/')
  // 只处理文章页，栏目/专题首页不注入
  if (!relPath.startsWith('articles/') || relPath.endsWith('/index.md') || relPath === 'articles/index.md') return
  const abs = path.join(cfg?.srcDir || process.cwd(), relPath)
  if (!fs.existsSync(abs)) return

  let raw = ''
  try {
    raw = fs.readFileSync(abs, 'utf-8')
  } catch {
    return
  }
  // 去掉 frontmatter 和代码块后按字符数统计（中文场景）
  const body = raw
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\s/g, '')
  const words = body.length

  // 更新时间优先级：frontmatter updated > frontmatter date > 文件修改时间
  const fmUpdated = pageData.frontmatter?.updated || pageData.frontmatter?.date
  const mtime = new Date(fs.statSync(abs).mtimeMs)
  const updated = fmtDate(fmUpdated) || mtime.toISOString().slice(0, 10)

  pageData.articleMeta = {
    updated,
    words,
    minutes: Math.max(1, Math.round(words / 400)),
  }
}

// ---------- RSS 生成（构建结束时输出 feed.xml） ----------
function parseFrontmatter(content: string): Record<string, any> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const fm: Record<string, any> = {}
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, value] = kv
    if (value.startsWith('[') && value.endsWith(']')) {
      fm[key] = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean)
    } else {
      fm[key] = value.replace(/^['"]|['"]$/g, '')
    }
  }
  return fm
}

function walkMarkdown(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

// XML 文本节点转义，避免标题/描述中的 & < > 破坏 feed 结构
function escapeXml(value: any): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateRss(siteConfig: any) {
  const srcDir = siteConfig.srcDir
  const articlesDir = path.join(srcDir, 'articles')
  // cleanUrls 关闭时构建产物是 xxx.html，feed 里的链接必须与产物一致，否则会 404
  const cleanUrls = !!siteConfig.cleanUrls
  const posts = walkMarkdown(articlesDir)
    .filter((f) => !path.basename(f).startsWith('index.'))
    .map((f) => {
      const content = fs.readFileSync(f, 'utf-8')
      const fm = parseFrontmatter(content)
      const rel = path.relative(srcDir, f).replace(/\\/g, '/').replace(/\.md$/, '')
      return {
        title: fm.title || path.basename(f, '.md'),
        description: fm.description || '',
        date: fm.date ? new Date(fm.date) : new Date(),
        url: cleanUrls ? rel : `${rel}.html`,
        tags: Array.isArray(fm.tags) ? fm.tags : [],
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  const site = siteConfig.site
  const base = String(site.base || '/')
  // 站点域名来自 siteOrigin 常量（VitePress 的 siteConfig 里没有 origin 字段）
  const origin = siteOrigin.replace(/\/+$/, '')
  const siteUrl = origin + base

  const items = posts
    .map(
      (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${siteUrl}${p.url}</link>
      <guid isPermaLink="true">${siteUrl}${p.url}</guid>
      <description>${escapeXml(p.description)}</description>
      <pubDate>${p.date.toUTCString()}</pubDate>
${p.tags.map((t: string) => `      <category>${escapeXml(t)}</category>`).join('\n')}
    </item>`
    )
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(site.title)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(site.description)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}feed.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`
  fs.writeFileSync(path.join(siteConfig.outDir, 'feed.xml'), xml)
}

// ---------- 站点信息（按需修改） ----------
const siteTitle = '无用处'
const siteDescription = '无用处实验室，看似无用，实则真的无用。'
// 站点域名：RSS / sitemap 等绝对链接的唯一来源，换域名只改这一处
const siteOrigin = 'https://wyclab.com'

export default defineConfig({
  lang: 'zh-CN',
  title: siteTitle,
  // 亮/暗主题：默认跟随系统偏好，同时提供手动切换按钮
  appearance: true,
  description: siteDescription,
  ignoreDeadLinks: true,
  // 自动生成 sitemap.xml，与 RSS 共用同一域名
  sitemap: { hostname: siteOrigin },
  head: [
    // Favicon（public/ 根目录 + public/favicon/ 目录）
    // 注意：iPad/iPhone Safari 只会请求站点根路径的 /apple-touch-icon.png 和 /favicon.ico，
    // 必须保证这两个文件存在于根目录，否则会显示缓存的默认图标（如腾讯网图标）。
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' }],
    ['link', { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/favicon/android-chrome-192x192.png' }],
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' }],
    // RSS
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: siteTitle, href: '/feed.xml' }],
  ],

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章', link: '/pages/posts' },
      {
        text: '专题',
        items: topics.map((t) => ({ text: t.label, link: `/articles/${t.dir}/` })),
      },
      { text: '标签', link: '/pages/tags' },
      { text: '友链', link: '/pages/friend' },
      { text: '关于', link: '/pages/about' },
    ],

    sidebar: {
      // 各专题：自动侧边栏（新增 md 文件后自动更新）
      ...buildTopicsSidebar(),
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文章', buttonAriaLabel: '搜索文章' },
          modal: {
            noResultsText: '未找到相关结果',
            resetButtonTitle: '清除查询条件',
            displayDetails: '显示详细列表',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' },
          },
        },
      },
    },

    outline: { level: [2, 3], label: '页面导航' },
    docFooter: { prev: '上一篇', next: '下一篇' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到亮色模式',
    darkModeSwitchTitle: '切换到暗色模式',
  },

  vite: {
    plugins: [sidebarAutoRestart()],
  },

  buildEnd(siteConfig: any) {
    generateRss(siteConfig)
  },

  transformPageData(pageData: any, siteConfig: any) {
    injectArticleMeta(pageData, siteConfig)
  },
})
