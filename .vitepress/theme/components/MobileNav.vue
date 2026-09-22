<script setup>
// 移动端悬浮导航面板：参照 log.wyclab.com 的底部悬浮按钮组。
// 两个按钮：展开专题导航（侧边栏）、展开本文目录（TOC）。
// 首页（layout === 'home'）不显示；仅在有侧边栏的页面（/articles/...）显示。

import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useLayout } from 'vitepress/theme'

// 内部 composable（VitePress 2.0.0-alpha.20 未从 theme 公开导出 sidebar 控制），
// 与默认 Layout 使用的是同一个模块级 isOpen 单例，故 toggle 能正确联动侧边栏抽屉/遮罩/滚动锁定。
import { useSidebarControl } from 'vitepress/dist/client/theme-default/composables/sidebar.js'
import { useBodyScrollLock } from 'vitepress/dist/client/theme-default/composables/scroll-lock.js'

const { theme } = useData()
const route = useRoute()
const { headers, hasSidebar, isHome } = useLayout()

const { isOpen: sidebarOpen, toggle: toggleSidebar } = useSidebarControl()

const tocOpen = ref(false)
const isLocked = useBodyScrollLock()

// 目录标题：优先取 theme.outline.label，回退「本文目录」
const outlineLabel = computed(() => {
  const o = theme.value.outline
  return (o && typeof o === 'object' && !Array.isArray(o) && o.label) || '本文目录'
})

// 展平 outline 树，供抽屉渲染
const flatHeaders = computed(() => {
  const out = []
  const walk = (items) => {
    for (const h of items || []) {
      out.push(h)
      if (h.children && h.children.length) walk(h.children)
    }
  }
  walk(headers.value)
  return out
})

// 面板显示条件：非首页且当前页面有侧边栏（即 /articles/... 专题文章页）
const showPanel = computed(() => !isHome.value && hasSidebar.value)
// 目录按钮：有目录时才显示
const showToc = computed(() => flatHeaders.value.length > 0)

function toggleToc() {
  tocOpen.value = !tocOpen.value
}
function closeToc() {
  tocOpen.value = false
}

// 打开目录抽屉时锁定页面滚动，关闭/卸载时释放
watch(tocOpen, (v) => {
  isLocked.value = v
})
onBeforeUnmount(() => {
  isLocked.value = false
})

// 路由切换时关闭目录抽屉
watch(() => route.path, closeToc)
</script>

<template>
  <ClientOnly>
    <div v-if="showPanel" class="mnp">
      <!-- 目录抽屉遮罩 -->
      <Transition name="mnp-fade">
        <div v-if="tocOpen" class="mnp-mask" @click="closeToc" />
      </Transition>

      <!-- 目录抽屉（右侧滑入） -->
      <Transition name="mnp-slide">
        <aside v-if="tocOpen" class="mnp-drawer" :aria-label="outlineLabel">
          <header class="mnp-drawer-head">
            <span class="mnp-drawer-title">{{ outlineLabel }}</span>
            <button
              type="button"
              class="mnp-drawer-close"
              aria-label="关闭目录"
              @click="closeToc"
            >
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M3.5 3.5l9 9m0-9l-9 9" />
              </svg>
            </button>
          </header>
          <nav class="mnp-drawer-body">
            <template v-if="flatHeaders.length">
              <a
                v-for="h in flatHeaders"
                :key="h.link"
                :href="h.link"
                :class="['mnp-link', `mnp-level-${h.level}`]"
                @click="closeToc"
              >{{ h.title }}</a>
            </template>
            <p v-else class="mnp-empty">暂无目录</p>
          </nav>
        </aside>
      </Transition>

      <!-- 悬浮按钮面板 -->
      <div class="mnp-panel">
        <button
          type="button"
          class="mnp-btn"
          :class="{ active: sidebarOpen }"
          aria-label="展开专题导航"
          title="专题导航"
          @click="toggleSidebar"
        >
          <svg class="mnp-icon" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M88 48v160H40a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8Z" opacity=".2" />
            <path d="M216 40H40a16 16 0 0 0-16 16v144a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16M40 152h16a8 8 0 0 0 0-16H40v-16h16a8 8 0 0 0 0-16H40V88h16a8 8 0 0 0 0-16H40V56h40v144H40Zm176 48H96V56h120z" />
          </svg>
        </button>

        <button
          v-if="showToc"
          type="button"
          class="mnp-btn"
          :class="{ active: tocOpen }"
          aria-label="展开本文目录"
          title="本文目录"
          @click="toggleToc"
        >
          <svg class="mnp-icon" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M184 64v40a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V64a8 8 0 0 1 8-8h96a8 8 0 0 1 8 8m-8 80H40a8 8 0 0 0-8 8v40a8 8 0 0 0 8 8h136a8 8 0 0 0 8-8v-40a8 8 0 0 0-8-8" opacity=".2" />
            <path d="M224 40v176a8 8 0 0 1-16 0V40a8 8 0 0 1 16 0m-32 24v40a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V64a16 16 0 0 1 16-16h96a16 16 0 0 1 16 16m-16 0H80v40h96Zm16 88v40a16 16 0 0 1-16 16H40a16 16 0 0 1-16-16v-40a16 16 0 0 1 16-16h136a16 16 0 0 1 16 16m-16 0H40v40h136Z" />
          </svg>
        </button>
      </div>
    </div>
  </ClientOnly>
