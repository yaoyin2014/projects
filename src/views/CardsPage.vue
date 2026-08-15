<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import MediaCard from '../components/MediaCard.vue'
import { useResponsiveColumns, HEIGHT, GAP } from '../composables/useResponsiveColumns'
import { useInfiniteScroll } from '../composables/useInfiniteScroll'
import { useScrollAnchor } from '../composables/useScrollAnchor'
import { observeCardVisibility } from '../utils/observeCardVisibility'

const SIZES = ['small', 'medium', 'large', 'xlarge']
let nextId = 1

function genBatch(n) {
  const batch = []
  for (let i = 0; i < n; i++) {
    const id = nextId++
    const size = SIZES[Math.floor(Math.random() * SIZES.length)]
    batch.push({
      id,
      size,
      title: `卡片 #${id}`,
      desc: `这是第 ${id} 张卡片的描述文字，用于撑起两行高度，超出会被截断。`,
      image: `https://picsum.photos/seed/${id}/400/300`,
    })
  }
  return batch
}

const items = ref([])
const wrapRef = ref(null)
const sentinelRef = ref(null)

const { isNarrow, split, setup: setupColumns, teardown: teardownColumns } =
  useResponsiveColumns(items)

// 列模式切换时保留滚动锚点（内部 watch isNarrow 自动捕获/恢复）
useScrollAnchor({ wrapRef, isNarrow })

const { loading, finished, loadMore, setupObserver, teardown: teardownScroll } =
  useInfiniteScroll({ items, split, wrapRef, sentinelRef, genBatch })

// Grid 用 2px 基准行（HEIGHT+GAP 皆为偶数），span = (高度+间隙)/2
const spanOf = (it) => (HEIGHT[it.size] + GAP) / 2

let visibilityWatcher = null

onMounted(() => {
  setupColumns()
  loadMore() // 首批；triggerDistance 变化会触发 watch 重建 observer
  // 监听每个卡片的可见性（调试）：≥1px 可见 / 完全不可见 各打一条日志
  visibilityWatcher = observeCardVisibility()
})

onBeforeUnmount(() => {
  visibilityWatcher?.teardown()
  teardownColumns()
  teardownScroll()
})
</script>

<template>
  <div class="cards-page">
    <div ref="wrapRef" class="feed" :class="{ 'is-single': isNarrow }">
      <MediaCard
        v-for="it in items"
        :key="it.id"
        :item="it"
        :style="{ gridRowEnd: `span ${spanOf(it)}` }"
      />
    </div>
    <div v-if="loading" class="status">加载中…</div>
    <div v-else-if="finished" class="status">没有更多了</div>

    <!-- 哨兵始终是内容最底部元素，不能是 grid 子项 -->
    <div ref="sentinelRef" class="sentinel"></div>
  </div>
</template>

<style scoped>
.cards-page {
  max-width: 720px;
  margin: 0 auto;
  padding-top: 12px;
  padding-bottom: 12px;
  /* 折叠屏安全区（viewport-fit=cover 时 env() 生效，普通屏为 0） */
  padding-left: calc(8px + env(safe-area-inset-left));
  padding-right: calc(8px + env(safe-area-inset-right));
  text-align: left;
  box-sizing: border-box;
}

.feed {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-auto-rows: 2px; /* 1px 基准行的减半：HEIGHT+GAP 均为 2 的倍数 */
  grid-auto-flow: row; /* 稀疏放置 = 最短列优先 */
  column-gap: 8px;
  align-items: start; /* 卡片保持自身高度，不被 stretch 拉满 span */
}
.feed.is-single {
  grid-template-columns: 1fr;
}

.sentinel {
  height: 1px;
  width: 100%;
}

.status {
  padding: 16px 0;
  text-align: center;
  color: var(--text);
  font-size: 13px;
}
</style>
