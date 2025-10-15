import { defineStore } from 'pinia'

const useDictStore = defineStore('dict', {
  state: () => ({
    dict: []
  }),
  actions: {
    getDict(key) {
      return this.dict[key] || []
    },
    setDict(key, value) {
      if (key) {
        this.dict[key] = value
      }
    }
  }
})

export default useDictStore
