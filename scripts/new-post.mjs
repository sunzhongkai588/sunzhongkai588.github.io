import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const [, , rawSlug, ...titleParts] = process.argv

if (!rawSlug || titleParts.length === 0) {
  console.error('Usage: npm run new -- my-post-slug "文章标题" [learning|papers|interesting]')
  process.exit(1)
}

const maybeCategory = titleParts.at(-1)
const knownCategories = new Set(['learning', 'papers', 'interesting'])
const category = knownCategories.has(maybeCategory) ? titleParts.pop() : 'learning'
const title = titleParts.join(' ')
const slug = rawSlug
  .trim()
  .toLowerCase()
  .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
  .replace(/^-+|-+$/g, '')

if (!slug) {
  console.error('Slug is empty after normalization.')
  process.exit(1)
}

const today = new Date().toISOString().slice(0, 10)
const postPath = join('src', 'posts', `${slug}.md`)

if (existsSync(postPath)) {
  console.error(`${postPath} already exists.`)
  process.exit(1)
}

const body = `---
title: ${title}
date: ${today}
category: ${category}
tags: []
description: 
xhs:
  title: ${title}
  summary: 
  bullets:
    - 
    - 
    - 
---

# ${title}

## 背景

## 正文

## 结论

## 参考

<XhsShare />
`

await mkdir(join('src', 'posts'), { recursive: true })
await writeFile(postPath, body, 'utf8')
console.log(`Created ${postPath}`)
