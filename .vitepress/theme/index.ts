import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import PostsList from './components/PostsList.vue'
import ArchivesPage from './components/ArchivesPage.vue'
import FriendPage from './components/FriendPage.vue'
import TopicsPage from './components/TopicsPage.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: any) {
    app.component('PostsList', PostsList)
    app.component('ArchivesPage', ArchivesPage)
    app.component('FriendPage', FriendPage)
    app.component('TopicsPage', TopicsPage)

    // 自动跟随系统亮/暗主题（仅在用户未手动选择时生效）
    if (typeof window !== 'undefined') {
      const KEY = 'vitepress-theme-appearance'
      const mql = window.matchMedia('(prefers-color-scheme: dark)')
      const apply = (e: MediaQueryListEvent | MediaQueryList) => {
        const manual = localStorage.getItem(KEY)
        if (!manual || manual === 'auto') {
          document.documentElement.classList.toggle('dark', e.matches)
        }
      }
      try {
        mql.addEventListener('change', apply)
      } catch {
        // 旧浏览器回退
        ;(mql as any).addListener?.(apply)
      }
    }
  },
}
