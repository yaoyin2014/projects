import { ref, computed } from 'vue'

// 卡片整体高度（px）与间隙，供 Grid span 与触发距离复用。
export const HEIGHT = { small: 110, medium: 150, large: 230, xlarge: 370 }
export const GAP = 8

// 断点监听 + 瀑布流列平衡纯计算。
// 注意：这里的贪心拆分只用于计算触发距离（§7.2），不用于渲染；
// 渲染交给 CSS Grid 稀疏放置（grid-auto-flow: row），两者是同一条贪心规则，故高度一致。
export function useResponsiveColumns(items) {
  const isNarrow = ref(false)
  let mql = null

  const split = computed(() => {
    const left = []
    const right = []
    let hLeft = 0
    let hRight = 0
    if (isNarrow.value) {
      // 单列：全部并入一列，右列为空，triggerDistance 退化为「最后 4 张高度和」
      for (const it of items.value) {
        left.push(it)
        hLeft += HEIGHT[it.size] + GAP
      }
    } else {
      // 双列：贪心最短列（与 CSS Grid 稀疏放置同一条规则）
      for (const it of items.value) {
        if (hLeft <= hRight) {
          left.push(it)
          hLeft += HEIGHT[it.size] + GAP
        } else {
          right.push(it)
          hRight += HEIGHT[it.size] + GAP
        }
      }
    }
    return { left, right, hLeft, hRight }
  })

  function onChange(e) {
    isNarrow.value = e.matches
  }

  function setup() {
    mql = window.matchMedia('(max-width: 600px)')
    isNarrow.value = mql.matches
    mql.addEventListener('change', onChange)
  }

  function teardown() {
    mql?.removeEventListener('change', onChange)
    mql = null
  }

  return { isNarrow, split, setup, teardown }
}
