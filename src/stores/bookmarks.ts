import { defineStore } from 'pinia'

export const useBookmarksStore = defineStore('bookmarks', {
  state: ()=>({ bookmarks: new Set<number>() }),
  actions: {
    add(id:number){ this.bookmarks.add(id); this.persist() },
    remove(id:number){ this.bookmarks.delete(id); this.persist() },
    persist(){ localStorage.setItem('bookmarks', JSON.stringify(Array.from(this.bookmarks))) },
    hydrate(){
      const v = localStorage.getItem('bookmarks')
      if(v){ try{ this.bookmarks = new Set(JSON.parse(v)) }catch{} }
    }
  }
})
