<script setup lang="ts">
import { computed } from 'vue'
import { data as posts } from '../posts.data'

const props = defineProps<{
  category?: string
}>()

const visiblePosts = computed(() =>
  props.category ? posts.filter((post) => post.category === props.category) : posts
)
</script>

<template>
  <section class="post-list" aria-label="文章列表">
    <article v-for="post in visiblePosts" :key="post.url" class="post-row">
      <div class="post-row__date">{{ post.date.text }}</div>
      <div>
        <a class="post-row__title" :href="post.url">{{ post.title }}</a>
        <p v-if="post.description" class="post-row__desc">{{ post.description }}</p>
        <div v-if="post.tags.length" class="post-row__tags">
          <span v-for="tag in post.tags" :key="tag">#{{ tag }}</span>
        </div>
      </div>
    </article>
  </section>
</template>
