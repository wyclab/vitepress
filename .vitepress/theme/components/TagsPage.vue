<script setup>
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.js'

// ============ 图标（Element Plus Icons, MIT，viewBox 0 0 1024 1024） ============
const ICON_PATHS = {
  // CollectionTag —— 默认标签
  tag: [
    'M256 128v698.88l196.032-156.864a96 96 0 0 1 119.936 0L768 826.816V128zm-32-64h576a32 32 0 0 1 32 32v797.44a32 32 0 0 1-51.968 24.96L531.968 720a32 32 0 0 0-39.936 0L243.968 918.4A32 32 0 0 1 192 893.44V96a32 32 0 0 1 32-32',
  ],
  // Cpu —— AI
  cpu: [
    'M320 256a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h384a64 64 0 0 0 64-64V320a64 64 0 0 0-64-64zm0-64h384a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128H320a128 128 0 0 1-128-128V320a128 128 0 0 1 128-128',
    'M512 64a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m-320 0a32 32 0 0 1 32 32v128h-64V96a32 32 0 0 1 32-32m160 896a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m160 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32m-320 0a32 32 0 0 1-32-32V800h64v128a32 32 0 0 1-32 32M64 512a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0-160a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m0 320a32 32 0 0 1 32-32h128v64H96a32 32 0 0 1-32-32m896-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0-160a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32m0 320a32 32 0 0 1-32 32H800v-64h128a32 32 0 0 1 32 32',
  ],
  // Link —— OAuth
  link: [
    'M715.648 625.152 670.4 579.904l90.496-90.56c75.008-74.944 85.12-186.368 22.656-248.896-62.528-62.464-173.952-52.352-248.96 22.656L444.16 353.6l-45.248-45.248 90.496-90.496c100.032-99.968 251.968-110.08 339.456-22.656 87.488 87.488 77.312 239.424-22.656 339.456l-90.496 90.496zm-90.496 90.496-90.496 90.496C434.624 906.112 282.688 916.224 195.2 828.8c-87.488-87.488-77.312-239.424 22.656-339.456l90.496-90.496 45.248 45.248-90.496 90.56c-75.008 74.944-85.12 186.368-22.656 248.896 62.528 62.464 173.952 52.352 248.96-22.656l90.496-90.496zm0-362.048 45.248 45.248L398.848 670.4 353.6 625.152z',
  ],
  // Operation —— 工程化 / Vue
  operation: [
    'M389.44 768a96.064 96.064 0 0 1 181.12 0H896v64H570.56a96.064 96.064 0 0 1-181.12 0H128v-64zm192-288a96.064 96.064 0 0 1 181.12 0H896v64H762.56a96.064 96.064 0 0 1-181.12 0H128v-64zm-320-288a96.064 96.064 0 0 1 181.12 0H896v64H442.56a96.064 96.064 0 0 1-181.12 0H128v-64z',
  ],
  // Monitor —— Python
  monitor: [
    'M544 768v128h192a32 32 0 1 1 0 64H288a32 32 0 1 1 0-64h192V768H192A128 128 0 0 1 64 640V256a128 128 0 0 1 128-128h640a128 128 0 0 1 128 128v384a128 128 0 0 1-128 128zM192 192a64 64 0 0 0-64 64v384a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V256a64 64 0 0 0-64-64z',
  ],
  // Message —— 邮件
  message: [
    'M128 224v512a64 64 0 0 0 64 64h640a64 64 0 0 0 64-64V224zm0-64h768a64 64 0 0 1 64 64v512a128 128 0 0 1-128 128H192A128 128 0 0 1 64 736V224a64 64 0 0 1 64-64',
    'M904 224 656.512 506.88a192 192 0 0 1-289.024 0L120 224zm-698.944 0 210.56 240.704a128 128 0 0 0 192.704 0L818.944 224z',
  ],
  // Document —— 分类默认
  document: [
    'M832 384H576V128H192v768h640zm-26.496-64L640 154.496V320zM160 64h480l256 256v608a32 32 0 0 1-32 32H160a32 32 0 0 1-32-32V96a32 32 0 0 1 32-32m160 448h384v64H320zm0-192h160v64H320zm0 384h384v64H320z',
  ],
  // EditPen —— 编程 / JavaScript / TypeScript
  editPen: [
    'm199.04 672.64 193.984 112 224-387.968-193.92-112-224 388.032zm-23.872 60.16 32.896 148.288 144.896-45.696zM455.04 229.248l193.92 112 56.704-98.112-193.984-112zM104.32 708.8l384-665.024 304.768 175.936L409.152 884.8h.064l-248.448 78.336zm384 254.272v-64h448v64z',
  ],
  // Connection —— Agent
  connection: [
    'M640 384v64H448a128 128 0 0 0-128 128v128a128 128 0 0 0 128 128h320a128 128 0 0 0 128-128V576a128 128 0 0 0-64-110.848V394.88c74.56 26.368 128 97.472 128 181.056v128a192 192 0 0 1-192 192H448a192 192 0 0 1-192-192V576a192 192 0 0 1 192-192z',
    'M384 640v-64h192a128 128 0 0 0 128-128V320a128 128 0 0 0-128-128H256a128 128 0 0 0-128 128v128a128 128 0 0 0 64 110.848v70.272A192.06 192.06 0 0 1 64 448V320a192 192 0 0 1 192-192h320a192 192 0 0 1 192 192v128a192 192 0 0 1-192 192z',
  ],
  // Platform —— Microsoft
  platform: ['M448 832v-64h128v64h192v64H256v-64zM128 704V128h768v576z'],
}

