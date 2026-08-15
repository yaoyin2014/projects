import { watch, nextTick } from 'vue'
import { resolveScrollRoot } from './useScrollContainer'

// 列模式切换（单列↔双列）时的滚动锚点保留。
// 单列内容高度约翻倍，而 scrollTop 是像素值，重排后同一像素会落到不同内容上；
// 记录翻转前视口顶部那张卡，重排后滚回同一张卡。
export function useScrollAnchor({ wrapRef, isNarrow }) {
  let anchorId = null

  function findFirstVisibleCard() {
    const wrapEl = wrapRef.value
    if (!wrapEl) return null
    const scroller = resolveScrollRoot(wrapEl)
    // 可见区顶部（视口坐标）：嵌套容器用其 getBoundingClientRect().top，视口滚动则为 0
    const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0
    let anchorEl = null
    let anchorTop = Infinity
    // grid 下 DOM 顺序 ≠ 视觉顺序，必须按 rect.top 找视觉顶部那张卡，不能按 DOM 顺序取第一个
    for (const el of wrapEl.querySelectorAll('[data-id]')) {
      const rect = el.getBoundingClientRect()
      if (rect.bottom <= scrollerTop) continue // 完全在视口上方
      if (rect.top < anchorTop) {
        anchorTop = rect.top
        anchorEl = el
      }
    }
    return anchorEl?.dataset.id ?? null
  }

  function restore(id) {
    if (id == null) return
    const wrapEl = wrapRef.value
    if (!wrapEl) return
    const el = wrapEl.querySelector(`[data-id="${id}"]`)
    if (!el) return
    const scroller = resolveScrollRoot(wrapEl)
    const scrollerTop = scroller ? scroller.getBoundingClientRect().top : 0
    // 用 getBoundingClientRect 差值，别用 offsetTop（offsetTop 相对 offsetParent，不是滚动容器）
    const delta = el.getBoundingClientRect().top - scrollerTop
    if (scroller) scroller.scrollTop += delta
    else window.scrollTo(0, window.scrollY + delta)
  }

  watch(isNarrow, () => {
    // flush 默认 'pre'：此刻 DOM 还是旧布局（重排尚未发生），同步捕获锚点
    anchorId = findFirstVisibleCard()
    // 重排后（post-flush）滚回；多次跨断点只保留最新一次（anchorId 被覆盖）
    nextTick(() => restore(anchorId))
  })

  return { findFirstVisibleCard, restore }
}
