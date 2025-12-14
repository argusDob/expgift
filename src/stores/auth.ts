import { defineStore } from 'pinia'
import axios from 'axios'

type User = { id:string; email:string; role:'user'|'admin' }
type LoginResp = { access_token:string; refresh_token:string; user:User; exp:number }

let accessToken = '' // in-memory

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User|null,
    refreshToken: (typeof localStorage !== 'undefined' ? localStorage.getItem('refresh_token') || '' : ''),
    exp: 0
  }),
  getters: {
    isAuthenticated: (s)=> !!accessToken && !!s.user && (s.exp*1000 > Date.now() + 1000*5),
    canTryRefresh: (s)=> !!s.refreshToken
  },
  actions: {
    async login(email:string, password:string){
      const { data } = await axios.post<LoginResp>('http://localhost:3001/auth/login', { email, password })
      accessToken = data.access_token
      this.refreshToken = data.refresh_token
      localStorage.setItem('refresh_token', this.refreshToken)
      this.user = data.user
      this.exp = data.exp
      return true
    },
    async tryRefresh(){
      if(!this.refreshToken) return false
      try{
        const { data } = await axios.post<{access_token:string; refresh_token?:string; exp:number}>('http://localhost:3001/auth/refresh', { refresh_token: this.refreshToken })
        accessToken = data.access_token
        if(data.refresh_token){
          this.refreshToken = data.refresh_token
          localStorage.setItem('refresh_token', this.refreshToken)
        }
        this.exp = data.exp
        return true
      }catch(e){
        this.logout()
        return false
      }
    },
    logout(){
      accessToken = ''
      this.user = null
      this.exp = 0
      this.refreshToken = ''
      localStorage.removeItem('refresh_token')
    },
    getAuthHeader(){
      return accessToken ? { Authorization: `Bearer ${accessToken}` } : {}
    }
  }
})

axios.interceptors.request.use(async (config)=>{
  const auth = useAuthStore()
  const delta = auth.exp*1000 - Date.now()
  if (auth.refreshToken && (delta < 30000)) {
    await auth.tryRefresh()
  }
  config.headers = { ...(config.headers||{}), ...(auth.getAuthHeader()) }
  return config
})
axios.interceptors.response.use(
  r=>r,
  async (error)=>{
    const auth = useAuthStore()
    if(error.response?.status === 401 && auth.refreshToken){
      const ok = await auth.tryRefresh()
      if(ok){
        const cfg = error.config
        cfg.headers = { ...(cfg.headers||{}), ...(auth.getAuthHeader()) }
        return axios(cfg)
      }
    }
    return Promise.reject(error)
  }
)
