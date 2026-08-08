<template>
  <div
    class="swipe-container"
    ref="containerRef"
    @scroll="onScroll"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div class="swipe-track">
      <!-- 4 张图片 -->
      <div
        v-for="(img, index) in images"
        :key="index"
        class="swipe-item"
      >
        <img :src="img" :alt="`图片${index + 1}`" />
      </div>

      <!-- 提示文字区域（在最后一张图片后面） -->
      <div
        class="swipe-hint"
        :class="{ active: isAtEnd }"
        @click.stop="onClickHint"
      >
        <span>{{ isAtEnd ? '松开查看' : '左滑查看更多' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

// 示例图片（可替换为实际图片地址）
const images = ref([
  'https://picsum.photos/180/240?random=1',
  'https://picsum.photos/180/240?random=2',
  'https://picsum.photos/180/240?random=3',
  'https://picsum.photos/180/240?random=4',
])

const containerRef = ref(null)
const isAtEnd = ref(false)

// 记录 touchmove 过程中是否到达过最右侧
let reachedEndInCurrentSwipe = false
// 防止 touchend 触发 alert 后 click 再次触发
let alertTriggered = false

// 判断是否滚动到了最右侧
function checkAtEnd() {
  const el = containerRef.value
  if (!el) return false
  // 允许 2px 误差
  return el.scrollLeft + el.clientWidth >= el.scrollWidth - 2
}

function onScroll() {
  const atEnd = checkAtEnd()
  // 只在到达最右侧且当前这次滑动中才更新状态
  if (atEnd && reachedEndInCurrentSwipe) {
    isAtEnd.value = true
  } else if (!atEnd) {
    isAtEnd.value = false
  }
}

function onTouchStart() {
  reachedEndInCurrentSwipe = false
  alertTriggered = false
  isAtEnd.value = false
}

function onTouchMove() {
  // 标识本轮滑动有效（只要是 touchmove 就认为在滑动中）
  reachedEndInCurrentSwipe = true

  // 实时检测是否滑到最右侧
  const atEnd = checkAtEnd()
  isAtEnd.value = atEnd
}

function onTouchEnd() {
  // 只有滑动到最右侧后松手才触发
  if (isAtEnd.value && !alertTriggered) {
    alertTriggered = true
    alert('查看更多内容！')
  }

  // 重置状态
  isAtEnd.value = false
  reachedEndInCurrentSwipe = false
}

function onClickHint() {
  if (alertTriggered) return
  alertTriggered = true
  alert('查看更多内容！')
}
</script>

<style scoped>
.swipe-container {
  overflow-x: auto;
  overflow-y: hidden;
  width: 100%;
  /* 隐藏滚动条 */
  scrollbar-width: none;
  -ms-overflow-style: none;
  -webkit-overflow-scrolling: touch;
}

.swipe-container::-webkit-scrollbar {
  display: none;
}

.swipe-track {
  display: flex;
  align-items: center;
  user-select: none;
  -webkit-user-select: none;
}

.swipe-item {
  flex-shrink: 0;
  width: 180px;
  height: 240px;
  margin-right: 10px;
  border-radius: 8px;
  overflow: hidden;
}

.swipe-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  /* 禁止图片拖拽 */
  pointer-events: none;
  -webkit-user-drag: none;
}

.swipe-hint {
  flex-shrink: 0;
  width: 36px;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
  line-height: 1.6;
  writing-mode: vertical-lr;
  letter-spacing: 2px;
  transition: color 0.2s, font-weight 0.2s;
}

.swipe-hint.active {
  color: #ff4d4f;
  font-weight: bold;
}
</style>
