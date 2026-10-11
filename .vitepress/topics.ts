import type { CategoryDef } from './autoSidebar.ts'

/**
 * 专题配置（唯一来源）
 * - config.mts 用它生成 nav 下拉与各专题的自动侧边栏
 * - 归档页（ArchivesPage.vue）用它生成「专题」列表与文章归类
 * 新增专题时只改这一处，导航 / 侧边栏 / 归档页会同步生效。
 *
 * dir       → articles/<dir>/，专题首页地址 /articles/<dir>/
 * label     → 展示名
 * categories→ 该专题下的栏目（子目录），用于生成侧边栏
 */
export interface TopicDef {
  dir: string
  label: string
  categories: CategoryDef[]
}

export const topics: TopicDef[] = [
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
    dir: 'manage',
    label: '企业管理',
    categories: [
      { dir: 'equity', label: '股权治理' },
      { dir: 'tax', label: '税务处理' },
      { dir: 'management-art', label: '管理艺术' },
    ],
  },
  {
    dir: 'notes',
    label: '随笔',
    categories: [
      { dir: 'diary', label: '日记', groupByYear: true },
      { dir: 'books', label: '读书笔记' },
      { dir: 'journal', label: '游记' },
      { dir: 'website', label: '建站笔记' },
    ],
  },
]
