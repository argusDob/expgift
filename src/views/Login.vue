<template>
  <form @submit.prevent="onLogin" style="max-width:360px;margin:48px auto 0;display:grid;gap:12px">
    <input v-model="email" type="email" placeholder="Email" class="search" required />
    <input v-model="password" type="password" placeholder="Password" class="search" required />
    <button class="search" style="cursor:pointer;text-align:center">Sign in</button>
    <p v-if="error" style="color:#ff9ea6">{{ error }}</p>
  </form>
</template>
<script setup lang="ts">
import {  ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
const email = ref('user@example.com')
const password = ref('password')
const error = ref('')
const auth = useAuthStore()
const router = useRouter()

async function onLogin(){
  error.value = ''
  const ok = await auth.login(email.value, password.value)
  if(ok) router.push('/home')
  else error.value = 'Invalid credentials'
}
</script>
