import fs from 'node:fs'
import path from 'node:path'

/**
 * 草稿（draft）判定工具
 *
 * 在文章 frontmatter 里写 `draft: yes` 即视为草稿，默认不发布：
 * 不进入构建产物，也不出现在侧边栏 / 全部文章 / 标签页 / RSS / sitemap / 站内搜索中。
 *
 * 本地想预览草稿：`SHOW_DRAFTS=1 bun run docs:dev`
 * （该开关只影响本地，`docs:build` 始终排除草稿）
 */

/** frontmatter 里 `draft` 取这些值算「是草稿」 */
const DRAFT_TRUE_VALUES = new Set(['yes', 'y', 'true', 'on', '1'])

/**
 * 判断 draft 字段的字面值是否为真。
 * 兼容两种写法：YAML 布尔 `draft: true`，以及字符串 `draft: yes`。
 */
export function isDraftFlag(value: unknown): boolean {
  if (value === true) return true
  if (typeof value === 'number') return value !== 0
  if (typeof value === 'string') return DRAFT_TRUE_VALUES.has(value.trim().toLowerCase())
  return false
}

/** 轻量 frontmatter 解析：只取顶层 `key: value`，值统一为字符串（去掉首尾引号） */
export function parseFrontmatter(content: string): Record<string, string> {
  const m = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  const fm: Record<string, string> = {}
  if (!m) return fm
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/)
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return fm
}

/** 根据 markdown 内容判断是否为草稿 */
export function isDraftContent(content: string): boolean {
  return isDraftFlag(parseFrontmatter(content).draft)
}

/** 根据文件路径判断是否为草稿（文件读不到时按「非草稿」处理） */
export function isDraftFile(absPath: string): boolean {
  try {
    return isDraftContent(fs.readFileSync(absPath, 'utf-8'))
  } catch {
    return false
  }
}

/** 递归收集目录下所有 .md 文件的绝对路径 */
export function walkMarkdown(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walkMarkdown(full, out)
    else if (entry.name.endsWith('.md')) out.push(full)
  }
  return out
}

/**
 * 收集 articles/ 下所有草稿文件相对 srcDir 的路径（POSIX 风格）。
 * 返回值直接用作 VitePress 的 `srcExclude`，也是侧边栏 / 列表 / RSS 过滤草稿的唯一依据。
 */
export function collectDrafts(srcDir: string, subDir = 'articles'): string[] {
  return walkMarkdown(path.join(srcDir, subDir))
    .filter((f) => isDraftFile(f))
    .map((f) => path.relative(srcDir, f).replace(/\\/g, '/'))
}
