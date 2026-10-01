import { execFileSync } from 'node:child_process'

// ---------- 更新时间（自动记录，无需手动维护 frontmatter） ----------
// 文件系统的 mtime 在 CI/EdgeOne 构建环境不可靠（git clone 后所有文件 mtime 都是检出时间），
// 所以用 git 最后提交时间作为「更新时间」的权威来源；本地未提交的新文件回退到 mtime。
// 返回 YYYY-MM-DD；无 git、文件未提交或命令失败时返回空字符串。
// 供 config.mts（文章页头部）与 posts.data.js（首页「最近更新」）共用。
const gitTimeCache = new Map()

export function getGitTimestamp(absPath) {
  const cached = gitTimeCache.get(absPath)
  if (cached !== undefined) return cached
  let result = ''
  try {
    // %cI 输出严格 ISO 8601（含提交者时区，如 2026-09-19T16:38:32+08:00），取前 10 位即日期
    const iso = execFileSync('git', ['log', '-1', '--format=%cI', '--', absPath], {
      cwd: process.cwd(),
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    if (iso) result = iso.slice(0, 10)
  } catch {
    // 无 .git 目录、文件从未提交、或 git 不可用：返回空，走 mtime 兜底
  }
  gitTimeCache.set(absPath, result)
  return result
}
