<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.js'

// ============ 图标（不引入新依赖：站内 Element Plus Icons 图形 + simple-icons 品牌图形） ============
// 统一结构 { viewBox, paths }；1024 系列来自站内已有的 Element Plus Icons（MIT），
// 24 系列来自 vitepress 已安装的 @iconify-json/simple-icons（CC0），仅取所需图形内嵌，运行时无依赖。
const ICONS = {
  // —— 通用默认 ——
  tag: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M256 128v698.88l196.032-156.864a96 96 0 0 1 119.936 0L768 826.816V128zm-32-64h576a32 32 0 0 1 32 32v797.44a32 32 0 0 1-51.968 24.96L531.968 720a32 32 0 0 0-39.936 0L243.968 918.4A32 32 0 0 1 192 893.44V96a32 32 0 0 1 32-32',
    ],
  },
  document: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z',
    ],
  },
  editPen: {
    viewBox: '0 0 1024 1024',
    paths: [
      'm199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696zM455.04 229.248l193.92 112 56.704-98.112-193.984-112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336zm384 254.272v-64h448v64z',
    ],
  },
  operation: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M389.44 768a96.064 96.064 0 0 1 181.12 0H896v64H570.56a96.064 96.064 0 0 1-181.12 0H128v-64zm192-288a96.064 96.064 0 0 1 181.12 0H896v64H762.56a96.064 96.064 0 0 1-181.12 0H128v-64zm-320-288a96.064 96.064 0 0 1 181.12 0H896v64H442.56a96.064 96.064 0 0 1-181.12 0H128v-64z',
    ],
  },
  platform: {
    viewBox: '0 0 1024 1024',
    paths: ['M448 832v-64h128v64h192v64H256v-64zM128 704V128h768v576z'],
  },
  cpu: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M320 256a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h384a64 64 0 0 0 64-64V320a64 64 0 0 0-64-64zm0-64h384a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H320a128 128 0 0 1-128-128V320a128 128 0 0 1 128-128',
      'M512 64a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m-320 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 896a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m160 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m-320 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32M64 512a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0-160a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0 320a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m896-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0 320a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32',
    ],
  },
  // —— 观察 / 数据 ——
  columns: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M128 544h160v352H128z',
      'M416 320h160v576H416z',
      'M704 640h160v256H704z',
      'M64 896h896v64H64z',
    ],
  },
  scale: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M64 224h896v64H64z',
      'M480 288h64v480H480z',
      'M288 768h448v64H288z',
      'M128 288h256l-128 256z',
      'M640 288h256l-128 256z',
    ],
  },
  // —— 生活 ——
  home: {
    viewBox: '0 0 1024 1024',
    paths: ['M512 96 96 448h864L512 96z', 'M192 512h640v416H192z'],
  },
  book: {
    viewBox: '0 0 1024 1024',
    paths: ['M160 192h320v640H160z', 'M544 192h320v640H544z', 'M480 224h64v576h-64z'],
  },
  bottle: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M448 128h128v160a64 64 0 0 1-128 0z',
      'M384 352h256v64H384z',
      'M384 416h256v480a64 64 0 0 1-64 64H448a64 64 0 0 1-64-64z',
    ],
  },
  bulb: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M512 96a288 288 0 0 0 0 576 288 288 0 0 0 0-576z',
      'M416 672h192v96H416z',
      'M384 800h256v64H384z',
    ],
  },
  car: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M288 448h448l96 160H192z',
      'M128 608h768v96H128z',
      'M256 704a64 64 0 0 0 0 128 64 64 0 0 0 0-128z',
      'M768 704a64 64 0 0 0 0 128 64 64 0 0 0 0-128z',
    ],
  },
  gamepad: {
    viewBox: '0 0 1024 1024',
    paths: [
      'M288 384h448a192 192 0 0 1 192 192v64a128 128 0 0 1-128 128H224a128 128 0 0 1-128-128v-64a192 192 0 0 1 192-192z',
      'M160 704a96 96 0 0 0 0 192 96 96 0 0 0 0-192z',
      'M864 704a96 96 0 0 0 0 192 96 96 0 0 0 0-192z',
    ],
  },
  // —— 位置 / 健康 ——
  pin: {
    viewBox: '0 0 1024 1024',
    paths: ['M512 64a256 256 0 0 0-256 256c0 176 256 448 256 448s256-272 256-448A256 256 0 0 0 512 64z'],
  },
  dumbbell: {
    viewBox: '0 0 1024 1024',
    paths: ['M160 384h128v256H160z', 'M288 448h448v128H288z', 'M736 384h128v256H736z'],
  },
  heart: {
    viewBox: '0 0 1024 1024',
    paths: ['M512 896 208 592a192 192 0 0 1 272-272l32 32 32-32a192 192 0 0 1 272 272z'],
  },
  // —— 品牌（simple-icons, CC0） ——
  huawei: {
    viewBox: '0 0 24 24',
    paths: [
      'M3.67 6.14S1.82 7.91 1.72 9.78v.35c.08 1.51 1.22 2.4 1.22 2.4c1.83 1.79 6.26 4.04 7.3 4.55c0 0 .06.03.1-.01l.02-.04v-.04C7.52 10.8 3.67 6.14 3.67 6.14M9.65 18.6c-.02-.08-.1-.08-.1-.08l-7.38.26c.8 1.43 2.15 2.53 3.56 2.2c.96-.25 3.16-1.78 3.88-2.3c.06-.05.04-.09.04-.09zm.08-.78C6.49 15.63.21 12.28.21 12.28c-.15.46-.2.9-.21 1.3v.07c0 1.07.4 1.82.4 1.82c.8 1.69 2.34 2.2 2.34 2.2c.7.3 1.4.31 1.4.31c.12.02 4.4 0 5.54 0c.05 0 .08-.05.08-.05v-.06c0-.03-.03-.05-.03-.05M9.06 3.19a3.42 3.42 0 0 0-2.57 3.15v.41c.03.6.16 1.05.16 1.05c.66 2.9 3.86 7.65 4.55 8.65c.05.05.1.03.1.03a.1.1 0 0 0 .06-.1c1.06-10.6-1.11-13.42-1.11-13.42c-.32.02-1.19.23-1.19.23m8.299 2.27s-.49-1.8-2.44-2.28c0 0-.57-.14-1.17-.22c0 0-2.18 2.81-1.12 13.43c.01.07.06.08.06.08c.07.03.1-.03.1-.03c.72-1.03 3.9-5.76 4.55-8.64c0 0 .36-1.4.02-2.34m-2.92 13.07s-.07 0-.09.05c0 0-.01.07.03.1c.7.51 2.85 2 3.88 2.3c0 0 .16.05.43.06h.14c.69-.02 1.9-.37 3-2.26l-7.4-.25zm7.83-8.41c.14-2.06-1.94-3.97-1.94-3.98c0 0-3.85 4.66-6.67 10.8c0 0-.03.08.02.13l.04.01h.06c1.06-.53 5.46-2.77 7.28-4.54c0 0 1.15-.93 1.21-2.42m1.52 2.14s-6.28 3.37-9.52 5.55c0 0-.05.04-.03.11c0 0 .03.06.07.06c1.16 0 5.56 0 5.67-.02c0 0 .57-.02 1.27-.29c0 0 1.56-.5 2.37-2.27c0 0 .73-1.45.17-3.14',
    ],
  },
}

