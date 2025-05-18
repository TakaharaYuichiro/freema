import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSearchStore = defineStore('search', () => {
  const keyword = ref('')
  const triggerSearch = ref(0)
  const doSearch = () => {
    triggerSearch.value++
  }
  return { keyword, triggerSearch, doSearch }  
})
