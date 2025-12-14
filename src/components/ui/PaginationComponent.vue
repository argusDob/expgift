<template>
    <nav v-if="totalPages > 1" class="pagination" aria-label="Pagination navigation">
      <button 
        class="search" 
        :disabled="currentPage === 1" 
        :aria-disabled="currentPage === 1"
        :aria-label="`Go to page ${currentPage - 1}`"
        @click="handlePrevious"
        @keydown.enter.prevent="handlePrevious"
        @keydown.space.prevent="handlePrevious"
        style="cursor:pointer"
      >
        ← Previous
      </button>
      <span class="page-info" aria-live="polite" aria-atomic="true">
        Page <span aria-current="page">{{ currentPage }}</span> of {{ totalPages }}
      </span>
      <button 
        class="search" 
        :disabled="currentPage >= totalPages" 
        :aria-disabled="currentPage >= totalPages"
        :aria-label="`Go to page ${currentPage + 1}`"
        @click="handleNext"
        @keydown.enter.prevent="handleNext"
        @keydown.space.prevent="handleNext"
        style="cursor:pointer"
      >
        Next →
      </button>
    </nav>
  </template>
  
  <script setup lang="ts">
  type Props = {
    currentPage: number
    totalPages: number
  }
  
  type Emits = {
    (e: 'page-change', page: number): void
  }
  
  const props = defineProps<Props>()
  const emit = defineEmits<Emits>()
  
  const handlePrevious = () => {
    if (props.currentPage > 1) {
      emit('page-change', props.currentPage - 1)
    }
  }
  
  const handleNext = () => {
    if (props.currentPage < props.totalPages) {
      emit('page-change', props.currentPage + 1)
    }
  }
  </script>
  
  <style scoped>
  .pagination {
    margin-top: 32px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }
  
  .page-info {
    color: var(--muted);
    font-size: 14px;
  }
  
  .search:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  .search:focus {
    outline: 2px solid var(--brand);
    outline-offset: 2px;
  }
  
  .search:focus:not(:focus-visible) {
    outline: none;
  }
  </style>