import type { CategoryDef } from './autoSidebar.ts'

/**
 * 专题配置（唯一来源）
 * - config.mts 用它生成 nav 下拉与各专题的自动侧边栏
 * - 归档页（ArchivesPage.vue）用它生成「专题」列表与文章归类
 * - 专题页（TopicsPage.vue）用它生成卡片（label / description / cover）
 * 新增专题时只改这一处，导航 / 侧边栏 / 归档页 / 专题页会同步生效。
 *
 * dir         → articles/<dir>/，专题首页地址 /articles/<dir>/
 * label       → 展示名
 * categories  → 该专题下的栏目（子目录），用于生成侧边栏
 * description → 专题页卡片上的一句话简介
 * cover       → 专题页卡片封面图（public/ 下的绝对路径）
 */
export interface TopicDef {
  dir: string
  label: string
  description: string
  cover: string
  categories: CategoryDef[]
}

export const topics: TopicDef[] = [
  {
    dir: 'zstn',
    label: '置身事内',
    description: '看懂宏观、政府与企业运转的底层逻辑',
    cover: '/topics/zstn.jpg',
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
    description: '把日子过得清楚明白，少踩坑多省心',
    cover: '/topics/life.jpg',
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
    description: '科学训练、体态管理与身体使用手册',
    cover: '/topics/fitness.jpg',
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
    description: '大模型时代的投资、技术与提示词工程',
    cover: '/topics/ai.jpg',
    categories: [
      { dir: 'ai-invest', label: 'AI投资' },
      { dir: 'ai-tech', label: 'AI技术' },
      { dir: 'prompts', label: '提示词' },
    ],
  },
  {
    dir: 'invest',
    label: '投资笔记',
    description: '市场认知、策略迭代与实战复盘',
    cover: '/topics/invest.jpg',
    categories: [
      { dir: 'basics', label: '基础知识' },
      { dir: 'practice', label: '实战记录' },
    ],
  },
  {
    dir: 'manage',
    label: '企业管理',
    description: '股权治理、税务处理与管理方法论',
    cover: '/topics/manage.jpg',
    categories: [
      { dir: 'equity', label: '股权治理' },
      { dir: 'tax', label: '税务处理' },
      { dir: 'management-art', label: '管理艺术' },
    ],
  },
  {
    dir: 'notes',
    label: '随笔',
    description: '日记、读书、游记与建站过程中的碎碎念',
    cover: '/topics/notes.jpg',
    categories: [
      { dir: 'diary', label: '日记', groupByYear: true },
      { dir: 'books', label: '读书笔记' },
      { dir: 'journal', label: '游记' },
      { dir: 'website', label: '建站笔记' },
    ],
  },
]
