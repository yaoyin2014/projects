<script setup>
import { ref } from 'vue'

defineProps({
  item: { type: Object, required: true },
})

const failed = ref(false)
</script>

<template>
  <article
    class="card"
    :class="[`card--${item.size}`, { 'is-failed': failed }]"
    :data-id="item.id"
  >
    <img
      v-if="!failed"
      :src="item.image"
      :alt="item.title"
      loading="lazy"
      @error="failed = true"
    />
    <div v-else class="card__ph" aria-hidden="true"></div>
    <div class="card__body">
      <h3 class="card__title">{{ item.title }}</h3>
      <p class="card__desc">{{ item.desc }}</p>
    </div>
  </article>
</template>

<style scoped>
.card {
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 10px;
  background: var(--bg);
  border: 1px solid var(--border);
  text-align: left;
  display: flex;
  flex-direction: column;
}

.card img {
  display: block;
  object-fit: cover;
  background: #cfd4dc; /* 图片加载前的兜底色 */
}

/* onerror 回退：纯色背景块，尺寸规则与 img 一致，保证布局高度不塌 */
.card__ph {
  display: block;
  background: #cfd4dc;
}

.card__body {
  padding: 8px 10px;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.card__title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-h);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card__desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: var(--text);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 高度变体：整体高度必须严格等于 HEIGHT，供 Grid span 精确对齐 */
.card--small   { height: 110px; flex-direction: row; }
.card--medium  { height: 150px; flex-direction: row; }
.card--large   { height: 230px; }
.card--xlarge  { height: 370px; }

/* 横向布局：图左文右，图片固定宽度、stretch 填满高度 */
.card--small img,
.card--small .card__ph,
.card--medium img,
.card--medium .card__ph {
  flex-shrink: 0;
  align-self: stretch;
}
.card--small img,
.card--small .card__ph { width: 96px; }
.card--medium img,
.card--medium .card__ph { width: 132px; }

/* 纵向布局：图上文下，图片固定高度 */
.card--large img,
.card--large .card__ph { width: 100%; height: 150px; flex-shrink: 0; }
.card--xlarge img,
.card--xlarge .card__ph { width: 100%; height: 270px; flex-shrink: 0; }
</style>
