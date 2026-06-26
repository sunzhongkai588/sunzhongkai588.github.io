import { createContentLoader } from 'vitepress'

export interface Post {
  title: string
  url: string
  date: {
    time: number
    text: string
  }
  description: string
  tags: string[]
  category: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/*.md', {
  excerpt: true,
  transform(raw): Post[] {
    return raw
      .map(({ url, frontmatter, excerpt }) => ({
        title: frontmatter.title ?? 'Untitled',
        url,
        date: formatDate(frontmatter.date),
        description: frontmatter.description ?? excerpt?.replace(/<[^>]+>/g, '').trim() ?? '',
        tags: normalizeList(frontmatter.tags),
        category: frontmatter.category ?? 'learning',
      }))
      .sort((a, b) => b.date.time - a.date.time)
  },
})

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

function formatDate(raw: unknown): Post['date'] {
  const date = raw ? new Date(String(raw)) : new Date()
  date.setUTCHours(12)
  return {
    time: Number(date),
    text: date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }
}
