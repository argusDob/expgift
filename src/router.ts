import { createRouter, createWebHistory } from 'vue-router'
import Home from './views/Home.vue'
import Login from './views/Login.vue'
import Detail from './views/Detail.vue'
import { useAuthStore } from './stores/auth'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home, meta: { requiresAuth: true } },
    { path: '/experiences/:id', component: Detail, meta: { requiresAuth: true } },
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  
  // Try refresh if not authenticated but have refresh token
  if (!auth.isAuthenticated && auth.canTryRefresh) {
    const ok = await auth.tryRefresh()
    
    // If refresh failed and route requires auth, redirect to login
    if (!ok && to.meta.requiresAuth) {
      return '/login'
    }
  }
  
  // Protect routes that require authentication
  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return '/login'
  }

  return true
})
