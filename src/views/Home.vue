<template>
  <div>
    <div class="searchrow">
      <input class="search" type="text" placeholder="Search experiences…" v-model="q" @input="onQuery" />
    </div>

    <main class="grid">
      <article v-for="card in items" :key="card.id" class="card" @click="$router.push(`/experiences/${card.id}`)">
        <div class="imgwrap">
          <img :src="card.images[0]" :alt="card.title" />
          <button class="bookmark" @click.stop="toggle(card.id)" :aria-pressed="bookmarks.has(card.id)" aria-label="Bookmark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/>
            </svg>
          </button>
        </div>
        <div class="body">
          <h2 class="title" :title="card.title">{{ card.title }}</h2>
          <div class="meta">
            <span class="price">€{{ (card.price_cents/100).toFixed(0) }}</span>
            <span class="dot">•</span>
            <span class="dur">{{ Math.round(card.duration_min/60) }}h</span>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useExperiencesStore } from '../stores/experiences'
import { useBookmarksStore } from '../stores/bookmarks'

const store = useExperiencesStore()
const bookmarksStore = useBookmarksStore()
const q = ref('')
const items = ref<any[]>([])
const bookmarks = bookmarksStore.bookmarks

async function fetch(){
  items.value = await store.search(q.value)
}

let t:any
function onQuery(){
  clearTimeout(t)
  t = setTimeout(fetch, 300)
}

function toggle(id:number){
  if (bookmarks.has(id)) bookmarksStore.remove(id)
  else bookmarksStore.add(id)
}

onMounted(()=>{
  bookmarksStore.hydrate()
  fetch()
})
</script>
