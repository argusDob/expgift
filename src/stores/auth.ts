import { defineStore } from 'pinia'
import axios from 'axios'
import { ref } from 'vue'
import { authService } from '../services/auth.service'
import type { User } from '../types/auth'

const accessToken = ref('')// in-memory
let refreshPromise: Promise<boolean> | null = null

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: (typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null) as User|null,
    refreshToken: (typeof localStorage !== 'undefined' ? localStorage.getItem('refresh_token') || '' : ''),
    exp: 0,
  }),
  getters: {
    isAuthenticated: (s)=> !!accessToken.value && !!s.user && (s.exp*1000 > Date.now() + 1000*5),
    canTryRefresh: (s)=> !!s.refreshToken
  },
  actions: {
    // Mutations/Setters
    setAccessToken(token: string) {
      accessToken.value = token
    },
    
    setRefreshToken(token: string) {
      this.refreshToken = token
      localStorage.setItem('refresh_token', token)
    },
    
    setUser(user: User) {
      this.user = user
      localStorage.setItem('user', JSON.stringify(user))
    },
    
    setExp(exp: number) {
      this.exp = exp
    },
    
    clearAccessToken() {
      accessToken.value = ''
    },
    
    clearRefreshToken() {
      this.refreshToken = ''
      localStorage.removeItem('refresh_token')
    },
    
    clearUser() {
      this.user = null
      localStorage.removeItem('user')
    },
    
    clearExp() {
      this.exp = 0
    },
    
    // Business logic actions
    async login(email:string, password:string){
      const data = await authService.login(email, password)
      if (!data) return false
      
      this.setAccessToken(data.access_token)
      this.setRefreshToken(data.refresh_token)
      this.setUser(data.user)
      this.setExp(data.exp)
      return true
    },
    
    async tryRefresh(){
      if(!this.refreshToken) return false
      
      if(refreshPromise) {
        return refreshPromise
      }
      
      refreshPromise = (async () => {
        try{
          const data = await authService.refresh(this.refreshToken)
          if (!data) {
            this.logout()
            return false
          }
          
          this.setAccessToken(data.access_token)
          this.setExp(data.exp)
          
          if(data.refresh_token){
            this.setRefreshToken(data.refresh_token)
          }
          
          return true
        }catch(e){
          this.logout()
          return false
        }finally{
          refreshPromise = null 
        }
      })()
      
      return refreshPromise
    },
    
    logout(){
      this.clearAccessToken()
      this.clearUser()
      this.clearExp()
      this.clearRefreshToken()
    },
    
    getAuthHeader(){
      return accessToken.value ? { Authorization: `Bearer ${accessToken.value}` } : {}
    }
  }
})

