import { defineStore } from 'pinia'

const useDictStore = defineStore('dict', {
  state: () => ({
    dict: []
  }),
  actions: {
    getDict(key) {
      if (!key) {
        return []
      }
      return this.dict?.filter((item) => item.key === key)
    },
    setDict(key, value) {
      if (key) {
        this.dict.push({
          key,
          value
        })
      }
    }
  }
})

export default useDictStore
