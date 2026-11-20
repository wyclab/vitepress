import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import ArchivesPage from './components/ArchivesPage.vue'
import FriendPage from './components/FriendPage.vue'
import GraphPage from './components/GraphPage.vue'
import TopicsPage from './components/TopicsPage.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }: any) {
    app.component('ArchivesPage', ArchivesPage)
    app.component('FriendPage', FriendPage)
    app.component('GraphPage', GraphPage)
    app.component('TopicsPage', TopicsPage)
  },
}