// 标签 → 图标 key（未列出的标签用默认 tag 图标）
const TAG_ICON = {
  AI: 'cpu',
  Agent: 'connection',
  Python: 'monitor',
  Microsoft: 'platform',
  OAuth: 'link',
  邮件: 'message',
  工程化: 'operation',
  编程: 'editPen',
  JavaScript: 'editPen',
  TypeScript: 'editPen',
  Vue: 'operation',
  博客: 'document',
}

// 分类 → 图标 key
const CATEGORY_ICON = {
  前端: 'document',
  随笔: 'editPen',
  项目: 'monitor',
  笔记: 'document',
}

const iconForTag = (tag) => ICON_PATHS[TAG_ICON[tag] || 'tag']
const iconForCategory = (cat) => ICON_PATHS[CATEGORY_ICON[cat] || 'document']

// ============ 标签统计（按数量降序） ============
const tagStats = computed(() => {
  const map = new Map()
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1]).map(([tag, count]) => ({ tag, count }))
})

// ============ 选中标签 + 筛选 ============
// SSR 默认选中第一个标签（数量最多），客户端挂载后再按 URL ?q 校正
const activeTag = ref(tagStats.value[0]?.tag || '')
const filtered = computed(() => (activeTag.value ? posts.filter((p) => p.tags.includes(activeTag.value)) : []))

function readQuery() {
  const q = new URLSearchParams(window.location.search).get('q')
  const valid = q && tagStats.value.some((s) => s.tag === q)
  activeTag.value = valid ? q : tagStats.value[0]?.tag || ''
}

function selectTag(tag) {
  activeTag.value = tag
  const url = new URL(window.location.href)
  url.searchParams.set('q', tag)
  window.history.pushState({}, '', url.pathname + url.search)
}

onMounted(() => {
  readQuery()
  window.addEventListener('popstate', readQuery)
})
onBeforeUnmount(() => window.removeEventListener('popstate', readQuery))
</script>

<template>
  <div id="main" class="tags-page">
    <section class="tags-section">
      <div class="section-heading">
        <h1>标签列表</h1>
        <span>共 {{ tagStats.length }} 个标签</span>
      </div>

      <div class="tag-panel">
        <button
          v-for="s in tagStats"
          :key="s.tag"
          type="button"
          class="tag-button"
          :class="{ 'is-active': activeTag === s.tag }"
          :aria-pressed="activeTag === s.tag"
          @click="selectTag(s.tag)"
        >
          <svg class="tag-icon" viewBox="0 0 1024 1024" aria-hidden="true">
            <path v-for="(d, i) in iconForTag(s.tag)" :key="i" fill="currentColor" :d="d" />
          </svg>
          <span class="tag-name">{{ s.tag }}</span>
          <span class="tag-count">{{ s.count }}</span>
        </button>
      </div>
    </section>

    <section v-if="filtered.length" class="articles-section">
      <div class="article-divider">
        <h2>{{ activeTag }} <span>- {{ filtered.length }} 篇</span></h2>
      </div>

      <div class="article-grid">
        <article v-for="p in filtered" :key="p.url" class="article-card">
          <div class="article-card-head">
            <time>{{ p.date }}</time>
            <svg class="article-icon" viewBox="0 0 1024 1024" aria-hidden="true">
              <path v-for="(d, i) in iconForCategory(p.category)" :key="i" fill="currentColor" :d="d" />
            </svg>
          </div>
          <a :href="withBase(p.url)" class="article-link">
            <h3>{{ p.title }}</h3>
          </a>
          <p>{{ p.description || '暂无摘要' }}</p>
          <div class="article-tags">
            <button
              v-for="t in p.tags"
              :key="t"
              type="button"
              :class="{ 'is-active': t === activeTag }"
              @click="selectTag(t)"
            >
              # {{ t }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <div v-else class="no-posts">暂无文章</div>
  </div>
</template>
