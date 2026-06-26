import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Sun Zhongkai',
  description: '学习笔记、论文分享和有趣发现',
  lang: 'zh-CN',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f7f3ea' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:title', content: 'Sun Zhongkai' }],
    ['meta', { property: 'og:description', content: '学习笔记、论文分享和有趣发现' }],
    ['meta', { property: 'og:url', content: 'https://sunzhongkai588.github.io/' }],
  ],
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '学习', link: '/learning' },
      { text: '论文', link: '/papers' },
      { text: '有趣发现', link: '/interesting' },
      { text: '小红书', link: '/xiaohongshu' },
      { text: '关于', link: '/about' },
    ],
    search: {
      provider: 'local',
    },
    outline: {
      label: '目录',
      level: [2, 3],
    },
    socialLinks: [{ icon: 'github', link: 'https://github.com/sunzhongkai588' }],
    footer: {
      message: 'Built with VitePress. Published by GitHub Pages.',
      copyright: `Copyright © 2026 Sun Zhongkai`,
    },
  },
})
