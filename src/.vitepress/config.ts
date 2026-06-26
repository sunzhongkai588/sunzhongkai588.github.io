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
  path: string
  category?: string
  tags: string[]
  isPost: boolean
  xhs: {
    title: string
    summary: string
    bullets: string[]
    cardPath?: string
  }
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
    writeXhsCards(outDir, pages),
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
  const path = pagePath(relativePath)
  const xhs = normalizeXhs(frontmatter.xhs, title, description)

  return {
    title,
    description,
    date,
    url: path ? `${siteUrl}/${path}` : siteUrl,
    path,
    category: frontmatter.category ? String(frontmatter.category) : undefined,
    tags: normalizeList(frontmatter.tags),
    isPost,
    xhs: {
      ...xhs,
      cardPath: isPost ? `xhs-cards/${path.split('/').at(-1)}.svg` : undefined,
    },
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

async function writeXhsCards(outDir: string, pages: PageRecord[]): Promise<void> {
  const posts = pages.filter((page) => page.isPost && page.xhs.cardPath)
  const cardDir = join(outDir, 'xhs-cards')
  await mkdir(cardDir, { recursive: true })
  await Promise.all(
    posts.map((post) =>
      writeFile(join(outDir, post.xhs.cardPath!), renderXhsCard(post), 'utf8')
    )
  )
}

function renderXhsCard(post: PageRecord): string {
  const titleLines = wrapText(post.xhs.title || post.title, 12, 3)
  const summaryLines = wrapText(post.xhs.summary || post.description, 22, 4)
  const bullets = post.xhs.bullets.length ? post.xhs.bullets : post.tags.map((tag) => `#${tag}`)
  const bulletLines = bullets.slice(0, 4).flatMap((bullet) => wrapText(`• ${bullet}`, 24, 2))
  const tags = post.tags.slice(0, 4).map((tag) => `#${tag}`).join('  ')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1350" viewBox="0 0 1080 1350">
  <rect width="1080" height="1350" fill="#fffdf8"/>
  <rect x="60" y="64" width="960" height="1222" rx="32" fill="#f7f3ea" stroke="#d9d0bd" stroke-width="2"/>
  <circle cx="884" cy="188" r="118" fill="#0f766e" opacity=".12"/>
  <circle cx="196" cy="1120" r="148" fill="#d97706" opacity=".10"/>
  <text x="110" y="150" fill="#0f766e" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="34" font-weight="800">Sun Zhongkai Blog</text>
${renderTextLines(titleLines, 110, 250, 58, 74, '#16201d', 800)}
${renderTextLines(summaryLines, 110, 550, 36, 54, '#33413d', 500)}
${renderTextLines(bulletLines, 110, 800, 32, 48, '#283530', 600)}
  <text x="110" y="1138" fill="#0f766e" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="28" font-weight="800">${xmlEscape(tags)}</text>
  <text x="110" y="1218" fill="#53615c" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="24">${xmlEscape(post.url)}</text>
</svg>
`
}

function renderTextLines(
  lines: string[],
  x: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  color: string,
  weight: number
): string {
  return lines
    .map(
      (line, index) =>
        `  <text x="${x}" y="${y + index * lineHeight}" fill="${color}" font-family="Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif" font-size="${fontSize}" font-weight="${weight}">${xmlEscape(line)}</text>`
    )
    .join('\n')
}

function wrapText(text: string, maxUnits: number, maxLines: number): string[] {
  const units = Array.from(text)
  const lines: string[] = []
  let line = ''
  let lineUnits = 0

  for (const unit of units) {
    const width = /[\u0000-\u00ff]/.test(unit) ? 0.55 : 1
    if (line && lineUnits + width > maxUnits) {
      lines.push(line)
      line = unit.trimStart()
      lineUnits = width
      if (lines.length === maxLines) break
    } else {
      line += unit
      lineUnits += width
    }
  }

  if (line && lines.length < maxLines) {
    lines.push(line)
  }

  if (lines.length === maxLines && units.length > lines.join('').length) {
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/[，。,.!！?？;；:：、\s]+$/, '')}...`
  }

  return lines
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
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item ?? '').trim()).filter(Boolean)
  }
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return []
}

function normalizeXhs(
  raw: unknown,
  fallbackTitle: string,
  fallbackSummary: string
): PageRecord['xhs'] {
  if (!raw || typeof raw !== 'object') {
    return {
      title: fallbackTitle,
      summary: fallbackSummary,
      bullets: [],
    }
  }

  const xhs = raw as Record<string, unknown>
  return {
    title: String(xhs.title ?? fallbackTitle),
    summary: String(xhs.summary ?? fallbackSummary),
    bullets: normalizeList(xhs.bullets),
  }
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
