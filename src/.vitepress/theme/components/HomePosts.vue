<script setup lang="ts">
import { data as posts } from '../posts.data'

const latest = posts.slice(0, 8)

const categoryText: Record<string, string> = {
  learning: '学习',
  papers: '论文',
  interesting: '发现',
}
</script>

<template>
  <section class="home-posts" aria-label="最新文章">
    <article v-for="post in latest" :key="post.url" class="post-card">
      <a class="post-card__title" :href="post.url">{{ post.title }}</a>
      <div class="post-card__meta">
        <span>{{ post.date.text }}</span>
        <span>{{ categoryText[post.category] ?? post.category }}</span>
      </div>
      <p v-if="post.description" class="post-card__desc">{{ post.description }}</p>
      <div v-if="post.tags.length" class="post-card__tags">
        <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
      </div>
    </article>
  </section>
</template>
