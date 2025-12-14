import { defineStore } from 'pinia'
import { ExperiencesResponse, experiencesService, type Experience } from '../services/experiences.service'

export const useExperiencesStore = defineStore('experiences', {
  state: ()=>({ cache: new Map<number, Experience>() }),
  actions: {
    async search(q:string, page: number = 1, signal?: AbortSignal): Promise<ExperiencesResponse | null> {
      return await experiencesService.search(q, page, signal)
    },
    async detail(id:number): Promise<Experience | null> {
      if(this.cache.has(id)) {
        return this.cache.get(id)!
      }
      
      const result = await experiencesService.detail(id)
      if(result) {
        this.cache.set(id, result)
      }
      
      return result
    }
  }
})