// 标签 → 图标 key（未列出的标签自动回落到 tag 图标）
const TAG_ICON = {
  // 观察 / 财经
  企业观察: 'columns',
  宏观观察: 'columns',
  政府观察: 'columns',
  地方政府: 'columns',
  地方债务: 'columns',
  法治观察: 'scale',
  股权治理: 'document',
  税务处理: 'document',
  基础知识: 'document',
  // AI
  AI: 'cpu',
  AI技术: 'cpu',
  // 生活
  生活: 'home',
  家庭: 'home',
  智能生活: 'bulb',
  汽车: 'car',
  游戏: 'gamepad',
  北京通: 'pin',
  游记: 'pin',
  旅行: 'pin',
  养娃记录: 'bottle',
  读书笔记: 'book',
  // 健康 / 健身
  健康: 'heart',
  力量训练: 'dumbbell',
  功能训练: 'dumbbell',
  日常体态: 'dumbbell',
  // 记录 / 管理
  日记: 'editPen',
  记录: 'editPen',
  建站笔记: 'platform',
  生产力: 'operation',
  管理: 'operation',
  领导力: 'operation',
  人生: 'operation',
  人生主线: 'operation',
  // 品牌
  华为: 'huawei',
}

const iconForTag = (tag) => ICONS[TAG_ICON[tag]] || ICONS.tag

// ============ 标签统计（按数量降序） ============
const tagStats = computed(() => {
  const map = new Map()
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
})

// ============ 选中标签 + 筛选（沿用原标签页交互） ============
// 默认不筛选（展示全部文章）；URL ?q=<标签> 可直接定位到某个标签的筛选结果
const activeTag = ref('')
const filtered = computed(() =>
  activeTag.value ? posts.filter((p) => p.tags.includes(activeTag.value)) : posts,
)

function readQuery() {
  const q = new URLSearchParams(window.location.search).get('q')
  activeTag.value = q && tagStats.value.some((s) => s.tag === q) ? q : ''
}

function syncUrl(tag) {
  const url = new URL(window.location.href)
  if (tag) url.searchParams.set('q', tag)
  else url.searchParams.delete('q')
  window.history.pushState({}, '', url.pathname + url.search)
}

// 点击标签：未选中 → 选中；已选中 → 再点一次取消筛选
function toggleTag(tag) {
  const next = activeTag.value === tag ? '' : tag
  activeTag.value = next
  syncUrl(next)
  if (next) scrollToList()
}

function clearFilter() {
  activeTag.value = ''
  syncUrl('')
}

