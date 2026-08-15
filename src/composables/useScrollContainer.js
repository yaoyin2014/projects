// 运行时解析真实滚动根：用「能不能真的滚」判定，
// 避免 body 的 overflow 被提升到 viewport 时硬编码 root 出错。

function isReallyScrolling(el) {
  if (!el || el.scrollHeight <= el.clientHeight) return false
  const before = el.scrollTop
  el.scrollTop = 1
  const moved = el.scrollTop !== before
  el.scrollTop = before
  return moved
}

export function resolveScrollRoot(el) {
  let node = el?.parentElement
  while (node) {
    // 文档滚动元素（标准模式下是 html）的滚动即「视口滚动」，不是嵌套容器。
    // 交给 IntersectionObserver 时必须返回 null（root: null），否则 root 边界
    // 会取整个文档高度，导致哨兵永远 isIntersecting、无限触发加载。
    if (node === document.scrollingElement) return null
    if (isReallyScrolling(node)) return node
    node = node.parentElement
  }
  return null // 找不到 → 视口滚动（root: null）
}
