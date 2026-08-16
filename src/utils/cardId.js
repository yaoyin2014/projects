// 卡片 DOM 标识约定：统一挂原生 id（替代 data-id），加前缀避免与页面其它 id 冲突。
// 生成：MediaCard 用 cardId()；匹配/查询：useScrollAnchor 与 observeCardVisibility 用 CARD_ID_SELECTOR。
export const CARD_ID_PREFIX = 'feedTracker-'
export const CARD_ID_SELECTOR = `[id^="${CARD_ID_PREFIX}"]`
export const cardId = (id) => `${CARD_ID_PREFIX}${id}`
// 反向取原始编号（如日志展示用）：去掉前缀，非本前缀则原样返回。
export const fromCardId = (id) =>
  id.startsWith(CARD_ID_PREFIX) ? id.slice(CARD_ID_PREFIX.length) : id
