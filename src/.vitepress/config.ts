import { defineConfig } from 'vitepress'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { parse as parseYaml } from 'yaml'

const siteUrl = 'https://sunzhongkai588.github.io'
const siteTitle = 'Sun Zhongkai'
const siteDescription = '学习笔记、论文分享和有趣发现'

function pageUrl(relativePath: string): string {
  const path = pagePath(relativePath)

  return path ? `${siteUrl}/${path}` : siteUrl
}

function pagePath(relativePath: string): string {
  return relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/^\/+/, '')
}

export default defineConfig({
  title: siteTitle,
  description: siteDescription,
  lang: 'zh-CN',
  cleanUrls: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['link', { rel: 'alternate', type: 'application/rss+xml', title: siteTitle, href: '/rss.xml' }],
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
  async buildEnd(siteConfig) {
    await generateSiteAssets(siteConfig.srcDir, siteConfig.outDir)
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

interface PageRecord {
  title: string
  description: string
  date?: Date
  url: string
  category?: string
  tags: string[]
  isPost: boolean
}

async function generateSiteAssets(srcDir: string, outDir: string): Promise<void> {
  const mdFiles = await listMarkdownFiles(srcDir)
  const pages = (
    await Promise.all(
      mdFiles.map(async (file) => {
        const relativePath = relative(srcDir, file).replaceAll('\\', '/')
        if (relativePath.startsWith('.vitepress/')) return undefined
        return readPageRecord(file, relativePath)
      })
    )
  ).filter((page): page is PageRecord => Boolean(page))

  await mkdir(outDir, { recursive: true })
  await Promise.all([
    writeFile(join(outDir, 'rss.xml'), renderRss(pages), 'utf8'),
    writeFile(join(outDir, 'sitemap.xml'), renderSitemap(pages), 'utf8'),
    writeFile(join(outDir, 'robots.txt'), renderRobots(), 'utf8'),
  ])
}

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) {
        return entry.name === '.vitepress' ? [] : listMarkdownFiles(path)
      }
      return entry.isFile() && entry.name.endsWith('.md') ? [path] : []
    })
  )
  return files.flat()
}

async function readPageRecord(file: string, relativePath: string): Promise<PageRecord> {
  const raw = await readFile(file, 'utf8')
  const { frontmatter, content } = parseFrontmatter(raw)
  const isPost = relativePath.startsWith('posts/')
  const title = String(frontmatter.title ?? firstHeading(content) ?? siteTitle)
  const description = String(frontmatter.description ?? firstParagraph(content) ?? siteDescription)
  const date = frontmatter.date ? new Date(String(frontmatter.date)) : undefined

  return {
    title,
    description,
    date,
    url: pageUrl(relativePath),
    category: frontmatter.category ? String(frontmatter.category) : undefined,
    tags: normalizeList(frontmatter.tags),
    isPost,
  }
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, unknown>; content: string } {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?/)
  if (!match) return { frontmatter: {}, content: raw }
  const frontmatter = parseYaml(match[1]) ?? {}
  return {
    frontmatter: typeof frontmatter === 'object' ? (frontmatter as Record<string, unknown>) : {},
    content: raw.slice(match[0].length),
  }
}

function renderRss(pages: PageRecord[]): string {
  const posts = pages
    .filter((page) => page.isPost)
    .sort((a, b) => Number(b.date ?? 0) - Number(a.date ?? 0))

  const items = posts
    .map((post) => {
      const categories = [post.category, ...post.tags]
        .filter(Boolean)
        .map((category) => `      <category>${xmlEscape(String(category))}</category>`)
        .join('\n')
      return `    <item>
      <title>${xmlEscape(post.title)}</title>
      <link>${xmlEscape(post.url)}</link>
      <guid>${xmlEscape(post.url)}</guid>
      ${post.date ? `<pubDate>${post.date.toUTCString()}</pubDate>` : ''}
      <description>${xmlEscape(post.description)}</description>
${categories}
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${xmlEscape(siteTitle)}</title>
    <link>${xmlEscape(siteUrl)}</link>
    <description>${xmlEscape(siteDescription)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${xmlEscape(`${siteUrl}/rss.xml`)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`
}

function renderSitemap(pages: PageRecord[]): string {
  const urls = pages
    .sort((a, b) => a.url.localeCompare(b.url))
    .map((page) => {
      const lastmod = page.date ? `\n    <lastmod>${page.date.toISOString().slice(0, 10)}</lastmod>` : ''
      return `  <url>
    <loc>${xmlEscape(page.url)}</loc>${lastmod}
  </url>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`
}

function renderRobots(): string {
  return `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`
}

function firstHeading(content: string): string | undefined {
  return content.match(/^#\s+(.+)$/m)?.[1]?.trim()
}

function firstParagraph(content: string): string | undefined {
  return content
    .split(/\n{2,}/)
    .map((block) => stripMarkdown(block).trim())
    .find((block) => block && !block.startsWith('<') && !block.startsWith('#'))
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_>#-]/g, '')
}

function normalizeList(raw: unknown): string[] {
  if (Array.isArray(raw)) return raw.map(String)
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