</template>

<style scoped>
/* 悬浮面板：仿 log.wyclab.com #z-panel（毛玻璃圆角、竖排图标按钮） */
.mnp-panel {
  position: fixed;
  right: 16px;
  /* 位于已有「返回顶部」按钮（bottom 20px + 高 46px）上方，留 10px 间距 */
  bottom: 76px;
  z-index: 70;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 8px;
  font-size: 22.4px; /* 1.4rem，与参照站一致 */
  background: var(--mnp-panel-bg);
  -webkit-backdrop-filter: blur(8px) saturate(1.4);
  backdrop-filter: blur(8px) saturate(1.4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.1s;
}

.mnp-btn {
  display: block;
  padding: 8px;
  line-height: 0;
  color: var(--vp-c-text-2);
  background: transparent;
  border: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.2s;
}

.mnp-btn:hover {
  background: var(--mnp-panel-hover);
  color: var(--vp-c-brand-1);
}

.mnp-btn.active {
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.mnp-icon {
  display: block;
  width: 1em;
  height: 1em;
  fill: currentColor;
}

/* ---- 目录抽屉 ---- */
.mnp-mask {
  position: fixed;
  inset: 0;
  z-index: 64;
  background: rgba(0, 0, 0, 0.3);
}

.mnp-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 65;
  display: flex;
  flex-direction: column;
  width: min(85vw, 320px);
  background: var(--mnp-drawer-bg);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.15);
}

.mnp-drawer-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 20px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.mnp-drawer-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.mnp-drawer-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.2s, background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.mnp-drawer-close:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.mnp-drawer-close svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  fill: none;
}

.mnp-drawer-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 14px 24px;
}

.mnp-link {
  display: block;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: var(--vp-c-text-2);
  text-decoration: none;
  transition: color 0.15s, background-color 0.15s;
}

.mnp-link:hover {
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.mnp-link.mnp-level-3 {
  padding-left: 26px;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.mnp-empty {
  padding: 24px 12px;
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

/* ---- 过渡动画 ---- */
.mnp-fade-enter-active,
.mnp-fade-leave-active {
  transition: opacity 0.2s;
}
.mnp-fade-enter-from,
.mnp-fade-leave-to {
  opacity: 0;
}

.mnp-slide-enter-active,
.mnp-slide-leave-active {
  transition: transform 0.25s ease;
}
.mnp-slide-enter-from,
.mnp-slide-leave-to {
  transform: translateX(100%);
}

/* 桌面端隐藏（与参照站一致，768px 为界） */
@media (min-width: 768px) {
  .mnp-panel,
  .mnp-mask,
  .mnp-drawer {
    display: none;
  }
}
</style>
