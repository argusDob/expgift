<template>
  <div>
    <div class="searchrow">
      <input class="search" type="text" placeholder="Search experiences…" v-model="q" @input="onQuery" />
    </div>

    <main class="grid">
      <article v-for="card in paginationItems" :key="card.id" class="card" @click="$router.push(`/experiences/${card.id}`)">
        <div class="imgwrap">
          <img :src="card.images[0]" :alt="card.title" loading="lazy" />
          <button class="bookmark" @click.stop="toggle(card.id)" :aria-pressed="bookmarks.has(card.id)" aria-label="Bookmark">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M6 2h12a2 2 0 0 1 2 2v18l-8-4-8 4V4a2 2 0 0 1 2-2z"/>
            </svg>
          </button>
        </div>
        <div class="body">
          <h2 class="title" :title="card.title">{{ card.title }}</h2>
          <div class="meta">
            <span class="price">{{ formatPrice(card.price_cents) }}</span>
            <span class="dot">•</span>
            <span class="dur">{{ formatDuration(card.duration_min) }}</span>
          </div>
        </div>
      </article>
    </main>
    <PaginationComponent 
      :current-page="paginationCurrentPage" 
      :total-pages="paginationTotalPages" 
      @page-change="handlePageChange"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useExperiencesStore } from '../stores/experiences'
import { useBookmarksStore } from '../stores/bookmarks'
import { formatPrice, formatDuration } from '../utils/formatters'
import PaginationComponent from '../components/ui/PaginationComponent.vue'
import { usePagination } from '../composables/usePagination'
import { useDebouncedSearch } from '../composables/useDebouncedSearch'
import type { Experience } from '../services/experiences.service'

const store = useExperiencesStore()
const bookmarksStore = useBookmarksStore()
const q = ref('')
const bookmarks = bookmarksStore.bookmarks

// Use pagination composable with onPageChange callback
const {
  items: paginationItems,
  currentPage: paginationCurrentPage,
  totalPages: paginationTotalPages,
  setPaginationData,
  resetPage,
  goToPage: paginationGoToPage
} = usePagination<Experience>({
  onPageChange: fetch
})

async function fetch(signal?: AbortSignal) {
  const result = await store.search(q.value, paginationCurrentPage.value, signal)
  
  if (result && !signal?.aborted) {
    setPaginationData(result)
  } else if (!signal?.aborted) {
    setPaginationData({ data: [], page: 1, pageSize: 6, total: 0 })
  }
}

const { trigger: triggerSearch } = useDebouncedSearch(fetch)

function onQuery() {
  resetPage()
  triggerSearch()
}

function toggle(id: number) {
  if (bookmarks.has(id)) bookmarksStore.remove(id)
  else bookmarksStore.add(id)
}

function handlePageChange(page: number) {
  paginationGoToPage(page) 
}

onMounted(() => {
  bookmarksStore.hydrate()
  fetch()
})
</script>
