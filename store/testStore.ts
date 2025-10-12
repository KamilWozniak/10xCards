import { defineStore } from 'pinia'

export const useTestStore = defineStore('test', () => {
  // State
  const count = ref<number>(0)

  // Actions
  function increment(): void {
    count.value++
  }

  return {
    count,
    increment,
  }
})
