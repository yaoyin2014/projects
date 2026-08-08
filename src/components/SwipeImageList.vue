<template>
  <div
    class="swipe-container"
    ref="containerRef"
    @touchstart="onTouchStart"
    @touchmove.prevent="onTouchMove"
    @touchend="onTouchEnd"
  >
    <div
      class="swipe-track"
      ref="trackRef"
      :style="trackStyle"
    >
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
        :class="{ active: isPulling }"
        :style="hintStyle"
        @click.stop="onClickHint"
      >
        <span>{{ isPulling ? '松开查看' : '左滑查看更多' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const images = ref([
  'https://picsum.photos/180/240?random=1',
  'https://picsum.photos/180/240?random=2',
  'https://picsum.photos/180/240?random=3',
  'https://picsum.photos/180/240?random=4',
])

const containerRef = ref(null)
const trackRef = ref(null)
const isPulling = ref(false)
const pullOffset = ref(0)       // 超出右边界后的拖拽距离
const translateX = ref(0)       // 正常滚动偏移
const isAnimating = ref(false)

const THRESHOLD = 0             // 进入拖拽状态的阈值（一拉就显示）
const THRESHOLD_RELEASE = 0     // 退出拖拽状态的阈值
const MAX_PULL = 120            // 最大拖拽距离
let alertTriggered = false

// 触摸记录
let startX = 0
let startY = 0
let lastX = 0
let currentTranslateX = 0
let cachedMaxScroll = 0     // touchstart 时缓存的 maxScroll，防止拖拽中 layout 变化干扰计算
let atRightEdge = false

// 计算可滚动的最大距离
function getMaxScroll() {
  const container = containerRef.value
  const track = trackRef.value
  if (!container || !track) return 0
  return -(track.scrollWidth - container.clientWidth)
}

const HINT_MIN_WIDTH = 36
const HINT_MAX_WIDTH = 120

// 当前提示区域的宽度：随拖拽距离直接拉伸，填满右侧间隙
const hintWidth = computed(() => {
  const raw = HINT_MIN_WIDTH + Math.abs(pullOffset.value)
  return Math.min(raw, HINT_MAX_WIDTH)
})

const trackStyle = computed(() => {
  // 提示区拉伸填掉了拖拽间隙，无需额外补偿
  // |pullOffset| = extraWidth，右侧始终贴边
  const base = translateX.value + pullOffset.value
  return {
    transform: `translateX(${base}px)`,
    transition: isAnimating.value ? 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
  }
})

const hintStyle = computed(() => ({
  width: `${hintWidth.value}px`,
}))

function onTouchStart(e) {
  const touch = e.touches[0]
  startX = touch.clientX
  startY = touch.clientY
  lastX = startX
  currentTranslateX = translateX.value
  cachedMaxScroll = getMaxScroll()
  atRightEdge = currentTranslateX <= cachedMaxScroll
  isAnimating.value = false
  pullOffset.value = 0
  isPulling.value = false
  alertTriggered = false
}

function onTouchMove(e) {
  const touch = e.touches[0]
  const deltaX = touch.clientX - lastX
  const totalDeltaX = touch.clientX - startX

  // 判断是否在主滚动区域内（未到右边界，或向右回滑）
  if (!atRightEdge) {
    // 正常滚动
    let newX = currentTranslateX + totalDeltaX

    // 限制在有效范围
    if (newX > 0) newX = 0
    if (newX < cachedMaxScroll) {
      // 到达右边界，进入拖拽模式
      atRightEdge = true
      pullOffset.value = 0
      translateX.value = cachedMaxScroll
    } else {
      translateX.value = newX
    }
  }

  // 在右边界时的拖拽效果
  if (atRightEdge) {
    // 计算超过边界的距离（使用缓存的 maxScroll，避免 hint 宽度变化干扰）
    const overflowDelta = totalDeltaX - (cachedMaxScroll - currentTranslateX)

    if (overflowDelta < 0) {
      // 橡皮筋阻尼效果：越拉阻力越大
      const rawPull = Math.abs(overflowDelta)
      const pull = rawPull < MAX_PULL
        ? rawPull * (1 - rawPull / (MAX_PULL * 2.5))
        : MAX_PULL * 0.6

      pullOffset.value = -pull
    } else if (overflowDelta > 0) {
      // 向右回滑，减少拖拽距离
      const rawPull = Math.abs(overflowDelta)
      pullOffset.value = -Math.max(0, Math.abs(pullOffset.value) - rawPull)

      // 如果拖拽完全回弹，回到正常滚动
      if (Math.abs(pullOffset.value) <= 0) {
        pullOffset.value = 0
        atRightEdge = false
        translateX.value = cachedMaxScroll + overflowDelta
        if (translateX.value > 0) translateX.value = 0
      }
    }

    // 滞回判断：进入需超过 THRESHOLD，退出需低于 THRESHOLD_RELEASE，防止闪烁
    const offset = Math.abs(pullOffset.value)
    if (!isPulling.value && offset >= THRESHOLD) {
      isPulling.value = true
    } else if (isPulling.value && offset <= THRESHOLD_RELEASE) {
      isPulling.value = false
    }
  }

  lastX = touch.clientX
}

function onTouchEnd() {
  isAnimating.value = true

  if (isPulling.value && !alertTriggered) {
    alertTriggered = true
    // 延迟 alert，等回弹动画开始后再弹出
    setTimeout(() => {
      alert('查看更多内容！')
    }, 100)
  }

  // 回弹归位
  pullOffset.value = 0
  isPulling.value = false
  atRightEdge = false

  // 动画结束后重置
  setTimeout(() => {
    isAnimating.value = false
  }, 400)
}

function onClickHint() {
  if (alertTriggered) return
  alertTriggered = true
  alert('查看更多内容！')
}
</script>

<style scoped>
.swipe-container {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 240px;
}

.swipe-track {
  display: flex;
  align-items: center;
  height: 100%;
  user-select: none;
  -webkit-user-select: none;
  will-change: transform;
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
  background-color: #f5f5f5;
  border-radius: 4px;
  transition: none;
}

.swipe-hint.active {
  font-weight: bold;
  border-radius: 30px 4px 4px 30px;
}
</style>
