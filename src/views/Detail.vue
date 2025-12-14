<template>
  <div style="margin-top:24px">
    <button class="search" style="cursor:pointer" @click="$router.back()">← Back</button>
    <div v-if="item" style="margin-top:24px;display:grid;grid-template-columns:1fr 1fr;gap:24px">
      <img :src="item.images[0]" :alt="item.title" style="width:100%;border-radius:12px;border:1px solid var(--border)"/>
      <div>
        <h2 class="title" style="font-size:24px;line-height:32px">{{ item.title }}</h2>
        <p style="color:var(--muted)">{{ item.short_description }}</p>
        <p><strong>€{{ (item.price_cents/100).toFixed(0) }}</strong> • {{ Math.round(item.duration_min/60) }}h</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useExperiencesStore } from '../stores/experiences'
const route = useRoute()
const store = useExperiencesStore()
const item = ref<any|null>(null)
onMounted(async ()=>{
  item.value = await store.detail(Number(route.params.id))
})
</script>
