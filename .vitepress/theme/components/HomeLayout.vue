<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { withBase } from 'vitepress'
import { data as posts } from '../posts.data.js'

// ---------- 站点信息（按需修改） ----------
const authorName = '无用处'
const authorDesc = '无用的兴趣是最高级的乐趣  | 无用之物是最高等级的美好'
const avatar = 'https://github.com/wyclab.png'
const socials = [
  { name: 'GitHub', link: 'https://github.com/wyclab' },
  { name: 'RSS订阅', link: '/feed.xml' },
]

const siteTitle = '无用处实验室'
const siteDesc = '无用处实验室，看似无用，实则真的无用。'

// ---------- 标签统计 ----------
const tagCounts = computed(() => {
  const map = new Map()
  for (const p of posts) for (const t of p.tags) map.set(t, (map.get(t) || 0) + 1)
  return [...map.entries()].sort((a, b) => b[1] - a[1])
})

// ---------- 精选轮播 ----------
const recommended = computed(() => posts.filter((p) => p.description).slice(0, 6))
const recPages = computed(() => {
  const pages = []
  for (let i = 0; i < recommended.value.length; i += 2) pages.push(recommended.value.slice(i, i + 2))
  return pages
})
const current = ref(0)
let timer = null
onMounted(() => {
  if (recPages.value.length > 1) {
    timer = setInterval(() => {
      current.value = (current.value + 1) % recPages.value.length
    }, 4500)
  }
})
onUnmounted(() => timer && clearInterval(timer))

// ---------- 最新文章 ----------
const latest = computed(() => posts.slice(0, 8))
</script>

<template>
  <div class="blog-home">
    <div class="container">
      <!-- 顶部区域 -->
      <div class="top-grid">
        <div class="top-left">
          <div class="hero-card card">
            <div>
              <h1 class="hero-title">{{ siteTitle }}</h1>
              <p class="hero-desc">{{ siteDesc }}</p>
            </div>

            <!-- 作者信息 -->
            <div class="head-wrapper">
              <img class="head-img" :src="avatar" :alt="authorName" />
              <div class="head-info">
                <h3 class="head-name">{{ authorName }}</h3>
                <p class="head-desc">{{ authorDesc }}</p>
                <div class="head-social">
                  <a
                    v-for="s in socials"
                    :key="s.name"
                    class="social-link"
                    :href="s.link"
                    target="_blank"
                    rel="noopener"
                    :title="s.name"
                  >{{ s.name }}</a>
                </div>
              </div>
            </div>

            <!-- 标签跑马灯 -->
            <div class="tag-marquee" v-if="tagCounts.length">
              <div class="tag-marquee-track">
                <div class="tag-marquee-group" v-for="n in 2" :key="n" :aria-hidden="n === 2">
                  <a
                    v-for="[tag, count] in tagCounts"
                    :key="tag + n"
                    class="tag-link"
                    :href="withBase('/pages/tags/?q=' + encodeURIComponent(tag))"
                  >
                    <span class="tag-count">#</span>{{ tag }}
                    <span class="tag-count">{{ count }}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 精选推荐 -->
        <div class="top-right">
          <div class="recommend-card card">
            <div class="recommend-head">
              <h2>精选推荐</h2>
              <div class="recommend-indicators">
                <button
                  v-for="(page, i) in recPages"
                  :key="i"
                  class="indicator-dot"
                  :class="{ active: i === current }"
                  :aria-label="`第 ${i + 1} 页`"
                  @click="current = i"
                ></button>
              </div>
            </div>
            <div class="recommend-list">
              <div class="recommend-track" :style="{ transform: `translateX(-${current * 100}%)` }">
                <div class="recommend-page" v-for="(page, pi) in recPages" :key="pi">
                  <a v-for="p in page" :key="p.url" class="recommend-item" :href="withBase(p.url)">
                    <span class="recommend-icon">{{ p.category ? p.category.slice(0, 1) : '文' }}</span>
                    <span class="recommend-body">
                      <span class="recommend-title">{{ p.title }}</span>
                      <span class="recommend-desc">{{ p.description }}</span>
                      <span class="recommend-meta">
                        <span>{{ p.date }}</span>
                        <span class="dot"></span>
                        <span class="cat">{{ p.category }}</span>
                      </span>
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 最新文章 -->
      <section class="latest-articles">
        <div class="latest-head">
          <h2>最新文章</h2>
          <a class="view-all" :href="withBase('/pages/posts/')">查看全部 →</a>
        </div>
        <div class="latest-grid">
          <a v-for="p in latest" :key="p.url" class="article-card card" :href="withBase(p.url)">
            <div class="article-card-date">{{ p.date }}</div>
            <h3 class="article-card-title">{{ p.title }}</h3>
            <p class="article-card-desc">{{ p.description || p.excerpt }}</p>
            <div class="article-card-tags">
              <span class="article-tag" v-for="t in p.tags" :key="t">{{ t }}</span>
            </div>
          </a>
        </div>
      </section>
    </div>
  </div>
</template>
