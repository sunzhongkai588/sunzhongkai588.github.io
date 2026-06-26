import { readdir, readFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const distDir = join('src', '.vitepress', 'dist')

const requiredFiles = [
  'index.html',
  'about.html',
  'learning.html',
  'papers.html',
  'interesting.html',
  'xiaohongshu.html',
  'posts/hello-blog.html',
  'rss.xml',
  'sitemap.xml',
  'robots.txt',
  'social-card.svg',
  'xhs-cards/hello-blog.svg',
]

const checks = [
  {
    file: 'rss.xml',
    patterns: [
      '<rss version="2.0"',
      '<title>Sun Zhongkai</title>',
      '<link>https://sunzhongkai588.github.io/posts/hello-blog</link>',
    ],
  },
  {
    file: 'sitemap.xml',
    patterns: [
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      '<loc>https://sunzhongkai588.github.io/posts/hello-blog</loc>',
    ],
  },
  {
    file: 'robots.txt',
    patterns: ['User-agent: *', 'Sitemap: https://sunzhongkai588.github.io/sitemap.xml'],
  },
  {
    file: 'posts/hello-blog.html',
    patterns: ['href="/xhs-cards/hello-blog.svg"', '复制小红书文案', '复制文章链接', 'canonical'],
  },
  {
    file: 'xhs-cards/hello-blog.svg',
    patterns: [
      'width="1080" height="1350"',
      'Sun Zhongkai Blog',
      'https://sunzhongkai588.github.io/posts/hello-blog',
    ],
  },
]

const missing = requiredFiles.filter((file) => !existsSync(join(distDir, file)))
if (missing.length) {
  fail(`Missing generated files:\n${missing.map((file) => `- ${file}`).join('\n')}`)
}

for (const check of checks) {
  const content = await readFile(join(distDir, check.file), 'utf8')
  const missingPatterns = check.patterns.filter((pattern) => !content.includes(pattern))
  if (missingPatterns.length) {
    fail(
      `${check.file} is missing expected content:\n${missingPatterns
        .map((pattern) => `- ${pattern}`)
        .join('\n')}`
    )
  }
}

const postFiles = await readdir(join('src', 'posts'))
const tempPosts = postFiles.filter((file) => file.startsWith('temp-'))
if (tempPosts.length) {
  fail(`Temporary posts remain in src/posts:\n${tempPosts.map((file) => `- ${file}`).join('\n')}`)
}

console.log('Site check passed.')

function fail(message) {
  console.error(message)
  process.exit(1)
}
