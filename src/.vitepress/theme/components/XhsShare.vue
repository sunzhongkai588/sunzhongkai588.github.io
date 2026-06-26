<script setup lang="ts">
import { computed, ref } from 'vue'
import { useData } from 'vitepress'

const { frontmatter, page } = useData()
const copied = ref(false)

const xhs = computed(() => frontmatter.value.xhs ?? {})
const tags = computed(() => frontmatter.value.tags ?? [])
const title = computed(() => xhs.value.title ?? frontmatter.value.title ?? page.value.title)
const summary = computed(() => xhs.value.summary ?? frontmatter.value.description ?? '')
const bullets = computed<string[]>(() => xhs.value.bullets ?? [])
const canonicalUrl = computed(() => {
  if (xhs.value.url) return xhs.value.url
  const path = page.value.relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
    .replace(/^\/+/, '')
  return path
    ? `https://sunzhongkai588.github.io/${path}`
    : 'https://sunzhongkai588.github.io'
})
const caption = computed(() => {
  const lines = [
    title.value,
    '',
    summary.value,
    '',
    ...bullets.value.map((item) => `- ${item}`),
    '',
    ...tags.value.map((tag: string) => `#${tag}`),
    `阅读全文：${canonicalUrl.value}`,
  ]
  return lines.filter(Boolean).join('\n')
})

async function copyCaption() {
  if (!navigator?.clipboard) return
  await navigator.clipboard.writeText(caption.value)
  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, 1800)
}
</script>

<template>
  <section class="xhs-share" aria-label="小红书分享卡片">
    <div class="xhs-share__card">
      <div class="xhs-share__eyebrow">Sun Zhongkai Blog</div>
      <h2>{{ title }}</h2>
      <p>{{ summary }}</p>
      <ul v-if="bullets.length">
        <li v-for="item in bullets" :key="item">{{ item }}</li>
      </ul>
      <div v-if="tags.length" class="xhs-share__tags">
        <span v-for="tag in tags" :key="tag">#{{ tag }}</span>
      </div>
      <div class="xhs-share__url">{{ canonicalUrl }}</div>
    </div>
    <button type="button" class="xhs-share__button" @click="copyCaption">
      {{ copied ? '已复制' : '复制小红书文案' }}
    </button>
  </section>
</template>
