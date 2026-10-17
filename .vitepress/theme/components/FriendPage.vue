<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// ---------- 数据来源：pages/friend.md 的 frontmatter ----------
const friendPage = computed(() => frontmatter.value.friendPage || {})
const desc = computed(() => friendPage.value.desc || '收集一些喜欢的站点与朋友们的博客。')
const defaultAvatar = computed(() => friendPage.value.defaultAvatar || '/logo.png')

const friends = computed(() => frontmatter.value.friends || [])
const friendTemplate = computed(() => frontmatter.value.friendTemplate || null)
const friendFormat = computed(() => frontmatter.value.friendFormat || [])

// ---------- 工具 ----------
const keyword = ref('')
const copied = ref(false)

const normalize = (s) => String(s || '').trim()
const hostOf = (url) => {
  try {
    return new URL(url).host
  } catch {
    return url
  }
}

const list = computed(() =>
  friends.value.map((f) => ({
    ...f,
    name: normalize(f.name) || hostOf(f.url),
    desc: normalize(f.desc) || '欢迎访问这位朋友的网站。',
    avatar: normalize(f.avatar) || defaultAvatar.value,
    host: hostOf(f.url),
  })),
)

const total = computed(() => list.value.length)

// 按名称 / 描述 / 链接 / 域名 过滤
const filtered = computed(() => {
  const k = keyword.value.trim().toLowerCase()
  if (!k) return list.value
  return list.value.filter((f) =>
    [f.name, f.desc, f.url, f.host].some((v) => String(v || '').toLowerCase().includes(k)),
  )
})

// 头像加载失败时回退到默认头像
const onAvatarError = (e) => {
  const el = e.target
  if (el.dataset.fallbackApplied !== 'true') {
    el.dataset.fallbackApplied = 'true'
    el.src = defaultAvatar.value
  }
}

// 复制配置示例
function copyYaml() {
  const t = friendTemplate.value
  if (!t) return
  const yamlText = `- name: ${t.name || '你的站点名称'}
  url: ${t.url || 'https://example.com'}
  desc: ${t.description || '站点描述'}
  avatar: ${t.avatar || 'https://example.com/avatar.png'}`
  try {
    navigator.clipboard?.writeText(yamlText)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    /* ignore */
  }
}
</script>

<template>
  <div class="friend-page">
    <!-- 顶部卡片：标题 + 描述 + 计数 + 搜索 -->
    <div class="friend-intro">
      <div class="friend-intro-body">
        <div class="friend-intro-text">
          <h1>友链</h1>
          <p>{{ desc }}</p>
          <span class="friend-count">共 {{ total }} 个站点</span>
        </div>
        <input
          v-model="keyword"
          type="text"
          placeholder="搜索站点（名称/描述）"
          class="friend-search"
        />
      </div>
    </div>

    <!-- 友链卡片网格 -->
    <div class="friend-grid">
      <a
        v-for="(f, i) in filtered"
        :key="`${f.url}-${i}`"
        class="friend-card"
        :href="f.url"
        target="_blank"
        rel="noopener noreferrer"
      >
        <div class="friend-card-top">
          <div class="friend-avatar">
            <img :src="f.avatar" :alt="f.name" loading="lazy" @error="onAvatarError" />
          </div>
          <div class="friend-card-info">
            <h3>{{ f.name }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
        <div v-if="f.tags && f.tags.length" class="friend-tags">
          <span v-for="(t, ti) in f.tags.slice(0, 6)" :key="ti">{{ t }}</span>
        </div>
      </a>
    </div>

    <!-- 空状态 -->
    <div v-if="!filtered.length" class="friend-empty">
      <div class="friend-empty-emoji">🧩</div>
      <p>没有匹配的友链</p>
      <p>试试换个关键词，或检查 frontmatter 配置。</p>
    </div>

    <!-- 申请友链区块 -->
    <div v-if="friendTemplate || friendFormat.length" class="friend-apply">
      <div class="friend-apply-head">
        <h2>申请友链</h2>
        <span>欢迎互换友链</span>
      </div>
      <div class="friend-apply-grid">
        <!-- 本站信息 -->
        <div v-if="friendTemplate" class="friend-apply-col">
          <div class="friend-self-card">
            <div class="friend-avatar">
              <img :src="friendTemplate.avatar || defaultAvatar" :alt="friendTemplate.name" />
            </div>
            <div class="friend-card-info">
              <h3>{{ friendTemplate.name }}</h3>
              <p>{{ friendTemplate.description }}</p>
            </div>
          </div>
          <div class="friend-meta-list">
            <div class="friend-meta-item">
              <span class="friend-meta-label">本站链接</span>
              <a :href="friendTemplate.url" target="_blank" rel="noopener" class="friend-meta-value">{{ friendTemplate.url }}</a>
            </div>
            <div v-if="friendTemplate.email" class="friend-meta-item">
              <span class="friend-meta-label">联系邮箱</span>
              <span class="friend-meta-text">{{ friendTemplate.email }}</span>
            </div>
          </div>
        </div>

        <!-- 申请格式要求 -->
        <div v-if="friendFormat.length" class="friend-apply-col friend-format-col">
          <div v-for="(item, idx) in friendFormat" :key="idx" class="friend-meta-item">
            <span class="friend-meta-label">{{ item.label }}</span>
            <span class="friend-meta-text">{{ item.value }}</span>
          </div>
        </div>

        <!-- YAML 代码示例 -->
        <div v-if="friendTemplate" class="friend-apply-col">
          <div class="friend-example-head">
            <span>YAML 格式示例</span>
            <button type="button" class="friend-copy-btn" @click="copyYaml">
              {{ copied ? '已复制' : '复制配置' }}
            </button>
          </div>
          <pre class="friend-code"><code>- name: {{ friendTemplate.name || 'wyclab' }}
  url: {{ friendTemplate.url || 'https://wyclab.com' }}
  desc: {{ friendTemplate.description || '无用处实验室' }}
  avatar: {{ friendTemplate.avatar || 'https://wyclab.com/favicon/android-chrome-512x512.png' }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
