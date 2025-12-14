import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Detail from './views/Detail.vue'
import { useAuthStore } from './stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: Login },
    { path: '/', component: Home, meta: { requiresAuth: true } },
    { path: '/experiences/:id', component: Detail, meta: { requiresAuth: true } },
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    if (auth.canTryRefresh) {
      const ok = await auth.tryRefresh()
      if (ok) return true
    }
    return '/login'
  }
  return true
})
