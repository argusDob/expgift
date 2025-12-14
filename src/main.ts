import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './router'
import App from './App.vue'
import { setupAxiosInterceptors } from './services/axios-interceptors'
import './styles.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)

setupAxiosInterceptors() // Setup interceptors

app.mount('#app')
