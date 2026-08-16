// 独立工具：监听每个卡片的可见性，与 Vue 解耦，纯浏览器 API 实现。
// 用 IntersectionObserver（threshold: 0），语义正好是：
//   卡片有 ≥1px 进入视口 → isIntersecting = true  → 打印「可见」
//   卡片完全离开视口   → isIntersecting = false → 打印「不可见」

import { CARD_ID_SELECTOR, fromCardId } from './cardId'

export function observeCardVisibility({
  root = null,                       // 滚动根，默认视口（root: null）
  selector = CARD_ID_SELECTOR,       // 卡片选择器（MediaCard 上挂的原生 id，feedTracker- 前缀）
  container = document.body,         // 扫描范围；动态新增的卡片也会被自动接管
  getLabel = (el) => fromCardId(el.id), // 日志里的卡片标识，去掉 feedTracker- 前缀取原始编号
} = {}) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const label = getLabel(entry.target)
        if (entry.isIntersecting) {
          console.log(`卡片 #${label} 可见`)
        } else {
          console.log(`卡片 #${label} 完全不可见`)
        }
      }
    },
    { root, threshold: 0 }
  )

  const observe = (el) => {
    if (el.matches(selector)) observer.observe(el)
  }

  // 监听当前已存在的卡片
  container.querySelectorAll(selector).forEach(observe)

  // 无限滚动会动态插入卡片，用 MutationObserver 自动接管新节点
  const mo = new MutationObserver((mutations) => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        if (node.matches(selector)) observe(node)
        node.querySelectorAll?.(selector).forEach(observe)
      }
    }
  })
  mo.observe(container, { childList: true, subtree: true })

  return {
    observer,
    mo,
    teardown() {
      observer.disconnect()
      mo.disconnect()
    },
  }
}
