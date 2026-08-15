import { ref, computed, watch, nextTick } from 'vue'
import { resolveScrollRoot } from './useScrollContainer'
import { HEIGHT, GAP } from './useResponsiveColumns'

export function useInfiniteScroll({ items, split, wrapRef, sentinelRef, genBatch }) {
  const loading = ref(false)
  const finished = ref(false)
  const BATCH = 10
  let observer = null

  // 触发距离 = 较高列最后 4 张卡高度和 + 间隙（自适应，而非固定上界）
  const triggerDistance = computed(() => {
    const { left, right, hLeft, hRight } = split.value
    const col = hLeft >= hRight ? left : right
    const last = col.slice(-4)
    if (!last.length) return 0
    return (
      last.reduce((s, it) => s + HEIGHT[it.size], 0) +
      Math.max(0, last.length - 1) * GAP
    )
  })

  function loadMore() {
    if (loading.value || finished.value) return
    loading.value = true
    const batch = genBatch(BATCH)
    items.value.push(...batch)
    loading.value = false
    if (batch.length < BATCH) finished.value = true // 数据源耗尽即到底，别硬编码 TOTAL
    nextTick(() => fillUntilCovered())
  }

  // 内容未铺满视口（极少见）→ 继续填，防止 IO 死锁
  function fillUntilCovered() {
    const wrapEl = wrapRef.value
    const scroller = resolveScrollRoot(wrapEl)
    const vh = scroller ? scroller.clientHeight : window.innerHeight
    const sh = scroller
      ? scroller.scrollHeight
      : document.documentElement.scrollHeight
    if (sh <= vh) loadMore()
  }

  // rootMargin 构造后不可改 → 追加/列模式变化时重建 observer
  function setupObserver() {
    observer?.disconnect()
    const sentinelEl = sentinelRef.value
    if (!sentinelEl) return
    const root = resolveScrollRoot(wrapRef.value)
    observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { root, rootMargin: `0px 0px ${triggerDistance.value}px 0px` },
    )
    observer.observe(sentinelEl)
  }

  function teardown() {
    observer?.disconnect()
    observer = null
  }

  watch(triggerDistance, () => setupObserver())

  return { loading, finished, triggerDistance, loadMore, setupObserver, teardown }
}
