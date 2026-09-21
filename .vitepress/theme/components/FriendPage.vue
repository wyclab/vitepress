<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter } = useData()

// ---------- 数据来源：pages/friend.md 的 frontmatter ----------
const friendPage = computed(() => frontmatter.value.friendPage || {})
const desc = computed(() => friendPage.value.desc || '收集一些喜欢的站点与朋友们的博客。')
const defaultAvatar = computed(() => friendPage.value.defaultAvatar || '/logo.png')

const friends = computed(() => frontmatter.value.friends || [])

// ---------- 工具 ----------
const keyword = ref('')

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
  </div>
</template>
