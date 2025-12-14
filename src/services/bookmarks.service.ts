export class BookmarksService {
    private readonly STORAGE_KEY = 'bookmarks'
  
    add(id: number, bookmarks: Set<number>): Set<number> {
      const updated = new Set(bookmarks)
      updated.add(id)
      this.persist(updated)
      return updated
    }
  
    remove(id: number, bookmarks: Set<number>): Set<number> {
      const updated = new Set(bookmarks)
      updated.delete(id)
      this.persist(updated)
      return updated
    }
  
    persist(bookmarks: Set<number>): void {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(Array.from(bookmarks)))
    }
  
    hydrate(): Set<number> {
      const v = localStorage.getItem(this.STORAGE_KEY)
      if (!v) return new Set<number>()
      
      try {
        return new Set(JSON.parse(v))
      } catch {
        return new Set<number>()
      }
    }
  }
  
  export const bookmarksService = new BookmarksService()