import { createRouter, createWebHashHistory } from 'vue-router'
import CardsPage from '../views/CardsPage.vue'
import SwipeImageList from '../components/SwipeImageList.vue'

const routes = [
  { path: '/', redirect: '/cards' }, // 默认入口：/ 重定向到 /cards
  { path: '/cards', component: CardsPage },
  { path: '/swipe', component: SwipeImageList },
]

// 选 createWebHashHistory：H5 静态部署 / 直接 file:// 打开 dist/index.html 时，
// 无服务端重写也能访问，避免刷新 404（hash 不触发服务器请求）。
// 组件用静态导入而非 () => import()：file:// 下动态导入会拆出独立 chunk、受 CORS 限制加载失败；
// 本项目体积小，单包更稳妥（设计文档 §4）。
export default createRouter({
  history: createWebHashHistory(),
  routes,
})
