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
${bodyForCategory(category)}

<XhsShare />
`

await mkdir(join('src', 'posts'), { recursive: true })
await writeFile(postPath, body, 'utf8')
console.log(`Created ${postPath}`)

function bodyForCategory(category) {
  if (category === 'papers') {
    return `
## 论文信息

- Paper:
- Code:
- Authors:

## 它解决什么问题

## 方法直觉

## 关键设计

## 实验和证据

## 局限

## 我能用到哪里

## 参考
`
  }

  if (category === 'interesting') {
    return `
## 发现了什么

## 为什么有意思

## 可以怎么用

## 后续问题

## 参考
`
  }

  return `
## 为什么学这个

## 我原本的理解

## 关键概念

## 过程和踩坑

## 结论

## 参考
`
}
