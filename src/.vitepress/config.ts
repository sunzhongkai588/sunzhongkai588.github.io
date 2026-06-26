import { defineConfig } from 'vitepress'

const siteUrl = 'https://sunzhongkai588.github.io'
const siteTitle = 'Sun Zhongkai'
const siteDescription = '学习笔记、论文分享和有趣发现'

function pageUrl(relativePath: string): string {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/^\/+/, '')

  return path ? `${siteUrl}/${path}` : siteUrl
}

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#f7f3ea' }],
    ['meta', { name: 'author', content: siteTitle }],
  ],
  transformPageData(pageData) {
    const url = pageUrl(pageData.relativePath)
    const title = pageData.title ? `${pageData.title} | ${siteTitle}` : siteTitle
    const description = pageData.description || siteDescription
    const type = pageData.relativePath.startsWith('posts/') ? 'article' : 'website'

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:type', content: type }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:site_name', content: siteTitle }],
      ['meta', { property: 'og:image', content: `${siteUrl}/social-card.svg` }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }],
      ['meta', { name: 'twitter:image', content: `${siteUrl}/social-card.svg` }]
    )
  },
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
