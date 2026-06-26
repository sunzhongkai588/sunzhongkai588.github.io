import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import './style.css'
import HomePosts from './components/HomePosts.vue'
import PostList from './components/PostList.vue'
import XhsShare from './components/XhsShare.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('HomePosts', HomePosts)
    app.component('PostList', PostList)
    app.component('XhsShare', XhsShare)
  },
} satisfies Theme
