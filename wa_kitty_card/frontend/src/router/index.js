import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EnterNames from '../views/EnterNames.vue'
import Game from '../views/Game.vue'
import GameOver from '../views/GameOver.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/enterNames',
    name: 'EnterNames',
    component: EnterNames
  },
  {
    path: '/combinedView',
    name: 'Game',
    component: Game
  },
  {
    path: '/gameOverPage',
    name: 'GameOver',
    component: GameOver
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
