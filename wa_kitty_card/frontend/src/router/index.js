import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EnterNames from '../views/EnterNames.vue'
import Game from '../views/Game.vue'
import GameOver from '../views/GameOver.vue'
import OfflineGame from '../views/OfflineGame.vue'
import Login from '../views/Login.vue'
import Leaderboard from '../views/Leaderboard.vue'
import Profile from '../views/Profile.vue'
import { auth } from '../firebase/config'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/enterNames',
    name: 'EnterNames',
    component: EnterNames,
    meta: { requiresAuth: true }
  },
  {
    path: '/combinedView',
    name: 'Game',
    component: Game,
    meta: { requiresAuth: true }
  },
  {
    path: '/gameOverPage',
    name: 'GameOver',
    component: GameOver,
    meta: { requiresAuth: true }
  },
  {
    path: '/offline-game',
    name: 'OfflineGame',
    component: OfflineGame,
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: Leaderboard
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  const unsubscribe = auth.onAuthStateChanged((user) => {
    unsubscribe() 
    
    if (requiresAuth && !user) {
      console.log('Route requires auth, redirecting to login')
      next('/login')
    } else if (to.path === '/login' && user) {
      console.log('Already logged in, redirecting to home')
      next('/')
    } else {
      console.log(' Navigation allowed')
      next()
    }
  })
})

export default router
