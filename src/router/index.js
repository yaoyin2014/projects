import { createRouter, createWebHashHistory } from 'vue-router'
import CardsPage from '../views/CardsPage.vue'
import SwipeImageList from '../components/SwipeImageList.vue'

const routes = [
  { path: '/', redirect: '/cards' },
  { path: '/cards', component: CardsPage },
  { path: '/swipe', component: SwipeImageList },
]

export default createRouter({
  history: createWebHashHistory(),
  routes,
})