// 筛选后把文章列表滚到可视区（顶部导航是 fixed 的，需要减去导航高度）
function scrollToList() {
  const el = document.getElementById('archive-posts')
  if (!el) return
  const navHeight =
    parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--vp-nav-height')) || 0
  const top = el.getBoundingClientRect().top + window.scrollY - navHeight - 16
  window.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

onMounted(() => {
  readQuery()
  window.addEventListener('popstate', readQuery)
})
onBeforeUnmount(() => window.removeEventListener('popstate', readQuery))

// ============ 按发布时间倒序 + 年 / 月分组 ============
// 年份倒序，新的在前；解析不出年份的（缺 date）统一沉到末尾
function sortKeysDesc(a, b) {
  const na = Number(a)
  const nb = Number(b)
  const aNum = Number.isFinite(na) && na > 0
  const bNum = Number.isFinite(nb) && nb > 0
  if (aNum && bNum) return nb - na
  if (aNum) return -1
  if (bNum) return 1
  return 0
}

const groups = computed(() => {
  const years = new Map()
  for (const p of filtered.value) {
    const year = p.date.slice(0, 4) || '未知年份'
    const month = p.date.slice(5, 7) || '00'
    if (!years.has(year)) years.set(year, new Map())
    const months = years.get(year)
    if (!months.has(month)) months.set(month, [])
    months.get(month).push(p)
  }
  return [...years.entries()]
    .sort((a, b) => sortKeysDesc(a[0], b[0]))
    .map(([year, months]) => {
      const monthList = [...months.entries()]
        .sort((a, b) => sortKeysDesc(a[0], b[0]))
        .map(([month, list]) => ({ month, count: list.length, list }))
      return {
        year,
        count: monthList.reduce((sum, m) => sum + m.count, 0),
        months: monthList,
      }
    })
})

// 日期显示为 MM-DD（年份已在分组标题里）
const mmdd = (d) => (d ? d.slice(5) : '--')
const monthLabel = (m) => (m === '00' ? '未标注月份' : `${Number(m)}月`)
// 兜底：个别文章缺 frontmatter title 时不至于出现空行，用文件名代替
const titleOf = (p) => {
  if (p.title) return p.title
  const slug = String(p.url || '').split('/').pop() || ''
  return decodeURIComponent(slug.replace(/\.html$/, '')) || '未命名'
}
</script>

<template>
  <div id="main" class="archives-page">
    <header class="arch-head">
      <h1>归档</h1>
      <p class="arch-sub">共 {{ posts.length }} 篇文章 · {{ tagStats.length }} 个标签</p>
    </header>

    <!-- 桌面：左文章 / 右标签筛选；窄屏：标签在上、文章在下（DOM 顺序即窄屏顺序） -->
    <div class="arch-body">
      <!-- ========== 标签筛选 ========== -->
      <aside class="arch-aside">
        <section class="arch-section">
          <div class="section-heading">
            <h2>标签</h2>
            <span>{{ tagStats.length }} 个</span>
          </div>

          <div v-if="tagStats.length" class="tag-panel">
            <button
              v-for="s in tagStats"
              :key="s.tag"
              type="button"
              class="tag-button"
              :class="{ 'is-active': activeTag === s.tag }"
              :aria-pressed="activeTag === s.tag"
              :title="activeTag === s.tag ? `取消筛选：${s.tag}` : `只看：${s.tag}`"
              @click="toggleTag(s.tag)"
            >
              <svg class="tag-icon" :viewBox="iconForTag(s.tag).viewBox" aria-hidden="true">
                <path v-for="(d, i) in iconForTag(s.tag).paths" :key="i" fill="currentColor" :d="d" />
              </svg>
              <span class="tag-name">{{ s.tag }}</span>
              <span class="tag-count">{{ s.count }}</span>
            </button>
          </div>
          <div v-else class="arch-empty">暂无标签</div>
        </section>
      </aside>

      <!-- ========== 文章 ========== -->
      <div class="arch-main">
        <section id="archive-posts" class="arch-section">
          <div class="section-heading">
            <h2>{{ activeTag ? `标签：${activeTag}` : '全部文章' }}</h2>
            <span class="arch-heading-right">
              {{ filtered.length }} 篇
              <button v-if="activeTag" type="button" class="arch-clear" @click="clearFilter">
                清除筛选
              </button>
            </span>
          </div>

          <div v-if="!filtered.length" class="arch-empty">
            <p v-if="activeTag">没有带「{{ activeTag }}」标签的文章</p>
            <p v-else>暂无文章</p>
            <button v-if="activeTag" type="button" class="arch-clear" @click="clearFilter">
              清除筛选
            </button>
          </div>

          <div v-else class="arch-years">
            <div v-for="g in groups" :key="g.year" class="arch-year">
              <h3 class="arch-year-title">{{ g.year }}<span>{{ g.count }} 篇</span></h3>

              <div v-for="m in g.months" :key="m.month" class="arch-month">
                <h4 class="arch-month-title">
                  {{ monthLabel(m.month) }}<span>{{ m.count }} 篇</span>
                </h4>
                <ul class="arch-list">
                  <li v-for="p in m.list" :key="p.url" class="arch-row">
                    <time class="arch-date">{{ mmdd(p.date) }}</time>
                    <a
                      class="arch-title"
                      :href="withBase(p.url)"
                      :title="titleOf(p)"
                    >{{ titleOf(p) }}</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
